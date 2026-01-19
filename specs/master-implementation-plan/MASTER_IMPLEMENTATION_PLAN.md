# Master Implementation Plan - Purple Glow Social 2.0

**Created:** 2026-01-19  
**Version:** 1.0  
**Status:** Ready for Execution  
**Based on:** Deep Codebase Scan Report (specs/architecture-analysis/DEEP_CODEBASE_SCAN_REPORT.md)

---

## Executive Overview

### Current State
- **Production Readiness Score:** 78/100
- **Tests Passing:** 128/128 ✅
- **Critical Issues:** 5
- **High Priority Issues:** 4
- **Medium Priority Issues:** 3

### Target State
- **Production Readiness Score:** 95+/100
- **All Security Vulnerabilities:** Resolved
- **Legal Compliance:** POPIA/GDPR compliant
- **Documentation:** Accurate and up-to-date

### Total Estimated Effort
- **Critical Fixes (Phase A):** 4-6 hours
- **Code Quality (Phase B):** 6-8 hours
- **Documentation (Phase C):** 3-4 hours
- **Testing & QA (Phase D):** 8-12 hours
- **Final Polish (Phase E):** 2-3 hours
- **Total:** 23-33 hours (~4-5 days with parallel execution)

### Critical Path
```
Phase A (Day 1) → Phase B (Days 2-3) → Phase C (Day 3-4) → Phase D (Days 4-5) → Phase E (Day 6)
                     ↓
              [Parallel tracks possible within phases]
```

---

## Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| npm audit fix breaks dependencies | Medium | Low | Test thoroughly after fix, pin versions if needed |
| Legal pages need legal review | High | Medium | Use standard templates, flag for legal review |
| E2E tests require environment setup | Medium | Medium | Use test accounts, mock external APIs |
| Documentation changes reveal more issues | Low | Medium | Document as we find, track for future sprints |

---

## Phase A: Critical Fixes [DAY 1]

**Priority:** 🔴 CRITICAL - Must complete before production  
**Total Estimated Time:** 4-6 hours  
**Blocking:** Yes - other phases depend on clean codebase

---

### Task A1: Fix npm Security Vulnerabilities

**Agent:** Coder Agent  
**Effort:** 30-60 minutes  
**Priority:** 🔴 Critical  
**Dependencies:** None  
**Parallelizable:** No (must complete first)

#### Current State
```
10 vulnerabilities (2 low, 5 moderate, 3 high)
- jws 4.0.0: HIGH - HMAC signature verification bypass
- react-router 7.x: HIGH - CSRF, XSS, SSR issues  
- next 16.0.0-16.0.8: HIGH - Local file disclosure
- undici <6.23.0: Moderate - Decompression DoS
- esbuild <=0.24.2: Moderate - Development server vulnerability
```

#### Actions Required

**Step 1: Run safe audit fix**
```bash
npm audit fix
```

**Step 2: If breaking changes needed, evaluate and update**
```bash
# Check what would change
npm audit fix --dry-run --force

# If react-router needs update:
npm install react-router@latest react-router-dom@latest

# If next.js needs update:
npm install next@latest
```

**Step 3: Verify application still works**
```bash
npm run build
npm run test:run
```

#### Files Modified
- `package.json`
- `package-lock.json`

#### Acceptance Criteria
- [ ] `npm audit` shows 0 high-severity vulnerabilities
- [ ] `npm run build` succeeds
- [ ] `npm run test:run` shows 128/128 passing
- [ ] Application starts without errors

#### Risk Assessment
- **Risk Level:** Low-Medium
- **Rollback:** Revert package.json and package-lock.json from git

---

### Task A2: Commit Pending Security Changes

**Agent:** Coder Agent  
**Effort:** 15-30 minutes  
**Priority:** 🔴 Critical  
**Dependencies:** A1 (include audit fix in same commit)  
**Parallelizable:** No

#### Current State
```
28 modified files (including security fixes)
13 untracked files (documentation, middleware)
```

#### Files to Stage (Modified)
```
app/api/ai/*.ts (6 files) - Rate limiting
app/api/auth/[...all]/route.ts - Auth improvements
app/api/oauth/*.ts (8 files) - OAuth security
app/api/posts/*.ts (3 files) - Posting security
lib/ai/gemini-service.ts - AI service updates
lib/oauth/token-refresh-service.ts - Token refresh
vercel.json - Cron configuration
app/login/page.tsx - Login improvements
```

#### Files to Stage (Untracked - Add)
```
middleware.ts - Global route protection ✅ CRITICAL
SECURITY_AUDIT_REPORT.md
SECURITY_FIXES_PART1_COMPLETE.md
SECURITY_FIXES_PART2_COMPLETE.md
PRODUCTION_DEPLOYMENT_CHECKLIST.md
PROJECT_COMPLETION_ANALYSIS.md
BROWSER_TEST_REPORT.md
LINKEDIN_TOKEN_REFRESH_IMPLEMENTATION_COMPLETE.md
MIDDLEWARE_IMPLEMENTATION_COMPLETE.md
MIDDLEWARE_TESTING_GUIDE.md
specs/architecture-analysis/
specs/production-fixes/
```

#### Files to Remove from Tracking
```
{801A8845-6988-412C-9840-92DAF338F057}.png - Screenshot (add to .gitignore)
{A0DA80E4-F011-45B8-890C-76ED733D2EBD}.png - Screenshot (add to .gitignore)
```

#### Actions Required

**Step 1: Update .gitignore**
```bash
# Add to .gitignore
*.png
!public/*.png
!docs/*.png
```

**Step 2: Stage and commit**
```bash
git add -A
git status  # Verify changes
git commit -m "feat: Phase 11 security hardening and production readiness

- Add global middleware for route protection
- Implement rate limiting on AI endpoints
- Add token refresh service for OAuth
- Update authentication flow
- Add security audit documentation
- Fix npm vulnerabilities
- Add production deployment checklist

BREAKING CHANGE: None
Security: Addresses CVE issues in dependencies"
```

