# OAuth Social Authentication Fix

## Issue
The signup page was getting a 404 error when attempting Google sign-up:
```
POST http://localhost:3000/api/auth/sign-up/social 404 (Not Found)
```

## Root Cause
The code was using `signUp.social()` which tries to call `/api/auth/sign-up/social`, but Better Auth doesn't have this endpoint. 

Better Auth uses a **unified social authentication flow** where:
- The endpoint is `/api/auth/sign-in/social` (not sign-up)
- This single endpoint handles both sign-in and sign-up automatically
- If the user doesn't exist, it creates a new account
- If the user exists, it signs them in

## Solution
Changed the signup page to use `signIn.social()` instead of `signUp.social()`:

### Before
```typescript
await signUp.social({
  provider: 'google',
  callbackURL: '/dashboard',
});
```

### After
```typescript
// Better Auth uses signIn.social for both sign-in and sign-up
// It will automatically create an account if the user doesn't exist
await signIn.social({
  provider: 'google',
  callbackURL: '/dashboard',
});
```

## Files Changed
- `app/signup/page.tsx`: Updated to use `signIn.social()` and added import for `signIn`

## Testing
To test Google OAuth:
1. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
2. Navigate to `/signup`
3. Click "Sign up with Google"
4. Should redirect to Google OAuth flow
5. After authorization, should create account and redirect to dashboard

## Notes
- The login page (`app/login/page.tsx`) was already correctly using `signIn.social()`
- This is the expected behavior for Better Auth - social providers use a unified authentication endpoint
- The distinction between sign-up and sign-in is handled automatically by Better Auth based on whether the user exists

## Related Documentation
- [Better Auth Social Providers](https://www.better-auth.com/docs/authentication/social)
- `lib/auth.ts`: Server-side auth configuration
- `lib/auth-client.ts`: Client-side auth methods
