import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Enable Neon fetch connection cache for better performance in serverless
neonConfig.fetchConnectionCache = true;

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock';

// HTTP client for simple queries (faster, no connection overhead)
const sql = neon(databaseUrl);
export const dbHttp: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

// WebSocket pool client for transactions (required for db.transaction())
const pool = new Pool({
  connectionString: databaseUrl,
  // Reasonable defaults for serverless environments
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
export const db: NeonDatabase<typeof schema> = drizzleWs(pool, { schema });

/**
 * Simple DB health check utility using a lightweight query.
 * Never throws sensitive errors; returns a structured result.
 */
export async function healthCheck(): Promise<{ ok: boolean; details?: string }> {
  try {
    // Run a minimal query with a short timeout via pool
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    await db.execute(sql`select 1`, { signal: controller.signal } as never);
    clearTimeout(timeout);
    return { ok: true };
  } catch (err) {
    const details = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, details };
  }
}

/**
 * Detect transient Neon errors that are safe to retry.
 */
export function isTransientNeonError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = String((error as any).message || '');
  const code = (error as any).code as string | undefined;
  // Common transient conditions for serverless Postgres
  return (
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('Connection terminated unexpectedly') ||
    msg.includes('Server closed the connection') ||
    code === '57P01' || // admin_shutdown
    code === '57014' || // query_canceled
    code === 'ECONNRESET'
  );
}

/**
 * Wrap a DB operation with a timeout and basic retry on transient errors.
 */
export async function withDbTimeoutRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; timeoutMs?: number } = {}
): Promise<T> {
  const attempts = Math.max(1, opts.attempts ?? 3);
  const timeoutMs = Math.max(1_000, opts.timeoutMs ?? 10_000);

  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // Consumer function can optionally read the signal via closure if needed
      const result = await fn();
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (i < attempts - 1 && isTransientNeonError(err)) {
        // Exponential backoff: 200ms, 400ms
        const delay = 200 * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  // Should be unreachable
  throw lastErr as Error;
}
