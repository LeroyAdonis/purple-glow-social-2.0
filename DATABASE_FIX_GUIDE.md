# DATABASE CONNECTION FIX GUIDE

## Problem
The middleware is failing with: "Failed query: select ... from session"
This happens because the session table doesn't exist in the database yet.

## Root Cause
Neon database migrations haven't been applied. The connection is timing out because:
1. Using pooler connection string with drizzle-kit (needs direct connection)
2. Possible network/firewall blocking direct connections

## Solutions

### Option 1: Apply Schema via Neon Dashboard (RECOMMENDED)
1. Go to https://console.neon.tech/
2. Select your project: ep-sweet-smoke-aeixni9b
3. Go to SQL Editor
4. Run the migration SQL from: drizzle/migrations/0000_lazy_sister_grimm.sql
5. Verify tables exist with: SELECT tablename FROM pg_tables WHERE schemaname = 'public';

### Option 2: Use Direct Connection (if network allows)
1. Get direct connection string from Neon dashboard (remove '-pooler' from hostname)
2. Update .env temporarily:
   DATABASE_URL=postgresql://neondb_owner:npg_0MfIQkP3zYoZ@ep-sweet-smoke-aeixni9b.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
3. Run: npm run db:push
4. Restore pooler connection after migration

### Option 3: Use Drizzle Studio (if accessible)
1. Update DATABASE_URL to direct connection
2. Run: npm run db:studio
3. Apply schema changes through the UI

## Verification
After applying migrations, verify with:
\\\sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session';
\\\

Expected columns:
- id (text)
- expires_at (timestamp)
- token (text)
- created_at (timestamp)
- updated_at (timestamp)
- ip_address (text)
- user_agent (text)
- user_id (text)

## Middleware Note
The middleware.ts file is already correct for Next.js 16. The warning about 'proxy' is informational - 
middleware.ts still works. The export named 'middleware' is the correct pattern.
