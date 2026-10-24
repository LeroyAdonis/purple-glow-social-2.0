# COMPETITOR-TECH — technical product surface (reverse-engineered)

Date compiled: 24 October 2026. Evidence rule: every technical claim below cites a file path, URL, or observed request. Cells marked `unknown` mean not verified — not a guess.

## A. Postiz (gitroomhq/postiz-app) — real feature inventory

Source: clone at `/tmp/postiz-app` (shallow, `git clone --depth 1 https://github.com/gitroomhq/postiz-app`). Read code, not README, for the items below.

### A.1 Supported platform integrations (36 providers)

Evidence: `libraries/nestjs-libraries/src/integrations/social/*.provider.ts` (one file per platform) plus `social.integrations.interface.ts` defining `SocialProvider`.

Full list (identifier → file):
- bluesky, dev.to, discord, dribbble, facebook, farcaster, gmb (Google Business), hashnode, instagram, instagram.standalone, kick, lemmy, linkedin, linkedin.page, listmonk, mastodon, mastodon.custom, medium, mewe, moltbook, nostr, pinterest, reddit, skool, slack, telegram, threads, tiktok, tiktok.business, tumblr, twitch, vk, whop, wordpress, x, youtube.

Interface contract (`social.integrations.interface.ts`): `post()`, optional `postPending()`/`comment()`, `checkPostStatus()`, `finalizePost()`, `maxLength()`, `checkValidity()`, `mention()`, `analytics()`/`postAnalytics()`, `scopes`, `editor` (`none|normal|markdown|html`), `maxLength`. Note the pending→finalize two-phase publish pattern for platforms that need async processing.

### A.2 Scheduling / queue concepts

Evidence: `libraries/nestjs-libraries/src/database/prisma/schema.prisma` model `Post` + `posts.service.ts` + `integration.service.ts` + frontend `repeat.component.tsx`.

- State machine: `State { QUEUE, PUBLISHED, ERROR, DRAFT }` (`schema.prisma`).
- `publishDate DateTime`, `delay Int @default(0)` (per-channel stagger inside a batch), `intervalInDays Int?` (recurring).
- Recurrence options shipped in UI (`repeat.component.tsx`): 1,2,3,4,5,6,7 (week), 14 (two weeks), 30 (month) days, or cancel. Stored as `intervalInDays`.
- `parentPostId` self-relation → threaded posts / comment chains (`arrangePostsByGroup` in `posts.service.ts`).
- `batchId` → one logical post fanned out across multiple channels; siblings filtered by same `intervalInDays`.
- `postingTimes` per integration (default `[{"time":120},{"time":400},{"time":700}]` minutes from midnight) — per-channel "best time slots". Evidence: `schema.prisma` line ~387, `integration.repository.ts` lines 132/338/1006.
- `findFreeDateTime` / `find-slot` endpoint (`posts.controller.ts` `@Get('/find-slot')`, `posts.service.ts` `findFreeDateTime` + `findFreeDateTimeRecursive`) — scans posting-time slots day by day (up to 365 days) until a slot with lowest existing post count is free.
- `delay` field used to stagger channels in a batch (observed in `getPostsByGroup`).
- No "recycle evergreen" or "drip campaign" concept found in code (searched `recycle`/`drip` — no hits). FeedHive-style recycle is NOT in Postiz.

### A.3 AI features and providers

Evidence: `libraries/nestjs-libraries/src/openai/openai.service.ts`, `agent/agent.graph.service.ts`, `database/prisma/autopost/autopost.service.ts`.

