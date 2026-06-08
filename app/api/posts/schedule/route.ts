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
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

const scheduleSchema = z.object({
  postId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
});

type ValidationSuccess = {
  success: true;
  data: {
    userRecord: typeof user.$inferSelect;
    post: NonNullable<Awaited<ReturnType<typeof getPostById>>>;
    creditCost: number;
    availableCredits: number;
    tierLimits: ReturnType<typeof getTierLimits>;
    currentQueueSize: number;
  };
};

type ValidationFailure = {
  success: false;
  error: string;
  status: number;
  details?: any;
};

type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validate scheduling request
 */
async function validateScheduleRequest(
  userId: string,
  postId: string,
  scheduledDate: Date
): Promise<ValidationResult> {
  const post = await getPostById(postId);
  if (!post) {
    return { success: false, error: 'Post not found', status: 404 };
  }

  if (post.userId !== userId) {
    return { success: false, error: 'Unauthorized', status: 403 };
  }

  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userRecord) {
    return { success: false, error: 'User not found', status: 404 };
  }

  const userTier = (userRecord.tier || 'free') as TierName;
  const tierLimits = getTierLimits(userTier);

  const currentQueueSize = await countScheduledPosts(userId);
  const scheduleCheck = canSchedule(userTier, currentQueueSize, scheduledDate);

  if (!scheduleCheck.allowed) {
    return {
      success: false,
      error: scheduleCheck.message || 'Schedule limit reached',
      status: 429,
      details: {
        limit: scheduleCheck.limit,
        current: scheduleCheck.current,
      },
    };
  }

  const creditCost = 1;
  const availableCredits = await getAvailableCredits(userId);
  const creditCheck = hasEnoughCredits(userRecord.credits, userRecord.credits - availableCredits, creditCost);

  if (!creditCheck.allowed) {
    return {
      success: false,
      error: creditCheck.message || 'Insufficient credits',
      status: 402,
      details: {
        required: creditCost,
        available: availableCredits,
      },
    };
  }

  return {
    success: true,
    data: {
      userRecord,
      post,
      creditCost,
      availableCredits,
      tierLimits,
      currentQueueSize,
    },
  };
}

/**
 * POST /api/posts/schedule
 * Schedule a post for publishing
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

    const body = await parseRequestBody<{
      postId: string;
      scheduledDate: string;
    }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const validated = scheduleSchema.parse(body);
    const scheduledDate = new Date(validated.scheduledDate);

    // 1. Validate Request
    const validation = await validateScheduleRequest(session.user.id, validated.postId, scheduledDate);

    if (!validation.success) {
      const failure = validation as ValidationFailure;
      return NextResponse.json(
        {
          error: failure.error,
          ...failure.details,
        },
        { status: failure.status }
      );
    }

    const { post, creditCost, tierLimits, currentQueueSize } = validation.data;

    // 2. Perform DB updates in transaction
    const result = await db.transaction(async (tx) => {
      const reservation = await reserveCredits(
        session.user.id,
        validated.postId,
        creditCost,
        scheduledDate,
        tx
      );

      const updatedPost = await updatePost(
        validated.postId,
        {
          status: 'scheduled',
          scheduledDate,
        },
        tx
      );

      return { reservation, updatedPost };
    });

    const updatedAvailable = await getAvailableCredits(session.user.id);

    return NextResponse.json({
      success: true,
      post: result.updatedPost,
      message: 'Post scheduled successfully',
      creditsReserved: creditCost,
      creditsAvailable: updatedAvailable,
      reservationId: result.reservation.id,
      queuePosition: currentQueueSize + 1,
      queueLimit: tierLimits.queueSize,
    });

  } catch (error: any) {
    logger.posting.error('Schedule post failed', { error });

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