**Step 3: Push to remote**
```bash
git push origin main
```

#### Acceptance Criteria
- [ ] All 28 modified files committed
- [ ] All 13 untracked files committed (except screenshots)
- [ ] `git status` shows clean working directory
- [ ] Screenshots excluded via .gitignore
- [ ] Commit message follows conventional commits

---

### Task A3: Remove Empty Cron Directory

**Agent:** Coder Agent  
**Effort:** 5 minutes  
**Priority:** 🔴 Critical  
**Dependencies:** A2 (commit first to preserve history)  
**Parallelizable:** Yes (with A4, A5)

#### Current State
- Directory exists: `app/api/cron/process-scheduled-posts/`
- No files inside (route.ts was deleted)
- Documentation still references this endpoint
- Scheduled posts now handled by Inngest (`lib/inngest/functions/process-scheduled-post.ts`)

#### Actions Required

**Step 1: Remove empty directory**
```bash
Remove-Item -Recurse -Force "app/api/cron/process-scheduled-posts"
```

**Step 2: Verify removal**
```bash
Test-Path "app/api/cron/process-scheduled-posts"  # Should return False
```

**Step 3: Commit removal**
```bash
git add -A
git commit -m "chore: remove empty cron directory

The process-scheduled-posts endpoint was migrated to Inngest.
See lib/inngest/functions/process-scheduled-post.ts for implementation."
```

#### Files Modified
- `app/api/cron/process-scheduled-posts/` (deleted)

#### Acceptance Criteria
- [ ] Directory `app/api/cron/process-scheduled-posts/` no longer exists
- [ ] No 404 errors on startup
- [ ] Change committed to git

---

### Task A4: Create Legal Pages (Privacy Policy & Terms)

**Agent:** Coder Agent + Frontend Designer Agent (review)  
**Effort:** 2-3 hours  
**Priority:** 🔴 Critical (POPIA compliance)  
**Dependencies:** None  
**Parallelizable:** Yes (with A3, A5)

#### Current State
- Landing page claims "POPIA Compliant" (App.tsx:318, app/page.tsx:378)
- No `/legal/privacy` or `/legal/terms` pages exist
- No legal directory in `app/`

#### Files to Create

**1. `app/legal/layout.tsx`**
```typescript
// Legal pages layout with consistent styling
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}
```

**2. `app/legal/privacy/page.tsx`**
South African POPIA-compliant privacy policy including:
- Data controller identification (Purple Glow Social)
- Types of data collected (name, email, social media tokens)
- Purpose of data processing
- Legal basis for processing (consent, contract)
- Data retention periods
- Third-party sharing (Polar.sh payments, social platforms)
- User rights (access, rectification, deletion, portability)
- Cookie policy
- Contact information for data requests
- POPIA Information Officer details

**3. `app/legal/terms/page.tsx`**
Terms of Service including:
- Service description
- User obligations
- Acceptable use policy
- Credit system terms
- Payment terms (Polar.sh)
- Intellectual property
- Limitation of liability
- Termination
- Governing law (South African law)
- Dispute resolution

**4. Update navigation links**
- Add footer links to privacy and terms
- Update `App.tsx` and `app/page.tsx` footer sections

#### Acceptance Criteria
- [ ] `/legal/privacy` page accessible and renders correctly
- [ ] `/legal/terms` page accessible and renders correctly
- [ ] Both pages follow design system (Tailwind, color palette)
- [ ] Footer links navigate to legal pages
- [ ] Content includes POPIA-required disclosures
- [ ] Content includes contact information for data requests
- [ ] Mobile responsive

#### Legal Notice
⚠️ **Important:** These pages should be reviewed by legal counsel before production deployment. The implementation provides a template based on POPIA requirements but is not legal advice.

---

### Task A5: Create Cookie Consent Banner

**Agent:** Coder Agent + Frontend Designer Agent (review)  
**Effort:** 1-2 hours  
**Priority:** 🔴 Critical (POPIA compliance)  
**Dependencies:** A4 (link to privacy policy)  
**Parallelizable:** Partial (can start, needs A4 for privacy link)

#### Current State
- No cookie consent mechanism
- Application uses cookies for:
  - Session management (Better-auth)
  - OAuth state tokens
  - Preferences (language selection)

#### Files to Create

**1. `components/CookieConsent.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    // Note: Essential cookies still used for auth
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-pretoria-blue/95 backdrop-blur-sm border-t border-glass-border p-4 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          <p>
            We use cookies to enhance your experience. Essential cookies are required for authentication.
            By continuing, you agree to our{' '}
            <Link href="/legal/privacy" className="text-joburg-teal hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Decline Optional
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-neon-grape hover:bg-neon-grape/80 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
```

**2. Add to `app/layout.tsx`**
```typescript
import { CookieConsent } from '@/components/CookieConsent';

// In the layout return:
<body>
  {children}
  <CookieConsent />
</body>
```

#### Acceptance Criteria
- [ ] Cookie banner appears on first visit
- [ ] Banner does not appear after consent given
- [ ] "Accept All" saves consent and hides banner
- [ ] "Decline Optional" saves preference and hides banner
- [ ] Privacy policy link works
- [ ] Styling matches design system
- [ ] Banner is responsive (mobile-friendly)
- [ ] Consent stored with timestamp

---

## Phase B: Code Quality [DAYS 2-3]

**Priority:** 🟠 HIGH - Important for production monitoring  
**Total Estimated Time:** 6-8 hours  
**Blocking:** No - but recommended before production

---

### Task B1: Replace console.log with Structured Logger

**Agent:** Coder Agent  
**Effort:** 2-3 hours  
**Priority:** 🟠 High  
**Dependencies:** A2 (commit current changes first)  
**Parallelizable:** Yes (with B2, B3)

