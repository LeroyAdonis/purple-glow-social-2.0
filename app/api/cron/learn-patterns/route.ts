/**
 * Cron Job: Learn Patterns
 * Runs periodically to analyze engagement data and update prompt patterns
 * 
 * Schedule: Daily at 3 AM SAST (1 AM UTC)
 * Vercel Cron: 0 1 * * *
 */

import { NextResponse } from 'next/server';
import { promptPatternAnalyzer } from '@/lib/ai/prompt-pattern-analyzer';
import { learningProfileService } from '@/lib/ai/learning-profile-service';
import { db } from '@/drizzle/db';
import { user, postAnalytics } from '@/drizzle/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.cron.info('Starting pattern learning job');

    // 1. Run system-wide pattern analysis
    await promptPatternAnalyzer.analyzeAndUpdatePatterns();
    logger.cron.info('Pattern analysis complete');

    // 2. Get active users with recent analytics
    const activeUsers = await db.selectDistinct({ userId: postAnalytics.userId })
      .from(postAnalytics)
      .orderBy(desc(postAnalytics.createdAt))
      .limit(100);

    // 3. Run learning analysis for each active user
    let usersProcessed = 0;
    for (const { userId } of activeUsers) {
      try {
        await learningProfileService.runLearningAnalysis(userId);
        usersProcessed++;
      } catch (error) {
        logger.cron.error('Learning failed for user', { userId, error });
      }
    }

    logger.cron.info('Learning complete', { usersProcessed });

    return NextResponse.json({
      success: true,
      message: 'Pattern learning complete',
      usersProcessed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.cron.error('Pattern learning failed', { error });
    return NextResponse.json({ 
      error: 'Pattern learning failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
