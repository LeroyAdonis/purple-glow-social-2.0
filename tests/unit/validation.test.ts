/**
 * Unit Tests: Input Validation
 * 
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  contentGenerationSchema,
  postSchema,
  automationRuleSchema,
  userProfileSchema,
  adminUserUpdateSchema,
  validateRequest,
  formatValidationErrors,
} from '@/lib/security/validation';

describe('Content Generation Schema', () => {
  it('should validate a valid content generation request', () => {
    const validRequest = {
      topic: 'AI in South African businesses',
      platform: 'linkedin',
      tone: 'professional',
      language: 'en',
    };

    const result = validateRequest(contentGenerationSchema, validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topic).toBe('AI in South African businesses');
      expect(result.data.platform).toBe('linkedin');
    }
  });

  it('should reject empty topic', () => {
    const invalidRequest = {
      topic: '',
      platform: 'twitter',
      tone: 'casual',
    };

    const result = validateRequest(contentGenerationSchema, invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject invalid platform', () => {
    const invalidRequest = {
      topic: 'Test topic',
      platform: 'tiktok',
      tone: 'professional',
    };

    const result = validateRequest(contentGenerationSchema, invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should accept all SA languages', () => {
    const languages = ['en', 'af', 'zu', 'xh', 'nso', 'tn', 'st', 'ts', 'ss', 've', 'nr'];
    
    for (const lang of languages) {
      const request = {
        topic: 'Test',
        platform: 'facebook',
        tone: 'casual',
        language: lang,
      };
      const result = validateRequest(contentGenerationSchema, request);
      expect(result.success).toBe(true);
    }
  });

  it('should default to English if language not provided', () => {
    const request = {
      topic: 'Test',
      platform: 'instagram',
      tone: 'humorous',
    };

    const result = validateRequest(contentGenerationSchema, request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('en');
    }
  });
});

describe('Post Schema', () => {
  it('should validate a valid post', () => {
    const validPost = {
      content: 'Lekker day in Joburg! #SouthAfrica',
      platform: 'twitter',
      topic: 'Daily update',
      language: 'en',
    };

    const result = validateRequest(postSchema, validPost);
    expect(result.success).toBe(true);
  });

  it('should reject post with empty content', () => {
    const invalidPost = {
      content: '',
      platform: 'facebook',
    };

    const result = validateRequest(postSchema, invalidPost);
    expect(result.success).toBe(false);
  });

  it('should reject post with content over 5000 chars', () => {
    const invalidPost = {
      content: 'a'.repeat(5001),
      platform: 'linkedin',
    };

    const result = validateRequest(postSchema, invalidPost);
    expect(result.success).toBe(false);
  });

  it('should accept valid scheduled date', () => {
    const postWithSchedule = {
      content: 'Scheduled post',
      platform: 'instagram',
      scheduledDate: '2025-12-25T10:00:00Z',
    };

    const result = validateRequest(postSchema, postWithSchedule);
    expect(result.success).toBe(true);
  });
});

describe('Automation Rule Schema', () => {
  it('should validate a valid automation rule', () => {
    const validRule = {
      coreTopic: 'Tech tips for SA SMEs',
      frequency: 'weekly',
      platforms: ['linkedin', 'twitter'],
      tone: 'professional',
      language: 'en',
    };

    const result = validateRequest(automationRuleSchema, validRule);
    expect(result.success).toBe(true);
  });

  it('should reject rule without platforms', () => {
    const invalidRule = {
      coreTopic: 'Test topic',
      frequency: 'daily',
      platforms: [],
    };

    const result = validateRequest(automationRuleSchema, invalidRule);
    expect(result.success).toBe(false);
  });

  it('should default frequency to weekly', () => {
    const ruleWithoutFrequency = {
      coreTopic: 'Test',
      platforms: ['facebook'],
    };

    const result = validateRequest(automationRuleSchema, ruleWithoutFrequency);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frequency).toBe('weekly');
    }
  });
});

describe('User Profile Schema', () => {
  it('should validate a valid profile update', () => {
    const validProfile = {
      name: 'Thabo Mokoena',
      timezone: 'SAST',
      preferredLanguage: 'zu',
    };

    const result = validateRequest(userProfileSchema, validProfile);
    expect(result.success).toBe(true);
  });

  it('should accept partial updates', () => {
    const partialUpdate = {
      name: 'Updated Name',
    };

    const result = validateRequest(userProfileSchema, partialUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid image URL', () => {
    const invalidProfile = {
      image: 'not-a-url',
    };

    const result = validateRequest(userProfileSchema, invalidProfile);
    expect(result.success).toBe(false);
  });
});

describe('Admin User Update Schema', () => {
  it('should validate a valid admin update', () => {
    const validUpdate = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      tier: 'pro',
      creditAdjustment: 100,
    };

    const result = validateRequest(adminUserUpdateSchema, validUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const invalidUpdate = {
      userId: 'not-a-uuid',
      tier: 'pro',
    };

    const result = validateRequest(adminUserUpdateSchema, invalidUpdate);
    expect(result.success).toBe(false);
  });

  it('should reject credit adjustment over 10000', () => {
    const invalidUpdate = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      creditAdjustment: 15000,
    };

    const result = validateRequest(adminUserUpdateSchema, invalidUpdate);
    expect(result.success).toBe(false);
  });
});

describe('formatValidationErrors', () => {
  it('should format Zod errors correctly', () => {
    const invalidRequest = {
      topic: '',
      platform: 'invalid',
    };

    const result = validateRequest(contentGenerationSchema, invalidRequest);
    expect(result.success).toBe(false);
    
    if (!result.success && result.errors) {
      const formatted = formatValidationErrors(result.errors);
      expect(formatted.message).toBe('Validation failed');
      expect(formatted.details.length).toBeGreaterThan(0);
      expect(formatted.details[0]).toHaveProperty('field');
      expect(formatted.details[0]).toHaveProperty('message');
    }
  });
});