#### Current State
29 instances of `console.error` in API routes that should use the structured logger from `lib/logger.ts`.

#### Files to Modify (29 instances)

| File | Line | Current | Replace With |
|------|------|---------|--------------|
| `app/api/admin/errors/route.ts` | 116 | `console.error('Admin errors fetch error:', error)` | `logger.admin.exception(error, { action: 'fetch-errors' })` |
| `app/api/admin/users/route.ts` | 60 | `console.error('Admin users fetch error:', error)` | `logger.admin.exception(error, { action: 'fetch-users' })` |
| `app/api/admin/users/route.ts` | 129 | `console.error('Admin user update error:', error)` | `logger.admin.exception(error, { action: 'update-user' })` |
| `app/api/admin/analytics/route.ts` | 66 | `console.error('Admin analytics error:', error)` | `logger.admin.exception(error, { action: 'fetch-analytics' })` |
| `app/api/admin/transactions/route.ts` | 75 | `console.error('Admin transactions fetch error:', error)` | `logger.admin.exception(error, { action: 'fetch-transactions' })` |
| `app/api/admin/stats/route.ts` | 67 | `console.error('Admin stats fetch error:', error)` | `logger.admin.exception(error, { action: 'fetch-stats' })` |
| `app/api/admin/jobs/route.ts` | 62 | `console.error('Admin jobs fetch error:', error)` | `logger.admin.exception(error, { action: 'fetch-jobs' })` |
| `app/api/admin/jobs/retry/route.ts` | 101 | `console.error('Job retry error:', error)` | `logger.admin.exception(error, { action: 'retry-job' })` |
| `app/api/limits/check/route.ts` | 194 | `console.error('Limits check error:', error)` | `logger.api.exception(error, { action: 'check-limits' })` |
| `app/api/health/route.ts` | 22 | `console.error('Database health check failed:', error)` | `logger.db.exception(error, { action: 'health-check' })` |
| `app/api/health/route.ts` | 67 | `console.error('Health check error:', error)` | `logger.api.exception(error, { action: 'health-check' })` |
| `app/api/checkout/credits/route.ts` | 65 | `console.error('Error creating credit checkout:', error)` | `logger.polar.exception(error, { action: 'create-checkout' })` |
| `app/api/checkout/subscription/route.ts` | 80 | `console.error('Error creating subscription checkout:', error)` | `logger.polar.exception(error, { action: 'create-subscription' })` |
| `app/api/user/profile/route.ts` | 48 | `console.error('Profile fetch error:', error)` | `logger.api.exception(error, { action: 'fetch-profile' })` |
| `app/api/user/profile/route.ts` | 92 | `console.error('Profile update error:', error)` | `logger.api.exception(error, { action: 'update-profile' })` |
| `app/api/user/automation-rules/route.ts` | 58 | `console.error('Automation rules fetch error:', error)` | `logger.api.exception(error, { action: 'fetch-rules' })` |
| `app/api/user/automation-rules/route.ts` | 133 | `console.error('Automation rule create error:', error)` | `logger.api.exception(error, { action: 'create-rule' })` |
| `app/api/user/automation-rules/route.ts` | 180 | `console.error('Automation rule update error:', error)` | `logger.api.exception(error, { action: 'update-rule' })` |
| `app/api/user/automation-rules/route.ts` | 222 | `console.error('Automation rule delete error:', error)` | `logger.api.exception(error, { action: 'delete-rule' })` |
| `app/api/user/posts/route.ts` | 47 | `console.error('Posts fetch error:', error)` | `logger.api.exception(error, { action: 'fetch-posts' })` |
| `app/api/user/billing-history/route.ts` | 31 | `console.error('Billing history fetch error:', error)` | `logger.polar.exception(error, { action: 'fetch-billing' })` |
| `app/api/subscription/route.ts` | 50 | `console.error('Error fetching subscription:', error)` | `logger.polar.exception(error, { action: 'fetch-subscription' })` |
| `app/api/subscription/route.ts` | 98 | `console.error('Error canceling subscription:', error)` | `logger.polar.exception(error, { action: 'cancel-subscription' })` |
| `app/api/transactions/route.ts` | 45 | `console.error('Error fetching transactions:', error)` | `logger.polar.exception(error, { action: 'fetch-transactions' })` |
| `app/api/notifications/route.ts` | 50 | `console.error('[notifications] Error:', error)` | `logger.api.exception(error, { action: 'fetch-notifications' })` |
| `app/api/notifications/read/route.ts` | 60 | `console.error('[notifications/read] Error:', error)` | `logger.api.exception(error, { action: 'mark-read' })` |
| `app/api/notifications/read-all/route.ts` | 32 | `console.error('[notifications/read-all] Error:', error)` | `logger.api.exception(error, { action: 'mark-all-read' })` |
| `app/api/notifications/dismiss/route.ts` | 60 | `console.error('[notifications/dismiss] Error:', error)` | `logger.api.exception(error, { action: 'dismiss-notification' })` |
| `app/api/diagnostics/auth/route.ts` | 31 | `console.error("Diagnostic error:", error)` | `logger.auth.exception(error, { action: 'diagnostics' })` |

#### Pattern for Each File

**Add import at top:**
```typescript
import { logger } from '@/lib/logger';
```

**Replace console.error:**
```typescript
// Before
console.error('Admin users fetch error:', error);

// After
logger.admin.exception(error, { action: 'fetch-users' });
```

#### Acceptance Criteria
- [ ] All 29 `console.error` instances replaced with structured logger
- [ ] Each file has `import { logger } from '@/lib/logger'`
- [ ] Logger context matches file purpose (admin, api, polar, auth, db)
- [ ] Action metadata included for debugging
- [ ] No `console.log` or `console.error` in production API code
- [ ] `npm run build` succeeds
- [ ] Grep for `console.error` in `app/api/` returns 0 results

