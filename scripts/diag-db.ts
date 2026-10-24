/**
 * diag-db.ts — run the dashboard's failing query through the app's own db layer and print the real cause.
 *
 * Drizzle wraps every failure in "Failed query: <sql>", which hides the actual Postgres error. The cause
 * is on error.cause, so a diagnostic that only prints error.message reports nothing useful.
 */
import { db } from "../lib/db/driver";
import { user, posts } from "../drizzle/schema";

async function main() {
  console.log("driver:", process.env.DATABASE_URL?.includes("neon.tech") ? "neon-http" : "node-postgres");
  console.log("db present:", Boolean(db));

  try {
    const rows = await db!.select().from(user).limit(1);
    console.log("user select OK, rows:", rows.length);
  } catch (e: any) {
    console.log("\nuser select FAILED");
    console.log("  message:", e?.message?.slice(0, 200));
    console.log("  cause:", e?.cause?.message ?? e?.cause ?? "(no cause)");
    console.log("  code:", e?.cause?.code ?? e?.code);
    console.log("  detail:", e?.cause?.detail ?? "");
  }

  try {
    const rows = await db!.select().from(posts).limit(1);
    console.log("\nposts select OK, rows:", rows.length);
  } catch (e: any) {
    console.log("\nposts select FAILED");
    console.log("  message:", e?.message?.slice(0, 200));
    console.log("  cause:", e?.cause?.message ?? e?.cause ?? "(no cause)");
    console.log("  code:", e?.cause?.code ?? e?.code);
    console.log("  detail:", e?.cause?.detail ?? "");
  }
  process.exit(0);
}

main();
