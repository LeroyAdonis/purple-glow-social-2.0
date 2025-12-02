/**
 * API Route: Polar Webhooks
 * 
 * POST /api/webhooks/polar
 * Handles incoming webhook events from Polar
 */

import { Webhooks } from '@polar-sh/nextjs';
import { POLAR_CONFIG } from '../../../../lib/polar/config';
import { processWebhookEvent } from '../../../../lib/polar/webhook-service';

export const POST = Webhooks({
  webhookSecret: POLAR_CONFIG.webhookSecret,
  
  // Main payload handler - processes all events
  onPayload: async (payload) => {
    console.log('Received Polar webhook:', payload.type);
    
    try {
      // Generate a unique event ID from type and timestamp
      const eventId = `${payload.type}-${Date.now()}`;
      await processWebhookEvent(
        payload.type,
        eventId,
        payload.data
      );
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Note: We still return success to Polar to avoid retries for unrecoverable errors
      // The error is logged in our database via webhook-events table
    }
  },

  // Granular handlers for specific events (optional - for logging/monitoring)
  onOrderCreated: async (payload) => {
    console.log('Order created:', payload.data.id);
  },

  onOrderPaid: async (payload) => {
    console.log('Order paid:', payload.data.id);
  },

  onSubscriptionCreated: async (payload) => {
    console.log('Subscription created:', payload.data.id);
  },

  onSubscriptionActive: async (payload) => {
    console.log('Subscription activated:', payload.data.id);
  },

  onSubscriptionCanceled: async (payload) => {
    console.log('Subscription canceled:', payload.data.id);
  },

  onOrderRefunded: async (payload) => {
    console.log('Order refunded:', payload.data.id);
  },
});