#### Verification Command
```bash
# Should return 0 results after completion
grep -r "console.error" app/api/ --include="*.ts" | wc -l
```

---

### Task B2: Create GDPR/POPIA Data Export Endpoint

**Agent:** Coder Agent  
**Effort:** 2-3 hours  
**Priority:** 🟠 High (POPIA requirement)  
**Dependencies:** None  
**Parallelizable:** Yes (with B1, B3)

#### Current State
- No endpoint for users to export their data
- POPIA requires right to data portability
- User data spans multiple tables

#### Files to Create

**`app/api/user/export/route.ts`**

```typescript
/**
 * POPIA/GDPR Data Export Endpoint
 * 
 * Allows users to download all their personal data in JSON format.
 * Required for POPIA compliance (Right to Data Portability).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/drizzle/db';
import { 
  user, 
  posts, 
  automationRules, 
  connectedAccounts,
  transactions,
  subscriptions,
  notifications,
  generationLogs,
  dailyUsage,
  contentFeedback,
  userLearningProfiles
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 1 export per hour
    const rateLimitResult = await rateLimit(request, 'data-export', 1, 3600);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Data export allowed once per hour.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.api.info('Data export requested', { userId });

    // Fetch all user data (parallel queries)
    const [
      userData,
      userPosts,
      userRules,
      userConnections,
      userTransactions,
      userSubscriptions,
      userNotifications,
      userGenerations,
      userUsage,
      userFeedback,
      userProfile
    ] = await Promise.all([
      db.query.user.findFirst({ where: eq(user.id, userId) }),
      db.select().from(posts).where(eq(posts.userId, userId)),
      db.select().from(automationRules).where(eq(automationRules.userId, userId)),
      db.select({
        id: connectedAccounts.id,
        platform: connectedAccounts.platform,
        platformUserId: connectedAccounts.platformUserId,
        platformUsername: connectedAccounts.platformUsername,
        connectedAt: connectedAccounts.connectedAt,
        // Exclude encrypted tokens
      }).from(connectedAccounts).where(eq(connectedAccounts.userId, userId)),
      db.select().from(transactions).where(eq(transactions.userId, userId)),
      db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
      db.select().from(notifications).where(eq(notifications.userId, userId)),
      db.select().from(generationLogs).where(eq(generationLogs.userId, userId)),
      db.select().from(dailyUsage).where(eq(dailyUsage.userId, userId)),
      db.select().from(contentFeedback).where(eq(contentFeedback.userId, userId)),
      db.query.userLearningProfiles?.findFirst({ where: eq(userLearningProfiles.userId, userId) })
    ]);

    // Sanitize user data (remove sensitive fields)
    const sanitizedUser = userData ? {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      tier: userData.tier,
      credits: userData.credits,
      videoCredits: userData.videoCredits,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    } : null;

    // Build export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      dataController: 'Purple Glow Social (Pty) Ltd',
      user: sanitizedUser,
      posts: userPosts,
      automationRules: userRules,
      connectedAccounts: userConnections,
      transactions: userTransactions,
      subscriptions: userSubscriptions,
      notifications: userNotifications,
      generationLogs: userGenerations,
      dailyUsage: userUsage,
      contentFeedback: userFeedback,
      learningProfile: userProfile,
    };

    logger.api.info('Data export completed', { userId, recordCount: {
      posts: userPosts.length,
      rules: userRules.length,
      transactions: userTransactions.length,
    }});

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="purple-glow-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    logger.api.exception(error, { action: 'data-export' });
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria
- [ ] `GET /api/user/export` returns user's complete data
- [ ] Sensitive data (tokens, passwords) excluded
- [ ] Response includes Content-Disposition header for download
- [ ] Rate limited to 1 request per hour
- [ ] Authentication required
- [ ] All user tables included in export
- [ ] Export includes metadata (timestamp, version, controller)

---

### Task B3: Create GDPR/POPIA Account Deletion Endpoint

**Agent:** Coder Agent  
**Effort:** 2-3 hours  
**Priority:** 🟠 High (POPIA requirement)  
**Dependencies:** None  
**Parallelizable:** Yes (with B1, B2)

#### Current State
- No endpoint for users to delete their account
- POPIA requires right to erasure
- Need to handle cascade deletes properly

#### Files to Create

**`app/api/user/delete/route.ts`**

```typescript
/**
 * POPIA/GDPR Account Deletion Endpoint
 * 
 * Allows users to permanently delete their account and all associated data.
 * Required for POPIA compliance (Right to Erasure).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/drizzle/db';
import { 
  user, 
  session,
  account,
  posts, 
  automationRules, 
  connectedAccounts,
  transactions,
  subscriptions,
  notifications,
  generationLogs,
  dailyUsage,
  creditReservations,
  jobLogs,
  contentFeedback,
  userLearningProfiles,
  postAnalytics
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';

export async function DELETE(request: NextRequest) {
  try {
    // Rate limit: 1 deletion attempt per day
    const rateLimitResult = await rateLimit(request, 'account-delete', 1, 86400);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Account deletion allowed once per day.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Require confirmation in request body
    const body = await request.json().catch(() => ({}));
    if (body.confirm !== 'DELETE_MY_ACCOUNT' || body.email !== userEmail) {
      return NextResponse.json(
        { 
          error: 'Confirmation required',
          message: 'Send { "confirm": "DELETE_MY_ACCOUNT", "email": "your@email.com" } to confirm deletion'
        },
        { status: 400 }
      );
    }

    logger.security.warn('Account deletion initiated', { userId, email: userEmail });

    // Delete all user data (order matters for foreign keys)
    // Many tables have CASCADE DELETE, but we'll be explicit
    await db.transaction(async (tx) => {
      // Delete dependent records first
      await tx.delete(jobLogs).where(eq(jobLogs.userId, userId));
      await tx.delete(creditReservations).where(eq(creditReservations.userId, userId));
      await tx.delete(dailyUsage).where(eq(dailyUsage.userId, userId));
      await tx.delete(generationLogs).where(eq(generationLogs.userId, userId));
      await tx.delete(notifications).where(eq(notifications.userId, userId));
      await tx.delete(contentFeedback).where(eq(contentFeedback.userId, userId));
      
      // Delete posts and related analytics
      const userPosts = await tx.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId));
      for (const post of userPosts) {
        await tx.delete(postAnalytics).where(eq(postAnalytics.postId, post.id));
      }
      await tx.delete(posts).where(eq(posts.userId, userId));
      
      // Delete automation rules
      await tx.delete(automationRules).where(eq(automationRules.userId, userId));
      
      // Delete connected accounts (OAuth tokens)
      await tx.delete(connectedAccounts).where(eq(connectedAccounts.userId, userId));
      
      // Delete payment records (keep for legal/tax purposes? - configurable)
      // For full POPIA compliance, delete. For tax records, anonymize.
      await tx.delete(transactions).where(eq(transactions.userId, userId));
      await tx.delete(subscriptions).where(eq(subscriptions.userId, userId));
      
      // Delete learning profile
      await tx.delete(userLearningProfiles).where(eq(userLearningProfiles.userId, userId));
      
      // Delete auth records
      await tx.delete(session).where(eq(session.userId, userId));
      await tx.delete(account).where(eq(account.userId, userId));
      
      // Finally, delete user record
      await tx.delete(user).where(eq(user.id, userId));
    });

    logger.security.info('Account deleted successfully', { userId, email: userEmail });

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.security.exception(error, { action: 'account-delete' });
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria
- [ ] `DELETE /api/user/delete` permanently removes user account
- [ ] Requires confirmation body with "DELETE_MY_ACCOUNT" and email
- [ ] All user data deleted from all tables
- [ ] Uses database transaction for atomicity
- [ ] Rate limited to 1 attempt per day
- [ ] Logged for security audit
- [ ] Returns success confirmation
- [ ] Sessions invalidated after deletion

---

### Task B4: Add Audit Logging for Data Access

**Agent:** Coder Agent  
**Effort:** 1-2 hours  
**Priority:** 🟡 Medium  
**Dependencies:** B1 (logger in place)  
**Parallelizable:** Yes

#### Current State
- Structured logger exists but audit logging for sensitive operations is inconsistent
- POPIA requires audit trail for personal data access

#### Actions Required

**1. Create audit logger helper in `lib/db/audit.ts`**
```typescript
import { logger } from '@/lib/logger';
import { db } from '@/drizzle/db';

export type AuditAction = 
  | 'data_export'
  | 'account_delete'
  | 'profile_view'
  | 'profile_update'
  | 'oauth_connect'
  | 'oauth_disconnect'
  | 'admin_user_view'
  | 'admin_user_update';

export async function auditLog(
  userId: string,
  action: AuditAction,
  details: Record<string, unknown>,
  performedBy?: string // For admin actions
) {
  const logEntry = {
    userId,
    action,
    performedBy: performedBy || userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown',
  };

  // Log to structured logger (goes to Sentry in production)
  logger.security.info(`Audit: ${action}`, logEntry);

  // Optionally: Store in database for compliance
  // await db.insert(auditLogs).values(logEntry);
}
```

**2. Add audit calls to sensitive endpoints:**
- `app/api/user/profile/route.ts` - Profile views/updates
- `app/api/user/export/route.ts` - Data exports
- `app/api/user/delete/route.ts` - Account deletion
- `app/api/admin/users/route.ts` - Admin user access
- `app/api/oauth/*/route.ts` - OAuth operations

#### Acceptance Criteria
- [ ] Audit helper created in `lib/db/audit.ts`
- [ ] Sensitive endpoints call audit logger
- [ ] Audit logs include user ID, action, timestamp, IP
- [ ] Admin actions include admin user ID
- [ ] Logs visible in Sentry/logging infrastructure

---

## Phase C: Documentation Updates [DAYS 3-4]

**Priority:** 🟡 MEDIUM - Required for maintainability  
**Total Estimated Time:** 3-4 hours  
**Blocking:** No

---

### Task C1: Update AGENTS.md - Remove Cron References

**Agent:** Architecture Agent  
**Effort:** 30-45 minutes  
**Priority:** 🟡 Medium  
**Dependencies:** A3 (directory removed)  
**Parallelizable:** Yes (with C2, C3)

#### Current State
AGENTS.md references `/api/cron/process-scheduled-posts` which was migrated to Inngest.

#### Files to Modify
- `AGENTS.md` (Line ~587)

#### Changes Required

**1. Update API Routes section (around line 587)**

Find:
```markdown
   - `/api/cron/process-scheduled-posts` - Cron job
