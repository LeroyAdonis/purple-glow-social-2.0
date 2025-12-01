/**
 * Unit Tests: Event Tracking
 * 
 * Tests for event tracking utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import {
  trackEvent,
  trackAuth,
  trackContentGeneration,
  trackPostScheduled,
  trackPostPublished,
  trackPayment,
  trackOAuthConnection,
  trackFeatureUsage,
  trackApiError,
} from '@/lib/monitoring/track-event';

describe('trackEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add breadcrumb to Sentry', () => {
    trackEvent({
      name: 'test.event',
      category: 'user',
      properties: { action: 'click' },
    });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'user',
        message: 'test.event',
        data: { action: 'click' },
        level: 'info',
      })
    );
  });

  it('should set error level for error category', () => {
    trackEvent({
      name: 'error.event',
      category: 'error',
    });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
      })
    );
  });
});

describe('trackAuth', () => {
  it('should track login event', () => {
    trackAuth('login', 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'auth.login',
        category: 'user',
      })
    );
  });

  it('should track signup event', () => {
    trackAuth('signup', 'newuser');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'auth.signup',
      })
    );
  });
});

describe('trackContentGeneration', () => {
  it('should track successful content generation', () => {
    trackContentGeneration('linkedin', 'en', 'professional', true, 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'content.generated',
        category: 'business',
        data: expect.objectContaining({
          platform: 'linkedin',
          language: 'en',
          tone: 'professional',
          success: true,
        }),
      })
    );
  });
});

describe('trackPostScheduled', () => {
  it('should track scheduled post with date', () => {
    const scheduledDate = new Date('2025-12-25T10:00:00Z');
    trackPostScheduled('twitter', scheduledDate, 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'post.scheduled',
        data: expect.objectContaining({
          platform: 'twitter',
          scheduledDate: '2025-12-25T10:00:00.000Z',
        }),
      })
    );
  });
});

describe('trackPostPublished', () => {
  it('should track successful post', () => {
    trackPostPublished('instagram', true, undefined, 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'post.published',
        category: 'business',
      })
    );
  });

  it('should track failed post with error message', () => {
    trackPostPublished('facebook', false, 'Token expired', 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'post.failed',
        category: 'error',
        data: expect.objectContaining({
          errorMessage: 'Token expired',
        }),
      })
    );
  });
});

describe('trackPayment', () => {
  it('should track successful subscription', () => {
    trackPayment('subscription', 299, 'ZAR', true, 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'payment.subscription',
        data: expect.objectContaining({
          amount: 299,
          currency: 'ZAR',
          success: true,
        }),
      })
    );
  });

  it('should track credit purchase', () => {
    trackPayment('credits', 99, 'ZAR', true);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'payment.credits',
      })
    );
  });
});

describe('trackOAuthConnection', () => {
  it('should track successful connection', () => {
    trackOAuthConnection('linkedin', 'connected', undefined, 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'oauth.connected',
        category: 'user',
      })
    );
  });

  it('should track failed connection as error', () => {
    trackOAuthConnection('twitter', 'failed', 'Invalid callback', 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'oauth.failed',
        category: 'error',
      })
    );
  });
});

describe('trackApiError', () => {
  it('should track API error and send to Sentry', () => {
    trackApiError('/api/posts', 'POST', 500, 'Internal server error', 'user123');

    expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'API Error: POST /api/posts',
      expect.objectContaining({
        level: 'error',
        tags: expect.objectContaining({
          statusCode: '500',
        }),
      })
    );
  });

  it('should use warning level for 4xx errors', () => {
    trackApiError('/api/auth', 'GET', 401, 'Unauthorized');

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        level: 'warning',
      })
    );
  });
});

describe('trackFeatureUsage', () => {
  it('should track feature usage with metadata', () => {
    trackFeatureUsage('ai-generator', 'generate', 'user123', {
      platform: 'twitter',
      tone: 'casual',
    });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'feature.ai-generator.generate',
        data: expect.objectContaining({
          feature: 'ai-generator',
          action: 'generate',
          platform: 'twitter',
        }),
      })
    );
  });
});
