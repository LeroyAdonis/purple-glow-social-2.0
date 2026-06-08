# Priority-Ordered Feature Implementation Matrix

**Project:** Purple Glow Social 2.0  
**Version:** 1.0  
**Created:** January 19, 2026  
**Last Updated:** Post-Sprint 1  
**Author:** Architecture & Planning Agent

---

## Executive Summary

This document consolidates ALL remaining work from multiple roadmaps into a single, unified priority matrix ordered by true business/technical priority.

### Current Status (Post-Sprint 1)

| Metric | Value | Status |
|--------|-------|--------|
| **Production Readiness** | 94/100 | ✅ Ready |
| **Tests Passing** | 158/158 | ✅ All Pass |
| **Security Score** | 9.5/10 | ✅ Excellent |
| **P0 Critical Issues** | 0 | ✅ None |

### Completed in Sprint 0-1
- ✅ Issue #1: Race condition in credit deduction - **FIXED**
- ✅ Issue #2: JSON parsing consistency - **FIXED**  
- ✅ Issue #3: Job log deletion bug - **FIXED**
- ✅ Legal pages (Privacy Policy, Terms of Service) - **CREATED**
- ✅ POPIA compliance endpoints - **CREATED**
- ✅ npm vulnerabilities - **ASSESSED & DOCUMENTED**

### Remaining Work Summary

| Priority | Count | Total Effort | Category Focus |
|----------|-------|--------------|----------------|
| 🔴 **P0 - Critical** | 0 | 0h | None remaining! |
| 🟠 **P1 - High** | 8 | ~18-22h | Testing, Security |
| 🟡 **P2 - Medium** | 12 | ~28-35h | UI, Infrastructure, Docs |
| 🟢 **P3 - Low** | 9 | ~12-15h | Polish, Optimization |
| **TOTAL** | 29 | ~58-72h | 3-4 weeks parallel |

---

## Quick Reference Table

| ID | Priority | Feature | Category | Effort | Owner | Dependencies | Status |
|----|----------|---------|----------|--------|-------|--------------|--------|
| P1-001 | 🟠 P1 | E2E Test Framework Setup | Testing | 2h | Code Reviewer | None | ⏳ Pending |
| P1-002 | 🟠 P1 | Critical Path E2E Tests | Testing | 8-10h | Code Reviewer | P1-001 | ⏳ Pending |
| P1-003 | 🟠 P1 | Account Deletion Rate Limiting | Security | 30m | Coder | None | ⏳ Pending |
| P1-004 | 🟠 P1 | Remove Debug Token Logging | Security | 15m | Coder | None | ⏳ Pending |
| P1-005 | 🟠 P1 | Webhook Retry Logic | Infrastructure | 2h | Coder | None | ⏳ Pending |
| P1-006 | 🟠 P1 | Data Retention Documentation | Compliance | 2h | Frontend | None | ⏳ Pending |
| P1-007 | 🟠 P1 | Replace console.log with Logger | Code Quality | 3-4h | Coder | None | ⏳ Pending |
| P1-008 | 🟠 P1 | Security Unit Tests | Testing | 4h | Code Reviewer | None | ⏳ Pending |
| P2-001 | 🟡 P2 | Mobile Bottom Navigation | UI/UX | 4-5h | Frontend Designer | None | ⏳ Pending |
| P2-002 | 🟡 P2 | Load Testing Setup (k6) | Testing | 3h | Code Reviewer | None | ⏳ Pending |
| P2-003 | 🟡 P2 | Load Tests Implementation | Testing | 4h | Code Reviewer | P2-002 | ⏳ Pending |
| P2-004 | 🟡 P2 | Update All Documentation | Documentation | 4-6h | Any Developer | Sprint 1 | ⏳ Pending |
| P2-005 | 🟡 P2 | Commit All Pending Changes | Git | 2h | Any Developer | P2-004 | ⏳ Pending |
| P2-006 | 🟡 P2 | Final Security Audit | Security | 2-3h | Code Reviewer | All P1 | ⏳ Pending |
| P2-007 | 🟡 P2 | Touch Target Improvements | UI/UX | 2-3h | Frontend Designer | None | ⏳ Pending |
| P2-008 | 🟡 P2 | Loading State Skeletons | UI/UX | 3-4h | Frontend Designer | None | ⏳ Pending |
| P2-009 | 🟡 P2 | Form Validation UX | UI/UX | 2-3h | Frontend Designer | None | ⏳ Pending |
| P2-010 | 🟡 P2 | Image Lazy Loading | Performance | 2h | Coder | None | ⏳ Pending |
| P2-011 | 🟡 P2 | Rate Limit Monitoring Alerts | Infrastructure | 1h | Coder | None | ⏳ Pending |
| P2-012 | 🟡 P2 | CI/CD Pipeline Updates | DevOps | 2h | Any Developer | P1-001, P1-002 | ⏳ Pending |
| P3-001 | 🟢 P3 | Remove TODO Comments | Code Quality | 15m | Any Developer | None | ⏳ Pending |
| P3-002 | 🟢 P3 | Remove Empty Directory | Code Quality | 5m | Any Developer | None | ⏳ Pending |
| P3-003 | 🟢 P3 | Micro-interactions & Animations | UI/UX | 3-4h | Frontend Designer | None | ⏳ Pending |
| P3-004 | 🟢 P3 | Empty State Illustrations | UI/UX | 2-3h | Frontend Designer | None | ⏳ Pending |
| P3-005 | 🟢 P3 | Error Page Designs | UI/UX | 2h | Frontend Designer | None | ⏳ Pending |
| P3-006 | 🟢 P3 | Database Query Optimization | Performance | 2h | Coder | None | ⏳ Pending |
| P3-007 | 🟢 P3 | Bundle Size Optimization | Performance | 2-3h | Coder | None | ⏳ Pending |
| P3-008 | 🟢 P3 | TypeScript `any` Cleanup | Code Quality | 3-4h | Coder | None | ⏳ Pending |
| P3-009 | 🟢 P3 | Database-backed Admin Roles | Feature | 4-6h | Coder | None | ⏳ Pending |

---

## P0 - CRITICAL BLOCKERS (Deploy Blockers)

### Currently: NONE! 🎉

All critical blockers have been resolved in Sprint 0-1:

| Issue | Description | Resolution | Date |
|-------|-------------|------------|------|
| ✅ P0-001 | Race condition in credit deduction | Implemented atomic SQL-level deduction | 2026-01-19 |
| ✅ P0-002 | npm security vulnerabilities | Assessed, documented in SECURITY.md | 2026-01-19 |
| ✅ P0-003 | JSON parsing consistency | Created parseRequestBody() helper | 2026-01-19 |
| ✅ P0-004 | Job log deletion bug (POPIA) | Fixed JSONB query with proper extraction | 2026-01-19 |
| ✅ P0-005 | Legal pages missing | Created Privacy Policy & Terms of Service | 2026-01-19 |
| ✅ P0-006 | POPIA compliance endpoints | Data export & deletion working | 2026-01-19 |