```

Replace with:
```markdown
   - Scheduled post processing handled by Inngest (see `lib/inngest/functions/process-scheduled-post.ts`)
```

**2. Update Cron section to reflect actual architecture**

Add section explaining Inngest:
```markdown
### Background Jobs (Inngest)
The application uses Inngest for reliable background job processing:
- `process-scheduled-post` - Publishes scheduled posts with retry logic
- `execute-automation-rule` - Runs automation rules
- `check-credit-expiry` - Warns users about expiring credits
- `check-low-credits` - Notifies users of low credit balance
- `reset-monthly-credits` - Resets monthly credit allocations

### Cron Jobs (Vercel)
Two cron jobs run via Vercel:
- `/api/cron/learn-patterns` - Daily AI learning (1am UTC)
- `/api/cron/refresh-tokens` - OAuth token refresh (every 6 hours)
```

#### Acceptance Criteria
- [ ] No references to `/api/cron/process-scheduled-posts`
- [ ] Inngest architecture documented
- [ ] Actual cron jobs documented correctly
- [ ] Documentation matches `vercel.json`

---

### Task C2: Update API Documentation

**Agent:** Architecture Agent  
**Effort:** 1-2 hours  
**Priority:** 🟡 Medium  
**Dependencies:** B2, B3 (new endpoints)  
**Parallelizable:** Yes (with C1, C3)

#### Files to Modify
- `docs/API_DOCUMENTATION.md`

#### Changes Required

**1. Remove outdated cron endpoint (lines 267-276)**

Remove:
```markdown
### Cron Endpoints

