# Paystack setup — Digital Wave Tech owns it, Posta is the product

This is the step-by-step for getting Posta taking money through Paystack, with **Digital Wave Tech (Pty)
Ltd** as the registered business. Written to be followed in order, on your phone or a laptop.

---

## The one decision, before you click anything

**Do not add Posta to the Paystack account KitFix is using.**

Paystack gives you **one webhook URL per account**. That single address is where Paystack tells your server
"this payment succeeded". If KitFix already owns that slot and you point it at Posta, KitFix stops being
told about its own payments — customers get charged and nothing gets credited. Nothing errors, nothing
alerts, it just quietly stops working. That is the shape of the problem you hit before.

So there are two ways forward, and the first one is what I recommend:

- **Recommended — a second Paystack account, owned by DWT for Posta.** Same company, same CIPC number,
  same bank account, different login email. Each product then has its own keys, its own webhook and its own
  clean transaction list. KitFix is never touched.
- **Fallback — one account plus a router.** If Paystack refuses a second account for the same business,
  the webhook points at a small router on our server which reads the plan code and forwards the event to
  the right product. It works, but it is one more thing that can break, so try the separate account first.

The details below assume the recommended path.

---

## Part 1 — Create the account

1. Go to **paystack.com** and choose **Create a free account**.
2. Use **leroy@digitalwavetech.dev** as the login email. Do **not** reuse the KitFix login — the whole
   point is a separate account. Paystack accounts are tied to the email, so a fresh one is fine.
3. Verify the email Paystack sends you.
4. When asked for the business type, choose **Registered Business** (not Starter / Individual). A
   Registered Business account is what unlocks subscriptions and payouts to a company bank account.
5. Country: **South Africa**. Currency: **ZAR**.

## Part 2 — Business details, exactly as they must be typed

These have to match your CIPC certificate character for character. A mismatch here is the single most
common reason for a rejected or stalled account.

| Field | What to enter |
|---|---|
| Business name | `Digital Wave Tech (Pty) Ltd` |
| Registration / Company number | `2026/809312/07` |
| Tax Identification Number (TIN) | `9251471281` |
| Trading / product name | `Posta` |
| Country | South Africa |
| Business address | the registered DWT address on your CIPC documents |
| Industry | Software / Technology |
| Website | `https://digitalwavetech.dev` |

Notes that matter:

- The **tax number is the SARS income tax number**, not the CIPC registration number and not the SARS
  reference number. If a form asks for a "Tax Identification Number", it is `9251471281`.
- There is no VAT number to give. DWT is registered for income tax only. Leave VAT fields blank.
- The **trading name** is where Posta belongs. Paystack wants the legal entity for compliance and lets you
  show a product name to customers. Never put Posta in the business-name field — the bank account matching
  step will fail.

## Part 3 — Compliance documents to upload

Have these ready before you start, because the form times out and you will have to begin again:

1. **CIPC registration certificate** — COR14.3, attached to the CIPC email titled "New Company
   Registration - 2026/809312/07".
2. **Proof of business address** — a utility bill or bank statement in the company name, **not older than
   3 months**. A statement from the new DWT business account is ideal, since it proves the account too.
3. **Bank account confirmation letter** — from your bank, showing the account name and number. The name
   must read Digital Wave Tech.
4. **Director's ID** — yours, front and back, clear and unobstructed.
5. Sometimes requested: **proof of the business's source of funds** — a short line saying "software
   development and subscription software sales" is enough.

Upload formats: PDF or a clear photo. Make sure all four corners are visible and no glare covers the text.

## Part 4 — Settlement bank account

This is the step that fails most often.

- The account must be a **business account in the company's name**, i.e. Digital Wave Tech (Pty) Ltd.
- A **personal account will be rejected** for a Registered Business account. Paystack enforces name
  matching, and so does the bank.
- If the names differ by even a small thing — an ampersand, a missing (Pty) Ltd, an old trading name —
  the payout is held. Ask your bank to confirm the exact registered account name before you type it in.

If DWT's business account is brand new, that is fine. Use the account confirmation letter as proof.

## Part 5 — Make it say Posta to the customer

Customers should see Posta on the checkout page, not Digital Wave Tech's legal name.

