# FEATURE-API — public `/api/v1` so an agent or a customer's tool can post for a business

**Status:** ready to build · **Wave:** 1 · **Owner:** Pi · **Item:** 9 in `docs/POSTIZ-BUILD-SPECS.md`
**Product reason:** no South African competitor lets an AI agent schedule posts for a business via an API.
Postiz's own agent CLI proves the shape works. This is greenfield — new files only.

## Scope (deliberately narrow — foundation, not the whole surface)

This wave ships the **auth foundation plus two endpoints**. Analytics, media upload and webhooks come later.

1. **API keys.** Table `api_keys` in `drizzle/schema.ts`:
   `id` (uuid pk), `userId` (text, FK to `user.id`, cascade), `name` (text, what the user calls it),
   `keyHash` (text, unique — **store a SHA-256 of the key, never the key**), `keyPrefix` (text, first 8 chars
   so a human can identify a key in a list), `lastUsedAt` (timestamp, nullable), `revokedAt` (timestamp,
   nullable), `createdAt`.
2. **Middleware** `lib/api/v1/auth.ts` exporting `authenticateApiRequest(request)`:
   reads `Authorization: Bearer <key>`, hashes it, looks up a non-revoked key, returns the owning user or a
   typed failure. Updates `lastUsedAt`. A missing/blank/malformed header, an unknown key and a revoked key are
   **three distinct failures** with distinct HTTP codes and messages — not one generic 401.
3. **`GET /api/v1/integrations`** — the caller's connected accounts: platform, display name, when connected,
   token health (`ok` / `needs_reauth`), and **never the token**.
4. **`POST /api/v1/posts`** — schedule one post: `{ content, platforms: string[], scheduledAt (ISO or
   "now"), imageUrl? }`. Validates, enforces the caller's tier limit on queue size and credit balance
   **before** writing, creates one row per platform, returns their ids and statuses.
5. **Key management for the dashboard** (server-side only, no UI in this wave):
   `POST /api/v1/keys` (create, returns the plaintext key **once**), `GET /api/v1/keys` (list, prefix only),
   `DELETE /api/v1/keys/[id]` (revoke). These use the existing **session** auth, not a bearer key.

## What "done" means (acceptance criteria)

- A request with no header, a garbage key and a revoked key each produce a different, correct response.
- The plaintext key is returned exactly once and never stored, never logged, never in a list response.
- `POST /api/v1/posts` with insufficient credits writes **nothing** and says why — no partial rows, no
  orphaned posts. This is the one place a bug costs a customer money.
- Every endpoint has a test that exercises the real handler.
- `npx tsc --noEmit` clean.

## Tests to write FIRST (vitest, RED before implementation)

`lib/api/v1/auth.test.ts`
- no `Authorization` header → 401 `missing_key`
- `Bearer` with an unknown key → 401 `unknown_key`
- a key whose row has `revokedAt` set → 401 `revoked_key`
- a valid key → resolves the owner and stamps `lastUsedAt`
- the hash in the DB never equals the plaintext key

`app/api/v1/posts/route.test.ts` (mock db)
- over queue limit → 429/403 with the limit named, and **zero inserts**
- insufficient credits → same rule, zero inserts, credits unchanged
- valid request across 2 platforms → 2 rows, one per platform, both scheduled
- unknown platform name → 400 naming the bad value, no inserts

`app/api/v1/keys/route.test.ts`
- create returns a plaintext key once and a prefix-safe list afterwards (the list never contains the key)
- revoke sets `revokedAt`, and the revoked key is then rejected by the middleware

## Constraints

- New files only, plus one table appended to `drizzle/schema.ts`. Do not touch `lib/posting/**`,
  `app/api/ai/**`, `app/generated/**`, `.env*`, `posta-serve.sh`, or `blueprint/`.
- Do not commit. Do not run a full `npm run build` (another agent is building in the same tree); use
  `npx tsc --noEmit` and `npx vitest run <your files>`.
- Prove it: paste the real RED and GREEN `npx vitest run` output.
- No new dependency. Use node's `crypto` for hashing and key generation.
