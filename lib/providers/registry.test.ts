import { describe, expect, it } from 'vitest';
import {
  getProvider,
  listProviders,
  registerProvider,
  UnknownProviderError,
} from './registry';
import type { PlatformName, PublishOutcome, SocialProvider } from './types';

const FOUR: PlatformName[] = ['instagram', 'facebook', 'twitter', 'linkedin'];

function fakeProvider(name: string): SocialProvider {
  return {
    identifier: name as PlatformName,
    displayName: 'Fake',
    scopes: ['fake.scope'],
    maxLength: 100,
    requiresMedia: false,
    async publish(): Promise<PublishOutcome> {
      return { status: 'published', platformPostId: 'fake-1' };
    },
  };
}

describe('provider registry', () => {
  it('returns one provider per existing platform, and it satisfies the contract', () => {
    for (const name of FOUR) {
      const provider = getProvider(name);
      expect(provider.identifier).toBe(name);
      expect(typeof provider.publish).toBe('function');
    }
  });

  it('lists all four existing providers', () => {
    const identifiers = listProviders().map((p) => p.identifier);
    for (const name of FOUR) expect(identifiers).toContain(name);
  });

  it('throws a typed error naming an unknown platform', () => {
    expect(() => getProvider('threads')).toThrow(UnknownProviderError);
    expect(() => getProvider('threads')).toThrow(/threads/);
  });

  it('returns a provider registered at test time', () => {
    const fake = fakeProvider('fake-channel');
    expect(() => getProvider('fake-channel')).toThrow(UnknownProviderError);

    registerProvider(fake);

    expect(getProvider('fake-channel')).toBe(fake);
    expect(listProviders().map((p) => p.identifier)).toContain('fake-channel');
  });
});
