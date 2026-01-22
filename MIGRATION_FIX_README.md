# 🚀 Quick Start: Fix Database Migration Issues

## The Problem
Your migrations are failing with "type already exists" errors.

## The Solution (Pick One)

### 🎯 FASTEST: Just Create the Missing Table
```bash
pnpm run db:fix-pkce
pnpm run dev
```

### 🔍 SAFEST: Diagnose First, Then Fix
```bash
# Step 1: See what's wrong
pnpm run db:check

# Step 2: Fix based on output
pnpm run db:fix-pkce           # If table is missing
# OR
pnpm run db:reset-migrations   # If tracking is broken

# Step 3: Start app
pnpm run dev
```

### ⚡ NUCLEAR OPTION: Skip Migrations Entirely
```bash
pnpm run db:push
pnpm run dev
```

## What We Fixed

1. ✅ **drizzle.config.ts** - Better URL handling with diagnostic output
2. ✅ **3 New Scripts** - Diagnostic, table creation, migration reset
3. ✅ **3 New Commands** - Easy access via package.json
4. ✅ **Full Guide** - See DATABASE_MIGRATION_FIX_GUIDE.md

## Files Created
- `scripts/tmp_rovodev_check_migrations.ts` - Diagnostic tool
- `scripts/tmp_rovodev_create_pkce_table.ts` - Manual table creation
- `scripts/tmp_rovodev_reset_migrations.ts` - Migration tracking reset
- `DATABASE_MIGRATION_FIX_GUIDE.md` - Comprehensive troubleshooting

## Next Steps

Run the diagnostic to see exactly what's wrong:
```bash
pnpm run db:check
```

Then follow the recommendations in the output.

---

**Need the full guide?** → Read `DATABASE_MIGRATION_FIX_GUIDE.md`
