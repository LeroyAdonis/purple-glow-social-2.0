import { describe, it, expect } from 'vitest';
import { resolvePostableMediaUrl } from './media-guard';

/**
 * A poster handed a non-postable URL must post text-only and SAY why, rather than sending a doomed
 * request the platform will reject with an error that looks like our bug is theirs.
 */
describe('resolvePostableMediaUrl', () => {
  const base = 'https://posta.digitalwavetech.dev';
  const file = 'd'.repeat(64) + '.jpg';

  it('returns an absolute URL for a served /generated path', () => {
    const r = resolvePostableMediaUrl(`/generated/${file}`, base);
    expect(r.url).toBe(`${base}/generated/${file}`);
    expect(r.warning).toBeUndefined();
    expect(r.textOnly).toBe(false);
  });

  it('passes an absolute URL through and flags nothing', () => {
    const r = resolvePostableMediaUrl('https://cdn.example/x.jpg', base);
    expect(r.url).toBe('https://cdn.example/x.jpg');
    expect(r.textOnly).toBe(false);
  });

  it('degrades to text-only WITH the rejected URL named, for a filesystem path', () => {
    const rejected = '/root/posta-revive/public/generated/x.jpg';
    const r = resolvePostableMediaUrl(rejected, base);
    expect(r.url).toBeNull();
    expect(r.textOnly).toBe(true);
    expect(r.warning).toContain(rejected);
    expect(r.warning?.toLowerCase()).toContain('not an absolute');
  });

  it('is text-only, not an error, when there simply is no image', () => {
    const r = resolvePostableMediaUrl(undefined, base);
    expect(r.url).toBeNull();
    expect(r.textOnly).toBe(true);
    expect(r.warning).toBeUndefined();
  });
});
