# Posta — credentials runbook

Everything you need to open, in the order that unblocks the most first. **Paystack, Meta, X, LinkedIn.**

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

## The question you asked: do I need a second company?

**No. Use DWT.** Paystack needs a registered business, a matching bank account, and FICA documents — it
does **not** need the business name to match the product name. So:

- Legal entity: **Digital Wave Tech (Pty) Ltd**, CIPC **2026/809312/07**.
- Product name on the checkout page: **Posta**. That is a trading/product name, which is fine.
- The one rule you cannot bend: **the settlement bank account must be in the same name as the registered
  company** — i.e. a DWT business account, not your personal account. If the names do not match, Paystack
  will hold or reject the account.
- If you already have a Paystack account from KitFix, you can reuse the login — but create the Posta plans
  distinctly (see step 3 below) so KitFix money and Posta money never mix in your books.

What would force a new company: wanting a separate legal entity (for a co-founder, or to sell the product
later as its own asset). That is a business decision, not a Paystack requirement. Register a second company
only when there is a reason beyond payments.

---

## 1. Paystack — do this first, it's the cheapest win

You chose Paystack. It is South African, settles in rands, and supports recurring plans, which is exactly
what Posta needs. Unlike Meta, there is no approval queue — but there is a verification step, so do it early.

1. Go to **paystack.com** and sign in with `leroyadonis3@gmail.com` so it matches the rest of our tooling.
2. Create/activate a **Business** account (not Starter). When it asks for the business details, use
   **Digital Wave Tech (Pty) Ltd**, CIPC **2026/809312/07**, and the DWT registered address.
3. **Compliance documents Paystack will ask for** — have these ready as PDFs or clear photos:
   - CIPC registration certificate (you already have this in the CIPC email)
   - Proof of business address — a utility bill or bank statement **not older than 3 months**, in the
     company name
   - A bank account confirmation letter from your bank, showing the **account name matches DWT**
   - Your ID (director)
4. **Settlement bank account**: must be a **DWT business account**. Personal accounts are rejected for
   business accounts. If DWT does not have a business bank account yet, open one first — this is the only
   real blocker on this list.
5. **Create three Plans** (Paystack Dashboard → Products → Plans). Plans are what make subscriptions work:
   - `Posta Free` — R0, no plan needed, enforced in the app
   - `Posta Pro` — **R299/month** → 500 credits
   - `Posta Business` — **R999/month** → 2000 credits
   Copy the **plan code** for each paid plan (they look like `PLN_xxxxxxxxxxxxx`).
6. **Settings → API Keys & Webhooks**:
   - Copy the **Secret Key** (`sk_live_...` or `sk_test_...`) and the **Public Key** (`pk_...`).
   - Set the **Webhook URL** to `https://<your-posta-domain>/api/webhooks/paystack`.
   - Paystack signs every webhook with your secret key; the app verifies that signature before it credits
     anyone. If the signature does not match, the request is thrown away untouched.
7. **Test mode first.** Every Paystack account starts with test keys. Run one fake purchase with the test
   card `4084 0840 8408 4081`, any future expiry, CVV `408`, PIN `0000`, OTP `123456`. Only switch to live
   keys once a test purchase has credited the account correctly.

**What to send me (never paste keys in chat — put them in a file and tell me the path):**
`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_PLAN_PRO`, `PAYSTACK_PLAN_BUSINESS`.

**Fees:** Paystack charges a percentage plus a small fixed fee per successful transaction, and it is capped.
Check the current published rate on their pricing page before you set prices — do not take a number from me
or from memory, because it changes.

---

## 2. Free AI for post generation — already wired, just needs a switch

You asked to run generation on free capacity now and upgrade later. The app has been changed so the model
is **configuration, not code**. Nothing here needs a browser; it is four environment values:

| Variable | What it means | Value for now |
|---|---|---|
| `AI_PROVIDER` | which route to use | `freellmapi` |
| `AI_BASE_URL` | the OpenAI-compatible address | `http://127.0.0.1:3901/v1` (our self-hosted free router) |
| `AI_API_KEY` | key for that router | the router's bearer key |
| `AI_MODEL` | model name | `auto` (the router picks) |

To move to a paid model later you change **only those four values** — for example `AI_PROVIDER=gemini`
with a Gemini key, or an OpenRouter model. No code change, no redeploy of logic.

**What you need to do:** nothing, unless you want a different free provider. I have the router running
already; I will confirm it answers before we call generation "working".

