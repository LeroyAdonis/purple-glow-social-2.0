/**
 * S1 / DIG-46 — concurrent deductions.
 *
 * This file used to hammer `deductCreditsAtomic`, which did `UPDATE user SET credits = credits - n WHERE
 * credits >= n`: a mutable balance with a lost-update window around it. That function is gone. The test now
 * exercises the contract that replaced it — concurrent spends against the append-only `credit_entries`
 * ledger — and asserts the same three things: no negative balance, no double spend of the same credits, and
 * the refused attempts leave the balance alone.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { credit_entries, user } from '@/drizzle/schema';
import { getCreditBalance, recordCredit, spendCredits } from '@/lib/db/credit-ledger';

describe('Credit race condition prevention (ledger)', () => {
  const testUserId = 'test-race-condition-user';

  const resetTo = async (cents: number) => {
    await db.delete(credit_entries).where(eq(credit_entries.userId, testUserId));
    await recordCredit({
      userId: testUserId,
      cents,
      reason: 'admin_adjustment',
      ref: `reset-${Date.now()}-${Math.random()}`,
    });
  };

  beforeAll(async () => {
    try {
      await db.delete(user).where(eq(user.id, testUserId));
    } catch {
      // user might not exist
    }
    await db.insert(user).values({
      id: testUserId,
      email: 'race-test@test.purpleglow.co.za',
      name: 'Race Test User',
      tier: 'free',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(user).where(eq(user.id, testUserId));
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  beforeEach(async () => {
    await resetTo(1000);
  });

  it('lets exactly the affordable number of concurrent spends through', async () => {
    await resetTo(1000); // 10 credits

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        spendCredits({ userId: testUserId, cents: 300, reason: 'publish', ref: `race-a-${i}` })
      )
    );

    expect(results.filter((r) => r.success)).toHaveLength(3);
    expect(results.filter((r) => !r.success)).toHaveLength(2);
    expect(await getCreditBalance(testUserId)).toBe(100);
  });

  it('keeps the balance non-negative when every attempt wants more than half', async () => {
    await resetTo(600);

    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        spendCredits({ userId: testUserId, cents: 500, reason: 'publish', ref: `race-b-${i}` })
      )
    );

    expect(results.filter((r) => r.success)).toHaveLength(1);
    expect(await getCreditBalance(testUserId)).toBe(100);
  });

  it('refuses every attempt when the balance is short, and changes nothing', async () => {
    await resetTo(200);

    const results = await Promise.all(
      Array.from({ length: 3 }, (_, i) =>
        spendCredits({ userId: testUserId, cents: 500, reason: 'publish', ref: `race-c-${i}` })
      )
    );

    expect(results.every((r) => !r.success)).toBe(true);
    expect(await getCreditBalance(testUserId)).toBe(200);
  });

  it('spends to exactly zero when the balance divides evenly', async () => {
    await resetTo(1500);

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        spendCredits({ userId: testUserId, cents: 300, reason: 'publish', ref: `race-d-${i}` })
      )
    );

    expect(results.every((r) => r.success)).toBe(true);
    expect(await getCreditBalance(testUserId)).toBe(0);
  });

  it('reports the unchanged balance when a spend is refused', async () => {
    await resetTo(500);

    const result = await spendCredits({ userId: testUserId, cents: 1000, reason: 'publish', ref: 'race-e' });

    expect(result.success).toBe(false);
    expect(result.balance).toBe(500);
  });
});
