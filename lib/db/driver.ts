/**
 * One place that decides how Drizzle talks to Postgres.
 *
 * The app was written against Neon's serverless HTTP driver in three separate files, which quietly made
 * the product unable to run anywhere except Neon. The HTTP driver does not open a TCP connection: it
 * POSTs to https://api.<host>/sql, so against any ordinary Postgres it fails with
 * "Failed to parse URL from https://api.0.0.1/sql". That blocked self-hosting, a local demo, and any
 * future move off Neon — all of which need the same fix, so the choice lives here rather than being
 * copy-pasted into three files that can drift.
 *
 * Neon URLs keep the HTTP driver, which is correct on serverless runtimes with no TCP pool. Everything
 * else uses node-postgres over TCP with a small pool.
 *
 * The pool is a module-level singleton on purpose: importing this from three modules must not create
 * three pools.
 */
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "../../drizzle/schema";

const url = process.env.DATABASE_URL ?? "";

export const isDatabaseConfigured =
  Boolean(url) && !url.includes("mock") && /^postgres(ql)?:\/\//.test(url);

/** Both drivers expose the same query builder surface, so callers get one stable type. */
export type AppDb = NodePgDatabase<typeof schema>;

function createDb(connectionString: string): AppDb {
  if (connectionString.includes("neon.tech")) {
    return drizzleHttp(neon(connectionString), { schema }) as unknown as AppDb;
  }
  const pool = new Pool({ connectionString, max: 10 });
  // A pool that dies silently turns into "the app is broken" with no clue in the logs.
  pool.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });
  return drizzleNode(pool, { schema }) as AppDb;
}

export const db: AppDb | undefined = isDatabaseConfigured ? createDb(url) : undefined;

export const dbDriver = url.includes("neon.tech") ? "neon-http" : "node-postgres";
