# Acceptance Criteria

- Auth email sign-in no longer intermittently 500s in local dev under normal conditions; if Neon is down, sign-in succeeds for whitelisted test accounts with clear banner indicating dev fallback.
- /api/diagnostics/auth returns fields: databaseConfigured, dbHealth { ok, durationMs, lastError? }, cookie { useSecureCookies, prefix }, runtime { auth: 'nodejs' }, devFallbackActive boolean.
- Response headers on /api/auth requests include x-db-health and x-auth-fallback when in dev.
- proxy.ts present; middleware.ts deprecated or minimized; UX parity preserved (redirect from /login when already authenticated).
- No production behavior change; CI passes tests; cookies behave correctly on .vercel.app per existing logic.
