/**
 * The single owner of "is this media URL something a platform can actually fetch?"
 *
 * Why this module exists: /api/ai/generate-image used to return `/generated/<hash>.jpg`, a RELATIVE
 * path. Instagram and Facebook fetch media server-side by URL, so a relative path can never resolve —
 * and the platform reports a generic error that looks like their problem, not ours. Every caller now
 * goes through here, so there is one definition of "postable" instead of four.
 */

/** Production host. A relative path is only useful if we know what it is relative TO. */
export const DEFAULT_MEDIA_BASE = 'https://posta.digitalwavetech.dev';

/** Filesystem roots that must never be treated as a servable path. */
const FILESYSTEM_ROOTS = ['/root/', '/home/', '/tmp/', '/var/', '/opt/', '/usr/', '/mnt/', '/srv/'];

export function mediaBaseUrl(envValue: string | undefined = process.env.NEXT_PUBLIC_APP_URL): string {
  const raw = (envValue || '').trim();
  const base = raw.length > 0 ? raw : DEFAULT_MEDIA_BASE;
  return base.replace(/\/+$/, '');
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isFilesystemPath(value: string): boolean {
  if (/(^|\/)public\//.test(value)) return true;
  if (/^[a-z]:[\\/]/i.test(value)) return true; // windows drive
  return FILESYSTEM_ROOTS.some((root) => value.startsWith(root));
}

/**
 * Returns an absolute http(s) URL, or null when the input is not postable.
 *
 * null is deliberate rather than throwing: a caller that receives null can degrade to a text-only
 * post and tell the user, which is better than a crash or a request the platform will reject.
 */
export function absoluteMediaUrl(
  input: string | null | undefined,
  base: string = mediaBaseUrl()
): string | null {
  const value = (input || '').trim();
  if (!value) return null;
  if (isAbsoluteUrl(value)) return value;
  if (isFilesystemPath(value)) return null;

  // A servable path must be rooted, e.g. "/generated/<hash>.jpg". A bare "x.jpg" is ambiguous
  // (relative to what?) and is refused rather than guessed at.
  if (!value.startsWith('/')) return null;

  return `${base.replace(/\/+$/, '')}${value}`;
}

/** The absolute URL the image API must return for a file it just wrote. */
export function generatedMediaUrl(
  fileName: string,
  base: string | undefined = undefined
): string {
  return `${mediaBaseUrl(base)}/generated/${fileName}`;
}
