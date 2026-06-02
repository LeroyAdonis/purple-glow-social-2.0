/**
 * Unit Tests: Event Tracking
 * 
 * Tests for event tracking utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';
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

  it('should log event with category and name', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});

    trackEvent({
      name: 'test.event',
      category: 'user',
      properties: { action: 'click' },
    });

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('user/test.event'),
      expect.any(Object)
    );
  });

  it('should set error level for error category', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});

    trackEvent({
      name: 'error.event',
      category: 'error',
      properties: { code: 500 },
    });

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('error/error.event'),
      expect.any(Object)
    );
  });
});

describe('trackAuth', () => {
  it('should track login event', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackAuth('login', 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('auth.login'),
      expect.objectContaining({ action: 'login' })
    );
  });

  it('should track signup event', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackAuth('signup', 'newuser');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('auth.signup'),
      expect.any(Object)
    );
  });
});

describe('trackContentGeneration', () => {
  it('should track successful content generation', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackContentGeneration('linkedin', 'en', 'professional', true, 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('content.generated'),
      expect.objectContaining({
        platform: 'linkedin',
        language: 'en',
        tone: 'professional',
        success: true,
      })
    );
  });
});

describe('trackPostScheduled', () => {
  it('should track scheduled post with date', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    const scheduledDate = new Date('2025-12-25T10:00:00Z');
    trackPostScheduled('twitter', scheduledDate, 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('post.scheduled'),
      expect.objectContaining({
        platform: 'twitter',
        scheduledDate: '2025-12-25T10:00:00.000Z',
      })
    );
  });
});

describe('trackPostPublished', () => {
  it('should track successful post', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackPostPublished('instagram', true, undefined, 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('post.published'),
      expect.objectContaining({ platform: 'instagram', success: true })
    );
  });

  it('should track failed post with error message', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackPostPublished('facebook', false, 'Token expired', 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('post.failed'),
      expect.objectContaining({ platform: 'facebook', errorMessage: 'Token expired' })
    );
  });
});

describe('trackPayment', () => {
  it('should track successful subscription', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackPayment('subscription', 299, 'ZAR', true, 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('payment.subscription'),
      expect.objectContaining({ amount: 299, currency: 'ZAR', success: true })
    );
  });

  it('should track credit purchase', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackPayment('credits', 99, 'ZAR', true);

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('payment.credits'),
      expect.any(Object)
    );
  });
});

describe('trackOAuthConnection', () => {
  it('should track successful connection', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackOAuthConnection('linkedin', 'connected', undefined, 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('oauth.connected'),
      expect.objectContaining({ platform: 'linkedin', action: 'connected' })
    );
  });

  it('should track failed connection as error', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackOAuthConnection('twitter', 'failed', 'Invalid callback', 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('oauth.failed'),
      expect.objectContaining({ platform: 'twitter', action: 'failed' })
    );
  });
});

describe('trackApiError', () => {
  it('should track API error', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackApiError('/api/posts', 'POST', 500, 'Internal server error', 'user123');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('api.error'),
      expect.objectContaining({
        endpoint: '/api/posts',
        method: 'POST',
        statusCode: 500,
      })
    );
  });
});

describe('trackFeatureUsage', () => {
  it('should track feature usage with metadata', () => {
    const debugSpy = vi.spyOn(logger.api, 'debug').mockImplementation(() => {});
    trackFeatureUsage('ai-generator', 'generate', 'user123', {
      platform: 'twitter',
      tone: 'casual',
    });

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('feature.ai-generator.generate'),
      expect.objectContaining({
        feature: 'ai-generator',
        action: 'generate',
        platform: 'twitter',
      })
    );
  });
});
