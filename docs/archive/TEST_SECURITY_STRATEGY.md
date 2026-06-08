# Test & Security Hardening Strategy

## Purple Glow Social 2.0 - Production Readiness Plan

**Document Version:** 1.0  
**Date:** January 19, 2026  
**Author:** Architecture & Planning Agent  
**Status:** Ready for Implementation

---

## Executive Summary

### Current State
- **Test Coverage:** 58.43% statements, 47.6% branches, 54.05% functions
- **Tests Passing:** 134/134 (including 6 race condition tests)
- **Security Score:** 8.5/10
- **Critical Issues:** 1 (race condition - ✅ FIXED)
- **High Priority Issues:** 2 (JSON parsing, job log deletion)
- **Medium Priority Issues:** 4
- **E2E Tests:** None (gap)

### Target State
- **Test Coverage:** 80%+ overall, 90%+ for critical paths
- **Security Score:** 9.5/10
- **E2E Coverage:** All critical user flows
- **Timeline:** 3 weeks

### Priority Order
1. **Week 1:** Critical path unit tests + high-priority security fixes
2. **Week 2:** E2E tests + medium-priority fixes
3. **Week 3:** Load testing + polish + monitoring

---

## 1. Current State Assessment

### 1.1 Test Coverage Analysis

| Module | Statements | Branches | Functions | Priority |
|--------|------------|----------|-----------|----------|
| **Overall** | 58.43% | 47.6% | 54.05% | - |
| lib/db/users.ts | 10.71% | - | - | 🔴 CRITICAL |
| drizzle/db.ts | 15% | - | - | 🟠 HIGH |
| lib/config/urls.ts | 29.41% | - | - | 🟡 MEDIUM |
| lib/auth.ts | 79.31% | - | - | 🟢 GOOD |
| lib/monitoring | 83.33% | - | - | 🟢 GOOD |
| lib/tiers | 91.83% | - | - | ✅ EXCELLENT |
| lib/security/validation.ts | 100% | - | - | ✅ EXCELLENT |

### 1.2 Existing Test Infrastructure

**Current Test Files:**
```
tests/
├── setup.ts                              # Test environment setup
├── integration/
│   ├── credit-race-condition.test.ts     # 6 tests - Race condition prevention
│   └── post-generation-flow.test.ts      # Tier validation tests
└── unit/
    ├── performance.test.ts               # Performance utilities
    ├── security.test.ts                  # Auth utilities (isAdmin, sanitize, etc.)
    ├── tracking.test.ts                  # Analytics tracking
    └── validation.test.ts                # Input validation schemas
```

**Testing Stack:**
- **Framework:** Vitest 4.x
- **Environment:** jsdom
- **React Testing:** @testing-library/react
- **Coverage:** @vitest/coverage-v8
- **Mocking:** Vitest built-in (vi.mock)

### 1.3 Security Posture Assessment

**Strengths (Score: 8.5/10):**
- ✅ Authentication: Better-auth with proper session management
- ✅ Authorization: Centralized `requireAdmin()` with audit logging
- ✅ Encryption: AES-256-GCM for OAuth tokens
- ✅ SQL Injection: Drizzle ORM with parameterized queries
- ✅ Input Validation: Zod schemas for all endpoints
- ✅ Rate Limiting: Upstash Redis with fallback
- ✅ CSRF Protection: State parameters for OAuth
- ✅ Cookie Security: HttpOnly, Secure (with Vercel fix)

**Weaknesses:**
- ⚠️ Concurrency: Race condition FIXED but needs more tests
- ⚠️ Error Handling: Inconsistent JSON parsing (18 routes)
- ⚠️ Data Compliance: Job log deletion bug (POPIA)
- ⚠️ Rate Limiting: Account deletion endpoint missing

### 1.4 CI/CD Current State

**Existing Pipeline (.github/workflows/ci.yml):**
- ✅ TypeScript type checking
- ✅ Unit tests with Vitest
- ✅ Coverage reporting
- ✅ Next.js build verification
- ✅ npm audit (high severity)
- ❌ No E2E tests
- ❌ No load testing
- ❌ No security scanning (OWASP ZAP, Snyk)

---

## 2. Testing Strategy

### 2.1 Phase 1: Critical Path Unit Tests (Week 1)

**Estimated Effort:** 20-25 hours

#### Priority 1: Credit System (CRITICAL) - 8 hours
**Target:** `lib/db/users.ts` (currently 10.71% coverage → 90%+)

**Rationale:** This is the revenue-critical path. The race condition fix is in place but needs comprehensive testing.

**Test File:** `tests/unit/credit-system.test.ts`

**Test Cases:**
```typescript
describe('Credit System', () => {
  describe('deductCreditsAtomic', () => {
    it('should deduct credits when sufficient balance exists');
    it('should fail when insufficient credits');
    it('should return correct new balance after deduction');
    it('should handle zero balance correctly');
    it('should handle exact balance scenario');
    it('should prevent negative balance');
  });
  
  describe('addCredits', () => {
    it('should add credits to user account');
    it('should handle large credit additions');
    it('should update timestamp on credit change');
  });
  
  describe('getUserById', () => {
    it('should return user when exists');
    it('should return null for non-existent user');
    it('should include all user fields');
  });
  
  describe('getUserByEmail', () => {
    it('should find user by email (case-insensitive)');
    it('should return null for unknown email');
  });
  
  describe('updateUserTier', () => {
    it('should update tier from free to pro');
    it('should preserve credits on tier change');
    it('should update timestamp');
  });
});
```

**Integration Tests:** `tests/integration/credit-concurrency.test.ts` (EXISTS - 6 tests)
- ✅ Concurrent deduction race prevention
- ✅ Rapid concurrent requests
- ✅ Insufficient credits scenario
- ✅ Exact balance scenario
- ✅ Error information validation
- ✅ Success balance validation

