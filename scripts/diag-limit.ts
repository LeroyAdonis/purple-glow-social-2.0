/**
 * diag-limit.ts — isolate why the dashboard's user query fails under node-postgres.
 *
 * Drizzle wraps the real error, and the generated SQL shows `limit $2` with the limit sent as a bind
 * parameter. Neon's HTTP driver sends every parameter typed, so that worked; a plain node-postgres bind
 * leaves the type unknown and Postgres can refuse to infer it for LIMIT. This proves which clause breaks
 * by trying each one alone.
 */
import { eq } from "drizzle-orm";

import { user } from "../drizzle/schema";
import { db } from "../lib/db/driver";

async function main() {
  const [first] = await db!.select({ id: user.id }).from(user).limit(1);
  console.log("sample user id:", first?.id ?? "(none)");

  const cases: Array<[string, () => Promise<unknown[]>]> = [
    ["where only", () => db!.select().from(user).where(eq(user.id, first!.id))],
    ["limit only", () => db!.select().from(user).limit(1)],
    ["where + limit", () => db!.select().from(user).where(eq(user.id, first!.id)).limit(1)],
  ];

  for (const [label, run] of cases) {
    try {
      const rows = await run();
      console.log(`  ${label}: OK (${rows.length} rows)`);
    } catch (e: any) {
      const cause = e?.cause ?? e;
      console.log(`  ${label}: FAILED`);
      console.log(`      message: ${String(e?.message).slice(0, 120)}`);
      console.log(`      cause: ${cause?.message ?? cause}`);
      console.log(`      code: ${cause?.code ?? "?"}`);
    }
  }
  process.exit(0);
}

main();
