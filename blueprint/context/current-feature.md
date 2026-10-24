# Feature: Prepaid ZAR credit wallet (append-only ledger)

**From build-plan:** S1 · DIG-46
**Build attempt:** 1
**Branch:** feature/s1-prepaid-zar-wallet

## Goal
A wallet whose balance is SUM(delta) of an append-only `credit_entries` table — never a mutable column that can drift. Top-ups reuse the existing Paystack webhook (`app/api/webhooks/paystack/route.ts`) with its HMAC-SHA512 + idempotency; deductions only on successful publish; balance never negative; ZAR in cents; R299 = R299.

## In scope
- `credit_entries` table (user, delta, reason, ref, createdAt) — append-only, no UPDATE/DELETE
- Balance query = SUM(delta); never a mutable `user.credits`
- Paystack webhook reuse for top-ups (charge.success → append positive delta)
- Deduction gate on publish (only on success; never on generation)
- Non-negative invariant (enforced at deduction time and in balance query)
- Cents storage (`integer`); ZAR display (`R{value/100}`); no VAT added

## Out of scope
- Subscriptions (S1 is prepaid only; subscription events stay in webhook but do not become wallet logic now)
- Guard feature (S5) — deduction happens, guard comes later
- Drip / slots / recap (later slices)
- New payment provider; existing Paystack only

## Verified against live code
- `users.credits` is mutable and the webhook does a read-modify-write (`(u.credits ?? 0) + credits`) — a lost-update race. The ledger fixes it, but only if the read-modify-write is **deleted**, not left beside the ledger. Two sources of truth for a balance is the failure this slice exists to prevent.
- A `transactions` table already exists. Do **not** reuse or extend it as the ledger — it is a payment record with an order lifecycle. Add the dedicated `credit_entries` table.
- No `credit_entries` table exists; the schema is clean.

## Build loop
- feature → implement → check → audit per AI Blueprint
- Verify: `npx tsc --noEmit`, build passes, webhook duplicate test passes, balance-reads-non-negative asserts

## Build steps
- [x] 1. Schema: add `credit_entries` (Drizzle), no destructive migration of `user`, no updates/deletes allowed. Done when `npx drizzle-kit generate` produces it and `SELECT` on it shows append-only shape.
- [ ] 2. Balance query: `SELECT SUM(delta) ...` per user; assert never negative (query + assertion). Done when a test reads balance after a -500 delta and asserts `>=0`; negative delta refused.
- [ ] 3. Paystack reuse: webhook `charge.success` appends `credit_entries` row with `delta = metadata.credits * 100` (cents) and `reason = 'paystack_charge'`. Idempotency key from webhook event prevents double append. Done when same signed payload posted twice yields exactly one entry.
- [ ] 4. Deduction gate: on publish success only, append `delta = -cost` with `reason = 'publish'`; refuse if SUM(delta) < cost. Done when attempt with insufficient balance is blocked and balance never dips below zero.
- [ ] 5. Verify: `npx tsc --noEmit` clean; `npm run build`; brand checker passes; no fabricated pricing. Done when all green.

## Data / contracts
- `credit_entries`: id, userId, delta (int, cents), reason (enum/string), ref (string, Paystack ref / post id), createdAt
- Balance: computed; cached only with recompute; never source of truth
- Webhook: reuse `verifyWebhookSignature` + idempotency key (`data.reference`, else SHA256(rawBody)) — same as current
- Currency: int cents; display Rands; DWT not VAT-registered → no VAT logic

## Testing
- Idempotency test (same signed payload twice → one entry)
- Non-negative balance assertion
- Deduction only after publish success; not on generation
- `npx tsc --noEmit`; build; brand check

## Notes for AI
- Existing `user.credits` is mutable; ledger replaces it as source of truth. Do not create a second mutable balance column.
- Paystack webhook is built; do not rewrite HMAC or idempotency — only extend processing to insert into `credit_entries`.
- Design rules (`design-system/posta/`) apply to any wallet UI; verify with `python3 design-system/posta/scripts/check-brand.py`.
- No fabricated prices/claims; R299 is exactly R299.

## Open questions
- Whether to drop `user.credits` column entirely or keep as derived cache with periodic recompute (reversible; spec allows either, recommends compute-only first).