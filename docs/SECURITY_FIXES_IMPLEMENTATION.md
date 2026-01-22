# Security Fixes Implementation Guide

This document details the high-priority security fixes implemented in Purple Glow Social 2.0.

## Overview

Two critical security improvements have been implemented:
1. **PKCE Code Verifier Database Storage** (High Priority)
2. **CRON_SECRET Enforcement** (Medium-High Priority)

---

## Fix #1: PKCE Code Verifier Database Storage

### Problem
Previously, PKCE code verifiers were stored in cookies, which is acceptable but not ideal for security. Database storage provides:
- Better security isolation
- Automatic expiration
- Single-use enforcement
- No client-side exposure

### Implementation

#### 1. Database Schema
**File:** `drizzle/schema.ts`

Added new table:
```typescript
export const pkceVerifiers = pgTable("pkce_verifiers", {
  state: text("state").primaryKey(),
  codeVerifier: text("code_verifier").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});
```

**Migration:** `drizzle/migrations/0009_add_pkce_verifiers.sql`

#### 2. Database Helper Functions
**File:** `lib/db/pkce-verifiers.ts`

New functions:
- `storePKCEVerifier(state, verifier)` - Store verifier with 10-minute expiry
- `retrievePKCEVerifier(state)` - Retrieve and delete (single use)
- `cleanupExpiredPKCEVerifiers()` - Remove expired verifiers
- `getActivePKCECount()` - Monitoring helper

#### 3. State Manager Updates
**File:** `lib/oauth/state-manager.ts`

Updated functions to be async and use database storage:
- `createOAuthState()` - Now stores verifier in database
- `validateAndConsumeState()` - Retrieves verifier from database
- `getCodeVerifier()` - Retrieves from database

#### 4. OAuth Provider Updates

**Twitter Provider** (uses PKCE):
- **File:** `app/api/oauth/twitter/connect/route.ts`
  - Now uses `createOAuthState()` which stores verifier in DB
  - Removed `oauth_code_verifier` cookie

- **File:** `app/api/oauth/twitter/callback/route.ts`
  - Retrieves verifier from database using `retrievePKCEVerifier()`
  - Verifier automatically deleted after retrieval (single use)

**LinkedIn Provider** (uses PKCE):
- **File:** `app/api/oauth/linkedin/connect/route.ts`
  - Updated to await `createOAuthState()`

- **File:** `app/api/oauth/linkedin/callback/route.ts`
  - Updated to await `validateAndConsumeState()`

#### 5. Cleanup Cron Job
**File:** `app/api/cron/cleanup-pkce/route.ts`

New endpoint to clean up expired verifiers:
- Schedule: Every hour (`0 * * * *`)
- Protected by CRON_SECRET
- Logs cleanup statistics

### Security Benefits
✅ Verifiers never exposed in cookies  
✅ Server-side storage only  
✅ Automatic expiration (10 minutes)  
✅ Single-use enforcement (deleted after retrieval)  
✅ Audit trail with created_at timestamps  

---

## Fix #2: CRON_SECRET Enforcement

### Problem
Previously, CRON_SECRET validation existed but didn't block unauthorized requests if the secret was missing. This could allow:
- Unauthorized cron job execution
- Resource exhaustion attacks
- Unintended data processing

### Implementation

#### 1. Cron Route Updates

**File:** `app/api/cron/refresh-tokens/route.ts`
```typescript
// Before: Optional check
if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  // reject
}

// After: Required check
if (!cronSecret) {
  return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
}
if (authHeader !== `Bearer ${cronSecret}`) {
  logger.security.warn('Unauthorized cron request attempt', { endpoint: '...' });
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**File:** `app/api/cron/learn-patterns/route.ts`
- Same enforcement pattern implemented

**File:** `app/api/cron/cleanup-pkce/route.ts`
- New cron endpoint with CRON_SECRET enforcement from the start

#### 2. Environment Validation
**File:** `lib/config/env.ts`

Added production-only validation:
```typescript
// Additional production-only validations
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CRON_SECRET) {
    logger.security.error('CRON_SECRET is required in production');
    throw new Error('CRON_SECRET must be set in production');
  }
  
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    logger.security.error('TOKEN_ENCRYPTION_KEY is required in production');
    throw new Error('TOKEN_ENCRYPTION_KEY must be set in production');
  }
}
```

Updated schema validation:
```typescript
CRON_SECRET: z.string().min(32, 'CRON_SECRET must be at least 32 characters').optional(),
```

#### 3. Documentation Updates
**File:** `.env.example`

Updated with better instructions:
```bash
# Cron Job Authentication (REQUIRED in production)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Used to secure cron endpoints from unauthorized access
CRON_SECRET=your_cron_secret_min_32_chars_here
```

### Security Benefits
✅ Cron endpoints always protected  
✅ Server misconfiguration detected at startup  
✅ Unauthorized access attempts logged  
✅ Minimum secret length enforced (32 characters)  
✅ Clear error messages for debugging  

---

## Deployment Instructions

### 1. Database Migration

Run the migration to create the PKCE verifiers table:

```bash
# Generate migration (already created)
npm run db:generate

# Apply migration to development
npm run db:push

