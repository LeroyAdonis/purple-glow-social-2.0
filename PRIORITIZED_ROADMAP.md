# Purple Glow Social 2.0 - Prioritized Roadmap

**Document Version:** 1.0  
**Created:** January 19, 2026  
**Author:** Architecture & Planning Agent  
**Status:** Active Planning Document

---

## Executive Summary

### Current State Assessment

| Metric | Score | Details |
|--------|-------|---------|
| **Overall Readiness** | 78/100 | Strong foundation with specific gaps |
| **Security Score** | 8.5/10 | Robust auth, 1 critical race condition |
| **Feature Completion** | 93/94 | 99% features implemented |
| **Test Coverage** | 100% | 128/128 tests passing |
| **Documentation** | 65/100 | Outdated in places |

### Target State

| Milestone | Score | Timeline |
|-----------|-------|----------|
| Sprint 0 Complete | 85/100 | Week 1 |
| Sprint 1 Complete | 90/100 | Week 2 |
| Sprint 2 Complete | 95+/100 | Week 3 |
| Production Launch | 95+/100 | Week 3-4 |

### Critical Path Summary

```
Week 1 (Sprint 0): Fix blocking issues
├── Race condition fix (CRITICAL) ─────────► 85/100
├── npm vulnerabilities
├── Legal pages (POPIA)
├── JSON parsing consistency
└── Job log deletion bug

Week 2 (Sprint 1): Production hardening
├── Replace console.log with logger ───────► 90/100
├── Rate limiting gaps
├── Webhook retry logic
└── Debug logging cleanup

Week 3 (Sprint 2): Quality & polish
├── Documentation updates ─────────────────► 95+/100
├── Commit all changes
├── E2E tests (critical paths)
└── Final security audit

Week 4+: Production launch & monitoring
```

### Total Effort Estimate

| Sprint | Effort | Team Size | Duration |
|--------|--------|-----------|----------|
| Sprint 0 | 15-20 hours | 2 devs | 5 days |
| Sprint 1 | 10-15 hours | 2 devs | 5 days |
| Sprint 2 | 15-20 hours | 2 devs | 5 days |
| **Total** | **40-55 hours** | **2 devs** | **3 weeks** |

### Risk Assessment Summary

| Risk Level | Count | Impact |
|------------|-------|--------|
| 🔴 Critical (Blocking) | 1 | Revenue loss, system abuse |
| 🟠 High (Fix before launch) | 4 | Legal compliance, user experience |
| 🟡 Medium (First sprint post-launch) | 5 | Operational robustness |
| 🟢 Low (Backlog) | 3 | Code quality |

---

## Sprint 0: Pre-Production Critical Fixes

**Goal:** Fix all blocking issues, reach 85/100 production readiness  
**Duration:** Week 1 (5 working days)  
**Effort:** 15-20 hours  
**Team:** 2 developers (1 senior backend, 1 frontend)  
**Dependencies:** None (can start immediately)

### Task 0.1: Fix Credit Deduction Race Condition

| Attribute | Value |
|-----------|-------|
| **Priority** | 🚨 P0 (BLOCKING) |
| **Severity** | 🔴 CRITICAL |
| **Effort** | 4-6 hours |
| **Owner** | Senior Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Revenue loss, system abuse, reputation damage |

**Problem Description:**

Credit deduction is not atomic. Two concurrent requests can read the same balance, validate independently, and both succeed even if insufficient credits exist.

```
Exploit Scenario:
User has 6 credits, sends 2 concurrent requests each needing 5 credits:
T0: Request A reads 6 credits, validates ✓
T1: Request B reads 6 credits, validates ✓
T2: Request A posts successfully, deducts 5 (balance: 1)
T3: Request B posts successfully, deducts 5 (balance: 0)
Result: User got 10 posts with only 6 credits (exploited 4 credits)
```

**Files to Modify:**
- `lib/db/users.ts` - Add atomic deduct function
- `app/api/posts/publish/route.ts:154` - Use atomic function

**Implementation:**

```typescript
// lib/db/users.ts - Add atomic check-and-deduct
export async function deductCreditsAtomic(userId: string, amount: number) {
  const [result] = await db
    .update(user)
    .set({ credits: sql`${user.credits} - ${amount}` })
    .where(and(
      eq(user.id, userId),
      sql`${user.credits} >= ${amount}` // Only if enough credits
    ))
    .returning({ credits: user.credits });
  
  if (!result) {
    return { success: false, newBalance: 0 };
  }
  return { success: true, newBalance: result.credits };
}
```

**Acceptance Criteria:**
- [ ] `deductCreditsAtomic()` function implemented in `lib/db/users.ts`
- [ ] `/api/posts/publish` uses atomic function instead of check-then-deduct
- [ ] Unit tests for concurrent credit deduction (simulate race condition)
- [ ] Integration test with 10 simultaneous requests
- [ ] Zero race condition possible after fix
- [ ] Update `features.json` - mark issue-001 as fixed

**Testing Strategy:**
```bash
# Concurrent request test
for i in {1..10}; do
  curl -X POST /api/posts/publish \
    -d '{"platforms":["facebook"],"content":"Test"}' &
done
wait
# Verify: Only requests within credit balance succeeded
```

---

### Task 0.2: Fix npm Vulnerabilities

| Attribute | Value |
|-----------|-------|
| **Priority** | 🚨 P0 (BLOCKING) |
| **Severity** | 🔴 HIGH |
| **Effort** | 1-2 hours |
| **Owner** | DevOps/Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Security vulnerabilities, compliance issues |

