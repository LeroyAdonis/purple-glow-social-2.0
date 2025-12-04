# Implementation Plan - Dashboard Navigation & Login Fix

## Phase 1: Investigation & Reproduction
### Dashboard Navigation
- [ ] Use `browser_subagent` to simulate a logged-in user on the landing page.
- [ ] Click the "Dashboard" button and observe behavior.
- [ ] Inspect the landing page code (`app/page.tsx` or similar) to identify the button's logic and `href`.

### Production Login
- [ ] Review `lib/auth.ts` and `lib/config/env-validation.ts` (already done, but double-check context).
- [ ] Verify if any client-side code relies on env vars that might be missing in production build.

## Phase 2: Implementation
### Dashboard Navigation
- [ ] Update the landing page component to correctly check auth state.
- [ ] Ensure the "Dashboard" button uses a Next.js `<Link>` or `router.push` to `/dashboard`.
- [ ] Handle any hydration mismatches if auth state is checked client-side.

### Production Login
- [ ] (Already addressed in previous task via `ci.yml` and Vercel advice, but will verify if code changes are needed).
- [ ] Ensure `NEXT_PUBLIC_BETTER_AUTH_URL` is used correctly in client-side auth calls.

## Phase 3: Verification
- [ ] Verify navigation works locally with browser test.
- [ ] Verify build passes.
