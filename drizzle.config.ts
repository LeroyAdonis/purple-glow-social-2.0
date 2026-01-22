import type { Config } from "drizzle-kit";

// For migrations and schema operations, use direct connection (non-pooler)
// Pooler connections can cause timeouts with drizzle-kit
const getDatabaseUrl = () => {
  // Prefer direct connection URL if provided
  const directUrl = process.env.DATABASE_URL_DIRECT;
  if (directUrl) {
    console.log('✅ Using database URL: DIRECT connection (from DATABASE_URL_DIRECT)');
    return directUrl;
  }
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  
  // If using Neon pooler, convert to direct connection for migrations
  if (url.includes('-pooler.')) {
    const converted = url.replace('-pooler.', '.');
    console.log('🔄 Using database URL: DIRECT connection (converted from pooler)');
    console.log(`   Original: ${url.substring(0, 50)}...`);
    console.log(`   Converted: ${converted.substring(0, 50)}...`);
    return converted;
  }
  
  console.log('ℹ️  Using database URL: As provided (no conversion needed)');
  return url;
};

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
} satisfies Config;
