# Post Generation, Scheduling & Auto-Publishing - Implementation Plan

**Feature:** Post Generation, Scheduling & Auto-Publishing with Tier-Based Restrictions  
**Version:** 1.0  
**Created:** 2025-12-02  
**Branch:** `feature/post-generation-scheduling`

---

## Phase 1: Database Schema & Foundation ✅ COMPLETE
**Estimated Duration:** 1-2 days  
**Completed:** 2025-12-02

### 1.1 Schema Updates
- [x] Add `creditReservations` table to track pending credits for scheduled posts
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `postId`, `credits`, `status (pending|consumed|released)`, `createdAt`, `expiresAt`
- [x] Add `generationLogs` table for AI usage tracking
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `platform`, `topic`, `tone`, `language`, `success`, `errorMessage`, `createdAt`
- [x] Add `dailyUsage` table for rate limiting
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `date`, `generationsCount`, `postsCount`, `platformBreakdown (jsonb)`
- [x] Add `notifications` table for user alerts
  - File: `drizzle/schema.ts`
  - Fields: `id`, `userId`, `type`, `title`, `message`, `read`, `createdAt`, `expiresAt`
- [x] Add `jobLogs` table for Inngest job tracking
  - File: `drizzle/schema.ts`
  - Fields: `id`, `inngestEventId`, `functionName`, `status`, `payload`, `result`, `errorMessage`, `retryCount`, `createdAt`, `updatedAt`
- [x] Update `user` table: add `videoCredits`, `lastCreditReset`, `tierLimits (jsonb)`
  - File: `drizzle/schema.ts`
- [x] Run database migration
  - Command: `npm run db:push`

### 1.2 Tier Configuration
- [x] Create tier limits configuration file
  - File: `lib/tiers/config.ts`
  - Contents: Centralized tier limits (connected accounts, queue size, daily limits, etc.)
- [x] Create tier validation helper functions
  - File: `lib/tiers/validation.ts`
  - Functions: `canConnect()`, `canSchedule()`, `canGenerate()`, `canUseAutomation()`, `getLimit()`
- [x] Create TypeScript types for tier system
  - File: `lib/tiers/types.ts`

### 1.3 Database Helpers
- [x] Create credit reservation helpers
  - File: `lib/db/credit-reservations.ts`
  - Functions: `reserveCredits()`, `consumeReservation()`, `releaseReservation()`, `getReservedCredits()`
- [x] Create generation log helpers
  - File: `lib/db/generation-logs.ts`
  - Functions: `logGeneration()`, `getGenerationStats()`, `getDailyGenerations()`
- [x] Create daily usage helpers
  - File: `lib/db/daily-usage.ts`
  - Functions: `incrementUsage()`, `getDailyUsage()`, `checkDailyLimit()`, `resetDailyUsage()`
- [x] Create notification helpers
  - File: `lib/db/notifications.ts`
  - Functions: `createNotification()`, `getUserNotifications()`, `markAsRead()`, `dismissNotification()`
- [x] Create job log helpers
  - File: `lib/db/job-logs.ts`
  - Functions: `logJob()`, `updateJobStatus()`, `getFailedJobs()`, `getJobStats()`

---

## Phase 2: Inngest Integration ✅ COMPLETE
**Estimated Duration:** 2-3 days  
**Completed:** 2025-12-02

### 2.1 Inngest Setup
- [x] Install Inngest SDK
  - Command: `npm install inngest`
- [x] Create Inngest client configuration
  - File: `lib/inngest/client.ts`
- [x] Create Inngest API route handler
  - File: `app/api/inngest/route.ts`
- [x] Update `vercel.json` to remove old cron job
  - File: `vercel.json`
  - Note: Kept existing cron as fallback; Inngest runs in parallel

### 2.2 Inngest Functions
- [x] Create scheduled post processing function
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Logic: Check credits, post to platform, update status, log result
- [x] Create automation rule execution function
  - File: `lib/inngest/functions/execute-automation-rule.ts`
  - Logic: Generate content, check credits, schedule/post, update rule stats
- [x] Create credit expiry check function (daily)
  - File: `lib/inngest/functions/check-credit-expiry.ts`
  - Logic: Check users with credits expiring in 3 days, send notifications
- [x] Create credit reset function (monthly)
  - File: `lib/inngest/functions/reset-monthly-credits.ts`
  - Logic: Reset credits to base amount on subscription renewal
