// Accessibility utilities for Purple Glow Social

// Focus trap for modals
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Announce content to screen readers
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Generate unique IDs for ARIA labels
let idCounter = 0;
export const generateId = (prefix: string = 'id'): string => {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
};

// Check if element is visible
export const isElementVisible = (element: HTMLElement): boolean => {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
};

// Keyboard navigation helpers
export const handleArrowNavigation = (
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number
): number => {
  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      newIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      e.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      newIndex = items.length - 1;
      break;
  }

  items[newIndex]?.focus();
  return newIndex;
};

// Check color contrast ratio (WCAG AA requirement is 4.5:1 for normal text)
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Simple approximation - in production, use a proper color library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

// ARIA labels for common UI patterns
export const ARIA_LABELS = {
  modal: {
    close: 'Close modal',
    previous: 'Go to previous step',
    next: 'Go to next step',
    submit: 'Submit form',
  },
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
  },
  actions: {
    edit: 'Edit item',
    delete: 'Delete item',
    view: 'View details',
    search: 'Search',
    filter: 'Filter results',
    sort: 'Sort items',
  },
  status: {
    loading: 'Content is loading',
    success: 'Action completed successfully',
    error: 'An error occurred',
    warning: 'Warning message',
  },
};

// Focus management for modals
export class FocusManager {
  private previouslyFocused: HTMLElement | null = null;

  saveFocus() {
    this.previouslyFocused = document.activeElement as HTMLElement;
  }

  restoreFocus() {
    if (this.previouslyFocused && isElementVisible(this.previouslyFocused)) {
      this.previouslyFocused.focus();
    }
  }

  setInitialFocus(container: HTMLElement) {
    const autoFocus = container.querySelector<HTMLElement>('[autofocus]');
    if (autoFocus) {
      autoFocus.focus();
      return;
    }

    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    }
  }
}

// Skip link component helper
export const createSkipLink = (targetId: string, label: string = 'Skip to main content') => {
  return {
    href: `#${targetId}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-joburg-teal focus:text-white focus:rounded-lg',
    'aria-label': label,
  };
};

// Screen reader only CSS class helper
export const srOnly = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';
export const notSrOnly = 'static w-auto h-auto p-auto m-auto overflow-visible whitespace-normal';
