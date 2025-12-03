/**
 * Environment Variable Validation for Production
 * 
 * This module validates critical environment variables at runtime.
 * In production, missing required variables will throw errors.
 * In development, fallbacks are allowed with warnings.
 */

const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.VERCEL_ENV === 'production';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate required environment variables for authentication
 * Throws in production if critical variables are missing
 */
export function validateAuthEnvVars(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // BETTER_AUTH_SECRET - Required in production
  if (!process.env.BETTER_AUTH_SECRET) {
    if (isProduction) {
      errors.push('BETTER_AUTH_SECRET is required in production');
    } else {
      warnings.push('BETTER_AUTH_SECRET not set - using fallback (development only)');
    }
  } else if (process.env.BETTER_AUTH_SECRET.length < 32) {
    if (isProduction) {
      errors.push('BETTER_AUTH_SECRET must be at least 32 characters');
    } else {
      warnings.push('BETTER_AUTH_SECRET is too short (min 32 chars recommended)');
    }
  }

  // BETTER_AUTH_URL - Required in production
  if (!process.env.BETTER_AUTH_URL) {
    if (isProduction) {
      errors.push('BETTER_AUTH_URL is required in production');
    } else {
      warnings.push('BETTER_AUTH_URL not set - using localhost fallback');
    }
  }

  // DATABASE_URL - Required always
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  } else if (!process.env.DATABASE_URL.startsWith('postgresql://') && 
             !process.env.DATABASE_URL.startsWith('postgres://')) {
    if (isProduction) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    } else {
      warnings.push('DATABASE_URL does not appear to be a valid PostgreSQL URL');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('[Auth] Environment warnings:');
    warnings.forEach(w => console.warn(`  ⚠️ ${w}`));
  }

  // Throw in production if there are errors
  if (errors.length > 0) {
    console.error('[Auth] Environment validation failed:');
    errors.forEach(e => console.error(`  ❌ ${e}`));
    
    if (isProduction) {
      throw new Error(
        `Missing required environment variables in production:\n${errors.join('\n')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if OAuth provider credentials are available
 */
export function getAvailableOAuthProviders(): {
  google: boolean;
  twitter: boolean;
} {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
  };
}

/**
 * Get OAuth provider configuration (only if credentials exist)
 */
export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return undefined;
  }
  
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  
  return {
    clientId,
    clientSecret,
    redirectURI: `${baseUrl}/api/auth/callback/google`,
  };
}

/**
 * Get Twitter OAuth configuration (only if credentials exist)
 */
export function getTwitterOAuthConfig() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return undefined;
  }
  
  return {
    clientId,
    clientSecret,
  };
}

/**
 * Log enabled OAuth providers
 */
export function logOAuthStatus(): void {
  const providers = getAvailableOAuthProviders();
  const enabled = Object.entries(providers)
    .filter(([, available]) => available)
    .map(([name]) => name);
  
  if (enabled.length > 0) {
    console.log(`[Auth] OAuth providers enabled: ${enabled.join(', ')}`);
  } else {
    console.log('[Auth] No OAuth providers configured');
  }
}
