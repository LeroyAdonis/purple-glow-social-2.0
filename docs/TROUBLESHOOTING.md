# Purple Glow Social 2.0 - Troubleshooting Runbook

## Overview

This runbook provides solutions for common issues in Purple Glow Social 2.0. It is designed for developers and operators maintaining the application.

---

## Quick Diagnostics

### Health Check Endpoint

```bash
# Check application health
curl https://your-app.vercel.app/api/health
```

**Expected Response (Healthy):**
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy" },
    "environment": { "status": "configured" }
  }
}
```

### Auth Diagnostics

```bash
# Check auth configuration
curl https://your-app.vercel.app/api/diagnostics/auth
```

---

## Authentication Issues

### Issue: Login appears to work but session doesn't persist

**Symptoms:**
- User enters credentials successfully
- Redirected to dashboard
- Immediately redirected back to login
- No errors in browser console

**Root Cause:**
The `.vercel.app` domain is on the Public Suffix List. Browsers reject cookies with `__Secure-` prefix on these domains.

**Solution:**
1. Verify `lib/auth.ts` has secure cookies disabled for Vercel:
```typescript
const isVercelSharedDomain = 
  process.env.VERCEL_URL?.includes('.vercel.app') || 
  process.env.VERCEL === '1';

export const auth = betterAuth({
  advanced: {
    useSecureCookies: !isVercelSharedDomain && process.env.NODE_ENV === 'production',
  },
});
```

2. OR use a custom domain (recommended for production)

### Issue: "Unauthorized" errors after login

**Symptoms:**
- Login succeeds
- API calls return 401 Unauthorized
- Session appears valid in browser

**Debugging Steps:**
1. Check browser cookies:
   - Open DevTools → Application → Cookies
   - Look for `better-auth.session_token` cookie
   - Verify domain matches current URL

2. Check session API:
```bash
curl -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
  https://your-app.vercel.app/api/auth/session
```

3. Verify environment variables:
   - `BETTER_AUTH_SECRET` must be set in Vercel
   - `BETTER_AUTH_URL` should match deployment URL

### Issue: Google OAuth fails

**Symptoms:**
- Clicking "Sign in with Google" returns error
- Redirect loop or "access_denied" error

**Solution:**
1. Verify Google Cloud Console configuration:
   - Authorized redirect URIs include your deployment URL
   - `https://your-app.vercel.app/api/auth/callback/google`

2. Check environment variables:
   - `GOOGLE_CLIENT_ID` is set
   - `GOOGLE_CLIENT_SECRET` is set

3. Ensure domain is in Google OAuth consent screen

---

## Database Issues

### Issue: "Connection refused" or timeout errors

**Symptoms:**
- API routes return 500 errors
- Health check shows database as "unhealthy"
- "Connection to database failed" in logs

**Debugging Steps:**
1. Verify `DATABASE_URL` in Vercel environment:
   - Must include `?sslmode=require` for Neon
   - Format: `postgresql://user:pass@host/db?sslmode=require`

2. Check Neon dashboard:
   - Database is not paused (free tier pauses after inactivity)
   - IP is not blocked
   - Connection pool not exhausted

3. Test connection locally:
```bash
psql "$DATABASE_URL"
```

### Issue: Schema out of sync

**Symptoms:**
- "column X does not exist" errors
- "relation does not exist" errors

**Solution:**
1. Push schema to database:
```bash
npm run db:push
```

2. Or generate and run migrations:
```bash
npm run db:generate
npm run db:push
```

---

## OAuth Social Media Connection Issues

### Issue: Platform connection fails with "Invalid callback"

**Symptoms:**
- Clicking "Connect" redirects to platform
- Returns with error "Invalid callback URL"

**Solution:**
1. Verify redirect URI is registered with the platform:
   - Facebook: `https://your-app.vercel.app/api/oauth/facebook/callback`
   - Instagram: `https://your-app.vercel.app/api/oauth/instagram/callback`
   - Twitter: `https://your-app.vercel.app/api/oauth/twitter/callback`
   - LinkedIn: `https://your-app.vercel.app/api/oauth/linkedin/callback`

