# Inngest Function Specification: Refresh OAuth Tokens

**Function ID:** `refresh-oauth-tokens`  
**Priority:** High  
**Complexity:** Medium  
**Estimated Effort:** 1 hour  

---

## 1. Overview

### 1.1 Purpose
Periodically refresh expiring OAuth tokens for connected social media accounts (Facebook, Instagram, Twitter, LinkedIn) to maintain uninterrupted posting capabilities.

### 1.2 Current Implementation
- **File:** `app/api/cron/refresh-tokens/route.ts`
- **Schedule:** Every 6 hours (`0 */6 * * *`)
- **Action:** Calls `refreshExpiringTokens()` from `@/lib/oauth/token-refresh-service`

### 1.3 Migration Target
- **New File:** `lib/inngest/functions/refresh-oauth-tokens.ts`
- **Trigger:** Cron schedule
- **Schedule:** `0 */6 * * *` (every 6 hours at :00)

---

## 2. Technical Specification

### 2.1 Function Signature

```typescript
/**
 * Inngest Function: Refresh OAuth Tokens
 * 
 * Runs every 6 hours to refresh expiring OAuth tokens for social platforms.
 * Ensures continuous posting capabilities without user re-authentication.
 */

import { inngest } from '../client';
import { refreshExpiringTokens } from '@/lib/oauth/token-refresh-service';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { logger } from '@/lib/logger';

export const refreshOAuthTokens = inngest.createFunction(
  {
    id: 'refresh-oauth-tokens',
    name: 'Refresh OAuth Tokens',
    retries: 3, // Higher retries due to external API calls
  },
  // Cron schedule: Every 6 hours at :00
  { cron: '0 */6 * * *' },
  async ({ step }) => {
    // Implementation here
  }
);
```

### 2.2 Implementation Steps

**Step 1: Log Job Start**
```typescript
const jobLog = await step.run('log-job-start', async () => {
  return await logJob({
    functionName: 'refresh-oauth-tokens',
    status: 'running',
    payload: { timestamp: new Date().toISOString() },
  });
});
```

**Step 2: Refresh Expiring Tokens**
```typescript
const results = await step.run('refresh-tokens', async () => {
  logger.oauth.info('Starting token refresh job');
  return await refreshExpiringTokens();
});
```

**Step 3: Process Results**
```typescript
const summary = await step.run('process-results', async () => {
  const summaryData = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    byPlatform: {
      facebook: results.filter(r => r.platform === 'facebook').length,
      instagram: results.filter(r => r.platform === 'instagram').length,
      twitter: results.filter(r => r.platform === 'twitter').length,
      linkedin: results.filter(r => r.platform === 'linkedin').length,
    },
    details: results.map(r => ({
      platform: r.platform,
      userId: r.userId.substring(0, 8) + '...', // Privacy
      success: r.success,
      error: r.error,
      newExpiresAt: r.newExpiresAt?.toISOString(),
    })),
  };

  logger.oauth.info('Token refresh completed', summaryData);

  return summaryData;
});
```

**Step 4: Update Job Log**
```typescript
await step.run('finalize', async () => {
  await updateJobStatus(jobLog.id, 'completed', { result: summary });
  
  return summary;
});
```

### 2.3 Error Handling

```typescript
try {
  // ... all steps above
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  logger.oauth.exception(error, { action: 'refresh-tokens-cron' });
  
  await updateJobStatus(jobLog.id, 'failed', { errorMessage });
  
  throw error; // Re-throw for Inngest retry
}
```

---

## 3. Complete Implementation

### 3.1 File: `lib/inngest/functions/refresh-oauth-tokens.ts`

```typescript
/**
 * Inngest Function: Refresh OAuth Tokens
 * 
 * Runs every 6 hours to refresh expiring OAuth tokens for social platforms.
 * Ensures continuous posting capabilities without user re-authentication.
 * 
 * Schedule: 0 */6 * * * (every 6 hours at :00)
 * Platforms: Facebook, Instagram, Twitter/X, LinkedIn
 */

import { inngest } from '../client';
import { refreshExpiringTokens } from '@/lib/oauth/token-refresh-service';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { logger } from '@/lib/logger';

export const refreshOAuthTokens = inngest.createFunction(
  {
    id: 'refresh-oauth-tokens',
    name: 'Refresh OAuth Tokens',
    retries: 3,
  },
  { cron: '0 */6 * * *' },
  async ({ step }) => {
    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        functionName: 'refresh-oauth-tokens',
        status: 'running',
        payload: { timestamp: new Date().toISOString() },
      });
    });

    try {
      // Refresh expiring tokens
      const results = await step.run('refresh-tokens', async () => {
        logger.oauth.info('Starting OAuth token refresh job');
        return await refreshExpiringTokens();
      });

      // Process and summarize results
      const summary = await step.run('process-results', async () => {
        const summaryData = {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          byPlatform: {
            facebook: results.filter(r => r.platform === 'facebook').length,
            instagram: results.filter(r => r.platform === 'instagram').length,
            twitter: results.filter(r => r.platform === 'twitter').length,
            linkedin: results.filter(r => r.platform === 'linkedin').length,
          },
          details: results.map(r => ({
            platform: r.platform,
            userId: r.userId.substring(0, 8) + '...', // Partial for privacy
            success: r.success,
            error: r.error,
            newExpiresAt: r.newExpiresAt?.toISOString(),
          })),
        };

        logger.oauth.info('Token refresh job completed', {
          total: summaryData.total,
          successful: summaryData.successful,
          failed: summaryData.failed,
        });

        return summaryData;
      });

      // Update job log with final results
      await step.run('finalize', async () => {
        await updateJobStatus(jobLog.id, 'completed', { result: summary });
      });

      return {
        success: true,
        message: 'Token refresh completed',
        summary,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.oauth.exception(error, { action: 'refresh-tokens-cron' });
      
      await updateJobStatus(jobLog.id, 'failed', { errorMessage });
      
      throw error; // Re-throw for Inngest retry
    }
  }
);
```

