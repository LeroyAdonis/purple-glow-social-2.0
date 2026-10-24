# Posta — credentials runbook

Everything you need to open, in the order that unblocks the most first. Four platforms plus payments.

**Read this bit first.** There are two very different kinds of setup on this list, and confusing them is
what makes people give up:

- **"Just your own accounts"** — you post to accounts you own. Fast, free, no approval queue. This is what
  we already did for Digital Wave Tech on Instagram.
- **"On behalf of other people"** — Posta posts to a *customer's* Instagram, X or LinkedIn. Every platform
  requires an **app review / approval** for that, and Meta additionally requires **business verification**.
  That is unavoidable, it takes days-to-weeks, and no amount of code gets around it.

So the honest sequencing is: **get one account working end to end first** (DWT's own), then apply for the
multi-user permissions while you already have a working product to show the reviewer. Reviewers approve
apps that demonstrably work.

---

## 1. Polar (payments) — do this first, it's the cheapest win

You asked for this specifically. Polar is the payments layer Posta already has code for, and unlike Meta
it does not make you beg for approval.

1. Go to **polar.sh** and sign in (use `leroyadonis3@gmail.com` so it matches the rest of our tooling).
2. Create an **Organization**: name it `Digital Wave Tech` (or `Posta` if you want the brand on the
   customer's bank statement). Country South Africa. Currency **ZAR** for local buyers — check Polar
   supports ZAR payouts for SA before you commit; if it does not, keep the org in USD and price in USD.
3. **Products**: create three, matching what the app already expects:
   - `Posta Free` — R0, 10 credits
   - `Posta Pro` — R299/month, 500 credits
   - `Posta Business` — R999/month, 2000 credits
   For the paid two, choose **Subscription** (recurring monthly), not one-off.
4. **Connect a payout account.** Polar pays out through Stripe. You will need a Stripe account or to
   complete Polar's own onboarding. This is the part that needs your ID and bank details — I cannot do it.
5. **Settings → Developers → create an Access Token.** Copy it once; store it, never paste it in chat.
6. **Settings → Webhooks → add endpoint**: `https://<your-posta-domain>/api/webhooks/polar`.
   Subscribe to: `subscription.created`, `subscription.updated`, `subscription.canceled`,
   `order.paid`. Copy the **webhook signing secret**.
7. Tell me you have done it and I will wire the four values into the app's server environment:
   `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID_PRO`, `POLAR_PRODUCT_ID_BUSINESS`.
8. **Test mode first.** Polar has a sandbox; do one fake purchase before you take a real cent.

What I need from you: the four values above, plus confirmation ZAR or USD.

---

## 2. Meta (Facebook Pages + Instagram) — the long pole, start it today

We already have two Meta apps from the DWT work. **Do not reuse them for Posta** — a publishing app that
serves other people's accounts needs its own app with its own review record.

1. Go to **developers.facebook.com → My Apps → Create App**.
2. Use case: **Other** → type **Business**. Name it `Posta`.
3. In the app, add these products:
   - **Facebook Login for Business**
   - **Instagram** (the "Instagram API with Instagram Login" product)
4. **App settings → Basic**: fill in App Domains, Privacy Policy URL, Terms of Service URL, and the
   Data Deletion Instructions URL. Reviewers reject apps with these blank — this is the single most
   common rejection reason.
5. **Permissions to request** (this is the list that matters):
   - `public_profile` — default
   - `pages_show_list` — list the customer's Pages
   - `pages_manage_posts` — publish to their Page
   - `pages_read_engagement` — read what was posted
   - `instagram_business_basic` — read the customer's IG account
   - `instagram_business_content_publish` — publish to their IG
   - `instagram_business_manage_comments` — only if you want comment replies
6. **App Review → Permissions and Features**: request the six above. For each, Meta asks for a
   **screencast** showing the exact flow and explaining what the user sees. Record it in Posta once we
   have OAuth working — a screen recording of a real connection flow is what passes.
7. **Business Verification** (Business Settings → Security Centre): upload CIPC registration
   **2026/809312/07** and proof of address. This is required for `pages_manage_posts` in production.
   Expect 2–10 working days.
8. Before review, keep the app in **Development** mode and add your own accounts as testers — that is how
   you build and demo without waiting for approval.

**What to give me as you go:** the new App ID, the App Secret, and the Instagram App ID. Never the secret
in chat — put it in a file or tell me and I will tell you where to paste it.

---

## 3. X (Twitter) — free tier exists, but read the limits

1. Go to **developer.x.com** and sign in. Apply for a developer account — answer the questions as
   "building a social media scheduling tool for South African small businesses". Be honest; they reject
   vague applications.
2. Create a **Project**, then an **App** inside it. The App must be attached to a Project to have write
   access — a standalone app is read-only, which is the trap everyone hits.
3. **User authentication settings → Set up**:
   - App permissions: **Read and write**
   - Type of App: **Web App, Automated App or Bot**
   - Callback URI: `https://<your-posta-domain>/api/oauth/twitter/callback`
   - Website URL: your Posta landing page
4. Posta's Twitter provider already uses **OAuth 2.0 with PKCE** — that is the right flow, so no code
   change needed, just the credentials.
5. Copy the **Client ID** and **Client Secret**.

**Two things to check yourself at signup, because X changes them without notice:** the monthly post cap
on the free tier, and whether the free tier still allows write access at all. If free-tier write is gone,
Posta can still read and schedule, but publishing needs the paid tier — that is a business call for you,
and it is why I am flagging it rather than assuming.

What I need: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`.

---

## 4. LinkedIn — two products, two different approval paths

1. Go to **developer.linkedin.com → Create app**. Name `Posta`, associate it with a **LinkedIn Page** —
   you need a company page to create an app at all. If there is no DWT page yet, create one (free, 5 min).
2. **Products** tab — request both:
   - **Sign In with LinkedIn using OpenID Connect** → gives you `openid`, `profile`, `email`. Usually
     approved immediately.
   - **Share on LinkedIn** → gives you `w_member_social`, which is what lets Posta post. Usually granted
     instantly to verified apps.
3. **Auth tab**: add redirect URL `https://<your-posta-domain>/api/oauth/linkedin/callback`.
4. Copy **Client ID** and **Client Secret**.
5. Note for later: posting to a **company page** (not a personal profile) needs the *Marketing Developer
   Platform* product, which is a separate application and needs a real business case. Skip it until
   Posta has paying customers — personal-profile posting is enough to sell with.

What I need: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.

---

## What I will do the moment you have them

1. Wire every credential into the server environment (never into the repo).
2. Run the app's OAuth connect flow for real against each platform and fix whatever breaks — this code
   has never been exercised against live platform APIs, so expect breakage, not smooth sailing.
3. Post one real test post per platform to accounts you control, then delete it. Proof before promises.
4. Only then flip Polar to live and let a real subscription through.

## Order of work, if you want the shortest path to money

1. **Polar** — 20 minutes, unblocks taking payment.
2. **LinkedIn** — 20 minutes, instant approval, gives you a visibly working platform.
3. **X** — 30 minutes, verify the write access question first.
4. **Meta** — start it today, expect it to be the last to land. Do not block anything on it.
