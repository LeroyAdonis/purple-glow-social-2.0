import { NextRequest, NextResponse } from 'next/server';
import { getPlatformStats, getRevenueMetrics, getMRR, getTierDistribution } from '@/lib/db/analytics';
import { requireAdmin, handleAuthError } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/stats
 * Fetch platform-wide statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

    // Fetch all stats in parallel
    const [platformStats, revenueMetrics, mrr, tierDistribution] = await Promise.all([
      getPlatformStats(),
      getRevenueMetrics(),
      getMRR(),
      getTierDistribution(),
    ]);

    return NextResponse.json({
      platform: platformStats,
      revenue: {
        ...revenueMetrics,
        mrr,
      },
      users: {
        total: platformStats.totalUsers,
        active: platformStats.activeUsers,
        tierDistribution,
      },
      posts: {
        total: platformStats.totalPosts,
        scheduled: platformStats.scheduledPosts,
        posted: platformStats.postedPosts,
      },
      automation: {
        total: platformStats.totalAutomationRules,
        active: platformStats.activeAutomationRules,
      },
    });
  } catch (error: any) {
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'fetch-stats' });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
