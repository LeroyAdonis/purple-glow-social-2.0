# Production Login Fix - Requirements

## Problem Statement
Login functionality was not working in production at `https://purple-glow-social-2-0.vercel.app`.

## Root Cause Analysis
1. **`__Secure-` Cookie Prefix on Public Suffix List Domain**: The `.vercel.app` domain is on the Public Suffix List, causing browsers to silently reject cookies with `__Secure-` prefix
2. **Missing Trusted Origin**: The production URL was not explicitly included in `trustedOrigins`
3. **Client-Side BaseURL**: The auth client fallback was hardcoded to `localhost:3000`

## ⚠️ CRITICAL LEARNING: Vercel Cookie Configuration

**NEVER use `__Secure-` cookie prefix on `.vercel.app` domains!**

This is the **#1 cause** of silent authentication failures on Vercel. The symptoms are:
- Login form submits successfully (no errors)
- User is redirected to dashboard
- Dashboard immediately redirects back to login
- No errors in browser console
- Cookie shows `__Secure-better-auth.state` in network tab

The fix:
```typescript
const isVercelSharedDomain = process.env.VERCEL_URL?.includes('.vercel.app') || 
                              process.env.VERCEL === '1';

export const auth = betterAuth({
  advanced: {
    useSecureCookies: !isVercelSharedDomain && process.env.NODE_ENV === 'production',
  },
});
```

## Requirements

### R1: Disable Secure Cookie Prefix on Vercel
- Detect `.vercel.app` domain and disable `__Secure-` prefix
- This is REQUIRED for authentication to work on Vercel's shared domain

### R2: Trusted Origins Must Include Production URL
- The canonical production URL must be in the `trustedOrigins` list

### R3: Auth Client Must Use Same-Origin Requests
- Use empty string baseURL for same-origin API calls

## Acceptance Criteria
- [x] Secure cookie prefix disabled on Vercel
- [x] Production URL in trusted origins
- [x] Auth client uses same-origin requests
- [x] Build succeeds without errors
- [x] User can login with email/password in production
- [x] User can login with Google OAuth in production
