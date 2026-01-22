# Security Fixes Deployment Checklist

Use this checklist to ensure proper deployment of the security fixes.

---

## Pre-Deployment

### 1. Code Review
- [ ] Review `docs/SECURITY_FIXES_IMPLEMENTATION.md`
- [ ] Review `SECURITY_FIXES_SUMMARY.md`
- [ ] Review all modified files in git diff
- [ ] Confirm no secrets in code
- [ ] Verify TypeScript compiles without errors

### 2. Local Testing
- [ ] Run test suite: `npm run test:security`
- [ ] Test OAuth flow manually (Twitter or LinkedIn)
- [ ] Verify PKCE verifier stored in database
- [ ] Verify PKCE verifier deleted after use
- [ ] Check database: `SELECT * FROM pkce_verifiers;`

### 3. Environment Variables
- [ ] Generate CRON_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Save CRON_SECRET securely (password manager)
- [ ] Verify TOKEN_ENCRYPTION_KEY is set (production)
- [ ] Document where secrets are stored

---

## Database Migration

### 4. Run Migration (Development)
```bash
# Test migration locally first
npm run db:push
```
- [ ] Migration executed successfully
- [ ] `pkce_verifiers` table created
- [ ] Index created: `pkce_verifiers_expires_at_idx`
- [ ] Verify with: `SELECT * FROM information_schema.tables WHERE table_name = 'pkce_verifiers';`

### 5. Prepare Production Migration
- [ ] Review migration SQL: `drizzle/migrations/0009_add_pkce_verifiers.sql`
- [ ] Backup production database (if possible)
- [ ] Test migration on staging (if available)
- [ ] Confirm rollback plan

---

## Vercel Configuration

### 6. Environment Variables (Production)
Via Vercel Dashboard or CLI:

```bash
# Add CRON_SECRET
vercel env add CRON_SECRET production
# Paste the generated secret when prompted
```

Or via dashboard:
- [ ] Go to Vercel Project → Settings → Environment Variables
- [ ] Add `CRON_SECRET` variable
- [ ] Select "Production" environment
- [ ] Paste the generated 64-character hex value
- [ ] Save

### 7. Verify Other Required Variables
- [ ] `DATABASE_URL` is set
- [ ] `TOKEN_ENCRYPTION_KEY` is set (64 chars)
- [ ] `BETTER_AUTH_SECRET` is set (32+ chars)
- [ ] All OAuth credentials are set

### 8. Configure Cron Jobs
Edit `vercel.json` or add via dashboard:

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

- [ ] `cleanup-pkce` scheduled (hourly)
- [ ] `refresh-tokens` scheduled (every 6 hours)
- [ ] `learn-patterns` scheduled (daily at 1 AM UTC)
- [ ] All cron paths are correct
- [ ] Schedules are appropriate

---

## Deployment

### 9. Commit & Push
```bash
git status
git add .
git commit -m "Security fixes: PKCE DB storage + CRON_SECRET enforcement"
git push origin main
```

- [ ] All files committed
- [ ] Commit message is descriptive
- [ ] Pushed to main branch

### 10. Deploy to Vercel
```bash
# Deploy to production
vercel --prod
```

Or via GitHub integration:
- [ ] Push triggers automatic deployment
- [ ] Monitor deployment in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Deployment succeeds

### 11. Run Production Migration
```bash
# If not using Vercel's auto-migration
npm run db:migrate
```

Or manually execute SQL in production database.

- [ ] Migration executed in production
- [ ] No errors in execution
- [ ] Table created successfully

---

## Post-Deployment Verification

### 12. Verify Application Startup
- [ ] Application starts without errors
- [ ] No "CRON_SECRET required" errors
- [ ] No "TOKEN_ENCRYPTION_KEY required" errors
- [ ] Check Vercel logs for startup issues

### 13. Test OAuth Flows

**Twitter OAuth (PKCE):**
1. [ ] Navigate to `/dashboard/settings`
2. [ ] Click "Connect Twitter"
3. [ ] Complete OAuth authorization
4. [ ] Redirected back successfully
5. [ ] Twitter account shows as connected
6. [ ] Check logs: No errors
7. [ ] Verify in DB: `SELECT * FROM pkce_verifiers;` (should be empty)
8. [ ] Verify in DB: `SELECT * FROM connected_account WHERE platform = 'twitter';`

**LinkedIn OAuth (PKCE):**
1. [ ] Navigate to `/dashboard/settings`
2. [ ] Click "Connect LinkedIn"
3. [ ] Complete OAuth authorization
4. [ ] Redirected back successfully
5. [ ] LinkedIn account shows as connected
6. [ ] Check logs: No errors

### 14. Test Cron Endpoints

**Without Authentication (should fail):**
```bash
curl -X GET https://your-app.vercel.app/api/cron/refresh-tokens
# Expected: {"error":"Unauthorized"}
```
- [ ] Returns 401 Unauthorized
- [ ] Error logged in Vercel

