# Post Generation, Scheduling & Auto-Publishing - Implementation Plan

**Feature:** Post Generation, Scheduling & Auto-Publishing with Tier-Based Restrictions  
**Version:** 1.0  
**Created:** 2025-12-02  
**Branch:** `feature/post-generation-scheduling`

---

## Phase 1: Database Schema & Foundation
**Estimated Duration:** 1-2 days

### 1.1 Schema Updates
- [ ] Add `creditReservations` table to track pending credits for scheduled posts
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `postId`, `credits`, `status (pending|consumed|released)`, `createdAt`, `expiresAt`
- [ ] Add `generationLogs` table for AI usage tracking
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `platform`, `topic`, `tone`, `language`, `success`, `errorMessage`, `createdAt`
- [ ] Add `dailyUsage` table for rate limiting
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `date`, `generationsCount`, `postsCount`, `platformBreakdown (jsonb)`
- [ ] Add `notifications` table for user alerts
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `type`, `title`, `message`, `read`, `createdAt`, `expiresAt`
- [ ] Add `jobLogs` table for Inngest job tracking
  - File: `drizzle/schema.ts`
  - Fields: `id`, `inngestEventId`, `functionName`, `status`, `payload`, `result`, `errorMessage`, `retryCount`, `createdAt`, `updatedAt`
- [ ] Update `user` table: add `videoCredits`, `lastCreditReset`, `tierLimits (jsonb)`
  - File: `drizzle/schema.ts`
- [ ] Run database migration
  - Command: `npm run db:push`

### 1.2 Tier Configuration
- [ ] Create tier limits configuration file
  - File: `lib/tiers/config.ts`
  - Contents: Centralized tier limits (connected accounts, queue size, daily limits, etc.)
- [ ] Create tier validation helper functions
  - File: `lib/tiers/validation.ts`
  - Functions: `canConnect()`, `canSchedule()`, `canGenerate()`, `canUseAutomation()`, `getLimit()`
- [ ] Create TypeScript types for tier system
  - File: `lib/tiers/types.ts`

### 1.3 Database Helpers
- [ ] Create credit reservation helpers
  - File: `lib/db/credit-reservations.ts`
  - Functions: `reserveCredits()`, `consumeReservation()`, `releaseReservation()`, `getReservedCredits()`
- [ ] Create generation log helpers
  - File: `lib/db/generation-logs.ts`
  - Functions: `logGeneration()`, `getGenerationStats()`, `getDailyGenerations()`
- [ ] Create daily usage helpers
  - File: `lib/db/daily-usage.ts`
  - Functions: `incrementUsage()`, `getDailyUsage()`, `checkDailyLimit()`, `resetDailyUsage()`
- [ ] Create notification helpers
  - File: `lib/db/notifications.ts`
  - Functions: `createNotification()`, `getUserNotifications()`, `markAsRead()`, `dismissNotification()`
- [ ] Create job log helpers
  - File: `lib/db/job-logs.ts`
  - Functions: `logJob()`, `updateJobStatus()`, `getFailedJobs()`, `getJobStats()`

---

## Phase 2: Inngest Integration
**Estimated Duration:** 2-3 days

### 2.1 Inngest Setup
- [ ] Install Inngest SDK
  - Command: `npm install inngest`
- [ ] Create Inngest client configuration
  - File: `lib/inngest/client.ts`
- [ ] Create Inngest API route handler
  - File: `app/api/inngest/route.ts`
- [ ] Update `vercel.json` to remove old cron job
  - File: `vercel.json`

### 2.2 Inngest Functions
- [ ] Create scheduled post processing function
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Logic: Check credits, post to platform, update status, log result
- [ ] Create automation rule execution function
  - File: `lib/inngest/functions/execute-automation-rule.ts`
  - Logic: Generate content, check credits, schedule/post, update rule stats
- [ ] Create credit expiry check function (daily)
  - File: `lib/inngest/functions/check-credit-expiry.ts`
  - Logic: Check users with credits expiring in 3 days, send notifications
- [ ] Create credit reset function (monthly)
  - File: `lib/inngest/functions/reset-monthly-credits.ts`
  - Logic: Reset credits to base amount on subscription renewal
- [ ] Create low credit warning function
  - File: `lib/inngest/functions/check-low-credits.ts`
  - Logic: Notify users at 20% credits remaining
- [ ] Export all functions in index
  - File: `lib/inngest/functions/index.ts`

### 2.3 Retry Logic
- [ ] Implement exponential backoff for failed posts
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Logic: 3 retries with 1min, 5min, 15min delays
- [ ] Log retry attempts to `jobLogs` table
- [ ] Release credit reservation after final failure

---

## Phase 3: Credit System Refactor
**Estimated Duration:** 1-2 days

