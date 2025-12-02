/**
 * Inngest Function: Reset Monthly Credits
 * 
 * Resets credits to tier base amount on subscription renewal
 */

import { inngest } from '../client';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { getTierLimits } from '@/lib/tiers/config';
import type { TierName } from '@/lib/tiers/types';

export const resetMonthlyCredits = inngest.createFunction(
  {
    id: 'reset-monthly-credits',
    name: 'Reset Monthly Credits',
  },
  { event: 'credits/reset.monthly' },
  async ({ event, step }) => {
    const { userId } = event.data;

    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        inngestEventId: event.id,
        functionName: 'reset-monthly-credits',
        status: 'running',
        payload: { userId },
      });
    });

    try {
      // Get user and calculate new credits
      const result = await step.run('reset-credits', async () => {
        const userData = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (!userData) {
          throw new Error('User not found');
        }

        const tier = (userData.tier || 'free') as TierName;
        const limits = getTierLimits(tier);

        // Calculate new credits (base + carryover if applicable)
        const currentCredits = userData.credits || 0;
        const carryover = Math.min(currentCredits, limits.maxCreditCarryover);
        const newCredits = limits.monthlyCredits + carryover;

        // Update user
        const [updated] = await db
          .update(user)
          .set({
            credits: newCredits,
            lastCreditReset: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId))
          .returning();

        return {
          previousCredits: currentCredits,
          carryover,
          baseCredits: limits.monthlyCredits,
          newCredits,
          tier,
        };
      });

      // Update job log
      await updateJobStatus(jobLog.id, 'completed', {
        result: {
          status: 'reset',
          ...result,
        },
      });

      return {
        status: 'reset',
        ...result,
      };
    } catch (error: any) {
      await updateJobStatus(jobLog.id, 'failed', {
        errorMessage: error.message,
      });

      throw error;
    }
  }
);
