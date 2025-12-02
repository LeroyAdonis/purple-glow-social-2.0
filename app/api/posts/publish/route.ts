import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PostService } from '@/lib/posting/post-service';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAvailableCredits } from '@/lib/db/credit-reservations';
import { hasEnoughCredits, calculatePostCredits, canPost } from '@/lib/tiers/validation';
import { getTierLimits } from '@/lib/tiers/config';
import { deductCredits } from '@/lib/db/users';
import { incrementPosts, getDailyUsage } from '@/lib/db/daily-usage';
import type { TierName } from '@/lib/tiers/types';
import type { PlatformBreakdown } from '@/lib/tiers/types';

/**
 * API endpoint to publish a post immediately
 * POST /api/posts/publish
 * 
 * Credits are deducted per platform (1 credit = 1 platform post).
 * Multi-platform posts cost multiple credits.
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    // Support both single platform and array of platforms
    const { platforms: platformsInput, platform: singlePlatform, content, imageUrl, link } = body;
    
    // Normalize to array
    const platforms: string[] = platformsInput || (singlePlatform ? [singlePlatform] : []);

    // Validate input
    if (platforms.length === 0 || !content) {
      return NextResponse.json(
        { error: 'At least one platform and content are required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin'];
    for (const p of platforms) {
      if (!validPlatforms.includes(p)) {
        return NextResponse.json(
          { error: `Invalid platform: ${p}` },
          { status: 400 }
        );
      }
    }

    // Special validation for Instagram
    if (platforms.includes('instagram') && !imageUrl) {
      return NextResponse.json(
        { error: 'Instagram posts require an image' },
        { status: 400 }
      );
    }

    // Get user info
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userTier = (userRecord.tier || 'free') as TierName;
    const tierLimits = getTierLimits(userTier);

    // Check daily post limits for each platform
    const dailyUsage = await getDailyUsage(session.user.id);
    const platformBreakdown = (dailyUsage?.platformBreakdown || {}) as PlatformBreakdown;

    for (const p of platforms) {
      const postCheck = canPost(userTier, p, platformBreakdown);
      if (!postCheck.allowed) {
        return NextResponse.json(
          { 
            error: postCheck.message,
            platform: p,
            limit: postCheck.limit,
            current: postCheck.current,
          },
          { status: 429 } // Too Many Requests
        );
      }
    }

    // Calculate credit cost (1 credit per platform)
    const creditCost = calculatePostCredits(platforms);
    
    // Check if user has enough available credits
    const availableCredits = await getAvailableCredits(session.user.id);
    const creditCheck = hasEnoughCredits(userRecord.credits, userRecord.credits - availableCredits, creditCost);
    
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { 
          error: creditCheck.message,
          required: creditCost,
          available: availableCredits,
        },
        { status: 402 } // Payment Required
      );
    }

    // Post to all platforms
    const postService = new PostService();
    const results = await postService.postToMultiplePlatforms(
      session.user.id,
      platforms as Array<'facebook' | 'instagram' | 'twitter'>,
      {
        content,
        imageUrl,
        link,
      }
    );

    // Count successful posts and deduct credits accordingly
    const successfulPosts = results.filter(r => r.success);
    const failedPosts = results.filter(r => !r.success);

    if (successfulPosts.length > 0) {
      // Deduct credits only for successful posts
      await deductCredits(session.user.id, successfulPosts.length);

      // Track daily usage for each successful platform
      for (const result of successfulPosts) {
        await incrementPosts(session.user.id, result.platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin');
      }
    }

    // Get updated credits
    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    // Return appropriate response
    if (failedPosts.length === 0) {
      // All successful
      return NextResponse.json({
        success: true,
        results,
        creditsDeducted: successfulPosts.length,
        creditsRemaining: updatedUser?.credits || 0,
      });
    } else if (successfulPosts.length === 0) {
      // All failed
      return NextResponse.json(
        { 
          error: 'Failed to publish to all platforms',
          results,
          creditsDeducted: 0,
          creditsRemaining: updatedUser?.credits || 0,
        },
        { status: 500 }
      );
    } else {
      // Partial success
      return NextResponse.json({
        success: true,
        partial: true,
        message: `Published to ${successfulPosts.length} of ${platforms.length} platforms`,
        results,
        creditsDeducted: successfulPosts.length,
        creditsRemaining: updatedUser?.credits || 0,
      });
    }
  } catch (error: any) {
    console.error('Publish post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    );
  }
}
