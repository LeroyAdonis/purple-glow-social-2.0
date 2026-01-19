# Global Middleware Implementation Specification

**Priority:** MEDIUM  
**Estimated Effort:** 2-3 hours  
**Dependencies:** None  
**Owner:** Backend Developer  

---

## 1. Executive Summary

### Current State
Route protection is currently handled on a per-route basis using client-side session checks in `app/dashboard/client-page.tsx` and server-side checks in individual API routes using `requireAuth()` from `lib/security/auth-utils.ts`.

### Gap
- No centralized `middleware.ts` file at the project root
- Protected routes rely on individual implementation
- Inconsistent protection patterns across routes
- OAuth callback routes need special handling
- Admin routes lack centralized access control

### Impact if NOT Fixed
- Potential for unprotected routes to be accidentally added
- Increased code duplication for auth checks
- Harder to maintain consistent security policies
- Performance overhead from multiple session checks

### Solution
Create a Next.js 16 middleware file at the project root that:
1. Protects `/dashboard/*` and `/admin/*` routes
2. Allows public routes explicitly
3. Handles OAuth callbacks properly
4. Integrates with Better-auth session validation

---

## 2. Technical Requirements

### 2.1 Route Classification

| Route Pattern | Protection Level | Action |
|---------------|------------------|--------|
| `/` | Public | Allow |
| `/login` | Public | Allow, redirect if authenticated |
| `/signup` | Public | Allow, redirect if authenticated |
| `/api/auth/*` | Public | Allow (Better-auth handles) |
| `/api/webhooks/*` | Public | Allow (webhook validation handles) |
| `/api/health` | Public | Allow |
| `/api/cron/*` | Public | Allow (CRON_SECRET validation handles) |
| `/api/inngest` | Public | Allow (Inngest signing handles) |
| `/dashboard/*` | Protected | Require authentication |
| `/admin/*` | Protected + Admin | Require admin role |
| `/api/admin/*` | Protected + Admin | Require admin role |
| `/api/user/*` | Protected | Require authentication |
| `/api/posts/*` | Protected | Require authentication |
| `/api/ai/*` | Protected | Require authentication |
| `/api/oauth/*` | Mixed | Connect requires auth, callback is public |
| `/oauth/callback/*` | Public | Allow (OAuth flow) |

### 2.2 Acceptance Criteria
- [ ] Middleware executes on all matching routes
- [ ] Unauthenticated users redirected to `/login`
- [ ] Authenticated users on `/login` or `/signup` redirected to `/dashboard`
- [ ] Admin routes return 403 for non-admin users
- [ ] OAuth callbacks work without authentication
- [ ] API routes return JSON errors, not redirects
- [ ] Performance impact < 50ms per request
- [ ] No breaking changes to existing flows

---

## 3. Implementation Steps

### Step 1: Create Middleware File

**File to Create:** `middleware.ts` (at project root)

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Global Middleware for Purple Glow Social 2.0
 * 
 * Handles route protection, authentication redirects, and admin access control.
 * Uses Better-auth session cookies for authentication state.
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/oauth/callback/success',
  '/oauth/callback/error',
];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth',           // Better-auth handles its own auth
  '/api/webhooks',       // Webhooks have their own validation
  '/api/health',         // Health check
  '/api/cron',           // Cron jobs use CRON_SECRET
  '/api/inngest',        // Inngest has signing key validation
  '/api/debug',          // Debug endpoint (consider removing in production)
  '/api/diagnostics',    // Diagnostics
];

// Routes that require admin access
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
];

// Admin email domains and specific emails
const ADMIN_EMAIL_DOMAINS = ['purpleglow.co.za'];
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

/**
 * Check if a path matches any of the given prefixes
 */
function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Check if user email has admin access
 */
function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  
  // Check specific admin emails
  if (ADMIN_EMAILS.includes(email)) return true;
  
  // Check admin domains
  return ADMIN_EMAIL_DOMAINS.some(domain => email.endsWith(`@${domain}`));
}