### 3.1 Remove Generation Credit Deduction
- [ ] Update AI generation endpoint to NOT deduct credits
  - File: `app/api/ai/generate/route.ts`
  - Change: Remove credit deduction, add generation logging
- [ ] Add tier-based daily generation limit check
  - File: `app/api/ai/generate/route.ts`
- [ ] Log all generations to `generationLogs` table
  - File: `app/api/ai/generate/route.ts`

### 3.2 Publishing Credit Logic
- [ ] Create credit check before publishing
  - File: `app/api/posts/publish/route.ts`
  - Logic: Check available credits >= platforms count
- [ ] Reserve credits when scheduling
  - File: `app/api/posts/schedule/route.ts`
  - Logic: Create reservation, validate queue limits
- [ ] Deduct credits on successful publish
  - File: `lib/posting/post-service.ts`
  - Logic: Consume reservation or deduct directly
- [ ] Release credits on failed publish (after all retries)
  - File: `lib/inngest/functions/process-scheduled-post.ts`

### 3.3 Multi-Platform Credit Calculation
- [ ] Update immediate publish to charge per platform
  - File: `app/api/posts/publish/route.ts`
- [ ] Update scheduled publish to reserve per platform
  - File: `app/api/posts/schedule/route.ts`
- [ ] Display credit cost in scheduling UI
  - File: `components/modals/schedule-post-modal.tsx`

---

## Phase 4: Tier Enforcement
**Estimated Duration:** 2 days

### 4.1 Connected Accounts Limits
- [ ] Add tier check to OAuth connection flow
  - Files: `app/api/oauth/[platform]/connect/route.ts`
- [ ] Count existing connections per platform before allowing new
  - File: `lib/db/connected-accounts.ts`
- [ ] Show limit warning in connection UI
  - File: `components/connected-accounts/connected-accounts-dashboard.tsx`
- [ ] Add upgrade prompt when limit reached
  - File: `components/connected-accounts/connected-accounts-dashboard.tsx`

### 4.2 Scheduling Limits
- [ ] Add queue size check before scheduling
  - File: `app/api/posts/schedule/route.ts`
- [ ] Add advance scheduling limit check
  - File: `app/api/posts/schedule/route.ts`
- [ ] Add daily post limit per platform
  - File: `app/api/posts/publish/route.ts` and `lib/inngest/functions/process-scheduled-post.ts`
- [ ] Show remaining queue slots in UI
  - File: `components/schedule-view.tsx`

### 4.3 Generation Limits
- [ ] Add daily generation limit check
  - File: `app/api/ai/generate/route.ts`
- [ ] Track generations per day in `dailyUsage` table
- [ ] Show remaining generations in AI Studio
  - File: `components/ai-content-studio.tsx`

### 4.4 Automation Limits
- [ ] Disable automation for Free tier
  - Files: `components/automation-view.tsx`, `components/modals/automation-wizard.tsx`
- [ ] Add rule count limit for Pro tier
  - File: `app/api/automation/route.ts` (create if needed)
- [ ] Show automation locked state for Free users
  - File: `components/automation-view.tsx`

### 4.5 Limit Check API
- [ ] Create unified limit check endpoint
  - File: `app/api/limits/check/route.ts`
  - Functions: Check any limit type, return current/max values

---

## Phase 5: Notifications & Warnings
**Estimated Duration:** 1-2 days

### 5.1 Credit Warnings
- [ ] Create low credit warning component
  - File: `components/credit-warning-banner.tsx`
  - Logic: Show when credits < 20% of tier allocation
- [ ] Integrate banner into dashboard layout
  - File: `app/dashboard/layout.tsx` or `components/client-dashboard-view.tsx`
- [ ] Create credit expiry warning
  - File: `components/credit-expiry-warning.tsx`

### 5.2 User Notifications System
- [ ] Create notifications dropdown component
  - File: `components/notifications-dropdown.tsx`
- [ ] Add notifications icon to header
  - File: `components/navigation/header.tsx` or similar
- [ ] Create notification types: `low_credits`, `credits_expiring`, `post_skipped`, `post_failed`, `tier_limit_reached`
- [ ] Implement notification polling or real-time updates
  - File: `lib/hooks/use-notifications.ts`

### 5.3 Scheduled Post Notifications
- [ ] Notify when post skipped due to zero credits
  - File: `lib/inngest/functions/process-scheduled-post.ts`
- [ ] Notify when post failed after retries
  - File: `lib/inngest/functions/process-scheduled-post.ts`

---

## Phase 6: Admin Dashboard Enhancements
**Estimated Duration:** 2-3 days

### 6.1 Analytics Components
- [ ] Create credits analytics component
  - File: `components/admin/credits-analytics.tsx`
  - Display: Credits used per platform, credits used per content type, generation vs publishing breakdown
