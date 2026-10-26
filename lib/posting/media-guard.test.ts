import { describe, it, expect } from 'vitest';
import { resolvePostableMediaUrl } from './media-guard';

/**
 * A poster handed a non-postable URL must post text-only and SAY why, rather than sending a doomed
 * request the platform will reject with an error that looks like our bug is theirs.
 *
 * Spec: blueprint/specs/01-absolute-media-url.md — anything that is not already an absolute http(s)
 * URL is refused, not repaired; the image API owns the relative->absolute conversion.
 */
describe('resolvePostableMediaUrl', () => {
  const file = 'd'.repeat(64) + '.jpg';

  it('rejects a relative /generated path instead of guessing what it is relative to', () => {
    const rejected = `/generated/${file}`;
    const r = resolvePostableMediaUrl(rejected);
    expect(r.url).toBeNull();
    expect(r.textOnly).toBe(true);
    expect(r.warning).toContain(rejected);
    expect(r.warning?.toLowerCase()).toContain('not an absolute');
  });

  it('passes an absolute URL through and flags nothing', () => {
    const r = resolvePostableMediaUrl('https://cdn.example/x.jpg');
    expect(r.url).toBe('https://cdn.example/x.jpg');
    expect(r.textOnly).toBe(false);
    expect(r.warning).toBeUndefined();
  });

  it('degrades to text-only WITH the rejected URL named, for a filesystem path', () => {
    const rejected = '/root/posta-revive/public/generated/x.jpg';
    const r = resolvePostableMediaUrl(rejected);
    expect(r.url).toBeNull();
    expect(r.textOnly).toBe(true);
    expect(r.warning).toContain(rejected);
    expect(r.warning?.toLowerCase()).toContain('not an absolute');
  });

  it('is text-only, not an error, when there simply is no image', () => {
    const r = resolvePostableMediaUrl(undefined);
    expect(r.url).toBeNull();
    expect(r.textOnly).toBe(true);
    expect(r.warning).toBeUndefined();
  });
});
