# Posta — state snapshot

Read `/root/.hermes/HANDOFF.md` first (agent-level). This file is the repo-local detail.

**Updated:** 2026-10-25 · **HEAD:** see `git log -1` · **Live:** https://posta.digitalwavetech.dev

## Verify before claiming done

```bash
./scripts/site-gate.sh          # 5 stages, non-zero on any failure — the only accepted proof
npx tsc --noEmit                # types
```

The gate covers: brand checker (9 pages) · served-HTML `<h1>` + no SSR bailout · CRO audit with no CRITICAL ·
styleframe parity (0 computed, 0 pixel) · responsive at 9 device widths · **authenticated contract
(`scripts/auth-smoke.py`: logs in as the demo account and asserts `/api/limits/check` returns objects with
numeric `current`/`limit`, not bare numbers)**.

Stage 6 exists because on 2026-10-26 `/dashboard` showed "Something Went Wrong" for **every** signed-in user.
`/api/limits/check` returned `credits` and `dailyGenerations` as bare numbers while all six calling components
read them as objects, so three of them threw and the error boundary replaced the page. Stages 1–5 are public or
unauthenticated requests and could never have seen it. Any check of this app that does not log in is blind to
everything behind the login.

## Architecture facts that surprise people

- The landing hero is a **port of an approved styleframe**, not a design. `design-system/posta/hero.css` is
  shared by the app and the styleframe so they cannot drift; both sides carry `data-sf` roles;
  `scripts/parity-landing.py` measures them.
- `library.css` is the component system for **every other page**. No section invents a value; add to the library.
- Fonts load from the Google stylesheet in `app/layout.tsx` (static 500/700), **not** `next/font` — the variable
  instances measure wider than the approved design.
- `/login` must never call `useSearchParams()`. It did, which bailed the route out of SSR and served an empty
  shell with no `<h1>`.
- Postgres is a docker container (`posta-db`, `127.0.0.1:5434`); **`psql` is not installed on the host** — use
  `docker exec -i posta-db psql`.
- Migrations: hand-written `NNNN_name.sql` following `0009_`'s convention. `drizzle-kit generate` reconstructs
  the whole schema because the journal drifted (finding **F-01**, unresolved by decision, not by code).
- Deploy: `/root/posta-serve.sh` (`db`, `seed`, `build`, `start`); Caddy maps the domain to `127.0.0.1:3008`;
  server log `/root/posta-server.log`.
- **The app runs as the systemd unit `posta.service`** (`Restart=always`, enabled at boot). Before 2026-10-26 it
  was a bare background process with nothing supervising it, so when it died the site answered **502** from Caddy
  and stayed down until someone noticed. Never start it with `nohup` again — use
  `systemctl restart posta` and check with `systemctl status posta && curl -s -o /dev/null -w '%{http_code}' https://posta.digitalwavetech.dev/`.

## Queued work

Paperclip DIG-46 → DIG-51 (features, with blockers verified through the API) and DIG-52 → DIG-54 (auth pages,
dashboard, legal pages onto the component library). DIG-46 step 2 is blocked on the F-01 decision.