#### POST /api/cron/process-scheduled-posts
Process and publish scheduled posts. Requires CRON_SECRET header.

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```
```

Replace with:
```markdown
### Background Jobs

Scheduled post processing is handled by Inngest event-driven functions.
See `lib/inngest/functions/` for implementation.

### Cron Endpoints (Vercel)

#### GET /api/cron/learn-patterns
Triggered daily at 1am UTC. Analyzes content patterns for AI learning.

#### GET /api/cron/refresh-tokens
Triggered every 6 hours. Refreshes expiring OAuth tokens.

Both endpoints require `CRON_SECRET` header for authentication.
```

**2. Add new POPIA endpoints**

Add after User Endpoints section:
```markdown
### Data Privacy Endpoints (POPIA/GDPR)

#### GET /api/user/export
Export all user data as downloadable JSON file.

**Authentication:** Required  
**Rate Limit:** 1 request per hour

**Response:**
- Downloads JSON file with all user data
- Excludes sensitive data (tokens, passwords)

#### DELETE /api/user/delete
Permanently delete user account and all associated data.

**Authentication:** Required  
**Rate Limit:** 1 request per day

**Request Body:**
```json
{
  "confirm": "DELETE_MY_ACCOUNT",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your account and all associated data have been permanently deleted.",
  "deletedAt": "2026-01-19T12:00:00.000Z"
}
```
```

#### Acceptance Criteria
- [ ] Cron endpoint documentation updated
- [ ] Inngest architecture explained
- [ ] New POPIA endpoints documented
- [ ] All documented endpoints exist
- [ ] Rate limits documented

---

### Task C3: Update Production Deployment Checklist

**Agent:** Architecture Agent  
**Effort:** 30-45 minutes  
**Priority:** 🟡 Medium  
**Dependencies:** None  
**Parallelizable:** Yes (with C1, C2)

#### Files to Modify
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

#### Changes Required

**1. Update Code Quality section (line 16)**

Change:
```markdown
- [x] No console.log in production code (using structured logger)
```

To (after B1 completion):
```markdown
- [x] No console.log in production code (using structured logger) ✅ Verified
```

**2. Add Legal Compliance section**

Add after Security Checklist:
```markdown
### 📜 Legal Compliance

- [ ] Privacy Policy page created (`/legal/privacy`)
- [ ] Terms of Service page created (`/legal/terms`)
- [ ] Cookie consent banner implemented
- [ ] Data export endpoint available (`/api/user/export`)
- [ ] Account deletion endpoint available (`/api/user/delete`)
- [ ] POPIA Information Officer details documented
- [ ] Legal pages reviewed by counsel
```

**3. Update Cron Jobs section (line 188)**

Change:
```markdown
- [ ] Test cron execution: `/api/cron/learn-patterns` (runs daily at 1am)
```

To:
```markdown
- [ ] Test cron execution: `/api/cron/learn-patterns` (runs daily at 1am UTC)
- [ ] Test cron execution: `/api/cron/refresh-tokens` (runs every 6 hours)
- [ ] Verify Inngest is connected and receiving events
- [ ] Test scheduled post processing via Inngest dashboard
```

#### Acceptance Criteria
- [ ] Legal compliance section added
- [ ] Cron jobs section accurate
- [ ] Inngest verification added
- [ ] All checklist items actionable

---

### Task C4: Clean Up Outdated Documentation Files

**Agent:** Architecture Agent  
**Effort:** 30-45 minutes  
**Priority:** 🟡 Low  
**Dependencies:** None  
**Parallelizable:** Yes

#### Files to Update

**1. `PHASE_9_AUTO_POSTING_COMPLETE.md`**
Add note at top:
```markdown
> **Note:** The `/api/cron/process-scheduled-posts` endpoint documented here has been migrated to Inngest.
> See `lib/inngest/functions/process-scheduled-post.ts` for current implementation.
```

**2. `.github/copilot-instructions.md` (if exists)**
Remove reference to `app/api/cron/process-scheduled-posts/route.ts`

**3. `docs/PRODUCTION_DEPLOYMENT.md`**
Update cron configuration to match actual `vercel.json`

#### Acceptance Criteria
- [ ] Outdated docs have migration notes
- [ ] No broken file references
- [ ] Consistent information across docs

---

## Phase D: Testing & Quality Assurance [DAYS 4-5]

**Priority:** 🟡 MEDIUM - Recommended for confidence  
**Total Estimated Time:** 8-12 hours  
**Blocking:** No - but strongly recommended

---

### Task D1: Set Up Playwright E2E Testing

**Agent:** Coder Agent  
**Effort:** 2-3 hours  
**Priority:** 🟡 Medium  
**Dependencies:** None  
**Parallelizable:** No (foundational)

#### Current State
- 128 unit/integration tests passing
- No E2E tests
- Playwright not installed

#### Actions Required

