/**
 * Prepaid ZAR wallet — the only writer and reader of `credit_entries`.
 *
 * There is no mutable balance column involved anywhere in this file. A balance is SUM(delta) for the
 * user; a top-up is a positive row; a publish is a negative row. The table is append-only (no updates,
 * no deletes), which is what makes a lost update impossible: two concurrent writers add two rows and the
 * sum contains both.
 *
 * The non-negative invariant is enforced twice, on purpose:
 *   1. `decideSpend` in lib/credits/ledger.ts (pure, gives the user a clean refusal), and
 *   2. a BEFORE INSERT trigger on credit_entries (see drizzle/migrations/0011_credit_entries_non_negative.sql)
 *      which takes a per-user advisory lock, so even two concurrent spends cannot both pass the check.
 */
import { db } from '@/drizzle/db';
import { credit_entries } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import type { CreditEntry } from '@/drizzle/schema';
import {
  assertNonNegative,
  decideSpend,
  type CreditReason,
} from '@/lib/credits/ledger';

export interface LedgerWrite {
  userId: string;
  /** Cents. Negative for a spend. */
  delta: number;
  reason: CreditReason;
  /** Paystack reference / post id. Doubles as the idempotency key for this entry. */
  ref?: string | null;
}

export type SpendResult =
  | { success: true; balance: number; alreadyRecorded: boolean }
  | { success: false; balance: number; error: 'insufficient_funds' };

/** SUM(delta) in cents. The only source of truth for a balance. */
export async function getCreditBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: sql<string>`COALESCE(SUM(${credit_entries.delta}), 0)` })
    .from(credit_entries)
    .where(eq(credit_entries.userId, userId));

  return assertNonNegative(Number(row?.balance ?? 0));
}

/**
 * Append one entry. Returns null when the same (reason, ref) is already recorded, which is how a
 * replayed Paystack delivery or a retried publish becomes a no-op instead of a double-credit.
 */
export async function appendEntry(write: LedgerWrite): Promise<CreditEntry | null> {
  const [row] = await db
    .insert(credit_entries)
    .values({
      userId: write.userId,
      delta: write.delta,
      reason: write.reason,
      ref: write.ref ?? null,
    })
    .onConflictDoNothing()
    .returning();

  return row ?? null;
}

/** Positive entries only (top-ups, admin grants, refunds). A negative delta belongs in spendCredits. */
export async function recordCredit(write: Omit<LedgerWrite, 'delta'> & { cents: number }): Promise<CreditEntry | null> {
  if (!Number.isInteger(write.cents) || write.cents <= 0) {
    throw new Error(`credit amount must be a positive integer number of cents, got ${write.cents}`);
  }
  return appendEntry({ ...write, delta: write.cents });
}

/** Spend cents, refusing rather than clamping when the balance is short. Never leaves a negative balance. */
export async function spendCredits(params: {
  userId: string;
  cents: number;
  reason: CreditReason;
  ref?: string | null;
}): Promise<SpendResult> {
  const balance = await getCreditBalance(params.userId);
  const decision = decideSpend(balance, params.cents);
  if (!decision.ok) {
    return { success: false, balance: decision.balanceAfter, error: decision.reason };
  }

  try {
    const entry = await appendEntry({
      userId: params.userId,
      delta: -params.cents,
      reason: params.reason,
      ref: params.ref,
    });

    if (!entry) {
      // Same (reason, ref) already charged: the retry costs nothing and the balance is unchanged.
      return { success: true, balance, alreadyRecorded: true };
    }

    return { success: true, balance: decision.balanceAfter, alreadyRecorded: false };
  } catch (error) {
    // The trigger fired: another writer spent the balance between our read and our insert.
    if (isInsufficientFunds(error)) {
      return { success: false, balance: await getCreditBalance(params.userId), error: 'insufficient_funds' };
    }
    throw error;
  }
}

/**
 * Drizzle wraps driver errors (`Failed query: insert ...`), so the Postgres SQLSTATE 23514 raised by the
 * trigger lives on `cause`, not on the thrown error. Walk the chain instead of string-matching the wrapper.
 */
function isInsufficientFunds(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current !== undefined && current !== null && depth < 5; depth += 1) {
    const code = (current as { code?: string }).code;
    const message = current instanceof Error ? current.message : String(current);
    if (code === '23514' || message.includes('insufficient_funds')) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
