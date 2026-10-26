/**
 * FEATURE-API — bearer key auth.
 * The DB is mocked: these tests pin the three distinct failures, the lastUsedAt stamp,
 * and the rule that only a hash ever reaches storage.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import type { ApiKeyRow } from './store';

const state = vi.hoisted(() => ({ rows: [] as ApiKeyRow[] }));

vi.mock('./store', () => ({
  findApiKeyByHash: async (keyHash: string) =>
    state.rows.find((row) => row.keyHash === keyHash) ?? null,
  touchApiKey: async (id: string, at: Date) => {
    const row = state.rows.find((r) => r.id === id);
    if (row) row.lastUsedAt = at;
  },
}));

const { authenticateApiRequest, generateApiKey, hashApiKey } = await import('./auth');

function keyRow(overrides: Partial<ApiKeyRow> = {}): ApiKeyRow {
  return {
    id: 'key-1',
    userId: 'user-1',
    name: 'agent',
    keyHash: hashApiKey('posta_validkey'),
    keyPrefix: 'posta_va',
    lastUsedAt: null,
    revokedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/v1/integrations', { headers });
}

beforeEach(() => {
  state.rows = [];
});

describe('authenticateApiRequest', () => {
  it('rejects a request with no Authorization header as missing_key', async () => {
    const result = await authenticateApiRequest(request());

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.error).toBe('missing_key');
    expect(result.status).toBe(401);
    expect(result.message).toContain('Authorization');
  });

  it('rejects a blank or malformed header as missing_key', async () => {
    for (const header of ['', 'Bearer', 'Bearer ', 'Token posta_abc']) {
      const result = await authenticateApiRequest(request({ authorization: header }));
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('expected failure');
      expect(result.error).toBe('missing_key');
    }
  });

  it('rejects an unknown key as unknown_key', async () => {
    state.rows = [keyRow()];

    const result = await authenticateApiRequest(request({ authorization: 'Bearer posta_nope' }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.error).toBe('unknown_key');
    expect(result.status).toBe(403);
  });

  it('rejects a revoked key as revoked_key', async () => {
    state.rows = [keyRow({ revokedAt: new Date('2026-02-01T00:00:00Z') })];

    const result = await authenticateApiRequest(request({ authorization: 'Bearer posta_validkey' }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.error).toBe('revoked_key');
    expect(result.status).toBe(410);
  });

  it('gives the three failures three different statuses and codes', async () => {
    state.rows = [keyRow()];

    const missing = await authenticateApiRequest(request());
    const unknown = await authenticateApiRequest(request({ authorization: 'Bearer posta_nope' }));
    state.rows = [keyRow({ revokedAt: new Date() })];
    const revoked = await authenticateApiRequest(request({ authorization: 'Bearer posta_validkey' }));

    for (const result of [missing, unknown, revoked]) {
      expect(result.ok).toBe(false);
    }
    const failures = [missing, unknown, revoked] as Array<{ status: number; error: string }>;
    expect(new Set(failures.map((f) => f.status)).size).toBe(3);
    expect(new Set(failures.map((f) => f.error)).size).toBe(3);
  });

  it('resolves the owner and stamps lastUsedAt for a valid key', async () => {
    state.rows = [keyRow()];

    const result = await authenticateApiRequest(request({ authorization: 'Bearer posta_validkey' }));

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected success');
    expect(result.userId).toBe('user-1');
    expect(result.apiKeyId).toBe('key-1');
    expect(state.rows[0]!.lastUsedAt).toBeInstanceOf(Date);
  });

  it('never stores or looks up the plaintext key, only its sha-256', async () => {
    const generated = generateApiKey();
    state.rows = [
      keyRow({ keyHash: generated.keyHash, keyPrefix: generated.keyPrefix }),
    ];

    expect(generated.key).toMatch(/^posta_[0-9a-f]{48}$/);
    expect(generated.keyPrefix).toBe(generated.key.slice(0, 8));
    expect(generated.keyHash).toBe(createHash('sha256').update(generated.key).digest('hex'));
    expect(generated.keyHash).not.toBe(generated.key);

    const result = await authenticateApiRequest(
      request({ authorization: `Bearer ${generated.key}` })
    );

    expect(result.ok).toBe(true);
    expect(state.rows[0]!.keyHash).not.toBe(generated.key);
  });
});