**Status: READY FOR PRODUCTION DEPLOYMENT ✅**

---

## P1 - HIGH PRIORITY (Week 1-2 Post-Launch)

These items should be completed within the first two weeks post-launch to ensure stability and security.

---

### P1-001: E2E Test Framework Setup
**Category:** Testing  
**Effort:** 2 hours  
**Owner:** Code Reviewer Agent  
**Blocking:** P1-002 (Critical Path E2E Tests)  
**Dependencies:** None  
**Source:** TEST_SECURITY_STRATEGY.md Phase 2

**Description:**
Install and configure Playwright for E2E browser testing. Set up test infrastructure, configuration files, and create a sample test to verify the setup works correctly.

**Acceptance Criteria:**
- [ ] Playwright installed (`npm install -D @playwright/test`)
- [ ] Browsers installed (`npx playwright install chromium`)
- [ ] `playwright.config.ts` created with desktop + mobile projects
- [ ] Test setup file `tests/e2e/setup.ts` with authentication helpers
- [ ] 1 sample E2E test passing (`tests/e2e/health-check.spec.ts`)
- [ ] Scripts added to `package.json` (`test:e2e`, `test:e2e:ui`)

**Implementation Steps:**
1. Install Playwright: `npm install -D @playwright/test`
2. Install browsers: `npx playwright install chromium`
3. Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  timeout: 30000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```
4. Create sample health check test
5. Update `package.json` with scripts
6. Run and verify: `npm run test:e2e`

**Test Strategy:**
- Sample test: GET /api/health returns 200

**Success Metrics:**
- Playwright configured and running
- CI/CD ready for E2E tests

---

### P1-002: Critical Path E2E Tests
**Category:** Testing  
**Effort:** 8-10 hours  
**Owner:** Code Reviewer Agent  
**Blocking:** Production confidence  
**Dependencies:** P1-001 (E2E setup)  
**Source:** TEST_SECURITY_STRATEGY.md Phase 2

**Description:**
Create comprehensive E2E tests for all critical user flows: authentication, content generation, publishing, payments, OAuth connections, and admin access.

**Acceptance Criteria:**
- [ ] 15+ E2E tests covering critical paths
- [ ] Auth flow tests: signup, login, logout, password reset (4 tests)
- [ ] Content generation tests: AI generation with options (2 tests)
- [ ] Publishing tests: single platform, multi-platform (2 tests)
- [ ] Payment tests: credit purchase modal, subscription modal (2 tests)
- [ ] OAuth tests: connection flow for each platform (4 tests)
- [ ] Admin tests: dashboard access, non-admin rejection (2 tests)
- [ ] All tests passing in CI/CD

**Implementation Steps:**
1. Create `tests/e2e/auth-flows.spec.ts`:
   - User signup with email
   - User login with valid credentials
   - Invalid credentials error handling
   - Protected route redirect
   - Logout flow

2. Create `tests/e2e/content-generation.spec.ts`:
   - Generate AI content with topic/platform/tone
   - Copy generated content
   - Free tier limit enforcement

3. Create `tests/e2e/payment-flows.spec.ts`:
   - Credit topup modal opens
   - Subscription modal shows plans
   - (Mock Polar redirect)

4. Create `tests/e2e/publishing-flows.spec.ts`:
   - Create and publish post (mock)
   - Schedule post for later
   - View scheduled posts

5. Create `tests/e2e/admin-dashboard.spec.ts`:
   - Admin can access /admin
   - Non-admin redirected

**Test Strategy:**
- Use test accounts from TEST_ACCOUNTS_GUIDE.md
- Mock external services (Polar, social platforms)
- Test both happy paths and error cases

**Success Metrics:**
- 15+ E2E tests passing
- All critical user journeys covered
- < 5 minute total E2E run time

---

### P1-003: Account Deletion Rate Limiting
**Category:** Security  
**Effort:** 30 minutes  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** SECURITY_BUG_ANALYSIS_REPORT.md Issue #4

**Description:**
Add rate limiting to the `/api/user/delete` endpoint to prevent DoS attacks through repeated deletion requests. Currently, authenticated users can spam deletion attempts causing database load.

**Acceptance Criteria:**
- [ ] Rate limit: 5 deletion attempts per hour per user
- [ ] Returns 429 status with Retry-After header when exceeded
- [ ] Rate limit tracked by user ID (not IP)
- [ ] Unit test for rate limit enforcement
- [ ] Update `features.json` - mark issue-004 as fixed

**Implementation Steps:**
1. Open `app/api/user/delete/route.ts`
2. Import rate limiter: `import { rateLimiters } from '@/lib/security/rate-limit';`
3. Add rate limiting after authentication check:
```typescript
// Apply rate limiting: 5 attempts per hour per user
const rateLimitResult = await rateLimiters.auth.limit(
  `account-delete:${authSession.user.id}`
);
if (!rateLimitResult.success) {
  const resetTime = Math.ceil(((rateLimitResult as any).reset - Date.now()) / 1000);
  return NextResponse.json(
    { 
      error: 'Too many deletion attempts',
      message: 'Please wait before trying again',
      retryAfter: resetTime,
    },
    { status: 429 }
  );
}
```
4. Add unit test for rate limiting behavior
5. Update features.json

**Test Strategy:**
- Unit test: Verify 429 after 5 attempts
- Integration test: Verify rate limit reset

**Success Metrics:**
- Rate limiting active on deletion endpoint
- No performance impact on normal operations

---

### P1-004: Remove Debug Token Logging
**Category:** Security  
**Effort:** 15 minutes  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** SECURITY_BUG_ANALYSIS_REPORT.md Issue #7

**Description:**
Remove debug logging that exposes partial encryption key and token information in `lib/db/connected-accounts.ts`. While only active in debug mode, this represents a defense-in-depth concern.

**Acceptance Criteria:**
- [ ] No key fragments in debug logs
- [ ] No token fragments in debug logs
- [ ] Debug logging still useful for troubleshooting (boolean flags, lengths)
- [ ] Update `features.json` - mark issue-007 as fixed

**Implementation Steps:**
1. Open `lib/db/connected-accounts.ts`
2. Find lines 55-62 with current debug logging
3. Replace with safer version:
```typescript
logger.db.debug('Attempting decryption', { 
  platform,
  hasKey: !!process.env.TOKEN_ENCRYPTION_KEY,
  keyLength: process.env.TOKEN_ENCRYPTION_KEY?.length,
  tokenLength: account.accessToken?.length,
  // Removed: keyStart, keyEnd, tokenStart
});
```
4. Update features.json

**Test Strategy:**
- Manual verification: Check debug logs don't contain sensitive data

**Success Metrics:**
- Zero sensitive data exposure in logs
- Troubleshooting capability preserved

---

### P1-005: Webhook Retry Logic
**Category:** Infrastructure  
**Effort:** 2 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** SECURITY_BUG_ANALYSIS_REPORT.md Issue #5, PRIORITIZED_ROADMAP.md Task 1.3

**Description:**
Implement intelligent webhook retry logic in the Polar webhook handler. Currently, all errors are treated as unrecoverable and success is returned to Polar, preventing retries for transient failures.

**Acceptance Criteria:**
- [ ] Retryable errors (timeout, connection, database) return 500 to trigger Polar retry
- [ ] Non-retryable errors (validation, duplicate) return 200 to prevent infinite loops
- [ ] All webhook errors logged with full context
- [ ] Unit test for retry logic classification
- [ ] Update `features.json` - mark issue-005 as fixed

**Implementation Steps:**
1. Open `app/api/webhooks/polar/route.ts`
2. Replace error handling at lines 28-32:
```typescript
try {
  await processWebhookEvent(payload.type, eventId, payload.data);
} catch (error) {
  logger.polar.exception(error, { webhookType: payload.type, eventId });
  
  // Distinguish between retryable and non-retryable errors
  const isRetryable = 
    error instanceof Error && (
      error.message?.includes('timeout') ||
      error.message?.includes('connection') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('database') ||
      error.name === 'DatabaseError' ||
      error.name === 'NetworkError'
    );
  
  if (isRetryable) {
    logger.polar.warn('Retryable webhook error, returning 500', {
      webhookType: payload.type,
      eventId,
    });
    return NextResponse.json(
      { error: 'Temporary processing error' },
      { status: 500 }
    );
  }
  
  logger.polar.info('Non-retryable webhook error, acknowledging', {
    webhookType: payload.type,
    eventId,
  });
}
```
3. Add unit test for error classification
4. Update features.json

**Test Strategy:**
- Unit test: Verify retryable errors return 500
- Unit test: Verify non-retryable errors return 200

**Success Metrics:**
- Transient failures trigger Polar retry (up to 3 times)
- Non-retryable errors don't cause infinite loops

---

### P1-006: Data Retention Documentation
**Category:** Compliance  
**Effort:** 2 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** SECURITY_BUG_ANALYSIS_REPORT.md Issue #6, PRIORITIZED_ROADMAP.md Task 1.4

**Description:**
Update privacy policy and account deletion UI to clearly communicate that anonymized financial transaction records are retained for 7 years per South African tax law requirements.

**Acceptance Criteria:**
- [ ] Privacy policy updated with data retention section
- [ ] Account deletion modal shows retention notice before confirmation
- [ ] API response includes retention note
- [ ] Update `features.json` - mark issue-006 as fixed

**Implementation Steps:**
1. Update `app/privacy/page.tsx` - Add "Data Retention After Account Deletion" section:
```markdown
### Data Retention After Account Deletion

