# Vercel Cron to Inngest Migration - Implementation Specification

**Date:** 2024-01-XX  
**Project:** Purple Glow Social 2.0  
**Status:** Ready for Implementation  
**Estimated Effort:** 3-4 hours  

---

## 1. Overview

### 1.1 Objective
Migrate all remaining Vercel Cron jobs to Inngest, eliminating the $20/month Vercel Hobby plan requirement while improving reliability and monitoring.

### 1.2 Scope
- Create 3 new Inngest functions
- Update Inngest configuration files
- Remove Vercel Cron endpoints and configuration
- Update environment variable documentation
- Test and validate in staging

### 1.3 Success Criteria
- ✅ All cron jobs running on Inngest
- ✅ Zero TypeScript errors
- ✅ Vercel remains on Free tier
- ✅ 72 hours of error-free operation
- ✅ Cost savings: $20/month

---

## 2. Migration Waves

### Wave 1: Environment Setup (15 min)
**Status:** Foundation - Sequential  
**Dependencies:** None  

**Tasks:**
1. Add Inngest variables to `.env.example`
2. Document Inngest setup in README
3. Create staging environment variables

### Wave 2: Create Inngest Functions (2 hours)
**Status:** Parallel-friendly  
**Dependencies:** Wave 1  

**Tasks:**
- Track A: Cleanup PKCE function (30 min)
- Track B: Refresh Tokens function (1 hour)
- Track C: Learn Patterns function (1.5 hours)

### Wave 3: Integration (30 min)
**Status:** Sequential  
**Dependencies:** Wave 2  

**Tasks:**
1. Update `lib/inngest/functions/index.ts`
2. Register functions in `app/api/inngest/route.ts`
3. Verify TypeScript compilation

### Wave 4: Cleanup (15 min)
**Status:** Sequential  
**Dependencies:** Wave 3 testing  

**Tasks:**
1. Delete Vercel Cron endpoints
2. Remove `vercel.json` cron configuration
3. Clean up empty directories

### Wave 5: Testing & Validation (1 hour)
**Status:** Sequential  
**Dependencies:** Wave 4  

**Tasks:**
1. Local testing with Inngest Dev Server
2. Staging deployment
3. Production smoke tests
4. 72-hour monitoring period

---

## 3. Detailed Specifications

### 3.1 New Inngest Functions

See individual function specs in:
- `FUNCTION_SPEC_CLEANUP_PKCE.md`
- `FUNCTION_SPEC_REFRESH_TOKENS.md`
- `FUNCTION_SPEC_LEARN_PATTERNS.md`

---

## 4. File Modifications

### 4.1 `.env.example` - Add Inngest Variables

**Location:** Line 98 (after Upstash Redis section)

**Add:**
```bash
# ============ Job Processing (Inngest) ============

# Inngest Event Key (for sending events to Inngest Cloud)
# Get from: https://app.inngest.com/env/production/manage/keys
INNGEST_EVENT_KEY=your_inngest_event_key_here

# Inngest Signing Key (for webhook verification)
# Get from: https://app.inngest.com/env/production/manage/keys
INNGEST_SIGNING_KEY=your_inngest_signing_key_here

# Inngest App ID (optional - defaults to 'purple-glow-social')
# INNGEST_APP_ID=purple-glow-social-2.0

# For local development with Inngest Dev Server
# INNGEST_DEV=1
```

### 4.2 `lib/inngest/functions/index.ts` - Export New Functions

**Find:**
```typescript
export { processScheduledPost } from './process-scheduled-post';
export { executeAutomationRule } from './execute-automation-rule';
export { checkCreditExpiry } from './check-credit-expiry';
export { resetMonthlyCredits } from './reset-monthly-credits';
export { checkLowCredits, triggerLowCreditCheck } from './check-low-credits';

// Re-export the client for convenience
export { inngest } from '../client';
```

**Replace with:**
```typescript
// Event-driven functions
export { processScheduledPost } from './process-scheduled-post';
export { executeAutomationRule } from './execute-automation-rule';
export { checkCreditExpiry } from './check-credit-expiry';
export { resetMonthlyCredits } from './reset-monthly-credits';
export { checkLowCredits, triggerLowCreditCheck } from './check-low-credits';

// Cron-based functions
export { cleanupPKCEVerifiers } from './cleanup-pkce-verifiers';
export { refreshOAuthTokens } from './refresh-oauth-tokens';
export { learnAIPatterns } from './learn-ai-patterns';

// Re-export the client for convenience
export { inngest } from '../client';
```

### 4.3 `app/api/inngest/route.ts` - Register Functions

**Find:**
```typescript
import {
  processScheduledPost,
  executeAutomationRule,
  checkCreditExpiry,
  resetMonthlyCredits,
  checkLowCredits,
} from '@/lib/inngest/functions';

// Create the serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processScheduledPost,
    executeAutomationRule,
    checkCreditExpiry,
    resetMonthlyCredits,
    checkLowCredits,
  ],
});
```

