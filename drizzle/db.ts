/**
 * The app's primary database entry point.
 *
 * This file used to open two Neon clients itself: an HTTP client for simple queries and a Neon WebSocket
 * pool for transactions. Both are Neon-only, so every API route that imports `db` from here failed
 * against any ordinary Postgres with Drizzle's opaque "Failed query: ..." wrapper. That is what kept the
 * app locked to one vendor.
 *
 * Driver selection now lives in lib/db/driver.ts, which keeps the Neon HTTP driver for Neon URLs and uses
 * node-postgres everywhere else. Both exports below point at that single connection so callers do not
 * change, and the helper functions keep working.
 */
import { sql } from "drizzle-orm";

import * as schema from "./schema";
import { db as sharedDb, isDatabaseConfigured } from "../lib/db/driver";

if (!isDatabaseConfigured || !sharedDb) {
  throw new Error(
    "DATABASE_URL is not set to a postgres connection string. The app cannot start without a database; " +
      "check the environment rather than falling back to a mock client, which used to fail later and " +
      "less clearly.",
  );
}

/** Primary client. Kept named `db` because every route imports it. */
export const db = sharedDb;

/** Historical HTTP client. Same connection now: a second client with different semantics was the bug. */
export const dbHttp = sharedDb;

export { schema };

/**
 * Simple DB health check utility using a lightweight query.
 * Never throws sensitive errors; returns a structured result.
 */
export async function healthCheck(): Promise<{ ok: boolean; details?: string }> {
  try {
    await db.execute(sql`select 1`);
    return { ok: true };
  } catch (err) {
    const details = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, details };
  }
}

/**
 * Detect transient connection errors that are safe to retry. Named for Neon historically; the conditions
 * are generic connection failures, which is why it still applies to a plain Postgres pool.
 */
export function isTransientNeonError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const msg = String((error as any).message || "");
  const code = (error as any).code as string | undefined;
  return (
    msg.includes("timeout") ||
    msg.includes("aborted") ||
    msg.includes("Connection terminated unexpectedly") ||
    msg.includes("Server closed the connection") ||
    code === "57P01" || // admin_shutdown
    code === "57014" || // query_canceled
    code === "ECONNRESET"
  );
}

/**
 * Wrap a DB operation with a timeout and basic retry on transient errors.
 */
export async function withDbTimeoutRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; timeoutMs?: number } = {},
): Promise<T> {
  const attempts = Math.max(1, opts.attempts ?? 3);
  const timeoutMs = Math.max(1_000, opts.timeoutMs ?? 10_000);

  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await fn();
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (i < attempts - 1 && isTransientNeonError(err)) {
        const delay = 200 * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastErr as Error;
}
