/**
 * Database Service: Subscriptions
 * 
 * Handles all database operations related to user subscriptions
 */

import { db } from '../../drizzle/db';
import { subscriptions, type Subscription, type NewSubscription } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Create a new subscription record
 */
export async function createSubscription(data: NewSubscription): Promise<Subscription> {
  const [subscription] = await db.insert(subscriptions).values(data).returning();
  return subscription;
}

/**
 * Get subscription by Polar subscription ID
 */
export async function getSubscriptionByPolarId(polarSubscriptionId: string): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.polarSubscriptionId, polarSubscriptionId))
    .limit(1);
  
  return subscription || null;
}

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription(userId: string): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      )
    )
    .limit(1);
  
  return subscription || null;
}

/**
 * Update subscription details
 */
export async function updateSubscription(
  subscriptionId: string,
  data: Partial<NewSubscription>
): Promise<Subscription> {
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const [subscription] = await db
    .update(subscriptions)
    .set(updateData)
    .where(eq(subscriptions.id, subscriptionId))
    .returning();
  
  return subscription;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Subscription> {
  const updateData: Partial<NewSubscription> = {
    cancelAtPeriodEnd,
    updatedAt: new Date(),
  };

  if (!cancelAtPeriodEnd) {
    updateData.status = 'canceled';
    updateData.canceledAt = new Date();
  }

  const [subscription] = await db
    .update(subscriptions)
    .set(updateData)
    .where(eq(subscriptions.id, subscriptionId))
    .returning();
  
  return subscription;
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
}
