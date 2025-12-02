/**
 * Inngest Function: Check Low Credits
 * 
 * Notifies users when credits fall below 20% of monthly allocation
 */

import { inngest } from '../client';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { notifyLowCredits, hasActiveNotification } from '@/lib/db/notifications';
import { getTierLimits } from '@/lib/tiers/config';
import type { TierName } from '@/lib/tiers/types';

const LOW_CREDIT_THRESHOLD = 0.20; // 20%

export const checkLowCredits = inngest.createFunction(
  {
    id: 'check-low-credits',
    name: 'Check Low Credits',
  },
  { event: 'credits/check.low' },
  async ({ event, step }) => {
    const { userId, credits, monthlyAllocation } = event.data;

    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        inngestEventId: event.id,
        functionName: 'check-low-credits',
        status: 'running',
        payload: { userId, credits, monthlyAllocation },
      });
    });

    try {
      const result = await step.run('check-and-notify', async () => {
        // Check if we already sent a notification recently
        const alreadyNotified = await hasActiveNotification(userId, 'low_credits');
        
        if (alreadyNotified) {
          return { notified: false, reason: 'already_notified' };
        }

        // Get user data to verify
        const userData = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (!userData) {
          throw new Error('User not found');
        }

        const tier = (userData.tier || 'free') as TierName;
        const limits = getTierLimits(tier);
        const allocation = monthlyAllocation || limits.monthlyCredits;
        const currentCredits = credits ?? userData.credits;

        // Calculate percentage
        const percentage = (currentCredits / allocation) * 100;

        if (percentage <= LOW_CREDIT_THRESHOLD * 100) {
          await notifyLowCredits(userId, currentCredits, percentage);
          return {
            notified: true,
            credits: currentCredits,
            percentage,
            threshold: LOW_CREDIT_THRESHOLD * 100,
          };
        }

        return {
          notified: false,
          reason: 'above_threshold',
          credits: currentCredits,
          percentage,
        };
      });

      // Update job log
      await updateJobStatus(jobLog.id, 'completed', {
        result,
      });

      return result;
    } catch (error: any) {
      await updateJobStatus(jobLog.id, 'failed', {
        errorMessage: error.message,
      });

      throw error;
    }
  }
);

/**
 * Helper function to trigger low credit check after credit deduction
 */
export async function triggerLowCreditCheck(
  userId: string,
  newCredits: number,
  monthlyAllocation: number
): Promise<void> {
  const percentage = (newCredits / monthlyAllocation) * 100;
  
  // Only send event if below threshold
  if (percentage <= LOW_CREDIT_THRESHOLD * 100) {
    await inngest.send({
      name: 'credits/check.low',
      data: {
        userId,
        credits: newCredits,
        monthlyAllocation,
      },
    });
  }
}