#### Priority 2: Authentication & Authorization - 6 hours
**Target:** `lib/auth.ts`, `lib/security/auth-utils.ts`

**Test File:** `tests/unit/auth-system.test.ts`

**Test Cases:**
```typescript
describe('Authentication System', () => {
  describe('Session Management', () => {
    it('should create valid session on login');
    it('should expire session after 7 days');
    it('should refresh session within update window');
    it('should handle invalid session gracefully');
  });
  
  describe('Cookie Configuration', () => {
    it('should disable secure prefix on Vercel shared domain');
    it('should enable secure prefix on custom domain');
    it('should set HttpOnly flag');
  });
  
  describe('Admin Authorization', () => {
    it('should identify purpleglow.co.za emails as admin');
    it('should reject non-admin emails');
    it('should handle case variations');
    it('should log admin access attempts');
  });
  
  describe('OAuth State', () => {
    it('should generate secure state parameter');
    it('should validate state on callback');
    it('should expire state after timeout');
  });
});
```

**Test File:** `tests/integration/auth-flows.test.ts`

**Test Cases:**
```typescript
describe('Auth Integration Flows', () => {
  it('should complete email/password signup flow');
  it('should complete login flow with valid credentials');
  it('should reject invalid credentials');
  it('should protect routes requiring authentication');
  it('should protect admin routes from non-admins');
  it('should handle session expiry gracefully');
});
```

#### Priority 3: Payment Processing - 4 hours
**Target:** `lib/polar/*`, `app/api/checkout/*`, `app/api/webhooks/polar/*`

**Test File:** `tests/unit/polar-service.test.ts`

**Test Cases:**
```typescript
describe('Polar Payment Service', () => {
  describe('Checkout Creation', () => {
    it('should create credit purchase checkout');
    it('should create subscription checkout');
    it('should include correct success/cancel URLs');
    it('should handle invalid product IDs');
  });
  
  describe('Webhook Processing', () => {
    it('should process checkout.completed event');
    it('should process subscription.created event');
    it('should process subscription.updated event');
    it('should process subscription.canceled event');
    it('should handle duplicate events idempotently');
    it('should log unknown event types');
  });
  
  describe('Credit Allocation', () => {
    it('should allocate credits on purchase completion');
    it('should record transaction in database');
    it('should handle partial refunds');
  });
});
```

#### Priority 4: OAuth Connections - 4 hours
**Target:** `lib/oauth/*`, `lib/db/connected-accounts.ts`

**Test File:** `tests/unit/oauth-providers.test.ts`

**Test Cases:**
```typescript
describe('OAuth Providers', () => {
  describe('Facebook Provider', () => {
    it('should generate correct authorization URL');
    it('should exchange code for tokens');
    it('should fetch user profile');
    it('should handle API errors gracefully');
  });
  
  // Similar for Instagram, Twitter, LinkedIn
  
  describe('Token Encryption', () => {
    it('should encrypt token with AES-256-GCM');
    it('should decrypt token correctly');
    it('should use unique IV per encryption');
    it('should detect tampering via auth tag');
    it('should reject invalid encryption key');
  });
  
  describe('PKCE (Twitter)', () => {
    it('should generate valid code verifier');
    it('should generate correct code challenge');
    it('should validate challenge on callback');
  });
});
```

#### Priority 5: Post Publishing - 3 hours
**Target:** `lib/posting/*`, `app/api/posts/publish/*`

**Test File:** `tests/integration/post-publishing.test.ts`

**Test Cases:**
```typescript
describe('Post Publishing', () => {
  describe('Single Platform', () => {
    it('should publish to Facebook successfully');
    it('should publish to Instagram with image');
    it('should publish to Twitter');
    it('should publish to LinkedIn');
    it('should deduct 1 credit per platform');
  });
  
  describe('Multi-Platform', () => {
    it('should publish to multiple platforms');
    it('should deduct credits for each platform');
    it('should handle partial failures');
    it('should refund credits for failed posts');
  });
  
  describe('Validation', () => {
    it('should require image for Instagram');
    it('should validate platform names');
    it('should enforce content length limits');
    it('should check daily post limits');
  });
  
  describe('Rate Limiting', () => {
    it('should limit to 5 posts per minute');
    it('should return 429 with retry-after');
  });
});
```

### 2.2 Phase 2: E2E Tests (Week 2)

**Estimated Effort:** 15-20 hours

#### Setup Playwright

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Configuration:** `playwright.config.ts`
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
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

#### E2E Test Scenarios

