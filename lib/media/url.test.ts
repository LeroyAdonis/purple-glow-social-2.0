import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { absoluteMediaUrl, GENERATED_MEDIA_BASE } from './url';

const HASH = 'a'.repeat(64); // sha256-length placeholder file name

describe('absoluteMediaUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    }
  });

  it('defaults to the real production host when NEXT_PUBLIC_APP_URL is unset', () => {
    expect(GENERATED_MEDIA_BASE).toBe('https://posta.digitalwavetech.dev');
    expect(absoluteMediaUrl(`/generated/${HASH}.jpg`)).toBe(
      `https://posta.digitalwavetech.dev/generated/${HASH}.jpg`
    );
  });

  it('honours NEXT_PUBLIC_APP_URL and does not double the slash when the env ends in /', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.test';
    expect(absoluteMediaUrl(`/generated/${HASH}.jpg`)).toBe(
      `https://example.test/generated/${HASH}.jpg`
    );

    process.env.NEXT_PUBLIC_APP_URL = 'https://example.test/';
    expect(absoluteMediaUrl(`/generated/${HASH}.jpg`)).toBe(
      `https://example.test/generated/${HASH}.jpg`
    );
  });

  it('passes an already-absolute https URL through unchanged', () => {
    expect(absoluteMediaUrl('https://cdn.example/x.jpg')).toBe('https://cdn.example/x.jpg');
  });

  it('rejects a bare filesystem path instead of silently fixing it', () => {
    expect(absoluteMediaUrl('/root/posta-revive/public/generated/x.jpg')).toBeNull();
    expect(absoluteMediaUrl(`${process.cwd()}/public/generated/x.jpg`)).toBeNull();
    expect(absoluteMediaUrl('file:///root/posta-revive/public/generated/x.jpg')).toBeNull();
  });
});