- Provider: OpenAI only (env `OPENAI_API_KEY`). Models: `gpt-4.1` for text (post generation, threads, clip picking, voice text, website extraction, slide generation), `chatgpt-image-latest` for image generation. Optional Tavily web search when `TAVILY_API_KEY` set.
- Agent graph (`agent.graph.service.ts`): LangGraph `StateGraph`, generates multiple posts in formats `one_short|one_long|thread_short|thread_long`, tones `personal|company`, optional image via DALL-E wrapper, can pull popular posts from DB.
- Autopost (`autopost.service.ts`): RSS feed monitoring → LangChain `ChatOpenAI` gpt-4.1 generates post + DALL-E image; runs as Temporal workflow `autoPostWorkflow`.
- Clipping: video → clips via OpenAI gpt-4.1 over transcript; HeyGen integration (`3rdparties/heygen/heygen.provider.ts`) for avatar video.
- No Gemini/Anthropic/Ollama found in repo (grep returned only OpenAI).

### A.4 Billing model and feature gating

Evidence: `libraries/nestjs-libraries/src/services/payment/payment.provider.interface.ts`, `payment.providers.ts`, `services/stripe.service.ts`, `database/prisma/subscriptions/pricing.ts`, `billing.controller.ts`.

- Providers: Stripe (web, `STRIPE_PROVIDER`) + RevenueCat (mobile, `REVENUECAT_PROVIDER`). Webhooks at `/stripe`.
- Tiers (`SubscriptionTier` enum): STANDARD, PRO, TEAM, ULTIMATE (+ FREE). Prices USD/month: STANDARD $29, TEAM $39, PRO $49, ULTIMATE $99 (yearly ~10x discount). Evidence `pricing.ts`.
- Gated features per tier (`PricingInnerInterface`): `channel` (connected accounts), `posts_per_month`, `ai`, `import_from_channels`, `image_generator`, `image_generation_count`, `public_api`, `webhooks`, `autoPost`, `generate_videos`, `clipping_minutes`, `team_members`, `community_features`, `featured_by_gitroom`. FREE has all false/0.
- Enforcement: `@CheckPolicies([AuthorizationActions.Create, Sections.POSTS_PER_MONTH])` on post creation (`posts.controller.ts`).
- Additional: lifetime deal endpoint, coupons, proration, cancel-at-period-end, portal link, invoices (provider-neutral `PaymentInvoice`).

### A.5 Analytics surface

Evidence: `apps/backend/src/api/routes/analytics.controller.ts`, `integration.service.ts` `checkAnalytics`, `posts.service.ts` `checkPostAnalytics`/`getStatistics`.

- Per-account: `GET /analytics/:integration?date=N` → `integrationProvider.analytics(id, token, days)` cached in Redis (`integration:{org}:{integration}:{days}`, TTL 3600s prod / 1s dev). Returns `AnalyticsData[]` (label, data[{total,date}], percentageChange).
- Per-post: `GET /analytics/post/:postId?date=N` → `postAnalytics(integrationId, token, postId, fromDate)`.
- Link clicks: `GET /posts/:id/statistics` → `ShortLinkService.getStatistics` over post content (short-link tracking).
- Provider-specific: only platforms whose provider implements `analytics()`/`postAnalytics()` (interface optional). Not verified which of the 36 do.

### A.6 Other surfaces observed

- Public API module (`apps/backend/src/public-api/`), MCP client icons (`mcp.client.icons.tsx`) → Postiz ships an MCP server and REST API.
- Webhooks (pricing `webhooks` count per tier).
- Short linking (`libraries/.../short-linking`, provider `linkdrip`).
- Media processing (`upload/media.processor.interface.ts`, clipping).
- Chrome extension app (`apps/extension`).
- Clipping / video generation pipeline (`clipping.service.ts`, `generate.video.workflow.ts`).

## B. Feature matrix

Columns: Postiz (code-verified) / Predis.ai (marketing + bundle) / Ocoya (marketing) / FeedHive (marketing) / us-would-need (Posta current). Cells: shipped / gated / not present / unknown. Unknown accepted.