**Current State:**
- 10 total vulnerabilities found
- 3 high severity (react-router CSRF/XSS, undici decompression)
- Most are transitive dependencies

**Files to Modify:**
- `package.json`
- `package-lock.json`

**Implementation:**

```bash
# Step 1: Audit current state
npm audit

# Step 2: Auto-fix what's possible
npm audit fix

# Step 3: If breaking changes needed
npm install react-router@latest react-router-dom@latest

# Step 4: Verify fix
npm audit
# Expected: 0 high or critical vulnerabilities

# Step 5: Run tests to ensure nothing broke
npm test
```

**Acceptance Criteria:**
- [ ] `npm audit` shows 0 high-severity vulnerabilities
- [ ] `npm audit` shows 0 critical vulnerabilities
- [ ] All 128 tests still passing
- [ ] Application builds successfully (`npm run build`)
- [ ] Document any accepted low/moderate vulnerabilities in `SECURITY.md`

---

### Task 0.3: Create Legal Pages (POPIA Compliance)

| Attribute | Value |
|-----------|-------|
| **Priority** | 🚨 P0 (BLOCKING) |
| **Severity** | 🔴 HIGH |
| **Effort** | 4-6 hours |
| **Owner** | Frontend Developer + Legal Review |
| **Dependencies** | None |
| **Risk if Skipped** | POPIA violation, legal liability, cannot launch in SA |

**Problem:**
Landing page claims POPIA compliance but no legal pages exist.

**Files to Create:**
- `app/legal/privacy/page.tsx` - Privacy Policy
- `app/legal/terms/page.tsx` - Terms of Service
- `app/legal/cookies/page.tsx` - Cookie Policy
- `components/CookieConsent.tsx` - Cookie consent banner

**Files to Modify:**
- `app/layout.tsx` - Add CookieConsent component
- `components/Footer.tsx` - Add legal page links

**Privacy Policy Must Include (POPIA):**
1. Information Officer details
2. Purpose of data collection
3. Categories of data collected
4. Third-party sharing (Polar, Google, social platforms)
5. Data retention periods
6. User rights (access, correction, deletion)
7. Cookie usage
8. Security measures
9. Contact information
10. **Data retention after deletion** (7-year tax law requirement)

**Terms of Service Must Include:**
1. Service description
2. User obligations
3. Acceptable use policy
4. Payment terms (ZAR, 15% VAT)
5. Credit system rules
6. Intellectual property
7. Limitation of liability
8. Termination conditions
9. Dispute resolution (SA law)
10. Contact information

**Cookie Consent Requirements:**
- Must appear before any non-essential cookies set
- Must allow granular consent (essential, analytics, marketing)
- Must remember user preference
- Must be dismissable

**Acceptance Criteria:**
- [ ] Privacy Policy page at `/legal/privacy`
- [ ] Terms of Service page at `/legal/terms`
- [ ] Cookie Policy page at `/legal/cookies`
- [ ] Cookie consent banner appears on first visit
- [ ] Cookie preference stored in localStorage
- [ ] Footer links to all legal pages
- [ ] Data retention policy clearly explains 7-year financial record retention
- [ ] Legal review completed (or flagged for review)

---

### Task 0.4: Fix JSON Parsing Consistency

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 P1 (HIGH) |
| **Severity** | 🟠 HIGH |
| **Effort** | 2-3 hours |
| **Owner** | Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Poor UX, inconsistent errors, DoS vector |

**Problem:**
18 API routes call `await request.json()` without error handling. Malformed JSON causes 500 errors instead of 400.

**Affected Routes (18 total):**
1. `app/api/admin/users/route.ts:61`
2. `app/api/admin/jobs/retry/route.ts:16`
3. `app/api/user/profile/route.ts:80`
4. `app/api/user/automation-rules/route.ts:119, 159`
5. `app/api/posts/scheduled/publish/route.ts:27`
6. `app/api/posts/schedule/route.ts:155`
7. `app/api/ai/topics/route.ts:39`
8. `app/api/notifications/read/route.ts:29`
9. `app/api/ai/generate/route.ts:80`
10. `app/api/posts/publish/route.ts:52`
11. `app/api/ai/learning/route.ts:55`
12. `app/api/ai/feedback/route.ts:32`
13. `app/api/notifications/dismiss/route.ts:29`
14. `app/api/ai/hashtags/route.ts:39`
15. `app/api/checkout/credits/route.ts:29`
16. `app/api/ai/analytics/route.ts:68`
17. `app/api/checkout/subscription/route.ts:29`

**Implementation:**

```typescript
// Create helper: lib/api/parse-json.ts
export async function parseRequestBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T;
  } catch {
    return null;
  }
}

// Usage in API routes:
import { parseRequestBody } from '@/lib/api/parse-json';

export async function POST(request: NextRequest) {
  const body = await parseRequestBody<{ topic: string; platform: string }>(request);
  
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
  
  // Continue with validated body...
}
```

**Acceptance Criteria:**
- [ ] Helper function `parseRequestBody()` created
- [ ] All 18 routes updated to use helper
- [ ] Malformed JSON returns 400 (not 500)
- [ ] Error message is user-friendly
- [ ] Unit tests for malformed JSON handling

---

### Task 0.5: Fix Job Log Deletion Bug

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 P1 (HIGH) |
| **Severity** | 🟠 HIGH |
| **Effort** | 1-2 hours |
| **Owner** | Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | POPIA non-compliance, orphaned data |

