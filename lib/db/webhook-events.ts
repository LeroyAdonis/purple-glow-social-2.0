/**
 * Database Service: Webhook Events
 * 
 * Handles all database operations related to webhook event processing
 */

import { db } from '../../drizzle/db';
import { webhookEvents, type WebhookEvent, type NewWebhookEvent } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Create a new webhook event record
 */
export async function createWebhookEvent(data: NewWebhookEvent): Promise<WebhookEvent> {
  const [event] = await db.insert(webhookEvents).values(data).returning();
  return event;
}

/**
 * Check if webhook event already exists (for idempotency)
 */
export async function webhookEventExists(eventId: string): Promise<boolean> {
  const [event] = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId))
    .limit(1);
  
  return !!event;
}

/**
 * Mark webhook event as processed
 */
export async function markEventProcessed(eventId: string): Promise<WebhookEvent> {
  const [event] = await db
    .update(webhookEvents)
    .set({
      status: 'processed',
      processedAt: new Date(),
    })
    .where(eq(webhookEvents.eventId, eventId))
    .returning();
  
  return event;
}

/**
 * Mark webhook event as failed
 */
export async function markEventFailed(
  eventId: string,
  errorMessage: string,
  retryCount?: number
): Promise<WebhookEvent> {
  const updateData: Partial<NewWebhookEvent> = {
    status: 'failed',
    errorMessage,
  };

  if (retryCount !== undefined) {
    updateData.retryCount = retryCount;
  }

  const [event] = await db
    .update(webhookEvents)
    .set(updateData)
    .where(eq(webhookEvents.eventId, eventId))
    .returning();
  
  return event;
}

/**
 * Get unprocessed webhook events (for retry logic)
 */
export async function getUnprocessedEvents(limit: number = 10): Promise<WebhookEvent[]> {
  return await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.status, 'pending'))
    .limit(limit);
}

/**
 * Get webhook event by Polar event ID
 */
export async function getWebhookEventByEventId(eventId: string): Promise<WebhookEvent | null> {
  const [event] = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId))
    .limit(1);
  
  return event || null;
}
