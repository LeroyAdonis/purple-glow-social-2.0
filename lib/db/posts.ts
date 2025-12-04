/**
 * Database Service: Posts
 * 
 * Handles all database operations related to posts
 */

import { db } from '../../drizzle/db';
import { posts, type Post } from '../../drizzle/schema';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';

type NewPost = typeof posts.$inferInsert;

/**
 * Create a new post
 */
export async function createPost(data: NewPost): Promise<Post> {
  const [post] = await db.insert(posts).values(data).returning();
  return post;
}

/**
 * Get post by ID
 */
export async function getPostById(postId: string): Promise<Post | null> {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return post || null;
}

/**
 * Get all posts for a user with optional filtering and pagination
 */
export async function getUserPosts(
  userId: string,
  options: {
    status?: 'draft' | 'scheduled' | 'posted' | 'failed';
    platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
    limit?: number;
    offset?: number;
  } = {}
): Promise<Post[]> {
  const { status, platform, limit = 50, offset = 0 } = options;

  const conditions = [eq(posts.userId, userId)];

  if (status) {
    conditions.push(eq(posts.status, status));
  }

  if (platform) {
    conditions.push(eq(posts.platform, platform));
  }

  return await db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get scheduled posts for a user
 */
export async function getScheduledPosts(userId: string): Promise<Post[]> {
  return await db
    .select()
    .from(posts)
    .where(and(
      eq(posts.userId, userId),
      eq(posts.status, 'scheduled')
    ))
    .orderBy(posts.scheduledDate);
}

/**
 * Get scheduled posts ready to be published
 */
export async function getPostsReadyToPublish(): Promise<Post[]> {
  const now = new Date();

  return await db
    .select()
    .from(posts)
    .where(and(
      eq(posts.status, 'scheduled'),
      lte(posts.scheduledDate, now)
    ))
    .orderBy(posts.scheduledDate);
}

/**
 * Update post
 */
export async function updatePost(
  postId: string,
  data: Partial<NewPost>,
  tx?: any
): Promise<Post> {
  const [post] = await (tx || db)
    .update(posts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  return post;
}

/**
 * Delete post
 */
export async function deletePost(postId: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, postId));
}

/**
 * Count posts for a user
 */
export async function countUserPosts(
  userId: string,
  status?: 'draft' | 'scheduled' | 'posted' | 'failed'
): Promise<number> {
  const conditions = [eq(posts.userId, userId)];

  if (status) {
    conditions.push(eq(posts.status, status));
  }

  const [result] = await db
    .select({ count: count() })
    .from(posts)
    .where(and(...conditions));

  return result?.count || 0;
}

/**
 * Get posts in date range
 */
export async function getPostsInRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Post[]> {
  return await db
    .select()
    .from(posts)
    .where(and(
      eq(posts.userId, userId),
      gte(posts.scheduledDate, startDate),
      lte(posts.scheduledDate, endDate)
    ))
    .orderBy(posts.scheduledDate);
}

/**
 * Count scheduled posts for a user (for queue size validation)
 */
export async function countScheduledPosts(userId: string): Promise<number> {
  return await countUserPosts(userId, 'scheduled');
}

/**
 * Get post statistics for a user
 */
export async function getPostStats(userId: string): Promise<{
  total: number;
  scheduled: number;
  posted: number;
  failed: number;
}> {
  const results = await db
    .select({
      status: posts.status,
      count: count(),
    })
    .from(posts)
    .where(eq(posts.userId, userId))
    .groupBy(posts.status);

  const stats = {
    total: 0,
    scheduled: 0,
    posted: 0,
    failed: 0,
  };

  for (const row of results) {
    const statusCount = Number(row.count);
    stats.total += statusCount;
    if (row.status === 'scheduled') stats.scheduled = statusCount;
    if (row.status === 'posted') stats.posted = statusCount;
    if (row.status === 'failed') stats.failed = statusCount;
  }

  return stats;
}
