// Relative on purpose: keep this module loadable under plain `npx vitest` regardless of alias config.
import { isAbsoluteMediaUrl } from '../media/url';

/**
 * The decision a poster makes before it calls a platform: post the image, or post text only and say
 * why. A platform rejecting a bad URL produces an error that reads like a platform problem; naming the
 * rejected value here means the log points at us instead.
 *
 * Deliberately strict (spec: blueprint/specs/01-absolute-media-url.md, criterion 3): anything that is
 * not ALREADY an absolute http(s) URL is refused, not repaired. lib/posting cannot know what a
 * relative path is relative to — the image API owns that conversion (lib/media/url.ts) — so a
 * relative path arriving here is a caller bug, and honest text-only degradation beats guessing.
 */
export interface MediaResolution {
  url: string | null;
  textOnly: boolean;
  warning?: string;
}

export function resolvePostableMediaUrl(
  imageUrl: string | null | undefined
): MediaResolution {
  const value = (imageUrl || '').trim();

  if (!value) {
    // Nothing was supplied — a text-only post is the normal path, not a problem.
    return { url: null, textOnly: true };
  }

  if (isAbsoluteMediaUrl(value)) {
    return { url: value, textOnly: false };
  }

  return {
    url: null,
    textOnly: true,
    warning: `Media not posted: "${value}" is not an absolute http(s) URL, so the platform could not fetch it. Posting text only.`,
  };
}
