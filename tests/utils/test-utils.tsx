/**
 * Test Utilities
 * 
 * Provides custom render function with all necessary providers
 * for React Testing Library tests.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Mock Language Context Provider
 * Used to wrap components that use the LanguageContext
 */
const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Mock the context value
  const mockContext = {
    language: 'en' as const,
    setLanguage: vi.fn(),
  };

  // Create a minimal context provider
  return <div data-testid="language-provider">{children}</div>;
};

/**
 * Custom render function that wraps component with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <MockLanguageProvider>{children}</MockLanguageProvider>;
  };

  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Mock functions for common callbacks
 */
export const mockHandlers = {
  onClick: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onSchedule: vi.fn(),
  onPublish: vi.fn(),
  onUpgrade: vi.fn(),
  onDismiss: vi.fn(),
};

/**
 * Reset all mock handlers
 */
export const resetMockHandlers = () => {
  Object.values(mockHandlers).forEach(mock => mock.mockClear());
};

/**
 * Create a mock Date object for consistent time-based tests
 */
export const createMockDate = (date: string) => {
  return new Date(date);
};

/**
 * Wait for async updates (for animations, state updates, etc.)
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Helper to get userEvent instance (works around default export)
 */
export const getUserEvent = async () => {
  const userEventModule = await import('@testing-library/user-event');
  return userEventModule.default;
};