When you delete your account, we immediately and permanently delete:
- All your posts and scheduled content
- Connected social media account tokens
- AI generation history and preferences
- Personal profile information (name, email, avatar)
- Notifications and activity logs

We retain the following for 7 years (South African Income Tax Act requirement):
- Transaction records (anonymized - personal details removed)
- Subscription history (anonymized)

These anonymized records cannot be linked back to you and are used solely 
for financial auditing and tax compliance purposes.
```

2. Update account deletion modal (if exists) or settings view:
```tsx
<div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
  <strong>Note:</strong> Financial transaction records will be retained 
  anonymously for 7 years per South African tax law requirements. 
  All other data is permanently deleted.
</div>
```

3. Update API response in `app/api/user/delete/route.ts`:
```typescript
return NextResponse.json({
  success: true,
  message: 'Your account and all personal data have been permanently deleted.',
  note: 'Anonymized financial records retained for 7 years per SA tax law.',
  deletedAt: new Date().toISOString(),
});
```

4. Update features.json

**Test Strategy:**
- Visual review of privacy policy
- E2E test: Verify deletion modal shows notice

**Success Metrics:**
- Users informed before deletion
- POPIA compliance improved

---

### P1-007: Replace console.log with Structured Logger
**Category:** Code Quality  
**Effort:** 3-4 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** PRIORITIZED_ROADMAP.md Task 1.1

**Description:**
Replace 30+ `console.log` and `console.error` statements in production API code with the structured logger. This improves observability, log filtering, and prevents sensitive data leakage.

**Acceptance Criteria:**
- [ ] Zero `console.log` in `app/api/` directory
- [ ] Zero `console.error` in `app/api/` directory
- [ ] All logs use appropriate logger context (api, auth, cron, etc.)
- [ ] Logs verified working in dev mode
- [ ] Sentry receives error-level logs

**Implementation Steps:**
1. Search for all instances: `grep -r "console\." app/api/ --include="*.ts"`
2. For each file, import logger: `import { logger } from '@/lib/logger';`
3. Replace patterns:
```typescript
// Before
console.error('Error:', error);
console.log('User:', user.id);

