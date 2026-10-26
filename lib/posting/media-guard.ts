// Relative on purpose: this repo has no vitest config, so the `@/` alias does not resolve under
// `npx vitest`. A test that cannot run is not a test.
import { absoluteMediaUrl } from '../media/url';

/**
 * The decision a poster makes before it calls a platform: post the image, or post text only and say
 * why. A platform rejecting a bad URL produces an error that reads like a platform problem; naming the
 * rejected value here means the log points at us instead.
 */
export interface MediaResolution {
  url: string | null;
  textOnly: boolean;
  warning?: string;
}

export function resolvePostableMediaUrl(
  imageUrl: string | null | undefined,
  base?: string
): MediaResolution {
  const value = (imageUrl || '').trim();

  if (!value) {
    // Nothing was supplied — a text-only post is the normal path, not a problem.
    return { url: null, textOnly: true };
  }

  const url = absoluteMediaUrl(value, base);
  if (url) {
    return { url, textOnly: false };
  }

  return {
    url: null,
    textOnly: true,
    warning: `Media not posted: "${value}" is not an absolute http(s) URL, so the platform could not fetch it. Posting text only.`,
  };
}