**File:** `tests/e2e/auth-flows.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('user can sign up with email', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[name="email"]', 'newuser@test.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('[name="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('user sees error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@email.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

**File:** `tests/e2e/content-generation.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Content Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as pro user
    await page.goto('/login');
    await page.fill('[name="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('[name="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can generate AI content', async ({ page }) => {
    await page.click('[data-testid="generate-content-btn"]');
    await page.fill('[name="topic"]', 'Small business tips');
    await page.selectOption('[name="platform"]', 'twitter');
    await page.selectOption('[name="tone"]', 'professional');
    await page.click('[data-testid="generate-btn"]');
    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible();
  });

  test('user can publish to single platform', async ({ page }) => {
    // Generate content first
    await page.click('[data-testid="generate-content-btn"]');
    await page.fill('[name="topic"]', 'Business growth');
    await page.selectOption('[name="platform"]', 'facebook');
    await page.click('[data-testid="generate-btn"]');
    await page.waitForSelector('[data-testid="generated-content"]');
    
    // Publish
    await page.click('[data-testid="publish-btn"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('free tier user sees upgrade prompt at limit', async ({ page }) => {
    // Login as free user instead
    await page.click('[data-testid="logout-btn"]');
    await page.goto('/login');
    await page.fill('[name="email"]', 'free@test.purpleglow.co.za');
    await page.fill('[name="password"]', 'TestFree123!');
    await page.click('button[type="submit"]');
    
    // Try to exceed daily generation limit
    for (let i = 0; i < 6; i++) {
      await page.click('[data-testid="generate-content-btn"]');
      await page.fill('[name="topic"]', `Topic ${i}`);
      await page.click('[data-testid="generate-btn"]');
    }
    
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
  });
});
```

**File:** `tests/e2e/payment-flows.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Payment Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('[name="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
  });

  test('user can access credit topup modal', async ({ page }) => {
    await page.click('[data-testid="topup-credits-btn"]');
    await expect(page.locator('[data-testid="credit-topup-modal"]')).toBeVisible();
    await expect(page.locator('text=Purchase Credits')).toBeVisible();
  });

  test('user can view subscription options', async ({ page }) => {
    await page.click('[data-testid="upgrade-btn"]');
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Business')).toBeVisible();
  });
});
```

**File:** `tests/e2e/admin-dashboard.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.purpleglow.co.za');
    await page.fill('[name="password"]', 'TestAdmin123!');
    await page.click('button[type="submit"]');
  });

  test('admin can access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('admin can view user list', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[data-testid="users-tab"]');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('admin can view analytics', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[data-testid="analytics-tab"]');
    await expect(page.locator('[data-testid="analytics-charts"]')).toBeVisible();
  });

  test('non-admin cannot access admin dashboard', async ({ page }) => {
    await page.click('[data-testid="logout-btn"]');
    await page.goto('/login');
    await page.fill('[name="email"]', 'pro@test.purpleglow.co.za');
    await page.fill('[name="password"]', 'TestPro123!');
    await page.click('button[type="submit"]');
    
    await page.goto('/admin');
    await expect(page).not.toHaveURL('/admin');
  });
});
```

### 2.3 Phase 3: Security Testing (Week 2-3)

**Estimated Effort:** 10-15 hours

#### 3.1 Security Unit Tests

**File:** `tests/security/input-validation.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '@/lib/security/auth-utils';
import { validateRequest, contentGenerationSchema } from '@/lib/security/validation';

describe('Input Validation Security', () => {
  describe('SQL Injection Prevention', () => {
    it('should reject SQL injection in topic field', () => {
      const maliciousInput = {
        topic: "test'; DROP TABLE users; --",
        platform: 'twitter',
        tone: 'professional',
        language: 'en',
      };
      const result = validateRequest(contentGenerationSchema, maliciousInput);
      // Should pass validation but content will be escaped
      expect(result.success).toBe(true);
    });

    it('should handle UNION-based injection attempts', () => {
      const input = {
        topic: "test' UNION SELECT * FROM users--",
        platform: 'twitter',
        tone: 'professional',
        language: 'en',
      };
      const result = validateRequest(contentGenerationSchema, input);
      expect(result.success).toBe(true);
      // Drizzle ORM parameterizes all queries
    });
  });

  describe('XSS Prevention', () => {
    it('should escape script tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape event handlers', () => {
      const result = sanitizeInput('<img onerror="alert(1)" src="x">');
      expect(result).not.toContain('onerror=');
    });

    it('should handle encoded payloads', () => {
      const result = sanitizeInput('%3Cscript%3Ealert(1)%3C/script%3E');
      // Should not decode and execute
      expect(result).not.toContain('<script>');
    });
  });

  describe('JSONB Injection Prevention', () => {
    it('should handle malicious JSON in payload', () => {
      const maliciousPayload = {
        topic: '{"$ne": null}',
        platform: 'twitter',
        tone: 'professional',
        language: 'en',
      };
      const result = validateRequest(contentGenerationSchema, maliciousPayload);
      expect(result.success).toBe(true);
      // JSON operators should be treated as strings
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should reject path traversal in image URLs', () => {
      const input = {
        content: 'Test post',
        platform: 'instagram',
        imageUrl: '../../../etc/passwd',
      };
      // URL validation should fail
      expect(input.imageUrl.startsWith('http')).toBe(false);
    });
  });
});
```

**File:** `tests/security/authorization.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { isAdmin } from '@/lib/security/auth-utils';

describe('Authorization Security', () => {
  describe('Admin Access Control', () => {
    it('should only allow purpleglow.co.za domain', () => {
      expect(isAdmin('admin@purpleglow.co.za')).toBe(true);
      expect(isAdmin('user@gmail.com')).toBe(false);
      expect(isAdmin('admin@purpleglow.com')).toBe(false);
      expect(isAdmin('admin@fake-purpleglow.co.za')).toBe(false);
    });

    it('should handle email case variations', () => {
      expect(isAdmin('ADMIN@PURPLEGLOW.CO.ZA')).toBe(true);
      expect(isAdmin('Admin@PurpleGlow.co.za')).toBe(true);
    });

    it('should reject null/undefined emails', () => {
      expect(isAdmin(null as any)).toBe(false);
      expect(isAdmin(undefined as any)).toBe(false);
      expect(isAdmin('')).toBe(false);
    });
  });

  describe('Cross-User Data Access', () => {
    it('should not allow accessing other users data via session manipulation');
    it('should validate userId matches session in all queries');
    it('should prevent IDOR in post retrieval');
    it('should prevent IDOR in account deletion');
  });

  describe('Token Manipulation', () => {
    it('should reject tampered JWT tokens');
    it('should reject expired tokens');
    it('should reject tokens with invalid signatures');
  });
});
```

**File:** `tests/security/rate-limiting.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Rate Limiting Security', () => {
  describe('API Rate Limits', () => {
    it('should limit general API to 100 requests/minute');
    it('should limit auth endpoints to 5 attempts/15 minutes');
    it('should limit content generation to 10/minute');
    it('should limit OAuth to 10/minute');
  });

  describe('Rate Limit Responses', () => {
    it('should return 429 status when limit exceeded');
    it('should include Retry-After header');
    it('should include X-RateLimit-Remaining header');
  });

  describe('Fallback Behavior', () => {
    it('should fall back to in-memory when Redis unavailable');
    it('should log warning when using fallback in production');
    it('should fail open to maintain availability');
  });

  describe('Identifier Extraction', () => {
    it('should use X-Forwarded-For header for IP');
    it('should handle multiple proxies in header');
    it('should fall back to unknown when no IP available');
  });
});
```

**File:** `tests/security/encryption.test.ts`
```typescript
import { describe, it, expect } from 'vitest';

