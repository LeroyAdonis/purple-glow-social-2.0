# Posta — competitive cherry-pick

**Verdict, 25 October 2026.** Yes, the direction is right: take the one thing each competitor actually wins at
and give it a Mzanzi spin. But with one correction that matters — **copy the job they win, not their feature
list.** Feature breadth is how a small team loses a year. Buffer has 4 billing models we don't need; Postiz
supports 36 platforms we can't support well. What we take is the *specific mechanism* that makes their version
better than ours, and only where it lands on a gap Posta can own.

Evidence base: `COMPETITIVE-LANDSCAPE.md` (9 vendors, 340 cited URLs, 38 explicit "not verified" flags) and
`COMPETITOR-TECH.md` (Postiz code-verified: 370-asset bundle, 136 endpoints, 36 providers).

---

## 1. Who wins at what — the honest scoreboard

| Competitor | What they genuinely win at | Do we want it? |
| --- | --- | --- |
| **Buffer** | Pricing that gets *cheaper* per channel as you grow (1–10: $6 → 51+: $1), and unlimited free AI on every plan including Free | **The pricing shape, yes.** Our credit model has no "cost per account falls as I grow" story. The AI-at-R0 claim we cannot make yet. |
| **Metricool** | **Shareable live client report** — automated, PDF/PPT, monthly auto-send, "share with a live URL", your logo and colours. Plus 5 competitors tracked even on Free | **The report, yes.** Not the competitor tracking — that is a different product. |
| **SocialBee** | **Category-based evergreen recycling**: every post belongs to a category with slots and a cadence; set one to Evergreen and it re-queues after publishing, so a library rotates forever without re-scheduling | **Yes — highest fit for our buyer of anything in this report.** |
| **FeedHive** | **Post conditions** — first-party rules that decide whether a post goes out based on state. Plus recycling *suggestions* for already-published posts | **Conditions, yes.** Cheap, and it protects the 11-language promise. |
| **Later** | Visual Instagram-first planner, Best Time to Post per platform, per-profile quotas (30→180→unlimited per profile per month) | **Best-time slots, yes** (see Postiz below — cheaper to build). Rest is creator-commerce, not our market. |
| **Publer** | Per-member **and per-account** approval levels, many brands in one plan, $5 entry | **No.** We are deliberately gap #10: no seats, no approvals to start. Revisit only when agencies ask. |
| **Vista Social** | Widest SaaS network list (13) with AI credits on every tier; add-on Listening/Advocacy products | **No.** Breadth is a tax with no SA payoff. |
| **Hootsuite** | Enterprise governance: approval workflows, access levels, FedRAMP, HIPAA, unified inbox incl. WhatsApp | **No.** Regulated enterprise is not our fight and cannot be bought for R299. |
| **Postiz** (open source, code-verified) | The *engineering* answers: two-phase publish, posting-time slots with `find-slot`, `intervalInDays` recurrence, per-channel `delay` stagger, IG `content_publishing_limit` preflight, token-refresh job | **Yes to all of it.** This is the "learn, don't copy" list — the mechanisms, not the product. |

---

## 2. The five cherry-picks, ranked by leverage

Ranked by *defensibility × how invisible the failure is without it × effort*. All five are small-to-medium.

### Pick 1 — Two-phase publish, a preflight, and an honest queue (from Postiz)

**What they do:** publishing is not one call. It is `postPending` → poll `checkPostStatus` → `finalizePost`,
so a platform that processes media asynchronously cannot be double-published by a retry. Before scheduling they
query `GET /<IG_ID>/content_publishing_limit` to avoid Instagram's 100-posts-per-24h wall (Meta's own docs
contradict themselves on whether carousels count as 50 — treat 100 as the cap and check).

**Why it matters more than any UI feature:** a duplicate post on a client's Instagram is the single most
embarrassing failure this product can produce, and it happens *silently*, exactly once, at the worst time. A
queue that says "queued safely" and means it is also the only way gap #6 ("publishing that survives the device
being off") becomes a product promise instead of a claim.

