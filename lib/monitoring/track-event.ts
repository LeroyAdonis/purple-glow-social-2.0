/**
 * Event Tracking Utilities
 * 
 * Track user interactions and business events
 */

import * as Sentry from '@sentry/nextjs';

interface TrackEvent {
  name: string;
  category: 'user' | 'system' | 'business' | 'error';
  properties?: Record<string, any>;
  userId?: string;
}

/**
 * Track a custom event
 */
export function trackEvent(event: TrackEvent) {
  // Log event
  console.log(`[EVENT] ${event.category}/${event.name}`, event.properties);
  
  // Send to Sentry as breadcrumb
  Sentry.addBreadcrumb({
    category: event.category,
    message: event.name,
    data: event.properties,
    level: event.category === 'error' ? 'error' : 'info',
  });
}

// Pre-defined event trackers for common actions

/**
 * Track user authentication events
 */
export function trackAuth(action: 'login' | 'logout' | 'signup' | 'password_reset', userId?: string) {
  trackEvent({
    name: `auth.${action}`,
    category: 'user',
    userId,
    properties: {
      action,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track content generation events
 */
export function trackContentGeneration(
  platform: string,
  language: string,
  tone: string,
  success: boolean,
  userId?: string
) {
  trackEvent({
    name: 'content.generated',
    category: 'business',
    userId,
    properties: {
      platform,
      language,
      tone,
      success,
    },
  });
}

/**
 * Track post scheduling events
 */
export function trackPostScheduled(
  platform: string,
  scheduledDate: Date,
  userId?: string
) {
  trackEvent({
    name: 'post.scheduled',
    category: 'business',
    userId,
    properties: {
      platform,
      scheduledDate: scheduledDate.toISOString(),
    },
  });
}

/**
 * Track post publishing events
 */
export function trackPostPublished(
  platform: string,
  success: boolean,
  errorMessage?: string,
  userId?: string
) {
  trackEvent({
    name: success ? 'post.published' : 'post.failed',
    category: success ? 'business' : 'error',
    userId,
    properties: {
      platform,
      success,
      errorMessage,
    },
  });
}

/**
 * Track payment events
 */
export function trackPayment(
  type: 'subscription' | 'credits' | 'refund',
  amount: number,
  currency: string,
  success: boolean,
  userId?: string
) {
  trackEvent({
    name: `payment.${type}`,
    category: 'business',
    userId,
    properties: {
      type,
      amount,
      currency,
      success,
    },
  });
}

/**
 * Track OAuth connection events
 */
export function trackOAuthConnection(
  platform: string,
  action: 'connected' | 'disconnected' | 'failed',
  errorMessage?: string,
  userId?: string
) {
  trackEvent({
    name: `oauth.${action}`,
    category: action === 'failed' ? 'error' : 'user',
    userId,
    properties: {
      platform,
      action,
      errorMessage,
    },
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  action: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  trackEvent({
    name: `feature.${feature}.${action}`,
    category: 'user',
    userId,
    properties: {
      feature,
      action,
      ...metadata,
    },
  });
}

/**
 * Track API errors
 */
export function trackApiError(
  endpoint: string,
  method: string,
  statusCode: number,
  errorMessage: string,
  userId?: string
) {
  trackEvent({
    name: 'api.error',
    category: 'error',
    userId,
    properties: {
      endpoint,
      method,
      statusCode,
      errorMessage,
    },
  });
  
  // Also capture in Sentry
  Sentry.captureMessage(`API Error: ${method} ${endpoint}`, {
    level: statusCode >= 500 ? 'error' : 'warning',
    tags: {
      endpoint,
      method,
      statusCode: String(statusCode),
    },
    extra: {
      errorMessage,
    },
  });
}