- [x] Create low credit warning function
  - File: `lib/inngest/functions/check-low-credits.ts`
  - Logic: Notify users at 20% credits remaining
- [x] Export all functions in index
  - File: `lib/inngest/functions/index.ts`

### 2.3 Retry Logic
- [x] Implement exponential backoff for failed posts
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Logic: 3 retries with 1min, 5min, 15min delays
- [x] Log retry attempts to `jobLogs` table
- [x] Release credit reservation after final failure

---

## Phase 3: Credit System Refactor ✅ COMPLETE
**Estimated Duration:** 1-2 days
**Completed:** 2025-12-02

### 3.1 Remove Generation Credit Deduction
- [x] Update AI generation endpoint to NOT deduct credits
  - File: `app/api/ai/generate/route.ts`
  - Change: Remove credit deduction, add generation logging
- [x] Add tier-based daily generation limit check
  - File: `app/api/ai/generate/route.ts`
- [x] Log all generations to `generationLogs` table
  - File: `app/api/ai/generate/route.ts`

### 3.2 Publishing Credit Logic
- [x] Create credit check before publishing
  - File: `app/api/posts/publish/route.ts`
  - Logic: Check available credits >= platforms count
- [x] Reserve credits when scheduling
  - File: `app/api/posts/schedule/route.ts`
  - Logic: Create reservation, validate queue limits
- [x] Deduct credits on successful publish
  - File: `app/api/posts/publish/route.ts`
  - Logic: Consume reservation or deduct directly
- [x] Release credits on failed publish (after all retries)
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Logic: Uses Inngest `onFailure` hook for cleanup

### 3.3 Multi-Platform Credit Calculation
- [x] Update immediate publish to charge per platform
  - File: `app/api/posts/publish/route.ts`
- [x] Update scheduled publish to reserve per platform
  - File: `app/api/posts/schedule/route.ts`
- [x] Display credit cost in scheduling UI
  - File: `components/modals/schedule-post-modal.tsx`

---

## Phase 4: Tier Enforcement ✅ COMPLETE
**Estimated Duration:** 2 days
**Completed:** 2025-12-02

### 4.1 Connected Accounts Limits
- [x] Add tier check to OAuth connection flow
  - Files: `app/api/oauth/[platform]/connect/route.ts`
- [x] Count existing connections per platform before allowing new
  - File: `lib/db/connected-accounts.ts`
- [x] Show limit warning in connection UI
  - File: `components/connected-accounts/connected-accounts-view.tsx`
- [x] Add upgrade prompt when limit reached
  - File: `components/connected-accounts/connected-accounts-view.tsx`

### 4.2 Scheduling Limits
- [x] Add queue size check before scheduling
  - File: `app/api/posts/schedule/route.ts` (already implemented in Phase 3)
- [x] Add advance scheduling limit check
  - File: `app/api/posts/schedule/route.ts` (already implemented in Phase 3)
- [x] Add daily post limit per platform
  - File: `app/api/posts/publish/route.ts` and `lib/inngest/functions/process-scheduled-post.ts` (already implemented in Phase 3)
- [x] Show remaining queue slots in UI
  - File: `components/schedule-view.tsx`

### 4.3 Generation Limits
- [x] Add daily generation limit check
  - File: `app/api/ai/generate/route.ts` (already implemented in Phase 3)
- [x] Track generations per day in `dailyUsage` table
  - Already implemented via `lib/db/daily-usage.ts` and `lib/db/generation-logs.ts`
- [x] Show remaining generations in AI Studio
  - File: `components/ai-content-studio.tsx`

### 4.4 Automation Limits
- [x] Disable automation for Free tier
  - Files: `components/automation-view.tsx`, `components/modals/automation-wizard.tsx`
- [x] Add rule count limit for Pro tier
  - File: `app/api/user/automation-rules/route.ts`
- [x] Show automation locked state for Free users
  - File: `components/automation-view.tsx`

### 4.5 Limit Check API
- [x] Create unified limit check endpoint
  - File: `app/api/limits/check/route.ts`
  - Functions: Check any limit type, return current/max values

---

## Phase 5: Notifications & Warnings ✅ COMPLETE
**Estimated Duration:** 1-2 days
**Completed:** 2025-12-02

### 5.1 Credit Warnings
- [x] Create low credit warning component
  - File: `components/credit-warning-banner.tsx`
  - Logic: Show when credits < 20% of tier allocation