- [ ] Create generation stats component
  - File: `components/admin/generation-stats.tsx`
  - Display: Total generations, success rate, errors by type, top topics
- [ ] Create publishing stats component
  - File: `components/admin/publishing-stats.tsx`
  - Display: Posts by platform, success rate, failed posts, retry rate
- [ ] Create tier distribution component
  - File: `components/admin/tier-distribution.tsx`
  - Display: Users per tier, revenue estimate, conversion rates

### 6.2 Job Monitoring
- [ ] Create Inngest job monitor component
  - File: `components/admin/job-monitor.tsx`
  - Display: Pending jobs, failed jobs, recent completions
- [ ] Add manual retry button for failed jobs
  - File: `components/admin/job-monitor.tsx`
- [ ] Create job detail modal
  - File: `components/admin/job-detail-modal.tsx`

### 6.3 Error Tracking
- [ ] Create generation errors table component
  - File: `components/admin/generation-errors.tsx`
  - Display: Recent errors, error types, affected users
- [ ] Create publishing errors table component
  - File: `components/admin/publishing-errors.tsx`
  - Display: Failed posts, error messages, retry status
- [ ] Add filtering and search to error tables

### 6.4 Automation Monitoring
- [ ] Create automation rules overview component
  - File: `components/admin/automation-overview.tsx`
  - Display: Active rules by user, credits consumed, next runs

### 6.5 Admin API Endpoints
- [ ] Create admin analytics endpoint
  - File: `app/api/admin/analytics/route.ts`
- [ ] Create admin jobs endpoint
  - File: `app/api/admin/jobs/route.ts`
- [ ] Create admin job retry endpoint
  - File: `app/api/admin/jobs/retry/route.ts`
- [ ] Create admin errors endpoint
  - File: `app/api/admin/errors/route.ts`

### 6.6 Admin Dashboard Integration
- [ ] Update admin dashboard with new components
  - File: `components/admin-dashboard-view.tsx`
- [ ] Add tabbed navigation for different sections
- [ ] Add date range filters
- [ ] Add export functionality (CSV)

---

## Phase 7: Test Accounts & Testing Infrastructure
**Estimated Duration:** 1 day

### 7.1 Seed Data Script
- [ ] Create test account seeding script
  - File: `scripts/seed-test-accounts.ts`
  - Accounts: free@test, pro@test, business@test, admin@test, lowcredit@test, zerocredit@test
- [ ] Add npm script for seeding
  - File: `package.json`
  - Command: `npm run db:seed-test`

### 7.2 Test Account Details
- [ ] Free Test User
  - Email: `free@test.purpleglow.co.za`
  - Password: `TestFree123!`
  - Tier: Free
  - Credits: 10
  - Connected: 1 Instagram
  - Scheduled: 3 posts
- [ ] Pro Test User
  - Email: `pro@test.purpleglow.co.za`
  - Password: `TestPro123!`
  - Tier: Pro
  - Credits: 500
  - Connected: 2 Instagram, 2 Facebook, 1 Twitter
  - Scheduled: 25 posts
  - Automation: 3 rules
- [ ] Business Test User
  - Email: `business@test.purpleglow.co.za`
  - Password: `TestBiz123!`
  - Tier: Business
  - Credits: 2000
  - Connected: 5 each platform
  - Scheduled: 100 posts
  - Automation: 10 rules
- [ ] Admin Test User
  - Email: `admin@test.purpleglow.co.za`
  - Password: `TestAdmin123!`
  - Tier: Business
  - Role: Admin
  - Credits: 2000
- [ ] Low Credit User
  - Email: `lowcredit@test.purpleglow.co.za`
  - Password: `TestLow123!`
  - Tier: Pro
  - Credits: 2
  - Purpose: Test low credit warnings
- [ ] Zero Credit User
  - Email: `zerocredit@test.purpleglow.co.za`
  - Password: `TestZero123!`
  - Tier: Pro
  - Credits: 0
  - Scheduled: 5 posts (to test skipping)
  - Purpose: Test zero credit behavior

### 7.3 Documentation
- [ ] Update AGENTS.md with test account information
  - File: `AGENTS.md`
- [ ] Create testing guide
  - File: `docs/TESTING_GUIDE.md`
- [ ] Document all tier limits and expected behaviors

---

## Phase 8: UI Updates & Polish
**Estimated Duration:** 1-2 days

### 8.1 Credit Display Updates
- [ ] Update credit display to show reserved vs available
  - Files: Dashboard components
- [ ] Add credit cost preview before actions
  - Files: Schedule modal, publish buttons

### 8.2 Limit Indicators
- [ ] Show tier limits in relevant UI sections
- [ ] Add progress bars for usage (e.g., 3/5 daily generations)
- [ ] Add upgrade prompts at limit boundaries

