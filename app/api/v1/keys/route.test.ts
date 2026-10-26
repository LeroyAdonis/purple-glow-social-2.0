/**
 * FEATURE-API — key management (session-authed, dashboard side).
 * The plaintext key exists exactly once: in the create response.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiKeyRow } from '../../../../lib/api/v1/store';

const state = vi.hoisted(() => ({
  keys: [] as ApiKeyRow[],
  seq: 0,
  session: { user: { id: 'user-1' } } as { user: { id: string } } | null,
}));

vi.mock('../../../../lib/auth', () => ({
  auth: { api: { getSession: async () => state.session } },
}));

vi.mock('../../../../lib/api/v1/store', () => ({
  createApiKey: async (input: {
    userId: string;
    name: string;
    keyHash: string;
    keyPrefix: string;
  }) => {
    const row: ApiKeyRow = {
      id: `key-${++state.seq}`,
      ...input,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: new Date('2026-03-01T00:00:00Z'),
    };
    state.keys.push(row);
    return row;
  },
  listApiKeys: async (userId: string) => state.keys.filter((key) => key.userId === userId),
  revokeApiKey: async (id: string, userId: string, at: Date) => {
    const row = state.keys.find((key) => key.id === id && key.userId === userId && !key.revokedAt);
    if (!row) return null;
    row.revokedAt = at;
    return row;
  },
  findApiKeyByHash: async (keyHash: string) =>
    state.keys.find((key) => key.keyHash === keyHash) ?? null,
  touchApiKey: async () => {},
}));

const { POST, GET } = await import('./route');
const { DELETE } = await import('./[id]/route');
const { authenticateApiRequest } = await import('../../../../lib/api/v1/auth');

function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/v1/keys', {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  state.keys = [];
  state.seq = 0;
  state.session = { user: { id: 'user-1' } };
});

describe('/api/v1/keys', () => {
  it('returns the plaintext key once, and never again in the list', async () => {
    const created = await POST(request('POST', { name: 'agent-cli' }));
    const createdBody = await created.json();

    expect(created.status).toBe(201);
    expect(createdBody.key).toMatch(/^posta_[0-9a-f]{48}$/);
    expect(createdBody.keyPrefix).toBe(createdBody.key.slice(0, 8));
    expect(state.keys[0]!.keyHash).not.toBe(createdBody.key);

    const listed = await GET(request('GET'));
    const listedBody = await listed.json();
    const raw = JSON.stringify(listedBody);

    expect(listed.status).toBe(200);
    expect(listedBody.keys).toHaveLength(1);
    expect(raw).not.toContain(createdBody.key);
    expect(raw).not.toContain(state.keys[0]!.keyHash);
    expect(listedBody.keys[0]).toEqual({
      id: 'key-1',
      name: 'agent-cli',
      keyPrefix: createdBody.keyPrefix,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: '2026-03-01T00:00:00.000Z',
    });
  });

  it('rejects key management without a session', async () => {
    state.session = null;

    expect((await POST(request('POST', { name: 'x' }))).status).toBe(401);
    expect((await GET(request('GET'))).status).toBe(401);
  });

  it('revokes a key, and the middleware then rejects it', async () => {
    const created = await POST(request('POST', { name: 'agent-cli' }));
    const createdBody = await created.json();

    const revoked = await DELETE(request('DELETE'), {
      params: Promise.resolve({ id: createdBody.id }),
    });
    const revokedBody = await revoked.json();

    expect(revoked.status).toBe(200);
    expect(revokedBody.revokedAt).toBeTruthy();
    expect(state.keys[0]!.revokedAt).toBeInstanceOf(Date);

    const authResult = await authenticateApiRequest(
      new Request('http://localhost/api/v1/posts', {
        headers: { authorization: `Bearer ${createdBody.key}` },
      })
    );

    expect(authResult.ok).toBe(false);
    if (authResult.ok) throw new Error('expected failure');
    expect(authResult.error).toBe('revoked_key');
  });

  it('404s when revoking another user key', async () => {
    state.session = { user: { id: 'user-2' } };

    const response = await DELETE(request('DELETE'), {
      params: Promise.resolve({ id: 'key-404' }),
    });

    expect(response.status).toBe(404);
  });
});