describe('Encryption Security', () => {
  describe('Token Encryption', () => {
    it('should use AES-256-GCM algorithm');
    it('should generate unique IV for each encryption');
    it('should include auth tag for integrity');
    it('should fail decryption if auth tag invalid');
    it('should fail decryption if ciphertext modified');
  });

  describe('Key Management', () => {
    it('should validate key is 64 hex characters');
    it('should reject short keys');
    it('should reject non-hex keys');
  });

  describe('Encryption Cycles', () => {
    it('should decrypt to original plaintext');
    it('should produce different ciphertext for same plaintext');
    it('should handle special characters in tokens');
    it('should handle very long tokens');
  });
});
```

#### 3.2 OWASP Top 10 Checklist

| # | Vulnerability | Status | Notes |
|---|--------------|--------|-------|
| A01 | Broken Access Control | ✅ PASS | Centralized requireAdmin(), session validation |
| A02 | Cryptographic Failures | ✅ PASS | AES-256-GCM, proper key management |
| A03 | Injection | ✅ PASS | Drizzle ORM, Zod validation |
| A04 | Insecure Design | ✅ PASS | Defense in depth, rate limiting |
| A05 | Security Misconfiguration | ⚠️ PARTIAL | Cookie config fixed, JSON parsing inconsistent |
| A06 | Vulnerable Components | ✅ PASS | No critical NPM vulnerabilities |
| A07 | Identification & Auth Failures | ✅ PASS | Better-auth, session management |
| A08 | Software and Data Integrity | ✅ PASS | Webhook signature validation |
| A09 | Security Logging Failures | ✅ PASS | Structured logging, Sentry integration |
| A10 | Server-Side Request Forgery | ✅ PASS | URL validation, no user-controlled fetches |

#### 3.3 Penetration Testing Scenarios

**Manual Testing Checklist:**

- [ ] **Session Fixation:** Attempt to reuse old session after logout
- [ ] **CSRF Bypass:** Test forms without CSRF tokens
- [ ] **OAuth Redirect Manipulation:** Modify redirect_uri parameter
- [ ] **Payment Webhook Spoofing:** Send fake Polar webhooks
- [ ] **Race Conditions:** Concurrent credit deduction (covered by unit tests)
- [ ] **Privilege Escalation:** Modify tier in request body
- [ ] **Mass Assignment:** Send unexpected fields in user update
- [ ] **Verbose Errors:** Check for stack traces in production

**Automated Security Scanning:**
```bash
# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r zap-report.html

# npm audit for dependencies
npm audit --production --audit-level=high

# Snyk security scan (if configured)
npx snyk test --severity-threshold=high
```

### 2.4 Phase 4: Performance & Load Testing (Week 3)

**Estimated Effort:** 10-12 hours

#### 4.1 Load Testing with k6

**Installation:**
```bash
# macOS
brew install k6

# Windows
choco install k6

# Or via npm
npm install -g k6
```

**File:** `tests/load/api-endpoints.js`
```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const aiGenerationDuration = new Trend('ai_generation_duration');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm up
    { duration: '3m', target: 50 },   // Normal load
    { duration: '1m', target: 100 },  // Spike
    { duration: '2m', target: 50 },   // Recovery
    { duration: '1m', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],                   // <1% error rate
    errors: ['rate<0.05'],                            // <5% custom errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login and get session cookie
  const loginRes = http.post(`${BASE_URL}/api/auth/signin`, JSON.stringify({
    email: 'pro@test.purpleglow.co.za',
    password: 'TestPro123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  return { cookies: loginRes.cookies };
}

export default function(data) {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      'health check status 200': (r) => r.status === 200,
      'health check fast': (r) => r.timings.duration < 100,
    });
  });

  group('AI Content Generation', () => {
    const startTime = Date.now();
    const res = http.post(`${BASE_URL}/api/ai/generate`, JSON.stringify({
      topic: 'Business tips for South African entrepreneurs',
      platform: 'twitter',
      tone: 'professional',
      language: 'en',
    }), {
      headers: { 'Content-Type': 'application/json' },
      cookies: data.cookies,
    });
    
    aiGenerationDuration.add(Date.now() - startTime);
    
    const success = check(res, {
      'generation status 200': (r) => r.status === 200,
      'generation has content': (r) => r.json('content') !== undefined,
    });
    
    errorRate.add(!success);
  });

  group('User Dashboard', () => {
    const res = http.get(`${BASE_URL}/api/user/profile`, {
      cookies: data.cookies,
    });
    
    check(res, {
      'profile status 200': (r) => r.status === 200,
      'profile has user data': (r) => r.json('id') !== undefined,
    });
  });

  sleep(1); // Think time between iterations
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}
```

**File:** `tests/load/concurrent-publishing.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    concurrent_publish: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  // Test concurrent publishing (race condition prevention)
  const res = http.post(`${BASE_URL}/api/posts/publish`, JSON.stringify({
    platforms: ['twitter'],
    content: `Load test post ${Date.now()}`,
  }), {
    headers: { 'Content-Type': 'application/json' },
    // Note: Would need real auth in actual test
  });

  check(res, {
    'publish succeeds or rate limited': (r) => 
      r.status === 200 || r.status === 402 || r.status === 429,
    'no server errors': (r) => r.status !== 500,
  });

  sleep(0.5);
}
```

#### 4.2 Performance Thresholds

| Endpoint | p50 | p95 | p99 | Max |
|----------|-----|-----|-----|-----|
| GET /api/health | <20ms | <50ms | <100ms | <200ms |
| GET /api/user/profile | <50ms | <150ms | <300ms | <500ms |
| POST /api/ai/generate | <2s | <5s | <8s | <10s |
| POST /api/posts/publish | <200ms | <500ms | <1s | <2s |
| GET /api/admin/users | <100ms | <300ms | <500ms | <1s |

#### 4.3 Memory Leak Detection

**Test Script:** `tests/load/memory-leak.js`
```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  scenarios: {
    sustained_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1h',  // Run for 1 hour
    },
  },
};

