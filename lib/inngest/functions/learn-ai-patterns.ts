/**
 * Inngest Function: Learn from User Content Patterns
 * 
 * Analyzes high-performing posts to improve AI content generation.
 * Uses engagement data and user feedback to refine prompt patterns.
 * 
 * Schedule: Daily at 3am SAST (1am UTC)
 * Logic: 
 *   1. Analyze system-wide patterns (opening styles, CTAs, SA expressions)
 *   2. Update learning profiles for active users
 *   3. Prune ineffective patterns
 * Retries: 1 attempt (long-running job)
 */

import { inngest } from '../client';
import { promptPatternAnalyzer } from '@/lib/ai/prompt-pattern-analyzer';
import { learningProfileService } from '@/lib/ai/learning-profile-service';
import { db } from '@/drizzle/db';
import { postAnalytics } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export const learnAiPatterns = inngest.createFunction(
  {
    id: 'learn-ai-patterns',
    name: 'Learn from User Content Patterns',
    retries: 1,
  },
  { cron: '0 1 * * *' }, // Daily at 3am SAST (1am UTC)
  async ({ event, step }) => {
    // Step 1: Analyze system-wide patterns
    const patternAnalysisResult = await step.run('analyze-patterns', async () => {
      try {
        logger.cron.info('Starting system-wide pattern analysis');
        
        await promptPatternAnalyzer.analyzeAndUpdatePatterns();
        
        logger.cron.info('Pattern analysis complete');
        
        return {
          success: true,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.cron.exception(error as Error, {
          function: 'learn-ai-patterns',
          step: 'analyze-patterns',
        });
        throw error;
      }
    });

    // Step 2: Update user learning profiles
    const userLearningResult = await step.run('update-user-profiles', async () => {
      try {
        logger.cron.info('Starting user learning profile updates');

        // Get active users with recent analytics
        const activeUsers = await db.selectDistinct({ userId: postAnalytics.userId })
          .from(postAnalytics)
          .orderBy(desc(postAnalytics.createdAt))
          .limit(100);

        let usersProcessed = 0;
        let usersFailed = 0;

        // Process each user's learning profile
        for (const { userId } of activeUsers) {
          try {
            await learningProfileService.runLearningAnalysis(userId);
            usersProcessed++;
          } catch (error) {
            logger.cron.error('Learning failed for user', { 
              userId, 
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            usersFailed++;
          }
        }

        logger.cron.info('User learning profiles updated', {
          usersProcessed,
          usersFailed,
        });

        return {
          success: true,
          usersAnalyzed: activeUsers.length,
          usersProcessed,
          usersFailed,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.cron.exception(error as Error, {
          function: 'learn-ai-patterns',
          step: 'update-user-profiles',
        });
        throw error;
      }
    });

    // Combine results
    const finalResult = {
      success: true,
      patternAnalysis: patternAnalysisResult,
      userLearning: userLearningResult,
      usersAnalyzed: userLearningResult.usersAnalyzed,
      usersProcessed: userLearningResult.usersProcessed,
      timestamp: new Date().toISOString(),
    };

    logger.cron.info('AI pattern learning cycle complete', finalResult);

    return finalResult;
  }
);
