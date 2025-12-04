import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../drizzle/schema";
import {
  validateAuthEnvVars,
  getGoogleOAuthConfig,
  getTwitterOAuthConfig,
  logOAuthStatus
} from "./config/env-validation";
import { getTrustedOrigins } from "./config/urls";
import { logger } from "./logger";

// Validate environment variables at startup
validateAuthEnvVars();

// Log OAuth provider status
logOAuthStatus();

// Only initialize database if DATABASE_URL is a real connection string
const isDatabaseConfigured = process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('mock') &&
  (process.env.DATABASE_URL.startsWith('postgresql://') ||
    process.env.DATABASE_URL.startsWith('postgres://'));

let db: NeonHttpDatabase<typeof schema> | undefined;
if (isDatabaseConfigured) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
    logger.auth.info('Database connected successfully');
  } catch (error) {
    logger.auth.exception(error, { action: 'database-connection' });
  }
}

// Get OAuth configurations (returns undefined if credentials not available)
const googleConfig = getGoogleOAuthConfig();
const twitterConfig = getTwitterOAuthConfig();

// Build social providers object conditionally
const socialProviders: Record<string, unknown> = {};
if (googleConfig) {
  socialProviders.google = googleConfig;
}
if (twitterConfig) {
  socialProviders.twitter = twitterConfig;
}

// Build trusted origins from environment using centralized utility
const trustedOrigins = getTrustedOrigins();

// Determine base URL for production
const getAuthBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for production Vercel deployment
  if (process.env.VERCEL) {
    return 'https://purple-glow-social-2-0.vercel.app';
  }
  return 'http://localhost:3000';
};

// ⚠️ CRITICAL: Vercel Cookie Configuration
// The .vercel.app domain is on the Public Suffix List, which causes browsers
// to reject cookies with __Secure- prefix. This breaks authentication silently.
// DO NOT remove this check - login will appear to work but sessions won't persist!
// See: AGENTS.md and .github/copilot-instructions.md for full documentation.
const isVercelSharedDomain = process.env.VERCEL_URL?.includes('.vercel.app') || 
                              process.env.VERCEL === '1';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development",
  baseURL: getAuthBaseURL(),
  basePath: "/api/auth",
  trustedOrigins: trustedOrigins,
  // ⚠️ CRITICAL: Cookie configuration for Vercel's shared domain
  // Disabling __Secure- prefix is REQUIRED for .vercel.app to work!
  advanced: {
    // Disable __Secure- prefix on .vercel.app (Public Suffix List domain)
    useSecureCookies: !isVercelSharedDomain && process.env.NODE_ENV === 'production',
    // Cross-site cookie settings
    cookiePrefix: "better-auth",
  },
  database: isDatabaseConfigured && db ? drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }) : undefined as unknown as ReturnType<typeof drizzleAdapter>, // Mock mode - auth won't work but won't crash
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for easier testing
  },
  socialProviders: Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
  user: {
    additionalFields: {
      tier: {
        type: "string",
        defaultValue: "free",
      },
      credits: {
        type: "number",
        defaultValue: 10,
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

// Export OAuth availability for frontend use
export const oauthProviders = {
  google: Boolean(googleConfig),
  twitter: Boolean(twitterConfig),
};
