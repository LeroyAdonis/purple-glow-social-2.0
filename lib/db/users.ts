/**
 * Database Service: Users
 * 
 * Handles all database operations related to users
 */

import { db } from '../../drizzle/db';
import { user, posts } from '../../drizzle/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';

type User = typeof user.$inferSelect;

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const [record] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  
  return record || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [record] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  
  return record || null;
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(
  options: {
    limit?: number;
    offset?: number;
    tier?: 'free' | 'pro' | 'business';
  } = {}
): Promise<User[]> {
  const { limit = 50, offset = 0, tier } = options;

  const conditions = [];
  if (tier) {
    conditions.push(eq(user.tier, tier));
  }

  const query = db.select().from(user);
  
  if (conditions.length > 0) {
    return await query
      .where(and(...conditions))
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return await query
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    email: string;
    image: string;
    tier: 'free' | 'pro' | 'business';
    credits: number;
    polarCustomerId: string;
  }>
): Promise<User> {
  const [updated] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  
  return updated;
}

/**
 * Add credits to a user
 */
export async function addCredits(userId: string, amount: number): Promise<User> {
  const [updated] = await db
    .update(user)
    .set({
      credits: sql`${user.credits} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  
  return updated;
}

/**
 * Deduct credits from a user
 */
export async function deductCredits(userId: string, amount: number): Promise<User> {
  const [updated] = await db
    .update(user)
    .set({
      credits: sql`GREATEST(${user.credits} - ${amount}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  
  return updated;
}

/**
 * Count all users
 */
export async function countUsers(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(user);
  return result?.count || 0;
}

/**
 * Get user tier distribution
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
 * Get user with their post count
 */
export async function getUserWithStats(userId: string): Promise<{
  user: User;
  postsCount: number;
  scheduledCount: number;
  postedCount: number;
} | null> {
  const userRecord = await getUserById(userId);
  if (!userRecord) return null;

  const postStats = await db
    .select({
      status: posts.status,
      count: count(),
    })
    .from(posts)
    .where(eq(posts.userId, userId))
    .groupBy(posts.status);

  let postsCount = 0;
  let scheduledCount = 0;
  let postedCount = 0;

  for (const row of postStats) {
    const countNum = Number(row.count);
    postsCount += countNum;
    if (row.status === 'scheduled') scheduledCount = countNum;
    if (row.status === 'posted') postedCount = countNum;
  }

  return {
    user: userRecord,
    postsCount,
    scheduledCount,
    postedCount,
  };
}

/**
 * Get all users with their post stats (for admin dashboard)
 */
export async function getAllUsersWithStats(
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<Array<User & { postsCreated: number }>> {
  const { limit = 50, offset = 0 } = options;

  // Get users
  const users = await getAllUsers({ limit, offset });

  // Get post counts for all users
  const postCounts = await db
    .select({
      userId: posts.userId,
      count: count(),
    })
    .from(posts)
    .groupBy(posts.userId);

  // Create a map of userId -> postCount
  const countMap = new Map<string, number>();
  for (const row of postCounts) {
    countMap.set(row.userId, Number(row.count));
  }

  // Combine users with their post counts
  return users.map(u => ({
    ...u,
    postsCreated: countMap.get(u.id) || 0,
  }));
}
