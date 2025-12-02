/**
 * Database Service: Daily Usage
 * 
 * Tracks daily usage for rate limiting
 */

import { db } from '../../drizzle/db';
import { dailyUsage } from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { DailyUsage, NewDailyUsage } from '../../drizzle/schema';
import type { PlatformBreakdown } from '../tiers/types';

/**
 * Get today's date in YYYY-MM-DD format (SAST timezone)
 */
function getTodayDateString(): string {
  const now = new Date();
  // Adjust for SAST (UTC+2)
  now.setHours(now.getHours() + 2);
  return now.toISOString().split('T')[0];
}

/**
 * Get or create daily usage record
 */
async function getOrCreateDailyUsage(userId: string, date?: string): Promise<DailyUsage> {
  const dateStr = date || getTodayDateString();

  // Try to get existing record
  const [existing] = await db
    .select()
    .from(dailyUsage)
    .where(
      and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.date, dateStr)
      )
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  // Create new record
  const [newRecord] = await db
    .insert(dailyUsage)
    .values({
      userId,
      date: dateStr,
      generationsCount: 0,
      postsCount: 0,
      platformBreakdown: {},
    })
    .returning();

  return newRecord;
}

/**
 * Increment generation count
 */
export async function incrementGenerations(userId: string): Promise<DailyUsage> {
  const dateStr = getTodayDateString();
  
  // Ensure record exists
  await getOrCreateDailyUsage(userId, dateStr);

  // Increment
  const [updated] = await db
    .update(dailyUsage)
    .set({
      generationsCount: sql`${dailyUsage.generationsCount} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.date, dateStr)
      )
    )
    .returning();

  return updated;
}

/**
 * Increment post count for a platform
 */
export async function incrementPosts(
  userId: string,
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'
): Promise<DailyUsage> {
  const dateStr = getTodayDateString();
  
  // Ensure record exists
  const record = await getOrCreateDailyUsage(userId, dateStr);
  
  // Update platform breakdown
  const breakdown = (record.platformBreakdown as PlatformBreakdown) || {};
  breakdown[platform] = (breakdown[platform] || 0) + 1;

  // Update record
  const [updated] = await db
    .update(dailyUsage)
    .set({
      postsCount: sql`${dailyUsage.postsCount} + 1`,
      platformBreakdown: breakdown,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.date, dateStr)
      )
    )
    .returning();

  return updated;
}

/**
 * Get daily usage for a user
 */
export async function getDailyUsage(userId: string, date?: string): Promise<DailyUsage | null> {
  const dateStr = date || getTodayDateString();

  const [record] = await db
    .select()
    .from(dailyUsage)
    .where(
      and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.date, dateStr)
      )
    )
    .limit(1);

  return record || null;
}

/**
 * Check if user is within daily generation limit
 */
export async function checkGenerationLimit(
  userId: string,
  limit: number
): Promise<{ allowed: boolean; current: number; remaining: number }> {
  const usage = await getDailyUsage(userId);
  const current = usage?.generationsCount || 0;
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    remaining,
  };
}

/**
 * Check if user is within daily post limit for a platform
 */
export async function checkPlatformPostLimit(
  userId: string,
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin',
  limit: number
): Promise<{ allowed: boolean; current: number; remaining: number }> {
  const usage = await getDailyUsage(userId);
  const breakdown = (usage?.platformBreakdown as PlatformBreakdown) || {};
  const current = breakdown[platform] || 0;
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    remaining,
  };
}

/**
 * Reset daily usage (typically called at midnight)
 */
export async function resetDailyUsage(userId: string): Promise<void> {
  const dateStr = getTodayDateString();
  
  // Just ensure a fresh record exists for today
  // Old records can be kept for analytics
  await getOrCreateDailyUsage(userId, dateStr);
}

/**
 * Get usage summary for date range
 */
export async function getUsageSummary(
  userId: string,
  days: number = 30
): Promise<{
  totalGenerations: number;
  totalPosts: number;
  averageDaily: { generations: number; posts: number };
  platformBreakdown: PlatformBreakdown;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const records = await db
    .select()
    .from(dailyUsage)
    .where(
      and(
        eq(dailyUsage.userId, userId),
        sql`${dailyUsage.date} >= ${startDateStr}`,
        sql`${dailyUsage.date} <= ${endDateStr}`
      )
    );

  let totalGenerations = 0;
  let totalPosts = 0;
  const platformBreakdown: PlatformBreakdown = {};

  for (const record of records) {
    totalGenerations += record.generationsCount;
    totalPosts += record.postsCount;

    const breakdown = (record.platformBreakdown as PlatformBreakdown) || {};
    for (const [platform, count] of Object.entries(breakdown)) {
      const key = platform as keyof PlatformBreakdown;
      platformBreakdown[key] = (platformBreakdown[key] || 0) + (count || 0);
    }
  }

  const daysWithData = records.length || 1;

  return {
    totalGenerations,
    totalPosts,
    averageDaily: {
      generations: totalGenerations / daysWithData,
      posts: totalPosts / daysWithData,
    },
    platformBreakdown,
  };
}
