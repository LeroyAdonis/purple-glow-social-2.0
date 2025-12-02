/**
 * API: Unified Limit Check Endpoint
 * GET /api/limits/check
 * 
 * Returns all tier limits and current usage for the authenticated user.
 * Used by UI components to display remaining quotas and limit warnings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { user, connectedAccounts, automationRules } from '@/drizzle/schema';
import { eq, and, count } from 'drizzle-orm';
import { getTierLimits } from '@/lib/tiers/config';
import { getDailyUsage } from '@/lib/db/daily-usage';
import { getDailyGenerations } from '@/lib/db/generation-logs';
import { countScheduledPosts } from '@/lib/db/posts';
import { getAvailableCredits } from '@/lib/db/credit-reservations';
import type { TierName, PlatformBreakdown } from '@/lib/tiers/types';

interface LimitStatus {
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  isAtLimit: boolean;
}

interface LimitsResponse {
  tier: TierName;
  credits: {
    total: number;
    reserved: number;
    available: number;
    percentage: number;
    isLow: boolean; // < 20%
  };
  connectedAccounts: {
    total: LimitStatus;
    byPlatform: Record<string, LimitStatus>;
  };
  scheduling: {
    queueSize: LimitStatus;
    advanceSchedulingDays: number;
  };
  dailyGenerations: LimitStatus;
  dailyPosts: {
    total: LimitStatus;
    byPlatform: Record<string, LimitStatus>;
  };
  automation: {
    enabled: boolean;
    rules: LimitStatus;
  };
}

function createLimitStatus(current: number, limit: number): LimitStatus {
  const remaining = Math.max(0, limit - current);
  const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;
  return {
    current,
    limit,
    remaining,
    percentage,
    isAtLimit: current >= limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user record
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userTier = (userRecord.tier || 'free') as TierName;
    const limits = getTierLimits(userTier);

    // Get connected accounts count by platform
    const accountsByPlatform = await db
      .select({
        platform: connectedAccounts.platform,
        count: count(),
      })
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          eq(connectedAccounts.isActive, true)
        )
      )
      .groupBy(connectedAccounts.platform);

    const platformCounts: Record<string, number> = {};
    let totalAccounts = 0;
    for (const row of accountsByPlatform) {
      platformCounts[row.platform] = Number(row.count);
      totalAccounts += Number(row.count);
    }

    // Get scheduled posts count
    const scheduledCount = await countScheduledPosts(userId);

    // Get daily generations
    const dailyGenerations = await getDailyGenerations(userId);

    // Get daily usage (posts)
    const dailyUsageRecord = await getDailyUsage(userId);
    const dailyPostsTotal = dailyUsageRecord?.postsCount || 0;
    const platformBreakdown = (dailyUsageRecord?.platformBreakdown || {}) as PlatformBreakdown;

    // Get automation rules count
    const [automationCount] = await db
      .select({ count: count() })
      .from(automationRules)
      .where(eq(automationRules.userId, userId));

    // Get available credits
    const availableCredits = await getAvailableCredits(userId);
    const reservedCredits = userRecord.credits - availableCredits;
    const creditPercentage = limits.monthlyCredits > 0 
      ? Math.round((userRecord.credits / limits.monthlyCredits) * 100) 
      : 0;

    // Build response
    const platforms = ['facebook', 'instagram', 'twitter', 'linkedin'] as const;
    
    const connectedAccountsByPlatform: Record<string, LimitStatus> = {};
    for (const p of platforms) {
      connectedAccountsByPlatform[p] = createLimitStatus(
        platformCounts[p] || 0,
        limits.connectedAccountsPerPlatform
      );
    }

    const dailyPostsByPlatform: Record<string, LimitStatus> = {};
    for (const p of platforms) {
      dailyPostsByPlatform[p] = createLimitStatus(
        platformBreakdown[p] || 0,
        limits.dailyPostsPerPlatform
      );
    }

    const response: LimitsResponse = {
      tier: userTier,
      credits: {
        total: userRecord.credits,
        reserved: reservedCredits,
        available: availableCredits,
        percentage: creditPercentage,
        isLow: creditPercentage < 20,
      },
      connectedAccounts: {
        total: createLimitStatus(totalAccounts, limits.totalConnectedAccounts),
        byPlatform: connectedAccountsByPlatform,
      },
      scheduling: {
        queueSize: createLimitStatus(scheduledCount, limits.queueSize),
        advanceSchedulingDays: limits.advanceSchedulingDays,
      },
      dailyGenerations: createLimitStatus(dailyGenerations, limits.dailyGenerations),
      dailyPosts: {
        total: createLimitStatus(dailyPostsTotal, limits.dailyPostsPerPlatform * 4),
        byPlatform: dailyPostsByPlatform,
      },
      automation: {
        enabled: limits.automationEnabled,
        rules: createLimitStatus(automationCount?.count || 0, limits.maxAutomationRules),
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Limits check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check limits' },
      { status: 500 }
    );
  }
}
