# Build plan — Posta

*User-owned input. `[x]` = shipped and verified. `[ ]` = roadmap. Never tick a box that is not working.*

## Shipped and working

- [x] Email/password auth with sessions and protected routes
- [x] 11-language content generation wiring (provider switchable via env)
- [x] Scheduling UI: calendar, list and timeline views
- [x] OAuth connect flows for Instagram, Facebook, X and LinkedIn
- [x] Auto-posting service layer with per-platform poster modules
- [x] Credit ledger basics with tier limits
- [x] `/api/limits/check` returning the real tier, credits and allowance
- [x] Legal surface: `/privacy`, `/terms`, `/cookies`, `/refund`, `/contact` on one source of legal identity
      (`lib/company.ts`), plus a consent banner whose links resolve to those real routes
- [x] Complete Posta rebrand from the old Purple Glow identity, including the admin allow-list wildcard for a
      domain DWT does not own (closed)
- [x] Design system v1 with measured contrast, bounded type scale, component states and a brand checker
- [x] Brand rebuild of the whole app: paper/clay palette, gradients/glass/glow removed, Space Grotesk + Inter
- [x] Paystack webhook with HMAC-SHA512 verification, constant-time compare and an idempotency key

## Roadmap — the six slices, filed as DIG-46 … DIG-51

Design: `docs/specs/2026-10-25-cherry-pick-features-design.md`

- [ ] **S1 · Prepaid ZAR credit wallet** (DIG-46) — append-only credit ledger, balance is the sum, top-ups via
      the existing Paystack webhook
- [ ] **S2 · Publish pipeline v2** (DIG-47) — post state machine, append-only attempt log, per-channel preflight,
      reconciler, idempotent retries
- [ ] **S3 · Posting slots** (DIG-48) — per-account slots with SAST-shaped defaults and a free-slot scan
- [ ] **S4 · The drip** (DIG-49) — evergreen recycling in SA vertical packs, language-aware rotation
- [ ] **S5 · Guards** (DIG-50) — proofread, credits and media-limit guards that can hold a post with a plain reason
- [ ] **S6 · Recap link** (DIG-51) — a weekly, login-free, revocable report delivered as a WhatsApp message

## Deliberately not built

Enterprise approvals and seats · team workspaces and roles · additional networks beyond the four · competitor
tracking · AI image and video generation · link-in-bio · any "unlimited AI" claim. Reasons recorded in
`docs/CHERRY-PICKS.md` §3.

## Known gaps before launch

- Paystack keys are not wired and no test purchase has been run.
- Meta app is still in Development mode; posting for other users needs App Review.
- `GEMINI_API_KEY` is absent, so the AI path reports itself as unavailable rather than faking output.
- WhatsApp Channels publishing is unverified and must be spiked before any copy mentions it.
- 45 files still use legacy Tailwind class names that now resolve to brand colours — cosmetic debt, not a bug.
