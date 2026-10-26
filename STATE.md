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
  was a bare background process with nothing supervising it, so when it died the site answered **502** from
  Caddy and stayed down until someone noticed. Never start it with `nohup` again — use
  `systemctl restart posta` and check with `systemctl status posta && curl -s -o /dev/null -w '%{http_code}' https://posta.digitalwavetech.dev/`.
- **Images are generated free on NVIDIA NIM FLUX.1-dev** — `POST /api/ai/generate-image`, 1024×1024, ~9s,
  no per-image cost. Output is written to `public/generated/` (gitignored) and served through
  `app/generated/[file]`, **cached by `sha256(prompt|seed)`** so a repeated topic never makes a second call.
  The endpoint needs only `prompt|width|height|seed` — adding `mode`/`cfg_scale`/`steps` makes NIM return
  500. `NVIDIA_API_KEY` is read at start from `kitfix-2.0/.env.local` because the key in `~/.hermes/.env`
  403s; **Posta should get its own NIM key** (open call for Leroy). Pollinations was rejected: 1 image per
  45s per IP.
- **`.aerogel-card` hard-sets a white background and border in plain CSS, so it silently beats any Tailwind
  `bg-*`/`border-*` utility on the same element.** Combining the two put cream text on white at 1.16:1 on
  the Automation page — invisible to a reader and to TypeScript. Never combine them; a coloured card uses
  `rounded-2xl` plus the colour utility.
- **AI generation runs on the self-hosted freellm router, not Puter.** `posta-serve.sh` exports
  `AI_PROVIDER=freellmapi`, `AI_BASE_URL=http://127.0.0.1:3901/v1`, `AI_MODEL=auto`, and reads the bearer key
  from `/root/.hermes/.env` (`FREELLMAPI_API_KEY`) at start — the key is never copied into this repo.
  `lib/ai/provider.ts` requires all three and has no built-in model default on purpose, so a missing variable is
  a loud 500 instead of a silent call to the wrong backend. Puter.js was removed 2026-10-26: it needed an
  interactive pop-up sign-in, so generation could never run unattended.
- **Credits are charged on PUBLISH, never on generation or draft-save.** `/api/posts/save-draft` used to deduct
  one credit per draft with no reservation and no release, and the generator calls it automatically after every
  generation — so users paid for unpublished text and paid again on publish. Removed 2026-10-26. The charge
  belongs to `/api/posts/publish`, which deducts per successful platform and refunds failures.
- **`design-system/posta/tokens.css` is imported once, in `app/layout.tsx`.** It used to be imported per page by
  the marketing and auth routes only, so every `var(--posta-*)` on `/dashboard` resolved to nothing. Never
  re-introduce a per-page import of it.

## Queued work

Paperclip DIG-46 → DIG-51 (features, with blockers verified through the API) and DIG-52 → DIG-54 (auth pages,
dashboard, legal pages onto the component library). DIG-46 step 2 is blocked on the F-01 decision.
