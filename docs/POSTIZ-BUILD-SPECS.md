# Postiz → Posta build specs (our own implementation)

**Purpose:** how Postiz actually works, traced from its own source, turned into specs we implement ourselves.
**No Postiz code is copied and none of this is derived from their files as code** — this is behaviour and
architecture only. Their licence is AGPL-3.0; ours is proprietary. See `POSTIZ-REVIEW.md` for that boundary.

**Method:** `reverse-engineer-anything`'s discipline applied to a public source repo. REA's own routing sends
*shipped binaries* to decompilation and says to skip that route for "ordinary source-repository
architecture analysis", and its MCP tools are not registered on this host anyway (checked: 115 tools
available, none from REA). So each feature was traced from its entry point to its effect, and every claim below
is marked **【obs】** (read in their source) or **【inf】** (my inference / our design decision).

Source read: `gitroomhq/postiz-app` @ `a5affe6`, v1.47.0.

---

## 1. The provider contract and registry — build this FIRST

**【obs】** Every platform implements one interface, `social.integrations.interface.ts`. The interesting parts,
because they answer questions our four posters never had to:

```
authenticate({code, codeVerifier, refresh?}) -> AuthTokenDetails
refreshToken(refreshToken) -> AuthTokenDetails
generateAuthUrl() -> {url, state}
analytics(id, accessToken, date) -> AnalyticsData[]            // account-level
postAnalytics(integrationId, accessToken, postId, fromDate)    // per-post
    -> AnalyticsData[]
missing?(id, accessToken) -> {id, url}[]                       // "you haven't connected a sub-account"
reConnect?(...)                                                // re-auth without losing the record
resolveReleaseId?(...) / releaseUrl?()                         // platform gave us a provisional id
changeNickname?() / changeProfilePicture?()
handleErrors(body) -> {type:'refresh-token'|'bad-body'|'retry', value}
```

**【obs】** `AnalyticsData` is deliberately dumb and generic:
`{ label: string, data: [{ total: string, date: string }], percentageChange: number }`. Every platform's
metrics get squeezed into that shape, so the UI never learns a platform's vocabulary.