- [x] Integrate banner into dashboard layout
  - File: `components/client-dashboard-view.tsx`
- [x] Create credit expiry warning
  - File: `components/credit-expiry-warning.tsx`

### 5.2 User Notifications System
- [x] Create notifications dropdown component
  - File: `components/notifications-dropdown.tsx`
- [x] Add notifications icon to header
  - File: `components/client-dashboard-view.tsx` (integrated into dashboard header)
- [x] Create notification types: `low_credits`, `credits_expiring`, `post_skipped`, `post_failed`, `tier_limit_reached`
  - Already defined in: `drizzle/schema.ts` (notificationTypeEnum)
- [x] Implement notification polling or real-time updates
  - File: `lib/hooks/use-notifications.ts`
  - Features: 30-second polling, optimistic updates, mark as read, dismiss

### 5.3 Scheduled Post Notifications
- [x] Notify when post skipped due to zero credits
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Already implemented: calls `notifyPostSkipped()` when credits unavailable
- [x] Notify when post failed after retries
  - File: `lib/inngest/functions/process-scheduled-post.ts`
  - Already implemented: `onFailure` handler calls `notifyPostFailed()`

### 5.4 API Endpoints (Added)
- [x] Create notifications list endpoint
  - File: `app/api/notifications/route.ts`
- [x] Create mark as read endpoint
  - File: `app/api/notifications/read/route.ts`
- [x] Create mark all as read endpoint
  - File: `app/api/notifications/read-all/route.ts`
- [x] Create dismiss notification endpoint
  - File: `app/api/notifications/dismiss/route.ts`

---

## Phase 6: Admin Dashboard Enhancements ✅ COMPLETE
**Estimated Duration:** 2-3 days
**Completed:** 2025-12-02

### 6.1 Analytics Components
- [x] Create credits analytics component
  - File: `components/admin/credits-analytics.tsx`
  - Display: Credits used per platform, credits used per content type, generation vs publishing breakdown
- [x] Create generation stats component
  - File: `components/admin/generation-stats.tsx`
  - Display: Total generations, success rate, errors by type, top topics
- [x] Create publishing stats component
  - File: `components/admin/publishing-stats.tsx`
  - Display: Posts by platform, success rate, failed posts, retry rate
- [x] Create tier distribution component
  - File: `components/admin/tier-distribution.tsx`
  - Display: Users per tier, revenue estimate, conversion rates

### 6.2 Job Monitoring
- [x] Create Inngest job monitor component
  - File: `components/admin/job-monitor.tsx`
  - Display: Pending jobs, failed jobs, recent completions
- [x] Add manual retry button for failed jobs
  - File: `components/admin/job-monitor.tsx`
- [x] Create job detail modal
  - File: `components/admin/job-detail-modal.tsx`

### 6.3 Error Tracking
- [x] Create generation errors table component
  - File: `components/admin/generation-errors.tsx`
  - Display: Recent errors, error types, affected users
- [x] Create publishing errors table component
  - File: `components/admin/publishing-errors.tsx`
  - Display: Failed posts, error messages, retry status
- [x] Add filtering and search to error tables

### 6.4 Automation Monitoring
- [x] Create automation rules overview component
  - File: `components/admin/automation-overview.tsx`
  - Display: Active rules by user, credits consumed, next runs

### 6.5 Admin API Endpoints
- [x] Create admin analytics endpoint
  - File: `app/api/admin/analytics/route.ts`
- [x] Create admin jobs endpoint
  - File: `app/api/admin/jobs/route.ts`
- [x] Create admin job retry endpoint
  - File: `app/api/admin/jobs/retry/route.ts`
- [x] Create admin errors endpoint
  - File: `app/api/admin/errors/route.ts`

### 6.6 Admin Dashboard Integration
- [x] Update admin dashboard with new components
  - File: `components/admin-dashboard-view.tsx`
- [x] Add tabbed navigation for different sections
- [x] Add date range filters
- [x] Add export functionality (CSV)

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

## Phase 10: CI/CD & Testing Infrastructure ✅ COMPLETE
**Estimated Duration:** 1 day
**Completed:** 2025-12-02

### 10.1 Unit Testing Setup
- [x] Install Vitest and testing libraries
  - Packages: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] Create Vitest configuration
  - File: `vitest.config.ts`
- [x] Create test setup file with mocks
  - File: `tests/setup.ts`
  - Mocks: Next.js router, headers, Sentry, window APIs
