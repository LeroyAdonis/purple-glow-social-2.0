import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../drizzle/schema";

// Only initialize database if DATABASE_URL is a real connection string
const isDatabaseConfigured = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('mock') &&
  process.env.DATABASE_URL.startsWith('postgresql://');

let db: any;
if (isDatabaseConfigured) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
    console.log('[Auth] Database connected successfully');
  } catch (error) {
    console.error('[Auth] Database connection failed:', error);
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
  database: isDatabaseConfigured && db ? drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }) : undefined as any, // Mock mode - auth won't actually work but won't crash
  emailAndPassword: {  
    enabled: true,
    requireEmailVerification: false, // Disable for easier testing
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-secret",
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || "mock-twitter-id",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "mock-twitter-secret",
    }
  },
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