**Replace with:**
```typescript
import {
  // Event-driven functions
  processScheduledPost,
  executeAutomationRule,
  checkCreditExpiry,
  resetMonthlyCredits,
  checkLowCredits,
  // Cron-based functions
  cleanupPKCEVerifiers,
  refreshOAuthTokens,
  learnAIPatterns,
} from '@/lib/inngest/functions';

// Create the serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Event-driven
    processScheduledPost,
    executeAutomationRule,
    checkCreditExpiry,
    resetMonthlyCredits,
    checkLowCredits,
    // Cron-based
    cleanupPKCEVerifiers,
    refreshOAuthTokens,
    learnAIPatterns,
  ],
});
```

### 4.4 `vercel.json` - Remove Cron Configuration

**Current:**
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-pkce",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/learn-patterns",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/refresh-tokens",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Replace with:**
```json
{
  "comment": "Cron jobs migrated to Inngest - see lib/inngest/functions/"
}
```

Or delete the file entirely if no other configuration exists.

---

## 5. Testing Strategy

### 5.1 Local Testing with Inngest Dev Server

**Setup:**
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Inngest Dev Server
npx inngest-cli@latest dev
```

**Access:**
- Inngest Dashboard: http://localhost:8288
- Next.js App: http://localhost:3000

**Manual Triggers:**
```typescript
// Test cleanup PKCE
await inngest.send({ name: 'cron/cleanup-pkce', data: {} });

// Test token refresh
await inngest.send({ name: 'cron/refresh-tokens', data: {} });

// Test AI learning
await inngest.send({ name: 'cron/learn-patterns', data: {} });
```

### 5.2 Staging Validation Checklist

- [ ] All 8 functions visible in Inngest dashboard
- [ ] Cron schedules correctly configured
- [ ] Manual test triggers succeed
- [ ] Database changes persist correctly
- [ ] Error logs go to Sentry
- [ ] No TypeScript errors in build
- [ ] Vercel deployment succeeds

### 5.3 Production Smoke Tests

**Day 1 (Deployment):**
- [ ] Verify all functions deployed
- [ ] Check first cron execution logs
- [ ] Monitor Sentry for errors

**Day 2-3 (Monitoring):**
- [ ] PKCE cleanup runs hourly
- [ ] Token refresh runs every 6 hours
- [ ] AI learning runs daily at 3am SAST
- [ ] No increase in error rate

---

## 6. Rollback Plan

### 6.1 Quick Rollback (< 5 minutes)

**If critical issues arise:**

1. **Re-enable Vercel Cron:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-pkce",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/learn-patterns",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/refresh-tokens",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Monitor for 1 hour** to ensure old cron jobs resume

### 6.2 Hybrid Fallback

Keep both systems running for 7 days:
- Inngest as primary
- Vercel Cron as backup
- Monitor which system triggers first
- Remove slower system after validation

---

## 7. Deployment Checklist

### 7.1 Pre-Deployment
- [ ] Code review approved
- [ ] TypeScript build passes
- [ ] All tests passing
- [ ] Environment variables set in Vercel
- [ ] Inngest API keys configured
- [ ] Staging tested successfully

### 7.2 Deployment Steps
1. [ ] Merge PR to `main` branch
2. [ ] Automatic Vercel deployment triggers
3. [ ] Verify deployment success
4. [ ] Check Inngest dashboard for function registration
5. [ ] Wait for first cron execution
6. [ ] Monitor logs for 1 hour

### 7.3 Post-Deployment
- [ ] All cron jobs executed successfully
- [ ] No errors in Sentry (72 hours)
- [ ] Vercel plan remains Free tier
- [ ] Update documentation
- [ ] Close migration ticket

---

## 8. Documentation Updates

### 8.1 Files to Update

| File | Section | Change |
|------|---------|--------|
| `AGENTS.md` | API Routes | Remove cron endpoint references |
| `AGENTS.md` | Common Tasks | Add Inngest function creation guide |
| `README.md` | Setup | Add Inngest configuration steps |
| `docs/API_DOCUMENTATION.md` | Cron Jobs | Remove Vercel Cron section |
| `PHASE_9_AUTO_POSTING_COMPLETE.md` | Cron Jobs | Mark as deprecated |

---

## 9. Cost Analysis

### 9.1 Before Migration
- Vercel: $20/month (Hobby plan for cron)
- Inngest: $0/month (Free tier)
- **Total: $20/month**

### 9.2 After Migration
- Vercel: $0/month (Free tier)
- Inngest: $0/month (Free tier, ~20k runs/month)
- **Total: $0/month**

### 9.3 Annual Savings
- **$240/year** saved by eliminating Vercel Hobby plan

---

## 10. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Inngest downtime | Low | High | Keep Vercel cron for 7 days |
| Missing environment variables | Medium | High | Pre-deployment checklist |
| Cron schedule errors | Low | Medium | Test in staging first |
| Free tier limits exceeded | Very Low | Medium | Monitor usage dashboard |
| OAuth refresh failures | Low | High | Built-in retries + Sentry alerts |

---

**Status:** ✅ Ready for Implementation  
**Next Step:** Create individual function specifications  
**Assigned To:** Coder Agent (pending approval)