| Capability | Postiz | Predis.ai | Ocoya | FeedHive | us-would-need |
|---|---|---|---|---|---|
| Social platforms supported | shipped (36 providers) | unknown (publish to 10/20/60 "channels"; marketing lists FB/IG/TikTok/YT/LI/Pinterest) | shipped (28 integrations listed) | shipped (FB/IG/YT/X/TikTok/LI/Pinterest/GB/Threads + Zapier/Discord/Make) | shipped (4: IG/FB/X/LI) — need Threads/Bluesky/TikTok/Pinterest/YT |
| Text-only post | shipped | shipped (ad copy) | shipped | shipped | shipped |
| Image post | shipped | shipped | shipped | shipped | shipped |
| Video post | shipped | shipped (Veo/Seedance/Kling) | shipped | shipped | unknown (image only today) |
| Carousel / multi-image | shipped | shipped | shipped | shipped (IG carousels) | unknown |
| Reels / Stories | shipped (IG) | shipped (reels/stories ads) | shipped (YT Shorts) | shipped (FB stories/reels, IG stories) | not present |
| Scheduling future date | shipped | shipped (calendar) | shipped | shipped | shipped |
| Recurring / repeat | shipped (1/2/3/4/5/6/7/14/30 days) | unknown | unknown ("months auto-scheduled") | shipped ("recycle posts") | not present (only one-off) |
| Per-channel stagger (delay) | shipped (`delay`) | unknown | unknown | unknown | not present |
| Posting-time slots / best time | shipped (per integration postingTimes + find-slot) | unknown | shipped ("auto-pick best times") | shipped ("best time slots") | partial (AI suggests; no slot calendar) |
| Cross-post one→many channels | shipped (batchId) | unknown | shipped | shipped | shipped (multi-platform select) |
| Threaded posts / replies | shipped (parentPostId) | unknown | unknown | shipped ("thread builder") | not present |
| Drafts | shipped (DRAFT state) | unknown | shipped | shipped | unknown |
| Auto-post from RSS/feed | shipped (autopost.service + Temporal) | unknown | unknown | unknown | not present |
| AI caption generation | shipped (gpt-4.1) | shipped (19+ langs) | shipped (37 langs) | shipped ("vibe marketing") | shipped (Gemini) |
| AI image generation | shipped (chatgpt-image-latest) | shipped (Veo/Gemini/etc) | shipped | shipped (Flux Pro, Nano Banana 2) | not present (no image gen) |
| AI video generation | shipped (clipping + HeyGen) | shipped (core product) | shipped | unknown | not present |
| Hashtag generation | shipped (part of post gen) | shipped | shipped | shipped ("generate hashtags") | shipped |
| Multi-language content | shipped (prompt-driven, no fixed list) | shipped (19+) | shipped (37) | unknown | shipped (11 SA langs) |
| Per-account analytics | shipped (optional provider.analytics) | shipped (ad performance) | shipped | shipped ("performance stats") | not present |
| Per-post analytics | shipped (postAnalytics) | shipped | shipped | shipped | not present |
| Link click tracking | shipped (short links) | unknown | unknown | shipped (LinkDrip) | not present |
| Social inbox / comment mgmt | unknown (comment API exists) | unknown | shipped | shipped | not present |
| Team roles / collaboration | shipped (team_members tier) | shipped (workspaces) | shipped (users 1/5/20) | shipped (team roles) | not present |
| Approval flows | unknown | shipped (content approval flow) | shipped | shipped (approval flows) | not present |
| Public API | shipped (public-api module) | shipped (Predis API) | shipped (REST + SDK) | shipped (REST API) | not present |
| MCP server | shipped (mcp.client.icons) | shipped (Predis MCP) | shipped (MCP) | shipped (MCP server) | not present |
| Webhooks | shipped (tier-gated count) | unknown | unknown | unknown | not present |
| Brand kit / voice | unknown | shipped (brand kits) | shipped | shipped (brand templates) | not present |
| Post recycling suggestions | not present | unknown | unknown | shipped ("recycle suggestions") | not present |
| Post conditions | not present | unknown | unknown | shipped | not present |
| Bulk scheduling | unknown | unknown | unknown | shipped | not present |
| Billing model | shipped (Stripe + RevenueCat; 5 tiers) | shipped (credits + tiers; auto-post gated) | shipped ($29/$79/$199; credits) | unknown (pricing not in bundle) | shipped (credits + tiers) |

