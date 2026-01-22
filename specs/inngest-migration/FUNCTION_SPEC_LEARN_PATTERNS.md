# Inngest Function Specification: Learn AI Patterns

**Function ID:** `learn-ai-patterns`  
**Priority:** Medium  
**Complexity:** High  
**Estimated Effort:** 1.5 hours  

---

## 1. Overview

### 1.1 Purpose
Periodically analyze user engagement data and content performance to improve AI-generated content through pattern learning and profile optimization.

### 1.2 Current Implementation
- **File:** `app/api/cron/learn-patterns/route.ts`
- **Schedule:** Daily at 1am UTC / 3am SAST (`0 1 * * *`)
- **Actions:**
  - Calls `promptPatternAnalyzer.analyzeAndUpdatePatterns()`
  - Loops through active users calling `learningProfileService.runLearningAnalysis(userId)`

### 1.3 Migration Target
- **New File:** `lib/inngest/functions/learn-ai-patterns.ts`
- **Trigger:** Cron schedule
- **Schedule:** `0 1 * * *` (daily at 1am UTC / 3am SAST)

---

## 2. Technical Specification

### 2.1 Function Signature

```typescript
/**
 * Inngest Function: Learn AI Patterns
 * 
 * Runs daily to analyze engagement data and update AI prompt patterns.
 * Improves content generation quality through machine learning.
 */

import { inngest } from '../client';
import { promptPatternAnalyzer } from '@/lib/ai/prompt-pattern-analyzer';
import { learningProfileService } from '@/lib/ai/learning-profile-service';
import { db } from '@/drizzle/db';
import { postAnalytics } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { logger } from '@/lib/logger';

export const learnAIPatterns = inngest.createFunction(
  {
    id: 'learn-ai-patterns',
    name: 'Learn AI Patterns',
    retries: 2,
    // Longer timeout for AI analysis
    concurrency: {
      limit: 1, // Run one at a time to avoid DB contention
    },
  },
  // Cron schedule: Daily at 1am UTC (3am SAST)
  { cron: '0 1 * * *' },
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
    functionName: 'learn-ai-patterns',
    status: 'running',
    payload: { timestamp: new Date().toISOString() },
  });
});
```

**Step 2: Run System-Wide Pattern Analysis**
```typescript
await step.run('analyze-patterns', async () => {
  logger.ai.info('Starting system-wide pattern analysis');
  await promptPatternAnalyzer.analyzeAndUpdatePatterns();
  logger.ai.info('Pattern analysis complete');
});
```

**Step 3: Get Active Users**
```typescript
const activeUsers = await step.run('get-active-users', async () => {
  const users = await db.selectDistinct({ userId: postAnalytics.userId })
    .from(postAnalytics)
    .orderBy(desc(postAnalytics.createdAt))
    .limit(100); // Process top 100 active users

  logger.ai.info('Active users found', { count: users.length });
  return users;
});
```

**Step 4: Process Each User (Batched)**
```typescript
const processingResults = await step.run('process-users', async () => {
  let usersProcessed = 0;
  let usersFailed = 0;
  const errors: Array<{ userId: string; error: string }> = [];

  for (const { userId } of activeUsers) {
    try {
      await learningProfileService.runLearningAnalysis(userId);
      usersProcessed++;
      
      // Log progress every 10 users
      if (usersProcessed % 10 === 0) {
        logger.ai.info('Learning progress', { processed: usersProcessed, total: activeUsers.length });
      }
    } catch (error) {
      usersFailed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ userId: userId.substring(0, 8) + '...', error: errorMessage });
      logger.ai.error('Learning failed for user', { userId, error: errorMessage });
    }
  }

  return { usersProcessed, usersFailed, errors };
});
```

**Step 5: Finalize and Log Results**
```typescript
await step.run('finalize', async () => {
  const result = {
    usersChecked: activeUsers.length,
    usersProcessed: processingResults.usersProcessed,
    usersFailed: processingResults.usersFailed,
    errors: processingResults.errors.slice(0, 10), // Limit error list
    timestamp: new Date().toISOString(),
  };

  logger.ai.info('Pattern learning complete', result);

  await updateJobStatus(jobLog.id, 'completed', { result });

  return result;
});
```

### 2.3 Error Handling

```typescript
try {
  // ... all steps above
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  logger.ai.exception(error, { action: 'learn-patterns-cron' });
  
  await updateJobStatus(jobLog.id, 'failed', { errorMessage });
  
  throw error; // Re-throw for Inngest retry
}
```

---

## 3. Complete Implementation

### 3.1 File: `lib/inngest/functions/learn-ai-patterns.ts`

