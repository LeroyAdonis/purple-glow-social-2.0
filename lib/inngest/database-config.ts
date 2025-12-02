/**
 * Inngest Database Configuration Utility
 *
 * Sets up Inngest configuration in the Neon database for event triggering
 */

import { db } from "../../drizzle/db";

export async function configureInngestDatabase(
  inngestUrl?: string,
  signingKey?: string
) {
  console.log(
    "ℹ️  Inngest database configuration should be done via environment variables:"
  );
  console.log("   INNGEST_SIGNING_KEY - for webhook signature verification");
  console.log(
    "   INNGEST_EVENT_API_URL - optional, defaults to app.inngest.com"
  );
  console.log("");

  return {
    success: true,
    message: "Configuration handled via environment variables",
    inngestUrl: inngestUrl || "https://app.inngest.com/api/v1/events",
    signingKeyConfigured: !!signingKey,
  };
}

export async function testInngestConnection() {
  console.log("ℹ️  Inngest connection testing requires database access.");
  console.log(
    "   Test by creating/updating database records and checking Inngest dashboard."
  );
  console.log("");

  return { success: true, message: "Test manually via database operations" };
}

export async function listInngestTriggers() {
  console.log("ℹ️  Inngest triggers are created by the migration:");
  console.log("   - posts_inngest_trigger (on posts table)");
  console.log(
    "   - credit_reservations_inngest_trigger (on credit_reservations table)"
  );
  console.log("   - user_credits_inngest_trigger (on user table)");
  console.log("");

  return {
    success: true,
    triggers: [
      { event_object_table: "posts", trigger_name: "posts_inngest_trigger" },
      {
        event_object_table: "credit_reservations",
        trigger_name: "credit_reservations_inngest_trigger",
      },
      {
        event_object_table: "user",
        trigger_name: "user_credits_inngest_trigger",
      },
    ],
  };
}
