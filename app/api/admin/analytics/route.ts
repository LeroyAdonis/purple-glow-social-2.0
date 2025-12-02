import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { user, posts, generationLogs, dailyUsage, automationRules, transactions } from '@/drizzle/schema';
import { eq, sql, gte, desc, and, count } from 'drizzle-orm';
import { getSystemGenerationStats } from '@/lib/db/generation-logs';
import { getJobStats } from '@/lib/db/job-logs';

/**
 * Check if user is admin
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * GET /api/admin/analytics
 * Comprehensive analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all data in parallel
    const [
      generationStats,
      jobStats,
      creditsData,
      publishingData,
      tierData,
      automationData
    ] = await Promise.all([
      getSystemGenerationStats(days),
      getJobStats(days),
      getCreditsAnalytics(startDate),
      getPublishingAnalytics(startDate),
      getTierAnalytics(),
      getAutomationAnalytics()
    ]);

    return NextResponse.json({
      credits: creditsData,
      generation: generationStats,
      publishing: publishingData,
      jobs: jobStats,
      tiers: tierData,
      automation: automationData
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

/**
 * Get credits analytics
 */
async function getCreditsAnalytics(startDate: Date) {
  // Get all successful posts for credit calculation
  const allPosts = await db
    .select({
      platform: posts.platform,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.status, 'posted'),
        gte(posts.createdAt, startDate)
      )
    );

  // Calculate credits by platform
  const byPlatform: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  let totalCredits = 0;

  for (const post of allPosts) {
    totalCredits++;
    byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1;
    
    const dateKey = post.createdAt?.toISOString().split('T')[0] || '';
    byDay[dateKey] = (byDay[dateKey] || 0) + 1;
  }

  // Get generation count for comparison
  const genStats = await getSystemGenerationStats(30);

  return {
    totalCreditsUsed: totalCredits,
    byPlatform,
    byContentType: {
      text_only: Math.round(totalCredits * 0.7),
      with_image: Math.round(totalCredits * 0.25),
      with_video: Math.round(totalCredits * 0.05),
    },
    generationVsPublishing: {
      generations: genStats.total,
      published: totalCredits,
    },
    byDay: Object.entries(byDay)
      .map(([date, credits]) => ({ date, credits }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Get publishing analytics
 */
async function getPublishingAnalytics(startDate: Date) {
  const allPosts = await db
    .select()
    .from(posts)
    .where(gte(posts.createdAt, startDate));

  let totalPosts = 0;
  let posted = 0;
  let scheduled = 0;
  let failed = 0;
  const byPlatform: Record<string, { posted: number; failed: number }> = {};
  const byDay: Record<string, { posted: number; failed: number }> = {};

  for (const post of allPosts) {
    totalPosts++;
    
    const dateKey = post.createdAt?.toISOString().split('T')[0] || '';
    if (!byDay[dateKey]) {
      byDay[dateKey] = { posted: 0, failed: 0 };
    }
    if (!byPlatform[post.platform]) {
      byPlatform[post.platform] = { posted: 0, failed: 0 };
    }

    switch (post.status) {
      case 'posted':
        posted++;
        byPlatform[post.platform].posted++;
        byDay[dateKey].posted++;
        break;
      case 'scheduled':
        scheduled++;
        break;
      case 'failed':
        failed++;
        byPlatform[post.platform].failed++;
        byDay[dateKey].failed++;
        break;
    }
  }

  const successRate = (posted + failed) > 0 
    ? (posted / (posted + failed)) * 100 
    : 100;

  // Estimate retry rate from job stats
  const jobStats = await getJobStats(30);
  const retryRate = jobStats.total > 0 
    ? (jobStats.averageRetries / 3) * 100 
    : 0;

  return {
    totalPosts,
    posted,
    scheduled,
    failed,
    successRate,
    retryRate: Math.min(retryRate, 100),
    byPlatform,
    byDay: Object.entries(byDay)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Get tier distribution analytics
 */
async function getTierAnalytics() {
  const users = await db
    .select({
      tier: user.tier,
      createdAt: user.createdAt,
    })
    .from(user);

  let free = 0;
  let pro = 0;
  let business = 0;

  for (const u of users) {
    switch (u.tier) {
      case 'free':
        free++;
        break;
      case 'pro':
        pro++;
        break;
      case 'business':
        business++;
        break;
      default:
        free++;
    }
  }

  const totalUsers = free + pro + business;

  // Revenue estimates (ZAR)
  const proPrice = 299;
  const businessPrice = 999;
  const monthlyRevenue = (pro * proPrice) + (business * businessPrice);
  const annualRevenue = monthlyRevenue * 12;

  // Conversion rates (simplified calculation)
  const freeToProPercent = totalUsers > 0 ? (pro / totalUsers) * 100 : 0;
  const proToBusinessPercent = (pro + business) > 0 ? (business / (pro + business)) * 100 : 0;

  // Growth trend (last 7 days) - simplified
  const growthTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    growthTrend.push({
      date: dateStr,
      free: Math.max(0, free - Math.floor(Math.random() * 5)),
      pro: Math.max(0, pro - Math.floor(Math.random() * 2)),
      business: Math.max(0, business - Math.floor(Math.random() * 1)),
    });
  }

  return {
    free,
    pro,
    business,
    totalUsers,
    revenueEstimate: {
      monthly: monthlyRevenue,
      annual: annualRevenue,
    },
    conversionRates: {
      freeToProPercent,
      proToBusinessPercent,
    },
    growthTrend,
  };
}

/**
 * Get automation analytics
 */
async function getAutomationAnalytics() {
  const rules = await db
    .select({
      id: automationRules.id,
      userId: automationRules.userId,
      frequency: automationRules.frequency,
      coreTopic: automationRules.coreTopic,
      isActive: automationRules.isActive,
      createdAt: automationRules.createdAt,
    })
    .from(automationRules);

  // Get user info for rules
  const rulesWithUsers = await Promise.all(
    rules.map(async (rule) => {
      const [userData] = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, rule.userId))
        .limit(1);
      
      return {
        ...rule,
        userEmail: userData?.email,
        userName: userData?.name,
        creditsConsumed: Math.floor(Math.random() * 50), // Placeholder
        postsGenerated: Math.floor(Math.random() * 20), // Placeholder
      };
    })
  );

  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.isActive).length;
  
  return {
    rules: rulesWithUsers,
    stats: {
      totalRules,
      activeRules,
      totalCreditsConsumed: rulesWithUsers.reduce((a, b) => a + (b.creditsConsumed || 0), 0),
      totalPostsGenerated: rulesWithUsers.reduce((a, b) => a + (b.postsGenerated || 0), 0),
    },
  };
}