2. Check platform-specific app settings:
   - **Meta (FB/IG)**: App must be in "Live" mode
   - **Twitter**: OAuth 2.0 must be enabled with PKCE
   - **LinkedIn**: Correct scopes selected in app settings

### Issue: Token refresh fails

**Symptoms:**
- Previously connected account shows "disconnected"
- Posts fail with "Token expired" error

**Solution:**
1. Run token refresh cron manually:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/refresh-tokens
```

2. If refresh fails, user needs to reconnect the account

---

## AI Content Generation Issues

### Issue: "Failed to generate content" errors

**Symptoms:**
- Content generation returns error
- Empty content returned

**Debugging Steps:**
1. Check `GEMINI_API_KEY` is set in Vercel

2. Verify API key has billing enabled in Google Cloud

3. Check Gemini API quotas:
   - Free tier: 60 requests per minute
   - Check usage in Google Cloud Console

4. Test API directly:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
```

### Issue: Content quality is poor

**Symptoms:**
- Generated content missing SA context
- Wrong language used
- Missing hashtags

**Solution:**
1. Check content validation is enabled in `lib/ai/gemini-service.ts`
2. Use `generateContentWithRetry()` for automatic regeneration
3. Check quality score in response:
```json
{
  "content": "...",
  "validation": {
    "qualityScore": 75,
    "isValid": true
  }
}
```

---

## Payment Issues

### Issue: Polar webhook not processing

**Symptoms:**
- User pays but credits not added
- Subscription not activated

**Debugging Steps:**
1. Check webhook URL is configured in Polar dashboard:
   - `https://your-app.vercel.app/api/webhooks/polar`

2. Verify `POLAR_WEBHOOK_SECRET` is set

3. Check Polar dashboard for webhook failures

4. Test webhook manually (use Polar's "Send Test Webhook" feature)

### Issue: Credits not deducted

**Symptoms:**
- Posts succeed without credit deduction
- Credit balance unchanged after posting

**Solution:**
1. Check credit reservation system:
   - Verify post has associated reservation in database
   - Check `credit_reservations` table

2. Check Inngest job status:
   - Open Inngest dashboard
   - Look for `process-scheduled-post` function
   - Check for failures in job logs

---

## Deployment Issues

### Issue: Build fails on Vercel

**Common Causes & Solutions:**

1. **Type errors:**
```bash
# Run locally first
npm run build
```

2. **Missing environment variables:**
   - Add dummy values for build-time variables
   - Use `.env.example` as reference

3. **Memory issues:**
   - Enable Vercel Pro for more memory
   - Or split large components with dynamic imports

### Issue: API routes timeout

**Symptoms:**
- Routes work locally but fail on Vercel
- "Function timeout" errors

**Solution:**
1. Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

2. Optimize database queries:
   - Add indexes
   - Use pagination
   - Cache results with React Query

---

## Rollback Procedures

### Rollback to Previous Deployment

1. Go to Vercel Dashboard → Deployments
2. Find working deployment
3. Click "..." → "Promote to Production"

### Emergency Database Rollback

1. Create backup before changes:
```bash
pg_dump "$DATABASE_URL" > backup.sql
```

2. Restore from backup:
```bash
psql "$DATABASE_URL" < backup.sql
```

---

## Support Escalation

### When to Escalate

- Data loss or corruption
- Security incident
- Payment processing errors affecting multiple users
- Complete service outage

### Emergency Contacts

| Issue Type | Contact |
|------------|---------|
| Database (Neon) | support@neon.tech |
| Payments (Polar) | support@polar.sh |
| AI (Gemini) | Google Cloud Support |
| Hosting (Vercel) | Vercel Support (Pro plan) |

---

## Monitoring Checklist

### Daily Checks
- [ ] Health endpoint returns 200
- [ ] Error count in Sentry is normal
- [ ] Scheduled posts are processing

### Weekly Checks
- [ ] Database performance metrics
- [ ] API response times
- [ ] Token refresh success rate

### Monthly Checks
- [ ] Review security audit results
- [ ] Update dependencies
- [ ] Review user feedback

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintainer:** Development Team
