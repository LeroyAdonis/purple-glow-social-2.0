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

## Assumptions
- The existing `user.credits` mutable column is the thing being replaced; the append-only ledger is the source of truth and the mutable column either gets removed or derived solely from SUM(delta). Assumed reversible: can keep `user.credits` as a derived cache with recompute, not as source of truth.
- Paystack webhook event `charge.success` carries `metadata.credits`; if not present, the entry is skipped (same as current behavior) — we append only when positive delta confirmed.

## Build loop
- feature → implement → check → audit per AI Blueprint
- Verify: `npx tsc --noEmit`, build passes, webhook duplicate test passes, balance-reads-non-negative asserts

## Build steps
- [ ] 1. Schema: add `credit_entries` (Drizzle), no destructive migration of `user`, no updates/deletes allowed. Done when `npx drizzle-kit generate` produces it and `SELECT` on it shows append-only shape.
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

## Verified against live code (Ricky, 2026-10-25) — read before implementing

Three facts were checked in the repo, not assumed:

1. **`users.credits` is a mutable integer** (`drizzle/schema.ts:25`) and the Paystack webhook updates it with a
   read-modify-write: `.set({ credits: (u.credits ?? 0) + credits })`
   (`app/api/webhooks/paystack/route.ts:136`). That is a lost-update race: two webhooks landing together can each
   read the same old value and one credit is silently lost, or a retry double-credits. The append-only ledger
   removes the race because nothing is read-then-written.
2. **A `transactions` table already exists** (`drizzle/schema.ts:116`) with an `amount` (cents), `currency`,
   `credits`, `status` and `polar_order_id`. It is a **payment record with an order lifecycle**, not a credit
   ledger — it has no concept of a publish deduction. Do **not** reuse it as the ledger and do not extend it with
   negative rows: a mixed table cannot answer "what is my balance" without also reasoning about refunds and
   pending orders. Add the dedicated append-only `credit_entries` as specified, and leave `transactions` for
   payment records only.
3. **No `credit_entries` table exists yet** — the schema is clean to add it. There are two other credit-shaped
   columns (`videoCredits` on `users`, and `credits` on `transactions`); neither is a ledger.

### One more requirement that follows from fact 1
After the ledger is the source of truth, the webhook's read-modify-write must be deleted, not left beside it.
Two sources of truth for a balance is the failure this slice exists to prevent. `users.credits` may remain only
as a derived cache with a documented recompute, or be dropped — decide in step 1 and say which in the diff.
