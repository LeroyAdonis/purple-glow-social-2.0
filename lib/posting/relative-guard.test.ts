import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostService } from './post-service';
import { getConnectedAccount, getDecryptedToken } from '@/lib/db/connected-accounts';

vi.mock('@/lib/db/connected-accounts', () => ({
  getConnectedAccount: vi.fn(),
  getDecryptedToken: vi.fn(),
}));
vi.mock('@/drizzle/db', () => ({ db: {} }));
vi.mock('@/drizzle/schema', () => ({ posts: {} }));

function jsonResponse(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input);
  if (url.includes('graph.facebook.com') && url.includes('fields=status_code')) {
    return jsonResponse({ status_code: 'FINISHED' });
  }
  if (url.includes('/photos')) return jsonResponse({ id: 'photo_1' });
  if (url.includes('/media_publish')) return jsonResponse({ id: 'ig_1' });
  if (url.includes('/media')) return jsonResponse({ id: 'container_1' });
  if (url.includes('/feed')) return jsonResponse({ id: 'post_1' });
  return jsonResponse({ id: 'generic_1' });
});

describe('relative media URL guard (lib/posting)', () => {
  let service: PostService;

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    vi.mocked(getConnectedAccount).mockResolvedValue({
      platformUserId: 'page-1',
      isActive: true,
    } as Awaited<ReturnType<typeof getConnectedAccount>>);
    vi.mocked(getDecryptedToken).mockResolvedValue('token-1');
    service = new PostService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts text-only and warns when a poster is handed a relative image URL', async () => {
    const result = await service.postToPlatform('user-1', 'facebook', {
      content: 'Sharp sharp, Mzansi!',
      imageUrl: '/generated/x.jpg',
    });

    // A failed image must not fail the post.
    expect(result.success).toBe(true);
    expect(result.warnings?.some((w) => w.includes('/generated/x.jpg'))).toBe(true);

    // The platform must never receive the relative path.
    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls.some((u) => u.includes('/photos'))).toBe(false);

    const feedCall = fetchMock.mock.calls.find((call) => String(call[0]).includes('/feed'));
    expect(feedCall).toBeDefined();
    const body = JSON.parse(String((feedCall as unknown[])[1]?.body));
    expect(body.message).toBe('Sharp sharp, Mzansi!');
    expect(body.url).toBeUndefined();
  });

  it('does not throw and reports the rejection on Instagram, which cannot post text-only', async () => {
    const result = await service.postToPlatform('user-1', 'instagram', {
      content: 'Sawubona, Mzansi!',
      imageUrl: '/generated/x.jpg',
    });

    expect(result.success).toBe(false);
    expect(result.warnings?.some((w) => w.includes('/generated/x.jpg'))).toBe(true);
    // No doomed media request reached the platform.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('passes an absolute https image URL straight through to the platform', async () => {
    const result = await service.postToPlatform('user-1', 'facebook', {
      content: 'Lekker Friday!',
      imageUrl: 'https://posta.digitalwavetech.dev/generated/abc.jpg',
    });

    expect(result.success).toBe(true);
    expect(result.warnings ?? []).toHaveLength(0);

    const photosCall = fetchMock.mock.calls.find((call) => String(call[0]).includes('/photos'));
    expect(photosCall).toBeDefined();
    const body = JSON.parse(String((photosCall as unknown[])[1]?.body));
    expect(body.url).toBe('https://posta.digitalwavetech.dev/generated/abc.jpg');
  });
});