**Problem:**
Account deletion uses equality check on JSONB column which won't match:

```typescript
// Current (broken) - Line 97
await tx.delete(jobLogs).where(eq(jobLogs.payload, { userId }));
// This checks: payload == { userId: "xxx" }
// But payload is: { userId: "xxx", postId: "yyy", ... }
// Result: NO ROWS DELETED
```

**File to Modify:**
- `app/api/user/delete/route.ts:97`

**Implementation:**

```typescript
// Fix: Use JSONB contains operator
await tx.delete(jobLogs).where(
  sql`${jobLogs.payload}->>'userId' = ${userId}`
);
```

**Acceptance Criteria:**
- [ ] JSONB query fixed in account deletion
- [ ] Integration test: create job log, delete account, verify log deleted
- [ ] Verify all user data is deleted (POPIA compliance)
- [ ] Update `features.json` - mark issue-003 as fixed

---

### Sprint 0 Summary

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| 0.1 Race Condition Fix | P0 🚨 | 4-6h | ⬜ Not Started |
| 0.2 npm Vulnerabilities | P0 🚨 | 1-2h | ⬜ Not Started |
| 0.3 Legal Pages | P0 🚨 | 4-6h | ⬜ Not Started |
| 0.4 JSON Parsing | P1 🟠 | 2-3h | ⬜ Not Started |
| 0.5 Job Log Bug | P1 🟠 | 1-2h | ⬜ Not Started |

**Sprint 0 Output:** Production-blocking issues resolved → **85/100 readiness**

**Sprint 0 Exit Criteria:**
- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] All 128+ tests passing
- [ ] `npm audit` clean (no high/critical)
- [ ] Legal pages live
- [ ] Race condition impossible

---

## Sprint 1: Production Hardening

**Goal:** Harden codebase for production, reach 90/100 readiness  
**Duration:** Week 2 (5 working days)  
**Effort:** 10-15 hours  
**Team:** 2 developers  
**Dependencies:** Sprint 0 complete

### Task 1.1: Replace console.log with Structured Logger

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 3-4 hours |
| **Owner** | Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Log leakage, poor observability, debug difficulty |

**Problem:**
30+ `console.log` and `console.error` statements in production API code instead of the structured logger.

**Affected Files (30+):**
```
app/api/notifications/route.ts:50
app/api/notifications/read-all/route.ts:32
app/api/admin/errors/route.ts:116
app/api/admin/users/route.ts:60, 129
app/api/limits/check/route.ts:194
app/api/checkout/subscription/route.ts:80
... and 20+ more
```

**Implementation:**

```typescript
// Before
console.error('Error:', error);
console.log('User:', user.id);

// After
import { logger } from '@/lib/logger';

logger.api.error('Error processing request', { error });
logger.api.debug('Processing user', { userId: user.id });
```

**Acceptance Criteria:**
- [ ] Find all `console.log` in `app/api/` directory
- [ ] Replace with appropriate logger context (api, auth, cron, etc.)
- [ ] Find all `console.error` in `app/api/` directory
- [ ] Replace with `logger.*.error()` or `logger.*.exception()`
- [ ] Zero `console.log/error` in API routes
- [ ] Verify logs appear correctly in dev mode
- [ ] Verify Sentry receives error-level logs

**Search Command:**
```bash
grep -r "console\." app/api/ --include="*.ts" | wc -l
# Should be 0 after fix
```

---

### Task 1.2: Add Rate Limiting to Account Deletion

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 30 minutes |
| **Owner** | Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | DoS vulnerability, database load |

**Problem:**
Account deletion endpoint has no rate limiting. Attackers could spam deletion requests.

**File to Modify:**
- `app/api/user/delete/route.ts`

**Implementation:**

```typescript
import { rateLimiters } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Authenticate first
    const authSession = await auth.api.getSession({ headers: request.headers });
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting: 5 attempts per hour per user
    const rateLimitResult = await rateLimiters.auth.limit(
      `account-delete:${authSession.user.id}`
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many deletion attempts',
          message: 'Please wait before trying again',
          retryAfter: Math.ceil(((rateLimitResult as any).reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Rest of deletion logic...
  }
}
```

**Acceptance Criteria:**
- [ ] Rate limiting added (5 attempts per hour)
- [ ] Returns 429 with Retry-After header on limit
- [ ] Unit test for rate limiting behavior
- [ ] Update `features.json` - mark issue-004 as fixed

---

### Task 1.3: Fix Webhook Error Handling

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 2 hours |
| **Owner** | Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Lost webhook events, manual recovery needed |

**Problem:**
Webhook errors are caught and logged, but success is always returned. Transient failures won't be retried by Polar.

**File to Modify:**
- `app/api/webhooks/polar/route.ts:28-32`

