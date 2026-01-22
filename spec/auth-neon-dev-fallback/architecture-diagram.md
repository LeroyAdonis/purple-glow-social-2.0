```text
[Next.js App Router]
      |
   /api/auth  --(nodejs runtime)-->  [Better-auth handler]
      |                                 |
      |                             [drizzle-orm/neon-http]
      |                                 |
      |                         [@neondatabase/serverless neon(fetch)]
      |                                 |
      |                           [Neon Postgres]
      |
      +-- if ping fails & AUTH_DEV_MODE=true (dev only) --> [local test-account session minting]

[proxy.ts]
  - UX redirects only; no DB calls

[diagnostics]
  - /api/diagnostics/auth: DB health, cookie, runtime, fallback
```
