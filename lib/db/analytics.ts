/**
 * Database Service: Analytics
 * 
 * Handles all analytics and statistics queries
 */

import { db } from '../../drizzle/db';
import { user, posts, transactions, subscriptions, automationRules } from '../../drizzle/schema';
import { eq, desc, count, sum, and, gte, lte } from 'drizzle-orm';

/**
 * Get platform-wide statistics (admin dashboard)
 */
export async function getPlatformStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  scheduledPosts: number;
  postedPosts: number;
  totalAutomationRules: number;
  activeAutomationRules: number;
}> {
  // Get user counts
  const [userCount] = await db.select({ count: count() }).from(user);
  
  // Get post counts by status
  const postCounts = await db
    .select({
      status: posts.status,
      count: count(),
    })
    .from(posts)
    .groupBy(posts.status);

  let totalPosts = 0;
  let scheduledPosts = 0;
  let postedPosts = 0;

  for (const row of postCounts) {
    const countNum = Number(row.count);
    totalPosts += countNum;
    if (row.status === 'scheduled') scheduledPosts = countNum;
    if (row.status === 'posted') postedPosts = countNum;
  }

  // Get automation rule counts
  const [totalRules] = await db.select({ count: count() }).from(automationRules);
  const [activeRules] = await db
    .select({ count: count() })
    .from(automationRules)
    .where(eq(automationRules.isActive, true));

  return {
    totalUsers: userCount?.count || 0,
    activeUsers: userCount?.count || 0,
    totalPosts,
    scheduledPosts,
    postedPosts,
    totalAutomationRules: totalRules?.count || 0,
    activeAutomationRules: activeRules?.count || 0,
  };
}

/**
 * Get revenue metrics
 */
export async function getRevenueMetrics(): Promise<{
  totalRevenue: number;
  monthlyRevenue: number;
  subscriptionRevenue: number;
  creditRevenue: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get total revenue from completed transactions
  const [totalResult] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(eq(transactions.status, 'completed'));

  // Get this month's revenue
  const [monthlyResult] = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(
      eq(transactions.status, 'completed'),
      gte(transactions.createdAt, startOfMonth),
      lte(transactions.createdAt, endOfMonth)
    ));

  // Get revenue by type
  const revenueByType = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.status, 'completed'))
    .groupBy(transactions.type);

  let subscriptionRevenue = 0;
  let creditRevenue = 0;

  for (const row of revenueByType) {
    const amount = Number(row.total) || 0;
    if (row.type === 'subscription') subscriptionRevenue = amount;
    if (row.type === 'credit_purchase') creditRevenue = amount;
  }

  return {
    totalRevenue: Number(totalResult?.total) || 0,
    monthlyRevenue: Number(monthlyResult?.total) || 0,
    subscriptionRevenue,
    creditRevenue,
  };
}

/**
 * Get MRR (Monthly Recurring Revenue) from active subscriptions
 */
export async function getMRR(): Promise<number> {
  // Get all active subscriptions
  const activeSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'));

  let mrr = 0;
  for (const sub of activeSubscriptions) {
    // Pro plan = R299/month, Business = R999/month
    if (sub.planId === 'pro') {
      mrr += 299;
    } else if (sub.planId === 'business') {
      mrr += 999;
    }
  }

  return mrr;
}

/**
 * Get tier distribution for analytics
 */
export async function getTierDistribution(): Promise<{
  free: number;
  pro: number;
  business: number;
}> {
  const results = await db
    .select({
      tier: user.tier,
      count: count(),
    })
    .from(user)
    .groupBy(user.tier);

  const distribution = {
    free: 0,
    pro: 0,
    business: 0,
  };

  for (const row of results) {
    if (row.tier && row.tier in distribution) {
      distribution[row.tier as keyof typeof distribution] = Number(row.count);
    }
  }

  return distribution;
}

/**
 * Get transactions for admin dashboard
 */
export async function getAllTransactions(
  options: {
    limit?: number;
    offset?: number;
    type?: 'credit_purchase' | 'subscription' | 'refund';
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
  } = {}
): Promise<Array<typeof transactions.$inferSelect & { userName: string }>> {
  const { limit = 50, offset = 0, type, status } = options;

  // Build query with joins
  const conditions = [];
  if (type) conditions.push(eq(transactions.type, type));
  if (status) conditions.push(eq(transactions.status, status));

  const results = await db
    .select({
      transaction: transactions,
      userName: user.name,
    })
    .from(transactions)
    .leftJoin(user, eq(transactions.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset);

  return results.map(row => ({
    ...row.transaction,
    userName: row.userName || 'Unknown User',
  }));
}

/**
 * Get user billing history (invoices)
 */
export async function getUserBillingHistory(
  userId: string,
  limit: number = 12
): Promise<Array<{
  id: string;
  date: Date;
  plan: string;
  amount: number;
  vat: number;
  total: number;
  status: string;
  invoiceNumber: string;
}>> {
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'subscription'),
      eq(transactions.status, 'completed')
    ))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);

  return userTransactions.map((txn, index) => {
    const amount = txn.amount / 100; // Convert from cents
    const vat = amount * 0.15;
    const date = txn.createdAt;
    const invoiceNumber = `PG-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`;

    return {
      id: txn.id,
      date,
      plan: txn.description.includes('Business') ? 'Business Plan' : 'Pro Plan',
      amount,
      vat,
      total: amount + vat,
      status: txn.status,
      invoiceNumber,
    };
  });
}

/**
 * Get post statistics by platform
 */
export async function getPostsByPlatform(userId?: string): Promise<{
  facebook: number;
  instagram: number;
  twitter: number;
  linkedin: number;
}> {
  const conditions = userId ? [eq(posts.userId, userId)] : [];

  const results = await db
    .select({
      platform: posts.platform,
      count: count(),
    })
    .from(posts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(posts.platform);

  const stats = {
    facebook: 0,
    instagram: 0,
    twitter: 0,
    linkedin: 0,
  };

  for (const row of results) {
    if (row.platform in stats) {
      stats[row.platform as keyof typeof stats] = Number(row.count);
    }
  }

  return stats;
}
