# QUICK FIX - Copy this SQL to Neon Dashboard

## Go to: https://console.neon.tech/
## Project: ep-sweet-smoke-aeixni9b
## Click: SQL Editor
## Paste and Run the migration SQL from: drizzle/migrations/0000_lazy_sister_grimm.sql

---

## After running, verify with this query:

SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

## Expected tables:
- account
- automation_rules  
- connected_account
- posts
- session           <-- THIS IS THE KEY ONE
- subscriptions
- transactions
- user
- verification
- webhook_events

## Check session table structure:

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session'
ORDER BY ordinal_position;

## Expected 8 columns:
1. id - text
2. expires_at - timestamp without time zone
3. token - text
4. created_at - timestamp without time zone
5. updated_at - timestamp without time zone
6. ip_address - text
7. user_agent - text
8. user_id - text

---

## Then restart dev server:
npm run dev

## Test by visiting:
http://localhost:3000/login

No more "Failed query" errors should appear!
