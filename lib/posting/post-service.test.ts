import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostService } from './post-service';
import { getConnectedAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
import { registerProvider } from '@/lib/providers/registry';
import type { PlatformName, PublishInput, PublishOutcome, SocialProvider } from '@/lib/providers/types';

vi.mock('@/lib/db/connected-accounts', () => ({
  getConnectedAccount: vi.fn(),
  getDecryptedToken: vi.fn(),
}));
vi.mock('@/drizzle/db', () => ({ db: {} }));
vi.mock('@/drizzle/schema', () => ({ posts: {} }));

function fakeProvider(name: string, publish: SocialProvider['publish']): SocialProvider {
  return {
    identifier: name as PlatformName,
    displayName: 'Fake Channel',
    scopes: ['fake.scope'],
    maxLength: 500,
    requiresMedia: false,
    publish,
  };
}

describe('PostService provider resolution', () => {
  let service: PostService;

  beforeEach(() => {
    vi.mocked(getConnectedAccount).mockResolvedValue({
      platformUserId: 'account-1',
      isActive: true,
    } as Awaited<ReturnType<typeof getConnectedAccount>>);
    vi.mocked(getDecryptedToken).mockResolvedValue('token-1');
    service = new PostService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fails, naming the platform, when no provider is registered for it', async () => {
    const result = await service.postToPlatform('user-1', 'threads' as PlatformName, {
      content: 'Sawubona, Mzansi!',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('threads');
  });

  it('never hands a provider a relative image path', async () => {
    const publish = vi.fn(
      async (_input: PublishInput): Promise<PublishOutcome> => ({
        status: 'published',
        platformPostId: 'fake-1',
        url: 'https://fake.example/1',
      })
    );
    registerProvider(fakeProvider('bluesky', publish));

    const result = await service.postToPlatform('user-1', 'bluesky' as PlatformName, {
      content: 'Sharp sharp!',
      imageUrl: '/generated/abc.jpg',
    });

    expect(publish).toHaveBeenCalledTimes(1);
    const input = publish.mock.calls[0]![0] as PublishInput;
    expect(input.content.mediaUrl).not.toBe('/generated/abc.jpg');
    expect(input.content.mediaUrl).toBeNull();
    expect(result.success).toBe(true);
    expect(result.warnings?.some((w) => w.includes('/generated/abc.jpg'))).toBe(true);
  });

  it('hands a provider an absolute image URL untouched', async () => {
    const publish = vi.fn(
      async (_input: PublishInput): Promise<PublishOutcome> => ({
        status: 'published',
        platformPostId: 'fake-2',
      })
    );
    registerProvider(fakeProvider('mastodon', publish));

    const imageUrl = 'https://posta.digitalwavetech.dev/generated/abc.jpg';
    await service.postToPlatform('user-1', 'mastodon' as PlatformName, {
      content: 'Lekker Friday!',
      imageUrl,
    });

    const input = publish.mock.calls[0]![0] as PublishInput;
    expect(input.content.mediaUrl).toBe(imageUrl);
  });

  it('publishes through a provider registered at test time, with no edit to post-service.ts', async () => {
    // The registry is the only seam: post-service never mentions this channel anywhere.
    const publish = vi.fn(
      async (_input: PublishInput): Promise<PublishOutcome> => ({
        status: 'published',
        platformPostId: 'bluesky-post-1',
        url: 'https://bsky.example/post/1',
      })
    );
    registerProvider(fakeProvider('fake-fifth', publish));

    const result = await service.postToPlatform('user-1', 'fake-fifth' as PlatformName, {
      content: 'Howzit from a fifth channel',
    });

    expect(result).toEqual({
      success: true,
      platform: 'fake-fifth',
      postId: 'bluesky-post-1',
      postUrl: 'https://bsky.example/post/1',
    });
    const input = publish.mock.calls[0]![0] as PublishInput;
    expect(input.accessToken).toBe('token-1');
    expect(input.accountId).toBe('account-1');
  });

  it('reports a provider failure as an unsuccessful post instead of throwing', async () => {
    registerProvider(
      fakeProvider('failing-channel', async () => ({
        status: 'failed',
        kind: 'content',
        message: 'Caption too long',
      }))
    );

    const result = await service.postToPlatform('user-1', 'failing-channel' as PlatformName, {
      content: 'x'.repeat(10),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Caption too long');
  });
});
