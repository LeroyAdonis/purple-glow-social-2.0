/**
 * The provider registry: the one place a channel is named.
 *
 * `post-service.ts` resolves providers from here by platform name, so adding a fifth channel means
 * calling `registerProvider` — never editing the service.
 */

import { facebookProvider } from './facebook';
import { instagramProvider } from './instagram';
import { linkedinProvider } from './linkedin';
import { twitterProvider } from './twitter';
import type { SocialProvider } from './types';

export class UnknownProviderError extends Error {
  constructor(readonly platform: string) {
    // Same wording the old per-platform switch used, so callers' error strings do not change.
    super(`Unsupported platform: ${platform}`);
    this.name = 'UnknownProviderError';
  }
}

const providers = new Map<string, SocialProvider>([
  [instagramProvider.identifier, instagramProvider],
  [facebookProvider.identifier, facebookProvider],
  [twitterProvider.identifier, twitterProvider],
  [linkedinProvider.identifier, linkedinProvider],
]);

/** Register or replace a provider. Overwriting an existing identifier is allowed, deliberately. */
export function registerProvider(provider: SocialProvider): void {
  providers.set(provider.identifier, provider);
}

export function getProvider(platform: string): SocialProvider {
  const provider = providers.get(platform);
  if (!provider) throw new UnknownProviderError(platform);
  return provider;
}

export function listProviders(): SocialProvider[] {
  return [...providers.values()];
}