**1. Install Playwright**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**2. Create `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**3. Add npm scripts to `package.json`**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

**4. Create test directory structure**
```
tests/
├── e2e/
│   ├── auth-flow.spec.ts
│   ├── content-generation.spec.ts
│   └── fixtures/
│       └── test-auth.ts
└── setup.ts (existing)
```

#### Acceptance Criteria
- [ ] Playwright installed and configured
- [ ] npm scripts added
- [ ] Directory structure created
- [ ] `npx playwright test --list` works
- [ ] CI configuration works with Playwright

---

### Task D2: Create Authentication E2E Tests

**Agent:** Coder Agent  
**Effort:** 2-3 hours  
**Priority:** 🟡 Medium  
**Dependencies:** D1  
**Parallelizable:** Yes (with D3 after D1)

#### Files to Create

**`tests/e2e/auth-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should login with test account', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('input[type="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('input[type="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/.*login|\/$/);
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
    
    // Login
    await page.fill('input[type="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('input[type="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    
    // Should go back to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

#### Acceptance Criteria
- [ ] Login flow tested
- [ ] Logout flow tested
- [ ] Invalid credentials handled
- [ ] Redirect after login works
- [ ] Tests use test accounts from seed
- [ ] All tests pass in CI

---

### Task D3: Create Content Generation E2E Tests

**Agent:** Coder Agent  
**Effort:** 2-3 hours  
**Priority:** 🟡 Medium  
**Dependencies:** D1, D2  
**Parallelizable:** Yes (with D4 after D1)

#### Files to Create

**`tests/e2e/content-generation.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Content Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Login with pro account that has credits
    await page.goto('/login');
    await page.fill('input[type="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('input[type="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display AI content studio', async ({ page }) => {
    // Navigate to content generation
    await page.click('text=Generate Content');
    await expect(page.getByText(/AI Content Studio/i)).toBeVisible();
  });

  test('should generate content for Twitter', async ({ page }) => {
    await page.click('text=Generate Content');
    
    // Fill generation form
    await page.fill('input[name="topic"]', 'South African small business tips');
    await page.selectOption('select[name="platform"]', 'twitter');
    await page.selectOption('select[name="tone"]', 'professional');
    
    // Generate
    await page.click('button:has-text("Generate")');
    
    // Wait for result (may take a few seconds)
    await expect(page.getByText(/Generated Content/i)).toBeVisible({ timeout: 30000 });
    
    // Verify content appears
    await expect(page.locator('.generated-content')).not.toBeEmpty();
  });

  test('should show credit usage', async ({ page }) => {
    // Check credits are displayed
    await expect(page.getByText(/credits/i)).toBeVisible();
  });

  test('should prevent generation without credits', async ({ page }) => {
    // This test would need a zero-credit account
    // Login with zero credit account
    await page.click('button:has-text("Logout")');
    await page.goto('/login');
    await page.fill('input[type="email"]', 'zerocredit@test.purpleglow.co.za');
    await page.fill('input[type="password"]', 'TestZero123!');
    await page.click('button[type="submit"]');
    
    await page.click('text=Generate Content');
    await page.fill('input[name="topic"]', 'Test topic');
    await page.click('button:has-text("Generate")');
    
    // Should show insufficient credits error
    await expect(page.getByText(/insufficient credits|no credits/i)).toBeVisible();
  });
});
```

#### Acceptance Criteria
- [ ] Content generation UI tested
- [ ] Generation with credits works
- [ ] Zero-credit blocking tested
- [ ] Platform selection works
- [ ] Tone selection works
- [ ] Credit display verified

---

### Task D4: Security Audit

**Agent:** Code Reviewer Agent  
**Effort:** 2-3 hours  
**Priority:** 🟠 High  
**Dependencies:** A1 (vulnerabilities fixed)  
**Parallelizable:** Yes

#### Audit Checklist

**1. Dependency Security**
- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All dependencies have recent updates
- [ ] No deprecated packages in use

**2. Authentication Security**
- [ ] Sessions expire correctly (7 days)
- [ ] Password requirements enforced
- [ ] OAuth state validated
- [ ] CSRF tokens used
- [ ] Rate limiting on login

**3. API Security**
- [ ] All protected routes require authentication
- [ ] Admin routes require admin role
- [ ] Rate limiting on all endpoints
- [ ] Input validation with Zod
- [ ] SQL injection protected (Drizzle ORM)

**4. Data Security**
- [ ] Tokens encrypted at rest (AES-256-GCM)
- [ ] Sensitive data not logged
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly configured

**5. Code Security**
- [ ] No hardcoded secrets
- [ ] Environment variables used correctly
- [ ] No sensitive data in client bundle
- [ ] Error messages don't leak info

#### Deliverable
Create `SECURITY_AUDIT_FINAL.md` with findings and sign-off.

#### Acceptance Criteria
- [ ] All checklist items verified
- [ ] No critical issues found
- [ ] Medium issues documented with remediation plan
- [ ] Audit report created

---

## Phase E: Final Polish [DAY 6]

**Priority:** 🟢 LOW - Nice to have  
**Total Estimated Time:** 2-3 hours  
**Blocking:** No

---

### Task E1: Clean Up Git Repository

**Agent:** Coder Agent  
**Effort:** 30 minutes  
**Priority:** 🟢 Low  
**Dependencies:** All Phase A-D tasks  
**Parallelizable:** No

#### Actions Required

**1. Ensure .gitignore is complete**
```
# Add if missing
*.png
!public/*.png
!docs/*.png
*.local
.env*.local
.vercel
coverage/
playwright-report/
test-results/
```

**2. Remove any temp files**
```bash
# Find and remove tmp_rovodev_ files
Get-ChildItem -Recurse -Filter "tmp_rovodev_*" | Remove-Item
```

**3. Final commit**
```bash
git add -A
git commit -m "chore: Final cleanup for production release

- Update documentation
- Add E2E tests
- Clean up temp files
- Update .gitignore"
```

#### Acceptance Criteria
- [ ] No temp files in repository
- [ ] .gitignore comprehensive
- [ ] All changes committed
- [ ] Clean `git status`

---

### Task E2: Create Deployment Runbook

**Agent:** Architecture Agent  
**Effort:** 1 hour  
**Priority:** 🟢 Low  
**Dependencies:** All other tasks  
**Parallelizable:** No

#### File to Create

**`docs/DEPLOYMENT_RUNBOOK.md`**

Include:
1. Pre-deployment checklist (reference PRODUCTION_DEPLOYMENT_CHECKLIST.md)
2. Step-by-step deployment process
3. Post-deployment verification steps
4. Rollback procedure
5. Monitoring setup
6. Common issues and solutions
7. Emergency contacts

#### Acceptance Criteria
- [ ] Runbook created
- [ ] All steps actionable
- [ ] Rollback procedure documented
- [ ] Monitoring steps included

---

### Task E3: Final Documentation Review

**Agent:** Architecture Agent + Code Reviewer Agent  
**Effort:** 1 hour  
**Priority:** 🟢 Low  
**Dependencies:** All C tasks  
**Parallelizable:** No

#### Review Checklist
- [ ] AGENTS.md accurate
- [ ] README.md up to date
- [ ] API_DOCUMENTATION.md complete
- [ ] All referenced files exist
- [ ] No broken links
- [ ] Version numbers correct
- [ ] Contact information accurate

#### Acceptance Criteria
- [ ] All documentation reviewed
- [ ] No broken references
- [ ] Information accurate

---

## Execution Order

### Sequential Dependencies
```
A1 (npm fix) → A2 (commit) → A3 (remove dir)
                           → C1, C2, C3, C4 (docs)

A4 (legal pages) → A5 (cookie banner)

D1 (Playwright setup) → D2 (auth tests) → D3 (content tests)

All A-D → E1, E2, E3
```

### Parallel Execution Map

| Day | Track 1 | Track 2 | Track 3 |
|-----|---------|---------|---------|
| 1 | A1 → A2 → A3 | A4 (legal pages) | A5 (cookie banner) |
| 2 | B1 (logger) | B2 (export endpoint) | B3 (delete endpoint) |
| 3 | B4 (audit logging) | C1, C2 (docs) | C3, C4 (docs) |
| 4 | D1 (Playwright) | D4 (security audit) | - |
| 5 | D2 (auth tests) | D3 (content tests) | - |
| 6 | E1 (cleanup) | E2 (runbook) | E3 (review) |

---

## Subagent Assignment Matrix

| Task | Primary Agent | Support Agent | Parallel? | Est. Hours |
|------|---------------|---------------|-----------|------------|
| A1 | Coder | - | No | 0.5-1 |
| A2 | Coder | - | No | 0.5 |
| A3 | Coder | - | Yes | 0.1 |
| A4 | Coder | Frontend Designer | Yes | 2-3 |
| A5 | Coder | Frontend Designer | Partial | 1-2 |
| B1 | Coder | - | Yes | 2-3 |
| B2 | Coder | - | Yes | 2-3 |
| B3 | Coder | - | Yes | 2-3 |
| B4 | Coder | - | Yes | 1-2 |
| C1 | Architecture | - | Yes | 0.5 |
| C2 | Architecture | - | Yes | 1-2 |
| C3 | Architecture | - | Yes | 0.5 |
| C4 | Architecture | - | Yes | 0.5 |
| D1 | Coder | - | No | 2-3 |
| D2 | Coder | - | Yes | 2-3 |
| D3 | Coder | - | Yes | 2-3 |
| D4 | Code Reviewer | - | Yes | 2-3 |
| E1 | Coder | - | No | 0.5 |
| E2 | Architecture | - | No | 1 |
| E3 | Architecture | Code Reviewer | No | 1 |

---

## Success Criteria

### Phase A Complete ✓
- [ ] `npm audit` shows 0 high-severity vulnerabilities
- [ ] All pending changes committed
- [ ] Empty cron directory removed
- [ ] Legal pages accessible at `/legal/privacy` and `/legal/terms`
- [ ] Cookie consent banner functional

### Phase B Complete ✓
- [ ] 0 `console.error` in API routes
- [ ] `/api/user/export` returns user data
- [ ] `/api/user/delete` removes account
- [ ] Audit logging in place

### Phase C Complete ✓
- [ ] AGENTS.md reflects Inngest architecture
- [ ] API documentation accurate
- [ ] No references to deleted endpoints
- [ ] Production checklist updated

### Phase D Complete ✓
- [ ] Playwright configured
- [ ] Auth E2E tests passing
- [ ] Content generation E2E tests passing
- [ ] Security audit completed

### Phase E Complete ✓
- [ ] Repository clean
- [ ] Deployment runbook created
- [ ] Final documentation review passed

### Overall Success ✓
- [ ] Production readiness score: 95+/100
- [ ] All 128+ tests passing
- [ ] No critical/high security issues
- [ ] Legal compliance requirements met
- [ ] Documentation accurate and complete

---

## Appendix: File Summary

### Files to Create
```
app/legal/layout.tsx
app/legal/privacy/page.tsx
app/legal/terms/page.tsx
app/api/user/export/route.ts
app/api/user/delete/route.ts
components/CookieConsent.tsx
lib/db/audit.ts
tests/e2e/auth-flow.spec.ts
tests/e2e/content-generation.spec.ts
playwright.config.ts
docs/DEPLOYMENT_RUNBOOK.md
SECURITY_AUDIT_FINAL.md
```

### Files to Modify
```
package.json (npm scripts, dependencies)
package-lock.json (audit fix)
.gitignore (add patterns)
app/layout.tsx (add CookieConsent)
AGENTS.md (update architecture)
docs/API_DOCUMENTATION.md (update endpoints)
PRODUCTION_DEPLOYMENT_CHECKLIST.md (add legal section)
PHASE_9_AUTO_POSTING_COMPLETE.md (add migration note)
+ 29 API route files (replace console.error)
```

### Files/Directories to Delete
```
app/api/cron/process-scheduled-posts/ (empty directory)
{801A8845-6988-412C-9840-92DAF338F057}.png (screenshot)
{A0DA80E4-F011-45B8-890C-76ED733D2EBD}.png (screenshot)
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-19  
**Author:** Architecture & Planning Agent  
**Status:** Ready for Execution


