# Implementation Plan

**Feature:** Application Health Review Remediation  
**Date:** 2025-12-03  
**Branch:** `app-health-review`  

---

## Phase 1: Critical Security Fixes

### Environment Variable Validation
- [x] Create `lib/config/env-validation.ts` with validation functions
- [x] Add `validateRequiredEnvVars()` function that throws in production
- [x] Call validation at top of `lib/auth.ts` before auth initialization
- [x] Add validation for: `BETTER_AUTH_SECRET`, `DATABASE_URL`, `BETTER_AUTH_URL`

### Remove Mock OAuth Credentials
- [x] Update `lib/auth.ts` to conditionally include OAuth providers
- [x] Only add Google provider if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist
- [x] Only add Twitter provider if `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` exist
- [x] Export enabled providers for frontend use

### Secure Cron POST Endpoint
- [x] Add session validation to POST handler in `app/api/cron/process-scheduled-posts/route.ts`
- [x] Import `auth` from `@/lib/auth` and `isAdmin` from `@/lib/security/auth-utils`
- [x] Return 401 for unauthenticated requests
- [x] Return 403 for non-admin users
- [x] Add audit logging for manual triggers

---

## Phase 2: High Priority - Type Safety

### Define Shared Type Interfaces
- [ ] Create `lib/types/index.ts` with exported interfaces
- [ ] Define `SuccessData` interface for payment success modals
- [ ] Define `WebhookPayload` interface for Polar webhooks
- [ ] Define `AutomationRule` interface for automation features
- [ ] Define `GenerationResult` interface for AI generation

### Fix Database Typing
- [ ] Update `lib/auth.ts` to use `NeonHttpDatabase<typeof schema> | undefined`
- [ ] Update `app/actions/generate.ts` with proper db typing
- [ ] Export typed database instance from `lib/db/index.ts`

### Replace `any` in Core Files
- [ ] Fix `app/page.tsx` - replace `useState<any>` with proper types
- [ ] Fix `App.tsx` - replace `useState<any>` with proper types
- [ ] Fix `lib/i18n.ts` - define translation record types
- [ ] Fix `lib/polar/webhook-service.ts` - type all webhook handlers

### Replace `any` in API Routes
- [ ] Fix all `catch (error: any)` blocks with `unknown` and type guards
- [ ] Fix `app/api/admin/users/route.ts` - type updateData properly
- [ ] Fix `app/api/admin/errors/route.ts` - define error array types

### Replace `any` in Components
- [ ] Fix `components/ai-content-studio.tsx` - type results array
- [ ] Fix `components/admin-dashboard-view.tsx` - type analytics and errors
- [ ] Fix `components/modals/automation-wizard.tsx` - type onComplete callback
- [ ] Fix `components/schedule-view.tsx` - type post mapping
- [ ] Fix `components/test-posting.tsx` - type result state

---

## Phase 3: High Priority - Logging & Configuration

### Implement Structured Logger
- [ ] Create `lib/logger.ts` with log level functions (debug, info, warn, error)
- [ ] Add environment detection for log level filtering
- [ ] Add sensitive data sanitization
- [ ] Integrate with Sentry for error-level logs

### Replace Console Statements
- [ ] Replace all `console.log` in `lib/` directory
- [ ] Replace all `console.error` in `app/api/` routes
- [ ] Replace debug logging in `app/login/page.tsx`
- [ ] Replace debug logging in `app/dashboard/` files

### Configure Vercel Cron
- [ ] Update `vercel.json` with cron configuration for scheduled posts
- [ ] Add schedule: `"* * * * *"` (every minute)
- [ ] Verify `CRON_SECRET` is set in Vercel dashboard

---

## Phase 4: Medium Priority - Configuration

### Remove dangerouslySetInnerHTML
- [ ] Add `scroll-behavior: smooth` to `index.css` or `app/globals.css`
- [ ] Remove `<style dangerouslySetInnerHTML>` from `app/page.tsx`
- [ ] Remove `<style dangerouslySetInnerHTML>` from `App.tsx`
- [ ] Verify smooth scrolling behavior is preserved

### Configure Base URL Utility
- [ ] Create `lib/config/urls.ts` with `getBaseUrl()` function
- [ ] Use `NEXT_PUBLIC_BASE_URL` with `VERCEL_URL` fallback
- [ ] Update `lib/polar/config.ts` to use utility
- [ ] Update `app/api/checkout/success/route.ts` to use utility
- [ ] Update `app/api/checkout/cancel/route.ts` to use utility

### Dynamic Trusted Origins
- [ ] Update `lib/auth.ts` to build trusted origins from env vars
- [ ] Include `NEXT_PUBLIC_BETTER_AUTH_URL` in trusted origins
- [ ] Include `VERCEL_URL` based origin
- [ ] Filter out null/undefined values
- [ ] Support optional `ADDITIONAL_TRUSTED_ORIGINS` env var

---

## Phase 5: Low Priority - Cleanup

### Add ES Module Type
- [ ] Add `"type": "module"` to `package.json`
- [ ] Verify build completes without MODULE_TYPELESS_PACKAGE_JSON warnings
- [ ] Test all imports work correctly

### Update Dependencies
- [ ] Run `npm audit` to identify vulnerabilities
- [ ] Run `npm update` for minor/patch updates
- [ ] Address deprecation warnings for `serialize-error-cjs`
- [ ] Address deprecation warnings for `@esbuild-kit/*` packages
- [ ] Address deprecation warnings for `node-domexception`
- [ ] Run `npm run test` to verify no breaking changes

---

## Phase 6: Verification & Documentation

### Verification Tasks
- [ ] Run `npx tsc --noEmit` - no TypeScript errors
- [ ] Run `npm run build` - successful build
- [ ] Run `npm run test` - all tests pass
- [ ] Test login flow locally
- [ ] Test OAuth flow (if credentials available)
- [ ] Test cron endpoint authentication
- [ ] Verify no console.log statements in production build

### Documentation Updates
- [ ] Update `AGENTS.md` with new logger usage
- [ ] Update `.env.example` with all required variables
- [ ] Add environment variable documentation to `README.md`
- [ ] Document new type definitions in code comments

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel dashboard
- [ ] `BETTER_AUTH_SECRET` is a strong, unique secret
- [ ] `CRON_SECRET` is set and matches vercel.json expectations
- [ ] `DATABASE_URL` points to production database
- [ ] OAuth credentials are production credentials (not test/sandbox)
- [ ] `NEXT_PUBLIC_BASE_URL` set to production domain
- [ ] Cron jobs visible in Vercel dashboard

---

## Progress Tracking

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| Phase 1: Critical Security | ✅ Complete | 2025-12-03 |
| Phase 2: Type Safety | Not Started | - |
| Phase 3: Logging & Config | Not Started | - |
| Phase 4: Medium Priority | Not Started | - |
| Phase 5: Low Priority | Not Started | - |
| Phase 6: Verification | Not Started | - |
