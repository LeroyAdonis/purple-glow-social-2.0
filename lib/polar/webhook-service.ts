/**
 * Polar Webhook Service
 * 
 * Handles processing of Polar webhook events
 */

import { db } from '../../drizzle/db';
import { user as userTable } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { createTransaction, updateTransactionStatus, getTransactionByPolarOrderId } from '../db/transactions';
import { createSubscription, updateSubscription, getSubscriptionByPolarId } from '../db/subscriptions';
import { createWebhookEvent, markEventProcessed, markEventFailed, webhookEventExists } from '../db/webhook-events';
import { logger } from '@/lib/logger';

// Flexible webhook payload type for Polar SDK compatibility
interface WebhookPayloadData {
  id: string;
  customer?: { id: string; email: string };
  customerId?: string;
  product?: { id: string; name: string };
  amount?: number;
  currency?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  status?: string;
  canceledAt?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: {
    userId?: string;
    planId?: string;
    billingCycle?: string;
    credits?: string;
    type?: string;
  };
}

/**
 * Process a webhook event
 * This is the main entry point for webhook processing
 */
export async function processWebhookEvent(eventType: string, eventId: string, payload: WebhookPayloadData) {
  logger.polar.info(`Processing webhook event: ${eventType}`, { eventId });

  // Check if event already processed (idempotency)
  if (await webhookEventExists(eventId)) {
    logger.polar.info('Event already processed, skipping', { eventId });
    return { success: true, message: 'Event already processed' };
  }

  // Create webhook event record
  await createWebhookEvent({
    eventType,
    eventId,
    payload,
    status: 'pending',
  });

  try {
    // Route to appropriate handler based on event type
    switch (eventType) {
      case 'order.created':
        await handleOrderCreated(payload);
        break;
      case 'order.paid':
        await handleOrderPaid(payload);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(payload);
        break;
      case 'subscription.active':
        await handleSubscriptionActive(payload);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(payload);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(payload);
        break;
      case 'order.refunded':
        await handleOrderRefunded(payload);
        break;
      default:
        logger.polar.debug(`Unhandled event type: ${eventType}`);
    }

    // Mark event as processed
    await markEventProcessed(eventId);
    
    return { success: true, message: 'Event processed successfully' };
  } catch (error) {
    logger.polar.exception(error, { eventId, eventType });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await markEventFailed(eventId, errorMessage);
    
    throw error;
  }
}

/**
 * Handle order.created event
 */
async function handleOrderCreated(payload: WebhookPayloadData) {
  const { id, customer, product, amount, currency, metadata } = payload;
  
  if (!metadata?.userId) {
    throw new Error('Missing userId in order metadata');
  }

  // Create transaction record
  await createTransaction({
    userId: metadata.userId,
    polarOrderId: id,
    type: metadata.type === 'subscription' ? 'subscription' : 'credit_purchase',
    amount,
    currency,
    status: 'pending',
    credits: metadata.credits ? parseInt(metadata.credits) : null,
    description: `Order created for ${product.name}`,
    metadata: payload,
  });

  logger.polar.info('Transaction created for order', { orderId: id });
}

/**
 * Handle order.paid event
 * This is where we add credits to the user's account
 */
