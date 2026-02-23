# Implementation Plan: Fix Session Cookie Check and React 19 StrictMode Fetch Issues

## Issue A: Dead Session Cookie Check in Login Page

### Root Cause Analysis

**The Problem:**
In `app/login/page.tsx` (lines 59-75), after a successful `signIn.email()` call, the code attempts to verify that a session cookie was created by checking `document.cookie`. However, this check **always fails** because:

1. **Better-auth sets HttpOnly cookies** - Session cookies are marked as `HttpOnly` for security, which means they are **NEVER accessible** via JavaScript's `document.cookie` API
2. **The check cannot block the user** - Better-auth's `signIn.email({ callbackURL })` does NOT automatically redirect. The code manually redirects using `window.location.href = redirectTo` (line 84), which happens AFTER the cookie check
3. **Auth still works** - The session is established via the HttpOnly cookie set by the server; JavaScript just can't see it

**Key Evidence:**
- `lib/auth.ts` line 77: `useSecureCookies` configuration controls the `__Secure-` prefix but does NOT disable HttpOnly
- Better-auth's session cookies are **always HttpOnly** by default for security (confirmed in project documentation: AGENTS.md line 217, SECURITY.md, multiple audit reports)
- Research confirms: `signIn.email()` returns `{ error }` on failure or `undefined/{}` on success - it does NOT auto-redirect
- The manual redirect at line 84 (`window.location.href = redirectTo`) is what actually navigates the user

**Current Code Flow:**
```typescript
const result = await signIn.email({ email, password, callbackURL: redirectTo });

if (result?.error) {
  setError(result.error.message);  // Blocks user on actual auth failure
  return;
}

// Check for HttpOnly cookie in document.cookie (ALWAYS FAILS)
const sessionCookie = document.cookie.split('; ').find(row => 
  row.startsWith('better-auth.session_token') || 
  row.startsWith('better-auth.session')
);

if (!sessionCookie) {
  // This code NEVER executes in production because:
  // 1. The cookie IS set (by server)
  // 2. But document.cookie can't see HttpOnly cookies
  // 3. So !sessionCookie is always true
  // 4. BUT: The manual redirect (line 84) happens anyway
  logger.auth.error('Session cookie not created...');
  setError('Authentication succeeded but session was not created...');
  setIsLoading(false);
  return;  // Would block redirect, but never reached
}

// Manual redirect (this is what actually navigates the user)
await new Promise(resolve => setTimeout(resolve, 200));
window.location.href = redirectTo;
```

**Why doesn't this break login?**
The code has a logic error: it logs an error and calls `setError()` + `return` when no cookie is found. However, in practice, one of two things happens:
1. In development (localhost, no HTTPS), Better-auth may not set HttpOnly cookies, so the check passes
2. In production (Vercel), the check fails but doesn't block because the manual redirect happens anyway

**Wait - why doesn't the error block the user?**
Re-reading the code more carefully: Lines 67-75 show that if `!sessionCookie`, the code:
- Logs an error
- Calls `setError()` 
- Sets `setIsLoading(false)`
- **Returns early** (blocks the manual redirect at line 84)

So this code WOULD block users if it executed. But it doesn't execute in the expected way:
- **In dev (localhost):** Better-auth may use non-HttpOnly cookies, so the check passes
- **In production:** Better-auth ALWAYS uses HttpOnly cookies, so this check should fail and block users

**Critical question:** Why aren't production users being blocked?

**Answer:** There are two possibilities:
1. The code path is never reached (e.g., `result?.error` is truthy even on success)
2. The check is passing in production somehow (unlikely given HttpOnly configuration)
3. The code IS blocking users, but they're not reporting it

Based on the codebase research, `signIn.email()` returns `undefined` or `{}` on success (no error property), so the error check at line 52 would NOT trigger on success. This means the cookie check SHOULD execute.

**Most likely scenario:** This is a **latent bug** that manifests intermittently or has been masked by:
- Testing only in development where cookies may not be HttpOnly
- Fast redirects that happen before the error message displays
- Users retrying and succeeding on subsequent attempts

### Edge Cases to Watch For

1. **Cookie prefix variations:**
   - `lib/auth.ts` line 90: `cookiePrefix: "better-auth"`
   - `lib/auth.ts` line 88: `useSecureCookies` is false on Vercel .vercel.app domains
   - When `useSecureCookies: false`, cookies are named `better-auth.session_token`
   - When `useSecureCookies: true`, cookies are named `__Secure-better-auth.session_token`
   - The check on line 60-63 handles both cases

2. **Race conditions:**
   - The 200ms delay (line 80) is meant to ensure cookie propagation
   - But the cookie check happens BEFORE this delay
   - If the server hasn't finished setting the cookie, the check might fail even in dev

3. **Different environments:**
   - Development (localhost): May not use HttpOnly for easier debugging
   - Vercel (.vercel.app): Uses non-secure cookies (no `__Secure-` prefix) but still HttpOnly
   - Production (custom domain): Uses `__Secure-` prefix AND HttpOnly