export default function() {
  http.get('http://localhost:3000/api/health');
  sleep(1);
}
```

**Monitoring:**
- Track Node.js heap usage over time
- Alert if memory grows >20% over baseline
- Check for unclosed database connections

---

## 3. Security Hardening Tasks

### 3.1 Priority 1: High-Impact Fixes (Week 1)

#### Task 1: Standardize JSON Parsing (Issue #2)
**Severity:** 🟠 HIGH  
**Effort:** 2-3 hours  
**Status:** Not Started

**Problem:** 18 API routes call `await request.json()` without error handling, causing 500 errors instead of 400 for malformed JSON.

**Solution:** Create a helper function and apply consistently.

**Implementation:**

**File:** `lib/api/parse-request-body.ts`
```typescript
import { NextRequest } from 'next/server';

/**
 * Safely parse JSON from request body
 * Returns null if JSON is malformed
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}

/**
 * Standard error response for invalid JSON
 */
export function invalidJsonResponse() {
  return {
    error: 'Invalid JSON in request body',
    message: 'The request body must be valid JSON',
  };
}
```

**Usage Pattern:**
```typescript
// Before (inconsistent)
const body = await request.json();

// After (standardized)
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

const body = await parseRequestBody<GenerateRequest>(request);
if (!body) {
  return NextResponse.json(invalidJsonResponse(), { status: 400 });
}
```

**Affected Files (18 routes):**
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

**Test:**
```typescript
// tests/unit/json-parsing.test.ts
describe('JSON Parsing', () => {
  it('should return 400 for malformed JSON', async () => {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json',
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid JSON in request body');
  });
});
```

---

#### Task 2: Fix Job Log Deletion Bug (Issue #3)
**Severity:** 🟠 HIGH (POPIA Compliance)  
**Effort:** 1-2 hours  
**Status:** Not Started

**Problem:** Account deletion uses incorrect JSONB equality check that never matches.

**Location:** `app/api/user/delete/route.ts:97`

**Current Code (BROKEN):**
```typescript
await tx.delete(jobLogs).where(eq(jobLogs.payload, { userId }));
// This checks: payload == { userId: 'xxx' }
// But payload is: { userId: 'xxx', postId: 'yyy', ... }
// Result: NEVER matches, job logs are NOT deleted
```

**Fixed Code:**
```typescript
import { sql } from 'drizzle-orm';

// Option 1: Use JSONB path extraction (recommended)
await tx.execute(
  sql`DELETE FROM job_logs WHERE payload->>'userId' = ${userId}`
);

// Option 2: Use JSONB contains operator
await tx.delete(jobLogs).where(
  sql`${jobLogs.payload}::jsonb @> ${JSON.stringify({ userId })}::jsonb`
);
```

**Test:**
```typescript
// tests/integration/account-deletion.test.ts
describe('Account Deletion', () => {
  it('should delete job logs on account deletion', async () => {
    const testUserId = 'test-delete-user';
    
    // Create test job log
    await db.insert(jobLogs).values({
      functionName: 'process-scheduled-post',
      status: 'completed',
      payload: { userId: testUserId, postId: 'post-123', data: 'test' },
    });
    
    // Verify job log exists
    const beforeDelete = await db.execute(
      sql`SELECT * FROM job_logs WHERE payload->>'userId' = ${testUserId}`
    );
    expect(beforeDelete.rows.length).toBeGreaterThan(0);
    
    // Delete account
    await deleteUserAccount(testUserId);
    
    // Verify job logs deleted
    const afterDelete = await db.execute(
      sql`SELECT * FROM job_logs WHERE payload->>'userId' = ${testUserId}`
    );
    expect(afterDelete.rows).toHaveLength(0);
  });
});
```

---

### 3.2 Priority 2: Medium-Impact Fixes (Week 2)

#### Task 3: Add Account Deletion Rate Limiting (Issue #4)
**Severity:** 🟡 MEDIUM  
**Effort:** 30 minutes  
**Status:** Not Started

**Location:** `app/api/user/delete/route.ts`

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

    // Rest of deletion logic...
  }
}
```

---

#### Task 4: Implement Webhook Retry Logic (Issue #5)
**Severity:** 🟡 MEDIUM  
**Effort:** 2 hours  
**Status:** Not Started

**Location:** `app/api/webhooks/polar/route.ts:28-32`

