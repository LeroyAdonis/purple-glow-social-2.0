# FEATURE-MEDIA — generated images must be published as absolute URLs

**Status:** ready to build · **Wave:** 1 · **Owner:** OpenCode (Herdr pane) · **Item:** 10 in `docs/POSTIZ-BUILD-SPECS.md`
**Blocks:** every new channel (TikTok, YouTube, Threads video) and any provider that fetches media itself.

## Why (the observed problem)

`app/api/ai/generate-image/route.ts` returns `imageUrl = "/generated/<sha256>.jpg"` — a **relative** path.
Every poster in `lib/posting/` passes that value straight to the platform:

- `instagram-poster.ts` sends it as `image_url` to the Graph API
- `facebook-poster.ts` sends it as `url` to `/photos`
- `linkedin-poster.ts` takes it as `imageUrl`

Instagram and Facebook fetch media **by URL, server-side**. A relative path is not a URL they can resolve,
and a `file://` path or a filesystem path is explicitly rejected by their pipelines. So today, image posts
to those channels cannot work — and the failure will look like a generic platform error, not like our bug.

Postiz's own agent CLI documents this as a hard rule for its users: every file must be uploaded and posted
as a platform-verified URL, never a local path and never a third-party URL.

## What "done" means (acceptance criteria)

1. The image API returns an **absolute https URL** that a third party can fetch: base from
   `NEXT_PUBLIC_APP_URL`, falling back to `https://posta.digitalwavetech.dev` when unset. No trailing-slash
   doubles, no `undefined` in the URL.
2. One helper owns that conversion — `lib/media/url.ts` exporting `absoluteMediaUrl(pathOrName)` and
   `GENERATED_MEDIA_BASE`. The API route and every poster use it. No second implementation.
3. `lib/posting/*` refuses to send a relative path: if a poster is handed `imageUrl` that does not parse as
   `http(s)://`, it logs the rejection and posts **text-only** rather than sending a doomed request. Honest
   degradation, never a silent broken image.
4. The cached-image path (`cached: true` branch) returns the same absolute shape as the fresh path. Two
   different URL shapes for one image is how the cache hides the bug.
5. Existing behaviour is unchanged: same file name, same `/generated/[file]` serving route, same disk
   location, same 200-file cap.

## Tests to write FIRST (vitest, RED before any implementation)

`lib/media/url.test.ts`
- returns `https://posta.digitalwavetech.dev/generated/<hash>.jpg` for `/generated/<hash>.jpg` with the env
  unset (the default must be the real production host, not localhost)
- honours `NEXT_PUBLIC_APP_URL=https://example.test` and does not double the slash when the env ends in `/`
- passes through an already-absolute `https://cdn.example/x.jpg` unchanged
- rejects/returns null-ish for a bare filesystem path (`/root/posta-revive/public/generated/x.jpg`) — the
  caller must be able to detect the mistake, not silently "fix" it

`lib/posting/relative-guard.test.ts`
- a poster given `"/generated/x.jpg"` does not send the media field, produces a text-only post, and returns
  a result whose `warnings` names the rejected URL (no throw — a failed image must not fail the post)

Route test for `app/api/ai/generate-image` (mock the NVIDIA call):
- both the fresh and cached responses carry an `imageUrl` starting with `https://`

## Constraints

- Do not touch `.env*`, `posta-serve.sh`, `drizzle/schema.ts`, `app/api/v1/**`, or `blueprint/`.
- Do not commit — Ricky reviews the diff and commits.
- Prove it: paste the real `npx vitest run` output for your new tests, showing RED before and GREEN after.
- Keep the change small. No new dependency is needed for building a URL.
