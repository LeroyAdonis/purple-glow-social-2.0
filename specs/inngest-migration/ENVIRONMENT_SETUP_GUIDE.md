# Inngest Environment Setup Guide

**Project:** Purple Glow Social 2.0  
**Purpose:** Configure Inngest for local development and production  

---

## 1. Overview

Inngest requires API keys for:
1. **Event Key** - To send events to Inngest Cloud
2. **Signing Key** - To verify webhook authenticity
3. **App ID** - To identify your application (optional)

---

## 2. Getting Inngest API Keys

### 2.1 Sign Up for Inngest

1. Go to [https://app.inngest.com/sign-up](https://app.inngest.com/sign-up)
2. Create an account (free tier)
3. Create a new app called "Purple Glow Social"

### 2.2 Get Production Keys

**Navigate to:**
```
https://app.inngest.com/env/production/manage/keys
```

**Create Keys:**
1. Click "Create Event Key"
   - Name: "Production Event Key"
   - Copy the key (starts with `inngest_`)
   
2. Click "Create Signing Key"
   - Name: "Production Signing Key"
   - Copy the key (starts with `signkey_`)

**⚠️ Important:** Save these keys securely. You cannot view them again.

---

## 3. Local Development Setup

### 3.1 Option A: Use Inngest Dev Server (Recommended)

**Advantages:**
- ✅ No API keys needed
- ✅ Full dashboard UI at localhost:8288
- ✅ View function execution in real-time
- ✅ Manual trigger testing
- ✅ Step-by-step debugging

**Setup:**

**Step 1: Start Inngest Dev Server**
```bash
# Terminal 1
npx inngest-cli@latest dev
```

**Step 2: Start Next.js**
```bash
# Terminal 2
npm run dev
```

**Step 3: Access Dashboard**
```
http://localhost:8288
```

**Environment Variables (Optional):**
```bash
# .env.local
INNGEST_DEV=1  # Tells Inngest SDK to use dev server
```

### 3.2 Option B: Use Production Inngest Cloud

**Setup:**

Add to `.env.local`:
```bash
INNGEST_EVENT_KEY=inngest_prod_xxxxxxxxxx
INNGEST_SIGNING_KEY=signkey_prod_xxxxxxxxxx
```

**Note:** This is NOT recommended for local dev. Use the dev server instead.

---

## 4. Staging Environment Setup

### 4.1 Vercel Environment Variables

**Navigate to:**
```
https://vercel.com/your-org/purple-glow-social-2-0/settings/environment-variables
```

**Add Variables for `Preview` environment:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `INNGEST_EVENT_KEY` | `inngest_staging_xxxxx` | Preview |
| `INNGEST_SIGNING_KEY` | `signkey_staging_xxxxx` | Preview |

**Optional:**
| Variable | Value | Environment |
|----------|-------|-------------|
| `INNGEST_APP_ID` | `purple-glow-social-staging` | Preview |

### 4.2 Create Staging Environment in Inngest

**Navigate to:**
```
https://app.inngest.com/env/new
```

**Create:**
- Name: "Staging"
- Branch: `staging` or `preview`
- Generate new keys for this environment

---

## 5. Production Environment Setup

### 5.1 Vercel Environment Variables

**Add Variables for `Production` environment:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `INNGEST_EVENT_KEY` | `inngest_prod_xxxxx` | Production |
| `INNGEST_SIGNING_KEY` | `signkey_prod_xxxxx` | Production |
| `INNGEST_APP_ID` | `purple-glow-social-2.0` | Production |

### 5.2 Webhook Registration

Inngest automatically discovers your functions via the serve endpoint.

**Endpoint:**
```
https://purple-glow-social-2-0.vercel.app/api/inngest
```

**Auto-Discovery:**
When you deploy to Vercel, Inngest will:
1. Detect your `/api/inngest` endpoint
2. Register all functions
3. Start scheduling cron jobs
4. Enable event sending

**Verify Registration:**
```
https://app.inngest.com/env/production/functions
```

You should see all 8 functions listed.

---

## 6. Environment Variable Reference

### 6.1 Required Variables

```bash
# ============ Job Processing (Inngest) ============

# Event Key (for sending events to Inngest Cloud)
INNGEST_EVENT_KEY=inngest_prod_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Signing Key (for webhook verification)
INNGEST_SIGNING_KEY=signkey_prod_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6.2 Optional Variables

```bash
# App ID (defaults to 'purple-glow-social' from client.ts)
INNGEST_APP_ID=purple-glow-social-2.0

# Enable dev mode (local development only)
INNGEST_DEV=1

# Custom Inngest API endpoint (rarely needed)
# INNGEST_API_BASE_URL=https://api.inngest.com
```

### 6.3 Security Notes

- ✅ Event keys allow sending events
- ✅ Signing keys verify webhook authenticity
- ⚠️ Never commit keys to git
- ⚠️ Use different keys per environment
- ⚠️ Rotate keys if compromised

---

## 7. Testing Inngest Configuration

### 7.1 Local Dev Server Test

**Step 1: Start both servers**
```bash
# Terminal 1
npx inngest-cli@latest dev

# Terminal 2
npm run dev
```

**Step 2: Check registration**
Open http://localhost:8288/functions

**Expected:** List of registered functions:
- `process-scheduled-post`
- `execute-automation-rule`
- `check-credit-expiry`
- `reset-monthly-credits`
- `check-low-credits`
- `cleanup-pkce-verifiers`
- `refresh-oauth-tokens`
- `learn-ai-patterns`

### 7.2 Manual Event Test

**Send a test event:**
```typescript
// In your Next.js app or API route
import { inngest } from '@/lib/inngest/client';

// Test event
await inngest.send({
  name: 'post/scheduled.process',
  data: {
    postId: 'test-post-123',
    userId: 'test-user-456',
    platform: 'instagram',
    scheduledAt: new Date().toISOString(),
  },
});
```

**Check dashboard:**
- Go to http://localhost:8288/stream
- You should see the event appear
- Click to view execution trace

### 7.3 Production Test (After Deployment)

**Verify cron schedules:**
```bash
# In Inngest dashboard
https://app.inngest.com/env/production/functions/cleanup-pkce-verifiers

# Check:
- Cron schedule: "0 * * * *"
- Next run: [timestamp]
- Status: Active
```

---

## 8. Troubleshooting

### 8.1 Functions Not Appearing in Dashboard

**Problem:** Functions don't show in Inngest dashboard

**Solutions:**
1. Check `/api/inngest` endpoint is accessible
2. Verify `INNGEST_SIGNING_KEY` is correct
3. Check Vercel deployment logs for errors
4. Ensure functions are exported in `index.ts`
5. Redeploy to trigger re-registration

**Test endpoint manually:**
```bash
curl https://your-app.vercel.app/api/inngest
```

### 8.2 Events Not Triggering Functions

**Problem:** Sending events doesn't trigger functions

**Solutions:**
1. Verify `INNGEST_EVENT_KEY` is set
2. Check event name matches function trigger
3. Inspect Inngest dashboard "Events" tab
4. Look for errors in function execution logs

### 8.3 Dev Server Not Starting

**Problem:** `npx inngest-cli@latest dev` fails

**Solutions:**
1. Check port 8288 is available
2. Kill any existing Inngest processes
3. Try different port: `npx inngest-cli@latest dev --port 8289`
4. Check Node.js version (requires 18+)

### 8.4 Webhook Signature Verification Fails

**Problem:** "Invalid signature" errors in logs

**Solutions:**
1. Verify `INNGEST_SIGNING_KEY` matches Inngest dashboard
2. Check for whitespace in environment variable
3. Ensure key is for correct environment (prod/staging)
4. Try regenerating signing key

---

## 9. Inngest Dashboard Features

### 9.1 Functions View

**URL:** `https://app.inngest.com/env/production/functions`

**Features:**
- List all registered functions
- View cron schedules
- See next execution time
- Check function configuration
- Pause/resume functions

### 9.2 Events View

**URL:** `https://app.inngest.com/env/production/events`

**Features:**
- See all events sent
- Filter by event name
- View event payloads
- Track delivery status

### 9.3 Runs View

**URL:** `https://app.inngest.com/env/production/runs`

**Features:**
- View all function executions
- See execution duration
- Check retry attempts
- Inspect step-by-step traces
- Download execution logs

### 9.4 Logs View

**URL:** `https://app.inngest.com/env/production/logs`

**Features:**
- Real-time log streaming
- Filter by function or event
- Search logs
- Export logs

---

## 10. Best Practices

### 10.1 Environment Separation

| Environment | Inngest Env | Keys | Purpose |
|-------------|-------------|------|---------|
| Local Dev | Dev Server | None | Development & testing |
| Staging | `staging` | Separate keys | Pre-production testing |
| Production | `production` | Separate keys | Live users |

### 10.2 Key Management

- ✅ Use separate keys per environment
- ✅ Store in environment variables (never in code)
- ✅ Rotate keys quarterly
- ✅ Revoke keys immediately if compromised
- ✅ Use least-privilege principle

### 10.3 Monitoring

**Set up alerts for:**
- Function failures > 5% 
- Execution time > 2x average
- Events not processed within 1 hour
- Cron jobs skipped

---

## 11. Quick Reference

### 11.1 Common Commands

```bash
# Start Inngest Dev Server
npx inngest-cli@latest dev

# Start with custom port
npx inngest-cli@latest dev --port 8289

# View Inngest CLI help
npx inngest-cli@latest --help

# Check Inngest version
npx inngest-cli@latest version
```

### 11.2 Useful Links

| Resource | URL |
|----------|-----|
| Inngest Dashboard | https://app.inngest.com |
| Documentation | https://www.inngest.com/docs |
| Discord Community | https://www.inngest.com/discord |
| Status Page | https://status.inngest.com |
| GitHub | https://github.com/inngest/inngest |

### 11.3 Support

**Issues?**
1. Check documentation: https://www.inngest.com/docs
2. Search Discord: https://www.inngest.com/discord
3. GitHub Issues: https://github.com/inngest/inngest-js/issues
4. Email support: support@inngest.com

---

## 12. Migration Checklist

### 12.1 Pre-Migration

- [ ] Sign up for Inngest account
- [ ] Create production environment
- [ ] Generate event key
- [ ] Generate signing key
- [ ] Add keys to Vercel (production)
- [ ] Create staging environment (optional)
- [ ] Add staging keys to Vercel (preview)

### 12.2 Post-Migration

- [ ] Verify functions appear in dashboard
- [ ] Check cron schedules are correct
- [ ] Test manual event triggers
- [ ] Monitor first 3 cron executions
- [ ] Set up alerts
- [ ] Document any issues
- [ ] Train team on dashboard usage

---

**Status:** ✅ Setup Guide Complete  
**Next:** Follow setup steps for your environment  
**Questions?** Refer to troubleshooting section or Inngest docs
