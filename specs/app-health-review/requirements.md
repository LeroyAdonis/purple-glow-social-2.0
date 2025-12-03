# Requirements Document

**Feature:** Application Health Review Remediation  
**Date:** 2025-12-03  
**Version:** 1.0  

---

## Overview

This document outlines the detailed requirements for fixing all issues identified in the app-health-report.md. Each requirement maps directly to an issue and provides specific acceptance criteria.

---

## Critical Priority Requirements

### REQ-001: Production Environment Variable Validation

**Related Issue:** #1 - Production Login 404 Error  
**Priority:** CRITICAL  

**Description:**  
Implement strict environment variable validation that throws errors in production when required variables are missing.

**Acceptance Criteria:**
- [ ] Application throws a descriptive error at startup if `BETTER_AUTH_SECRET` is missing in production
- [ ] Application throws a descriptive error if `DATABASE_URL` is missing or invalid in production
- [ ] Development mode continues to use fallback values
- [ ] Error messages clearly indicate which variable is missing

**Technical Specifications:**
- Create `lib/config/env-validation.ts` with validation functions
- Call validation at the top of `lib/auth.ts` before auth initialization
- Use `process.env.NODE_ENV === 'production'` or `process.env.VERCEL_ENV === 'production'` for detection

---

### REQ-002: Remove Insecure OAuth Fallbacks

**Related Issue:** #2 - Insecure Mock OAuth Credentials  
**Priority:** CRITICAL  

**Description:**  
Remove mock OAuth credentials and only configure providers when real credentials are available.

**Acceptance Criteria:**
- [ ] OAuth providers are only added to the config when real credentials exist
- [ ] Missing OAuth credentials do not cause application crash
- [ ] UI gracefully hides OAuth options when providers are not configured
- [ ] Logging indicates which OAuth providers are enabled

**Technical Specifications:**
- Conditionally include social providers in `lib/auth.ts`
- Add `lib/config/feature-flags.ts` to expose enabled providers to frontend
- Update login/signup pages to check feature flags before showing OAuth buttons

---

### REQ-003: Secure Cron POST Endpoint

**Related Issue:** #3 - Cron Endpoint POST Handler Lacks Authentication  
**Priority:** CRITICAL  

**Description:**  
Add authentication to the manual cron trigger endpoint.

**Acceptance Criteria:**
- [ ] POST endpoint requires valid user session
- [ ] Only admin users can trigger manual cron runs
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for non-admin authenticated users
- [ ] Audit log entry created for manual triggers

**Technical Specifications:**
- Import `auth` and `isAdmin` in `app/api/cron/process-scheduled-posts/route.ts`
- Add session validation at the start of POST handler
- Check admin status using existing `isAdmin` utility

---

## High Priority Requirements

### REQ-004: Replace `any` Types with Proper Interfaces

**Related Issue:** #4 - Excessive Use of `any` Type  
**Priority:** HIGH  

**Description:**  
Define and use proper TypeScript interfaces throughout the codebase.

**Acceptance Criteria:**
- [ ] No `any` types in lib/ directory (except where absolutely necessary)
- [ ] No `any` types in app/api/ routes
- [ ] Component props use defined interfaces
- [ ] Database types are properly inferred from Drizzle schema
- [ ] All `catch (error: any)` replaced with proper error typing

**Technical Specifications:**
- Create `lib/types/` directory with shared type definitions
- Define interfaces for: SuccessData, WebhookPayload, AdminUser, etc.
- Use `unknown` instead of `any` for error catches, then narrow with type guards
- Export Drizzle infer types from schema

---

### REQ-005: Implement Structured Logging

**Related Issue:** #5 - Console Logging in Production Code  
**Priority:** HIGH  

**Description:**  
Create a centralized logging utility that respects environment context.

**Acceptance Criteria:**
- [ ] All `console.log/error/warn` calls replaced with logger utility
- [ ] Log levels: debug, info, warn, error
- [ ] Debug logs suppressed in production
- [ ] Sensitive data (emails, tokens) never logged
- [ ] Structured JSON format for production logs
- [ ] Integration with Sentry for error-level logs

**Technical Specifications:**
- Create `lib/logger.ts` with log level functions
- Add log sanitization to remove sensitive data
- Replace all console statements across codebase
- Configure Sentry breadcrumbs for info/warn levels

---

### REQ-006: Configure Vercel Cron Jobs

**Related Issue:** #6 - Empty Vercel Cron Configuration  
**Priority:** HIGH  

**Description:**  
Enable automatic scheduled post processing via Vercel Cron.

