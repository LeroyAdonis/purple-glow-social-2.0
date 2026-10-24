# Design — five features taken from competitors, given a Mzanzi spin

**Status:** draft for review · 25 October 2026 · Posta (Digital Wave Tech (Pty) Ltd)
**Source analysis:** `docs/CHERRY-PICKS.md` (nine vendors, 340 cited URLs), `docs/COMPETITOR-TECH.md`
(Postiz code-verified), `docs/COMPETITIVE-LANDSCAPE.md`.

---

## 0. Decisions and assumptions

Three questions were put to Leroy and went unanswered inside ten minutes, so they are decided here and marked
as assumptions. Any of them can be reversed before the first build step; after that they cost rework.

| # | Question | Decision | Why | Reverse cost |
|---|---|---|---|---|
| A1 | Who does the human proofread for 11 languages? | **The owner-operator spot-checks, with the gate enforced in software.** No paid proofreader is hired yet. | Hiring mother-tongue readers is a real monthly cost that has not been approved, and the honest claim at launch is "drafted in 11 languages, and nothing publishes until a human approves it". The gate (feature 5) makes that true regardless of who the human is. | Low — the gate is the same code either way; only the copy changes. |
| A2 | Billing shape | **Prepaid ZAR credit wallet only.** Cards and EFT via Paystack. No subscription in v1. | It removes the forex, cross-border and VAT-invoice objections in `COMPETITIVE-LANDSCAPE.md` §3.2 at the moment of launch, needs no card to start, and is a hard-to-copy billing re-platform. Subscriptions can bolt on later; the reverse is painful. | Medium — the Paystack plan codes and invoice copy would change, not the ledger. |
| A3 | Where the features are built | **The live demo, behind a per-feature flag** (`FEATURE_PUBLISH_V2`, `FEATURE_DRIP`, `FEATURE_RECAP`, `FEATURE_SLOTS`, `FEATURE_GUARDS`). | One deployment, one database, no second environment to drift. Each flag flips only after its own verification, so a Paystack reviewer never sees a half-built feature. | Low. |

Two facts remain **unverified** and must not appear in copy until settled:

1. **WhatsApp Channels publishing via the official API.** No Meta developer page read exposes a Channels send
   endpoint. Feature 3 is therefore specified as a **link that travels over WhatsApp**, not as an API publish
   into WhatsApp. A spike is a prerequisite for anything more.
2. **Instagram's publishing cap** — 100 or 50 per rolling 24h; Meta's own pages disagree. The preflight reads
   the live limit instead of hardcoding a number, and no number goes in copy.

---

## 1. Scope

**In:** the five features below, the prepaid wallet they sit on, and the flags that gate them.
**Out:** enterprise approvals/seats, additional networks beyond IG/FB/X/LinkedIn, competitor tracking, AI
image or video generation, link-in-bio, team workspaces. See `CHERRY-PICKS.md` §3 for why each is refused.

---

## 2. Architecture

The five features are not five separate builds. Four of them hang off one new concept: **a post is a row with a
state machine and an attempt log**, and the fifth (the wallet) hangs off the credit ledger that already exists.

```
                    ┌──────────────────────────────────────────┐
  scheduler ───────▶│  publish queue (posts where state=queued) │
                    └───────────────┬──────────────────────────┘
                                    ▼
                    ┌──────────────────────────────────────────┐
                    │  publishPost(postId) — ONE entry point    │
                    │  1. guards      (feature 5)               │
                    │  2. preflight   (limit check per channel) │
                    │  3. reserve     (credits, idempotent key) │
                    │  4. provider.publish() → state=pending    │
                    │  5. provider.checkStatus() → pending|sent │
                    │  6. finalize    (commit credits, emit)    │
                    │  7. on failure  → state=failed + reason   │
                    └──────────────────────────────────────────┘
```

**Why two-phase matters:** Instagram and Facebook process media asynchronously. A single-call publish that
times out is indistinguishable from a failure, so a retry double-posts. Splitting publish from status-check
makes the retry safe, because the attempt row remembers the provider's id.

### 2.1 Data model additions (Drizzle, additive only — no destructive migrations)