1. Go to **Settings → Branding** (sometimes shown as Business Settings).
2. Set the **business display name** to `Posta`.
3. Upload the Posta logo — 512×512 PNG on a solid background works best.
4. Set the brand colour and the support email `leroy@digitalwavetech.dev`.
5. The **legal entity on receipts stays Digital Wave Tech (Pty) Ltd** — that is correct and required.

## Part 6 — Create the two paid plans

Plans are what make recurring subscriptions work. Without them you can only take one-off payments.

Go to **Products → Plans → Create plan**, and create these two:

| Plan name | Amount | Interval | Credits it grants |
|---|---|---|---|
| `Posta Pro` | R299.00 | Monthly | 500 |
| `Posta Business` | R999.00 | Monthly | 2000 |

- `Posta Free` does **not** need a Paystack plan — it costs nothing and is enforced inside the app.
- After saving each plan, open it and copy the **plan code**. It looks like `PLN_xxxxxxxxxxxxxx`. These two
  codes are what the app uses to work out which tier a payment belongs to.
- Name them with the Posta prefix exactly as above. It is what tells you, months from now, which product a
  R299 payment came from.

## Part 7 — API keys and the webhook

Go to **Settings → API Keys & Webhooks**.

1. **Copy the test keys first** — `sk_test_...` (secret) and `pk_test_...` (public). Live keys start
   `sk_live_...` and are only for after testing.
2. **Set the webhook URL** to:
   `https://<your-posta-domain>/api/webhooks/paystack`
   Paystack signs every webhook with your secret key, and the app throws away any request whose signature
   does not match. So the URL alone is useless to an attacker.
3. Leave IP whitelisting alone unless you know the server's fixed IP.

Security rules, not suggestions:

- The **secret key** never goes in a chat message, a screenshot, a repo, or a front-end. Server only.
- If a secret key is ever exposed, roll it immediately in this same screen. Rolling it takes seconds;
  cleaning up a leak takes weeks.

## Part 8 — Prove it works with a test purchase

Do this before switching to live keys. Paystack test mode uses magic values, so no real money moves.

1. Start a checkout from Posta for `Posta Pro`.
2. Card number: `4084 0840 8408 4081`
3. Expiry: any future date, CVV: `408`
4. PIN: `0000`, then OTP: `123456`
5. Confirm that:
   - the payment succeeds in Paystack's dashboard,
   - the webhook fires and returns 200,
   - **the account's tier becomes pro and credits become 500**,
   - replaying the same webhook does **not** add another 500 credits. Paystack retries webhooks, so this
     check is what proves the idempotency is real.

If credits do not move, the webhook is the suspect — check the dashboard's webhook log first, not the app.

## Part 9 — Going live

Only after a successful test purchase:

1. Switch the app's environment to the **live** keys (`sk_live_...`).
2. Leave the webhook URL as it is — it serves both modes.
3. Do **one real R1 test** if you want certainty, then refund it from the dashboard. Cheaper than
   discovering a problem on a customer's R999.
4. Confirm the first real payout lands in the DWT business account.

## Part 10 — What to send me

Put these in a file on the server (or tell me and I will tell you exactly where to paste them). **Never in
chat.**

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_PLAN_PRO`
- `PAYSTACK_PLAN_BUSINESS`

Test keys first. I wire them, run a real checkout end to end, and only then do we talk about live keys.

## Part 11 — When something goes wrong

| Symptom | What it usually is |
|---|---|
| Account stuck "under review" | A document is older than 3 months, or the bank account name does not exactly match the company name |
| Payouts held | Name mismatch on the settlement account, or FICA not complete |
| Checkout opens but nothing is credited | Webhook URL wrong, or the webhook returns non-200, or the signature check fails |
| Credits added twice | Idempotency broken — tell me immediately, this is the one bug that costs real money |
| "Duplicate business" on signup | Paystack already has this registration; use the router fallback described in the first section |
| Payment succeeds, tier does not change | The plan code in the environment does not match the plan that was bought |

## Part 12 — Two money facts

- **Fees:** Paystack charges a percentage plus a small fixed fee per successful transaction, usually
  capped. Read the current published rate on their pricing page before you set prices. Do not take a
  number from this document or from memory.
- **VAT:** DWT is **not** VAT registered. A R299 invoice is R299. Do not add 15% to your prices and do not
  put a VAT number on anything. If DWT's turnover ever approaches the VAT registration threshold, that is a
  conversation with an accountant, not a Paystack setting.