**【obs】** Each provider declares `identifier`, `name`, `scopes`, `maxLength()`, `refreshCron`, and
`handleErrors()` — `handleErrors` is the one to copy conceptually: it maps provider-specific error strings to
three outcomes (**refresh the token**, **the user's content is bad**, **retry in a moment**). Without it every
failure looks the same and we retry things that will never succeed.

**Our design 【inf】** — Next route handlers + Drizzle, no NestJS:

```ts
// lib/providers/types.ts
export type PublishOutcome =
  | { status: 'published'; platformPostId: string; url?: string }
  | { status: 'pending'; pendingData: string }          // media still processing
  | { status: 'failed'; kind: 'auth' | 'content' | 'transient'; message: string };

export interface SocialProvider {
  identifier: PlatformName;
  displayName: string;
  scopes: string[];
  maxLength: number;
  authUrl(state: string): string;
  exchangeCode(code: string, codeVerifier: string): Promise<TokenSet>;
  refresh(refreshToken: string): Promise<TokenSet>;
  publish(post: PostToPublish, token: string): Promise<PublishOutcome>;
  checkPending?(pendingData: string, token: string): Promise<PublishOutcome>;
  analytics?(accountId: string, token: string, date: string): Promise<AnalyticsSnapshot[]>;
  postAnalytics?(token: string, platformPostId: string): Promise<AnalyticsSnapshot[]>;
}
```

`lib/providers/registry.ts` exports a `Record<PlatformName, SocialProvider>` and one `getProvider(name)`.
**【inf】** Migration path: wrap the four existing posters as providers one at a time; `post-service.ts` keeps
working until each is switched over. Do this **before** channel five.

---

## 2. Plugs — the mechanic worth the whole review

This is not "append a signature". **【obs】** A plug is a *named function on the provider* stored as a string
(`plugFunction`) plus a JSON field bag, and it is executed **after** publish on a schedule with a delay and a
run counter:

```
processPlugs({ plugId, postId, delay, totalRuns, currentRun })
  -> look up plug -> call integration[plugFunction](integration, postId, fields)
  -> returns true  = done
  -> returns false && currentRun < totalRuns = try again on the next run
```

**【obs】** Threads' `autoPlugPost(integration, id, {likesAmount, post})` is the canonical example:
1. read the post's insights and pull `likes`;
2. **if** `likes >= likesAmount`: publish a **reply** to that post (`reply_to_id: id`) containing the plug text;
3. return true when posted, false when the threshold isn't met yet.

So the feature is **engagement-triggered follow-up posting**: "when this post passes 50 likes, drop the booking
link in the comments." That is a far better product than a fixed footer, and it is the reason plugs can be sold.

**【inferred】** Why a comment and not appended text: appending a URL to the original post suppresses reach on
several platforms, and it can't be undone. A reply can.

**Our design 【inf】** — schema, Drizzle, ours:

```ts
export const plugs = pgTable('plugs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  connectedAccountId: text('connected_account_id').notNull(),
  kind: text('kind').notNull(),              // 'signature' | 'engagement_reply'
  content: text('content').notNull(),        // the text to add
  triggerLikes: integer('trigger_likes'),    // null for signatures
  delayMinutes: integer('delay_minutes').notNull().default(60),
  maxAttempts: integer('max_attempts').notNull().default(6),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

Execution: an Inngest function that fans out over published posts older than `delayMinutes`, checks the
threshold only for `engagement_reply`, posts the reply, and records `plug_firings` (postId, plugId, firedAt) so
it can never fire twice on the same post. **Idempotency is the whole risk** — a retried job must not spam a
customer's comment section.

---

## 3. Signatures — the cheap sibling

**【obs】** `SignatureDto { content: string, autoAdd: boolean }`, stored per organisation, appended to post text
at publish.

**Our design 【inf】** Merge into the same `plugs` table as `kind='signature'` (above) so there is one settings
screen and one publish-time transform. Appended only if the platform's `maxLength` still allows it; if it would
overflow, skip the signature and log — never truncate the user's post to fit our footer.

---

## 4. Post analytics — we are one function away

**【obs】** The per-post contract is `postAnalytics(integrationId, accessToken, postId, fromDate)` returning the
generic `AnalyticsData[]`. Threads implements it with
`GET https://graph.threads.net/v1.0/{postId}/insights?metric=views,likes,replies,reposts,quotes`, mapping each
metric to `{label, data:[{total, date}], percentageChange}`.

**【obs】** Meta-family providers use the same insights pattern for Instagram and Facebook. **【inf】** Our
existing stub already lists the right four TODOs.

**Our design 【inf】** — fill `fetchPlatformAnalytics()` in `lib/ai/analytics-service.ts`:
- Facebook: `GET /{post-id}/insights?metric=post_impressions,post_reactions_by_type_total,post_clicks`
- Instagram: `GET /{media-id}/insights?metric=impressions,reach,likes,comments,saves,shares`
- Map into our existing `post_analytics` columns; write `engagementScore` with the maths already in the file.
- New Inngest function, every 6 hours: last 14 days of published posts → fetch → upsert.
- **Honest gaps:** a metric the platform doesn't return is `null`, never `0`. Zero and unknown must not look
  the same on a chart.

---

## 5. Short links

**【obs】** `ShortLinkService` picks a provider from env (`DUB_TOKEN`, `SHORT_IO_SECRET_KEY`, `KUTT_API_KEY`,
`LINK_DRIP_API_KEY`) and falls back to an `Empty` provider whose `shortLinkDomain === 'empty'` disables the
whole feature cleanly. `convertTextToShortLinks` rewrites URLs in the post text before publish, and there is a
LinkedIn-specific path implying per-platform rules.

**Our design 【inf】** Self-hosted, no third party:
- `POST /l/[slug]` → 302 to the stored target, increment `link_clicks` (no cookies, no PII — POPIA-friendly).
- Table: `short_links(id, userId, postId, targetUrl, slug, clicks, createdAt)`.
- Rewrite at publish; keep the original URL as the display text where the platform allows it.
- **【inf】** Do not shortlink a link the user did not write. Only URLs already in their text.

---

## 6. Approval flow (the agency tier)

**【obs】** Postiz gates on organisations and roles, with `Comments` attached to posts.
**【inf】** Our version, minimal: `posts.status` gains `'pending_approval'`; a `post_approvals` row records who
approved and when; the publish job refuses any post whose status is not `'scheduled'` or `'approved'`.
This is a workflow, not an integration — no new API keys, and it is the single feature that lets us charge an
agency multiples of a solo plan.

---

## 7. New channel specs (concrete, from their implementations)

### Threads — build this one first 【obs】
- Scopes: `threads_basic`, `threads_content_publish`, `threads_manage_replies`, `threads_manage_insights`.
- Auth: `https://www.threads.net/oauth/authorize`; token refresh `graph.threads.net/refresh_access_token`
  (`grant_type=th_refresh_token`); tokens last ~**58 days**.
- Publish: create a container at `POST /v1.0/me/threads`, then publish it at
  `/v1.0/{accountId}/threads_publish?creation_id=...`.
- Media processing is **asynchronous**: poll status, and their code caps the wait at **8 minutes** and throws a
  non-retryable error rather than timing out an activity that would republish the post. Copy that discipline —
  a retry that double-posts is worse than a clean failure.
- Text limit **500** characters.
- Error mapping that matters: `4279009` = media not ready → **retry**; `2207051` / `4279013` = Meta restricted
  the account → **tell the user, do not retry**; "Error validating access token" → **refresh**.

### Telegram 【obs】
Simplest possible channel: **no OAuth at all**. `generateAuthUrl()` returns a random state instead of a URL,
and `authenticate({code})` treats the "code" as a **chat id or @username**, resolves it with the bot's token
(`getChat`), and stores the chat as the account — private groups use the numeric id, public ones use the
username. Good second build because it exercises the provider interface without an OAuth flow.

### TikTok / YouTube 【inf】
Both need a real OAuth app plus video upload, and both review the app before public use. Not the next two —
Threads and Telegram first, then these once we want video.

---

## What I am NOT taking

- **Temporal.** Their durable workflows are the reason `processPlugs` can be a retry loop. Inngest gives us the
  same guarantee with a fraction of the operational weight.
- **NestJS / Prisma / Nx.** We are Next + Drizzle, one app, and that is right at our size.
- **Their agent, trending, newsletter and AI-video modules.** Not what our buyers lose sleep over.
- **Any file, identifier or comment from their code.** This document is the only artefact that crosses over.

---

## Order of work, with real estimates

| # | Work | Why now | Estimate |
|---|---|---|---|
| 1 | Provider contract + registry, existing 4 wrapped | Makes 5 and 6 cheap | 1 day |
| 2 | Threads channel | Biggest overlap with our buyers | 1 day |
| 3 | Signatures + plugs table (signature only first) | Sells on its own | 1 day |
| 4 | Short links + click counts | Measurement SMEs understand | 2 days |
| 5 | `fetchPlatformAnalytics` + 6-hourly Inngest job | Stub is already there | 2 days |
| 6 | Engagement-reply plugs | The standout feature | 1 day (needs 3 + 5) |
| 7 | Telegram channel | Cheap reach | half a day |
| 8 | Approval flow | Unlocks the agency tier | 3 days |

Items 1–3 are one working week and change the product from "scheduler" to "scheduler with a reason to pay".
