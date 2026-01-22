# Implementation Plan

## Wave 1: Config & Diagnostics (Critical Path)

1) drizzle/db.ts
- Add and export configureNeon() that sets neonConfig with sensible defaults in dev.
- Export async function ping(timeoutMs=1500): runs `SELECT 1` via dbHttp with AbortController timeout and returns { ok, durationMs, error? }.
- Ensure singletons in dev (module-level guard) to avoid re-init on HMR.

2) lib/auth.ts
- Import neonConfig from drizzle/db.ts (or configure there before neon()).
- Wrap Better-auth drizzle adapter init in try/catch with ping() preflight; log DB health state.
- Add AUTH_DEV_MODE and ALLOWED_TEST_EMAILS parsing. If dev mode enabled and ping() fails, set `database: undefined` and register an email/password sign-in hook that validates against allowed test accounts and mints short-lived sessions.
- Add diagnostics export for cookie config and fallback state.

3) app/api/auth/[...all]/route.ts
- Ensure export const runtime='nodejs' (already present) and export const dynamic='force-dynamic'.
- On each request, add headers: x-db-health, x-runtime, x-auth-fallback.

4) app/api/diagnostics/auth/route.ts and lib/diagnostics/auth-diagnostic.ts
- Extend diagnoseAuth() to include: dbHealth (ping + last error), cookieConfig (useSecureCookies, prefix), runtimeHints, devFallbackActive boolean.

5) lib/config/env.ts and env-validation.ts
- Add AUTH_DEV_MODE (optional boolean string) and ALLOWED_TEST_EMAILS (comma list) schema/validation (warn in prod if set).
- Add optional NEON_* timeout envs to override dev defaults.

6) .env.example
- Document AUTH_DEV_MODE usage and ALLOWED_TEST_EMAILS defaults for local dev.

## Wave 2: Proxy Migration & UX parity

7) proxy.ts (new)
- Implement Next.js 16 proxy configuration replicating the UX parts of middleware: redirect /login and /signup if cookie present; avoid heavy auth checks; leave API/pass-through.
- Update next.config.js if necessary for experimental proxy routing.
- Remove or slim down middleware.ts to no-op/comment noting migration.

## Risks & Mitigations
- Risk: Fallback accidentally enabled in prod. Mitigation: hard check NODE_ENV!=='production' plus throw if AUTH_DEV_MODE set in prod build.
- Risk: Cookie issues on .vercel.app: keep existing isVercelSharedDomain logic.
- Risk: HMR recreates clients: ensure module-level singletons and fetchConnectionCache.

## Rollback Plan
- Revert proxy.ts and restore middleware.ts.
- Remove AUTH_DEV_MODE logic by setting envs absent; code paths are guarded and harmless when off.
- Restore prior drizzle/db.ts without neonConfig if issues arise.
