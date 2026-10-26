/**
 * FEATURE-API — GET /api/v1/integrations.
 * Never returns a token, only enough to know whether it still works.
 */
import { describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  integrations: [
    {
      platform: 'instagram',
      displayName: 'Thabo Kasi Kitchen',
      connectedAt: new Date('2026-01-05T10:00:00.000Z'),
      tokenExpiresAt: new Date('2027-01-05T10:00:00.000Z'),
      isActive: true,
      accessToken: 'secret-token-value',
    },
    {
      platform: 'linkedin',
      displayName: 'Kasi Kitchen Pty Ltd',
      connectedAt: new Date('2026-01-06T10:00:00.000Z'),
      tokenExpiresAt: new Date('2026-02-01T10:00:00.000Z'),
      isActive: true,
      accessToken: 'other-secret-token',
    },
  ],
}));

vi.mock('../../../../lib/api/v1/auth', () => ({
  authenticateApiRequest: async () => ({ ok: true, userId: 'user-1', apiKeyId: 'key-1' }),
  apiAuthErrorResponse: (failure: { error: string; message: string; status: number }) =>
    Response.json({ error: failure.error, message: failure.message }, { status: failure.status }),
}));

vi.mock('../../../../lib/api/v1/store', () => ({
  getIntegrations: async () => state.integrations,
}));

const { GET } = await import('./route');

describe('GET /api/v1/integrations', () => {
  it('lists platform, display name, connect date and token health without tokens', async () => {
    const response = await GET(new Request('http://localhost/api/v1/integrations'));
    const body = await response.json();
    const raw = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body.integrations).toEqual([
      {
        platform: 'instagram',
        displayName: 'Thabo Kasi Kitchen',
        connectedAt: '2026-01-05T10:00:00.000Z',
        tokenHealth: 'ok',
      },
      {
        platform: 'linkedin',
        displayName: 'Kasi Kitchen Pty Ltd',
        connectedAt: '2026-01-06T10:00:00.000Z',
        tokenHealth: 'needs_reauth',
      },
    ]);
    expect(raw).not.toContain('secret-token');
    expect(raw).not.toContain('accessToken');
  });
});