```ts
// posts: the state machine is the spine of features 1 and 4
state:        'draft' | 'queued' | 'publishing' | 'sent' | 'failed' | 'held'
scheduledFor: timestamp (SAST-aware; stored UTC)
categoryId:   text | null        // feature 2 (the drip)
repeatEvery:  integer | null     // days; null = one-off. Feature 2
rotatesLang:  boolean default false  // feature 2's Mzanzi twist
guardState:   jsonb default '{}' // feature 5 — why a post is held, in plain words

// post_attempts: one row per publish attempt, never updated, only appended
id, postId, startedAt, finishedAt, providerId, outcome ('pending'|'sent'|'failed'),
errorCode, errorMessage, idempotencyKey (unique)

// categories: the drip's buckets, seeded with SA vertical packs
id, userId, name, packKey ('salon'|'spaza'|'shebeen'|'food'|'events'|'custom'),
cadenceDays, slots jsonb, active

// posting_slots: feature 4
id, socialAccountId, minuteOfDay (0–1439), weekdayMask (7 bits), source ('default-sast'|'learned'|'manual')

// recap_links: feature 3
id, userId, token (unguessable, 32 bytes), periodStart, periodEnd,
brandName, brandLogoUrl, revokedAt
```

**Not added:** no `workspaces`, no `seats`, no `roles`. Deliberate — see scope.

### 2.2 Provider interface extension

Every platform provider gains two optional methods, and the pipeline degrades cleanly when they are absent:

```ts
interface Provider {
  publish(post): Promise<{ providerId: string; state: 'sent' | 'pending' }>
  checkStatus?(providerId): Promise<'sent' | 'pending' | 'failed'>
  publishingLimit?(): Promise<{ used: number; cap: number; resetsAt: Date } | null>
}
```

If `checkStatus` is missing, the attempt finalises on `publish` returning `sent` — that is the honest fallback,
and it is logged as such rather than silently assumed.

---

## 3. The five features

### Feature 1 — Publish pipeline you can trust (from Postiz)

**Story.** A salon owner schedules a post at 17:00, closes her phone. It must go out exactly once.

**Behaviour.**
- Every publish runs the seven steps in §2 and writes a `post_attempts` row.
- A retry reuses the row's `idempotencyKey`, so the provider call is safe to repeat.
- Before scheduling, `publishingLimit()` is read per channel; if the account is near its cap the UI says so in
  words and offers the next free slot rather than letting the post fail at the worst moment.
- The post card shows one of: `Queued — sends even if your phone is off` · `Publishing` · `Published at 17:00` ·
  `Failed — <reason>. <what to do>`.

**Edge cases.** Provider returns `pending` forever → after 10 minutes a reconciler marks it
`failed (timed out waiting for the platform)` and never re-sends. Token expired mid-queue → `held` with
"Reconnect Instagram" plus a one-click link. Credits ran out between queueing and sending → `held`, credits
never go negative.

**Done when:** a fake provider that fails on the first call and succeeds on the second produces exactly one
published post and two attempt rows; a provider that always returns `pending` produces `failed` after the
reconciler, with the reason visible on the card.

### Feature 2 — The drip (from SocialBee's evergreen recycling)

**Story.** A spaza shop has ten good posts. It should never go quiet.

**Behaviour.** Posts live in a category with a cadence and slots. Marking a post **Evergreen** re-queues it to
the back of its category after it publishes. Categories are seeded from SA vertical packs (Salon, Spaza,
Shebeen, Food, Events) so the first screen is never empty.

**Mzanzi twist.** `rotatesLang` makes the same evergreen idea rotate languages — Monday isiZulu, Thursday
English — with the proofread state carried per rotation, so a rotation cannot publish a language nobody has
approved.

**Edge cases.** Category emptied by an edit → drip pauses with a plain note, does not silently stop. A rotation
would publish an unapproved language → that rotation is `held`, not skipped silently.

**Done when:** ten evergreen posts in one category with a daily cadence produce ten distinct future queue items,
the eleventh wraps to the first, and an approved-language-only rotation never queues an unapproved one.

### Feature 3 — The recap link (from Metricool's live report)

**Story.** The owner wants to show her client what she did this month, over WhatsApp, with no login.

**Behaviour.** A weekly recap is a page at `/r/<token>`: posts published, best-performing language, what is
queued for next week, the customer's own name and logo. No session required, revocable, and read-only.
The owner gets a WhatsApp-ready message with the link.

**Honest limit, stated in the feature itself:** this is a **link delivered over WhatsApp**, not an API publish
into WhatsApp. Nothing in the UI or copy claims otherwise until the Channels spike settles it.

**Edge cases.** Revoked link → 404 with no information leak. No activity in the period → the page says "nothing
published this week", never an empty chart. Token guessed → 32 random bytes and rate-limited reads.

**Done when:** a recap opens in a logged-out browser, shows only that user's data, and a revoked token 404s.

### Feature 4 — Real posting slots (from Postiz + Later)

**Story.** "Best time" should be a slot the system honours, not a suggestion in a paragraph.

**Behaviour.** Each social account has posting slots (minute-of-day + weekday mask). New accounts get
**SAST-shaped defaults** — weekday 07:00 and 17:30, Saturday 09:00, nothing on Sunday morning; payday and
month-end weeks get an extra evening slot. A `findSlot` scan picks the first free slot that respects the
channel's rate limit.

