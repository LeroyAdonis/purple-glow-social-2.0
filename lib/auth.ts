import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../drizzle/schema";

// Only initialize database if DATABASE_URL is a real connection string
const isDatabaseConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock');

let db: any;
if (isDatabaseConfigured) {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema });
}

export const auth = betterAuth({
  database: isDatabaseConfigured ? drizzleAdapter(db, {
    provider: "pg", 
    schema: schema,
  }) : undefined as any, // Mock mode - auth won't actually work but won't crash
  emailAndPassword: {  
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-secret",
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
      }
    }
  }
});