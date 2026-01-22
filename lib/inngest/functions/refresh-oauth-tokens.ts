/**
 * Inngest Function: Refresh Expiring OAuth Tokens
 * 
 * Proactively refreshes OAuth tokens for all connected social media accounts
 * before they expire. Prevents users from losing connections.
 * 
 * Schedule: Every 6 hours
 * Logic: Refreshes tokens expiring within 24 hours
 * Retries: 3 attempts with exponential backoff
 * Platforms: Facebook, Instagram, Twitter, LinkedIn
 */

import { inngest } from '../client';
import { refreshExpiringTokens } from '@/lib/oauth/token-refresh-service';
import { logger } from '@/lib/logger';

export const refreshOAuthTokens = inngest.createFunction(
  {
    id: 'refresh-oauth-tokens',
    name: 'Refresh Expiring OAuth Tokens',
    retries: 3,
  },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ event, step }) => {
    const result = await step.run('refresh-all-tokens', async () => {
      try {
        logger.cron.info('Starting OAuth token refresh cycle');

        // Call the existing token refresh service
        const results = await refreshExpiringTokens();

        // Calculate summary statistics
        const totalChecked = results.length;
        const refreshed = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        // Group by platform
        const platformBreakdown = results.reduce((acc, result) => {
          if (!acc[result.platform]) {
            acc[result.platform] = { success: 0, failed: 0 };
          }
          if (result.success) {
            acc[result.platform].success++;
          } else {
            acc[result.platform].failed++;
          }
          return acc;
        }, {} as Record<string, { success: number; failed: number }>);

        logger.cron.info('OAuth token refresh completed', {
          totalChecked,
          refreshed,
          failed,
          platforms: platformBreakdown,
        });

        return {
          success: true,
          totalChecked,
          refreshed,
          failed,
          platformBreakdown,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.cron.exception(error as Error, {
          function: 'refresh-oauth-tokens',
        });
        throw error;
      }
    });

    return result;
  }
);