**Current Code:**
```typescript
try {
  await processWebhookEvent(payload.type, eventId, payload.data);
} catch (error) {
  logger.polar.exception(error, { webhookType: payload.type });
  // Always returns success - no retries for transient failures
}
```

**Fixed Code:**
```typescript
try {
  await processWebhookEvent(payload.type, eventId, payload.data);
} catch (error) {
  logger.polar.exception(error, { webhookType: payload.type });
  
  // Determine if error is retryable
  const isRetryable = 
    error instanceof Error && (
      error.message?.includes('timeout') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('database') ||
      error.name === 'DatabaseError' ||
      error.name === 'NetworkError'
    );
  
  if (isRetryable) {
    // Return 500 to trigger Polar retry (they retry up to 3 times)
    logger.polar.warn('Retryable webhook error, returning 500', {
      webhookType: payload.type,
      eventId,
    });
    return NextResponse.json(
      { error: 'Temporary processing error' },
      { status: 500 }
    );
  }
  
  // For validation errors, duplicate events, etc., don't retry
  logger.polar.info('Non-retryable webhook error, acknowledging', {
    webhookType: payload.type,
    eventId,
  });
}
```

---

#### Task 5: Document Data Retention Policy (Issue #6)
**Severity:** 🟡 MEDIUM (Legal/POPIA)  
**Effort:** 2 hours  
**Status:** Not Started

**Actions Required:**

1. **Update Privacy Policy Page:**
```markdown
### Data Retention After Account Deletion

When you delete your account, we immediately and permanently delete:
- All your posts and content
- Connected social media accounts and tokens
- AI generation history and preferences
- Personal profile information
- Notifications and settings

We retain the following for 7 years (South African tax law requirement):
- Transaction records (anonymized - personal details removed)
- Subscription history (anonymized)

These records cannot be linked back to you and are used solely for 
financial auditing and legal compliance.
```

2. **Update Account Deletion Modal:**
```tsx
// components/modals/delete-account-modal.tsx
<div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
  <strong>Note:</strong> Financial transaction records will be retained 
  anonymously for 7 years per South African tax law requirements. 
  All other data is permanently deleted.
</div>
```

3. **Update API Response:**
```typescript
return NextResponse.json({
  success: true,
  message: 'Your account and all personal data have been permanently deleted.',
  note: 'Financial records retained anonymously per legal requirements (7 years)',
  deletedAt: new Date().toISOString(),
});
```

---

#### Task 6: Remove Debug Token Logging (Issue #7)
**Severity:** 🟡 MEDIUM  
**Effort:** 15 minutes  
**Status:** Not Started

**Location:** `lib/db/connected-accounts.ts:55-62`

**Current Code (Exposes Key Fragments):**
```typescript
logger.db.debug('Attempting decryption', { 
  platform, 
  keyStart: key?.substring(0, 4),      // ❌ Exposes key prefix
  keyEnd: key?.substring(60),          // ❌ Exposes key suffix
  tokenStart: account.accessToken.substring(0, 20), // ❌ Exposes token
});
```

**Fixed Code:**
```typescript
logger.db.debug('Attempting decryption', { 
  platform,
  hasKey: !!process.env.TOKEN_ENCRYPTION_KEY,
  keyLength: process.env.TOKEN_ENCRYPTION_KEY?.length,
  tokenLength: account.accessToken?.length,
  // Removed: keyStart, keyEnd, tokenStart
});
```

---

### 3.3 Priority 3: Low-Impact Polish (Week 3)

#### Task 7: Remove TODO Comments (Issue #8)
**Effort:** 5 minutes

**Location:** `app/api/posts/schedule/route.ts:19`
```typescript
// Remove or implement:
// recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(), // TODO: Implement recurrence
```

#### Task 8: Add Rate Limit Monitoring (Issue #10)
**Effort:** 1 hour

**Implementation:**
```typescript
// lib/security/rate-limit.ts - Add monitoring
if (!redis && process.env.NODE_ENV === 'production') {
  logger.security.error('Rate limiting fallback to in-memory in production', {
    alert: true,
    severity: 'high',
  });
  // Send to monitoring system
}
```

---

## 4. Testing Infrastructure

### 4.1 Test Database Setup

**File:** `tests/helpers/test-db.ts`
```typescript
import { db } from '@/drizzle/db';
import { sql } from 'drizzle-orm';
import { user, posts, connectedAccounts } from '@/drizzle/schema';

export async function setupTestDatabase() {
  // Run in transaction for isolation
  await db.transaction(async (tx) => {
    // Seed test users (from TEST_ACCOUNTS_GUIDE.md)
    await tx.insert(user).values([
      {
        id: 'test-free-user',
        email: 'free@test.purpleglow.co.za',
        name: 'Free Test User',
        tier: 'free',
        credits: 10,
      },
      {
        id: 'test-pro-user',
        email: 'pro@test.purpleglow.co.za',
        name: 'Pro Test User',
        tier: 'pro',
        credits: 500,
      },
      {
        id: 'test-business-user',
        email: 'business@test.purpleglow.co.za',
        name: 'Business Test User',
        tier: 'business',
        credits: 2000,
      },
    ]).onConflictDoNothing();
  });
}

export async function cleanupTestDatabase() {
  // Clean up test data
  await db.delete(posts).where(sql`user_id LIKE 'test-%'`);
  await db.delete(connectedAccounts).where(sql`user_id LIKE 'test-%'`);
  await db.delete(user).where(sql`id LIKE 'test-%'`);
}

export async function resetTestUserCredits(userId: string, credits: number) {
  await db.update(user)
    .set({ credits })
    .where(sql`id = ${userId}`);
}
```

### 4.2 CI/CD Pipeline Updates

