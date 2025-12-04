# Production Login Fix - Requirements

## Problem Statement
Login functionality is not working in production at `https://purple-glow-social-2-0.vercel.app`.

## Root Cause Analysis
1. **Missing Trusted Origin**: The production URL was not explicitly included in `trustedOrigins`
2. **Client-Side BaseURL**: The auth client fallback was hardcoded to `localhost:3000` instead of dynamically using the current origin
3. **Environment Variable Dependency**: System relied entirely on environment variables being correctly set

## Requirements

### R1: Trusted Origins Must Include Production URL
- The canonical production URL `https://purple-glow-social-2-0.vercel.app` must be in the `trustedOrigins` list
- Better-auth rejects authentication requests from origins not in this list

### R2: Auth Client Must Dynamically Resolve BaseURL
- In the browser, use `window.location.origin` as fallback
- This ensures auth requests go to the correct server regardless of deployment URL

### R3: Environment Variables (User Action Required)
The following environment variables must be set in Vercel dashboard:
- `BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app`
- `NEXT_PUBLIC_BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app`
- `NEXT_PUBLIC_BASE_URL=https://purple-glow-social-2-0.vercel.app` (optional but recommended)

## Acceptance Criteria
- [x] Production URL hardcoded in trusted origins
- [x] Auth client dynamically resolves baseURL in browser
- [x] Build succeeds without errors
- [ ] User can login with email/password in production
- [ ] User can login with Google OAuth in production
