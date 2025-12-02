/**
 * Inngest Function: Check Credit Expiry
 * 
 * Daily check for users with credits expiring in 3 days
 */

import { inngest } from '../client';
import { db } from '@/drizzle/db';
import { user, subscriptions } from '@/drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { notifyCreditsExpiring, hasActiveNotification } from '@/lib/db/notifications';

export const checkCreditExpiry = inngest.createFunction(
  {
    id: 'check-credit-expiry',
    name: 'Check Credit Expiry',
  },
  // Run daily at 9:00 AM SAST (7:00 AM UTC)
  { cron: '0 7 * * *' },
  async ({ step }) => {
    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        functionName: 'check-credit-expiry',
        status: 'running',
        payload: {},
      });
    });

    try {
      // Find users with subscriptions ending in 3 days
      const usersToNotify = await step.run('find-expiring-users', async () => {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

        // Find subscriptions ending between 3 and 4 days from now
        const expiringSubscriptions = await db
          .select({
            userId: subscriptions.userId,
            endDate: subscriptions.currentPeriodEnd,
          })
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.status, 'active'),
              gte(subscriptions.currentPeriodEnd, threeDaysFromNow),
              lte(subscriptions.currentPeriodEnd, fourDaysFromNow)
            )
          );

        return expiringSubscriptions;
      });

      // Send notifications
      const notifications = await step.run('send-notifications', async () => {
        const sent: string[] = [];

        for (const sub of usersToNotify) {
          // Check if we already sent a notification recently
          const alreadyNotified = await hasActiveNotification(sub.userId, 'credits_expiring');
          
          if (alreadyNotified) {
            continue;
          }

          // Get user's current credits
          const userData = await db.query.user.findFirst({
            where: eq(user.id, sub.userId),
          });

          if (userData && userData.credits > 0) {
            await notifyCreditsExpiring(sub.userId, userData.credits, 3);
            sent.push(sub.userId);
          }
        }

        return sent;
      });

      // Update job log
      await updateJobStatus(jobLog.id, 'completed', {
        result: {
          usersChecked: usersToNotify.length,
          notificationsSent: notifications.length,
        },
      });

      return {
        status: 'completed',
        usersChecked: usersToNotify.length,
        notificationsSent: notifications.length,
      };
    } catch (error: any) {
      await updateJobStatus(jobLog.id, 'failed', {
        errorMessage: error.message,
      });

      throw error;
    }
  }
);