Notes on Predis.ai bundle (`/tmp/predis.js`, 566 KB from `https://app.predis.ai/assets/index-0187b807.js`): only strings recovered: `autoPost`/`autopost` (16 hits), `scheduleDateTime`, `schedule_id`, `published`, `scheduled`, `sharePlatforms` map with publish flags per platform (ig/igs/fb/fbr/li/pi/gmb/tt/twt/yt), `postPublishNudge`, `calendarEmptyNudge`. No endpoint paths recovered (calls go to `brain.predis.ai`, paths not in bundle). Marked unknown above accordingly.

## C. Platform API traps (current as of 24 Oct 2026)

### Instagram Graph API (Content Publishing)
- Publishing cap: 100 API-published posts per 24h rolling window (Meta docs contradict themselves — carousel section says 50). Carousels count as 1. Source: https://developers.facebook.com/documentation/instagram-platform/content-publishing (updated 30 Jun 2026); contradiction flagged by https://bundle.social/blog/instagram-api-rate-limits (mirror dated 3 Aug 2026).
- Rate limit: 200 calls/user/hour (BUC), platform limit 200 × N users/app/hour; headers `X-App-Usage`, `X-Business-Use-Case-Usage`.
- Text-only posts NOT supported — every post needs image/video. Source same doc.
- Hashtag search: 30 unique hashtags per 7 days per account.
- Deletion: `DELETE /{ig-media-id}` now documented (Dec 2025, needs `instagram_manage_contents`) but unreliable in practice — error subcode 2207085 "Generic Internal Error" reported by multiple devs as of mid-2026. Source: https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media (Deleting section) + community threads (842519195511758, 1065249949783421). Our prior error 100/subcode 33 predates this API; treat deletion as "attempt, expect failure, fall back to mark-deleted-locally".
- Trial Reels + paid partnership label (`branded_content_sponsor_ids`, `is_paid_partnership`) added Apr 2026.
- Breaking: Basic Display API deprecated/EOL → all scheduling must use Content Publishing endpoints requiring professional account + token refresh.

### Facebook Pages (Graph API)
- Posting cap: 25 posts/Page/24h rolling. Source: https://postproxy.dev/blog/social-media-platform-api-rules-rate-limits-media-specs (2026) and bundle.social.
- Rate limit: 4800 × engaged users / 24h for Page-token requests.
- Text limit: 63,206 chars technical max; truncated at ~125 with "See More".
- Media: image JPEG 8 MB, 4 photos per feed post (no mixing with video); video MP4, 24–60 FPS; Facebook image limit actually 4 MB per bundle.social "Facebook Posting API" — conflicting; verify before shipping.
- Deletion: `DELETE /{page_post_id}` supported but ONLY for posts created by the same app. Source: https://developers.facebook.com/documentation/pages-api/posts (updated 17 Apr 2026).
- Breaking: Groups API removed 22 Apr 2024 (no group posting). Page reach/post reach/video impressions/story impressions metrics error after v26.0 release (15 Jun 2026). Messenger tags CONFIRMED_EVENT_UPDATE/ACCOUNT_UPDATE/POST_PURCHASE_UPDATE fail error 100 from 27 Apr 2026.

### X (Twitter) API v2
- Posting: `POST /2/tweets` 10,000/24h per app, 100/15min per user; delete `DELETE /2/tweets/:id` 50/15min per user.
- Text limit: 280 chars (standard).
- Pricing (pay-per-use): $0.015 per link-free post, $0.20 per post containing a URL, $0.01 per delete. Free tier closed to new signups? Legacy Basic/Pro closed to new signups; pay-per-use read cap 2M posts/month.
- Breaking 20 Apr 2026: engagement writes (follow/like/quote-post via `quote_tweet_id`) removed from all self-serve tiers — endpoints withdrawn, not repriced.
- Media upload: v2 endpoint `/2/media/upload` rolling out; v1.1 upload path still common; chunked (5–64 MB chunks, final up to 128 MB), upload URL valid 1h.
- Trap: "daily tweet creation cap" can stay at 17 even after upgrading to pay-per-use (dev forum report) — verify limits reset.

