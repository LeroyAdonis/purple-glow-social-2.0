/**
 * Database Service: Notifications
 * 
 * Handles user notification management
 */

import { db } from '../../drizzle/db';
import { notifications } from '../../drizzle/schema';
import { eq, and, desc, isNull, or, gt, sql } from 'drizzle-orm';
import type { Notification, NewNotification } from '../../drizzle/schema';

type NotificationType = 'low_credits' | 'credits_expiring' | 'post_skipped' | 'post_failed' | 'tier_limit_reached';

/**
 * Create a new notification
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  expiresAt?: Date;
}): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      expiresAt: data.expiresAt,
    })
    .returning();

  return notification;
}

/**
 * Get all unread, non-expired notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options: { includeRead?: boolean; limit?: number } = {}
): Promise<Notification[]> {
  const { includeRead = false, limit = 50 } = options;
  const now = new Date();

  const conditions = [
    eq(notifications.userId, userId),
    or(
      isNull(notifications.expiresAt),
      gt(notifications.expiresAt, now)
    ),
  ];

  if (!includeRead) {
    conditions.push(eq(notifications.read, false));
  }

  return await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const now = new Date();

  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
        or(
          isNull(notifications.expiresAt),
          gt(notifications.expiresAt, now)
        )
      )
    );

  return result?.count || 0;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<Notification | null> {
  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId))
    .returning();

  return updated || null;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      )
    );
}

/**
 * Dismiss (delete) a notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));
}

/**
 * Dismiss all notifications for a user
 */
export async function dismissAllNotifications(userId: string): Promise<void> {
  await db
    .delete(notifications)
    .where(eq(notifications.userId, userId));
}

/**
 * Create low credit warning notification
 */
export async function notifyLowCredits(userId: string, credits: number, percentage: number): Promise<Notification> {
  return createNotification({
    userId,
    type: 'low_credits',
    title: 'Low Credits Warning',
    message: `You only have ${credits} credits remaining (${percentage.toFixed(0)}% of your monthly allocation). Consider upgrading or purchasing more credits.`,
  });
}

/**
 * Create credits expiring notification
 */
export async function notifyCreditsExpiring(userId: string, credits: number, daysRemaining: number): Promise<Notification> {
  return createNotification({
    userId,
    type: 'credits_expiring',
    title: 'Credits Expiring Soon',
    message: `${credits} credits will expire in ${daysRemaining} days. Use them before your billing cycle resets.`,
    expiresAt: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000),
  });
}

/**
 * Create post skipped notification (zero credits)
 */
export async function notifyPostSkipped(
  userId: string,
  postId: string,
  platform: string,
  scheduledDate: Date
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'post_skipped',
    title: 'Scheduled Post Skipped',
    message: `A ${platform} post scheduled for ${scheduledDate.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} was skipped due to insufficient credits. Add credits and reschedule.`,
  });
}

/**
 * Create post failed notification
 */
export async function notifyPostFailed(
  userId: string,
  postId: string,
  platform: string,
  errorMessage: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'post_failed',
    title: 'Post Publishing Failed',
    message: `Failed to publish to ${platform}: ${errorMessage}. Please try again or check your connection.`,
  });
}

/**
 * Create tier limit reached notification
 */
export async function notifyTierLimitReached(
  userId: string,
  limitType: string,
  tier: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'tier_limit_reached',
    title: 'Limit Reached',
    message: `You've reached your ${tier} tier limit for ${limitType}. Upgrade to unlock more capacity.`,
  });
}

/**
 * Check if user already has an active notification of a type
 */
export async function hasActiveNotification(userId: string, type: NotificationType): Promise<boolean> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [existing] = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, type),
        gt(notifications.createdAt, oneDayAgo)
      )
    )
    .limit(1);

  return !!existing;
}
