/**
 * Input Validation Schemas
 * 
 * Zod schemas for validating API request bodies
 */

import { z } from 'zod';

// Common patterns
const platformSchema = z.enum(['facebook', 'instagram', 'twitter', 'linkedin']);
const toneSchema = z.enum(['professional', 'casual', 'humorous', 'inspirational', 'educational']);
const tierSchema = z.enum(['free', 'pro', 'business']);

// Language codes for SA languages
const languageSchema = z.enum([
  'en', 'af', 'zu', 'xh', 'nso', 'tn', 'st', 'ts', 'ss', 've', 'nr'
]);

/**
 * Content Generation Request Schema
 */
export const contentGenerationSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500, 'Topic too long'),
  platform: platformSchema,
  tone: toneSchema,
  language: languageSchema.default('en'),
  includeHashtags: z.boolean().optional().default(true),
  includeEmojis: z.boolean().optional().default(true),
  maxLength: z.number().min(50).max(5000).optional(),
});

export type ContentGenerationRequest = z.infer<typeof contentGenerationSchema>;

/**
 * Post Creation/Update Schema
 */
export const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  platform: platformSchema,
  topic: z.string().max(200).optional(),
  tone: toneSchema.optional(),
  language: languageSchema.default('en'),
  scheduledDate: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']).optional(),
  imageUrl: z.string().url().optional(),
});

export type PostRequest = z.infer<typeof postSchema>;

/**
 * Automation Rule Schema
 */
export const automationRuleSchema = z.object({
  coreTopic: z.string().min(1, 'Topic is required').max(200),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  platforms: z.array(platformSchema).min(1, 'Select at least one platform'),
  tone: toneSchema.default('professional'),
  language: languageSchema.default('en'),
  isActive: z.boolean().default(true),
});

export type AutomationRuleRequest = z.infer<typeof automationRuleSchema>;

/**
 * User Profile Update Schema
 */
export const userProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  timezone: z.string().max(50).optional(),
  preferredLanguage: languageSchema.optional(),
});

export type UserProfileRequest = z.infer<typeof userProfileSchema>;

/**
 * Admin User Update Schema
 */
export const adminUserUpdateSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  tier: tierSchema.optional(),
  creditAdjustment: z.number().int().min(-10000).max(10000).optional(),
  name: z.string().min(1).max(100).optional(),
});

export type AdminUserUpdateRequest = z.infer<typeof adminUserUpdateSchema>;

/**
 * Checkout Session Schema
 */
export const checkoutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;

/**
 * OAuth State Schema
 */
export const oauthStateSchema = z.object({
  platform: platformSchema,
  returnUrl: z.string().url().optional(),
  timestamp: z.number().int().positive(),
});

export type OAuthState = z.infer<typeof oauthStateSchema>;

/**
 * Validate request body against a schema
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for API response
 */
export function formatValidationErrors(errors: z.ZodError): {
  message: string;
  details: Array<{ field: string; message: string }>;
} {
  return {
    message: 'Validation failed',
    details: errors.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}
