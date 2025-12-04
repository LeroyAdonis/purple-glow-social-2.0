# Production Login Fix - Implementation Plan

## Phase 1: Code Fix - Trusted Origins
### Task: Add Production URL to Trusted Origins
- [x] Update `lib/config/urls.ts` to explicitly include `https://purple-glow-social-2-0.vercel.app`
- [x] Maintain existing environment variable support for flexibility

**File Changed:** `lib/config/urls.ts`
```typescript
// Added to origins array:
'https://purple-glow-social-2-0.vercel.app',
```

## Phase 2: Code Fix - Dynamic Auth Client BaseURL
### Task: Use Empty String for Same-Origin Requests
- [x] Update `lib/auth-client.ts` to use empty string as fallback (same-origin)
- [x] Maintain environment variable priority

**File Changed:** `lib/auth-client.ts`
```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  basePath: "/api/auth",
});
```

## Phase 3: Code Fix - Server-Side Auth BaseURL
### Task: Add Dynamic BaseURL Resolution for Server
- [x] Update `lib/auth.ts` to detect Vercel environment and use correct URL
- [x] Use `VERCEL` env var as production indicator

**File Changed:** `lib/auth.ts`
```typescript
const getAuthBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL) return 'https://purple-glow-social-2-0.vercel.app';
  return 'http://localhost:3000';
};
```

## Phase 4: Code Fix - Better Error Handling in Login
### Task: Check Sign-In Result Before Redirect
- [x] Update `app/login/page.tsx` to check for errors in signIn result
- [x] Only redirect on successful authentication

## Phase 5: Verification
### Task: Build Verification
- [x] Run `npm run build` successfully
- [x] No TypeScript errors

## Phase 6: Deployment (User Action Required)
### Task: Environment Variables
- [ ] Verify `BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app` in Vercel
- [ ] Verify `NEXT_PUBLIC_BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app` in Vercel
- [ ] Redeploy application after changes are pushed

### Task: OAuth Configuration (if using Google login)
- [ ] Ensure Google OAuth authorized redirect URIs include:
  - `https://purple-glow-social-2-0.vercel.app/api/auth/callback/google`

## Summary of Changes
| File | Change |
|------|--------|
| `lib/config/urls.ts` | Added production URL to trusted origins |
| `lib/auth-client.ts` | Use empty string for same-origin API calls |
| `lib/auth.ts` | Dynamic baseURL with Vercel environment detection |
| `app/login/page.tsx` | Better error handling - check result before redirect |