**Our spin:** none needed on the mechanism — it is correctness. The spin is the *surface*: every scheduled post
carries a plain-language state ("Queued safely — sends even if your phone is off", "Instagram limit reached,
we'll send at 09:14 tomorrow"), which no competitor shows in words.

**Effort:** medium. **Verdict: build first.**

### Pick 2 — The drip, from SocialBee's evergreen recycling

**What they do:** posts belong to **categories** with their own cadence and slots; "Evergreen" re-queues a post
to the back of its category after it publishes, so a library keeps rotating with no re-scheduling.

**Why it fits us:** our buyer is one person on one phone who does not want to think about a calendar. Ten good
posts that circulate forever beat a hundred drafts nobody approves. This is the highest-value feature in the
whole report for a spaza shop or salon.

**Our spin — "the drip":** categories are **SA vertical packs** (Salon, Spaza, Shebeen, Food, Events), and
recycling is *language-aware*: the same evergreen idea can rotate in isiZulu on Monday and English on Thursday,
with the proofread status carried on each rotation. Nobody else can do the language half.

**Effort:** medium (one nullable column + a slot calendar). **Verdict: build second.**

### Pick 3 — A recap link that travels over WhatsApp, from Metricool's live report

**What they do:** automated reports, PDF/PPT export, monthly auto-send, and **"share with a live URL"** in the
client's own logo and colours, from the Starter tier up. A freelancer sends a *link*, not a file.

**Why it fits us:** it is the only feature here that makes our user look good to *their* customer, which is how
a R99/month tool gets renewed. And the delivery channel is obvious: our user's clients live on WhatsApp (gap #2).

**Our spin:** a **no-login weekly recap link** — views, best-performing language, what is queued for next week —
deliverable as a WhatsApp message, branded with the *customer's* logo, not ours. Metricool's version assumes
email and a desktop; ours assumes a phone and a chat.

**Effort:** small-medium. **Verdict: build third.**

### Pick 4 — Real posting slots instead of "AI suggested a time" (from Postiz + Later)

**What they do:** Postiz stores per-account `postingTimes` (minutes from midnight) and a `find-slot` scan for the
freest slot; Later sells "Best Time to Post" as a headline feature. We currently have a Gemini suggestion and
no slot calendar at all.

**Our spin — SAST-shaped slots:** default slot patterns built from local behaviour rather than a global average:
grant-payment week, month-end, Friday afternoon, payday weekend. Language-aware frequency too (a isiZulu
audience on a Soweto salon does not read at the same hours as an English one in Sandton). Cheap to build,
immediately visible in the UI, and it makes the queue honest.

**Effort:** small (the Postiz mechanism is a nullable int column and a scan loop). **Verdict: build fourth.**

### Pick 5 — Post conditions as *guards* (from FeedHive)

**What they do:** rules that decide whether a post publishes, based on state.

**Why it fits us:** we promise 11 languages *with a human proofread*. A promise is only real if the system can
refuse to publish. Conditions give us "do not publish unless the proofread is approved", "skip if credits < 1",
"hold if the image is over the platform limit".

**Our spin:** guards are surfaced as plain sentences on the post, not a logic builder — "Holding: isiZulu draft
not yet proofread". The proofread promise becomes enforced, not aspirational. This is the cheapest way to make
our one true differentiator auditable.

**Effort:** small. **Verdict: build last of the five, because it depends on 1 and 2 existing.**

---

## 3. What we deliberately do NOT copy

- **Enterprise approvals, workspaces, seats** (Hootsuite, Publer) — contradicts gap #10 and our buyer.
- **30+ platform breadth** (Postiz 36, Vista 13) — every extra network is a support burden and an API trap; the
  traps in `COMPETITOR-TECH.md` §C are warnings, not an invitation.
- **Competitor tracking** (Metricool's 100 competitors) — a different product with a different buyer.
- **AI image and video generation** (Predis, Ocoya, FeedHive) — per-image cost we cannot absorb on a R99 tier.
- **Link-in-bio / creator commerce** (Later) — not our market.
- **"Unlimited AI"** — we cannot honestly claim it on a credit model, and honest tiers are a brand rule.

## 4. The one pricing idea worth stealing from Buffer

Not their dollar amounts — their **shape**: cost per channel *falls* as the customer grows
(1–10: $6, 11–25: $4, 26–50: $3, 51+: $1). Our credit wallet can express the same promise in rands: the price
per connected account drops at 3, 6 and 10 accounts. It rewards exactly the behaviour we want (more accounts
connected → more posts published → stickier) without inventing a subscription tier.

## 5. Open items from the research, before any of this ships

1. **WhatsApp Channels publishing via the official API is unverified.** No Meta developer doc read exposes a
   Channels send endpoint. Resolve *before* the word "Channels" appears anywhere in product or marketing.
2. **Paystack's VAT wording contradicts itself** (support article says VAT exclusive, blog says inclusive) and
   `paystack.com/za/pricing` returned 403. Confirm in writing before pricing copy ships.
3. **Meta's Instagram carousel cap** — 100 or 50 per 24h? Their own pages disagree. Preflight covers it; do not
   state a number in copy.
4. **No competitor supports an African language for generation** (absence claim, scoped to the pages read).
   That is the wedge, and it is why Pick 5 matters more than its size suggests.
