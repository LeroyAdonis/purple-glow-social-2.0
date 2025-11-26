import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL;

// Create a safe connection that won't crash at build time if env var is missing
const sql = databaseUrl ? neon(databaseUrl) : neon('postgresql://mock:mock@localhost:5432/mock');

export const db = drizzle(sql, { schema });
