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

    console.log('[CRON] Starting pattern learning job');

    // 1. Run system-wide pattern analysis
    await promptPatternAnalyzer.analyzeAndUpdatePatterns();
    console.log('[CRON] Pattern analysis complete');

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
        console.error(`[CRON] Learning failed for user ${userId}:`, error);
      }
    }

    console.log(`[CRON] Learning complete for ${usersProcessed} users`);

    return NextResponse.json({
      success: true,
      message: 'Pattern learning complete',
      usersProcessed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Pattern learning failed:', error);
    return NextResponse.json({ 
      error: 'Pattern learning failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
