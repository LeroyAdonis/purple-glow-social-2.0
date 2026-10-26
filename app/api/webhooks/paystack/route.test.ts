/**
 * S1 / DIG-46 step 3 — Paystack top-ups append to the ledger, once.
 *
 * The webhook itself is unchanged where it matters: raw body first, HMAC-SHA512 verified before any write,
 * idempotency keyed on the Paystack reference. What changed is the effect of `charge.success`: it appends a
 * positive `credit_entries` row in cents instead of read-modify-writing `user.credits`.
 *
 * A replayed delivery must not double-credit. These tests post the SAME signed payload twice and assert the
 * ledger was appended to once.
 */
import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const SECRET = 'sk_test_wallet_hmac';

const state = vi.hoisted(() => ({
  entries: [] as Array<{ userId: string; cents: number; reason: string; ref?: string | null }>,
  events: new Map<string, 'pending' | 'processed' | 'failed'>(),
}));

vi.mock('@/drizzle/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => [] }),
      }),
    }),
    insert: () => ({ values: async () => undefined }),
    update: () => ({ set: () => ({ where: async () => undefined }) }),
  },
}));

vi.mock('@/lib/db/webhook-events', () => ({
  getWebhookEventByEventId: async (eventId: string) =>
    state.events.has(eventId)
      ? { eventId, status: state.events.get(eventId), payload: {}, createdAt: new Date() }
      : null,
  markEventProcessed: async (eventId: string) => {
    state.events.set(eventId, 'processed');
    return { eventId };
  },
  markEventFailed: async (eventId: string) => {
    state.events.set(eventId, 'failed');
    return { eventId };
  },
}));

// Mirrors the ledger's real idempotency contract: an entry with the same (reason, ref) is not appended twice.
vi.mock('@/lib/db/credit-ledger', () => ({
  recordCredit: async (write: { userId: string; cents: number; reason: string; ref?: string | null }) => {
    const duplicate = state.entries.some((e) => e.reason === write.reason && e.ref === write.ref);
    if (duplicate) return null;
    const entry = { userId: write.userId, cents: write.cents, reason: write.reason, ref: write.ref };
    state.entries.push(entry);
    return { id: `entry-${state.entries.length}`, delta: write.cents, ...entry };
  },
}));

const { POST } = await import('./route');

function signedRequest(payload: unknown, secret: string = SECRET) {
  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac('sha512', secret).update(rawBody, 'utf8').digest('hex');
  return new Request('http://localhost/api/webhooks/paystack', {
    method: 'POST',
    headers: { 'x-paystack-signature': signature, 'content-type': 'application/json' },
    body: rawBody,
  }) as unknown as Parameters<typeof POST>[0];
}

const chargePayload = {
  event: 'charge.success',
  data: {
    reference: 'posta_ref_topup_1',
    amount: 29900, // R299 in cents. No VAT: DWT is not VAT registered.
    metadata: { userId: 'user-1', credits: 100 },
    customer: { email: 'thabo@example.co.za' },
  },
};

beforeEach(() => {
  state.entries = [];
  state.events = new Map();
  process.env.PAYSTACK_SECRET_KEY = SECRET;
});

describe('POST /api/webhooks/paystack — charge.success', () => {
  it('appends one positive cents entry for a top-up', async () => {
    const response = await POST(signedRequest(chargePayload));

    expect(response.status).toBe(200);
    expect(state.entries).toEqual([
      { userId: 'user-1', cents: 29900, reason: 'paystack_charge', ref: 'posta_ref_topup_1' },
    ]);
  });

  it('credits a replayed delivery exactly once', async () => {
    const first = await POST(signedRequest(chargePayload));
    const second = await POST(signedRequest(chargePayload));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].cents).toBe(29900);
  });

  it('records what was paid, not credits × R1: 100 credits bought for R150 credit R150', async () => {
    await POST(
      signedRequest({
        event: 'charge.success',
        data: {
          reference: 'posta_ref_pack_150',
          amount: 15000,
          metadata: { userId: 'user-1', credits: 100 },
        },
      })
    );

    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].cents).toBe(15000);
  });

  it('does not treat a subscription charge as a wallet top-up', async () => {
    await POST(
      signedRequest({
        event: 'charge.success',
        data: {
          reference: 'posta_ref_plan',
          amount: 29900,
          plan: { plan_code: 'PLN_pro' },
          metadata: { userId: 'user-1', tier: 'pro', credits: 500 },
        },
      })
    );

    expect(state.entries).toHaveLength(0);
  });

  it('rejects an unsigned payload before touching the ledger', async () => {
    const response = await POST(
      signedRequest(chargePayload, 'sk_test_wrong_secret')
    );

    expect(response.status).toBe(401);
    expect(state.entries).toHaveLength(0);
  });
});