**Implementation:**

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
      error.name === 'DatabaseError'
    );
  
  if (isRetryable) {
    // Return 500 to trigger Polar retry (up to 3 retries)
    return NextResponse.json(
      { error: 'Temporary failure, please retry' },
      { status: 500 }
    );
  }
  
  // For validation errors, duplicate events, etc., don't retry
  // Log but return success to prevent infinite retries
  logger.polar.warn('Non-retryable webhook error, acknowledging', { 
    webhookType: payload.type, 
    eventId,
    errorMessage: error instanceof Error ? error.message : 'Unknown'
  });
}
```

**Acceptance Criteria:**
- [ ] Retryable errors return 500 (triggers Polar retry)
- [ ] Non-retryable errors return 200 (prevents infinite loops)
- [ ] All webhook errors logged with context
- [ ] Unit test for retry logic
- [ ] Update `features.json` - mark issue-005 as fixed

---

### Task 1.4: Update Privacy Policy (Data Retention)

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 1 hour |
| **Owner** | Frontend Developer |
| **Dependencies** | Task 0.3 (Legal Pages) |
| **Risk if Skipped** | User confusion, POPIA complaints |

**Problem:**
Account deletion retains anonymized transactions for 7 years (tax law). This isn't clearly communicated.

**Files to Modify:**
- `app/legal/privacy/page.tsx` (created in Sprint 0)
- `app/api/user/delete/route.ts` (response message)
- `components/modals/AccountDeletionModal.tsx` (if exists)

**Content to Add to Privacy Policy:**

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

**Update API Response:**

```typescript
return NextResponse.json({
  success: true,
  message: 'Your account and all personal data have been permanently deleted.',
  note: 'Anonymized financial records retained for 7 years per SA tax law.',
  deletedAt: new Date().toISOString(),
});
```

**Acceptance Criteria:**
- [ ] Privacy policy updated with data retention section
- [ ] Account deletion API response includes retention note
- [ ] UI shows retention info before user confirms deletion
- [ ] Update `features.json` - mark issue-006 as fixed

---

### Task 1.5: Remove Debug Token Logging

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 15 minutes |
| **Owner** | Backend Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Partial key exposure in logs |

**Problem:**
Debug logging exposes partial encryption key and token information.

**File to Modify:**
- `lib/db/connected-accounts.ts:55-62`

**Current Code (Remove):**
```typescript
logger.db.debug('Attempting decryption', { 
  platform, 
  keyStart: key?.substring(0, 4),      // Exposing key fragment
  keyEnd: key?.substring(60),          // Exposing key fragment
  tokenStart: account.accessToken.substring(0, 20), // Exposing token
});
```

**Fixed Code:**
```typescript
logger.db.debug('Attempting decryption', { 
  platform,
  hasKey: !!process.env.TOKEN_ENCRYPTION_KEY,
  keyLength: process.env.TOKEN_ENCRYPTION_KEY?.length,
  hasToken: !!account.accessToken,
});
```

**Acceptance Criteria:**
- [ ] No key fragments in debug logs
- [ ] No token fragments in debug logs
- [ ] Debug logging still useful for troubleshooting
- [ ] Update `features.json` - mark issue-007 as fixed

---

### Sprint 1 Summary

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| 1.1 Replace console.log | P2 🟡 | 3-4h | ⬜ Not Started |
| 1.2 Rate Limit Deletion | P2 🟡 | 30m | ⬜ Not Started |
| 1.3 Webhook Retry Logic | P2 🟡 | 2h | ⬜ Not Started |
| 1.4 Data Retention Docs | P2 🟡 | 1h | ⬜ Not Started |
| 1.5 Debug Logging Fix | P2 🟡 | 15m | ⬜ Not Started |

**Sprint 1 Output:** Production-hardened codebase → **90/100 readiness**

**Sprint 1 Exit Criteria:**
- [ ] Zero `console.log/error` in API routes
- [ ] Rate limiting on all sensitive endpoints
- [ ] Webhook retry logic implemented
- [ ] Privacy policy complete with retention info
- [ ] No sensitive data in debug logs

---

## Sprint 2: Quality & Documentation

**Goal:** Polish codebase, complete documentation, reach 95+/100 readiness  
**Duration:** Week 3 (5 working days)  
**Effort:** 15-20 hours  
**Team:** 2 developers  
**Dependencies:** Sprint 1 complete

### Task 2.1: Update All Documentation

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 4-6 hours |
| **Owner** | Any Developer |
| **Dependencies** | Sprints 0-1 complete |
| **Risk if Skipped** | Developer confusion, onboarding difficulty |

**Problem:**
Documentation references removed features and doesn't reflect current architecture.

**Files to Update:**

1. **AGENTS.md**
   - Remove reference to `/api/cron/process-scheduled-posts`
   - Update architecture to reflect Inngest migration
   - Add new API routes documentation

2. **docs/API_DOCUMENTATION.md**
   - Remove deleted cron endpoint
   - Add new endpoints from Phase 11
   - Update request/response examples

3. **PHASE_9_AUTO_POSTING_COMPLETE.md**
   - Note migration from Vercel Cron to Inngest
   - Update architecture diagram

4. **README.md**
   - Verify all features listed are accurate
   - Update quick start guide

5. **app-spec.md**
   - Mark critical issue as fixed (after Sprint 0)
   - Update known issues section

**Acceptance Criteria:**
- [ ] No references to deleted `/api/cron/process-scheduled-posts`
- [ ] Inngest architecture documented
- [ ] All API endpoints documented accurately
- [ ] Phase completion docs updated
- [ ] README reflects current state

---

### Task 2.2: Commit All Pending Changes

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 2 hours |
| **Owner** | Any Developer |
| **Dependencies** | All code changes complete |
| **Risk if Skipped** | Lost work, unclear git history |

**Problem:**
28 modified files and 13 untracked files uncommitted.

**Files to Review (Modified):**
```
- app/api/ai/*.ts (6 files) - Rate limiting additions
- app/api/auth/[...all]/route.ts - Auth improvements
- app/api/oauth/*.ts (8 files) - OAuth enhancements
- app/api/posts/*.ts (3 files) - Posting improvements
- lib/ai/gemini-service.ts - AI service updates
- lib/oauth/token-refresh-service.ts - Token refresh
- vercel.json - Cron configuration
```

**Files to Review (Untracked - should be added):**
```
- middleware.ts - Global route protection
- SECURITY_AUDIT_REPORT.md
- PRODUCTION_DEPLOYMENT_CHECKLIST.md
- PROJECT_COMPLETION_ANALYSIS.md
- PRIORITIZED_ROADMAP.md (this document)
```

**Implementation:**

```bash
# Step 1: Review all changes
git status
git diff

# Step 2: Stage changes by category
git add app/api/ai/ -p  # Review rate limiting
git add app/api/oauth/ -p  # Review OAuth changes
git add lib/ -p  # Review library changes

# Step 3: Create meaningful commits
git commit -m "feat(security): add rate limiting to AI endpoints"
git commit -m "fix(oauth): improve token refresh reliability"
git commit -m "chore(docs): add security audit and roadmap documentation"

# Step 4: Push to remote
git push origin main
```

**Acceptance Criteria:**
- [ ] All 28 modified files reviewed and committed
- [ ] All 13 untracked files added or `.gitignore`d
- [ ] Meaningful commit messages
- [ ] Clean `git status` (no uncommitted changes)
- [ ] Remote repository up to date

---

### Task 2.3: Add E2E Tests (Critical Paths)

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 6-8 hours |
| **Owner** | QA/Developer |
| **Dependencies** | Sprints 0-1 complete |
| **Risk if Skipped** | Regression risk, manual testing burden |

**Problem:**
Only unit/integration tests exist. No end-to-end tests for critical user journeys.

**Setup:**

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Create config
npx playwright init
```

**Tests to Create:**

1. **Auth Flow** (`tests/e2e/auth-flow.spec.ts`)
   - Sign up with email/password
   - Login with existing credentials
   - Login with Google OAuth
   - Password reset flow
   - Logout

2. **Content Generation** (`tests/e2e/content-generation.spec.ts`)
   - Generate content with AI
   - Select different languages
   - Select different tones
   - Copy generated content

3. **Payment Flow** (`tests/e2e/payment-flow.spec.ts`)
   - View pricing page
   - Initiate subscription checkout
   - Initiate credit purchase
   - (Mock Polar redirect)

4. **Post Publishing** (`tests/e2e/posting-flow.spec.ts`)
   - Connect social account (mock)
   - Create and publish post
   - Schedule post for later
   - View scheduled posts

**Acceptance Criteria:**
- [ ] Playwright configured
- [ ] Auth flow E2E test passing
- [ ] Content generation E2E test passing
- [ ] Payment flow E2E test passing (with mocks)
- [ ] Posting flow E2E test passing (with mocks)
- [ ] E2E tests run in CI/CD pipeline

---

### Task 2.4: Remove TODO Comments / Clean Up Code

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 P3 (LOW) |
| **Severity** | 🟢 LOW |
| **Effort** | 1 hour |
| **Owner** | Any Developer |
| **Dependencies** | None |
| **Risk if Skipped** | Minor - code clutter |

**Problem:**
TODO comments in production code for unimplemented features.

**File to Update:**
- `app/api/posts/schedule/route.ts:19`

**Current:**
```typescript
// recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(), // TODO: Implement recurrence
```

**Options:**
1. Remove comment entirely (feature not planned for v1)
2. Move to GitHub Issue for tracking
3. Implement the feature (out of scope for this sprint)

**Search for all TODOs:**
```bash
grep -r "TODO" app/ lib/ components/ --include="*.ts" --include="*.tsx"
```

**Acceptance Criteria:**
- [ ] All TODO comments reviewed
- [ ] Each TODO either removed, moved to issue tracker, or documented
- [ ] No orphan TODO comments in production code

---

### Task 2.5: Remove Empty Directory

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 P3 (LOW) |
| **Severity** | 🟢 LOW |
| **Effort** | 5 minutes |
| **Owner** | Any Developer |
| **Dependencies** | None |

**Problem:**
Empty directory exists from deleted cron job.

**Directory to Remove:**
- `app/api/cron/process-scheduled-posts/` (empty)

**Implementation:**
```bash
rm -rf app/api/cron/process-scheduled-posts/
git add -A
git commit -m "chore: remove empty cron directory"
```

**Acceptance Criteria:**
- [ ] Empty directory removed
- [ ] Change committed

---

### Task 2.6: Final Security Audit

| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 P2 (MEDIUM) |
| **Severity** | 🟡 MEDIUM |
| **Effort** | 2-3 hours |
| **Owner** | Senior Developer |
| **Dependencies** | All Sprint 0-2 tasks complete |

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

**Acceptance Criteria:**
- [ ] All security checklist items verified
- [ ] Security audit report updated
- [ ] Any new issues documented

---

### Sprint 2 Summary

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| 2.1 Update Documentation | P2 🟡 | 4-6h | ⬜ Not Started |
| 2.2 Commit All Changes | P2 🟡 | 2h | ⬜ Not Started |
| 2.3 E2E Tests | P2 🟡 | 6-8h | ⬜ Not Started |
| 2.4 Remove TODOs | P3 🟢 | 1h | ⬜ Not Started |
| 2.5 Remove Empty Dir | P3 🟢 | 5m | ⬜ Not Started |
| 2.6 Security Audit | P2 🟡 | 2-3h | ⬜ Not Started |

**Sprint 2 Output:** Production-ready application → **95+/100 readiness**

**Sprint 2 Exit Criteria:**
- [ ] All documentation current and accurate
- [ ] Git repository clean and up to date
- [ ] E2E tests for critical paths
- [ ] Final security audit passed
- [ ] Ready for production deployment

---

## Sprint 3+: Post-Launch Enhancements

**Goal:** Continuous improvement and feature expansion  
**Duration:** Ongoing (post-production launch)  
**Effort:** Variable  
**Team:** Full team  
**Dependencies:** Production stable

### Future Features Backlog

| Feature | Priority | Effort | Business Value |
|---------|----------|--------|----------------|
| Post Recurrence | High | 2-3 days | User retention |
| Video Content Support | High | 1-2 weeks | Feature parity |
| Instagram Stories | Medium | 1 week | Engagement |
| Real-time Analytics | Medium | 2 weeks | User insights |
| Team Collaboration | Medium | 3-4 weeks | Enterprise sales |
| LinkedIn Company Pages | Medium | 1 week | B2B value |
| A/B Testing for Content | Low | 2 weeks | Optimization |
| Bulk Upload (CSV/Excel) | Low | 1 week | Power users |
| Developer API | Low | 3-4 weeks | Integrations |
| PWA Implementation | Low | 1 week | Mobile UX |

### Post-Launch Monitoring

**Week 1 Post-Launch:**
- [ ] Daily credit transaction audit
- [ ] Error rate monitoring (target: <0.5%)
- [ ] Admin action audit log review
- [ ] Webhook success rate (target: >95%)
- [ ] User feedback collection

**Week 2-4 Post-Launch:**
- [ ] Weekly security log review
- [ ] NPM audit check
- [ ] Performance metrics review
- [ ] User feedback analysis

**Monthly:**
- [ ] Full security audit
- [ ] Dependency updates
- [ ] Performance optimization review
- [ ] POPIA compliance review

### Technical Debt Backlog

| Item | Priority | Location | Effort |
|------|----------|----------|--------|
| Database-backed admin roles | Medium | `lib/security/auth-utils.ts` | 4-6h |
| Request timeout on AI calls | Low | `lib/ai/gemini-service.ts` | 2h |
| TypeScript `any` cleanup | Low | Various (13 instances) | 3-4h |
| Connection pooling at scale | Low | Database config | 2-3h |

---

## Dependency Graph

### Visual Dependency Map

```
SPRINT 0 (Week 1) - No external dependencies
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │ 0.1 Race     │   │ 0.2 npm      │   │ 0.3 Legal    │        │
│  │ Condition    │   │ Vulnerabilities│  │ Pages        │        │
│  │ (CRITICAL)   │   │ (CRITICAL)   │   │ (CRITICAL)   │        │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘        │
│         │                  │                  │                 │
│         │    ┌─────────────┴──────────────────┘                 │
│         │    │                                                  │
│  ┌──────▼────▼──┐   ┌──────────────┐                           │
│  │ 0.4 JSON     │   │ 0.5 Job Log  │                           │
│  │ Parsing      │   │ Bug          │                           │
│  │ (HIGH)       │   │ (HIGH)       │                           │
│  └──────────────┘   └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
SPRINT 1 (Week 2) - Depends on Sprint 0 completion
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │ 1.1 Logger   │   │ 1.2 Rate     │   │ 1.3 Webhook  │        │
│  │ Migration    │   │ Limiting     │   │ Retry        │        │
│  └──────────────┘   └──────────────┘   └──────────────┘        │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐                           │
│  │ 1.4 Privacy  │◄──│ 0.3 Legal    │ (depends on)              │
│  │ Update       │   │ Pages        │                           │
│  └──────────────┘   └──────────────┘                           │
│                                                                 │
│  ┌──────────────┐                                               │
│  │ 1.5 Debug    │                                               │
│  │ Logging      │                                               │
│  └──────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
SPRINT 2 (Week 3) - Depends on Sprint 1 completion
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │ 2.1 Docs     │   │ 2.2 Git      │   │ 2.3 E2E      │        │
│  │ Update       │   │ Commit       │   │ Tests        │        │
│  └──────────────┘   └──────┬───────┘   └──────────────┘        │
│                            │                                    │
│  ┌──────────────┐   ┌──────▼───────┐                           │
│  │ 2.4 TODO     │   │ 2.5 Empty    │                           │
│  │ Cleanup      │   │ Dir Remove   │                           │
│  └──────────────┘   └──────────────┘                           │
│                                                                 │
│  ┌──────────────────────────────────┐                          │
│  │ 2.6 Final Security Audit         │◄── ALL TASKS COMPLETE    │
│  │ (Gate to Production)             │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ PRODUCTION       │
                    │ LAUNCH           │
                    │ (95+/100)        │
                    └──────────────────┘
```

### Parallel Execution Opportunities

**Sprint 0 - Can run in parallel:**
- Task 0.1 (Race Condition) - Backend Developer A
- Task 0.2 (npm fix) - DevOps/Developer B
- Task 0.3 (Legal Pages) - Frontend Developer
- Task 0.4 (JSON Parsing) - Backend Developer A (after 0.1)
- Task 0.5 (Job Log) - Backend Developer B (after 0.2)

**Sprint 1 - Can run in parallel:**
- Task 1.1 (Logger) - Backend Developer A
- Task 1.2 (Rate Limiting) - Backend Developer B
- Task 1.3 (Webhook) - Backend Developer A (after 1.1)
- Task 1.4 (Privacy) - Frontend Developer
- Task 1.5 (Debug Log) - Backend Developer B (after 1.2)

**Sprint 2 - Can run in parallel:**
- Task 2.1 (Docs) - Any Developer
- Task 2.2 (Git) - Any Developer (after all code changes)
- Task 2.3 (E2E Tests) - QA/Developer
- Task 2.4 (TODOs) - Any Developer
- Task 2.5 (Empty Dir) - Any Developer
- Task 2.6 (Audit) - Senior Developer (LAST)

---

## Risk Analysis

### Sprint 0 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Race condition fix breaks existing tests** | Medium | High | Run full test suite after fix, add new concurrent tests |
| **npm audit fix introduces breaking changes** | Medium | Medium | Test thoroughly, pin versions if needed |
| **Legal pages require extended legal review** | High | Medium | Use template, flag for legal review post-launch |
| **JSON parsing changes affect edge cases** | Low | Medium | Add comprehensive unit tests for all affected routes |
| **Database migration issues** | Low | High | Test in staging first, have rollback plan |

**Sprint 0 Contingency:** If race condition fix is complex, implement temporary rate limiting (1 req/10sec per user) as mitigation while permanent fix is developed.

### Sprint 1 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Logger migration misses some console.log** | Medium | Low | Use grep to verify, add linting rule |
| **Webhook retry logic causes duplicate processing** | Medium | Medium | Add idempotency checks, use eventId |
| **Privacy policy text needs legal approval** | High | Low | Use template, mark as "subject to legal review" |

**Sprint 1 Contingency:** Logger migration can be done incrementally - critical paths first, then remaining files.

### Sprint 2 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **E2E tests are flaky** | High | Low | Focus on happy path, mock external services |
| **Documentation takes longer than expected** | Medium | Low | Prioritize critical docs (AGENTS.md, API) |
| **Git commit history messy** | Low | Low | Review before push, squash if needed |
| **Security audit finds new issues** | Medium | Medium | Document new issues, prioritize for Sprint 3 |

**Sprint 2 Contingency:** E2E tests can be marked as "in progress" for launch if stable tests for auth and payment flows pass.

### Overall Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Timeline slip** | Medium | Medium | 1-week buffer built in, prioritize blocking issues |
| **Resource unavailability** | Low | High | Cross-train team, document thoroughly |
| **External service outage (Polar, Gemini)** | Low | High | Implement circuit breakers, graceful degradation |
| **Post-launch critical bug** | Medium | High | Monitoring in place, rollback plan ready |

---

## Resource Plan

### Team Allocation

| Role | Sprint 0 | Sprint 1 | Sprint 2 | Availability |
|------|----------|----------|----------|--------------|
| **Senior Backend Developer** | 80% | 60% | 40% | Lead on security tasks |
| **Backend Developer** | 80% | 80% | 60% | Core API fixes |
| **Frontend Developer** | 60% | 40% | 40% | Legal pages, UI updates |
| **QA Engineer** | 20% | 20% | 80% | E2E tests, final testing |
| **DevOps** | 20% | 10% | 20% | npm, CI/CD, deployment |
| **Tech Lead** | Review | Review | Audit | Code review, security audit |

### Effort Distribution

```
Sprint 0 (15-20 hours total):
├── Senior Backend: 8 hours (Race condition, JSON parsing)
├── Backend: 4 hours (npm, Job log)
├── Frontend: 6 hours (Legal pages)
└── DevOps: 2 hours (npm audit, CI verification)

Sprint 1 (10-15 hours total):
├── Senior Backend: 4 hours (Webhook retry)
├── Backend: 5 hours (Logger, rate limiting, debug log)
└── Frontend: 2 hours (Privacy policy update)

Sprint 2 (15-20 hours total):
├── Any Developer: 6 hours (Docs, git, TODOs, empty dir)
├── QA/Developer: 8 hours (E2E tests)
└── Senior Developer: 3 hours (Security audit)
```

### External Resources Needed

| Resource | Purpose | Cost | Status |
|----------|---------|------|--------|
| Legal Review | Privacy Policy, Terms | R 2,000-5,000 | Optional (use template) |
| Security Pen Test | Final audit | R 15,000-30,000 | Recommended post-launch |
| Load Testing | Performance validation | Free (k6) | Include in Sprint 2 |

---

## Timeline

### Gantt-Style Overview

```
Week 1: Sprint 0 - Critical Fixes
═══════════════════════════════════════════════════════════════════
Mon   │ Tue   │ Wed   │ Thu   │ Fri   │
──────┼───────┼───────┼───────┼───────┤
0.1 Race Condition Fix ████████████████│       │
0.2 npm Vulns  ███████│       │       │       │
0.3 Legal Pages        ████████████████████████│
0.4 JSON Parsing              │████████████████│
0.5 Job Log Bug               │███████│       │
──────┴───────┴───────┴───────┴───────┤
                              85/100 ──►

Week 2: Sprint 1 - Production Hardening
═══════════════════════════════════════════════════════════════════
Mon   │ Tue   │ Wed   │ Thu   │ Fri   │
──────┼───────┼───────┼───────┼───────┤
1.1 Logger Migration ██████████████████│       │
1.2 Rate Limiting ████│       │       │       │
1.3 Webhook Retry      ████████████████│       │
1.4 Privacy Update            │███████│       │
1.5 Debug Logging █████│      │       │       │
──────┴───────┴───────┴───────┴───────┤
                              90/100 ──►

Week 3: Sprint 2 - Quality & Documentation
═══════════════════════════════════════════════════════════════════
Mon   │ Tue   │ Wed   │ Thu   │ Fri   │
──────┼───────┼───────┼───────┼───────┤
2.1 Documentation ██████████████████████│      │
2.3 E2E Tests    ██████████████████████████████│
2.2 Git Commits         │██████│       │       │
2.4 TODO Cleanup        │██████│       │       │
2.5 Empty Dir           │█████│        │       │
2.6 Security Audit             │████████████████│
──────┴───────┴───────┴───────┴───────┤
                              95+/100 ──►

Week 4: Production Launch
═══════════════════════════════════════════════════════════════════
Mon   │ Tue   │ Wed   │ Thu   │ Fri   │
──────┼───────┼───────┼───────┼───────┤
Final Testing  ████████│       │       │       │
Staging Deploy  ███████████████│       │       │
Production Deploy      │████████████████│      │
Monitoring & Support          │████████████████│
──────┴───────┴───────┴───────┴───────┤
                          LIVE! 🚀 ──►
```

### Key Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| Sprint 0 Complete | End of Week 1 | 85/100, no blocking issues |
| Sprint 1 Complete | End of Week 2 | 90/100, production-hardened |
| Sprint 2 Complete | End of Week 3 | 95+/100, fully documented |
| Staging Deploy | Week 4 Day 1-2 | All tests passing in staging |
| Production Launch | Week 4 Day 3 | Successful deployment |
| 7-Day Stability | Week 5 | <0.5% error rate, no rollbacks |

### Critical Path

```
Race Condition Fix (0.1) 
    → All tests pass 
        → Staging deployment 
            → Production launch

This is the longest sequential path and determines minimum timeline.
```

---

## Success Criteria Summary

### Sprint Gates

| Gate | Score | Criteria |
|------|-------|----------|
| **Sprint 0 Exit** | 85/100 | No blocking issues, legal pages live, race condition fixed |
| **Sprint 1 Exit** | 90/100 | Production-hardened, no console.log, rate limiting complete |
| **Sprint 2 Exit** | 95+/100 | Fully documented, E2E tests, security audit passed |
| **Launch Gate** | 95+/100 | Staging stable 24h, all checklists complete |

### Production Readiness Checklist

**Technical:**
- [ ] All 128+ tests passing
- [ ] E2E tests for critical paths passing
- [ ] `npm audit` clean (no high/critical)
- [ ] Race condition fixed and tested
- [ ] No console.log in production code

**Security:**
- [ ] Token encryption verified
- [ ] Rate limiting on all sensitive endpoints
- [ ] Admin authorization tested
- [ ] No sensitive data in logs
- [ ] Final security audit passed

**Compliance:**
- [ ] Privacy Policy live
- [ ] Terms of Service live
- [ ] Cookie consent implemented
- [ ] Data retention documented
- [ ] Account deletion working

**Operations:**
- [ ] Sentry configured and receiving errors
- [ ] Vercel Analytics enabled
- [ ] Database backups configured
- [ ] Rollback plan documented
- [ ] On-call rotation established

---

## Appendix A: Issue Cross-Reference

| Issue ID | Source Report | Sprint | Task | Status |
|----------|---------------|--------|------|--------|
| issue-001 | Security Bug Report | 0 | 0.1 | ⬜ |
| issue-002 | Security Bug Report | 0 | 0.4 | ⬜ |
| issue-003 | Security Bug Report | 0 | 0.5 | ⬜ |
| issue-004 | Security Bug Report | 1 | 1.2 | ⬜ |
| issue-005 | Security Bug Report | 1 | 1.3 | ⬜ |
| issue-006 | Security Bug Report | 1 | 1.4 | ⬜ |
| issue-007 | Security Bug Report | 1 | 1.5 | ⬜ |
| npm-vulns | Deep Scan Report | 0 | 0.2 | ⬜ |
| legal-pages | Deep Scan Report | 0 | 0.3 | ⬜ |
| console-log | Deep Scan Report | 1 | 1.1 | ⬜ |
| docs-outdated | Deep Scan Report | 2 | 2.1 | ⬜ |
| uncommitted | Deep Scan Report | 2 | 2.2 | ⬜ |
| no-e2e | Deep Scan Report | 2 | 2.3 | ⬜ |
| todo-comments | Deep Scan Report | 2 | 2.4 | ⬜ |

---

## Appendix B: Quick Commands Reference

```bash
# Sprint 0
npm audit                              # Check vulnerabilities
npm audit fix                          # Fix vulnerabilities
npm test                               # Run all tests

# Sprint 1
grep -r "console\." app/api/           # Find console.log
grep -r "TODO" app/ lib/ components/   # Find TODOs

# Sprint 2
rm -rf app/api/cron/process-scheduled-posts/  # Remove empty dir
git status                             # Check uncommitted
npx playwright test                    # Run E2E tests

# General
npm run build                          # Verify build
npm run dev                            # Local development
npm run db:push                        # Push schema changes
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | Architecture Agent | Initial creation |

---

**Prepared by:** Architecture & Planning Agent  
**Review Status:** Ready for team review  
**Next Review:** After Sprint 0 completion

---

*Lekker planning! Let's ship this.* 🚀🇿🇦
