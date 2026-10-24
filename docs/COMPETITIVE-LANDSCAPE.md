# Posta — Competitive Landscape

**Compiled:** 24 October 2026
**Scope:** the nine competitors named in the brief, plus supporting evidence for the gap analysis.
**Method:** read-only. Public pricing pages, product pages, help-centre articles, government and first-party sources. No trials started, no card details entered, no logins, no purchases.
**Rules applied throughout:**
- Every price, limit and feature claim carries the exact URL it was read on. No URL, no claim.
- Anything that could not be confirmed is written literally as **not verified**. Nothing here is guessed.
- Where a pricing page and a help-centre article disagree, both URLs are given and the disagreement is stated.
- No invented quotes, no invented market-size numbers, no "studies show".
- Anything published more than ~6 months before 24 Oct 2026 is flagged **[POSSIBLY STALE]** with its date.

---

## 0. Exchange rate used

All rand conversions in this document use a single rate, retrieved at the time of writing:

| Pair | Rate | Source | Retrieved |
|---|---|---|---|
| 1 USD → ZAR | **16.578102** | exchangerate-api.com, served by `https://open.er-api.com/v6/latest/USD` | Sat 24 Oct 2026, 00:02:31 UTC |
| 1 EUR → ZAR | **18.5690** (derived: 16.578102 ÷ 0.892784 EUR/USD from the same response) | same | same |

Converted figures are arithmetic only. They are **what the price works out to**, not what a South African
buyer will actually be charged — see §3 for why those differ.

---

## 1. Coverage table

One row per competitor. Free-tier and price figures are as published on the vendor's own pages on
24 Oct 2026; the ZAR column is the conversion at the rate in §0.

