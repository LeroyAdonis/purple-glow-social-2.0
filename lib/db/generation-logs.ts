/**
 * Database Service: Generation Logs
 * 
 * Tracks AI content generation for analytics and rate limiting
 */

import { db } from '../../drizzle/db';
import { generationLogs } from '../../drizzle/schema';
import { eq, and, sql, desc, gte, count } from 'drizzle-orm';
import type { GenerationLog, NewGenerationLog } from '../../drizzle/schema';

/**
 * Log an AI generation
 */
export async function logGeneration(data: {
  userId: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic?: string;
  tone?: string;
  language?: string;
  success: boolean;
  errorMessage?: string;
}): Promise<GenerationLog> {
  const [log] = await db
    .insert(generationLogs)
    .values({
      userId: data.userId,
      platform: data.platform,
      topic: data.topic,
      tone: data.tone,
      language: data.language,
      success: data.success,
      errorMessage: data.errorMessage,
    })
    .returning();

  return log;
}

/**
 * Get generation stats for a user
 */
export async function getGenerationStats(
  userId: string,
  options: { days?: number } = {}
): Promise<{
  total: number;
  successful: number;
  failed: number;
  byPlatform: Record<string, number>;
}> {
  const { days = 30 } = options;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db
    .select()
    .from(generationLogs)
    .where(
      and(
        eq(generationLogs.userId, userId),
        gte(generationLogs.createdAt, startDate)
      )
    );

  let total = 0;
  let successful = 0;
  let failed = 0;
  const byPlatform: Record<string, number> = {};

  for (const log of logs) {
    total++;
    if (log.success) {
      successful++;
    } else {
      failed++;
    }
    byPlatform[log.platform] = (byPlatform[log.platform] || 0) + 1;
  }

  return { total, successful, failed, byPlatform };
}

/**
 * Get daily generations count for a user (for rate limiting)
 */
export async function getDailyGenerations(userId: string, date?: Date): Promise<number> {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [result] = await db
    .select({ count: count() })
    .from(generationLogs)
    .where(
      and(
        eq(generationLogs.userId, userId),
        gte(generationLogs.createdAt, startOfDay),
        sql`${generationLogs.createdAt} <= ${endOfDay}`
      )
    );

  return result?.count || 0;
}

/**
 * Get recent generations for a user
 */
export async function getRecentGenerations(
  userId: string,
  limit: number = 10
): Promise<GenerationLog[]> {
  return await db
    .select()
    .from(generationLogs)
    .where(eq(generationLogs.userId, userId))
    .orderBy(desc(generationLogs.createdAt))
    .limit(limit);
}

/**
 * Get generation errors (for admin dashboard)
 */
export async function getGenerationErrors(
  options: { limit?: number; userId?: string } = {}
): Promise<GenerationLog[]> {
  const { limit = 50, userId } = options;

  const conditions = [eq(generationLogs.success, false)];
  if (userId) {
    conditions.push(eq(generationLogs.userId, userId));
  }

  return await db
    .select()
    .from(generationLogs)
    .where(and(...conditions))
    .orderBy(desc(generationLogs.createdAt))
    .limit(limit);
}

/**
 * Get top topics for a user
 */
export async function getTopTopics(
  userId: string,
  limit: number = 10
): Promise<Array<{ topic: string; count: number }>> {
  const results = await db
    .select({
      topic: generationLogs.topic,
      count: count(),
    })
    .from(generationLogs)
    .where(
      and(
        eq(generationLogs.userId, userId),
        sql`${generationLogs.topic} IS NOT NULL`
      )
    )
    .groupBy(generationLogs.topic)
    .orderBy(desc(count()))
    .limit(limit);

  return results.map(r => ({
    topic: r.topic || '',
    count: Number(r.count),
  }));
}

/**
 * Get system-wide generation stats (for admin)
 */
export async function getSystemGenerationStats(days: number = 30): Promise<{
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  byPlatform: Record<string, number>;
  byDay: Array<{ date: string; count: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db
    .select()
    .from(generationLogs)
    .where(gte(generationLogs.createdAt, startDate));

  let total = 0;
  let successful = 0;
  let failed = 0;
  const byPlatform: Record<string, number> = {};
  const byDayMap: Record<string, number> = {};

  for (const log of logs) {
    total++;
    if (log.success) {
      successful++;
    } else {
      failed++;
    }
    byPlatform[log.platform] = (byPlatform[log.platform] || 0) + 1;
    
    const dateKey = log.createdAt.toISOString().split('T')[0];
    byDayMap[dateKey] = (byDayMap[dateKey] || 0) + 1;
  }

  const byDay = Object.entries(byDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    byPlatform,
    byDay,
  };
}