// After
logger.api.error('Error processing request', { error });
logger.api.debug('Processing user', { userId: user.id });
```
4. Verify zero console statements: `grep -r "console\." app/api/ --include="*.ts" | wc -l`
5. Test in dev mode

**Affected Files (30+):**
- `app/api/notifications/route.ts:50`
- `app/api/notifications/read-all/route.ts:32`
- `app/api/admin/errors/route.ts:116`
- `app/api/admin/users/route.ts:60, 129`
- `app/api/limits/check/route.ts:194`
- `app/api/checkout/subscription/route.ts:80`
- ... and 20+ more

**Test Strategy:**
- Verify logs appear in dev console
- Verify no console.log in production build

**Success Metrics:**
- Zero console.log/error in API routes
- Improved log filtering and search

---

### P1-008: Security Unit Tests
**Category:** Testing  
**Effort:** 4 hours  
**Owner:** Code Reviewer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** TEST_SECURITY_STRATEGY.md Phase 3

**Description:**
Create comprehensive security-focused unit tests covering input validation, authorization, rate limiting, and encryption. These tests verify OWASP Top 10 protections.

**Acceptance Criteria:**
- [ ] Input validation tests: SQL injection, XSS, JSONB injection, path traversal
- [ ] Authorization tests: Admin access control, cross-user data access
- [ ] Rate limiting tests: Limit enforcement, 429 responses, fallback behavior
- [ ] Encryption tests: AES-256-GCM verification, key validation
- [ ] 30+ security-focused tests passing

**Implementation Steps:**
1. Create `tests/security/input-validation.test.ts`:
   - SQL injection prevention
   - XSS prevention (sanitizeInput)
   - JSONB injection prevention
   - Path traversal prevention

2. Create `tests/security/authorization.test.ts`:
   - Admin email domain validation
   - Cross-user data access prevention
   - IDOR prevention

3. Create `tests/security/rate-limiting.test.ts`:
   - Rate limit enforcement
   - 429 response format
   - Retry-After header
   - Fallback behavior

4. Create `tests/security/encryption.test.ts`:
   - AES-256-GCM algorithm verification
   - Unique IV per encryption
   - Auth tag integrity
   - Decrypt/encrypt cycles

**Test Strategy:**
- Unit tests with mocked dependencies
- Test both positive and negative cases

**Success Metrics:**
- 30+ security tests passing
- OWASP Top 10 coverage verified

---

## P2 - MEDIUM PRIORITY (Weeks 3-4)

These items improve quality, user experience, and operational robustness. They should be completed within the first month post-launch.

---

### P2-001: Mobile Bottom Navigation
**Category:** UI/UX  
**Effort:** 4-5 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Implement a fixed bottom navigation bar for mobile devices that provides quick access to key features: Home, Create, Schedule, and Settings. This follows mobile UX best practices for thumb-friendly navigation.

**Acceptance Criteria:**
- [ ] Fixed bottom navigation on screens < 768px
- [ ] 4 navigation items: Home, Create, Schedule, Settings
- [ ] Active state indicator
- [ ] Hidden on scroll down, visible on scroll up
- [ ] Smooth transitions and animations
- [ ] Touch targets minimum 44x44px

**Implementation Steps:**
1. Create `components/MobileBottomNav.tsx`
2. Implement scroll detection with useScroll hook
3. Add navigation items with icons
4. Style with Tailwind for fixed bottom positioning
5. Add to layout.tsx with media query
6. Test on mobile devices

**Test Strategy:**
- Visual testing on mobile breakpoints
- Touch target size verification

**Success Metrics:**
- Improved mobile navigation UX
- Reduced navigation time on mobile

---

### P2-002: Load Testing Setup (k6)
**Category:** Testing  
**Effort:** 3 hours  
**Owner:** Code Reviewer Agent  
**Blocking:** P2-003 (Load Tests Implementation)  
**Dependencies:** None  
**Source:** TEST_SECURITY_STRATEGY.md Phase 4

**Description:**
Install and configure k6 for load testing. Create the test infrastructure, configuration, and baseline tests for API endpoints.

**Acceptance Criteria:**
- [ ] k6 installed and configured
- [ ] Load test directory structure created
- [ ] Configuration for different test scenarios (smoke, load, stress)
- [ ] Sample load test for health endpoint
- [ ] Custom metrics defined (error rate, AI generation duration)

**Implementation Steps:**
1. Install k6: `brew install k6` or `npm install -g k6`
2. Create `tests/load/` directory
3. Create configuration file with scenarios
4. Create sample test `tests/load/api-endpoints.js`
5. Define custom metrics and thresholds
6. Add npm script: `"test:load": "k6 run tests/load/api-endpoints.js"`

**Test Strategy:**
- Verify k6 runs locally
- Baseline metrics collection

**Success Metrics:**
- k6 infrastructure ready
- Baseline performance documented

---

### P2-003: Load Tests Implementation
**Category:** Testing  
**Effort:** 4 hours  
**Owner:** Code Reviewer Agent  
**Blocking:** None  
**Dependencies:** P2-002 (k6 Setup)  
**Source:** TEST_SECURITY_STRATEGY.md Phase 4

**Description:**
Implement comprehensive load tests for critical API endpoints including concurrent publishing (race condition verification), AI generation, and user dashboard.

**Acceptance Criteria:**
- [ ] Load test for API health endpoint
- [ ] Load test for AI content generation
- [ ] Load test for concurrent publishing (verify race condition fix)
- [ ] Memory leak detection test (1-hour sustained load)
- [ ] Performance thresholds defined and enforced

**Performance Thresholds:**
| Endpoint | p50 | p95 | p99 | Max |
|----------|-----|-----|-----|-----|
| GET /api/health | <20ms | <50ms | <100ms | <200ms |
| GET /api/user/profile | <50ms | <150ms | <300ms | <500ms |
| POST /api/ai/generate | <2s | <5s | <8s | <10s |
| POST /api/posts/publish | <200ms | <500ms | <1s | <2s |

**Implementation Steps:**
1. Create `tests/load/api-endpoints.js` with staged load
2. Create `tests/load/concurrent-publishing.js` for race condition
3. Create `tests/load/memory-leak.js` for sustained load
4. Configure thresholds for each endpoint
5. Generate JSON reports

**Test Strategy:**
- Run in staging environment
- Compare before/after race condition fix

**Success Metrics:**
- All thresholds passing
- No race conditions under load

---

### P2-004: Update All Documentation
**Category:** Documentation  
**Effort:** 4-6 hours  
**Owner:** Any Developer  
**Blocking:** None  
**Dependencies:** Sprint 1 complete  
**Source:** PRIORITIZED_ROADMAP.md Task 2.1

**Description:**
Update all documentation to reflect current architecture, remove references to deleted features, and ensure accuracy of all technical docs.

**Acceptance Criteria:**
- [ ] AGENTS.md updated with Inngest migration notes
- [ ] No references to deleted `/api/cron/process-scheduled-posts`
- [ ] docs/API_DOCUMENTATION.md updated with new endpoints
- [ ] PHASE_9_AUTO_POSTING_COMPLETE.md updated
- [ ] README.md verified accurate
- [ ] app-spec.md updated with fixed issues

**Implementation Steps:**
1. Search for references to deleted cron endpoint
2. Update AGENTS.md with Inngest architecture
3. Update API documentation with Phase 11 endpoints
4. Update phase completion documents
5. Verify README accuracy
6. Update app-spec.md known issues section

**Test Strategy:**
- Manual review of all documentation
- Link verification

**Success Metrics:**
- All docs accurate and current
- No broken references

---

### P2-005: Commit All Pending Changes
**Category:** Git  
**Effort:** 2 hours  
**Owner:** Any Developer  
**Blocking:** None  
**Dependencies:** P2-004 (Documentation)  
**Source:** PRIORITIZED_ROADMAP.md Task 2.2

**Description:**
Review and commit all pending changes with meaningful commit messages. Clean up git history and ensure remote repository is up to date.

**Acceptance Criteria:**
- [ ] All modified files reviewed and committed
- [ ] All untracked files added or .gitignored
- [ ] Meaningful commit messages following conventional commits
- [ ] Clean `git status` (no uncommitted changes)
- [ ] Remote repository up to date

**Implementation Steps:**
1. Run `git status` to review all changes
2. Group related changes by category
3. Stage and commit with conventional commit messages:
   - `feat(security): add rate limiting to AI endpoints`
   - `fix(oauth): improve token refresh reliability`
   - `chore(docs): add security audit and roadmap documentation`
4. Push to remote: `git push origin main`
5. Verify clean status

**Test Strategy:**
- Verify CI/CD passes after push
- Review commit history for clarity

**Success Metrics:**
- Clean git status
- Clear commit history

---

### P2-006: Final Security Audit
**Category:** Security  
**Effort:** 2-3 hours  
**Owner:** Code Reviewer Agent  
**Blocking:** None  
**Dependencies:** All P1 tasks  
**Source:** PRIORITIZED_ROADMAP.md Task 2.6

**Description:**
Perform final security audit before marking production launch complete. Verify all security measures are working correctly and document any findings.

**Checklist:**

**Authentication:**
- [ ] Session expiry working (7 days)
- [ ] HttpOnly cookies set correctly
- [ ] CSRF protection enabled
- [ ] Password hashing verified (bcrypt)

**Authorization:**
- [ ] All admin routes protected with `requireAdmin()`
- [ ] User can only access own data
- [ ] OAuth state parameter validated

**Data Protection:**
- [ ] Token encryption working (AES-256-GCM)
- [ ] No sensitive data in logs
- [ ] Data export excludes tokens

**Input Validation:**
- [ ] All POST endpoints validate JSON
- [ ] Platform parameter whitelisted
- [ ] SQL injection impossible (Drizzle ORM)

**Rate Limiting:**
- [ ] Auth endpoints: 5/15min
- [ ] API endpoints: 100/min
- [ ] Content generation: 10/min
- [ ] Account deletion: 5/hour

**Test Strategy:**
- Manual verification of each checklist item
- Penetration testing scenarios

**Success Metrics:**
- All checklist items verified
- Security audit report updated

---

### P2-007: Touch Target Improvements
**Category:** UI/UX  
**Effort:** 2-3 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Audit and fix all touch targets to meet WCAG minimum of 44x44px. Focus on mobile navigation, buttons, and interactive elements.

**Acceptance Criteria:**
- [ ] All buttons minimum 44x44px touch target
- [ ] Adequate spacing between interactive elements
- [ ] Touch-friendly form inputs
- [ ] Accessible tap areas for icons

**Implementation Steps:**
1. Audit all interactive elements for touch target size
2. Add padding/min-height to buttons
3. Increase spacing between navigation items
4. Add touch-action CSS for better touch handling
5. Test on actual mobile devices

**Test Strategy:**
- Mobile device testing
- Touch target analyzer tools

**Success Metrics:**
- All touch targets >= 44px
- Improved mobile usability

---

### P2-008: Loading State Skeletons
**Category:** UI/UX  
**Effort:** 3-4 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Add skeleton loading states to all major views to improve perceived performance and reduce layout shift.

**Acceptance Criteria:**
- [ ] Dashboard skeleton loader
- [ ] Calendar view skeleton
- [ ] Post list skeleton
- [ ] Content generation skeleton
- [ ] Settings view skeleton
- [ ] Smooth transition from skeleton to content

**Implementation Steps:**
1. Create reusable `Skeleton` component
2. Create view-specific skeleton compositions
3. Implement in each view with Suspense
4. Add pulse animation
5. Test transitions

**Test Strategy:**
- Visual testing of loading states
- Layout shift measurement

**Success Metrics:**
- Reduced perceived load time
- No layout shift on content load

---

### P2-009: Form Validation UX
**Category:** UI/UX  
**Effort:** 2-3 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Improve form validation user experience with inline validation, clear error messages, and visual feedback.

**Acceptance Criteria:**
- [ ] Inline validation on blur
- [ ] Clear error messages below fields
- [ ] Visual indication of valid/invalid state
- [ ] Form submission disabled until valid
- [ ] Accessible error announcements

**Implementation Steps:**
1. Create reusable form field component with validation
2. Add inline validation logic
3. Style valid/invalid states
4. Add aria-describedby for error messages
5. Test with screen reader

**Test Strategy:**
- Manual form testing
- Accessibility audit

**Success Metrics:**
- Improved form completion rate
- Better error recovery UX

---

### P2-010: Image Lazy Loading
**Category:** Performance  
**Effort:** 2 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Implement lazy loading for all images using Next.js Image component with priority loading for above-the-fold content.

**Acceptance Criteria:**
- [ ] All images use Next.js Image component
- [ ] Lazy loading enabled by default
- [ ] Priority loading for hero/above-fold images
- [ ] Blur placeholder for better UX
- [ ] Proper aspect ratios to prevent layout shift

**Implementation Steps:**
1. Audit all `<img>` tags in codebase
2. Replace with `<Image>` from next/image
3. Add width/height or fill props
4. Configure priority for above-fold images
5. Add blur placeholders where appropriate

**Test Strategy:**
- Lighthouse performance audit
- Network waterfall analysis

**Success Metrics:**
- Improved Lighthouse score
- Reduced initial page weight

---

### P2-011: Rate Limit Monitoring Alerts
**Category:** Infrastructure  
**Effort:** 1 hour  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** SECURITY_BUG_ANALYSIS_REPORT.md Issue #10

**Description:**
Add monitoring and alerting when rate limiting falls back to in-memory storage in production. This indicates Redis connectivity issues.

**Acceptance Criteria:**
- [ ] Alert logged when fallback used in production
- [ ] Sentry alert triggered for rate limit fallback
- [ ] Clear indication of which endpoint triggered fallback

**Implementation Steps:**
1. Open `lib/security/rate-limit.ts`
2. Add production fallback detection:
```typescript
if (!redis && process.env.NODE_ENV === 'production') {
  logger.security.error('Rate limiting fallback to in-memory in production', {
    alert: true,
    severity: 'high',
    endpoint: identifier,
  });
}
```
3. Configure Sentry alert rule for this error

**Test Strategy:**
- Manually trigger fallback in staging
- Verify Sentry receives alert

**Success Metrics:**
- Immediate notification on Redis issues
- No silent fallback in production

---

### P2-012: CI/CD Pipeline Updates
**Category:** DevOps  
**Effort:** 2 hours  
**Owner:** Any Developer  
**Blocking:** None  
**Dependencies:** P1-001, P1-002 (E2E tests)  
**Source:** TEST_SECURITY_STRATEGY.md

**Description:**
Update CI/CD pipeline to include E2E tests, security audits, and coverage requirements.

**Acceptance Criteria:**
- [ ] E2E tests run on PR and main branch
- [ ] Security audit runs on every build
- [ ] Coverage report generated and uploaded
- [ ] Build fails on test failure
- [ ] Playwright report artifact on failure

**Implementation Steps:**
1. Update `.github/workflows/ci.yml`
2. Add E2E job with Playwright
3. Add security audit job
4. Configure artifact upload for reports
5. Add coverage check requirements

**Test Strategy:**
- Create test PR to verify pipeline
- Verify all jobs run correctly

**Success Metrics:**
- Full CI/CD coverage
- Automated quality gates

---

## P3 - LOW PRIORITY (Fix When Possible)

These items are polish, optimization, and future enhancements. Complete as time permits after higher priority work.

---

### P3-001: Remove TODO Comments
**Category:** Code Quality  
**Effort:** 15 minutes  
**Owner:** Any Developer  
**Blocking:** None  
**Dependencies:** None  
**Source:** SECURITY_BUG_ANALYSIS_REPORT.md Issue #8, PRIORITIZED_ROADMAP.md Task 2.4

**Description:**
Remove or document TODO comments in production code. The main instance is a commented-out recurrence feature.

**Acceptance Criteria:**
- [ ] All TODO comments reviewed
- [ ] Each TODO either removed, moved to GitHub Issue, or documented
- [ ] No orphan TODO comments in production code

**Location:** `app/api/posts/schedule/route.ts:19`
```typescript
// recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(), // TODO: Implement recurrence
```

**Implementation Steps:**
1. Search for all TODOs: `grep -r "TODO" app/ lib/ components/ --include="*.ts" --include="*.tsx"`
2. For each TODO:
   - Remove if no longer relevant
   - Create GitHub Issue if planned feature
   - Document in backlog if future enhancement
3. Verify no orphan TODOs remain

**Success Metrics:**
- Clean codebase without TODO comments

---

### P3-002: Remove Empty Directory
**Category:** Code Quality  
**Effort:** 5 minutes  
**Owner:** Any Developer  
**Blocking:** None  
**Dependencies:** None  
**Source:** PRIORITIZED_ROADMAP.md Task 2.5

**Description:**
Remove empty directory left over from deleted cron job migration to Inngest.

**Directory to Remove:** `app/api/cron/process-scheduled-posts/` (empty)

**Implementation Steps:**
```bash
rm -rf app/api/cron/process-scheduled-posts/
git add -A
git commit -m "chore: remove empty cron directory"
```

**Success Metrics:**
- Clean directory structure

---

### P3-003: Micro-interactions & Animations
**Category:** UI/UX  
**Effort:** 3-4 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Add subtle animations and micro-interactions to improve user experience and make the interface feel more polished.

**Acceptance Criteria:**
- [ ] Button hover/click animations
- [ ] Page transition animations
- [ ] Card hover effects
- [ ] Modal open/close animations
- [ ] Success/error feedback animations
- [ ] Respects prefers-reduced-motion

**Implementation Steps:**
1. Create animation utility classes in Tailwind
2. Add Framer Motion for complex animations (optional)
3. Implement button interactions
4. Add page transitions
5. Test with prefers-reduced-motion

**Success Metrics:**
- Improved perceived polish
- No performance impact

---

### P3-004: Empty State Illustrations
**Category:** UI/UX  
**Effort:** 2-3 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Design and implement helpful empty state illustrations for views with no content.

**Acceptance Criteria:**
- [ ] Empty posts state illustration
- [ ] Empty automation rules state
- [ ] Empty notifications state
- [ ] Empty connected accounts state
- [ ] Clear call-to-action in each empty state

**Implementation Steps:**
1. Design or source SVG illustrations
2. Create EmptyState component
3. Implement in each view
4. Add helpful text and CTAs
5. Test empty states

**Success Metrics:**
- Better onboarding experience
- Clear next steps for users

---

### P3-005: Error Page Designs
**Category:** UI/UX  
**Effort:** 2 hours  
**Owner:** Frontend Designer Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Design custom error pages (404, 500, etc.) that match the Purple Glow brand and provide helpful navigation.

**Acceptance Criteria:**
- [ ] Custom 404 page with navigation
- [ ] Custom 500 page with retry option
- [ ] Custom maintenance page
- [ ] Consistent branding
- [ ] Helpful error messages

**Implementation Steps:**
1. Create `app/not-found.tsx` (404)
2. Create `app/error.tsx` (500)
3. Design with brand colors and illustrations
4. Add navigation links back to safe pages
5. Test error scenarios

**Success Metrics:**
- Professional error handling
- Reduced user frustration

---

### P3-006: Database Query Optimization
**Category:** Performance  
**Effort:** 2 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** PRIORITIZED_ROADMAP.md Technical Debt

**Description:**
Review and optimize database queries for performance, especially on high-traffic endpoints.

**Acceptance Criteria:**
- [ ] Identify slow queries using EXPLAIN
- [ ] Add missing indexes
- [ ] Optimize N+1 queries
- [ ] Review connection pooling configuration

**Implementation Steps:**
1. Review Drizzle queries in high-traffic routes
2. Run EXPLAIN on complex queries
3. Add indexes for frequently filtered columns
4. Implement query batching where needed
5. Test performance improvements

**Success Metrics:**
- Reduced query times
- Lower database load

---

### P3-007: Bundle Size Optimization
**Category:** Performance  
**Effort:** 2-3 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md

**Description:**
Analyze and reduce JavaScript bundle size for faster page loads.

**Acceptance Criteria:**
- [ ] Bundle analyzer report generated
- [ ] Unused dependencies identified and removed
- [ ] Large dependencies lazy-loaded
- [ ] Code splitting optimized
- [ ] <200KB initial JS bundle

**Implementation Steps:**
1. Install bundle analyzer: `npm install @next/bundle-analyzer`
2. Generate and analyze report
3. Identify large dependencies
4. Implement dynamic imports for heavy components
5. Remove unused dependencies
6. Verify bundle size reduction

**Success Metrics:**
- Reduced bundle size
- Faster Time to Interactive

---

### P3-008: TypeScript `any` Cleanup
**Category:** Code Quality  
**Effort:** 3-4 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** PRIORITIZED_ROADMAP.md Technical Debt

**Description:**
Replace `any` types with proper TypeScript types throughout the codebase for better type safety.

**Acceptance Criteria:**
- [ ] All `any` types reviewed
- [ ] Proper interfaces/types created
- [ ] No `@ts-ignore` without explanation
- [ ] TypeScript strict mode compatible

**Implementation Steps:**
1. Search for `any` types: `grep -r ": any" app/ lib/ components/`
2. For each instance, determine proper type
3. Create interfaces as needed
4. Replace `any` with specific types
5. Verify compilation

**Success Metrics:**
- Improved type safety
- Better IDE support

---

### P3-009: Database-backed Admin Roles
**Category:** Feature  
**Effort:** 4-6 hours  
**Owner:** Coder Agent  
**Blocking:** None  
**Dependencies:** None  
**Source:** PRIORITIZED_ROADMAP.md Technical Debt

**Description:**
Move admin role detection from email domain check to database-backed role system for more flexibility.

**Acceptance Criteria:**
- [ ] Add `role` column to users table
- [ ] Create roles: 'user', 'admin', 'super_admin'
- [ ] Update `isAdmin()` to check database role
- [ ] Admin can assign roles to other users
- [ ] Migration script for existing admins

**Implementation Steps:**
1. Add role column to schema:
```typescript
role: text('role').notNull().default('user'),
```
2. Create migration
3. Update `lib/security/auth-utils.ts` to check role
4. Create admin endpoint to manage roles
5. Migrate existing admins based on email

**Success Metrics:**
- Flexible role management
- No email domain dependency

---

## Execution Strategy

### Week 1 Post-Launch: Critical Testing & Security
**Focus:** E2E Tests + Quick Security Wins  
**Total Effort:** ~15-18 hours

| Task | Hours | Owner | Day |
|------|-------|-------|-----|
| P1-001: E2E setup | 2h | Code Reviewer | Mon |
| P1-002: Critical E2E tests | 8-10h | Code Reviewer | Mon-Wed |
| P1-003: Account deletion rate limit | 0.5h | Coder | Mon |
| P1-004: Remove debug logging | 0.25h | Coder | Mon |
| P1-005: Webhook retry logic | 2h | Coder | Tue |
| P1-008: Security unit tests | 4h | Code Reviewer | Thu-Fri |

**Parallel Tracks:**
- **Track A (Code Reviewer):** E2E tests, security tests
- **Track B (Coder):** Security fixes (P1-003, P1-004, P1-005)

**Week 1 Exit Criteria:**
- [ ] 15+ E2E tests passing
- [ ] All P1 security items complete
- [ ] CI/CD running E2E tests

---

### Week 2 Post-Launch: Documentation & Hardening
**Focus:** Code Quality + Documentation  
**Total Effort:** ~10-13 hours

| Task | Hours | Owner | Day |
|------|-------|-------|-----|
| P1-006: Data retention docs | 2h | Frontend | Mon |
| P1-007: Replace console.log | 3-4h | Coder | Mon-Tue |
| P2-004: Update documentation | 4-6h | Any Developer | Wed-Thu |
| P2-005: Commit pending changes | 2h | Any Developer | Fri |

**Week 2 Exit Criteria:**
- [ ] Zero console.log in API routes
- [ ] All documentation current
- [ ] Git repository clean

---

### Week 3 Post-Launch: Performance & UI Polish
**Focus:** Load Testing + UI Improvements  
**Total Effort:** ~18-23 hours

| Task | Hours | Owner | Day |
|------|-------|-------|-----|
| P2-002: Load testing setup | 3h | Code Reviewer | Mon |
| P2-003: Load tests implementation | 4h | Code Reviewer | Mon-Tue |
| P2-001: Mobile bottom navigation | 4-5h | Frontend Designer | Mon-Tue |
| P2-007: Touch target improvements | 2-3h | Frontend Designer | Wed |
| P2-006: Final security audit | 2-3h | Code Reviewer | Thu |
| P2-011: Rate limit monitoring | 1h | Coder | Thu |
| P2-012: CI/CD updates | 2h | Any Developer | Fri |

**Parallel Tracks:**
- **Track A (Code Reviewer):** Load testing, security audit
- **Track B (Frontend Designer):** Mobile nav, touch targets
- **Track C (Coder):** Infrastructure improvements

**Week 3 Exit Criteria:**
- [ ] Load testing passing
- [ ] Mobile UX improved
- [ ] Security audit complete

---

### Week 4+ Post-Launch: Polish & Optimization
**Focus:** Remaining P2 + P3 items  
**Total Effort:** ~20-30 hours (flexible)

| Task | Hours | Owner | Priority |
|------|-------|-------|----------|
| P2-008: Loading skeletons | 3-4h | Frontend Designer | P2 |
| P2-009: Form validation UX | 2-3h | Frontend Designer | P2 |
| P2-010: Image lazy loading | 2h | Coder | P2 |
| P3-003: Micro-interactions | 3-4h | Frontend Designer | P3 |
| P3-004: Empty state illustrations | 2-3h | Frontend Designer | P3 |
| P3-005: Error page designs | 2h | Frontend Designer | P3 |
| P3-006: Database optimization | 2h | Coder | P3 |
| P3-007: Bundle optimization | 2-3h | Coder | P3 |
| P3-008: TypeScript cleanup | 3-4h | Coder | P3 |
| P3-009: Database admin roles | 4-6h | Coder | P3 |

**Week 4+ Exit Criteria:**
- [ ] All P2 items complete
- [ ] P3 items based on capacity
- [ ] 95+/100 production readiness

---

## Parallel Execution Matrix

| Week | Coder Agent | Code Reviewer Agent | Frontend Designer Agent |
|------|-------------|---------------------|------------------------|
| **1** | P1-003, P1-004, P1-005 | P1-001, P1-002, P1-008 | Documentation review |
| **2** | P1-007 | Code review | P1-006 |
| **3** | P2-011 | P2-002, P2-003, P2-006 | P2-001, P2-007 |
| **4** | P2-010, P3-006, P3-007 | P2-012, Code review | P2-008, P2-009 |
| **5+** | P3-008, P3-009 | Load test monitoring | P3-003, P3-004, P3-005 |

---

## Success Criteria

### Production Launch (Current Status) ✅
- [x] 0 P0 issues
- [x] 158/158 tests passing
- [x] 94/100 production readiness
- [x] 9.5/10 security score

### Post-Launch Week 1
- [ ] 15+ E2E tests passing
- [ ] All P1 security items complete (Issues #4, #5, #6, #7)
- [ ] Production monitoring stable

### Post-Launch Week 2
- [ ] Zero console.log in production code
- [ ] Documentation fully updated
- [ ] Git repository clean and up to date

### Post-Launch Week 3
- [ ] Load testing validated
- [ ] Mobile UX improved
- [ ] Final security audit passed
- [ ] 95+/100 production readiness

### Post-Launch Month 1
- [ ] All P2 items complete
- [ ] 200+ total tests
- [ ] Performance baselines established
- [ ] User feedback incorporated

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| E2E tests flaky | Medium | Low | Focus on stable flows, use test retries |
| Performance regression | Low | Medium | Load testing in Week 3 catches issues |
| User feedback changes priorities | High | Low | Flexible P3 backlog |
| Resource constraints | Medium | Medium | Prioritized by business value |
| Third-party API issues | Low | Medium | Mock tests, graceful degradation |

---

## Dependency Graph

```
Week 1 (No external dependencies)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  P1-001 E2E Setup ──────► P1-002 E2E Tests                  │
│                                    │                        │
│  P1-003 Rate Limiting              │                        │
│  P1-004 Debug Logging              │                        │
│  P1-005 Webhook Retry              │                        │
│  P1-008 Security Tests             │                        │
│                                    │                        │
└────────────────────────────────────┼────────────────────────┘
                                     │
                                     ▼