async function handleOrderPaid(payload: WebhookPayloadData) {
  const { id, metadata } = payload;
  
  if (!metadata?.userId) {
    throw new Error('Missing userId in order metadata');
  }

  // Find the transaction
  const transaction = await getTransactionByPolarOrderId(id);
  if (!transaction) {
    throw new Error(`Transaction not found for order ${id}`);
  }

  // Update transaction status
  await updateTransactionStatus(transaction.id, 'completed', payload);

  // If this is a credit purchase, add credits to user
  if (transaction.type === 'credit_purchase' && transaction.credits) {
    await db
      .update(userTable)
      .set({ 
        credits: sql`${userTable.credits} + ${transaction.credits}`,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, metadata.userId));

    logger.polar.info('Added credits to user', { userId: metadata.userId, credits: transaction.credits });
  }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(payload: WebhookPayloadData) {
  const { id, customerId, product, currentPeriodStart, currentPeriodEnd, status, metadata } = payload;
  
  if (!metadata?.userId) {
    throw new Error('Missing userId in subscription metadata');
  }

  // Create subscription record
  await createSubscription({
    userId: metadata.userId,
    polarSubscriptionId: id,
    polarCustomerId: customerId,
    planId: metadata.planId,
    billingCycle: (metadata.billingCycle as 'monthly' | 'annual') || 'monthly',
    status: status === 'active' ? 'active' : 'trialing',
    currentPeriodStart: new Date(currentPeriodStart!),
    currentPeriodEnd: new Date(currentPeriodEnd!),
  });

  logger.polar.info('Subscription created', { subscriptionId: id, userId: metadata.userId });
}

/**
 * Handle subscription.active event
 * This is where we upgrade the user's tier
 */
async function handleSubscriptionActive(payload: WebhookPayloadData) {
  const { id, metadata } = payload;
  
  if (!metadata?.userId || !metadata?.planId) {
    throw new Error('Missing userId or planId in subscription metadata');
  }

  // Update subscription status
  const subscription = await getSubscriptionByPolarId(id);
  if (subscription) {
    await updateSubscription(subscription.id, { status: 'active' });
  }

  // Upgrade user tier
  await db
    .update(userTable)
    .set({ 
      tier: metadata.planId as 'pro' | 'business',
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, metadata.userId));

  logger.polar.info('User upgraded tier', { userId: metadata.userId, tier: metadata.planId });
}

/**
 * Handle subscription.canceled event
 * Downgrade user tier
 */
async function handleSubscriptionCanceled(payload: WebhookPayloadData) {
  const { id, metadata, canceledAt } = payload;
  
  if (!metadata?.userId) {
    throw new Error('Missing userId in subscription metadata');
  }

  // Update subscription status
  const subscription = await getSubscriptionByPolarId(id);
  if (subscription) {
    await updateSubscription(subscription.id, { 
      status: 'canceled',
      canceledAt: new Date(canceledAt),
    });
  }

  // Downgrade user to free tier
  await db
    .update(userTable)
    .set({ 
      tier: 'free',
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, metadata.userId));

  logger.polar.info('User downgraded to free tier', { userId: metadata.userId });
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(payload: WebhookPayloadData) {
  const { id, currentPeriodStart, currentPeriodEnd, status, cancelAtPeriodEnd } = payload;
  
  const subscription = await getSubscriptionByPolarId(id);
  if (!subscription) {
    throw new Error(`Subscription not found: ${id}`);
  }

  await updateSubscription(subscription.id, {
    status: (status as 'active' | 'canceled' | 'past_due' | 'trialing') || 'active',
    currentPeriodStart: new Date(currentPeriodStart!),
    currentPeriodEnd: new Date(currentPeriodEnd!),
    cancelAtPeriodEnd: cancelAtPeriodEnd || false,
  });

  logger.polar.info('Subscription updated', { subscriptionId: id });
}

/**
 * Handle order.refunded event
 * Deduct credits from user
 */
async function handleOrderRefunded(payload: WebhookPayloadData) {
  const { id, metadata } = payload;
  
  if (!metadata?.userId) {
    throw new Error('Missing userId in order metadata');
  }

  // Find the original transaction
  const transaction = await getTransactionByPolarOrderId(id);
  if (!transaction) {
    throw new Error(`Transaction not found for order ${id}`);
  }

  // Create refund transaction
  await createTransaction({
    userId: metadata.userId,
    polarOrderId: `${id}-refund`,
    type: 'refund',
    amount: -transaction.amount,
    currency: transaction.currency,
    status: 'completed',
    credits: transaction.credits ? -transaction.credits : null,
    description: `Refund for ${transaction.description}`,
    metadata: payload,
  });

  // Deduct credits if applicable
  if (transaction.credits) {
    await db
      .update(userTable)
      .set({ 
        credits: sql`GREATEST(${userTable.credits} - ${transaction.credits}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, metadata.userId));

    logger.polar.info('Deducted credits from user', { userId: metadata.userId, credits: transaction.credits });
  }

  // Update original transaction status
  await updateTransactionStatus(transaction.id, 'refunded', payload);
}
