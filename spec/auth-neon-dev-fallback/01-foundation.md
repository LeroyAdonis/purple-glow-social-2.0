# Phase 1: Foundation

## Objective
Establish a clear root-cause analysis and architectural decisions to stabilize Better-auth sign-in against Neon ETIMEDOUT in development, ensure Node.js runtime for auth, and prepare a gated dev-fallback path without impacting production.

## Requirements
- Document likely causes of Neon ETIMEDOUT in Next.js App Router dev.
- Select Neon drivers and configuration compatible with Next.js 16 App Router.
- Define runtime and caching directives for auth routes.
- Define AUTH_DEV_MODE gates and safeguards.
- Plan middleware.ts → proxy.ts migration strategy preserving UX behavior.
- Define diagnostics surface area (DB health, cookies, runtime, fallback state).

## Acceptance Criteria
- [ ] Root-cause analysis written and agreed.
- [ ] Driver selection and neonConfig documented with defaults.
- [ ] Runtime policy defined (auth runs on Node.js runtime).
- [ ] Dev fallback design documented with strict production guardrails.
- [ ] Proxy strategy documented (what stays in UX layer vs server checks).
- [ ] Diagnostics fields enumerated.

## Technical Details
- Drivers:
  - Auth uses drizzle-orm/neon-http with @neondatabase/serverless neon(fetch).
  - Transactional operations use drizzle-orm/neon-serverless with Pool.
- neonConfig defaults (dev):
  - fetchConnectionCache: true
  - pooledConnection: true
  - wsProxy: disabled by default
  - poolQueryTimeout: 15_000ms
  - connectionTimeout: 5_000ms
  - pipelineConnect: true
  - maxRetries: 3, retryIntervalMs: 250
- Auth route config:
  - export const runtime = 'nodejs'
  - export const dynamic = 'force-dynamic'
- AUTH_DEV_MODE:
  - Enabled only when NODE_ENV !== 'production' AND AUTH_DEV_MODE === 'true'
  - Whitelist: ALLOWED_TEST_EMAILS, or defaults to the accounts in docs/TEST_ACCOUNTS_GUIDE.md
  - When DB health check fails, allow local email-password sign-in to mint ephemeral sessions (short TTL, 2h) scoped to dev only
  - No OAuth in fallback
- Middleware → proxy:
  - Narrow UX-only behaviors (redirect logged-in away from /login, light admin redirect)
  - Push hard auth to route handlers (already in place)
- Diagnostics:
  - DB health: "ok" | "degraded" | "down", last error message, duration
  - Cookie settings: useSecureCookies, cookiePrefix, domain assessment
  - Runtime: nodejs/edge, dynamic setting
  - Dev fallback active: boolean and reason (db_unreachable | disabled)

## Files to Create/Modify
- Create: spec/auth-neon-dev-fallback/* (this document set)
- Modify: lib/auth.ts (neonConfig, diagnostics, fallback gates)
- Modify: drizzle/db.ts (centralize neonConfig, export ping())
- Modify: app/api/auth/[...all]/route.ts (dynamic, diagnostics headers)
- Modify: app/api/diagnostics/auth/route.ts and lib/diagnostics/auth-diagnostic.ts (add fields)
- Add: proxy.ts (replace middleware.ts), de-scope middleware.ts or remove
- Modify: lib/config/env.ts & env-validation.ts (AUTH_DEV_MODE, ALLOWED_TEST_EMAILS, Neon timeouts)
- Update: .env.example

## Potential Blockers
- Next.js 16 proxy.ts behavior differences across versions
- Ensuring Better-auth cookies still set under proxy constraints
- Avoiding duplicate DB client initialization in hot-reload

## Estimated Effort
4–6 hours total across two waves.
