/**
 * Mock for @sentry/nextjs - uses factory functions so each import gets fresh mocks
 */
import { vi } from 'vitest';

export const addBreadcrumb = vi.fn();
export const captureMessage = vi.fn();
export const captureException = vi.fn();
export const setContext = vi.fn();
export const setUser = vi.fn();
export const configureScope = vi.fn((cb: (scope: any) => void) => cb({ setExtra: vi.fn() }));
export const withScope = vi.fn((cb: (scope: any) => void) => cb({ setExtra: vi.fn(), setTag: vi.fn() }));