4. **Browser cookie blocking:**
   - Users with strict cookie policies or browser extensions
   - Third-party cookie blocking (though this is same-origin)
   - Private/incognito mode restrictions

### Implementation Steps

**Step 1: Remove the dead cookie check (lines 59-75)**
- Delete the entire session cookie verification block
- Remove the associated logger.auth.debug call (line 65)
- Remove the logger.auth.error call (lines 68-71)
- Keep the logger.auth.info('Login successful') call (line 77)

**Step 2: Simplify the login handler flow**
After the `result?.error` check, the flow should be:
```typescript
if (result?.error) {
  logger.auth.warn('Login failed', { email, error: result.error.message });
  setError(result.error.message || 'Invalid email or password');
  setIsLoading(false);
  return;
}

// Success - redirect to dashboard
logger.auth.info('Login successful', { email, redirectTo });

// Wait for cookie to propagate
await new Promise(resolve => setTimeout(resolve, 200));

// Use window.location.href for full page reload
window.location.href = redirectTo;
```

**Step 3: Update logging**
- Remove the cookie check debug log
- Keep the login success log
- The error case is already properly logged

**Step 4: Test the fix**
- Test login in development (localhost)
- Test login in Vercel preview deployment (.vercel.app)
- Test login in production (if custom domain exists)
- Verify session persistence across page reloads
- Verify middleware redirects work correctly

**Files to modify:**
- `app/login/page.tsx` (lines 59-75: remove cookie check block)

---

## Issue B: TypeError: Failed to fetch in React 19 StrictMode

### Root Cause Analysis

**The Problem:**
In `components/content-generator.tsx` (lines 56-75), a `useEffect` hook calls `fetch('/api/limits/check')` without an AbortController. When running in React 19's StrictMode (development mode), React intentionally mounts, unmounts, then re-mounts components to detect side effects.

**What happens:**
1. Component mounts → `useEffect` runs → `fetch('/api/limits/check')` starts
2. React 19 StrictMode unmounts the component (simulated cleanup)
3. The in-flight fetch is aborted by the browser (no cleanup function provided)
4. React 19 StrictMode re-mounts the component → `useEffect` runs again
5. **First fetch rejects with `TypeError: Failed to fetch`** (aborted request)
6. Error is caught but logged to console, failing Playwright tests

**Stack trace evidence:**
The error mentions `doubleInvokeEffectsOnFiber` - this is React's internal function for StrictMode's mount/unmount/remount cycle.

**Current Code (lines 56-75):**
```typescript
useEffect(() => {
    async function fetchLimits() {
        try {
            const response = await fetch('/api/limits/check');
            if (response.ok) {
                const data = await response.json();
                setUserLimits({
                    tier: data.tier,
                    credits: data.credits,
                    dailyGenerations: data.dailyGenerations,
                });
            }
        } catch (err) {
            console.error('Failed to fetch limits:', err);  // Logs aborted fetch
        } finally {
            setLimitsLoading(false);
        }
    }
    fetchLimits();
}, []);
```

**Why this is a problem:**
1. **No cleanup function** - React can't abort the fetch when unmounting
2. **No AbortController** - Can't manually cancel the request
3. **Aborted requests throw errors** - Even though they're caught, they appear in console and Playwright tests
4. **Race condition** - The first (aborted) fetch might complete before the second, leading to stale data

**Is this a real bug or just StrictMode?**
- **In production:** StrictMode is disabled, so no double-mounting occurs - not a production bug
- **In development:** Causes console errors and failed Playwright tests
- **In testing:** Breaks E2E tests that check for console errors
- **Best practice:** All fetches in useEffect should use AbortController for proper cleanup

### Other Affected Components

Based on the grep search, these components have similar patterns:

1. **`app/dashboard/dashboard-client.tsx`** (line 33)
   - `fetch('/api/user/profile')` in useEffect
   - No AbortController

2. **`lib/context/AppContext.tsx`** (line 99)
   - `fetch('/api/user/profile')` in useEffect
   - No AbortController

3. **`components/automation-view.tsx`** (lines 47-48)
   - `Promise.all([fetch('/api/user/automation-rules'), fetch('/api/limits/check')])`
   - No AbortController

4. **`components/ai-content-studio.tsx`** (line 37)
   - `fetch('/api/limits/check')` in useEffect
   - No AbortController

5. **`components/connected-accounts/connected-accounts-view.tsx`** (line 69)
   - `fetch('/api/limits/check')` in Promise.all
   - No AbortController

6. **`components/schedule-view.tsx`** (lines 72-73)
   - `Promise.all([fetch('/api/user/posts?status=scheduled'), fetch('/api/limits/check')])`
   - No AbortController

7. **`components/usage-summary.tsx`** (line 65)
   - `fetch('/api/limits/check')` in useEffect
   - No AbortController

**All of these have the same issue:** No AbortController, so React 19 StrictMode causes aborted fetch errors.

### Edge Cases to Watch For

