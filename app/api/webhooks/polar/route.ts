/**
 * API Route: Polar Webhooks
 * 
 * POST /api/webhooks/polar
 * Handles incoming webhook events from Polar
 */

import { Webhooks } from '@polar-sh/nextjs';
import { POLAR_CONFIG } from '../../../../lib/polar/config';
import { processWebhookEvent } from '../../../../lib/polar/webhook-service';
import { logger } from '../../../../lib/logger';

export const POST = Webhooks({
  webhookSecret: POLAR_CONFIG.webhookSecret,
  
  // Main payload handler - processes all events
  onPayload: async (payload) => {
    logger.polar.info('Received Polar webhook', { type: payload.type });
    
    try {
      // Generate a unique event ID from type and timestamp
      const eventId = `${payload.type}-${Date.now()}`;
      // Cast through unknown to handle Polar's various payload types
      await processWebhookEvent(
        payload.type,
        eventId,
        payload.data as unknown as Parameters<typeof processWebhookEvent>[2]
      );
    } catch (error) {
      logger.polar.exception(error, { webhookType: payload.type });
      // Note: We still return success to Polar to avoid retries for unrecoverable errors
      // The error is logged in our database via webhook-events table
    }
  },

  // Granular handlers for specific events (optional - for logging/monitoring)
  onOrderCreated: async (payload) => {
    logger.polar.info('Order created', { orderId: payload.data.id });
  },

  onOrderPaid: async (payload) => {
    logger.polar.info('Order paid', { orderId: payload.data.id });
  },

  onSubscriptionCreated: async (payload) => {
    logger.polar.info('Subscription created', { subscriptionId: payload.data.id });
  },

  onSubscriptionActive: async (payload) => {
    logger.polar.info('Subscription activated', { subscriptionId: payload.data.id });
  },

  onSubscriptionCanceled: async (payload) => {
    logger.polar.info('Subscription canceled', { subscriptionId: payload.data.id });
  },

  onOrderRefunded: async (payload) => {
    logger.polar.info('Order refunded', { orderId: payload.data.id });
  },
});
