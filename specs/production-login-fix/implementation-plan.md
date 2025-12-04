# Production Login Fix - Implementation Plan

## ⚠️ CRITICAL: This fix is REQUIRED for Vercel deployments

The `.vercel.app` domain is on the **Public Suffix List**, causing browsers to silently reject cookies with `__Secure-` prefix. Without this fix, authentication will appear to work but sessions will never persist.

## Phase 1: Code Fix - Disable Secure Cookies on Vercel (ROOT CAUSE)
### Task: Disable __Secure- Cookie Prefix
- [x] Detect Vercel shared domain environment
- [x] Set `useSecureCookies: false` when on `.vercel.app`

**File Changed:** `lib/auth.ts`
```typescript
const isVercelSharedDomain = process.env.VERCEL_URL?.includes('.vercel.app') || 
                              process.env.VERCEL === '1';

export const auth = betterAuth({
  advanced: {
    useSecureCookies: !isVercelSharedDomain && process.env.NODE_ENV === 'production',
    cookiePrefix: "better-auth",
  },
});
```

## Phase 2: Code Fix - Trusted Origins
### Task: Add Production URL to Trusted Origins
- [x] Update `lib/config/urls.ts` to explicitly include `https://purple-glow-social-2-0.vercel.app`

## Phase 3: Code Fix - Auth Client BaseURL
### Task: Use Empty String for Same-Origin Requests
- [x] Update `lib/auth-client.ts` to use empty string as fallback

## Phase 4: Code Fix - Server-Side Auth BaseURL
### Task: Add Dynamic BaseURL Resolution for Server
- [x] Update `lib/auth.ts` to detect Vercel environment

## Phase 5: Code Fix - Better Error Handling in Login
### Task: Check Sign-In Result Before Redirect
- [x] Update `app/login/page.tsx` to check for errors

## Phase 6: Documentation
### Task: Document the Fix for Future Agents
- [x] Update `AGENTS.md` with cookie warning
- [x] Update `.github/copilot-instructions.md` with cookie warning
- [x] Add prominent comments in `lib/auth.ts`
- [x] Update specs with root cause documentation

## Summary of Changes
| File | Change |
|------|--------|
| `lib/auth.ts` | **ROOT FIX**: Disable `__Secure-` cookie prefix on Vercel |
| `lib/config/urls.ts` | Added production URL to trusted origins |
| `lib/auth-client.ts` | Use empty string for same-origin API calls |
| `app/login/page.tsx` | Better error handling |
| `AGENTS.md` | Added critical cookie warning |
| `.github/copilot-instructions.md` | Added critical cookie warning |