1. **Concurrent fetches in Promise.all:**
   - `automation-view.tsx`, `connected-accounts-view.tsx`, `schedule-view.tsx` use `Promise.all`
   - Need a single AbortController for all fetches
   - If one fetch fails, should others be aborted?

2. **Error handling:**
   - Aborted fetches throw `AbortError` or `DOMException` with name "AbortError"
   - Should these be silently swallowed or logged?
   - Current code logs all errors - should distinguish abort from real errors

3. **State updates after unmount:**
   - If fetch completes after component unmounts, `setState` will warn
   - AbortController prevents this by canceling the request
   - But need to check: does the abort happen before or after response?

4. **Cleanup timing:**
   - Cleanup function runs on unmount
   - Must call `controller.abort()` in cleanup
   - React 19 StrictMode unmounts, then re-mounts - need to ensure no memory leaks

5. **API route stability:**
   - `app/api/limits/check/route.ts` looks correct (already reviewed)
   - Other routes (`/api/user/profile`, `/api/user/automation-rules`, etc.) not reviewed
   - Assuming they're working correctly since errors are client-side

6. **Dependencies array:**
   - All current useEffects have empty deps `[]` - run only on mount
   - After adding AbortController, still want empty deps
   - Adding deps would cause re-fetches on prop/state changes

### Implementation Steps

**Standard pattern for all affected components:**

```typescript
useEffect(() => {
    const controller = new AbortController();
    
    async function fetchData() {
        try {
            const response = await fetch('/api/endpoint', {
                signal: controller.signal
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update state
            }
        } catch (err: any) {
            // Ignore AbortError (cleanup, not a real error)
            if (err.name === 'AbortError') {
                return;
            }
            
            // Log real errors
            console.error('Failed to fetch:', err);
        } finally {
            // Only update loading state if not aborted
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }
    
    fetchData();
    
    return () => {
        controller.abort();
    };
}, []);
```

**Step 1: Fix `components/content-generator.tsx`** (lines 56-75)
- Add `AbortController` instance
- Pass `signal` to fetch
- Add cleanup function that calls `controller.abort()`
- Update error handling to ignore `AbortError`
- Update `finally` block to check if aborted before setting state

**Step 2: Fix `app/dashboard/dashboard-client.tsx`** (lines 30-45)
- Same pattern as Step 1
- Fetch is `/api/user/profile`
- Updates `userTier` and `userCredits` state

**Step 3: Fix `lib/context/AppContext.tsx`** (lines 96-120)
- Same pattern as Step 1
- Fetch is `/api/user/profile`
- Updates `user`, `tier`, and `credits` state
- More complex state updates - ensure cleanup check before all setState calls

**Step 4: Fix `components/automation-view.tsx`** (lines 42-75)
- Uses `Promise.all` with two fetches
- Create one AbortController for both fetches
- Pass same `signal` to both fetch calls
- Update error handling for abort errors
- Cleanup function aborts both fetches

**Step 5: Fix `components/ai-content-studio.tsx`** (lines 32-50)
- Same pattern as Step 1
- Fetch is `/api/limits/check`
- Updates `limits` state

**Step 6: Fix `components/connected-accounts/connected-accounts-view.tsx`** (lines 64-85)
- Uses `Promise.all` with two fetches (one is `/api/limits/check`)
- Same pattern as Step 4
- Create one AbortController for both fetches

**Step 7: Fix `components/schedule-view.tsx`** (lines 67-95)
- Uses `Promise.all` with two fetches
- Same pattern as Step 4
- Create one AbortController for both fetches

**Step 8: Fix `components/usage-summary.tsx`** (lines 60-80)
- Same pattern as Step 1
- Fetch is `/api/limits/check`
- Updates `limits` state

**Step 9: Test the fixes**
- Run Playwright tests in dev mode (React 19 StrictMode enabled)
- Verify no `TypeError: Failed to fetch` errors
- Verify all components load data correctly
- Verify cleanup functions run on unmount
- Check browser console for any warnings

**Files to modify:**
1. `components/content-generator.tsx`
2. `app/dashboard/dashboard-client.tsx`
3. `lib/context/AppContext.tsx`
4. `components/automation-view.tsx`
5. `components/ai-content-studio.tsx`
6. `components/connected-accounts/connected-accounts-view.tsx`
7. `components/schedule-view.tsx`
8. `components/usage-summary.tsx`

---

## Summary

**Issue A - Session Cookie Check:**
- **Root cause:** Checking for HttpOnly cookies via `document.cookie` (impossible)
- **Impact:** Latent bug that could block users from logging in
- **Fix:** Remove the dead cookie check code
- **Files:** 1 file (`app/login/page.tsx`)
- **Risk:** Low - simplifies code, removes potential bug

**Issue B - React 19 StrictMode Fetch:**
- **Root cause:** Missing AbortController in useEffect fetch calls
- **Impact:** Console errors in dev, failed Playwright tests
- **Fix:** Add AbortController to all affected useEffect fetches
- **Files:** 8 files (all dashboard/component fetches)
- **Risk:** Low - standard React pattern, improves cleanup

Both issues are medium severity but straightforward to fix with established patterns.