**Acceptance Criteria:**
- [ ] Cron job runs every minute
- [ ] Vercel dashboard shows cron job configured
- [ ] Cron job authenticated with CRON_SECRET
- [ ] Logs visible in Vercel function logs
- [ ] Monitoring alert if cron fails consecutively

**Technical Specifications:**
- Update `vercel.json` with cron configuration
- Ensure `CRON_SECRET` is set in Vercel environment
- Add retry logic to cron handler

---

### REQ-007: Type Database Instances Properly

**Related Issue:** #7 - Database Variable Typed as `any`  
**Priority:** HIGH  

**Description:**  
Use proper Drizzle types for database instances.

**Acceptance Criteria:**
- [ ] Database variable typed as `NeonHttpDatabase<typeof schema>`
- [ ] All database operations have proper type inference
- [ ] No type errors in IDE for database queries
- [ ] Exported db instance is properly typed

**Technical Specifications:**
- Import proper types from `drizzle-orm/neon-http`
- Use union type with `undefined` for conditional initialization
- Add type guard for database availability checks

---

## Medium Priority Requirements

### REQ-008: Remove dangerouslySetInnerHTML

**Related Issue:** #8 - dangerouslySetInnerHTML Usage  
**Priority:** MEDIUM  

**Description:**  
Replace inline style injection with CSS modules or Tailwind.

**Acceptance Criteria:**
- [ ] No `dangerouslySetInnerHTML` in codebase
- [ ] Smooth scroll behavior preserved
- [ ] No visual regression

**Technical Specifications:**
- Add `scroll-behavior: smooth` to `app/globals.css` or `index.css`
- Remove style tags using dangerouslySetInnerHTML
- Verify smooth scrolling works across browsers

---

### REQ-009: Configure NEXT_PUBLIC_BASE_URL

**Related Issue:** #9 - Missing NEXT_PUBLIC_BASE_URL  
**Priority:** MEDIUM  

**Description:**  
Properly configure base URL with Vercel fallback.

**Acceptance Criteria:**
- [ ] Base URL automatically set from Vercel environment
- [ ] Checkout success/cancel redirects work in production
- [ ] Polar webhooks use correct URLs
- [ ] No hardcoded localhost in production

**Technical Specifications:**
- Create utility function `getBaseUrl()` in `lib/config/urls.ts`
- Use `VERCEL_URL` as fallback when `NEXT_PUBLIC_BASE_URL` is not set
- Update all usages to use the utility

---

### REQ-010: Dynamic Trusted Origins

**Related Issue:** #10 - Hardcoded Production URL  
**Priority:** MEDIUM  

**Description:**  
Make trusted origins configurable for custom domains.

**Acceptance Criteria:**
- [ ] Trusted origins include environment-based URLs
- [ ] Custom domains work without code changes
- [ ] Localhost included for development
- [ ] No null/undefined values in array

**Technical Specifications:**
- Build trusted origins array from environment variables
- Filter out undefined/null values
- Support multiple custom domains via comma-separated env var

---

## Low Priority Requirements

### REQ-011: Add ES Module Type

**Related Issue:** #11 - Missing type:module  
**Priority:** LOW  

**Description:**  
Add `"type": "module"` to package.json to eliminate ES module warnings.

**Acceptance Criteria:**
- [ ] No MODULE_TYPELESS_PACKAGE_JSON warnings in build
- [ ] All imports/exports continue to work
- [ ] No breaking changes to build process

**Technical Specifications:**
- Add `"type": "module"` to package.json
- Verify all CommonJS requires are converted to imports
- Test build completes without module-related errors

---

### REQ-012: Update Deprecated Dependencies

**Related Issue:** #12 - Deprecated npm Packages  
**Priority:** LOW  

**Description:**  
Update or replace deprecated npm packages.

**Acceptance Criteria:**
- [ ] No deprecation warnings during npm install
- [ ] All tests pass after update
- [ ] No breaking changes to functionality

**Technical Specifications:**
- Run `npm audit fix`
- Update packages with deprecation notices
- Test application functionality after updates

---

## Environment Variables Required

The following environment variables must be set in production:

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Authentication secret (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Yes | Client-side auth URL |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Base URL for redirects |
| `CRON_SECRET` | Recommended | Secret for cron authentication |
| `TOKEN_ENCRYPTION_KEY` | Yes | 64-char hex for token encryption |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `TWITTER_CLIENT_ID` | Optional | Twitter OAuth client ID |
| `TWITTER_CLIENT_SECRET` | Optional | Twitter OAuth client secret |

---

## Testing Requirements

All fixes must:
1. Pass existing test suite (`npm run test`)
2. Not introduce TypeScript errors (`npx tsc --noEmit`)
3. Build successfully (`npm run build`)
4. Work in both development and production modes
