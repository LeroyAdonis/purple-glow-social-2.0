/**
 * S1 / DIG-46 — the wallet's arithmetic.
 *
 * These are the rules the SQL and the routes both rely on, so they are asserted without a database: cents
 * are integers, a spend of the whole balance lands on exactly 0, a spend larger than the balance is
 * REFUSED (not clamped, not allowed), and ZAR is shown only at the edge.
 */
import { describe, expect, it } from 'vitest';
import {
  CENTS_PER_CREDIT,
  assertNonNegative,
  centsToCredits,
  creditsToCents,
  decideSpend,
  formatZar,
  sumDelta,
} from '@/lib/credits/ledger';

describe('credit ledger arithmetic', () => {
  it('locks a credit at R1 so a top-up and a spend are in the same unit', () => {
    expect(creditsToCents(1)).toBe(100);
    expect(creditsToCents(500)).toBe(50000);
    expect(centsToCredits(50000)).toBe(500);
    expect(CENTS_PER_CREDIT).toBe(100);
  });

  it('displays ZAR from cents with no VAT added: R299 is exactly R299', () => {
    expect(formatZar(29900)).toBe('R299');
    expect(formatZar(15000)).toBe('R150');
    expect(formatZar(0)).toBe('R0');
    expect(formatZar(12345)).toBe('R123.45');
  });

  it('reads a balance as SUM(delta)', () => {
    expect(sumDelta([])).toBe(0);
    expect(sumDelta([{ delta: 29900 }, { delta: -100 }, { delta: -100 }])).toBe(29700);
  });

  it('spending the full balance leaves exactly 0', () => {
    const startingBalance = sumDelta([{ delta: 5000 }]);
    const decision = decideSpend(startingBalance, 5000);

    expect(decision).toEqual({ ok: true, balanceAfter: 0 });
  });

  it('refuses a spend larger than the balance and leaves the balance untouched', () => {
    const startingBalance = sumDelta([{ delta: 5000 }]);
    const decision = decideSpend(startingBalance, 5001);

    expect(decision).toEqual({ ok: false, reason: 'insufficient_funds', balanceAfter: 5000 });
    // Refused, not clamped: the balance is the same sum it was before the attempt.
    expect(decision.balanceAfter).toBe(startingBalance);
  });

  it('refuses to report a negative balance as a balance', () => {
    expect(assertNonNegative(0)).toBe(0);
    expect(() => assertNonNegative(-1)).toThrow(/negative/);
  });

  it('refuses a non-integer or non-positive spend instead of silently rounding money', () => {
    expect(() => decideSpend(1000, 0)).toThrow(/positive integer/);
    expect(() => decideSpend(1000, 10.5)).toThrow(/positive integer/);
    expect(() => decideSpend(10.5, 1)).toThrow(/integer cents/);
  });
});