```typescript
/**
 * Inngest Function: Learn AI Patterns
 * 
 * Runs daily to analyze engagement data and update AI prompt patterns.
 * Improves content generation quality through pattern learning.
 * 
 * Schedule: 0 1 * * * (daily at 1am UTC / 3am SAST)
 * 
 * Actions:
 * 1. System-wide pattern analysis (all users)
 * 2. Individual user learning profiles (top 100 active)
 */

import { inngest } from '../client';
import { promptPatternAnalyzer } from '@/lib/ai/prompt-pattern-analyzer';
import { learningProfileService } from '@/lib/ai/learning-profile-service';
import { db } from '@/drizzle/db';
import { postAnalytics } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { logger } from '@/lib/logger';

const MAX_USERS_TO_PROCESS = 100;

export const learnAIPatterns = inngest.createFunction(
  {
    id: 'learn-ai-patterns',
    name: 'Learn AI Patterns',
    retries: 2,
    concurrency: {
      limit: 1, // Run one at a time to avoid resource contention
    },
  },
  { cron: '0 1 * * *' },
  async ({ step }) => {
    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        functionName: 'learn-ai-patterns',
        status: 'running',
        payload: { timestamp: new Date().toISOString() },
      });
    });

    try {
      // Step 1: Run system-wide pattern analysis
      await step.run('analyze-patterns', async () => {
        logger.ai.info('Starting system-wide pattern analysis');
        await promptPatternAnalyzer.analyzeAndUpdatePatterns();
        logger.ai.info('Pattern analysis complete');
      });

      // Step 2: Get active users with recent analytics
      const activeUsers = await step.run('get-active-users', async () => {
        const users = await db.selectDistinct({ userId: postAnalytics.userId })
          .from(postAnalytics)
          .orderBy(desc(postAnalytics.createdAt))
          .limit(MAX_USERS_TO_PROCESS);

        logger.ai.info('Active users found for learning', { count: users.length });
        return users;
      });

      // Step 3: Process learning analysis for each active user
      const processingResults = await step.run('process-users', async () => {
        let usersProcessed = 0;
        let usersFailed = 0;
        const errors: Array<{ userId: string; error: string }> = [];

        for (const { userId } of activeUsers) {
          try {
            await learningProfileService.runLearningAnalysis(userId);
            usersProcessed++;
            
            // Log progress every 10 users
            if (usersProcessed % 10 === 0) {
              logger.ai.info('Learning progress', { 
                processed: usersProcessed, 
                total: activeUsers.length 
              });
            }
          } catch (error) {
            usersFailed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push({ 
              userId: userId.substring(0, 8) + '...', // Privacy: partial ID
              error: errorMessage 
            });
            logger.ai.error('Learning analysis failed for user', { userId, error: errorMessage });
          }
        }

        return { usersProcessed, usersFailed, errors };
      });

      // Step 4: Finalize and log results
      const finalResult = await step.run('finalize', async () => {
        const result = {
          usersChecked: activeUsers.length,
          usersProcessed: processingResults.usersProcessed,
          usersFailed: processingResults.usersFailed,
          successRate: activeUsers.length > 0 
            ? ((processingResults.usersProcessed / activeUsers.length) * 100).toFixed(2) + '%'
            : '0%',
          errors: processingResults.errors.slice(0, 10), // Limit error list in logs
          timestamp: new Date().toISOString(),
        };

        logger.ai.info('Pattern learning job complete', {
          usersChecked: result.usersChecked,
          usersProcessed: result.usersProcessed,
          successRate: result.successRate,
        });

        await updateJobStatus(jobLog.id, 'completed', { result });

        return result;
      });

      return {
        success: true,
        message: 'Pattern learning completed',
        ...finalResult,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.ai.exception(error, { action: 'learn-patterns-cron' });
      
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
- `promptPatternAnalyzer` - From `@/lib/ai/prompt-pattern-analyzer`
- `learningProfileService` - From `@/lib/ai/learning-profile-service`
- `db` - Drizzle database client
- `postAnalytics` - Schema from `@/drizzle/schema`
- `logJob()`, `updateJobStatus()` - From `@/lib/db/job-logs`
- `logger` - From `@/lib/logger`

### 4.2 External Services
- Google Gemini API (for AI analysis)
- Database (for analytics queries)

### 4.3 Database Tables
- `post_analytics` - Read (engagement data)
- `user_learning_profiles` - Read/Write
- `prompt_patterns` - Read/Write
- `job_logs` - Write

---

## 5. AI Learning Services (Existing)

### 5.1 `promptPatternAnalyzer.analyzeAndUpdatePatterns()`

From `lib/ai/prompt-pattern-analyzer.ts`:
- Analyzes system-wide content performance
- Identifies successful prompt patterns
- Updates pattern database
- No user-specific data

**Execution Time:** ~30-60 seconds

### 5.2 `learningProfileService.runLearningAnalysis(userId)`

From `lib/ai/learning-profile-service.ts`:
- Analyzes user-specific engagement
- Updates user learning profile
- Identifies preferences (tone, topics, timing)
- Personalizes future content generation

**Execution Time:** ~5-10 seconds per user

---

## 6. Performance Optimization

### 6.1 Batching Strategy

**Option 1: Process All in One Step (Current)**
- Simple implementation
- Risk: Long execution time
- Max time: 100 users × 10s = ~17 minutes

**Option 2: Batch Processing (Future Enhancement)**
```typescript
// Process in batches of 20
const BATCH_SIZE = 20;
for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
  const batch = activeUsers.slice(i, i + BATCH_SIZE);
  await step.run(`process-batch-${i}`, async () => {
    return await Promise.all(
      batch.map(({ userId }) => learningProfileService.runLearningAnalysis(userId))
    );
  });
}
```

### 6.2 Concurrency Control

```typescript
concurrency: {
  limit: 1, // Only one pattern learning job at a time
}
```

This prevents:
- Database connection exhaustion
- Gemini API rate limiting
- Resource contention

---

## 7. Testing Strategy

### 7.1 Unit Testing (Manual)

**Test 1: No Active Users**
```typescript
// Delete all post analytics
await db.delete(postAnalytics).where(sql`true`);