**Honest expectation:** free models are noticeably weaker at isiZulu, isiXhosa and Afrikaans tone than
Gemini or Claude. Fine for testing flows. Not fine for the first paying customer — plan to switch before
your first invoice, not after.

---

## 3. Meta (Facebook Pages + Instagram) — the long pole, start it today

Business verification belongs to the **business portfolio**, not the app. So verify DWT once and it covers
every app you create under it. But note what does **not** transfer: our verification proves *we* are a real
business; it does not grant access to a customer's accounts. Each customer still connects their own account
and grants Posta permission.

1. Go to **developers.facebook.com → My Apps → Create App**. Use case **Other** → type **Business**. Name it
   `Posta`. Create it **inside the DWT business portfolio**, not your personal one.
2. Add products: **Facebook Login for Business** and **Instagram** (Instagram API with Instagram Login).
3. **App settings → Basic**: fill in App Domains, Privacy Policy URL, Terms of Service URL, Data Deletion
   Instructions URL. Reviewers reject apps with these blank — most common rejection reason by far.
4. **Permissions to request:**
   - `public_profile` — default
   - `pages_show_list` — list the customer's Pages
   - `pages_manage_posts` — publish to their Page
   - `pages_read_engagement` — read what was posted
   - `instagram_business_basic` — read the customer's IG account
   - `instagram_business_content_publish` — publish to their IG
   - `instagram_business_manage_comments` — only if you want comment replies
5. **App Review → Permissions and Features**: request the six above. Each needs a **screencast** of the
   exact flow plus an explanation of what the user sees. Record it in Posta once OAuth works.
6. **Business Verification** (Business Settings → Security Centre): upload CIPC **2026/809312/07** and proof
   of address. Required for `pages_manage_posts` in production. Expect 2–10 working days.
7. Keep the app in **Development** mode until review passes, and add your own accounts as testers — that is
   how you build and demo without waiting.

**What to send me:** the new App ID, the App Secret, and the Instagram App ID.

---

## 4. X (Twitter) — free tier exists, but read the limits

1. Go to **developer.x.com** and apply for a developer account. Answer the questions as "building a social
   media scheduling tool for South African small businesses". Be honest; vague applications get rejected.
2. Create a **Project**, then an **App** inside it. The App must be attached to a Project to have write
   access — a standalone app is read-only, which is the trap everyone hits.
3. **User authentication settings → Set up**:
   - App permissions: **Read and write**
   - Type of App: **Web App, Automated App or Bot**
   - Callback URI: `https://<your-posta-domain>/api/oauth/twitter/callback`
4. Posta's Twitter provider already uses **OAuth 2.0 with PKCE**, so no code change is needed.
5. Copy the **Client ID** and **Client Secret**.

**Two things to check yourself at signup, because X changes them without notice:** the monthly post cap on
the free tier, and whether the free tier still allows write access at all. If free-tier write is gone, Posta
can still read and schedule but publishing needs the paid tier — a business call for you.

**What to send me:** `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`.

---

## 5. LinkedIn — two products, two different approval paths

1. Go to **developer.linkedin.com → Create app**. Name `Posta`, associate it with a **LinkedIn Page** — you
   need a company page to create an app at all. If DWT has no page, create one (free, 5 minutes).
2. **Products** tab — request both:
   - **Sign In with LinkedIn using OpenID Connect** → `openid`, `profile`, `email`. Usually instant.
   - **Share on LinkedIn** → `w_member_social`, which is what lets Posta post. Usually granted instantly.
3. **Auth tab**: add redirect URL `https://<your-posta-domain>/api/oauth/linkedin/callback`.
4. Copy **Client ID** and **Client Secret**.
5. Later: posting to a **company page** (not a personal profile) needs the *Marketing Developer Platform*,
   a separate application with a real business case. Skip it until Posta has paying customers.

**What to send me:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.

---

## What I will do the moment you have each one

1. Wire every value into the server environment (never into the repo, never into chat).
2. Run the flow for real and fix whatever breaks — none of this OAuth code has ever been exercised against
   live platform APIs, so expect breakage, not smooth sailing.
3. Post one real test post per platform on an account you control, then delete it. Proof before promises.
4. Only then switch Paystack to live keys and let a real subscription through.

## Order of work, if you want the shortest path to money

1. **Paystack** — do the compliance documents first; the business bank account is the only hard blocker.
2. **LinkedIn** — 20 minutes, instant approval, gives you a visibly working platform.
3. **X** — 30 minutes, but settle the write-access question before promising anyone anything.
4. **Meta** — start it today, expect it last. Do not block anything on it.
