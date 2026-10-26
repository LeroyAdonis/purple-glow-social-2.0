import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn(async () => ({ user: { id: 'user-test' } })) } },
}));
vi.mock('@/lib/security/rate-limit', () => ({
  rateLimiters: { contentGen: { limit: vi.fn(async () => ({ success: true })) } },
}));
vi.mock('@/lib/logger', () => ({
  logger: {
    ai: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), exception: vi.fn() },
  },
}));

const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');
const MIN_CACHED_BYTES = 20 * 1024;
const FAKE_BASE64 = Buffer.alloc(MIN_CACHED_BYTES + 1024, 7).toString('base64');

const ABSOLUTE_DEFAULT = /^https:\/\/posta\.digitalwavetech\.dev\/generated\/[a-f0-9]{64}\.jpg$/;

function imageRequest(prompt: string, seed: number): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai/generate-image', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, seed }),
  });
}

describe('POST /api/ai/generate-image returns fetchable absolute URLs', () => {
  const originalKey = process.env.NVIDIA_API_KEY;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const createdFiles: string[] = [];

  function rememberFile(imageUrl: string): void {
    const name = String(imageUrl).split('/').pop();
    if (name) createdFiles.push(name);
  }

  beforeEach(() => {
    process.env.NVIDIA_API_KEY = 'test-key';
    delete process.env.NEXT_PUBLIC_APP_URL;
    // Mock the NVIDIA NIM call: return a usable fake image.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({ artifacts: [{ base64: FAKE_BASE64, finishReason: 'SUCCESS' }] }),
          } as unknown as Response)
      )
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.NVIDIA_API_KEY;
    else process.env.NVIDIA_API_KEY = originalKey;
    if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    await Promise.all(createdFiles.map((f) => unlink(path.join(GENERATED_DIR, f)).catch(() => {})));
    createdFiles.length = 0;
  });

  it('fresh generation returns an absolute https imageUrl on the production host by default', async () => {
    const res = await POST(imageRequest('a fresh lemon tree for the media-url spec', 1234));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.cached).toBe(false);
    expect(body.imageUrl).toMatch(ABSOLUTE_DEFAULT);
    rememberFile(body.imageUrl);
  });

  it('cached branch returns the same absolute shape as the fresh branch', async () => {
    // First call generates and caches the file on disk...
    const first = await POST(imageRequest('a cached pottery studio for the media-url spec', 5678));
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    rememberFile(firstBody.imageUrl);

    // ...second call must hit the cache and still return the same absolute URL.
    const second = await POST(imageRequest('a cached pottery studio for the media-url spec', 5678));
    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.cached).toBe(true);
    expect(secondBody.imageUrl).toMatch(ABSOLUTE_DEFAULT);
    expect(secondBody.imageUrl).toBe(firstBody.imageUrl);
  });
});