### 8.3 Loading & Error States
- [ ] Add loading states for limit checks
- [ ] Add clear error messages for limit violations
- [ ] Add success feedback for credit operations

---

## Phase 9: Final Integration & Review
**Estimated Duration:** 1 day

### 9.1 Integration Testing
- [ ] Test complete flow: Generate → Schedule → Publish → Credit deduction
- [ ] Test tier enforcement for each tier
- [ ] Test retry logic for failed posts
- [ ] Test admin dashboard with real data
- [ ] Test all test accounts

### 9.2 Documentation Updates
- [ ] Update AGENTS.md with new features
- [ ] Update QUICK_REFERENCE.md
- [ ] Create PHASE_11_POST_GENERATION_COMPLETE.md

### 9.3 Code Review Checklist
- [ ] All TypeScript types defined
- [ ] Error boundaries on new components
- [ ] Loading states implemented
- [ ] Accessibility checked
- [ ] South African context maintained
- [ ] Security validated (session checks, input validation)

---

## Summary

| Phase | Focus | Est. Duration |
|-------|-------|---------------|
| 1 | Database Schema & Foundation | 1-2 days |
| 2 | Inngest Integration | 2-3 days |
| 3 | Credit System Refactor | 1-2 days |
| 4 | Tier Enforcement | 2 days |
| 5 | Notifications & Warnings | 1-2 days |
| 6 | Admin Dashboard Enhancements | 2-3 days |
| 7 | Test Accounts & Testing | 1 day |
| 8 | UI Updates & Polish | 1-2 days |
| 9 | Final Integration & Review | 1 day |
| **Total** | | **12-18 days** |

---

## Dependencies Between Phases

```
Phase 1 (Schema) ─────────────────────────────────────┐
    │                                                 │
    v                                                 v
Phase 2 (Inngest) ──────────> Phase 3 (Credits) ──> Phase 5 (Notifications)
    │                              │                  │
    v                              v                  v
Phase 6 (Admin) <──────────── Phase 4 (Tiers) ─────────┘
    │
    v
Phase 7 (Test Accounts)
    │
    v
Phase 8 (UI Polish)
    │
    v
Phase 9 (Integration)
```

---

## Files Created/Modified

### New Files (35+)
- `lib/tiers/config.ts`
- `lib/tiers/validation.ts`
- `lib/tiers/types.ts`
- `lib/db/credit-reservations.ts`
- `lib/db/generation-logs.ts`
- `lib/db/daily-usage.ts`
- `lib/db/notifications.ts`
- `lib/db/job-logs.ts`
- `lib/inngest/client.ts`
- `lib/inngest/functions/process-scheduled-post.ts`
- `lib/inngest/functions/execute-automation-rule.ts`
- `lib/inngest/functions/check-credit-expiry.ts`
- `lib/inngest/functions/reset-monthly-credits.ts`
- `lib/inngest/functions/check-low-credits.ts`
- `lib/inngest/functions/index.ts`
- `lib/hooks/use-notifications.ts`
- `app/api/inngest/route.ts`
- `app/api/limits/check/route.ts`
- `app/api/admin/analytics/route.ts`
- `app/api/admin/jobs/route.ts`
- `app/api/admin/jobs/retry/route.ts`
- `app/api/admin/errors/route.ts`
- `components/credit-warning-banner.tsx`
- `components/credit-expiry-warning.tsx`
- `components/notifications-dropdown.tsx`
- `components/admin/credits-analytics.tsx`
- `components/admin/generation-stats.tsx`
- `components/admin/publishing-stats.tsx`
- `components/admin/tier-distribution.tsx`
- `components/admin/job-monitor.tsx`
- `components/admin/job-detail-modal.tsx`
- `components/admin/generation-errors.tsx`
- `components/admin/publishing-errors.tsx`
- `components/admin/automation-overview.tsx`
- `scripts/seed-test-accounts.ts`
- `docs/TESTING_GUIDE.md`

### Modified Files (15+)
- `drizzle/schema.ts`
- `vercel.json`
- `package.json`
- `app/api/ai/generate/route.ts`
- `app/api/posts/publish/route.ts`
- `app/api/posts/schedule/route.ts`
- `lib/posting/post-service.ts`
- `components/connected-accounts/connected-accounts-dashboard.tsx`
- `components/schedule-view.tsx`
- `components/ai-content-studio.tsx`
- `components/automation-view.tsx`
- `components/modals/automation-wizard.tsx`
- `components/modals/schedule-post-modal.tsx`
- `components/admin-dashboard-view.tsx`
- `AGENTS.md`
- `QUICK_REFERENCE.md`

---

**Ready for implementation? Let me know when to proceed with Phase 1.**
