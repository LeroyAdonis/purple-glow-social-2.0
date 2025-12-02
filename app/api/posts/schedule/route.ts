import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updatePost, getPostById, countScheduledPosts } from '@/lib/db/posts';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { reserveCredits, getAvailableCredits } from '@/lib/db/credit-reservations';
import { hasEnoughCredits, canSchedule } from '@/lib/tiers/validation';
import { getTierLimits } from '@/lib/tiers/config';
import type { TierName } from '@/lib/tiers/types';

const scheduleSchema = z.object({
  postId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
});

/**
 * POST /api/posts/schedule
 * Schedule a post for publishing
 * 
 * Credits are reserved when scheduling and consumed on successful publish.
 * 1 credit per platform is reserved.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = scheduleSchema.parse(body);

    // Verify post belongs to user
    const post = await getPostById(validated.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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
    const scheduledDate = new Date(validated.scheduledDate);

    // Check queue size and advance scheduling limits
    const currentQueueSize = await countScheduledPosts(session.user.id);
    const scheduleCheck = canSchedule(userTier, currentQueueSize, scheduledDate);
    
    if (!scheduleCheck.allowed) {
      return NextResponse.json(
        { 
          error: scheduleCheck.message,
          limit: scheduleCheck.limit,
          current: scheduleCheck.current,
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Calculate credit cost (1 credit per post/platform)
    const creditCost = 1; // Single platform post

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

    // Reserve credits for this scheduled post
    const reservation = await reserveCredits(
      session.user.id,
      validated.postId,
      creditCost,
      scheduledDate // Reservation expires when post is scheduled
    );

    // Update post with scheduled date and status
    const updatedPost = await updatePost(validated.postId, {
      status: 'scheduled',
      scheduledDate,
    });

    // Get updated available credits
    const updatedAvailable = await getAvailableCredits(session.user.id);

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post scheduled successfully',
      creditsReserved: creditCost,
      creditsAvailable: updatedAvailable,
      reservationId: reservation.id,
      queuePosition: currentQueueSize + 1,
      queueLimit: tierLimits.queueSize,
    });
  } catch (error: any) {
    console.error('Schedule post error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    );
  }
}
