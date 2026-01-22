# Decision Record: Neon ETIMEDOUT during Better-auth sign-in (Development)

## Context
- Next.js 16.1.3 App Router, Better-auth at /api/auth/[...all], Drizzle ORM, Neon serverless Postgres.
- drizzle/db.ts uses both neon-http (for simple queries) and neon-serverless Pool (for transactions).
- lib/auth.ts initializes drizzle(neon-http) on module load.
- Auth route exports runtime='nodejs'. Middleware currently handles UX and basic protection; Next.js warns to migrate to proxy.ts.
- Intermittent ETIMEDOUT in dev during email sign-in queries → 500 responses.

## Likely Root Causes
1) Connection warm-up + dev hot-reload churn
   - In dev, module reloads can re-create clients; first query cold-start hits connection setup. Without pooledConnection/fetch cache, Neon can timeout under slow network or local VPN.
2) Mixed driver usage without explicit neonConfig
   - neon() defaults may not enable connection caching and retry logic optimal for dev. Pool query timeout not explicitly set, making timeouts surface as ETIMEDOUT.
3) Route running on edge at times (non-auth paths) affecting dependency state
   - While auth explicitly uses nodejs, upstream redirects (middleware) and dev server subtleties can still mask issues; ensuring all DB work runs on nodejs is key.
4) Local DNS/network variability
   - Neon over HTTP/WS is sensitive to DNS latency and intermittent packet loss; short default timeouts can lead to ETIMEDOUT.

## Constraints and Goals
- Minimal changes; production is stable.
- Keep drivers aligned with Drizzle & Neon guidance for Next.js App Router.
- Improve diagnostics.
- Provide a development-only resilience path when DB is temporarily unreachable.

## Decision
- Standardize on @neondatabase/serverless neon(fetch) with explicit neonConfig and enable fetchConnectionCache and pooled connections for neon-http client used by Better-auth.
- Configure conservative timeouts and small retry backoff in development.
- Export a shared dbHealth.ping() to quickly test reachability prior to critical auth queries.
- Add AUTH_DEV_MODE fallback (dev-only) that issues short-lived sessions for documented test accounts if DB ping fails. Never available in production.
- Migrate middleware.ts to proxy.ts with UX-only behaviors; enforce auth in server routes (status quo) to avoid edge runtime side-effects.

## Status
Accepted – implement in two waves (config + diagnostics, then proxy migration + fallback path).

## Consequences
- Dev sign-in more resilient; first query less likely to timeout.
- Clear diagnostics for DB and cookie settings.
- Middleware replaced by proxy.ts per Next.js 16 guidance; reduced edge complexity.

## Alternatives Considered
- Using neon-serverless Pool for everything: adds WebSocket dependency; unnecessary for simple auth queries.
- Increasing global timeouts only: treats symptom; still flaky without connection caching.
- Disabling middleware entirely: hurts UX; proxy.ts provides minimal UX parity.
