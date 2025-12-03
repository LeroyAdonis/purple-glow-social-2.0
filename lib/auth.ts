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
    console.log('[Auth] Database connected successfully');
  } catch (error) {
    console.error('[Auth] Database connection failed:', error);
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

// Build trusted origins from environment
const trustedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  process.env.BETTER_AUTH_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "https://purple-glow-social-2-0.vercel.app", // Keep for backwards compatibility
].filter((origin): origin is string => Boolean(origin));

// Remove duplicates
const uniqueTrustedOrigins = [...new Set(trustedOrigins)];

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: uniqueTrustedOrigins,
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