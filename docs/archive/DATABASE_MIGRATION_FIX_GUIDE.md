# 🔧 Database Migration Troubleshooting Guide

## Problem Summary
Migrations are failing with "type already exists" errors because Drizzle is attempting to re-run all migrations instead of just tracking them properly.

## Root Cause
The migration tracking table (`drizzle.__drizzle_migrations`) may be missing, corrupted, or out of sync with the actual database state.

---

## ✅ Quick Fix Options (Choose One)

### Option 1: Diagnostic Check First (Recommended)
```bash
pnpm run db:check
```
This will show you:
- Whether migration tracking table exists
- What migrations are recorded
- What tables actually exist
- If pkce_verifiers table is missing

### Option 2: Create Missing Table Manually
If `pkce_verifiers` table is missing:
```bash
pnpm run db:fix-pkce
```

### Option 3: Reset Migration Tracking
If migration tracking is corrupted:
```bash
pnpm run db:reset-migrations
```
This will:
- Create/ensure migration tracking table exists
- Mark all existing migrations as applied
- Sync tracking with actual database state

### Option 4: Use db:push Instead of Migrate
Skip migrations entirely and sync schema directly:
```bash
pnpm run db:push
```
⚠️ Warning: This bypasses migration history

---

## 🛠️ Step-by-Step Solution

### Step 1: Check Current State
```bash
pnpm run db:check
```

### Step 2: Based on Output, Choose Action

**If output shows "pkce_verifiers table exists: false":**
```bash
pnpm run db:fix-pkce
```

**If output shows "Migration tracking table exists: false":**
```bash
pnpm run db:reset-migrations
```

**If output shows everything exists but migrations still fail:**
```bash
# Use push to sync schema without migrations
pnpm run db:push
```

### Step 3: Start the App
```bash
pnpm run dev
```

---

## 🔍 Manual Fix (If Scripts Fail)

If the automated scripts don't work, you can manually create the table in Neon SQL Editor:

1. Go to your Neon dashboard
2. Open SQL Editor
3. Run this SQL:

```sql
-- Create the missing table
CREATE TABLE IF NOT EXISTS "pkce_verifiers" (
  "state" text PRIMARY KEY NOT NULL,
  "code_verifier" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL
);

-- Create the index
CREATE INDEX IF NOT EXISTS "pkce_verifiers_expires_at_idx" 
ON "pkce_verifiers" ("expires_at");

-- Verify it was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pkce_verifiers';
```

---

## 🔧 Advanced: Database URL Issues

### Issue: Using Pooler URL for Migrations
**Symptom:** Migrations timeout or fail intermittently

**Solution:** The `drizzle.config.ts` now automatically converts pooler URLs to direct connections:
- Pooler: `ep-xxx-pooler.c-2.us-east-2.aws.neon.tech`
- Direct: `ep-xxx.c-2.us-east-2.aws.neon.tech`

### Option: Use Separate Direct URL
Add to `.env`:
```env
DATABASE_URL_DIRECT=postgresql://user:pass@ep-xxx.c-2.us-east-2.aws.neon.tech/db?sslmode=require
```

The config will prefer `DATABASE_URL_DIRECT` if available.

---

## 📊 Understanding the Output

### db:check Output Explained

```
✅ Drizzle schema exists: true
   → Migration tracking schema is set up

📋 Migration tracking table exists: true
   → Drizzle can track which migrations ran

📊 Recorded migrations: 4
   - 0000_lazy_sister_grimm
   - 0001_fresh_baron_zemo
   - 0002_inngest_integration
   - 0009_add_pkce_verifiers
   → These migrations are marked as completed

📋 Actual tables in database: 25
   → Your database has 25 tables

✅ pkce_verifiers table exists: true
   → The table that was causing issues exists
```

---

## 🚨 Common Errors & Solutions

### Error: "type billing_cycle already exists"
**Cause:** Migration trying to create enum that already exists  
**Solution:** Run `pnpm run db:reset-migrations`

### Error: "relation pkce_verifiers does not exist"
**Cause:** Table missing from database  
**Solution:** Run `pnpm run db:fix-pkce`

### Error: "schema drizzle does not exist"
**Cause:** Migration tracking schema not created  
**Solution:** Run `pnpm run db:reset-migrations`

### Error: "connection timeout"
**Cause:** Using pooler URL for migrations  
**Solution:** Already fixed in `drizzle.config.ts` (auto-converts)

---

## ✅ Success Indicators

After fixing, you should see:
- ✅ `pnpm run dev` starts without errors
- ✅ No "type already exists" errors
- ✅ No "relation does not exist" errors
- ✅ Login/authentication works
- ✅ Dashboard loads successfully

---

## 🔄 Prevention

To avoid these issues in the future:

1. **Always use `db:push` for development:**
   ```bash
   pnpm run db:push
   ```

2. **Only use migrations for production:**
   ```bash
   pnpm run db:generate  # Generate migration
   pnpm run db:migrate   # Apply to production
   ```

3. **Keep migration tracking in sync:**
   - Don't manually modify migration files
   - Don't delete migrations that have been applied
   - Don't run migrations directly in SQL editor

---

## 📞 Need More Help?

If none of these solutions work:

1. Run diagnostic: `pnpm run db:check`
2. Share the full output
3. Check for any custom migrations or schema changes
4. Verify DATABASE_URL is correct in `.env`

---

## 🎯 TL;DR - Quick Commands

```bash
# 1. Check what's wrong
pnpm run db:check

# 2. Fix missing table
pnpm run db:fix-pkce

# 3. Fix migration tracking
pnpm run db:reset-migrations

# 4. Start app
pnpm run dev
```

Good luck! 🚀