// Trigger function
const result = await inngest.send({ name: 'cron/learn-patterns', data: {} });

// Should complete with 0 users processed
expect(result.usersChecked).toBe(0);
```

**Test 2: Active Users**
```typescript
// Create analytics for 5 test users
for (let i = 0; i < 5; i++) {
  await createPostAnalytics({ userId: `user-${i}`, likes: 100 });
}

// Trigger function
const result = await inngest.send({ name: 'cron/learn-patterns', data: {} });

// Should process all users
expect(result.usersProcessed).toBe(5);
expect(result.successRate).toBe('100%');
```

**Test 3: Partial Failures**
```typescript
// Mock learningProfileService to fail for some users
const result = await inngest.send({ name: 'cron/learn-patterns', data: {} });

// Should log failures but complete job
expect(result.usersFailed).toBeGreaterThan(0);
expect(result.success).toBe(true);
```

### 7.2 Integration Testing

**Staging:**
1. Seed database with test analytics
2. Wait for daily execution (or trigger manually)
3. Verify pattern updates in database
4. Check execution time < 20 minutes
5. Verify no Sentry errors

**Production:**
1. Monitor first 3 executions
2. Check success rate > 90%
3. Verify execution time trends
4. Ensure no performance degradation

---

## 8. Acceptance Criteria

- [ ] Function compiles with no TypeScript errors
- [ ] Function registered in `app/api/inngest/route.ts`
- [ ] Cron schedule set to `0 1 * * *`
- [ ] Executes successfully in local dev
- [ ] Processes up to 100 active users
- [ ] Success rate > 90%
- [ ] Handles individual user failures gracefully
- [ ] Logs results to job_logs table
- [ ] Logs to structured logger
- [ ] Retries on failure (up to 2 times)
- [ ] Execution time < 20 minutes
- [ ] Works in staging environment
- [ ] No errors after 72 hours in production

---

## 9. Monitoring

### 9.1 Key Metrics
- **Execution frequency:** Daily at 3am SAST
- **Users processed:** 10-100 per run
- **Execution time:** 5-20 minutes
- **Success rate:** > 90%
- **Pattern updates:** Varies

### 9.2 Alerts
- Alert if success rate < 80%
- Alert if execution time > 30 minutes
- Alert if > 2 consecutive failures
- Alert if 0 users processed for 3 days (anomaly)

### 9.3 Inngest Dashboard Monitoring
- View execution history
- Inspect step-by-step traces
- Check retry attempts
- Review error logs

---

## 10. Notes

### 10.1 Why Daily at 3am SAST?
- Low user activity (minimal interference)
- After midnight posts are published
- Fresh analytics data available
- Before peak usage hours (8am-10pm)

### 10.2 Learning Profile Benefits
- Personalized content recommendations
- Better engagement prediction
- Optimized posting times
- Improved hashtag suggestions
- Tone adaptation per user

### 10.3 Pattern Analyzer Benefits
- System-wide best practices
- Cross-user insights
- Platform-specific optimizations
- Trending topic detection

### 10.4 Future Enhancements
- [ ] Parallel user processing (batches)
- [ ] Incremental learning (process new users only)
- [ ] A/B testing integration
- [ ] Real-time pattern updates (event-driven)
- [ ] ML model versioning

---

## 11. Rollback Considerations

If pattern learning causes issues:
1. Disable function in Inngest dashboard
2. Patterns remain at last successful state
3. Content generation continues with cached patterns
4. No immediate user impact
5. Re-enable after investigation

---

**Status:** ✅ Ready for Implementation  
**Next:** Assign to Coder Agent  
**Complexity Note:** Highest complexity due to AI integration and user loops
