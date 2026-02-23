# Public Pages Audit Report

**Audit Date:** 2026-02-20T10:31:51.833Z
**Base URL:** http://localhost:3000
**Pages Audited:** 5

## Summary

⚠️ Issues found requiring attention

**Totals:**
- Console errors: 3
- Network errors: 0
- Visual observations: 9
- Accessibility observations: 0

## Page Results

### / (Home)
- **Screenshot:** docs/audit-screenshots/home-public.png
- **Console errors:** 3
  - %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  <... session={Null} translate={function}>
                                ^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1882:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2390:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2349:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2458:221)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2626:13) The above error occurred in the <Navigation> component. It was handled by the <ErrorBoundaryHandler> error boundary.
  - [2026-02-20T10:31:35.291Z] [ERROR] [Security] Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  <... session={Null} translate={function}>
                                ^^^^^^^^^^ {digest: 2665613532, component: ErrorBoundary, stack: Error: Functions cannot be passed directly to Clie…react-server-dom-turbopack_9212ccad._.js:2626:13)}
  - [2026-02-20T10:31:35.295Z] [ERROR] [Security] Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  <... session={Null} translate={function}>
                                ^^^^^^^^^^ {digest: 2665613532, component: ErrorBoundary, stack: Error: Functions cannot be passed directly to Clie…react-server-dom-turbopack_9212ccad._.js:2626:13)}
- **Console warnings:** none
- **Network errors:** none
- **Visual observations:** 5
  - Element overflows viewport: div.absolute
  - Element overflows viewport: div.absolute
  - No navigation links found
  - Pricing section not found
  - Footer not found
- **Accessibility observations:** none

### /login (Login)
- **Screenshot:** docs/audit-screenshots/login-public.png
- **Console errors:** none
- **Console warnings:** none
- **Network errors:** none
- **Visual observations:** 1
  - Element overflows viewport: div.absolute
- **Accessibility observations:** none

### /signup (Signup)
- **Screenshot:** docs/audit-screenshots/signup-public.png
- **Console errors:** none
- **Console warnings:** none
- **Network errors:** none
- **Visual observations:** 1
  - Element overflows viewport: div.absolute
- **Accessibility observations:** none

### /privacy (Privacy)
- **Screenshot:** docs/audit-screenshots/privacy-public.png
- **Console errors:** none
- **Console warnings:** none
- **Network errors:** none
- **Visual observations:** 1
  - Element overflows viewport: div.absolute
- **Accessibility observations:** none

### /terms (Terms)
- **Screenshot:** docs/audit-screenshots/terms-public.png
- **Console errors:** none
- **Console warnings:** none
- **Network errors:** none
- **Visual observations:** 1
  - Element overflows viewport: div.absolute
- **Accessibility observations:** none

## Critical Issues Requiring Immediate Attention

No critical issues found.

---

*This report was generated automatically by Playwright audit script.*
