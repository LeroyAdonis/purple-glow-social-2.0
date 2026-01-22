/**
 * Inngest Function: Cleanup Expired PKCE Verifiers
 * 
 * Removes expired OAuth PKCE verifiers to prevent database bloat.
 * PKCE verifiers are single-use security tokens for OAuth flows.
 * 
 * Schedule: Every hour at :00
 * Retention: Delete verifiers older than 24 hours
 * Retries: 2 attempts with exponential backoff
 */

import { inngest } from '../client';
import { db } from '@/drizzle/db';
import { pkceVerifiers } from '@/drizzle/schema';
import { lt } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export const cleanupPkceVerifiers = inngest.createFunction(
  {
    id: 'cleanup-pkce-verifiers',
    name: 'Cleanup Expired PKCE Verifiers',
    retries: 2,
  },
  { cron: '0 * * * *' }, // Every hour at :00
  async ({ event, step }) => {
    const result = await step.run('delete-expired-verifiers', async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      try {
        logger.cron.info('Starting PKCE verifier cleanup', {
          cutoffDate: oneDayAgo.toISOString(),
        });

        // Delete verifiers older than 24 hours
        const deleted = await db
          .delete(pkceVerifiers)
          .where(lt(pkceVerifiers.createdAt, oneDayAgo))
          .returning();

        logger.cron.info('PKCE verifiers cleaned up', {
          count: deleted.length,
          olderThan: oneDayAgo.toISOString(),
        });

        return {
          success: true,
          deletedCount: deleted.length,
          cutoffDate: oneDayAgo.toISOString(),
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.cron.exception(error as Error, {
          function: 'cleanup-pkce-verifiers',
        });
        throw error;
      }
    });

    return result;
  }
);