**Edge cases.** No free slot in the next 14 days → say so and offer to add a slot. Two posts want the same
slot → per-channel `delay` stagger, from Postiz's `batchId` pattern.

**Done when:** scheduling with the queue full fills the next free slot and not an occupied one, and the defaults
differ from UTC by exactly SAST.

### Feature 5 — Guards (from FeedHive's post conditions)

**Story.** The 11-language promise must be enforceable, or it is just marketing.

**Behaviour.** Before publishing, guards run and can hold a post. v1 ships exactly three, deliberately simple:

| Guard | Holds when | Says |
|---|---|---|
| `proofread-required` | post language ≠ English and no human approval recorded | "Holding: isiZulu draft not yet approved" |
| `credits-available` | wallet < 1 credit | "Holding: no credits left — top up to send" |
| `media-within-limits` | image or caption exceeds the platform's limit | "Holding: image is 9 MB, Instagram's limit is 8 MB" |

Surfaced as **plain sentences on the post**, never a logic builder. The message names the fix.

**Done when:** each guard independently holds a post with its sentence visible, and clearing the cause releases
it without re-creating the post.

---

## 4. The prepaid wallet (assumption A2)

Credit ledger entries are append-only (`credit_entries`: user, delta, reason, ref). A wallet balance is the sum,
never a mutable column that can drift. Top-ups arrive from a Paystack webhook, verified by HMAC-SHA512 with a
constant-time compare and an idempotency key — the adapter already built, reused rather than rewritten.

**Never:** credits deducted on generation (only on successful publish), credits going negative, or a webhook
crediting twice.

---

## 5. Error handling, generally

Every failure carries three things: what happened, why, and what the user can do. "Something went wrong" is
banned in code review. Provider errors are stored verbatim in `post_attempts.errorMessage` and translated to
plain language at the surface. Nothing fails silently — a swallowed error is a support ticket that arrives
three weeks later.

## 6. Testing

- **No live provider calls in tests.** A fake provider implements `publish` / `checkStatus` /
  `publishingLimit` and can be told to fail, hang, or return pending.
- **TDD per feature**, RED first: each "done when" above becomes a test that fails before the code exists.
- **Contract tests** for the provider interface: every real provider must satisfy the fake's contract.
- **Idempotency test is mandatory** — the same attempt key sent twice must produce one post.
- **Time is injected**, never read from the clock directly, so slot and cadence tests are deterministic and
  SAST-correct.

## 7. Build order and release slicing

Each slice is a separate release through the gold pipeline, smallest verifiable increment first.

| Slice | Contains | Flag | Why this order |
|---|---|---|---|
| S1 | Wallet (credits append-only ledger + Paystack webhook reuse) | — | Everything metered depends on it, and feature 3's sends will be metered. |
| S2 | Publish pipeline v2 (state machine, attempts, preflight, reconciler) | `FEATURE_PUBLISH_V2` | Correctness. A duplicate post is the one failure that embarrasses the customer. |
| S3 | Slots + SAST defaults | `FEATURE_SLOTS` | Small, visible, and S2 needs slots to place posts. |
| S4 | The drip | `FEATURE_DRIP` | Depends on S2 and S3. |
| S5 | Guards | `FEATURE_GUARDS` | Depends on S2; makes the language claim enforceable. |
| S6 | Recap link | `FEATURE_RECAP` | Independent of the rest; ships last because it is the cheapest and easiest to copy. |

**Gates per slice:** AI Blueprint feature → implement → check → audit, then the gold pipeline's design-only or
full track depending on whether logic changed, then `npx impeccable detect`, `mergeproof ui` at 390/768/1440,
`check-brand.py --url` on every touched page, and finally the flag flipped on the live demo.

## 8. Risks

1. **WhatsApp unverified (high).** Do not promise API publishing. Spike first.
2. **Meta rate limits move (medium).** Preflight reads the live limit; no hardcoded caps in logic or copy.
3. **Paystack VAT wording contradicts itself (medium).** Confirm in writing before pricing copy ships.
4. **Free-tier AI quality across 11 languages (medium).** Feature 5 mitigates by requiring human approval;
   still, per-language output quality needs a manual read before launch.
5. **Scope creep into approvals/seats (low, but it killed earlier attempts).** The non-goals in §1 are binding.

## 9. Definition of done for the whole programme

All six slices shipped behind flags, all flags on, `check-brand.py` clean on every page, `mergeproof ui` green
at three widths, the four public verification checks passing (schedule → publish → retry-safe; drip wraps;
recap opens logged out; each guard holds and releases), and no copy claiming anything unverified.
