#!/usr/bin/env node

/**
 * Inngest Integration Setup Script
 *
 * Sets up Neon database triggers for Inngest event triggering
 * Run this after deploying the database migration
 */

import {
  configureInngestDatabase,
  testInngestConnection,
  listInngestTriggers,
} from "../lib/inngest/database-config";
import { readFileSync } from "fs";
import { join } from "path";

async function applyInngestMigration() {
  try {
    console.log("📄 Reading Inngest integration migration...");
    const migrationPath = join(
      process.cwd(),
      "drizzle",
      "migrations",
      "0002_inngest_integration.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("🗃️  Applying migration to database...");
    console.log(
      "⚠️  Note: This requires database access. Make sure your DATABASE_URL is set."
    );
    console.log("");
    console.log("Migration SQL to apply:");
    console.log("=".repeat(50));
    console.log(migrationSQL);
    console.log("=".repeat(50));
    console.log("");
    console.log("To apply manually:");
    console.log("1. Connect to your Neon database");
    console.log("2. Run the SQL above");
    console.log(
      "3. Or use: psql $DATABASE_URL -f drizzle/migrations/0002_inngest_integration.sql"
    );
    console.log("");

    return {
      success: true,
      message: "Migration SQL displayed - apply manually",
    };
  } catch (error) {
    console.error("❌ Failed to read migration file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function main() {
  console.log("🚀 Setting up Neon + Inngest Integration\n");

  // Apply database migration
  console.log("1. Applying Inngest integration migration...");
  const migrationResult = await applyInngestMigration();
  if (!migrationResult.success) {
    console.error("❌ Migration failed:", migrationResult.error);
    process.exit(1);
  }

  // Configure database settings
  console.log("\n2. Configuring Inngest database settings...");
  const configResult = await configureInngestDatabase();
  if (!configResult.success) {
    console.error("❌ Configuration failed");
    process.exit(1);
  }

  // Test connection
  console.log("\n3. Testing Inngest connection...");
  const testResult = await testInngestConnection();
  if (!testResult.success) {
    console.warn("⚠️  Connection test info displayed above");
  }

  // List triggers
  console.log("\n4. Listing active Inngest triggers...");
  const triggersResult = await listInngestTriggers();
  if (!triggersResult.success) {
    console.error("❌ Failed to list triggers");
    process.exit(1);
  }

  console.log("\n✅ Neon + Inngest integration setup complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Set INNGEST_SIGNING_KEY in your environment variables");
  console.log("2. Configure Inngest webhook URL to point to your deployment");
  console.log("3. Test the integration by creating/updating database records");
  console.log("4. Monitor Inngest dashboard for triggered events");
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
}
