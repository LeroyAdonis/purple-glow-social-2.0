# Architecture Overview

## Overview
Harden auth DB access with neon-http + explicit neonConfig and Node.js runtime, add dev-only fallback for email sign-in when DB is unreachable, and migrate middleware to proxy.ts focusing on UX.

## Technical Approach
- Neon driver: @neondatabase/serverless neon(fetch) with drizzle-orm/neon-http for Better-auth.
- neonConfig (dev defaults): fetchConnectionCache: true, pooledConnection: true, pipelineConnect: true, connectionTimeout: 5s, poolQueryTimeout: 15s, maxRetries: 3.
- Runtime: export runtime='nodejs' on all routes that perform DB I/O (already done for auth; audit other auth-dependent routes).
- Error handling: Wrap auth initialization and handlers with DB ping + structured logging; expose diagnostics header fields.
- Dev fallback: AUTH_DEV_MODE === 'true' AND NODE_ENV !== 'production' gates a local email fallback for known test accounts when ping fails.
- Middleware → proxy.ts: Narrow scope to UX redirects; keep authorization in server routes.

## System Components
1. DB Client Module (drizzle/db.ts): Centralizes neonConfig, exports dbHttp, db (pool), and async ping().
2. Auth Module (lib/auth.ts): Uses drizzleAdapter with dbHttp; adds dev-fallback hook and diagnostics.
3. Auth Route (app/api/auth/[...all]/route.ts): Node runtime, dynamic routing, diagnostic response headers.
4. Proxy (proxy.ts): Route proxy config replacing middleware.ts with UX-only logic.
5. Diagnostics API (app/api/diagnostics/auth): Surfaces DB health, cookie policy, runtime, fallback state.

## Data Model
No changes.

## API Design
- No new external endpoints. Diagnostics augmented.

## Performance Considerations
- Connection caching reduces cold-start latency in dev.
- Small retries with backoff handle transient network blips.

## Security Considerations
- Dev fallback only in non-production builds; explicit env gate; short-lived sessions; restricted to whitelisted emails.
- No changes to production cookie security policy; keep public suffix handling.

## Edge Cases & Error Handling
- If ping passes but subsequent query fails → standard error path, no fallback.
- If DB becomes reachable mid-flow → normal auth continues; fallback is only used when ping fails at sign-in.
- OAuth flows bypass fallback; only local email/password in dev.
