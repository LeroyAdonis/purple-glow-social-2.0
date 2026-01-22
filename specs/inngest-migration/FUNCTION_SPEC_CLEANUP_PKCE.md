# Inngest Function Specification: Cleanup PKCE Verifiers

**Function ID:** `cleanup-pkce-verifiers`  
**Priority:** High  
**Complexity:** Low  
**Estimated Effort:** 30 minutes  

---

## 1. Overview

### 1.1 Purpose
Periodically delete expired PKCE (Proof Key for Code Exchange) verifiers from the database to prevent bloat and maintain security.

### 1.2 Current Implementation
- **File:** `app/api/cron/cleanup-pkce/route.ts`
- **Schedule:** Hourly (`0 * * * *`)
- **Action:** Calls `cleanupExpiredPKCEVerifiers()` and `getActivePKCECount()`

### 1.3 Migration Target
- **New File:** `lib/inngest/functions/cleanup-pkce-verifiers.ts`
- **Trigger:** Cron schedule
- **Schedule:** `0 * * * *` (every hour at :00)

---

## 2. Technical Specification

### 2.1 Function Signature

```typescript
/**
 * Inngest Function: Cleanup PKCE Verifiers
 * 
 * Runs hourly to remove expired PKCE verifiers from database.
 * This prevents database bloat and ensures security.
 */

import { inngest } from '../client';
import { cleanupExpiredPKCEVerifiers, getActivePKCECount } from '@/lib/db/pkce-verifiers';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { logger } from '@/lib/logger';

export const cleanupPKCEVerifiers = inngest.createFunction(
  {
    id: 'cleanup-pkce-verifiers',
    name: 'Cleanup PKCE Verifiers',
    retries: 2, // Retry twice on failure
  },
  // Cron schedule: Every hour at :00
  { cron: '0 * * * *' },
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
    functionName: 'cleanup-pkce-verifiers',
    status: 'running',
    payload: { timestamp: new Date().toISOString() },
  });
});
```

**Step 2: Get Count Before Cleanup**
```typescript
const countBefore = await step.run('get-count-before', async () => {
  const count = await getActivePKCECount();
  logger.cron.info('PKCE cleanup starting', { activeCount: count });
  return count;
});
```

**Step 3: Clean Up Expired Verifiers**
```typescript
const deletedCount = await step.run('cleanup-expired', async () => {
  return await cleanupExpiredPKCEVerifiers();
});
```

**Step 4: Get Count After Cleanup**
```typescript
const countAfter = await step.run('get-count-after', async () => {
  return await getActivePKCECount();
});
```

**Step 5: Update Job Log and Return**
```typescript
await step.run('finalize', async () => {
  const result = {
    deletedCount,
    activeBefore: countBefore,
    activeAfter: countAfter,
    timestamp: new Date().toISOString(),
  };

  logger.cron.info('PKCE cleanup complete', result);

  await updateJobStatus(jobLog.id, 'completed', { result });

  return result;
});
```

### 2.3 Error Handling

```typescript
// Wrap in try-catch
try {
  // ... all steps above
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  logger.cron.exception(error, { action: 'cleanup-pkce' });
  
  await updateJobStatus(jobLog.id, 'failed', { errorMessage });
  
  throw error; // Re-throw for Inngest retry
}
```

---

## 3. Complete Implementation

### 3.1 File: `lib/inngest/functions/cleanup-pkce-verifiers.ts`