| Product | Who it is really for (its own words / plan shape) | Free-tier limit | Entry paid price → ZAR @16.578102 | Platforms | AI generation | African language | WhatsApp |
|---|---|---|---|---|---|---|---|
| **Buffer** | "For solo creators through to multi-brand agencies" — but priced **per channel**, 1 user on Free/Essentials ([source](https://buffer.com/pricing.md)) | **3 channels**, 10 *concurrent* scheduled posts per channel (slots refill), 100 ideas, 1 user, 30-day analytics; lifetime cap of 8 unique connections per network ([source](https://support.buffer.com/articles/buffer-pricing-and-features-6pJrOPuzIt)) | **$6/mo per channel** billed monthly → **R99.47**/channel/mo; **$5/mo per channel** billed yearly ($60/yr → R994.69/yr) → **R82.89**/channel/mo. 4 channels = $24/mo → **R397.87**. **USD only.** ([source](https://buffer.com/pricing.md), [currency policy](https://support.buffer.com/articles/why-was-i-charged-that-your-bill-taxes-and-vat-explained-YMilE1mo8m)) | **13 social networks** + Start Page (FB, IG, X, LinkedIn, Pinterest, TikTok, Google Business Profile, YouTube Shorts, Threads, Bluesky, Mastodon, Substack; + FB Groups / IG personal variants) ([source](https://buffer.com/pricing.md)) | **Yes — unlimited, on all plans including Free** (OpenAI). AI *comment replies* capped at 5/week on Free ([source](https://buffer.com/pricing.md)) | **No.** Web + iOS interface is English-only; Android lists 14 languages, **none African**. AI output language list **not verified** — Buffer publishes none ([source](https://support.buffer.com/articles/can-i-use-buffer-in-another-language-wetiyDOiI4)) | **No — explicitly unsupported**: "We don't currently have an integration with … **WhatsApp** …" ([source](https://support.buffer.com/articles/connecting-your-channels-to-buffer-HvWLgAJvL9)) |
| **Hootsuite** | Per-seat ladder capped at 10 accounts on entry, "majority of Fortune 1000", FedRAMP/HIPAA-friendly → **in-house enterprise & regulated teams** ([source](https://www.hootsuite.com/plans), [FAQ](https://www.hootsuite.com/faq)) | **None.** 14-day trial, "No credit card required", 10–20 posts/day trial cap, no bulk scheduling in trial ([source](https://www.hootsuite.com/plans)) | **$99 per user/mo, billed annually** (Standard) → **R1,641.23**/user/mo; implied annual ≈ $1,188 → **R19,694.79**/user/yr. Professional $199, Advanced $399. **Monthly price not published; explicit currency code not printed on the page → not verified** (USD strongly implied). ([source](https://www.hootsuite.com/plans)) | **9 named** in FAQ — FB, IG, X, LinkedIn, TikTok, YouTube, Threads, **WhatsApp**, Pinterest — plus Bluesky and Google Business on the integrations page ([source](https://www.hootsuite.com/faq), [source](https://www.hootsuite.com/platform/integrations)) | **Yes — "Wisdom" on every paid plan** (post + image generation). No free plan, so AI requires a paid plan or trial. In-product AI language list **not verified**; its free caption generator publishes EN/ES/IT/FR/DE only ([source](https://www.hootsuite.com/plans), [source](https://www.hootsuite.com/social-media-tools/ai-caption-generator-social-media)) | **No.** Display languages (snippet only, JS-rendered page): EN/FR/DE/IT/PT/ES/AR/JA — **none African**. Inbox "60+ languages" is *incoming-message detection*, not generation ([source](https://help.hootsuite.com/s/article/change-language) — snippet only, [source](https://help.hootsuite.com/s/article/language-detection) — snippet only) | **Messaging only, not publishing.** "Receive and respond to WhatsApp messages in Hootsuite Inbox." Whether it can publish/broadcast outbound posts = **not verified** ([source](https://www.hootsuite.com/platform/integrations)) |
| **Later** | "For casual scheduling" → "Enterprise-level analytics without the enterprise contract"; Instagram/TikTok-first visual & creator brands (nav segments: enterprise brands / social media managers / creators) ([source](https://later.com/pricing)) | **None on the pricing page** — three paid plans + 14-day trial, no card. *Disagreement:* Later's own [Caption Writer page](https://later.com/caption-writer) still says "If you're on Later's Free plan", contradicting the pricing page | **$18.75 USD/mo billed yearly** → **R310.84** (1 social set = 8 profiles, 1 user, 30 posts/profile/mo, **5 AI credits/mo**). Growth $37.50 → R621.68; Scale $82.50 → R1,367.68. **Monthly (non-annual) price not verified.** "Prices are billed in USD, applicable taxes are extra." ([source](https://later.com/pricing)) | **8** — Instagram, Facebook, Threads, Pinterest, TikTok, LinkedIn, YouTube, Snapchat. **X/Twitter is not in the current list** ([source](https://later.com/pricing)) | **Yes, but paywalled and metered** — Caption Writer + Ideas are paid-plans-only, 5/50/100 credits per month, beta, extra credits $3.75/mo per 100 (Growth+ only) ([source](https://later.com/pricing), [source](https://help.later.com/hc/en-us/articles/12252569781015-Later-s-Caption-Writer)) | **No — and this is the one explicit negative claim found.** "Caption Writer is **currently only available in English**." Interface: EN/ES/FR/DE desktop, English-only mobile **[POSSIBLY STALE — article shows "1 year ago"]** ([source](https://help.later.com/hc/en-us/articles/12252569781015-Later-s-Caption-Writer), [source](https://help.later.com/hc/en-us/articles/360042869154-What-Languages-Does-Later-Support)) | **Not listed anywhere** — absent from the 8-platform list, plan comparison and auto-publish list. An explicit Later statement of non-support = **not verified** ([source](https://later.com/pricing)) |
| **Metricool** | Solo creators → agencies; plans scale by **brands**, paid tiers push competitor analysis and automated client reports ([source](https://metricool.com/pricing/)) | **1 brand**, 1 profile per network, **20 posts/mo**, **all networks except LinkedIn and Twitter/X**, 5 competitor profiles, 30 days analytics, 5 AI credits/brand/mo ([source](https://metricool.com/pricing/)) | **Starter annual: €16/mo for up to 5 brands → R297.10**, or **$20/mo → R331.56**. Monthly: **€20 → R371.38** / **$25 → R414.45**. 10 brands: €29 annual / €37 monthly. **Currency toggle offers EUR and USD only — no ZAR** (checked: 0 matches for "ZAR"). Annual total not printed. Prices exclude VAT. ([source](https://metricool.com/pricing/)) | **13 named** in the plan matrix — FB, IG, TikTok, YouTube, LinkedIn, X, Pinterest, Telegram, Google Business Profile, Twitch, Threads, Bluesky, Mastodon. Exact printed total **not verified** (page states no number) ([source](https://metricool.com/pricing/)) | **Yes — on all plans including Free**, credit-metered: 5 / 20 / 35 credits per brand per month, **credits not purchasable separately** ([source](https://metricool.com/pricing/), [source](https://help.metricool.com/how-to-create-posts-with-metricools-ai-text-generator-sv0j8)) | **No.** Site switcher offers EN/ES/FR/DE/IT/NL/PT only (read directly on 24/10/2026). The AI flow has a "Select the language" step but **publishes no language list → not verified** ([source](https://metricool.com/pricing/), [source](https://help.metricool.com/how-to-create-posts-with-metricools-ai-text-generator-sv0j8)) | **No evidence.** Zero mentions of WhatsApp on either integrations page read ([source](https://metricool.com/integrations/), [source](https://metricool.com/metricool-integrations/)) |
| **Publer** | Individuals, small teams and agencies with multiple brands — Workspaces + per-account approvals are the agency story; Free supports "a team of up to 3 members" ([source](https://publer.com/help/en/article/what-is-included-in-publer-free-dliovh/)) | **3 social accounts (X/Twitter excluded)**, 10 scheduled posts at once per account (30 in queue), 25 drafts, 1 workspace, up to 3 members, 24h post history, 30-day analytics ([source](https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh), [source](https://publer.com/help/en/article/what-is-included-in-publer-free-dliovh/)) | **$5/mo (Professional) → R82.89**; **$10/mo (Business) → R165.78**. Yearly = 20% discount; the yearly per-month figure is **not published**. **USD**, no ZAR. ([source](https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh)) — *disagreement:* [another Publer help article](https://publer.com/help/en/article/what-social-networks-are-supported-npoun1/) (updated 23/09/2026, a week later) says "Professional/Business plans: **starting from 3 social accounts**" vs "1 social account" above. Unresolved. | **13** — FB, IG, X, LinkedIn, Pinterest, Google Business Profile, YouTube, WordPress, TikTok, Telegram, Mastodon, Threads, Bluesky ([source](https://publer.com/help/en/article/what-social-networks-are-supported-npoun1/)) | **Paywalled to Business** unless the user brings their own OpenAI key: "AI Assist is only supported on the Business Plan… users on the Free and Professional plans can still use AI Assist by connecting their own OpenAI key". Marketing claims "more than 80 languages" with **no named list → specific African languages not verified** ([source](https://publer.com/help/en/article/what-is-the-publer-ai-assist-1n883h3/), [source](https://publer.com/features/ai-assist)) | **Not verified.** "80+ languages" claim is unenumerated; observed UI/help languages are EN/DE/ES/FR/IT/SQ — **none African** ([source](https://publer.com/features/ai-assist), [source](https://publer.com/blog/publer-goes-multilingual)) | **No.** WhatsApp is not among the 13 supported networks; no Publer page read mentions it as a channel ([source](https://publer.com/help/en/article/what-social-networks-are-supported-npoun1/)) |
| **SocialBee** | Solo operators → agencies; built on content categories and evergreen recycling, top tiers (Pro50/100/150) are explicitly agency workspaces ([source](https://socialbee.com/pricing/)) | **No free plan.** "SocialBee doesn't offer a free plan. Instead, we provide a 14-day free trial… No credit card required. Once your trial ends, posting stops automatically." ([source](https://socialbee.com/pricing/)) | **$29/mo billed monthly → R480.77**; **$24/mo billed annually ($290/yr → R4,807.65) → R397.87/mo**. Accelerate $49/$40; Pro $99/$82. **USD**, VAT excluded at checkout, no ZAR. ⚠️ **[POSSIBLY STALE]** the page still shows an "SBDAY2026 … Offer available until June 10" promo — expired >4 months ago; do not treat discounted figures as live. ([source](https://socialbee.com/pricing/)) | **10** direct-posting — FB, Instagram, Threads, LinkedIn, X, Pinterest, TikTok, YouTube, Google Business Profile, Bluesky — plus "Universal Posting" for everything else ([source](https://socialbee.com/integrations/)) | **Yes — "Unlimited AI content generation" + AI Copilot on every paid plan including Bootstrap**, no credit metering shown ([source](https://socialbee.com/pricing/)) | **No.** Posts can be written in "any language, including RTL", but "the only language available for SocialBee as a platform is **English**." No named African-language list → **not verified** ([source](https://help.socialbee.com/hc/en-us/articles/29979125509271-Can-I-Use-SocialBee-in-Multiple-Languages)) | **Manual reminder only, not publishing.** WhatsApp is explicitly listed among "platforms that don't support direct publishing" — SocialBee sends the post to your phone and you share it manually ([source](https://socialbee.com/social-media-posting-tool/)) |
| **Vista Social** | All-in-one AI "command center" for social teams and agencies; profile-based tiers (15/30/70 profiles) with 2/3/4 users → **solo-to-mid-size teams and agencies** ([source](https://vistasocial.com/faq), [source](https://vistasocial.com/pricing)) | **None.** 14-day trial, no credit card. ⚠️ *Disagreement:* Vista's own blogs still claim a free plan (3 profiles, 10 posts/profile/mo) and a $32/$39 entry — both **[POSSIBLY STALE]**, they reference a "Standard" plan that no longer exists on the live pricing page ([source](https://vistasocial.com/insights/free-social-media-management-tools), [source](https://vistasocial.com/insights/social-media-scheduling-tools)) | **$99/mo (Professional) → R1,641.23**; **$950/yr → R15,749.20** (≈$79.17/mo effective → R1,312.45). Advanced $199; Scale $449. **USD.** X (Twitter) integration is a **paid add-on at +$29/mo → R480.77**; Listening from $75/mo. ([source](https://vistasocial.com/pricing)) — *third parties still show $79/$149/$379* ([source](https://turrboo.com/blog/vista-social-pricing)) **[POSSIBLY STALE]** | **13** — FB, LinkedIn, IG, X, Google Business Profile, YouTube, TikTok, Reddit, Pinterest, Snapchat, Tumblr, Threads, Bluesky ([source](https://vistasocial.com/pricing), [source](https://vistasocial.com/integrations)) | **Yes — included on every plan, credit-metered**: 1,000 / 2,000 / 3,500 / unlimited credits per month ([source](https://vistasocial.com/pricing)) | **Not verified.** No AI output language list published; the Vista help centre returned **HTTP 403 (Cloudflare)** to every read-only fetch, so its AI articles were unreadable. A public feature-request thread asks for multi-language AI support ([source](https://suggestions.vistasocial.com/feedback/125209)) | **Not supported** — the integration directory contains no WhatsApp entry; case-insensitive search of the fetched page returned zero matches ([source](https://vistasocial.com/integrations)) |
| **FeedHive** | AI-first scheduler for founders, small teams, creators and agencies; segments Creator / Brand / Business / Agency ([source](https://www.feedhive.com/pricing)) | **None.** 7-day free trial. ⚠️ The homepage says "Get started for free" — marketing wording for the trial, in tension with the pricing page ([source](https://www.feedhive.com/pricing), [source](https://www.feedhive.com)) | **€15/mo billed €180 annually (Creator) → R278.54/mo** (annual R3,342.42) — 4 accounts, 14-day scheduling horizon, 30 scheduled posts, 2,500 AI credits/mo. Brand €22 (R408.52), Business €69 (R1,281.26), Agency €239 (R4,437.99). **EUR** on the pricing page (USD in US/Canada). **Creator month-to-month price: not verified officially** (third parties say €19) ([source](https://www.feedhive.com/pricing), [source](https://www.feedhive.com/comparison/buffer)) | **10** — Instagram, LinkedIn, TikTok, X, Facebook, YouTube, Threads, Pinterest, Google Business Profile, Discord ([source](https://www.feedhive.com/socials)) | **Yes — on every plan via monthly credits**, and users can bypass credits entirely with their own OpenAI API key ([source](https://www.feedhive.com/pricing), [source](https://docs.feedhive.com/content-creation/adding-your-openai-api-key)) | **Not verified.** No AI output-language list on the pricing page or docs read; docs describe tone-of-voice/brand voice, not output languages. Third-party claim of "English only" **not verified** ([source](https://www.feedhive.com/pricing), [source](https://docs.feedhive.com/)) | **Not supported — and FeedHive says so itself**: its own comparison FAQ positions OneUp as the fit "if you post to Snapchat, Bluesky or **WhatsApp**" ([source](https://www.feedhive.com/comparison/oneup)) |
| **Postiz** | Hosted: individuals/teams/agencies (channel caps 5/10/30/100) + a large **open-source self-hosted** audience (37.7k GitHub stars) ([source](https://postiz.com/pricing), [source](https://github.com/gitroomhq/postiz-app)) | **Hosted: none** — 7-day trial, docs state flatly "There is no free plan." **Self-hosted is the free tier**: AGPL-3.0, "every install behaves as the top tier", you pay only for your own infra ([source](https://docs.postiz.com/cloud/plans.md), [source](https://docs.postiz.com/general/quickstart)) | **$29/mo (Standard, 5 channels) → R480.77**; annual $278/yr → **R4,608.71** (≈$23.17/mo → R384.10). Team $39, Pro $49, Ultimate $99. **USD.** Self-hosted = **R0 + own infra**. ([source](https://postiz.com/pricing), [source](https://docs.postiz.com/cloud/plans.md)) — *docs note: where docs and pricing page disagree, the pricing page is the commercial source of truth* | **34 platforms** ([source](https://docs.postiz.com/general/platforms/overview.md)) | **Credit-metered on hosted plans** (20/100/300/500 image credits by tier); **self-hosted: bring your own API keys** for AI Copilot, images, videos ([source](https://docs.postiz.com/cloud/plans.md), [source](https://github.com/gitroomhq/postiz-app)) | **No (UI), not verified (AI).** The repo's translation manifest targets he, ru, zh, fr, bn, es, pt, de, it, ja, ko, ar, tr, vi — **zero African languages**. AI output-language list not found ([source](https://raw.githubusercontent.com/gitroomhq/postiz-app/main/i18n.json)) | **Not listed** in the 34-platform table ([source](https://docs.postiz.com/general/platforms/overview.md)) |

**Posta (us, for reference — not a competitor):** 4 platforms (Instagram, Facebook, X, LinkedIn),
generation in all 11 official SA languages, scheduled publishing, Paystack billing in rands, pre-launch.
Every other row above is measured against this.

**Competitors covered: 9.**

---

## 2. What each one actually does well

The one or two things each beats us on **today** — specific, not "good UX".

**Buffer**
- **Per-channel billing with a real free tier.** You pay for channels, not seats, and the rate *falls* as you add channels (1–10: $6; 11–25: $4; 26–50: $3; 51+: $1), with unlimited users from Team up. Our flat credit model has no equivalent "cost per account goes down as I grow" story for an agency. ([source](https://support.buffer.com/articles/buffer-pricing-and-features-6pJrOPuzIt), [source](https://buffer.com/pricing.md))
- **AI Assistant is unlimited and free on every plan including Free** — including templates, board view, browser extension, Canva/ChatGPT/Claude integrations, and a 3,000-request/month API on the free tier. We cannot currently claim AI at R0. ([source](https://buffer.com/pricing.md))

**Hootsuite**
- **Breadth of governed enterprise workflow**: approval workflows, access levels, custom permissions, FedRAMP certification and HIPAA-friendly positioning, plus a unified inbox spanning FB/IG/LinkedIn/X/Threads/TikTok/GBP/**WhatsApp**. Regulated buyers (government, health, finance) cannot buy us at all today. ([source](https://buffer.com/pricing.md) for the plan-shape contrast, [source](https://www.hootsuite.com/faq), [source](https://www.hootsuite.com/plans/standard))
- **Threads publishing included on all plans**, and Bluesky + Google Business Profile as additional publishing destinations. ([source](https://www.hootsuite.com/faq), [source](https://www.hootsuite.com/platform/integrations))

**Later**
- **The strongest visual/Instagram-native scheduling surface**: a social set is literally one of each supported profile (8), with Reels audio, Best Time to Post for IG/FB/TikTok, visual planner, Link in Bio and affiliate/Mavely links — a creator-commerce bundle we do not attempt. ([source](https://later.com/pricing), [source](https://later.com/social-media-scheduler))
- **Deep per-profile post quotas that scale cleanly** — 30 → 180 → unlimited scheduled posts *per profile per month*, with extra social sets and users as cheap add-ons ($11.25 / $3.75). Predictable scaling for a growing brand. ([source](https://later.com/pricing))

**Metricool**
- **Competitor tracking as a headline, not an add-on**: 5 competitors on Free, **100 on every paid plan**, across IG/FB/X/YouTube/Twitch — and it is the only free tier in this set that includes competitor analysis at all. ([source](https://metricool.com/competitors/), [source](https://metricool.com/pricing/))
- **A shareable client report**: automated reports, PDF/PPT download, monthly auto-send, and **"Share with a live URL"** from Starter upward, with your logo and brand colours, plus a Data Studio connector on Advanced. A freelancer can send a client a link, not a file. ([source](https://metricool.com/reports/), [source](https://metricool.com/pricing/))
- *Bonus, verified directly on 24 Oct 2026:* the only genuinely free plan here that still works if you have no budget — 1 brand, 20 posts/mo, AI included — at the cost of LinkedIn and X. ([source](https://metricool.com/pricing/))

**Publer**
- **One plan holding many brands with per-account approval chains.** Unlimited Workspaces on Professional+; approval is set **per member and per social account** with three levels — approve by Admin/Owner, approve by Client, or full posting access — so different brands can run different chains. ([source](https://publer.com/help/en/article/how-to-use-workspaces-on-publer-1j5jzil/), [source](https://publer.com/help/en/article/what-are-the-post-approval-access-levels-b7q7ae/))
  - ⚠️ *Disagreement:* [another help article](https://publer.com/help/en/article/professional-vs-business-vs-enterprise-plans-1sge3f7/) lists "roles and permissions and post approval workflows" under **Business only**, while the plans JS flags Professional too. Treat Professional-level approvals as **possibly unavailable** — confirm with Publer before relying on it.
- **The cheapest paid entry in the whole set at $5/mo**, with 13 networks and unlimited workspaces. ([source](https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh))

**SocialBee**
- **Category-based scheduling with evergreen recycling.** Every post belongs to a category with its own cadence and calendar slots; setting a category (or a single post) to "Evergreen" re-queues it to the back of its category after publishing, so a library of posts keeps rotating without re-scheduling. ([source](https://help.socialbee.com/hc/en-us/articles/29979201786903-Content-Categories-All-You-Need-to-Know), [source](https://socialbee.com/pricing/))
- **Unlimited AI on the cheapest paid plan with no credit metering**, at $29/$24. Our credit model must justify itself against "unlimited". ([source](https://socialbee.com/pricing/))

**Vista Social**
- **The widest network list of any paid SaaS here (13) with AI credits included on every tier** — 1,000 credits on the entry plan covering content, images, video, summaries, sentiment and "Ask Vista" agent actions. ([source](https://vistasocial.com/pricing))
- **A genuinely broad integration directory** (Reddit, Tumblr, Snapchat, Bluesky alongside the majors) and separate add-on products for Listening (from $75/mo) and Employee Advocacy (from $199/mo) that let it grow into a full suite. ([source](https://vistasocial.com/integrations), [source](https://vistasocial.com/pricing))

**FeedHive**
- **Recycling + conditional posting.** AI-driven recycle suggestions for already-published posts, and *post conditions* — rules that decide whether a post goes out based on state — are documented first-party features, not roadmap items. ([source](https://docs.feedhive.com/planning-and-scheduling/recycling-content), [source](https://docs.feedhive.com/planning-and-scheduling/how-to-use-post-conditions))
- **Bring-your-own-OpenAI-key as a first-class escape hatch** from the credit system, plus workspace/approval scaffolding from Brand (5 workspaces) upward. ([source](https://docs.feedhive.com/content-creation/adding-your-openai-api-key), [source](https://docs.feedhive.com/workspace-management/setting-up-a-workspace-and-team))

**Postiz**
- **Open source under AGPL-3.0 with self-hosting that behaves as the top tier** — unlimited channels, posts and team members, your own infra, your own AI keys. A competitor can always be undercut to R0 by anyone willing to run a server, and that ceiling prices our hosted tier. ([source](https://github.com/gitroomhq/postiz-app), [source](https://docs.postiz.com/general/quickstart))
- **34 supported platforms** — more than four times our four, and 2.6× the next-largest SaaS list here. ([source](https://docs.postiz.com/general/platforms/overview.md))

---

## 3. Pricing reality for a South African buyer

### 3.1 Not one of the nine bills in rands

| Product | Currency billed | Explicit currency statement | ZAR option observed? |
|---|---|---|---|
| Buffer | **USD only** | "All Buffer subscriptions are billed in U.S. dollars (USD), regardless of your location. At this time, it's not possible to change the billing currency or pay in a different currency." — [source](https://support.buffer.com/articles/why-was-i-charged-that-your-bill-taxes-and-vat-explained-YMilE1mo8m) | No |
| Hootsuite | `$` shown; **currency code not printed** on the page (geo-rendered footnote did not resolve) → **not verified** | Footnote: "Prices displayed in __, based on annual billing, but do not include applicable taxes" — [source](https://www.hootsuite.com/plans) | No |
| Later | **USD** | "Prices are billed in USD, applicable taxes are extra" — [source](https://later.com/pricing) | No |
| Metricool | **EUR and USD** | Currency toggle renders EUR and USD only; "ZAR" and "rand" return 0 matches on the page; "The prices indicated do not include any applicable VAT" — [source](https://metricool.com/pricing/) | **No** |
| Publer | **USD** | Prices published in USD in the help centre article; no ZAR observed — [source](https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh) | No |
| SocialBee | **USD** | "VAT excluded at checkout"; no ZAR on page — [source](https://socialbee.com/pricing/) | No |
| Vista Social | **USD** | Plan prices rendered in `$`; no ZAR observed — [source](https://vistasocial.com/pricing) | No |
| FeedHive | **EUR** (USD in US/Canada) | "FeedHive charges USD in the US and Canada and EUR in other countries" — [source](https://www.feedhive.com/comparison/buffer) | No |
| Postiz | **USD** | Prices published in `$` — [source](https://postiz.com/pricing) | No |

**Nine out of nine. Zero ZAR.** Even Meta does not bill WhatsApp Business Platform messages in rand:
ZAR is **not among the 16 currencies** enabled on the platform (USD, AED, ARS, AUD, BRL, CLP, COP, EUR,
GBP, IDR, INR, MXN, MYR, PEN, SAR, SGD) as of 1 July 2026 — [source](https://developers.facebook.com/docs/whatsapp/pricing/).

### 3.2 What that means for a Joburg salon paying with a rand card

Take a realistic mid-tier purchase — Metricool Starter, 5 brands, billed monthly at €20 — and a
high-end one, Hootsuite at $99/user/month:

| | Published price | Works out to (§0 rate) |
|---|---|---|
| Metricool Starter, annual billing, 5 brands | €16/mo | **R297.10**/mo |
| Metricool Starter, monthly billing, 5 brands | €20/mo | **R371.38**/mo |
| Buffer Essentials, 4 channels | $24/mo | **R397.87**/mo |
| SocialBee Bootstrap, annual | $24/mo | **R397.87**/mo |
| Later Starter, annual | $18.75/mo | **R310.84**/mo |
| Postiz Standard | $29/mo | **R480.77**/mo |
| Vista Social Professional | $99/mo | **R1,641.23**/mo |
| Hootsuite Standard, per user, billed annually | $99/user/mo | **R1,641.23**/user/mo |

Those are the *arithmetic* rands. They are **not** what lands on the card:

1. **The charge is in a foreign currency.** The card is denominated in ZAR; the issuer converts at its
   own rate on the day it processes the transaction, not at the rate in §0.
   ⚠️ **Specific South African bank cross-border/forex fee percentages are not verified** — no SA bank
   schedule was read for this document, so no percentage is quoted here. Do not put a forex number in
   customer-facing copy without reading the issuer's own schedule first.
2. **It is a cross-border transaction**, which is a separate category from a domestic one on most SA
   card products, with its own fee and, on some products, its own online/international limit. Again:
   **not verified numerically** — no source read.
3. **Approval friction is real and unevidenced either way.** A first charge in USD/EUR from an unknown
   merchant descriptor is a common trigger for issuer fraud checks on a newly-used card.
   **Not verified** — we have no data, and no public source claims a rate. Treat it as a hypothesis to
   test, not a fact to market.
4. **VAT treatment is inconsistent even at vendor level.** Metricool says prices exclude VAT; SocialBee
   says VAT excluded at checkout; Buffer applies the **UK** standard rate for B2C customers and lets a
   VAT number trigger reverse charge ([source](https://buffer.com/pricing.md)). None of them produces a
   South African VAT invoice showing a 10-digit VAT number — which is what an SA business needs to
   claim input VAT. A salon paying R371/mo and unable to reclaim the VAT is paying an effective
   premium that no competitor discloses.
5. **Support sits in another timezone and another currency context.** No competitor in this set
   publishes an SA office, SA hours or ZAR-denominated support. (Absence claim, read across the nine
   pricing/FAQ pages listed in §1 — **no SA-specific support page was found for any of them.**)

### 3.3 The counterweight: Paystack already prices SA properly

Posta's payment rail is a local one, and its SA pricing is published first-party:

- **Local cards: 2.9% + R1.00 (VAT exclusive)**; **EFT: 2%**; **international cards: 3.1% + R1.00 (VAT
  exclusive)** — [source](https://support.paystack.com/en/articles/2130306)
- ⚠️ **Disagreement flagged:** Paystack's own [SA launch blog post](https://paystack.com/blog/news-updates/sa-launch)
  states "**2.9% + R1.00 (including VAT)**", contradicting the support article's "VAT exclusive".
  **Use the support-article wording until Paystack confirms.** The blog post's date was not captured in
  the fetch, so its staleness is **not verified**.
- ⚠️ `paystack.com/za/pricing` returned **HTTP 403** to direct fetch — the current headline pricing page
  is **not verified**.

**Implication:** an EFT-funded rands wallet costs roughly 2% at the payment layer and carries no forex,
no cross-border category and no issuer conversion. A USD subscription carries all three. That asymmetry
is the whole basis of gap **#5** below.

---

## 4. THE GAP LIST

Ten concrete gaps, **ranked hardest for a competitor to copy → easiest**, as briefed.
Effort sizes are rough (small / medium / large).

---

### Gap 1 — Content that is *proofread* in all 11 official languages, not machine-translated
**Effort: large. Difficulty to copy: highest — this is a corpus and a review process, not a feature flag.**

**The gap in one line:** no competitor publishes a first-party claim that it can generate in isiZulu,
isiXhosa, Afrikaans, Sesotho, Setswana, Northern Sotho, Xitsonga, siSwati, Tshivenda or isiNdebele — and
the one vendor that *does* publish its AI language list says English only.

**Who has it and who does not (evidence):**
- **Later — explicitly English-only AI:** "Caption Writer is **currently only available in English**." — https://help.later.com/hc/en-us/articles/12252569781015-Later-s-Caption-Writer
- **Buffer — no African language in any interface list:** web/iOS English-only; Android offers 14 languages, none African; **no AI generation language list published at all** → not verified — https://support.buffer.com/articles/can-i-use-buffer-in-another-language-wetiyDOiI4
- **Hootsuite — no African language:** display languages EN/FR/DE/IT/PT/ES/AR/JA (snippet only, JS-rendered body unreadable) — https://help.hootsuite.com/s/article/change-language — and its only published AI language list is for the *free web caption generator*, EN/ES/IT/FR/DE — https://www.hootsuite.com/social-media-tools/ai-caption-generator-social-media
- **Metricool — site switcher renders EN/ES/FR/DE/IT/NL/PT only** (read directly 24/10/2026); the AI flow has a "Select the language" step but publishes **no list** → not verified — https://metricool.com/pricing/ and https://help.metricool.com/how-to-create-posts-with-metricools-ai-text-generator-sv0j8
- **SocialBee — platform English-only:** "the only language available for SocialBee as a platform is English" (posts may be written in any language) — https://help.socialbee.com/hc/en-us/articles/29979125509271-Can-I-Use-SocialBee-in-Multiple-Languages
- **Postiz — zero African locales in the shipped translation manifest** (he, ru, zh, fr, bn, es, pt, de, it, ja, ko, ar, tr, vi) — https://raw.githubusercontent.com/gitroomhq/postiz-app/main/i18n.json
- **Publer — "more than 80 languages" but no named list anywhere** → specific African languages **not verified** — https://publer.com/features/ai-assist
- **Vista Social / FeedHive — no output-language list published; not verified.** Vista's help centre returned HTTP 403 to read-only fetches — https://vistasocial.com/pricing, https://docs.feedhive.com/
- **Nearest thing to a counter-example is outside this category:** Canva claims Magic Write does "103 languages" without enumerating them — https://www.canva.com/help/about-magic-write — and Canva's *product translation* list does include an Africa region with Afrikaans, Sepedi, Sesotho, Tsonga, Xhosa and Zulu, but that is **UI/translation support, not AI generation**, and that page returned 403 (indexed text only) — https://www.canva.com/help/translation-languages
- **Honest caveat:** the absence of a claim is not proof of absence of capability. A vendor may generate in a language it never documents. What is verifiable is that **none of the nine publishes such a claim**, and the two that publish *any* list exclude our languages.

**How Posta takes it with a Mzansi angle:** publish the language list as a contract, not a marketing line — name all 11 languages, ship a per-language style guide (register, formality, greetings, the words that machine translation gets wrong), and run a **human proofread pass by native speakers** on every generated draft before it can be scheduled. Add the thing global tools will not attempt: **code-switched output** — "Sawubona, here's this week's special" — because that is how SA social captions are actually written, and a single-language model regime is structurally bad at it. Make the proofread status visible on the post ("proofread by Nomsa, 24 Oct") so the claim is auditable.

---

### Gap 2 — WhatsApp as a publishing channel *and* as the notification route
**Effort: large. Difficulty to copy: very high — Meta business verification, per-message cost design, and a product surface none of them have built.**

**The gap in one line:** nine competitors, zero publish to WhatsApp — and none use WhatsApp to tell the
owner anything either.

**Who has it and who does not (evidence):**
- **Buffer — explicitly not supported:** "We don't currently have an integration with Snapchat, Reddit, **WhatsApp**, Telegram, Twitch, OnlyFans, or lemon8" — https://support.buffer.com/articles/connecting-your-channels-to-buffer-HvWLgAJvL9
- **Hootsuite — inbox only:** "**Receive and respond** to WhatsApp messages in Hootsuite Inbox" — https://www.hootsuite.com/platform/integrations. Outbound publishing/broadcast capability = **not verified**.
- **SocialBee — manual reminder only:** WhatsApp named among "platforms that don't support direct publishing"; it pushes the post to your phone for you to share — https://socialbee.com/social-media-posting-tool/
- **FeedHive — names WhatsApp as its own gap:** its comparison FAQ steers users to OneUp "if you post to Snapchat, Bluesky or **WhatsApp**" — https://www.feedhive.com/comparison/oneup
- **Later** — absent from its 8-platform list — https://later.com/pricing · **Publer** — absent from its 13 networks — https://publer.com/help/en/article/what-social-networks-are-supported-npoun1/ · **Vista Social** — zero matches in the integration directory — https://vistasocial.com/integrations · **Metricool** — zero matches on both integrations pages — https://metricool.com/integrations/ · **Postiz** — absent from the 34-platform table — https://docs.postiz.com/general/platforms/overview.md
- **One competitor elsewhere does claim it:** OneUp lists WhatsApp as a supported channel — https://oneupapp.io and https://oneupapp.io/whatsapp-features — but the exact publish mechanic (status update vs DM vs link share) is **not verified**. OneUp is not in our required set but must be watched.
- **The platform economics, from the primary source:** Meta charges the WhatsApp Business Platform **per message** (not per conversation) since 1 July 2025, billed only on delivery, by message category × market; **South Africa (+27) is a standalone market on the rate card** (39 named markets), and as of **1 Oct 2026 SA utility and authentication rates increased**; there are **1,000 free service messages per business phone number per month**, non-rolling; **ZAR is not one of the 16 billing currencies** — https://developers.facebook.com/docs/whatsapp/pricing/
- **WhatsApp *Channels* publishing specifically: not verified.** No official Meta documentation was read that exposes a Channels send endpoint; the Cloud API docs list messaging to phone numbers, not channel broadcast — https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started. Third-party claims (Whapi, DEV.to tutorials) are **not** acceptable evidence. **Resolve this before committing to the word "Channels" in copy.**

**How Posta takes it with a Mzansi angle:** in SA, WhatsApp *is* the internet for a lot of the market —
so treat it as a first-class destination and a first-class notification bus, not as an inbox integration:
(a) publish the scheduled post to the customer's WhatsApp audience, (b) send the owner a WhatsApp the
moment a post goes live or fails, and (c) use WhatsApp as the approval route ("Reply YES to publish").
Because Meta charges per delivered message, meter it through the prepaid credit wallet (gap **#5**) so
cost is bounded and visible. **First build step is a spike to confirm the Channels question above** —
if Channels publishing is not available via API, the fallback is template messaging to an opted-in
broadcast list, which is a different (and cheaper) product than "post to your channel".

---

### Gap 3 — Offline-first, low-data drafting for a business that has one phone and no laptop
**Effort: large. Difficulty to copy: high — it is a client architecture, not a feature.**

**The gap in one line:** every competitor's product surface is a desktop dashboard with seats,
workspaces and approval chains; none publishes an offline or local-first drafting claim, while a
measurable share of the SA audience is intermittently online.

**Who has it and who does not (evidence):**
- **Market, first-party, dated:** DataReportal *Digital 2026: South Africa*, published **8 Nov 2025**, data as of **Oct 2025** — **[POSSIBLY STALE: the data is ~12 months old by publication design]**: population **64.9M**; internet users **51.7M (79.6%)**, of whom **13.3M (20.4%) are still offline**; **127M cellular mobile connections = 196% of population**, 98.7% of them 3G/4G/5G; social identities **29.1M (44.9%)**; TikTok **29.1M** adults 18+; Instagram 8.60M; LinkedIn 17.0M registered members (not MAU); X 2.96M, **down 11.5% YoY** — https://datareportal.com/reports/digital-2026-south-africa
  - The source's own caveats must travel with the numbers: ad-reach ≠ MAU; LinkedIn counts registered members; do **not** compute YoY against older DataReportal reports.
  - **Not verified:** the "69% of SA internet users go online primarily via smartphone" figure circulating locally appears only on a third-party page attributed to DataReportal — https://growthpulsemedia.co.za/ — and was **not** found on the primary page. **Do not quote it.**
- **Competitors:** none of the nine publishes an offline-first, local-first or low-data drafting claim on the pages read for this document (the pricing/product/docs pages listed in §1). This is an **absence-of-evidence statement scoped to those pages**, not proof that no such capability exists anywhere in their products.
- **What they *do* publish is organisation-shaped:** Buffer Team = unlimited users + approval workflows + access controls (https://buffer.com/pricing.md); Metricool scales by brands with "Team and client management / Role management / Post approval system" (https://metricool.com/pricing/); Publer Free already assumes "a team of up to 3 members" (https://publer.com/help/en/article/what-is-included-in-publer-free-dliovh/); FeedHive gives 5 workspaces from its €22 tier (https://www.feedhive.com/pricing); SocialBee's top tiers are named agency workspaces (https://socialbee.com/pricing/).

**How Posta takes it with a Mzansi angle:** design for the spaza shop, the salon chair and the taxi
route — **one phone, no laptop, no team**. Drafts must be writable with no data and no power, stored
locally, synced when the connection returns, and the whole first-run flow (connect account → first post
→ scheduled) must complete on a phone screen in low-bandwidth conditions. Zero seats, zero workspaces,
zero approvals required to get to a published post. The Mzansi proof point: *"it works when your data
runs out."*

---

### Gap 4 — POPIA-shaped data handling shipped as product, not as a legal page
**Effort: medium. Difficulty to copy: high — it needs a South African legal posture a global vendor will not stand up for this market.**

**The gap in one line:** no competitor publishes any POPIA-specific commitment, while the Act's
obligations are concrete, citable and addressable as product surfaces.

**Who has it and who does not (evidence):**
- **The obligations, primary source:** Protection of Personal Information Act 4 of 2013, full text — https://www.justice.gov.za/legislation/acts/2013-004.pdf (GCIS copy: https://www.gov.za/sites/default/files/gcis_document/201409/3706726-11act4of2013protectionofpersonalinforcorrect.pdf)
  - **s.21 (operator security)**, verbatim from the GCIS copy: *"A responsible party must, in terms of a written contract between the responsible party and the operator, ensure that the operator which processes personal information for the responsible party establishes and maintains the security measures referred to in section 19."*
  - **s.72 (transborder flows)** — read directly from the Justice Department PDF: conditions include the data subject's consent, or adequate protection / a binding agreement (e.g. standard contractual clauses) in the recipient country.
  - **s.20** (operator may process only with the knowledge/authority of the responsible party; duty of confidentiality) — corroborated by a peer-reviewed SA law journal source (https://scielo.org.za/scielo.php?script=sci_arttext&pid=S1727-37812024000100079, **2024 → [POSSIBLY STALE]**), **not quoted verbatim from the Act in this session → verify before publishing wording.**
  - **ss.18 and 22** (notification of data subjects; breach notification to the Regulator and data subjects) — cited secondarily only (https://www.verifynow.co.za/compliance/popia/complete_guide, third-party) → **not verified verbatim. Re-read from the Act before any of this appears in customer-facing copy.**
  - The **Information Regulator's own website was not fetched** → its URL is **not verified**; do not cite it until read.
- **Competitors:** the Meta privacy policy, read directly, is a general global policy and contains **no POPIA-specific commitment found** → not verified — https://www.facebook.com/privacy/policy. No POPIA page, data-residency statement or SA operator-agreement offer was found for any of the nine (absence claim scoped to the pages read in §1).

**How Posta takes it with a Mzansi angle:** make POPIA visible *in the product*: a downloadable operator
agreement per s.21, an Information Officer named on the site with registration per ss.55–56, a
breach-notification flow per s.22 with the Regulator's contact details pre-filled, and an honest s.72
disclosure that says exactly where customer data lives and under what transfer mechanism. For a South
African agency signing a client's data-processing agreement, "here is our POPIA pack" is a purchase
reason — and it is a reason no US-headquartered competitor can match without opening an SA entity.

---

### Gap 5 — Pay-as-you-go prepaid credits in rands, with no card required and no subscription
**Effort: medium. Difficulty to copy: high — it re-platforms billing from recurring subscription to a wallet, which is a different billing entity and a different revenue model.**

**The gap in one line:** every one of the nine charges a recurring foreign-currency subscription; not one
sells ZAR prepaid credit bundles without a subscription.

**Who has it and who does not (evidence):**
- **None of the nine offers ZAR prepaid credits.** Currency evidence per product is in **§3.1**, each with its URL: Buffer (USD-only policy statement), Hootsuite (currency code not printed → not verified), Later (USD), Metricool (EUR/USD toggle, 0 matches for ZAR), Publer (USD), SocialBee (USD), Vista Social (USD), FeedHive (EUR), Postiz (USD).
- **The one pay-as-you-go precedent found is in adjacent software, not social scheduling:** Mailchimp's Pay-As-You-Go credits — https://mailchimp.com/help/about-the-pay-as-you-go-plan (first-party; publication date not stated). A small-vendor blog also frames "schedule social media posts without a subscription" — https://www.10-chairs.com/en/blog/schedule-social-media-posts-without-subscription — **third-party, date not captured, low weight.** **No competitor was found selling ZAR prepaid credit bundles without a subscription → not verified for any of the nine.**
- **The rail already exists and is priced first-party:** Paystack South Africa (ZAR) — **2.9% + R1.00 (VAT exclusive)** local cards, **2% EFT**, **3.1% + R1.00 (VAT exclusive)** international — https://support.paystack.com/en/articles/2130306 (⚠️ contradicted by Paystack's own blog saying "including VAT": https://paystack.com/blog/news-updates/sa-launch — flagged in §3.3; `paystack.com/za/pricing` returned **403** → not verified).

**How Posta takes it with a Mzansi angle:** sell a **R0 entry** and let people top up **R50, R150, R500**
in rands, by **card or EFT**, with **no subscription and no expiry scare**. This is the only model that
matches how a township micro-business actually budgets — irregular income, no appetite for a recurring
foreign debit, and a strong preference for paying for exactly what was used. It also gives us an honest
unit price ("1 credit = 1 platform-post, R2.40") that a $99/month competitor structurally cannot publish.
Pair it with a **rand-denominated tax invoice** so the customer can reclaim VAT — §3.2 point 4.

---

### Gap 6 — Publishing that survives the device being off
**Effort: medium. Difficulty to copy: medium — server-side queueing exists everywhere; making the queue the *contract*, with retries tied to local conditions, is the part they have not promised.**

**The gap in one line:** all nine queue posts server-side, but none *promises* that the schedule holds
when the user's own device, power or connectivity is gone — and the obvious South African framing of
this is now out of date.

**Who has it and who does not (evidence):**
- **No vendor in this set was found marketing offline/power-failure resilience as a distinct feature** beyond ordinary cloud queueing (absence claim scoped to the pages read in §1) → **not verified as a differentiator.**
- ⚠️ **The load-shedding wedge is stale as of now and must not be used as written.** Eskom's own statement, **Friday 2 October 2026**: *"South Africa has now recorded 504 consecutive days without loadshedding since 16 May 2025"* — https://www.eskom.co.za/more-than-500-days-without-loadshedding-eaf-improves-to-68-11-diesel-costs-fall-by-r4-79-billion-sustained-emissions-performance-below-target-levels-and-load-reduction-reduced-to-202-590-customers (corroborated by the government news agency, 4 Oct 2026: https://www.sanews.gov.za/south-africa/no-load-shedding-over-500-days-says-eskom). EAF 68.11%; diesel spend down R4.79bn (80.49%) 1 Apr–1 Oct 2026.
- **What remains true and citable:** load *reduction* (a different thing) is still being rolled out nationally, with Eskom targeting eradication in seven provinces by Oct 2026 and nationally by March 2027 — https://www.eskom.co.za/eskom-removes-more-than-one-million-customers-from-load-reduction-as-five-provinces-become-load-reduction-free (**8 July 2026**). And **13.3M South Africans (20.4%) are still offline** — https://datareportal.com/reports/digital-2026-south-africa **[data as of Oct 2025, possibly stale]**.
- ⚠️ **Do not use this statistic:** a "62% of SA SMEs experience daily load-shedding impact" figure exists only on a low-tier journal with no publication date — https://www.ijraset.com/research-paper/the-effects-of-loadshedding-on-small-and-medium-south-african-enterprises — treat as **not verified**.

**How Posta takes it with a Mzansi angle:** reframe away from load-shedding (which will read as wrong in
2026) and toward the durable local truth: **the laptop is closed, the phone is dead, the data is
finished — the 07:00 post still goes out.** Make the server-owned queue a published guarantee with a
visible "queued safely" state, retries on our side rather than the user's, and a plain-language promise
about what happens when a platform API fails. Same product, honest framing.

---

### Gap 7 — Interface, help and support in SA languages
**Effort: medium. Difficulty to copy: medium — 11-language localisation is real cost, but it is a known, bounded cost.**

**The gap in one line:** not one of the nine ships a product surface (UI, help centre, or support) in
any African language, let alone the 11 official SA ones.

**Who has it and who does not (evidence):**
- **Buffer** — web/iOS English-only; Android 14 languages, none African, and the article's own meta-description says "five languages" while the body lists fourteen (an inconsistency inside Buffer's own doc) — https://support.buffer.com/articles/can-i-use-buffer-in-another-language-wetiyDOiI4
- **Hootsuite** — EN/FR/DE/IT/PT/ES/AR/JA (**snippet only**; JS-rendered body unretrievable by any fetch tried) — https://help.hootsuite.com/s/article/change-language
- **Later** — "desktop app … English, Spanish, French, German … mobile apps are only available in English … our primary and official support language right now is English" **[article marked "1 year ago" → possibly stale]** — https://help.later.com/hc/en-us/articles/360042869154-What-Languages-Does-Later-Support
- **Metricool** — site switcher EN/ES/FR/DE/IT/NL/PT (read directly 24/10/2026) — https://metricool.com/pricing/
- **SocialBee** — "the only language available for SocialBee as a platform is English" — https://help.socialbee.com/hc/en-us/articles/29979125509271-Can-I-Use-SocialBee-in-Multiple-Languages
- **Postiz** — shipped i18n manifest: he, ru, zh, fr, bn, es, pt, de, it, ja, ko, ar, tr, vi — **no African locale** — https://raw.githubusercontent.com/gitroomhq/postiz-app/main/i18n.json
- **Publer** — observed help/UI languages EN/DE/ES/FR/IT/SQ — https://publer.com/blog/publer-goes-multilingual
- **Vista Social / FeedHive** — no locale list published; **not verified** (Vista's help centre returned HTTP 403)

**How Posta takes it with a Mzansi angle:** ship the whole surface — nav, error messages, onboarding,
help articles and a human support reply — in at least isiZulu, isiXhosa and Afrikaans at launch, with
the remaining eight on a published schedule. The Mzansi detail that sells it: the *support reply*
arrives in the customer's language, not just the UI chrome. This is also the trust layer under gap
**#1** — you cannot credibly claim proofread isiZulu content while your own error messages are English.

---

### Gap 8 — An SA content calendar: 12 statutory dates, the Sunday-observed rule, and local vertical packs
**Effort: small. Difficulty to copy: low — trivially visible and trivially reproducible once shipped.**

**The gap in one line:** every competitor's built-in content calendar is US/UK-centred, and none ships a
complete South African public-holiday set.

**Who has it and who does not (evidence):**
- **The authoritative baseline:** SA public holidays including 2026 dates — 1 Jan, 21 Mar, **3 Apr Good Friday, 6 Apr Family Day, 27 Apr Freedom Day**, 1 May, 16 Jun, **9 Aug National Women's Day (Sunday) + 10 Aug observed**, 24 Sep, 16 Dec, 25 Dec, 26 Dec — https://www.gov.za/about-sa/public-holidays
- **Metricool — explicitly US:** the 2026 calendar page is titled *"2026 US Calendar for Social Media Manager's"* — https://metricool.com/social-media-holidays-calendar-2026. **Read directly on 24 Oct 2026:** Metricool's own pricing-page footer offers only *"2027 US Calendar for SMM"* and *"2027 UK Calendar for SMM"* — no SA calendar — https://metricool.com/pricing/
- **Buffer — US/quirky:** the 2026 calendar's indexed excerpt shows "Pajamas to Work Day, Festivus, Kwanzaa" with no SA public holidays; **published 3 Dec 2025 → [POSSIBLY STALE]**, and direct fetch returned 403 (indexed snippets only) — https://buffer.com/resources/social-media-calendar-dates-2026
- **HeyOrca — Canada/USA/UK oriented** (Canada Day, July 4, Bonfire Night) — https://www.heyorca.com/blog/social-media-holidays · **LocaliQ — explicitly US** (Thanksgiving, Juneteenth) — https://localiq.com/blog/social-media-holidays · **Sociality.io — US/Canada labelled days** — https://sociality.io/social-media-holiday-calendar · **Loomly — UN/international days** — https://www.loomly.com/blog/social-media-holidays
- **The single SA date found anywhere in a competitor calendar:** SocialPilot's 2026 calendar contains *"April 27, 2026: Freedom Day (South Africa)"* — https://www.socialpilot.co/blog/social-media-holiday-calendar — **one date; completeness not verified.** SocialBee claims "300+ national and international holidays" but **no SA list was confirmed** in the excerpt — https://socialbee.com/blog/social-media-holiday-calendar
- **Nearest competitor coverage:** Brandwatch and HeyOrca show Nelson Mandela Int'l Day (18 Jul); Loomly shows Kiswahili Language Day — international days, not SA statutory dates.

**How Posta takes it with a Mzansi angle:** ship all **12 statutory dates** correctly including the
Sunday-observed rule (9 Aug → 10 Aug in 2026), plus the local moments a US calendar will never carry —
Heritage Day braai content, taxi-metropolitan paydays, back-to-school, December closing-time, elections,
and the seasonal moments for salons, spaza shops and shebeens. Pair the calendar with **vertical content
packs** (salon, spaza, local services, food, events) so a user gets 30 ready SA-relevant posts on day
one rather than a US holiday they have never heard of. Easy to copy, but it is the cheapest, fastest
proof that the product was built here.

---

### Gap 9 — An entry tier at SA purchasing power, not a $99 floor
**Effort: small. Difficulty to copy: low — it is a pricing decision, and incumbents have revenue expectations to defend.**

**The gap in one line:** the credible products either have crippled free tiers or a floor at
R1,641/user/month, and nobody in the set has a real product at R0–R150/month.

**Who has it and who does not (evidence)** — all ZAR at the §0 rate, all sourced in §1:
- **Hootsuite R1,641.23/user/mo** (https://www.hootsuite.com/plans) · **Vista Social R1,641.23/mo**, and X/Twitter costs **another +R480.77/mo** as an add-on (https://vistasocial.com/pricing)
- **SocialBee R480.77/mo** (https://socialbee.com/pricing/) · **Postiz R480.77/mo** (https://postiz.com/pricing) · **Buffer R397.87/mo at 4 channels** (https://buffer.com/pricing.md) · **Metricool R297.10–R371.38/mo for 5 brands** (https://metricool.com/pricing/) · **Later R310.84/mo** (https://later.com/pricing) · **FeedHive R278.54/mo** (https://www.feedhive.com/pricing) · **Publer R82.89/mo** (https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh)
- **The free tiers are deliberately narrow:** Buffer 3 channels + 10 concurrent posts + a lifetime 8-connection cap per network (https://support.buffer.com/articles/buffer-pricing-and-features-6pJrOPuzIt); Metricool 1 brand and **no LinkedIn, no X**, 20 posts/mo (https://metricool.com/pricing/); Publer 3 accounts and **no X** (https://publer.com/help/en/article/what-is-included-in-publer-free-dliovh/); **four of the nine have no free tier at all** — Hootsuite, Later, SocialBee, Vista Social, FeedHive (trial only; sources in §1).
- **Postiz's self-hosted option prices the ceiling at R0** for anyone willing to run a server (https://github.com/gitroomhq/postiz-app) — so the hosted offer must be worth more than "free but technical".

**How Posta takes it with a Mzansi angle:** a genuine free tier on one account in **all 11 languages**,
and a paid entry around **R99–R149/month** that includes the features the others gate (AI generation, 4
platforms, calendar, WhatsApp notifications) — funded by the prepaid-credit model in gap **#5** rather
than by a fixed subscription. The message writes itself: *more than Buffer's free tier actually
includes, in your language, for under R150.*

---

### Gap 10 — Owner-operator setup: one phone, no seats, no workspaces, no approvals to start
**Effort: small. Difficulty to copy: low — but no incumbent's plan structure targets it today.**

**The gap in one line:** every plan in this market is shaped for an organisation (seats, brands,
workspaces, approval chains), so a one-person business buys a tool designed for a team it does not have.

**Who has it and who does not (evidence):**
- **Buffer** Team tier = "unlimited team members, approval workflows, and access levels", and approvals are **Team-only**, above Essentials — https://buffer.com/pricing.md
- **Metricool** Advanced = "Team and client management / Role management / Post approval system"; Starter is already scoped at 5–10 **brands** — https://metricool.com/pricing/
- **Publer** Free assumes **"a team of up to 3 members"**, and approval levels are per-member-per-account three-tier machinery — https://publer.com/help/en/article/what-is-included-in-publer-free-dliovh/, https://publer.com/help/en/article/what-are-the-post-approval-access-levels-b7q7ae/
- **FeedHive** assigns **5 workspaces from the €22 Brand tier**, 50 at Business — https://www.feedhive.com/pricing · **SocialBee's** Pro50/100/150 tiers are named agency workspaces — https://socialbee.com/pricing/ · **Hootsuite's** ladder is explicitly seat-based with a 10-account entry cap — https://www.hootsuite.com/plans
- **Vista Social** sells 15/30/70 **profiles** with 2/3/4 **users** — https://vistasocial.com/pricing
- **Postiz** is channel-capped (5/10/30/100) — https://postiz.com/pricing

**How Posta takes it with a Mzansi angle:** the whole first-run flow should reach a *published post*
with **no workspace, no seat invite and no approval step** — one phone, one account, one post. Add team
features later, behind an upgrade, for the agencies. This is the direct product expression of gap
**#3**, and it is why a spaza owner and a Joburg salon can both start in five minutes.

---

## 5. Five features to build next, in order

Ordering principle: **defensibility × time-to-ship × dependency** — the wedge first, the payment rail
that unblocks conversion second, the channel that the rail meters third, the architecture-heavy work
fourth, the cheap marketing accelerator last.

**1. An 11-language generation pipeline with a human proofread pass** — justified by **Gap 1**.
It is the only claim in this document that no competitor makes even approximately, it is what Posta
already says pre-launch, and everything else is easier to copy. Ship the named language list first as a
contract, then the per-language style guides, then the proofread status shown on each post. It also
carries **Gap 7** (the surface must be in the same languages).

**2. A prepaid ZAR credit wallet on Paystack — cards and EFT, no subscription, no card required to start** —
justified by **Gap 5**.
It removes the forex, cross-border and VAT-invoice objections in §3.2 at the moment we go live rather
than after, and it is a hard-to-copy billing re-platform. It is also a **prerequisite for #3**: WhatsApp
sends are per-message and per-delivery on Meta's side, so we need a metered wallet before we expose
that channel. Also delivers **Gap 9**'s entry price (R0 entry + R99–149 tier).

**3. WhatsApp publishing plus WhatsApp notifications (post went live / post failed / reply YES to approve)** —
justified by **Gap 2**.
The highest-signal local channel and the largest evidenced hole across all nine competitors. Sequence it
after #2 so sends are metered, and start with a **spike to resolve the Channels-versus-template-messaging
question** — that uncertainty is the one thing that could change the shape of this feature, so it must
be settled before the build, not during it.

**4. Phone-first offline drafting plus a resilient server-side send queue** — justified by **Gaps 3 and 6**.
Local-first drafts that survive no data and no power, and a queue whose "queued safely" guarantee is a
published product promise with server-side retries. This is the largest engineering item and the one
most likely to change our architecture, so it goes after the revenue and channel work is stable — but
it is the feature that makes gaps **#3** and **#10** real rather than claimed. **Do not market it as a
load-shedding feature** (see the Eskom 504-day finding in Gap 6).

**5. The SA content calendar and vertical content packs** — justified by **Gap 8**.
All 12 statutory dates with the Sunday-observed rule, plus local moments and ready-made packs for
salons, spaza shops, shebeens, food and events. Cheapest of the five and easiest to copy, which is
exactly why it comes last: it accelerates demand that features 1–4 have already earned, rather than
substituting for them.

---

## Appendix A — What I could not verify

Consolidated, so nothing here is mistaken for a settled fact.

1. **Any competitor supporting an African language for AI generation.** No first-party language list found for Buffer, Hootsuite, Metricool, Vista Social, FeedHive, Postiz or Canva's Magic Write. Later is the only vendor that makes an explicit claim, and it is English-only.
2. **WhatsApp *Channels* publishing via official API.** No Meta developer documentation was read that exposes a Channels send endpoint. Third-party sources only → not acceptable evidence. **Resolve before writing "Channels" anywhere.**
3. **Whether Hootsuite can publish (not just receive/reply) to WhatsApp.** Three Hootsuite-owned pages consistently say inbox/receive/respond; none claims outbound publishing.
4. **Hootsuite's explicit billing currency code and its monthly price.** The plans page renders `$` but its own footnote's currency word did not resolve; monthly billing is confirmed to exist but is not priced on the page.
5. **Later's monthly (non-annual) price.** The billing toggle could not be switched by a read-only fetch.
6. **Publer's `/plans` page numbers.** The page loads prices via a JS API that returned `{"errors":["Not authenticated"]}`; figures came from Publer's own Help Center instead — and two help articles a week apart disagree on paid-plan account counts.
7. **FeedHive's Creator month-to-month price.** Third parties say €19; FeedHive's own monthly figures are verified only for Brand (€29) and Business (€99).
8. **Vista Social's price history.** Live page shows $99/$199/$449; Vista's own blogs show $32/$39 plus a free plan; third parties show $79/$149/$379. The claimed 25 Sep 2026 increase is third-party only.
9. **South African bank cross-border and forex fee percentages.** No SA issuer schedule was read → **no percentage is quoted anywhere in this document.**
10. **Paystack's headline SA pricing page** (`paystack.com/za/pricing` returned 403), and the VAT contradiction between Paystack's support article ("VAT exclusive") and its blog ("including VAT").
11. **POPIA ss.18, 20 and 22 verbatim wording**, and the **Information Regulator's website URL** (never fetched). Re-read from the Act PDF before any legal wording ships in product copy.
12. **The "69% smartphone-primary" SA statistic** — third-party attribution only; not found on the primary DataReportal page. Do not quote.
13. **The "62% of SA SMEs" load-shedding statistic** — low-tier journal, no date. Do not quote.
14. **Hootsuite help-centre article bodies** (change-language, language-detection, connect-whatsapp) rest on search-engine snippets of those exact URLs because the pages are JS-rendered. Re-check in a browser before relying on them.
15. **Any SA-specific support hours, office or legal entity for the nine competitors.** Absence claim scoped to the pages read in §1.
16. **OneUp's WhatsApp publish mechanic.** OneUp claims the channel; how it actually publishes (status vs DM vs link share) was not verified.

**Access failures during research:** `buffer.com/pricing` (403; read via text-extraction proxy of the same URL, plus Buffer's own `pricing.md`), `help.later.com` (403; read via proxy), `paystack.com/za/pricing` (403), `canva.com/help/translation-languages` (403; indexed text), `support.vistasocial.com` (403, Cloudflare), `publer.com/plans` (JS-gated), all `help.hootsuite.com` article bodies (JS-rendered).

---

## Appendix B — Sources

### Primary: vendors' own pricing, product and help pages
- Buffer — https://buffer.com/pricing.md · https://buffer.com/pricing · https://support.buffer.com/articles/buffer-pricing-and-features-6pJrOPuzIt · https://support.buffer.com/en-us/articles/supported-channels-LM3P7Y4zsp · https://support.buffer.com/articles/connecting-your-channels-to-buffer-HvWLgAJvL9 · https://support.buffer.com/articles/using-buffers-ai-assistant-qbBulfw9sn · https://support.buffer.com/articles/can-i-use-buffer-in-another-language-wetiyDOiI4 · https://support.buffer.com/articles/why-was-i-charged-that-your-bill-taxes-and-vat-explained-YMilE1mo8m
- Hootsuite — https://www.hootsuite.com/plans · https://www.hootsuite.com/plans/standard · https://www.hootsuite.com/faq · https://www.hootsuite.com/platform/integrations · https://www.hootsuite.com/platform/social-media-inbox · https://www.hootsuite.com/platform/ai · https://www.hootsuite.com/social-media-tools/ai-caption-generator-social-media · https://blog.hootsuite.com/whatsapp-marketing · https://help.hootsuite.com/s/article/change-language *(snippet only)* · https://help.hootsuite.com/s/article/language-detection *(snippet only)* · https://help.hootsuite.com/s/article/connect-whatsapp *(snippet only)*
- Later — https://later.com/pricing · https://later.com/social-media-ai-tools · https://later.com/caption-writer · https://later.com/social-media-scheduler · https://help.later.com/hc/en-us/articles/12252569781015-Later-s-Caption-Writer · https://help.later.com/hc/en-us/articles/360042869154-What-Languages-Does-Later-Support
- Metricool — https://metricool.com/pricing/ · https://metricool.com/competitors/ · https://metricool.com/reports/ · https://metricool.com/integrations/ · https://metricool.com/social-media-holidays-calendar-2026 · https://help.metricool.com/how-to-create-posts-with-metricools-ai-text-generator-sv0j8
- Publer — https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh · https://publer.com/help/en/article/what-is-included-in-publer-free-dliovh/ · https://publer.com/help/en/article/what-social-networks-are-supported-npoun1/ · https://publer.com/help/en/article/what-is-the-publer-ai-assist-1n883h3/ · https://publer.com/features/ai-assist · https://publer.com/help/en/article/how-to-use-workspaces-on-publer-1j5jzil/ · https://publer.com/help/en/article/what-are-the-post-approval-access-levels-b7q7ae/ · https://publer.com/help/en/article/professional-vs-business-vs-enterprise-plans-1sge3f7/ · https://publer.com/blog/publer-goes-multilingual
- SocialBee — https://socialbee.com/pricing/ · https://socialbee.com/integrations/ · https://socialbee.com/social-media-posting-tool/ · https://help.socialbee.com/hc/en-us/articles/29979125509271-Can-I-Use-SocialBee-in-Multiple-Languages · https://help.socialbee.com/hc/en-us/articles/29979201786903-Content-Categories-All-You-Need-to-Know · https://socialbee.com/blog/social-media-holiday-calendar
- Vista Social — https://vistasocial.com/pricing · https://vistasocial.com/faq · https://vistasocial.com/integrations · https://vistasocial.com/insights/free-social-media-management-tools · https://vistasocial.com/insights/social-media-scheduling-tools · https://suggestions.vistasocial.com/feedback/125209
- FeedHive — https://www.feedhive.com/pricing · https://www.feedhive.com/socials · https://www.feedhive.com/comparison/oneup · https://www.feedhive.com/comparison/buffer · https://docs.feedhive.com/ · https://docs.feedhive.com/content-creation/adding-your-openai-api-key · https://docs.feedhive.com/planning-and-scheduling/recycling-content · https://docs.feedhive.com/planning-and-scheduling/how-to-use-post-conditions · https://docs.feedhive.com/workspace-management/setting-up-a-workspace-and-team
- Postiz — https://postiz.com/pricing · https://docs.postiz.com/cloud/plans.md · https://docs.postiz.com/general/quickstart · https://docs.postiz.com/general/platforms/overview.md · https://docs.postiz.com/self-host/installation/overview · https://github.com/gitroomhq/postiz-app · https://raw.githubusercontent.com/gitroomhq/postiz-app/main/i18n.json
- Other vendors referenced for gap evidence — https://oneupapp.io · https://mailchimp.com/help/about-the-pay-as-you-go-plan · https://www.socialpilot.co/blog/social-media-holiday-calendar · https://www.heyorca.com/blog/social-media-holidays · https://localiq.com/blog/social-media-holidays · https://sociality.io/social-media-holiday-calendar · https://www.loomly.com/blog/social-media-holidays · https://www.brandwatch.com/blog/social-media-holiday-calendar

### Primary: platform, payments, government and market
- Meta / WhatsApp Business Platform pricing — https://developers.facebook.com/docs/whatsapp/pricing/ · https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- Paystack — https://support.paystack.com/en/articles/2130306 · https://support.paystack.com/en/articles/2130690 · https://paystack.com/blog/news-updates/sa-launch · `https://paystack.com/za/pricing` *(403 — not verified)*
- South African Government public holidays — https://www.gov.za/about-sa/public-holidays
- Protection of Personal Information Act 4 of 2013 — https://www.justice.gov.za/legislation/acts/2013-004.pdf · https://www.gov.za/sites/default/files/gcis_document/201409/3706726-11act4of2013protectionofpersonalinforcorrect.pdf
- Eskom — https://www.eskom.co.za/more-than-500-days-without-loadshedding-eaf-improves-to-68-11-diesel-costs-fall-by-r4-79-billion-sustained-emissions-performance-below-target-levels-and-load-reduction-reduced-to-202-590-customers *(2 Oct 2026)* · https://www.eskom.co.za/eskom-removes-more-than-one-million-customers-from-load-reduction-as-five-provinces-become-load-reduction-free *(8 Jul 2026)* · https://www.sanews.gov.za/south-africa/no-load-shedding-over-500-days-says-eskom *(4 Oct 2026)*
- Market data — https://datareportal.com/reports/digital-2026-south-africa *(published 8 Nov 2025, data Oct 2025 → possibly stale)*
- FX — https://open.er-api.com/v6/latest/USD *(exchangerate-api.com, 24 Oct 2026 00:02:31 UTC)*
- Canva — https://www.canva.com/help/about-magic-write · https://www.canva.com/help/translation-languages *(403; indexed text)*

### Third-party (recorded only to show disagreements — never used as the basis for a number)
- Hootsuite pricing — https://www.socialchamp.com/blog/hootsuite-pricing · https://buffer.com/resources/alternatives-to-hootsuite-free-how-buffer-and-hootsuite-compare · https://turrboo.com/blog/hootsuite-pricing · https://socialbotify.com/blog/hootsuite-pricing-2026 · https://onlysocial.io/hootsuite-pricing · https://originality.ai/blog/owlywriter-ai-review *(20 Aug 2025 → possibly stale)*
- Later — https://postfa.st/blog/later-vs-buffer-feature-and-pricing-comparison · https://copywritersnow.com/later-review
- Vista Social — https://turrboo.com/blog/vista-social-pricing · https://softwarefinder.com/marketing-software/vista-social · https://www.fastlancer.org/en/fastlancer-blog/vistasocial-review
- FeedHive — https://postwire.io/vs-feedhive · https://postfa.st/compare/postfast-vs-feedhive
- POPIA secondary — https://scielo.org.za/scielo.php?script=sci_arttext&pid=S1727-37812024000100079 *(2024 → possibly stale)* · https://mjkinc.co.za/software-technology-law/popia-for-tech-companies · https://usercentrics.com/knowledge-hub/south-africa-popia-protection-of-personal-information-act-overview · https://www.verifynow.co.za/compliance/popia/complete_guide
- Flagged and not used — https://www.ijraset.com/research-paper/the-effects-of-loadshedding-on-small-and-medium-south-african-enterprises · https://growthpulsemedia.co.za/ · https://www.dialzara.com/blog/7-ai-tools-for-multilingual-social-media-posts · https://softwarefinder.com/marketing-software/feedhive · https://sleekflow.io/en-us/blog/whatsapp-business-price · https://dev.to/whapicloud/how-to-send-a-post-to-whatsapp-channel-4na6 · https://whapi.cloud/whatsapp-channels · https://www.10-chairs.com/en/blog/schedule-social-media-posts-without-subscription · https://rebill.co.za/blog/how-paystack-works-south-africa
