/**
 * Inngest Function: Process Scheduled Post
 * 
 * Handles publishing a single scheduled post with retry logic
 */

import { inngest } from '../client';
import { db } from '@/drizzle/db';
import { posts, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { PostService } from '@/lib/posting/post-service';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { consumeReservationByPostId, releaseReservationByPostId, getReservationByPostId } from '@/lib/db/credit-reservations';
import { notifyPostFailed, notifyPostSkipped } from '@/lib/db/notifications';
import { deductCredits } from '@/lib/db/users';
import { incrementPosts } from '@/lib/db/daily-usage';

const MAX_RETRIES = 3;

export const processScheduledPost = inngest.createFunction(
  {
    id: 'process-scheduled-post',
    name: 'Process Scheduled Post',
    retries: MAX_RETRIES,
  },
  { event: 'post/scheduled.process' },
  async ({ event, step }) => {
    const { postId, userId, platform } = event.data;

    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        inngestEventId: event.id,
        functionName: 'process-scheduled-post',
        status: 'running',
        payload: { postId, userId, platform },
      });
    });

    try {
      // Step 1: Validate post exists and is scheduled
      const postRecord = await step.run('validate-post', async () => {
        const record = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!record) {
          throw new Error('Post not found');
        }

        if (record.status !== 'scheduled') {
          throw new Error(`Post status is ${record.status}, not scheduled`);
        }

        // Return serializable data
        return {
          id: record.id,
          scheduledDate: record.scheduledDate?.toISOString() || null,
        };
      });

      // Step 2: Check if user has credits (via reservation or available)
      const creditCheck = await step.run('check-credits', async () => {
        const reservation = await getReservationByPostId(postId);
        
        if (reservation && reservation.status === 'pending') {
          return { hasCredits: true, source: 'reservation', reservationId: reservation.id };
        }

        // Fallback: check if user has credits (shouldn't happen for scheduled posts)
        const userData = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (userData && userData.credits >= 1) {
          return { hasCredits: true, source: 'direct', reservationId: null };
        }

        return { hasCredits: false, source: null, reservationId: null };
      });

      // Step 3: Handle no credits
      if (!creditCheck.hasCredits) {
        await step.run('handle-no-credits', async () => {
          // Update post status to failed
          await db
            .update(posts)
            .set({
              status: 'failed',
              errorMessage: 'Insufficient credits - post skipped',
              updatedAt: new Date(),
            })
            .where(eq(posts.id, postId));

          // Notify user
          const scheduledDate = postRecord.scheduledDate ? new Date(postRecord.scheduledDate) : new Date();
          await notifyPostSkipped(userId, postId, platform, scheduledDate);

          // Update job log
          await updateJobStatus(jobLog.id, 'completed', {
            result: { status: 'skipped', reason: 'no_credits' },
          });
        });

        return { status: 'skipped', reason: 'no_credits' };
      }

      // Step 4: Publish the post
      const postResult = await step.run('publish-post', async () => {
        const postService = new PostService();
        const results = await postService.publishScheduledPost(postId);
        return results[0]; // Single platform post
      });

      // Step 5: Handle result
      if (postResult.success) {
        await step.run('handle-success', async () => {
          // Consume credit reservation
          if (creditCheck.source === 'reservation') {
            await consumeReservationByPostId(postId);
          } else {
            // Direct deduction
            await deductCredits(userId, 1);
          }

          // Track daily usage
          await incrementPosts(userId, platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin');

          // Update job log
          await updateJobStatus(jobLog.id, 'completed', {
            result: {
              status: 'posted',
              platformPostId: postResult.postId,
              platformPostUrl: postResult.postUrl,
            },
          });
        });

        return {
          status: 'posted',
          platformPostId: postResult.postId,
          platformPostUrl: postResult.postUrl,
        };
      } else {
        // Posting failed - throw to trigger retry
        throw new Error(postResult.error || 'Unknown posting error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if we've exhausted retries (Inngest handles retry count internally)
      const isLastRetry = false; // Let Inngest handle this

      if (isLastRetry) {
        // Final failure - release credits and notify
        await step.run('handle-final-failure', async () => {
          await releaseReservationByPostId(postId);

          await db
            .update(posts)
            .set({
              status: 'failed',
              errorMessage: `Failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
              updatedAt: new Date(),
            })
            .where(eq(posts.id, postId));

          await notifyPostFailed(userId, postId, platform, errorMessage);
          await updateJobStatus(jobLog.id, 'failed', { errorMessage });
        });

        return { status: 'failed', error: errorMessage };
      }

      // Update job log with retry info
      await updateJobStatus(jobLog.id, 'pending', {
        errorMessage,
        incrementRetry: true,
      });

      // Throw to trigger retry
      throw error;
    }
  }
);