```typescript
/**
 * Inngest Function: Cleanup PKCE Verifiers
 * 
 * Runs hourly to remove expired PKCE verifiers from database.
 * This prevents database bloat and ensures security.
 * 
 * Schedule: 0 * * * * (every hour at :00)
 */

import { inngest } from '../client';
import { cleanupExpiredPKCEVerifiers, getActivePKCECount } from '@/lib/db/pkce-verifiers';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { logger } from '@/lib/logger';

export const cleanupPKCEVerifiers = inngest.createFunction(
  {
    id: 'cleanup-pkce-verifiers',
    name: 'Cleanup PKCE Verifiers',
    retries: 2,
  },
  { cron: '0 * * * *' },
  async ({ step }) => {
    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        functionName: 'cleanup-pkce-verifiers',
        status: 'running',
        payload: { timestamp: new Date().toISOString() },
      });
    });

    try {
      // Get count before cleanup
      const countBefore = await step.run('get-count-before', async () => {
        const count = await getActivePKCECount();
        logger.cron.info('PKCE cleanup starting', { activeCount: count });
        return count;
      });

      // Clean up expired verifiers
      const deletedCount = await step.run('cleanup-expired', async () => {
        return await cleanupExpiredPKCEVerifiers();
      });

      // Get count after cleanup
      const countAfter = await step.run('get-count-after', async () => {
        return await getActivePKCECount();
      });

      // Finalize and log results
      const result = await step.run('finalize', async () => {
        const resultData = {
          deletedCount,
          activeBefore: countBefore,
          activeAfter: countAfter,
          timestamp: new Date().toISOString(),
        };

        logger.cron.info('PKCE cleanup complete', resultData);

        await updateJobStatus(jobLog.id, 'completed', { result: resultData });

        return resultData;
      });

      return {
        success: true,
        ...result,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.cron.exception(error, { action: 'cleanup-pkce' });
      
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
- `cleanupExpiredPKCEVerifiers()` - From `@/lib/db/pkce-verifiers`
- `getActivePKCECount()` - From `@/lib/db/pkce-verifiers`
- `logJob()`, `updateJobStatus()` - From `@/lib/db/job-logs`
- `logger` - From `@/lib/logger`

### 4.2 Database Tables
- `pkce_verifiers` - Read and delete

---

## 5. Testing Strategy

### 5.1 Unit Testing (Manual)

**Test 1: Successful Cleanup**
```typescript
// Create expired verifier
const verifier = await createPKCEVerifier({
  codeVerifier: 'test-verifier',
  expiresAt: new Date(Date.now() - 1000), // Expired
});

// Trigger function
await inngest.send({ name: 'cron/cleanup-pkce', data: {} });

// Verify deleted
const count = await getActivePKCECount();
expect(count).toBe(0);
```

**Test 2: No Expired Verifiers**
```typescript
// Create valid verifier
await createPKCEVerifier({
  codeVerifier: 'test-verifier',
  expiresAt: new Date(Date.now() + 600000), // 10 min future
});

// Trigger function
const result = await inngest.send({ name: 'cron/cleanup-pkce', data: {} });

// Verify none deleted
expect(result.deletedCount).toBe(0);
```

### 5.2 Integration Testing

**Staging:**
1. Deploy to staging
2. Wait for hourly execution (or trigger manually)
3. Check Inngest dashboard for success
4. Verify database cleanup
5. Check Sentry for errors

**Production:**
1. Monitor first 3 executions
2. Verify counts in logs
3. Ensure no performance issues

---

## 6. Acceptance Criteria

- [ ] Function compiles with no TypeScript errors
- [ ] Function registered in `app/api/inngest/route.ts`
- [ ] Cron schedule set to `0 * * * *`
- [ ] Executes successfully in local dev
- [ ] Deletes expired verifiers correctly
- [ ] Logs results to job_logs table
- [ ] Logs to structured logger
- [ ] Retries on failure (up to 2 times)
- [ ] Works in staging environment
- [ ] No errors after 72 hours in production

---

## 7. Monitoring

### 7.1 Key Metrics
- **Execution frequency:** Every hour
- **Expected deletions:** 0-50 per run
- **Execution time:** < 5 seconds
- **Failure rate:** < 1%

### 7.2 Alerts
- Alert if > 3 consecutive failures
- Alert if execution time > 30 seconds
- Alert if deleted count > 1000 (anomaly)

---

## 8. Notes

### 8.1 PKCE Lifecycle
- Verifiers created during OAuth initialization
- Expiration: 10 minutes from creation
- Cleanup prevents table from growing unbounded

### 8.2 Security Considerations
- Only deletes expired verifiers (not active ones)
- Does not affect ongoing OAuth flows
- Safe to run more frequently if needed

---

**Status:** ✅ Ready for Implementation  
**Next:** Assign to Coder Agent
