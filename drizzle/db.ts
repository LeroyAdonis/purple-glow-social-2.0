import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { neon, Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock';

// HTTP client for simple queries (faster, no connection overhead)
const sql = neon(databaseUrl);
export const dbHttp: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

// WebSocket pool client for transactions (required for db.transaction())
const pool = new Pool({ connectionString: databaseUrl });
export const db: NeonDatabase<typeof schema> = drizzleWs(pool, { schema });
