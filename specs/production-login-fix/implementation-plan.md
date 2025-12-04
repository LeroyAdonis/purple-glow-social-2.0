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
### Task: Use Window Origin as Fallback
- [x] Update `lib/auth-client.ts` to use `window.location.origin` in browser
- [x] Maintain environment variable priority

**File Changed:** `lib/auth-client.ts`
```typescript
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return "http://localhost:3000";
};
```

## Phase 3: Verification
### Task: Build Verification
- [x] Run `npm run build` successfully
- [x] No TypeScript errors

## Phase 4: Deployment (User Action Required)
### Task: Environment Variables
- [ ] Set `BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app` in Vercel
- [ ] Set `NEXT_PUBLIC_BETTER_AUTH_URL=https://purple-glow-social-2-0.vercel.app` in Vercel
- [ ] Redeploy application after changes are pushed

### Task: OAuth Configuration (if using Google login)
- [ ] Ensure Google OAuth authorized redirect URIs include:
  - `https://purple-glow-social-2-0.vercel.app/api/auth/callback/google`

## Summary of Changes
| File | Change |
|------|--------|
| `lib/config/urls.ts` | Added production URL to trusted origins |
| `lib/auth-client.ts` | Dynamic baseURL resolution using window.location.origin |
