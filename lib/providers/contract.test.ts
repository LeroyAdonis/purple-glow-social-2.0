import { describe, expect, it } from 'vitest';
import { getProvider, listProviders } from './registry';
import type { PlatformName } from './types';

const FAILURE_KINDS = ['auth', 'content', 'transient'];

/**
 * Asserts the shape EVERY registered provider must have. It loops `listProviders()` on purpose: a
 * fifth provider cannot be added without passing this, and nobody has to remember to extend a list.
 */
describe('provider contract', () => {
  it('every registered provider declares the required metadata', () => {
    const providers = listProviders();
    expect(providers.length).toBeGreaterThanOrEqual(4);

    for (const provider of providers) {
      expect(provider.identifier.trim().length, `${provider.identifier} identifier`).toBeGreaterThan(0);
      expect(provider.displayName.trim().length, `${provider.identifier} displayName`).toBeGreaterThan(0);
      expect(provider.scopes.length, `${provider.identifier} scopes`).toBeGreaterThan(0);
      expect(provider.scopes.every((s) => s.trim().length > 0)).toBe(true);
      expect(provider.maxLength, `${provider.identifier} maxLength`).toBeGreaterThan(0);
      expect(typeof provider.requiresMedia).toBe('boolean');
      expect(typeof provider.publish).toBe('function');
    }
  });

  it('every provider is reachable by its own identifier', () => {
    for (const provider of listProviders()) {
      expect(getProvider(provider.identifier)).toBe(provider);
    }
  });

  it('every provider classifies a raw error into one of the three failure kinds', () => {
    for (const provider of listProviders()) {
      const kind = provider.classifyError?.(new Error('opaque platform failure'));
      expect(FAILURE_KINDS).toContain(kind);
    }
  });

  it('declares instagram as media-required and the other three as not', () => {
    const mediaRequired = (name: PlatformName) => getProvider(name).requiresMedia;

    expect(mediaRequired('instagram')).toBe(true);
    for (const name of ['facebook', 'twitter', 'linkedin'] as PlatformName[]) {
      expect(mediaRequired(name), `${name} requiresMedia`).toBe(false);
    }
  });
});
