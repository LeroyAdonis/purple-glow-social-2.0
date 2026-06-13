import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PostService } from '@/lib/posting/post-service';
import { db } from '@/drizzle/db';
import { posts, user } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { getAvailableCredits } from '@/lib/db/credit-reservations';
import { hasEnoughCredits, calculatePostCredits, canPost } from '@/lib/tiers/validation';
import { getTierLimits } from '@/lib/tiers/config';
import { deductCredits, deductCreditsAtomic } from '@/lib/db/users';
import { incrementPosts, getDailyUsage } from '@/lib/db/daily-usage';
import type { TierName } from '@/lib/tiers/types';
import type { PlatformBreakdown } from '@/lib/tiers/types';
import { rateLimiters } from '@/lib/security/rate-limit';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';
import { z } from 'zod';

// Supports both postId-based publishing (from drafts) and direct publishing
const publishPostSchema = z.union([
  // Flow A: publish by postId (from draft manager or post-creation-modal)
  z.object({
    postId: z.string().min(1),
  }),
  // Flow B: publish directly with content + platform
  z.object({
    platforms: z.array(z.enum(['facebook', 'instagram', 'twitter', 'linkedin'])).optional(),
    platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']).optional(),
    content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
    imageUrl: z.string().url().optional(),
    link: z.string().url().optional(),
  }).refine(
    (data) => (data.platforms && data.platforms.length > 0) || data.platform,
    { message: 'At least one platform is required' }
  ),
]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiters.contentGen.limit(`post-publish:${session.user.id}`);
    if (!rateLimitResult.success) {
      const resetTime = Math.ceil(((rateLimitResult as any).reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: `Too many publish requests. Try again in ${resetTime} seconds.`, retryAfter: resetTime },
        { status: 429 }
      );
    }

    const body = await parseRequestBody(request);
    if (!body) return invalidJsonResponse();

    const validationResult = publishPostSchema.safeParse(body);
    if (!validationResult.success) {
      logger.api.warn('Invalid publish request', { userId: session.user.id, errors: validationResult.error.format() });
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.format() }, { status: 400 });
    }

    // ─── FLOW A: postId supplied — look up from DB ───────────────────────────
    let content: string;
    let platforms: string[];
    let imageUrl: string | undefined;
    let link: string | undefined;
    let existingPostId: string | undefined;

    if ('postId' in validationResult.data) {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, validationResult.data.postId),
      });

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      if (post.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      content = post.content;
      platforms = [post.platform];
      imageUrl = post.imageUrl ?? undefined;
      existingPostId = post.id;
    } else {
      // ─── FLOW B: direct publish ──────────────────────────────────────────────
      content = validationResult.data.content;
      platforms = validationResult.data.platforms ?? (validationResult.data.platform ? [validationResult.data.platform] : []);
      imageUrl = validationResult.data.imageUrl;
      link = validationResult.data.link;
    }

    // Instagram requires image
    if (platforms.includes('instagram') && !imageUrl) {
      return NextResponse.json({ error: 'Instagram posts require an image' }, { status: 400 });
    }

    // Get user
    const userRecord = await db.query.user.findFirst({ where: eq(user.id, session.user.id) });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userTier = (userRecord.tier || 'free') as TierName;
    const tierLimits = getTierLimits(userTier);

    // Check daily post limits
    const dailyUsage = await getDailyUsage(session.user.id);
    const platformBreakdown = (dailyUsage?.platformBreakdown || {}) as PlatformBreakdown;

    for (const p of platforms) {
      const postCheck = canPost(userTier, p, platformBreakdown);
      if (!postCheck.allowed) {
        return NextResponse.json(
          { error: postCheck.message || 'Post limit reached', platform: p, limit: postCheck.limit, current: postCheck.current },
          { status: 429 }
        );
      }
    }

    // Credits check
    const creditCost = calculatePostCredits(platforms);
    const availableCredits = await getAvailableCredits(session.user.id);
    const creditCheck = hasEnoughCredits(userRecord.credits, userRecord.credits - availableCredits, creditCost);

    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.message || 'Insufficient credits', required: creditCost, available: availableCredits },
        { status: 402 }
      );
    }

    const deductionResult = await deductCreditsAtomic(session.user.id, creditCost);
    if (!deductionResult.success) {
      return NextResponse.json(
        { error: 'Insufficient credits', message: `You need ${creditCost} credits but only have ${deductionResult.newBalance}`, creditsNeeded: creditCost, currentBalance: deductionResult.newBalance },
        { status: 402 }
      );
    }

    // Post to platforms
    const postService = new PostService();
    let results;
    try {
      results = await postService.postToMultiplePlatforms(
        session.user.id,
        platforms as Array<'facebook' | 'instagram' | 'twitter' | 'linkedin'>,
        { content, imageUrl, link }
      );
    } catch (postError: any) {
      // Refund credits on total failure
      await db.update(user).set({ credits: sql`${user.credits} + ${creditCost}`, updatedAt: new Date() }).where(eq(user.id, session.user.id));
      throw postError;
    }

    const successfulPosts = results.filter(r => r.success);
    const failedPosts = results.filter(r => !r.success);

    // Partial refund for failed platforms
    if (failedPosts.length > 0) {
      await db.update(user).set({ credits: sql`${user.credits} + ${failedPosts.length}`, updatedAt: new Date() }).where(eq(user.id, session.user.id));
    }

    // Update existing post record if we came from postId flow
    if (existingPostId) {
      const firstSuccess = successfulPosts[0];
      if (firstSuccess) {
        await db.update(posts).set({
          status: 'posted',
          platformPostId: firstSuccess.postId,
          platformPostUrl: firstSuccess.postUrl,
          publishedAt: new Date(),
          errorMessage: null,
          updatedAt: new Date(),
        }).where(eq(posts.id, existingPostId));
      } else {
        await db.update(posts).set({
          status: 'failed',
          errorMessage: failedPosts[0]?.error || 'Publishing failed',
          updatedAt: new Date(),
        }).where(eq(posts.id, existingPostId));
      }
    }

    // Track daily usage
    for (const result of successfulPosts) {
      await incrementPosts(session.user.id, result.platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin');
    }

    const updatedUser = await db.query.user.findFirst({ where: eq(user.id, session.user.id) });

    if (failedPosts.length === 0) {
      return NextResponse.json({ success: true, results, creditsDeducted: successfulPosts.length, creditsRemaining: updatedUser?.credits || 0 });
    } else if (successfulPosts.length === 0) {
      return NextResponse.json({ error: 'Failed to publish to all platforms', results, creditsDeducted: 0, creditsRemaining: updatedUser?.credits || 0 }, { status: 500 });
    } else {
      return NextResponse.json({ success: true, partial: true, message: `Published to ${successfulPosts.length} of ${platforms.length} platforms`, results, creditsDeducted: successfulPosts.length, creditsRemaining: updatedUser?.credits || 0 });
    }
  } catch (error: any) {
    logger.posting.error('Publish post failed', { error });
    return NextResponse.json({ error: error.message || 'Failed to publish post' }, { status: 500 });
  }
}