- [x] Add npm scripts for testing
  - Commands: `test`, `test:run`, `test:coverage`, `test:ui`

### 10.2 Unit Tests
- [x] Create validation schema tests (19 tests)
  - File: `tests/unit/validation.test.ts`
- [x] Create security utilities tests (19 tests)
  - File: `tests/unit/security.test.ts`
- [x] Create performance monitoring tests (8 tests)
  - File: `tests/unit/performance.test.ts`
- [x] Create event tracking tests (15 tests)
  - File: `tests/unit/tracking.test.ts`
- [x] All 61 tests passing ✅

### 10.3 CI/CD Pipeline
- [x] Create GitHub Actions workflow
  - File: `.github/workflows/ci.yml`
- [x] Add lint job (TypeScript type checking)
- [x] Add unit test job with coverage reporting
- [x] Add build job with CI-safe environment variables
- [x] Add security audit job (npm audit)
- [x] Configure concurrency control for stale runs

### 10.4 GitHub Templates
- [x] Create PR template with SA context checklist
  - File: `.github/pull_request_template.md`
- [x] Create bug report issue template
  - File: `.github/ISSUE_TEMPLATE/bug_report.md`
- [x] Create feature request issue template
  - File: `.github/ISSUE_TEMPLATE/feature_request.md`
- [x] Update .gitignore to allow workflows and templates

---

## Summary

| Phase | Focus | Est. Duration | Status |
|-------|-------|---------------|--------|
| 1 | Database Schema & Foundation | 1-2 days | ✅ COMPLETE |
| 2 | Inngest Integration | 2-3 days | ✅ COMPLETE |
| 3 | Credit System Refactor | 1-2 days | ✅ COMPLETE |
| 4 | Tier Enforcement | 2 days | ✅ COMPLETE |
| 5 | Notifications & Warnings | 1-2 days | ✅ COMPLETE |
| 6 | Admin Dashboard Enhancements | 2-3 days | ✅ COMPLETE |
| 7 | Test Accounts & Testing | 1 day | 🔲 Pending |
| 8 | UI Updates & Polish | 1-2 days | 🔲 Pending |
| 9 | Final Integration & Review | 1 day | 🔲 Pending |
| 10 | CI/CD & Testing Infrastructure | 1 day | ✅ COMPLETE |
| **Total** | | **13-19 days** | 7/10 Complete |

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
Phase 9 (Integration) <──────── Phase 10 (CI/CD) ✅
```

---

## Files Created/Modified

### New Files (45+)
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
- `lib/hooks/use-notifications.ts` ✅
- `app/api/inngest/route.ts`
- `app/api/limits/check/route.ts`
- `app/api/notifications/route.ts` ✅
- `app/api/notifications/read/route.ts` ✅
- `app/api/notifications/read-all/route.ts` ✅
- `app/api/notifications/dismiss/route.ts` ✅
- `app/api/admin/analytics/route.ts` ✅
- `app/api/admin/jobs/route.ts` ✅
- `app/api/admin/jobs/retry/route.ts` ✅
- `app/api/admin/errors/route.ts` ✅
- `components/credit-warning-banner.tsx` ✅
- `components/credit-expiry-warning.tsx` ✅
- `components/notifications-dropdown.tsx` ✅
- `components/admin/credits-analytics.tsx` ✅
- `components/admin/generation-stats.tsx` ✅
- `components/admin/publishing-stats.tsx` ✅
- `components/admin/tier-distribution.tsx` ✅
- `components/admin/job-monitor.tsx` ✅
- `components/admin/job-detail-modal.tsx` ✅
- `components/admin/generation-errors.tsx` ✅
- `components/admin/publishing-errors.tsx` ✅
- `components/admin/automation-overview.tsx` ✅
- `scripts/seed-test-accounts.ts`
- `docs/TESTING_GUIDE.md`
- `vitest.config.ts` ✅
- `tests/setup.ts` ✅
- `tests/unit/validation.test.ts` ✅
- `tests/unit/security.test.ts` ✅
- `tests/unit/performance.test.ts` ✅
- `tests/unit/tracking.test.ts` ✅
- `.github/workflows/ci.yml` ✅
- `.github/pull_request_template.md` ✅
- `.github/ISSUE_TEMPLATE/bug_report.md` ✅
- `.github/ISSUE_TEMPLATE/feature_request.md` ✅

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
