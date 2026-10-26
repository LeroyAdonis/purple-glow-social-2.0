# Postiz — what we can take, and what we must not

**Reviewed:** 2026-10-26 · **Postiz version:** `v1.47.0`, HEAD `a5affe6` (2026-10-24)
**Source read:** `git clone --depth 1 https://github.com/gitroomhq/postiz-app` → `/tmp/postiz`
**Method:** ordinary source-repository analysis. The `reverse-engineer-anything` skill routes *shipped
binaries and packages* to decompilation and explicitly says to skip that route for "ordinary source-repository
architecture analysis" — Postiz is a public source repo, so nothing was decompiled and nothing needed to be.

---

## ⛔ Read this before anyone copies a line

**Postiz is licensed AGPL-3.0.** Verified: `/tmp/postiz/LICENSE` is the GNU Affero General Public License v3.

What that means for Posta in plain terms:

| Action | Allowed? |
|---|---|
| Read Postiz to understand how a feature works | ✅ Yes |
| Reimplement that feature ourselves, in our own code | ✅ Yes — behaviour and ideas are not copyrightable |
| Run unmodified Postiz as its own separate service | ✅ Yes, but it stays AGPL and must offer its source to its users |
| Copy Postiz source into Posta | ❌ **No** — this makes Posta a derivative work and AGPL-3.0 applies to all of Posta |
| Modify Postiz and offer it as a network service | ⚠️ Yes, but you must publish the modified source to those users |

AGPL's network clause is the one that bites a SaaS: if Posta contained Postiz code, every Posta customer
would be entitled to Posta's complete source. That destroys the product's IP position.

**Rule for this repo: borrow the feature list, never the code.** If a specific algorithm looks worth
copying verbatim, that is a decision for Leroy with legal input, not an agent's call.

---

## What Postiz actually is

| | Postiz | Posta today |
|---|---|---|
| Version / maturity | v1.47.0, large OSS project | internal product, pre-launch |
| Frontend | Next.js | Next.js (App Router) ✅ same |
| Backend | NestJS, separate app | Next.js route handlers |
| Database | Prisma + PostgreSQL | Drizzle + PostgreSQL ✅ same DB |
| Queue / scheduling | Redis + **Temporal** workflows | **Inngest** |
| Social providers | **36** | **4** (Facebook, Instagram, X, LinkedIn) |
| Repo shape | Nx monorepo (`apps/`, `libraries/`) | single Next.js app |

Nothing here is a migration argument. The stack overlaps enough that the *concepts* port cleanly; the code
does not, and should not.

---

## The 36 providers — the single biggest gap

`libraries/nestjs-libraries/src/integrations/social/`:

```
bluesky  dev.to  discord  dribbble  facebook  farcaster  gmb  hashnode  instagram  instagram.standalone
kick  lemmy  linkedin  linkedin.page  listmonk  mastodon  mastodon.custom  medium  mewe  moltbook
nostr  pinterest  reddit  skool  slack  telegram  threads  tiktok  tiktok.business  tumblr  twitch
vk  whop  wordpress  x  youtube
```

**Ranked for the SA SME market we are actually selling to:**

1. **Threads** — every Instagram-first SA business already has the account. Lowest effort, highest overlap.
2. **TikTok** (business + personal) — the channel SA SMEs ask for most after Instagram.
3. **YouTube Shorts** — the same vertical video, one more upload target.
4. **Telegram** — trivial API, and it doubles as our own alerting channel.
5. **Bluesky / Mastodon** — cheap, and they make the "36 platforms" claim look credible.
6. **Pinterest** — real for SA food, décor and wedding businesses.
7. **Google Business Profile (gmb)** — arguably worth more to a SA plumber or salon than LinkedIn.
8. **WordPress / Medium / dev.to / Hashnode** — only if we sell to agencies.
9. Skip for now: nostr, farcaster, lemmy, mewe, moltbook, skool, whop, vk, kick, dribbble, twitch, listmonk.

Each provider is the same shape we already have in `lib/oauth/*-provider.ts` + `lib/posting/*-poster.ts`:
OAuth exchange, token refresh, a publish call, a media-upload call. Realistically **1 provider = half a day
to a day** including the token-refresh path and a live test post.

---

## Features worth taking, in the order I would build them

### 1. Plugs + Signatures — auto-append to every post (cheap, sells well)
Postiz models: `Plugs`, `ExisingPlugData`, `Signatures`.