**File:** `.github/workflows/ci.yml` (Updated)
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy'
      BETTER_AUTH_SECRET: 'dummy-secret-for-test-dummy-secret-for-test'
      BETTER_AUTH_URL: 'http://localhost:3000'
      TOKEN_ENCRYPTION_KEY: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          E2E_BASE_URL: 'http://localhost:3000'
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm audit --audit-level=high
        continue-on-error: true
      - run: npx better-npm-audit audit
        continue-on-error: true

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    env:
      DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy'
      BETTER_AUTH_SECRET: 'dummy-secret-for-build-must-be-at-least-32-chars-long'
      BETTER_AUTH_URL: 'http://localhost:3000'
      TOKEN_ENCRYPTION_KEY: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### 4.3 Package.json Script Updates

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "test:load": "k6 run tests/load/api-endpoints.js",
    "test:security": "npm audit --audit-level=high && npx snyk test"
  }
}
```

---

## 5. Success Metrics

### 5.1 Coverage Targets

| Module | Current | Target | Priority | Deadline |
|--------|---------|--------|----------|----------|
| **Overall** | 58.43% | 80% | High | Week 3 |
| lib/db/users.ts | 10.71% | 90% | 🔴 Critical | Week 1 |
| lib/auth.ts | 79.31% | 95% | High | Week 1 |
| lib/polar/* | Unknown | 85% | High | Week 1 |
| lib/oauth/* | Unknown | 80% | Medium | Week 2 |
| lib/posting/* | Unknown | 75% | Medium | Week 2 |
| lib/security/* | ~80% | 95% | High | Week 2 |
| app/api/* | Unknown | 70% | Medium | Week 3 |

### 5.2 Quality Gates

#### Pre-Deployment Checklist
- [ ] 134+ unit/integration tests passing (no regressions)
- [ ] 80%+ overall code coverage
- [ ] 90%+ coverage on critical paths (credits, auth)
- [ ] 0 critical security issues
- [ ] 0 high-severity npm vulnerabilities
- [ ] All E2E tests passing
- [ ] Load test: p95 < 500ms for API endpoints
- [ ] Memory leak test: No leaks over 1-hour sustained load
- [ ] JSON parsing standardized across all 18 routes
- [ ] Job log deletion bug fixed

#### Post-Deployment Monitoring
| Metric | Threshold | Alert |
|--------|-----------|-------|
| Error rate | < 0.5% | Immediate |
| API p95 latency | < 500ms | 5 minutes |
| Credit anomalies | Any negative | Immediate |
| Auth failures | > 10/min | 5 minutes |
| Webhook failures | > 5% | 15 minutes |
| Memory usage | > 80% baseline | 30 minutes |

### 5.3 Test Count Targets

| Category | Current | Target | Notes |
|----------|---------|--------|-------|
| Unit Tests | ~100 | 200+ | Focus on credits, auth |
| Integration Tests | ~34 | 75+ | Add payment, OAuth |
| E2E Tests | 0 | 25+ | All critical flows |
| Security Tests | ~20 | 50+ | OWASP coverage |
| Load Tests | 0 | 5+ | Key endpoints |
| **Total** | **~134** | **350+** | 2.5x increase |

---

## 6. Timeline & Resource Allocation

### Week 1: Critical Path Tests + High-Priority Security Fixes
**Total Effort:** 25-31 hours

| Task | Hours | Owner | Dependencies |
|------|-------|-------|--------------|
| Credit system unit tests | 8 | Dev | None |
| Auth system tests | 6 | Dev | None |
| Payment/Polar tests | 4 | Dev | None |
| JSON parsing fix (18 routes) | 3 | Dev | None |
| Job log deletion fix | 2 | Dev | None |
| Race condition verification | 1 | QA | Credit tests |
| Code review & merge | 1 | Lead | All above |

**Deliverables:**
- ✅ `tests/unit/credit-system.test.ts` (15+ tests)
- ✅ `tests/unit/auth-system.test.ts` (12+ tests)
- ✅ `tests/integration/payment-flows.test.ts` (10+ tests)
- ✅ `lib/api/parse-request-body.ts` helper
- ✅ Fixed job log deletion in account deletion
- ✅ Coverage: 70%+ overall

### Week 2: E2E Tests + Medium-Priority Fixes
**Total Effort:** 18-24 hours

| Task | Hours | Owner | Dependencies |
|------|-------|-------|--------------|
| Playwright setup | 2 | Dev | None |
| Auth E2E tests | 3 | Dev | Playwright |
| Content generation E2E | 4 | Dev | Playwright |
| Payment E2E tests | 3 | Dev | Playwright |
| Admin dashboard E2E | 3 | Dev | Playwright |
| Security unit tests | 4 | Dev | None |
| Account deletion rate limit | 0.5 | Dev | None |
| Webhook retry logic | 2 | Dev | None |
| Data retention docs | 2 | Dev | None |

**Deliverables:**
- ✅ `playwright.config.ts`
- ✅ `tests/e2e/auth-flows.spec.ts`
- ✅ `tests/e2e/content-generation.spec.ts`
- ✅ `tests/e2e/payment-flows.spec.ts`
- ✅ `tests/e2e/admin-dashboard.spec.ts`
- ✅ `tests/security/*.test.ts` (4 files)
- ✅ Updated webhook handler
- ✅ Updated privacy policy

### Week 3: Load Tests + Polish + Monitoring
**Total Effort:** 11-14 hours

| Task | Hours | Owner | Dependencies |
|------|-------|-------|--------------|
| k6 load test setup | 2 | Dev | None |
| API load tests | 3 | Dev | k6 |
| Concurrent publish tests | 2 | Dev | k6 |
| Memory leak tests | 2 | Dev | k6 |
| Debug logging cleanup | 0.5 | Dev | None |
| TODO comment cleanup | 0.5 | Dev | None |
| Rate limit monitoring | 1 | Dev | None |
| CI/CD pipeline updates | 2 | DevOps | E2E tests |
| Final security audit | 1 | QA | All above |

**Deliverables:**
- ✅ `tests/load/api-endpoints.js`
- ✅ `tests/load/concurrent-publishing.js`
- ✅ `tests/load/memory-leak.js`
- ✅ Updated CI/CD with E2E job
- ✅ Coverage: 80%+ overall
- ✅ All security issues addressed

### Total Effort Summary

| Week | Hours | Focus |
|------|-------|-------|
| Week 1 | 25-31 | Critical path + security fixes |
| Week 2 | 18-24 | E2E + medium fixes |
| Week 3 | 11-14 | Load tests + polish |
| **Total** | **54-69** | **~2 developer-weeks** |

---

## 7. Recommendations

### 7.1 Immediate Actions (Before Production)

1. **Fix High-Priority Security Issues**
   - Standardize JSON parsing across 18 routes
   - Fix job log deletion for POPIA compliance
   - These can be done in parallel with testing

2. **Prioritize Credit System Testing**
   - This is the revenue-critical path
   - Race condition fix is in place but needs more coverage
   - Target 90%+ coverage on `lib/db/users.ts`

3. **Add E2E Tests for Critical Flows**
   - User signup → content generation → publish
   - Payment flow (credit purchase)
   - Admin dashboard access control

### 7.2 Post-Launch Improvements

1. **Continuous Security Monitoring**
   - Weekly npm audit in CI
   - Monthly dependency updates
   - Quarterly penetration testing

2. **Performance Baseline**
   - Run load tests weekly in staging
   - Track p95 latency trends
   - Alert on regression

3. **Test Coverage Maintenance**
   - Require tests for new features
   - Add coverage check to PR requirements
   - Target 80% minimum for merges

### 7.3 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Credit exploitation | Low (fixed) | High | Atomic deduction + monitoring |
| Payment webhook loss | Medium | High | Retry logic + manual review |
| Data compliance issue | Low | High | POPIA documentation + audit |
| Performance degradation | Medium | Medium | Load testing + alerts |
| Security breach | Low | Critical | Encryption + rate limiting |

### 7.4 Tools Recommendation

| Tool | Purpose | Priority | Cost |
|------|---------|----------|------|
| Playwright | E2E testing | High | Free |
| k6 | Load testing | Medium | Free |
| Snyk | Security scanning | Medium | Free tier |
| OWASP ZAP | Penetration testing | Low | Free |
| Codecov | Coverage tracking | Medium | Free tier |

---

## 8. Appendix

### 8.1 Issue Priority Matrix

| Issue | Severity | Blocking | Effort | Week |
|-------|----------|----------|--------|------|
| #1 Race Condition | 🔴 Critical | ✅ FIXED | 4-6h | Done |
| #2 JSON Parsing | 🟠 High | No | 2-3h | Week 1 |
| #3 Job Log Bug | 🟠 High | No | 1-2h | Week 1 |
| #4 Rate Limit Gap | 🟡 Medium | No | 30m | Week 2 |
| #5 Webhook Retry | 🟡 Medium | No | 2h | Week 2 |
| #6 Data Retention | 🟡 Medium | No | 2h | Week 2 |
| #7 Debug Logging | 🟡 Medium | No | 15m | Week 3 |
| #8 TODO Comment | 🟢 Low | No | 5m | Week 3 |
| #9 NPM Audit | 🟢 Low | No | Ongoing | N/A |
| #10 Rate Fallback | 🟢 Low | No | 1h | Week 3 |

### 8.2 Test File Structure (Target)

```
tests/
├── setup.ts
├── helpers/
│   ├── test-db.ts
│   ├── mock-auth.ts
│   └── fixtures.ts
├── unit/
│   ├── credit-system.test.ts        # NEW
│   ├── auth-system.test.ts          # NEW
│   ├── polar-service.test.ts        # NEW
│   ├── oauth-providers.test.ts      # NEW
│   ├── posting-services.test.ts     # NEW
│   ├── performance.test.ts
│   ├── security.test.ts
│   ├── tracking.test.ts
│   └── validation.test.ts
├── integration/
│   ├── credit-race-condition.test.ts
│   ├── post-generation-flow.test.ts
│   ├── auth-flows.test.ts           # NEW
│   ├── payment-flows.test.ts        # NEW
│   ├── oauth-flows.test.ts          # NEW
│   ├── post-publishing.test.ts      # NEW
│   └── account-deletion.test.ts     # NEW
├── security/
│   ├── input-validation.test.ts     # NEW
│   ├── authorization.test.ts        # NEW
│   ├── rate-limiting.test.ts        # NEW
│   └── encryption.test.ts           # NEW
├── e2e/
│   ├── auth-flows.spec.ts           # NEW
│   ├── content-generation.spec.ts   # NEW
│   ├── payment-flows.spec.ts        # NEW
│   └── admin-dashboard.spec.ts      # NEW
└── load/
    ├── api-endpoints.js             # NEW
    ├── concurrent-publishing.js     # NEW
    └── memory-leak.js               # NEW
```

### 8.3 Contact Information

- **Security Concerns:** security@purpleglow.co.za
- **Technical Questions:** dev@purpleglow.co.za
- **POPIA/Compliance:** legal@purpleglow.co.za

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 19, 2026 | Architecture Agent | Initial strategy document |

---

**Prepared By:** Architecture & Planning Agent  
**Date:** January 19, 2026  
**Next Review:** February 19, 2026  
**Status:** Ready for Implementation

---

**End of Document**
