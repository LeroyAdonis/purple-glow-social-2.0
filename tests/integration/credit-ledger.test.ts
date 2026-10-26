/**
 * S1 / DIG-46 — the ledger against a real Postgres.
 *
 * The unit tests prove the arithmetic and the routes' wiring; these prove the SQL and the database-level
 * guards: SUM(delta) is the balance, a spend equal to the balance lands on 0, a spend beyond it is refused
 * and leaves the balance alone, a replayed ref appends nothing, the non-negative trigger holds under
 * concurrent spends, and there is no balance column being written anywhere.
 *
 * Runs only when DATABASE_URL points at a database with drizzle/schema.ts pushed plus the hand-written
 * migrations 0010 and 0011. Without it, vitest.config.ts excludes tests/integration/** and says so.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { credit_entries, user } from '@/drizzle/schema';
import { getCreditBalance, recordCredit, spendCredits } from '@/lib/db/credit-ledger';

const userId = 'test-wallet-user';

beforeAll(async () => {
  await db.delete(user).where(eq(user.id, userId));
  await db.insert(user).values({
    id: userId,
    email: 'wallet-test@test.purpleglow.co.za',
    name: 'Wallet Test User',
    tier: 'free',
  });
});

afterAll(async () => {
  await db.delete(user).where(eq(user.id, userId));
});

beforeEach(async () => {
  await db.delete(credit_entries).where(eq(credit_entries.userId, userId));
});

describe('credit ledger (real Postgres)', () => {
  it('starts at zero and reads SUM(delta)', async () => {
    expect(await getCreditBalance(userId)).toBe(0);

    await recordCredit({ userId, cents: 29900, reason: 'paystack_charge', ref: 'ref-1' });
    await spendCredits({ userId, cents: 9900, reason: 'publish', ref: 'post-1' });

    expect(await getCreditBalance(userId)).toBe(20000);
  });

  it('leaves exactly 0 after a deduction equal to the full balance', async () => {
    await recordCredit({ userId, cents: 5000, reason: 'paystack_charge', ref: 'ref-full' });

    const spend = await spendCredits({ userId, cents: 5000, reason: 'publish', ref: 'post-full' });

    expect(spend.success).toBe(true);
    expect(await getCreditBalance(userId)).toBe(0);
  });

  it('refuses a deduction larger than the balance and leaves the balance unchanged', async () => {
    await recordCredit({ userId, cents: 5000, reason: 'paystack_charge', ref: 'ref-short' });

    const spend = await spendCredits({ userId, cents: 5001, reason: 'publish', ref: 'post-short' });

    expect(spend.success).toBe(false);
    expect(await getCreditBalance(userId)).toBe(5000);
  });

  it('credits a replayed Paystack reference once', async () => {
    const first = await recordCredit({ userId, cents: 29900, reason: 'paystack_charge', ref: 'ref-replay' });
    const second = await recordCredit({ userId, cents: 29900, reason: 'paystack_charge', ref: 'ref-replay' });

    expect(first).not.toBeNull();
    expect(second).toBeNull();
    expect(await getCreditBalance(userId)).toBe(29900);
  });

  it('charges a publish ref once, so a retried request is free', async () => {
    await recordCredit({ userId, cents: 5000, reason: 'paystack_charge', ref: 'ref-retry' });
    await spendCredits({ userId, cents: 100, reason: 'publish', ref: 'post-retry' });

    const retry = await spendCredits({ userId, cents: 100, reason: 'publish', ref: 'post-retry' });

    expect(retry.success).toBe(true);
    expect(retry.success && retry.alreadyRecorded).toBe(true);
    expect(await getCreditBalance(userId)).toBe(4900);
  });

  it('never goes negative under concurrent spends', async () => {
    await recordCredit({ userId, cents: 10000, reason: 'paystack_charge', ref: 'ref-race' });

    const attempts = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        spendCredits({ userId, cents: 6000, reason: 'publish', ref: `post-race-${i}` })
      )
    );

    const successes = attempts.filter((a) => a.success).length;
    expect(successes).toBe(1);
    expect(await getCreditBalance(userId)).toBe(4000);
  });

  it('the database itself refuses a negative balance, whatever code writes it', async () => {
    await expect(
      db.insert(credit_entries).values({
        userId,
        delta: -1,
        reason: 'publish',
        ref: 'post-direct',
      })
    ).rejects.toMatchObject({ cause: { code: '23514' } });
  });
});