A saved snippet that is appended or prepended automatically to posts on chosen channels: a UTM-tagged link,
a phone number, opening hours, a promo line, a hashtag block. For a SA SME this is the difference between
"posted" and "posted and actually trackable". Small feature, obvious paid-tier value.

**Effort: ~1 day.** One table, one settings screen, one transform in the publish path.

### 2. Real post analytics — finish the stub we already have
Postiz models: `Star`, `PopularPosts`, `Mentions`, plus `apps/frontend/src/components/analytics` and
`platform-analytics`.

**Posta is closer than it looks, and the gap is precisely measurable.** `lib/ai/analytics-service.ts` already
has the table, the engagement-score maths and a batch updater; what is missing is the part that talks to the
platforms:

- `post_analytics` table exists and holds **0 rows** (checked in the live DB, 2026-10-26).
- `fetchPlatformAnalytics()` is a **stub that returns `null`**, carrying its own TODO list: Instagram Graph
  insights, Facebook Graph insights, Twitter metrics, LinkedIn share statistics.
- `batchUpdateAnalytics()` is **never called** — no Inngest job drives it.
- The only writer is `POST /api/ai/analytics`, so metrics can only arrive if someone posts them in by hand.

So this is not "build analytics", it is "**fill in one function and put it on a schedule**" for the two
channels we already support (Facebook + Instagram). That is a far smaller job than the empty table suggests.

**Effort: ~2 days** for Facebook + Instagram insights and an Inngest refresh job, including one honest chart.
Each extra channel adds roughly a day.

### 3. Short links + click tracking
Postiz: `libraries/nestjs-libraries/src/short-linking/` with pluggable providers.

A `posta.link/r7x2` style shortener on our own domain, wired into Plugs, with click counts per post. This is
the measurement SMEs can understand, and our domain buys us the awareness too.

**Effort: ~2 days** (route + counter + a redirect table; no third-party dependency needed).

### 4. Approval flow + comments (the agency tier)
Postiz: `Comments`, `Organization`/`UserOrganization`, and a team model.

Draft → "needs approval" → a colleague or the client signs off → scheduled. Guarded by role. This is the
single feature that lets us charge an agency 5× a solo business, and it is a workflow, not an integration.

**Effort: ~3 days** for a single-approver version; multi-tenant orgs on top are a bigger job.

### 5. Autopost sets — we already have the bones
Postiz: `Sets` + `AutoPost`. Posta already has `automation_rules` (frequency, coreTopic, platforms, isActive),
which is the same idea. The gap is the *content source*: Postiz's set ties a recurring schedule to content
that keeps flowing (RSS, a queue, a template set).

**Effort: small** — extend the existing rule with a content source rather than building a parallel concept.

### 6. Public API + webhooks
Postiz: `apps/frontend/src/components/public-api`, `Webhooks`, `IntegrationsWebhooks`, `OAuthApp`,
`OAuthAuthorization`. They run a whole third-party-developer programme.

Only worth building once we have customers asking. It is a platform play, not a launch feature.

### 7. What I would NOT take
- **Temporal** — Postiz uses it for durable workflow orchestration. Inngest already does this for us, with
  none of the operational weight.
- **Prisma** — we are on Drizzle and it works.
- **NestJS backend split** — Next.js route handlers are enough at our size, and a second app is another
  thing to deploy, monitor and pay for.
- **AI video (HeyGen, ReelFarm)** — `libraries/nestjs-libraries/src/integrations/3rdparties/`. Paid
  per-render. Goes against the zero-cost constraint we just set for image generation.
- **Their agent / trending / newsletter modules** — nice, not what our buyers lose sleep over.

---

## One architectural idea worth stealing (not code, the pattern)

Postiz keeps each platform behind a single `social.integrations.interface.ts` contract. Every provider
implements the same interface, and the scheduler never knows which platform it is publishing to.

Posta already half-does this (`lib/posting/post-service.ts` dispatches to four posters). Formalising it into
one interface with a registry is what makes adding provider #5 and #6 an afternoon instead of a refactor.
**Do this before adding channels, not after.**

---

## Verdict

**Take the feature list, not the codebase.** The three that would move Posta from "scheduler" to "something a
business pays for monthly" are **Plugs/signatures**, **real post analytics**, and **short links with click
tracking** — roughly one week of work between them, and none of them need a new paid API.

Before any Posta launch: confirm the AGPL position is understood by whoever reviews the product, and keep
this file as the record that the boundary was drawn deliberately.