/**
 * Get session from Better-auth cookies
 * Note: This is a lightweight check - full validation happens in API routes
 */
function getSessionFromCookies(request: NextRequest): {
  isAuthenticated: boolean;
  userEmail?: string;
} {
  // Better-auth stores session in cookies
  // Cookie name depends on configuration - check both patterns
  const sessionCookie = request.cookies.get('better-auth.session_token') ||
                        request.cookies.get('better-auth.session');
  
  if (!sessionCookie?.value) {
    return { isAuthenticated: false };
  }

  // For middleware, we just check if session cookie exists
  // Full validation happens in the actual route handlers
  // We can decode the JWT to get user info if needed
  try {
    // Session token is a JWT - decode payload (not verify, that's expensive)
    const parts = sessionCookie.value.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return {
        isAuthenticated: true,
        userEmail: payload.email,
      };
    }
  } catch {
    // If decoding fails, still consider authenticated if cookie exists
    // Let the actual route handler do full validation
  }

  return { isAuthenticated: true };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  const { isAuthenticated, userEmail } = getSessionFromCookies(request);
  const isApiRoute = pathname.startsWith('/api');

  // === PUBLIC ROUTES ===
  
  // Allow public pages
  if (matchesPrefix(pathname, PUBLIC_ROUTES)) {
    // Redirect authenticated users away from login/signup
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Allow public API routes
  if (isApiRoute && matchesPrefix(pathname, PUBLIC_API_ROUTES)) {
    return NextResponse.next();
  }

  // Special handling for OAuth connect/callback routes
  if (pathname.startsWith('/api/oauth/')) {
    // Callback routes are public (OAuth flow returning)
    if (pathname.includes('/callback')) {
      return NextResponse.next();
    }
    // Connect and disconnect routes require authentication
    // Let them through - they have their own auth checks
    // But we can add a quick check here for better UX
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to connect accounts' },
        { status: 401 }
      );
    }
  }

  // === PROTECTED ROUTES ===

  // Check authentication for protected routes
  if (!isAuthenticated) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      );
    }
    
    // Redirect to login for page routes
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // === ADMIN ROUTES ===
  
  if (matchesPrefix(pathname, ADMIN_ROUTES)) {
    if (!isAdminEmail(userEmail)) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        );
      }
      
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Step 2: Update Login Page for Redirect Support

**File:** `app/login/page.tsx`

**Action:** Handle redirect query parameter after successful login

The login page should check for a `redirect` query parameter and redirect there after successful authentication instead of always going to `/dashboard`.

**Add to login success handler:**
```typescript
// Get redirect URL from query params
const searchParams = useSearchParams();
const redirectTo = searchParams.get('redirect') || '/dashboard';

// After successful login:
router.push(redirectTo);
```

### Step 3: Verify Cookie Configuration

**File:** `lib/auth.ts`

**Verify:** Cookie names match what middleware expects

The middleware checks for:
- `better-auth.session_token`
- `better-auth.session`

Verify the Better-auth configuration uses these cookie names (it should by default with `cookiePrefix: "better-auth"`).

---

## 4. Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `middleware.ts` | CREATE | Main middleware file at project root |
| `app/login/page.tsx` | MODIFY | Add redirect parameter support |
| `lib/auth.ts` | VERIFY | Confirm cookie naming |

---

## 5. Testing Strategy

### 5.1 Manual Testing Checklist

**Public Routes:**
- [ ] `/` - Accessible without login
- [ ] `/login` - Accessible, redirects to dashboard if logged in
- [ ] `/signup` - Accessible, redirects to dashboard if logged in
- [ ] `/api/health` - Returns 200 without auth
- [ ] `/api/auth/session` - Works without middleware interference

**Protected Routes:**
- [ ] `/dashboard` - Redirects to login if not authenticated
- [ ] `/dashboard` - Accessible when authenticated
- [ ] `/api/user/profile` - Returns 401 if not authenticated
- [ ] `/api/user/profile` - Returns data when authenticated