**With Invalid Secret (should fail):**
```bash
curl -X GET https://your-app.vercel.app/api/cron/refresh-tokens \
  -H "Authorization: Bearer invalid_secret"
# Expected: {"error":"Unauthorized"}
```
- [ ] Returns 401 Unauthorized
- [ ] Security warning logged

**With Valid Secret (should succeed):**
```bash
curl -X GET https://your-app.vercel.app/api/cron/cleanup-pkce \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
# Expected: {"success":true,"deletedCount":0,...}
```
- [ ] Returns 200 OK
- [ ] Success response received
- [ ] Logs show execution

### 15. Verify Cron Jobs Execute

Wait for scheduled execution or manually trigger:
- [ ] Check Vercel → Functions → Cron
- [ ] `cleanup-pkce` executed successfully (next hour)
- [ ] `refresh-tokens` executed successfully (next scheduled time)
- [ ] No errors in cron logs
- [ ] Response codes are 200

### 16. Monitor PKCE Table

```sql
-- Check for active verifiers
SELECT COUNT(*) as active_count 
FROM pkce_verifiers 
WHERE expires_at > NOW();

-- Check for expired verifiers (should be cleaned up)
SELECT COUNT(*) as expired_count 
FROM pkce_verifiers 
WHERE expires_at <= NOW();
```

- [ ] Active count is low (< 100)
- [ ] Expired count is 0 (after cleanup runs)
- [ ] Table size is reasonable

---

## Monitoring (First 24 Hours)

### 17. Application Health
- [ ] No increase in error rates
- [ ] OAuth flows working normally
- [ ] User sign-ups working
- [ ] No performance degradation

### 18. Security Logs
Check for unauthorized access attempts:
- [ ] Review Vercel logs for `security.warn` entries
- [ ] Look for 401 responses on cron endpoints
- [ ] Confirm no successful unauthorized access

### 19. PKCE Table Health
Every 6 hours, check:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active,
  COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired
FROM pkce_verifiers;
```

Expected:
- [ ] Total < 100
- [ ] Active < 100
- [ ] Expired = 0 (cleanup is working)

### 20. Cron Job Execution
- [ ] Cleanup job runs hourly
- [ ] Refresh tokens job runs every 6 hours
- [ ] Pattern learning job runs daily
- [ ] All jobs complete successfully
- [ ] Execution times are reasonable (< 60 seconds)

---

## Troubleshooting

### Issue: "CRON_SECRET not configured" error
**Solution:**
1. Check environment variables in Vercel
2. Ensure `CRON_SECRET` is set for production
3. Redeploy after adding variable

### Issue: OAuth flow fails with "verifier_expired"
**Solution:**
1. Check if `pkce_verifiers` table exists
2. Verify database connection is working
3. Check if verifier was stored (may have expired during testing)
4. Try OAuth flow again (verifiers expire in 10 minutes)

### Issue: Cron jobs not executing
**Solution:**
1. Verify `vercel.json` cron configuration
2. Check Vercel plan supports cron jobs
3. Verify cron endpoints return 200 with valid secret
4. Check Vercel Functions logs for errors

### Issue: PKCE table growing too large
**Solution:**
1. Check cleanup job is running: `/api/cron/cleanup-pkce`
2. Manually trigger cleanup
3. Check for expired verifiers: `SELECT COUNT(*) FROM pkce_verifiers WHERE expires_at <= NOW();`
4. If many expired, cleanup job may not be running

---

## Rollback Procedure (If Needed)

### If Critical Issues Arise:

**1. Revert Code:**
```bash
git revert <commit-hash>
git push origin main
# Wait for auto-deploy or: vercel --prod
```

**2. Keep Database Table:**
The `pkce_verifiers` table is harmless and can remain.

**3. Remove Cron Job (optional):**
Remove from `vercel.json`:
```json
{
  "path": "/api/cron/cleanup-pkce",
  "schedule": "0 * * * *"
}
```

**4. Environment Variable:**
`CRON_SECRET` can remain set (no harm).

---

## Success Criteria

After 24 hours, confirm:
- [x] Zero critical errors
- [x] OAuth flows working (100% success rate)
- [x] Cron jobs executing on schedule
- [x] PKCE table size stable (< 100 entries)
- [x] No unauthorized cron access
- [x] No performance degradation
- [x] User experience unchanged

---

## Final Sign-Off

**Deployed By:** _________________  
**Deployment Date:** _________________  
**Verified By:** _________________  
**Verification Date:** _________________  

**Status:** ☐ Success ☐ Issues (document below)

**Notes:**
```
[Add any deployment notes, issues encountered, or observations]
```

---

## Continuous Monitoring

### Weekly Checks
- [ ] Review PKCE table size
- [ ] Verify cron jobs executed successfully
- [ ] Check for unauthorized access attempts
- [ ] Review error logs

### Monthly Checks
- [ ] Review security logs
- [ ] Update documentation if needed
- [ ] Verify backups include `pkce_verifiers` table

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After successful deployment

✅ **Checklist Complete - Ready for Deployment**