Week 2 (Depends on Week 1)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  P1-006 Data Retention Docs                                 │
│  P1-007 Logger Migration                                    │
│  P2-004 Documentation ────► P2-005 Git Commit               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Week 3 (Depends on Week 2)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  P2-002 k6 Setup ────────► P2-003 Load Tests                │
│  P2-001 Mobile Nav                                          │
│  P2-007 Touch Targets                                       │
│  P2-006 Security Audit ◄── All P1 Complete                  │
│  P1-001 + P1-002 ────────► P2-012 CI/CD Updates             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Week 4+ (Flexible, no blocking dependencies)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  P2-008, P2-009, P2-010, P2-011                             │
│  P3-001 through P3-009 (as time permits)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Issue Cross-Reference

This matrix consolidates issues from multiple source documents:

| Original ID | Source | Matrix ID | Status |
|-------------|--------|-----------|--------|
| Issue #1 | SECURITY_BUG_ANALYSIS_REPORT | - | ✅ FIXED |
| Issue #2 | SECURITY_BUG_ANALYSIS_REPORT | - | ✅ FIXED |
| Issue #3 | SECURITY_BUG_ANALYSIS_REPORT | - | ✅ FIXED |
| Issue #4 | SECURITY_BUG_ANALYSIS_REPORT | P1-003 | ⏳ Pending |
| Issue #5 | SECURITY_BUG_ANALYSIS_REPORT | P1-005 | ⏳ Pending |
| Issue #6 | SECURITY_BUG_ANALYSIS_REPORT | P1-006 | ⏳ Pending |
| Issue #7 | SECURITY_BUG_ANALYSIS_REPORT | P1-004 | ⏳ Pending |
| Issue #8 | SECURITY_BUG_ANALYSIS_REPORT | P3-001 | ⏳ Pending |
| Issue #9 | SECURITY_BUG_ANALYSIS_REPORT | - | ✅ DOCUMENTED |
| Issue #10 | SECURITY_BUG_ANALYSIS_REPORT | P2-011 | ⏳ Pending |
| Task 1.1 | PRIORITIZED_ROADMAP | P1-007 | ⏳ Pending |
| Task 1.2 | PRIORITIZED_ROADMAP | P1-003 | ⏳ Pending |
| Task 1.3 | PRIORITIZED_ROADMAP | P1-005 | ⏳ Pending |
| Task 1.4 | PRIORITIZED_ROADMAP | P1-006 | ⏳ Pending |
| Task 1.5 | PRIORITIZED_ROADMAP | P1-004 | ⏳ Pending |
| Task 2.1 | PRIORITIZED_ROADMAP | P2-004 | ⏳ Pending |
| Task 2.2 | PRIORITIZED_ROADMAP | P2-005 | ⏳ Pending |
| Task 2.3 | PRIORITIZED_ROADMAP | P1-001, P1-002 | ⏳ Pending |
| Task 2.4 | PRIORITIZED_ROADMAP | P3-001 | ⏳ Pending |
| Task 2.5 | PRIORITIZED_ROADMAP | P3-002 | ⏳ Pending |
| Task 2.6 | PRIORITIZED_ROADMAP | P2-006 | ⏳ Pending |
| Phase 2 E2E | TEST_SECURITY_STRATEGY | P1-001, P1-002 | ⏳ Pending |
| Phase 3 Security | TEST_SECURITY_STRATEGY | P1-008 | ⏳ Pending |
| Phase 4 Load | TEST_SECURITY_STRATEGY | P2-002, P2-003 | ⏳ Pending |
| Mobile Nav | UI_PERFORMANCE_ROADMAP | P2-001 | ⏳ Pending |
| Touch Targets | UI_PERFORMANCE_ROADMAP | P2-007 | ⏳ Pending |
| Loading States | UI_PERFORMANCE_ROADMAP | P2-008 | ⏳ Pending |
| Form Validation | UI_PERFORMANCE_ROADMAP | P2-009 | ⏳ Pending |
| Image Loading | UI_PERFORMANCE_ROADMAP | P2-010 | ⏳ Pending |
| Animations | UI_PERFORMANCE_ROADMAP | P3-003 | ⏳ Pending |
| Empty States | UI_PERFORMANCE_ROADMAP | P3-004 | ⏳ Pending |
| Error Pages | UI_PERFORMANCE_ROADMAP | P3-005 | ⏳ Pending |

---

## Quick Commands Reference

```bash
# E2E Testing
npm run test:e2e              # Run Playwright tests
npm run test:e2e:ui           # Run with UI
npx playwright show-report    # View test report

# Load Testing
npm run test:load             # Run k6 load tests
k6 run tests/load/api-endpoints.js

# Code Quality
grep -r "console\." app/api/  # Find console.log
grep -r "TODO" app/ lib/      # Find TODOs
grep -r ": any" app/ lib/     # Find any types

# Git
git status                    # Check uncommitted
git diff                      # Review changes
git log --oneline -20         # Recent commits

# Security
npm audit                     # Check vulnerabilities
npm audit fix                 # Fix vulnerabilities

# Testing
npm test                      # Run all tests
npm run test:coverage         # Coverage report
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | Architecture Agent | Initial creation |

---

## Contact Information

- **Technical Questions:** dev@purpleglow.co.za
- **Security Concerns:** security@purpleglow.co.za
- **Compliance (POPIA):** legal@purpleglow.co.za

---

**Prepared By:** Architecture & Planning Agent  
**Review Status:** Ready for implementation  
**Next Review:** After Week 2 completion

---

*Lekker building! Let's ship quality.* 🚀🇿🇦
