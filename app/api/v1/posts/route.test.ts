/**
 * FEATURE-API — POST /api/v1/posts.
 * Limits are checked before any write: a rejected request must leave zero rows behind.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  user: { id: 'user-1', tier: 'free', credits: 3 } as {
    id: string;
    tier: string;
    credits: number;
  },
  queued: 0,
  inserted: [] as Array<Record<string, unknown>>,
}));

vi.mock('../../../../lib/api/v1/auth', () => ({
  authenticateApiRequest: async () => ({ ok: true, userId: 'user-1', apiKeyId: 'key-1' }),
  apiAuthErrorResponse: (failure: { error: string; message: string; status: number }) =>
    Response.json({ error: failure.error, message: failure.message }, { status: failure.status }),
}));

vi.mock('../../../../lib/api/v1/store', () => ({
  getUser: async () => state.user,
  countQueuedPosts: async () => state.queued,
  insertScheduledPosts: async (rows: Array<Record<string, unknown>>) => {
    state.inserted.push(...rows);
    return rows.map((row, index) => ({ ...row, id: `post-${index + 1}` }));
  },
}));

const { POST } = await import('./route');

function schedule(body: Record<string, unknown>) {
  return POST(
    new Request('http://localhost/api/v1/posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

const validBody = {
  content: 'Sharp sharp Joburg! New winter menu is live.',
  platforms: ['instagram'],
  scheduledAt: '2026-12-01T09:00:00.000Z',
};

beforeEach(() => {
  state.user = { id: 'user-1', tier: 'free', credits: 3 };
  state.queued = 0;
  state.inserted = [];
});

describe('POST /api/v1/posts', () => {
  it('rejects a full queue with the limit named and writes nothing', async () => {
    state.queued = 5; // free tier queueSize is 5

    const response = await schedule(validBody);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe('queue_limit_reached');
    expect(body.limit).toBe(5);
    expect(body.message).toContain('5');
    expect(state.inserted).toHaveLength(0);
  });

  it('rejects insufficient credits and leaves the balance untouched', async () => {
    state.user.credits = 0;

    const response = await schedule(validBody);
    const body = await response.json();

    expect(response.status).toBe(402);
    expect(body.error).toBe('insufficient_credits');
    expect(body.required).toBe(1);
    expect(state.inserted).toHaveLength(0);
    expect(state.user.credits).toBe(0);
  });

  it('charges one credit per platform, so two platforms on one credit is rejected', async () => {
    state.user.credits = 1;

    const response = await schedule({ ...validBody, platforms: ['instagram', 'linkedin'] });
    const body = await response.json();

    expect(response.status).toBe(402);
    expect(body.required).toBe(2);
    expect(state.inserted).toHaveLength(0);
  });

  it('creates one scheduled row per platform for a valid request', async () => {
    const response = await schedule({ ...validBody, platforms: ['instagram', 'linkedin'] });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.posts).toHaveLength(2);
    expect(body.posts.map((p: { platform: string }) => p.platform)).toEqual([
      'instagram',
      'linkedin',
    ]);
    expect(body.posts.every((p: { status: string }) => p.status === 'scheduled')).toBe(true);
    expect(body.posts.every((p: { id?: string }) => Boolean(p.id))).toBe(true);
    expect(state.inserted).toHaveLength(2);
    expect(state.inserted.map((row) => row.platform)).toEqual(['instagram', 'linkedin']);
  });

  it('rejects an unknown platform by name and writes nothing', async () => {
    const response = await schedule({ ...validBody, platforms: ['myspace'] });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('unknown_platform');
    expect(body.message).toContain('myspace');
    expect(state.inserted).toHaveLength(0);
  });

  it('accepts "now" as a schedule time', async () => {
    const response = await schedule({ ...validBody, scheduledAt: 'now' });

    expect(response.status).toBe(201);
    expect(state.inserted[0]!.scheduledDate).toBeInstanceOf(Date);
  });
});
