/**
 * Prepaid ZAR wallet — the arithmetic, with no database and no clock.
 *
 * The balance is never stored. It is SUM(delta) over the append-only `credit_entries` table, and every
 * function here takes numbers, so the rules that matter (cents are integers, a spend may not push the
 * balance below zero, R299 is 29900 cents) can be proven without a database.
 *
 * Money is integer CENTS everywhere inside the ledger. Rands exist only at the edge, in `formatZar`.
 */

/** One credit is R1. Paystack metadata says "500 credits"; the ledger records 50000 cents. */
export const CENTS_PER_CREDIT = 100;

export type CreditReason = 'paystack_charge' | 'publish' | 'admin_adjustment' | 'signup_grant';

export interface CreditDelta {
  /** Cents. Negative for a spend. */
  delta: number;
  reason: CreditReason;
  /** Paystack reference / post id / admin action id. The idempotency key for the entry. */
  ref?: string | null;
}

export function creditsToCents(credits: number): number {
  return Math.round(credits * CENTS_PER_CREDIT);
}

export function centsToCredits(cents: number): number {
  return Math.floor(cents / CENTS_PER_CREDIT);
}

/** R299 is R299: no VAT is added because DWT is not VAT registered. */
export function formatZar(cents: number): string {
  return `R${cents / 100}`;
}

export function sumDelta(entries: readonly { delta: number }[]): number {
  return entries.reduce((sum, entry) => sum + entry.delta, 0);
}

/**
 * A negative balance means the ledger is broken, not that the user is out of money. Refuse to report it
 * as a balance: clamping would hide the bug and let money be spent twice.
 */
export function assertNonNegative(balance: number): number {
  if (!Number.isInteger(balance)) {
    throw new Error(`credit balance must be integer cents, got ${balance}`);
  }
  if (balance < 0) {
    throw new Error(`credit balance is negative (${balance} cents) — the ledger was written without a check`);
  }
  return balance;
}

export type SpendDecision =
  | { ok: true; balanceAfter: number }
  | { ok: false; reason: 'insufficient_funds'; balanceAfter: number };

/**
 * The deduction gate. A spend larger than the balance is refused, never clamped to the balance and
 * never allowed through: the user is told no and the balance is untouched.
 */
export function decideSpend(balance: number, cents: number): SpendDecision {
  assertNonNegative(balance);
  if (!Number.isInteger(cents) || cents <= 0) {
    throw new Error(`spend must be a positive integer number of cents, got ${cents}`);
  }
  if (balance < cents) {
    return { ok: false, reason: 'insufficient_funds', balanceAfter: balance };
  }
  return { ok: true, balanceAfter: balance - cents };
}