### LinkedIn (Posts API)
- Endpoint: `POST /rest/posts` (replaced `ugcPosts`/`shares`); requires `Linkedin-Version: YYYYMM` header (latest 202610), min 1 year support. Missing/deprecated version → error.
- Commentary max 3,000 chars; supports #hashtag and @Name.
- Media: image/video/document; multi-image 2–20. Cannot swap media after publish — delete + recreate.
- Deletion: `DELETE` by URN, idempotent (204); no batch delete.
- Rate limits: daily per app and per member, reset midnight UTC; standard limits not published (read in Developer Portal Analytics after first call). Community Management Dev tier defaults: 500 app / 100 member requests. Older Share-on-LinkedIn lists 150 member / 100,000 app.
- Access gate: LinkedIn Partner Program application (Company Page required), review weeks–months. Self-serve `w_member_social` covers member's own feed only.
- Breaking: Marketing API version sunsets (202402 Feb 2025, 202408 Aug 2025); rate-limit alert emails at 75% of daily app quota (Sep 2025).

## D. Cheap capabilities (Postiz has solved the hard part — learn, don't copy)

1. Posting-time slots + `find-slot`: store per-account `postingTimes` (minutes-from-midnight) and scan day-by-day for the freest slot. Low effort, high value for "best time".
2. Recurring posts via `intervalInDays` + `parentPostId` threading: a single nullable column drives repeat; threads are just self-referential rows.
3. Per-channel stagger via `delay` inside a `batchId`: one logical post, per-channel offsets.
4. Two-phase publish (`postPending` → `checkPostStatus` → `finalizePost`) for platforms needing async media processing — avoids duplicate posts on retry (contract documented in interface).
5. Provider analytics abstraction: optional `analytics()`/`postAnalytics()` on the provider interface; cache results in Redis with short TTL; graceful no-op when unsupported.
6. Short-link click tracking folded into post statistics.
7. IG preflight: query `GET /<IG_ID>/content_publishing_limit` before scheduling to avoid the 100/24h wall.
8. Token refresh as a scheduled job (Postiz: every 6h) + expired-state handling in analytics paths.
9. Deletion reality: only attempt delete on posts your own app created; keep a local "deleted" flag as fallback (IG/FB both unreliable).
10. LinkedIn version-header discipline: centralize `Linkedin-Version` so it can be bumped in one place.

## E. What we could not verify (do not treat as fact)

- Predis.ai / Ocoya / FeedHive internals: no authenticated bundle access; only marketing copy and (Predis) one public JS bundle. Endpoint paths, feature flags, and plan-gating strings for those three are NOT verified. Predis bundle yielded only `autoPost`/`scheduleDateTime`/platform publish-flag map — no API routes.
- Which of Postiz's 36 providers actually implement `analytics()`/`postAnalytics()` — not checked (would need reading each provider file).
- Postiz version/commit date of the clone (shallow clone; `version.txt` present but not read). Flag stale risk: code is a snapshot, may lag current Postiz.
- Facebook image size conflict (4 MB vs 8 MB) unresolved — verify against Meta docs before shipping.
- LinkedIn "standard" rate limits are not published; Community Management Dev defaults only.
- X free-tier daily cap behavior after upgrade (17/day anomaly) — from forum, not docs.
- Whether Postiz ships "approval flows"/"social inbox"/"brand kit" — not found in code search; possibly frontend-only or absent. Marked unknown in matrix.
- FeedHive pricing (not shown in marketing).
- Our own Posta capabilities beyond what AGENTS.md states (e.g. image generation, video) marked unknown where not verified in code.