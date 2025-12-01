import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPlatformStats, getRevenueMetrics, getMRR, getTierDistribution } from '@/lib/db/analytics';

/**
 * Check if user is admin (email-based for now)
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * GET /api/admin/stats
 * Fetch platform-wide statistics (admin only)
 */
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

    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

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
    console.error('Admin stats fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
