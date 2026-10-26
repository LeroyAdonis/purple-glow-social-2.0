/**
 * S1 / DIG-46 step 4 — the deduction gate on publish.
 *
 * Credits come off only for a platform that actually published. The old route charged up front and
 * refunded on failure, which meant the balance moved for posts that never existed and the refund could be
 * missed. Here the charge happens after the platform confirms, so:
 *   - publish succeeds → balance down by the platform count,
 *   - publish fails    → balance untouched (no charge, no refund),
 *   - generation       → not this route; nothing here touches the ledger before publishing.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface PlatformResult {
  success: boolean;
  platform: string;
  postId?: string;
  postUrl?: string;
  error?: string;
}

const state = vi.hoisted(() => ({
  balanceCents: 1000,
  results: [] as PlatformResult[],
  charges: [] as Array<{ userId: string; cents: number; reason: string; ref?: string | null }>,
  publishCalls: 0,
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: async () => ({ user: { id: 'user-1', email: 'thabo@example.co.za' } }) } },
}));

vi.mock('@/lib/security/rate-limit', () => ({
  rateLimiters: { contentGen: { limit: async () => ({ success: true }) } },
}));

vi.mock('@/drizzle/db', () => ({
  db: {
    query: {
      posts: { findFirst: async () => null },
      user: { findFirst: async () => ({ id: 'user-1', tier: 'pro' }) },
    },
    update: () => ({ set: () => ({ where: async () => undefined }) }),
  },
}));

vi.mock('@/lib/db/daily-usage', () => ({
  getDailyUsage: async () => null,
  incrementPosts: async () => undefined,
}));

vi.mock('@/lib/db/credit-reservations', () => ({
  getAvailableCredits: async () => Math.floor(state.balanceCents / 100),
}));

vi.mock('@/lib/posting/post-service', () => ({
  PostService: class {
    async postToMultiplePlatforms() {
      state.publishCalls += 1;
      return state.results;
    }
  },
}));

vi.mock('@/lib/db/credit-ledger', () => ({
  spendCredits: async (params: { userId: string; cents: number; reason: string; ref?: string | null }) => {
    if (state.balanceCents < params.cents) {
      return { success: false as const, balance: state.balanceCents, error: 'insufficient_funds' as const };
    }
    state.balanceCents -= params.cents;
    state.charges.push(params);
    return { success: true as const, balance: state.balanceCents, alreadyRecorded: false };
  },
}));

const { POST } = await import('./route');

function publish(body: Record<string, unknown>) {
  return POST(
    new Request('http://localhost/api/posts/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }) as unknown as Parameters<typeof POST>[0]
  );
}

const twoPlatforms = { content: 'Sharp sharp Joburg!', platforms: ['twitter', 'linkedin'] };

beforeEach(() => {
  state.balanceCents = 1000;
  state.charges = [];
  state.publishCalls = 0;
  state.results = [
    { success: true, platform: 'twitter', postId: 'tw-1', postUrl: 'https://x.com/i/1' },
    { success: true, platform: 'linkedin', postId: 'li-1', postUrl: 'https://linkedin.com/1' },
  ];
});

describe('POST /api/posts/publish — charging', () => {
  it('charges the platform count when every platform published', async () => {
    const response = await publish(twoPlatforms);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(state.charges).toHaveLength(1);
    expect(state.charges[0].cents).toBe(200); // 2 platforms × R1
    expect(state.charges[0].reason).toBe('publish');
    expect(state.balanceCents).toBe(800);
    expect(body.creditsDeducted).toBe(2);
    expect(body.creditsRemaining).toBe(8);
  });

  it('charges nothing when the publish fails', async () => {
    state.results = [{ success: false, platform: 'twitter', error: 'token expired' }];

    const response = await publish({ content: 'Sharp sharp!', platforms: ['twitter'] });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(state.charges).toHaveLength(0);
    expect(state.balanceCents).toBe(1000);
    expect(body.creditsDeducted).toBe(0);
    expect(body.creditsRemaining).toBe(10);
  });

  it('charges only the platforms that published on a partial result', async () => {
    state.results = [
      { success: true, platform: 'twitter', postId: 'tw-1', postUrl: 'https://x.com/i/1' },
      { success: false, platform: 'linkedin', error: 'rate limited' },
    ];

    const response = await publish(twoPlatforms);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.partial).toBe(true);
    expect(state.charges).toHaveLength(1);
    expect(state.charges[0].cents).toBe(100);
    expect(state.balanceCents).toBe(900);
    expect(body.creditsDeducted).toBe(1);
  });

  it('refuses to publish on an empty wallet and leaves the balance untouched', async () => {
    state.balanceCents = 0;

    const response = await publish(twoPlatforms);
    const body = await response.json();

    expect(response.status).toBe(402);
    expect(body.error).toBe('Insufficient credits');
    expect(state.publishCalls).toBe(0);
    expect(state.charges).toHaveLength(0);
    expect(state.balanceCents).toBe(0);
  });
});