**Admin Routes:**
- [ ] `/admin` - Redirects non-admin to dashboard
- [ ] `/admin` - Accessible for admin users
- [ ] `/api/admin/stats` - Returns 403 for non-admin
- [ ] `/api/admin/stats` - Returns data for admin

**OAuth Routes:**
- [ ] `/api/oauth/facebook/connect` - Requires auth
- [ ] `/api/oauth/facebook/callback` - Works without auth (OAuth flow)

**Edge Cases:**
- [ ] Deep linking with redirect: `/login?redirect=/dashboard/settings`
- [ ] Invalid session cookie - handled gracefully
- [ ] Missing cookies - redirects to login

### 5.2 Automated Tests

**File to Create:** `tests/unit/middleware.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Global Middleware', () => {
  function createRequest(path: string, cookies: Record<string, string> = {}) {
    const url = new URL(path, 'http://localhost:3000');
    const request = new NextRequest(url);
    
    Object.entries(cookies).forEach(([name, value]) => {
      request.cookies.set(name, value);
    });
    
    return request;
  }

  describe('Public Routes', () => {
    it('should allow access to home page', async () => {
      const request = createRequest('/');
      const response = await middleware(request);
      expect(response.status).not.toBe(401);
    });

    it('should allow access to login page', async () => {
      const request = createRequest('/login');
      const response = await middleware(request);
      expect(response.status).not.toBe(401);
    });

    it('should redirect authenticated users from login to dashboard', async () => {
      const request = createRequest('/login', {
        'better-auth.session_token': 'valid-session',
      });
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/dashboard');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      const request = createRequest('/dashboard');
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should include redirect parameter in login URL', async () => {
      const request = createRequest('/dashboard/settings');
      const response = await middleware(request);
      const location = response.headers.get('location');
      expect(location).toContain('redirect=%2Fdashboard%2Fsettings');
    });

    it('should return 401 for unauthenticated API requests', async () => {
      const request = createRequest('/api/user/profile');
      const response = await middleware(request);
      expect(response.status).toBe(401);
    });
  });

  describe('Admin Routes', () => {
    it('should return 403 for non-admin API access', async () => {
      const request = createRequest('/api/admin/stats', {
        'better-auth.session_token': 'non-admin-session',
      });
      const response = await middleware(request);
      expect(response.status).toBe(403);
    });
  });
});
```

---

## 6. Performance Considerations

### 6.1 Middleware Performance
- Middleware runs on the Edge Runtime (fast)
- Cookie parsing is synchronous and fast
- JWT decoding (not verification) is lightweight
- No database calls in middleware
- Full session validation deferred to route handlers

### 6.2 Expected Latency
- Middleware execution: < 5ms
- Total added latency: < 10ms per request

---

## 7. Security Considerations

### 7.1 Important Notes
1. **Middleware is NOT a security boundary** - It's a convenience layer
2. **Full authentication must still happen in route handlers**
3. **JWT decoding without verification** is intentional - verification is expensive
4. **Admin checks in middleware** are for UX, not security

### 7.2 Defense in Depth
- Middleware provides first-line redirect/rejection
- Route handlers perform full session validation via `requireAuth()`
- API routes use `requireAdmin()` for admin-only endpoints
- This layered approach prevents accidental access while maintaining security

---

## 8. Rollback Plan

If issues arise:

1. **Quick Disable:** Rename `middleware.ts` to `middleware.ts.disabled`
2. **Partial Disable:** Update `config.matcher` to empty array
3. **Route-specific:** Existing per-route auth checks remain functional

---

## 9. Success Criteria

- [ ] All existing functionality continues to work
- [ ] Protected routes properly redirect/reject unauthenticated users
- [ ] Admin routes properly restrict access
- [ ] OAuth flows work without interruption
- [ ] Performance impact is negligible (< 10ms)
- [ ] No increase in authentication errors in Sentry

---

*Specification created for Purple Glow Social 2.0*  
*Ready for implementation by Coder Agent*