---

## 4. Dependencies

### 4.1 Imports Required
- `inngest` - Inngest client
- `refreshExpiringTokens()` - From `@/lib/oauth/token-refresh-service`
- `logJob()`, `updateJobStatus()` - From `@/lib/db/job-logs`
- `logger` - From `@/lib/logger`

### 4.2 External Services
- Facebook Graph API
- Instagram Graph API
- Twitter/X API v2
- LinkedIn API

### 4.3 Database Tables
- `connected_accounts` - Read and update
- `job_logs` - Write

---

## 5. Token Refresh Logic (Existing Service)

### 5.1 `refreshExpiringTokens()` Behavior

From `lib/oauth/token-refresh-service.ts`:
- Finds tokens expiring within 7 days
- Calls platform-specific refresh endpoints
- Updates `connected_accounts` with new tokens
- Returns array of results with success/failure status

### 5.2 Platform-Specific Refresh

| Platform | Refresh Method | Token Expiry |
|----------|----------------|--------------|
| Facebook | Long-lived token refresh | 60 days |
| Instagram | Long-lived token refresh | 60 days |
| Twitter/X | Refresh token grant | N/A (no expiry) |
| LinkedIn | Refresh token grant | 365 days |

---

## 6. Testing Strategy

### 6.1 Unit Testing (Manual)

**Test 1: No Expiring Tokens**
```typescript
// All tokens valid for > 7 days
await inngest.send({ name: 'cron/refresh-tokens', data: {} });

// Should complete with 0 tokens refreshed
expect(result.summary.total).toBe(0);
```

**Test 2: Expiring Tokens**
```typescript
// Manually set token to expire in 3 days
await db.update(connected_accounts)
  .set({ expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) })
  .where(eq(connected_accounts.id, accountId));

// Trigger refresh
await inngest.send({ name: 'cron/refresh-tokens', data: {} });

// Should refresh and update expiry
expect(result.summary.successful).toBeGreaterThan(0);
```

**Test 3: Platform API Failure**
```typescript
// Mock platform API to return 500 error
// Trigger refresh
const result = await inngest.send({ name: 'cron/refresh-tokens', data: {} });

// Should log failure but not crash
expect(result.summary.failed).toBeGreaterThan(0);
expect(result.success).toBe(true); // Job completes despite failures
```

### 6.2 Integration Testing

**Staging:**
1. Create test accounts on all platforms
2. Set tokens to expire soon
3. Wait for 6-hour cron (or trigger manually)
4. Verify tokens refreshed in database
5. Test posting with refreshed tokens

**Production:**
1. Monitor first 3 executions
2. Check success rate > 95%
3. Verify no user complaints about disconnections

---

## 7. Acceptance Criteria

- [ ] Function compiles with no TypeScript errors
- [ ] Function registered in `app/api/inngest/route.ts`
- [ ] Cron schedule set to `0 */6 * * *`
- [ ] Executes successfully in local dev
- [ ] Refreshes tokens expiring within 7 days
- [ ] Handles platform API failures gracefully
- [ ] Logs results to job_logs table
- [ ] Logs to structured logger
- [ ] Retries on failure (up to 3 times)
- [ ] Works in staging environment
- [ ] No errors after 72 hours in production
- [ ] Success rate > 95%

---

## 8. Monitoring

### 8.1 Key Metrics
- **Execution frequency:** Every 6 hours
- **Expected refreshes:** 5-50 per run
- **Execution time:** 10-60 seconds
- **Success rate:** > 95%

### 8.2 Alerts
- Alert if success rate < 90%
- Alert if execution time > 5 minutes
- Alert if > 2 consecutive failures
- Alert if 0 tokens refreshed for 48 hours (anomaly)

---

## 9. Notes

### 9.1 Token Expiry Windows
- Facebook/Instagram: Expire after 60 days, refresh if < 7 days
- Twitter: No expiry (refresh token never expires)
- LinkedIn: Expire after 365 days, refresh if < 7 days

### 9.2 Security Considerations
- Tokens encrypted at rest (AES-256-GCM)
- Partial user IDs in logs (privacy)
- Failed refreshes logged to Sentry
- Rate limiting handled by OAuth providers

### 9.3 Failure Scenarios
- **Platform API down:** Retry 3 times, then skip until next run
- **Invalid refresh token:** User must reconnect account
- **Network timeout:** Retry with exponential backoff
- **Rate limit:** Wait and retry in next cron cycle

---

**Status:** ✅ Ready for Implementation  
**Next:** Assign to Coder Agent