# Apply migration to production
npm run db:migrate
```

**Or manually execute:**
```sql
-- See drizzle/migrations/0009_add_pkce_verifiers.sql
CREATE TABLE "pkce_verifiers" (...);
CREATE INDEX "pkce_verifiers_expires_at_idx" ON "pkce_verifiers" ("expires_at");
```

### 2. Environment Variables

**Generate CRON_SECRET** (if not already set):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to Vercel:**
```bash
vercel env add CRON_SECRET production
# Paste the generated secret
```

**Or via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add `CRON_SECRET` with generated value
3. Select "Production" environment
4. Save

### 3. Configure Vercel Cron Jobs

**File:** `vercel.json`

Add the new cleanup job:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-pkce",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/refresh-tokens",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/learn-patterns",
      "schedule": "0 1 * * *"
    }
  ]
}
```

### 4. Redeploy

```bash
# Commit changes
git add .
git commit -m "Security fixes: PKCE DB storage + CRON_SECRET enforcement"

# Deploy to production
vercel --prod
```

---

## Testing

### Test PKCE Flow

**Twitter OAuth (uses PKCE):**
1. Navigate to `/dashboard/settings`
2. Click "Connect Twitter"
3. Complete OAuth flow
4. Verify connection successful
5. Check database: `SELECT * FROM pkce_verifiers;` (should be empty after callback)

**Database inspection:**
```sql
-- During OAuth flow (after redirect, before callback)
SELECT * FROM pkce_verifiers;
-- Should show 1 entry

-- After OAuth callback
SELECT * FROM pkce_verifiers;
-- Should be empty (verifier consumed)
```

### Test CRON_SECRET Enforcement

**Without secret (should fail):**
```bash
curl -X GET https://your-app.vercel.app/api/cron/refresh-tokens
# Expected: {"error":"Unauthorized"}
```

**With invalid secret (should fail):**
```bash
curl -X GET https://your-app.vercel.app/api/cron/refresh-tokens \
  -H "Authorization: Bearer wrong_secret"
# Expected: {"error":"Unauthorized"}
```

**With valid secret (should succeed):**
```bash
curl -X GET https://your-app.vercel.app/api/cron/refresh-tokens \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
# Expected: {"success":true,"message":"Token refresh completed",...}
```

### Test PKCE Cleanup Job

**Manual trigger:**
```bash
curl -X POST https://your-app.vercel.app/api/cron/cleanup-pkce \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
# Expected: {"success":true,"deletedCount":0,"activeBefore":0,"activeAfter":0}
```

### Test Production Startup

**Missing CRON_SECRET:**
```bash
# Remove CRON_SECRET from environment
# Start app
# Expected: Error thrown at startup
```

---

## Monitoring

### PKCE Verifiers

**Check active count:**
```sql
SELECT COUNT(*) FROM pkce_verifiers WHERE expires_at > NOW();
```

**Check expired count:**
```sql
SELECT COUNT(*) FROM pkce_verifiers WHERE expires_at <= NOW();
```

**Monitor cleanup job:**
- Check Vercel cron logs for `/api/cron/cleanup-pkce`
- Should run every hour
- Should log deleted count

### Cron Security

**Check logs for unauthorized attempts:**
```typescript
// Look for this log entry
logger.security.warn('Unauthorized cron request attempt', {
  endpoint: '/api/cron/...',
  hasAuth: false,
});
```

**Vercel Dashboard:**
- Functions → Select cron function → Logs
- Look for 401 Unauthorized responses

---

## Rollback Plan

If issues arise, rollback is straightforward:

### 1. Revert Code Changes
```bash
git revert <commit-hash>
git push
```

### 2. Keep Database Table
The `pkce_verifiers` table is harmless to keep. It will just remain empty.

### 3. Remove Cron Job
Delete from `vercel.json`:
```json
{
  "path": "/api/cron/cleanup-pkce",
  "schedule": "0 * * * *"
}
```

---

## Performance Impact

### PKCE Database Storage
- **Additional queries:** 2 per OAuth flow (1 insert, 1 delete)
- **Storage:** Minimal (~100 bytes per verifier, auto-expires in 10 minutes)
- **Expected load:** < 100 active verifiers at any time
- **Cleanup overhead:** < 1 second per hour

### CRON_SECRET Enforcement
- **No performance impact** - just validation checks

---

## Security Audit Checklist

- [x] PKCE verifiers stored in database (not cookies)
- [x] Verifiers auto-expire after 10 minutes
- [x] Verifiers deleted after single use
- [x] CRON_SECRET required in production
- [x] CRON_SECRET minimum length enforced (32 chars)
- [x] Unauthorized cron access attempts logged
- [x] Environment validation on startup
- [x] Database migration created and tested
- [x] Documentation updated
- [x] .env.example updated with instructions

---

## Additional Resources

- **RFC 7636 (PKCE):** https://datatracker.ietf.org/doc/html/rfc7636
- **OAuth 2.0 Security Best Practices:** https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics
- **Vercel Cron Jobs:** https://vercel.com/docs/cron-jobs

---

## Support

For questions or issues related to these security fixes:
1. Check this documentation first
2. Review code comments in affected files
3. Check application logs for errors
4. Consult AGENTS.md for architecture overview

---

**Implementation Date:** 2024  
**Tested By:** Purple Glow Social Team  
**Security Review:** Passed  
**Status:** ✅ Production Ready
