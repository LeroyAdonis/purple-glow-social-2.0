/**
 * Environment Configuration & Validation
 * 
 * Validates required environment variables and provides typed access
 */

import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication (required)
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url('NEXT_PUBLIC_BETTER_AUTH_URL must be a valid URL'),
  
  // Google OAuth (optional, but required for Google login)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Social Media OAuth (optional)
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  
  // AI (optional but recommended)
  GEMINI_API_KEY: z.string().optional(),
  
  // Payments (optional)
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_ORGANIZATION_ID: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  
  // Security
  TOKEN_ENCRYPTION_KEY: z.string().length(64, 'TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)').optional(),
  CRON_SECRET: z.string().optional(),
  
  // Monitoring (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Rate Limiting (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Storage (optional)
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  
  // Admin
  ADMIN_EMAILS: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    
    // In production, throw an error
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration');
    }
    
    // In development, warn but continue
    console.warn('⚠️ Continuing with invalid environment configuration in development mode');
  }
  
  return parsed.data as Env;
}

/**
 * Get environment variable with type safety
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  return process.env[key] as Env[K];
}

/**
 * Check if a feature is enabled based on environment variables
 */
export const features = {
  // Google OAuth enabled
  googleAuth: () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  
  // Social platform OAuth enabled
  facebookOAuth: () => !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
  twitterOAuth: () => !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
  linkedinOAuth: () => !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
  
  // AI features enabled
  aiGeneration: () => !!process.env.GEMINI_API_KEY,
  
  // Payments enabled
  payments: () => !!(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_ORGANIZATION_ID),
  
  // Monitoring enabled
  sentry: () => !!(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
  
  // Rate limiting enabled
  rateLimiting: () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  
  // Token encryption enabled
  tokenEncryption: () => !!process.env.TOKEN_ENCRYPTION_KEY,
};

/**
 * Get feature status summary
 */
export function getFeatureStatus(): Record<string, boolean> {
  return {
    googleAuth: features.googleAuth(),
    facebookOAuth: features.facebookOAuth(),
    twitterOAuth: features.twitterOAuth(),
    linkedinOAuth: features.linkedinOAuth(),
    aiGeneration: features.aiGeneration(),
    payments: features.payments(),
    sentry: features.sentry(),
    rateLimiting: features.rateLimiting(),
    tokenEncryption: features.tokenEncryption(),
  };
}
