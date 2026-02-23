# React Component Testing Guide

## Overview

This directory contains React Testing Library tests for UI components. The tests follow consistent patterns and best practices for maintainable, behavior-focused testing.

## Structure

```
tests/
├── components/           # Component tests
│   ├── limit-status-badge.test.tsx
│   ├── credit-cost-preview.test.tsx
│   ├── credit-expiry-warning.test.tsx
│   ├── language-selector.test.tsx
│   └── draft-card.test.tsx
├── utils/               # Test utilities
│   └── test-utils.tsx   # Custom render with providers
├── integration/         # Integration tests
├── unit/                # Unit tests
└── setup.ts             # Global test setup
```

## Test Utilities

### `renderWithProviders()`

Custom render function that wraps components with all necessary providers:

```typescript
import { render, screen } from '../utils/test-utils';

test('my component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mock Handlers

Pre-configured mock functions for common callbacks:

```typescript
import { mockHandlers, resetMockHandlers } from '../utils/test-utils';

test('button click', async () => {
  const { user } = await import('@testing-library/user-event');
  const userEvent = user.setup();
  
  render(<Button onClick={mockHandlers.onClick} />);
  await userEvent.click(screen.getByRole('button'));
  
  expect(mockHandlers.onClick).toHaveBeenCalledTimes(1);
});
```

## Testing Patterns

### 1. Basic Rendering

Always start with a "renders without crashing" test:

```typescript
describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 2. Props Validation

Test that props are correctly displayed:

```typescript
it('displays props correctly', () => {
  render(<Component title="Test Title" count={5} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

### 3. User Interactions

Use `@testing-library/user-event` for realistic interactions:

```typescript
it('handles button click', async () => {
  const onClick = vi.fn();
  const { user } = await import('@testing-library/user-event');
  const userEvent = user.setup();
  
  render(<Button onClick={onClick} />);
  await userEvent.click(screen.getByRole('button'));
  
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

### 4. Conditional Rendering

Test visibility logic:

```typescript
it('shows warning when threshold exceeded', () => {
  render(<Component value={95} threshold={90} />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

it('hides warning when below threshold', () => {
  render(<Component value={85} threshold={90} />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
```

### 5. Async Behavior

Use `waitFor` for async updates:

```typescript
it('opens dropdown on click', async () => {
  const { user } = await import('@testing-library/user-event');
  const userEvent = user.setup();
  
  render(<Dropdown />);
  expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  
  await userEvent.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
```

### 6. Accessibility

Test ARIA attributes and labels:

```typescript
it('has accessible label', () => {
  render(<Input />);
  expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
});

it('has correct ARIA attributes', () => {
  render(<Alert />);
  const alert = screen.getByRole('alert');
  expect(alert).toHaveAttribute('aria-live', 'polite');
});
```

### 7. Edge Cases

Always test boundary conditions:

```typescript
describe('Edge Cases', () => {
  it('handles zero value', () => {
    render(<Counter value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles empty array', () => {
    render(<List items={[]} />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });
  
  it('handles undefined props gracefully', () => {
    render(<Component optional={undefined} />);
    // Should not crash
  });
});
```

## Example Tests

### Simple Display Component

```typescript
import { render, screen } from '../utils/test-utils';
import { describe, it, expect } from 'vitest';
import Badge from '../../components/badge';

describe('Badge', () => {
  it('renders without crashing', () => {
    render(<Badge text="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant styling', () => {
    const { container } = render(<Badge text="Error" variant="error" />);
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
  });
});
```

### Interactive Component

```typescript
import { render, screen, waitFor } from '../utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../../components/modal';

describe('Modal', () => {
  it('opens when trigger is clicked', async () => {
    const { user } = await import('@testing-library/user-event');
    const userEvent = user.setup();
    
    render(<Modal trigger={<button>Open</button>}>Content</Modal>);
    
    await userEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('closes when close button is clicked', async () => {
    const onClose = vi.fn();
    const { user } = await import('@testing-library/user-event');
    const userEvent = user.setup();
    
    render(<Modal open onClose={onClose}>Content</Modal>);
    
    await userEvent.click(screen.getByLabelText('Close'));
    
    expect(onClose).toHaveBeenCalled();
  });
});
```

## Common Queries

### By Role (Preferred)
```typescript
screen.getByRole('button', { name: 'Submit' })
screen.getByRole('textbox', { name: 'Email' })
screen.getByRole('alert')
```

### By Text
```typescript
screen.getByText('Hello World')
screen.getByText(/hello/i) // Case insensitive regex
```

### By Label
```typescript
screen.getByLabelText('Username')
```

### By Test ID (Last Resort)
```typescript
screen.getByTestId('custom-element')
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific file
npm run test -- limit-status-badge.test.tsx

# Run in watch mode
npm run test -- --watch
```

## Best Practices

### ✅ DO

- Test behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test user interactions with `@testing-library/user-event`
- Group related tests with `describe` blocks
- Use `beforeEach` for common setup
- Test accessibility (ARIA attributes, labels)
- Test edge cases (empty, zero, undefined)
- Keep tests simple and focused

### ❌ DON'T

- Test internal component state
- Use `container.querySelector` unless necessary
- Test CSS classes (test behavior instead)
- Make tests dependent on each other
- Mock everything (only mock external dependencies)
- Use `act()` directly (RTL handles it)
- Test implementation details

## Mocking

### Next.js Router
```typescript
// Already mocked in tests/setup.ts
import { useRouter } from 'next/navigation';
const router = useRouter(); // Returns mock router
```

### Next.js Image
```typescript
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));
```

### API Calls
```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);
```

## Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

Priority: Test critical user paths over coverage percentage.

## Debugging Tests

### View rendered output
```typescript
const { debug } = render(<Component />);
debug(); // Prints DOM to console
```

### Check what's in the document
```typescript
screen.debug(); // Prints current screen state
```

### Increase timeout for slow tests
```typescript
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

## Component Testing Checklist

When testing a new component:

- [ ] Renders without crashing
- [ ] Props are displayed correctly
- [ ] User interactions work (clicks, input, etc.)
- [ ] Conditional rendering logic works
- [ ] Error/loading states display correctly
- [ ] Accessibility attributes are present
- [ ] Edge cases are handled (empty, zero, undefined)
- [ ] Callbacks are called with correct arguments
- [ ] Visual states work (hover, focus, disabled)

## Contributing

When adding new component tests:

1. Follow the existing patterns in this directory
2. Place tests adjacent to components or in `tests/components/`
3. Name files `component-name.test.tsx`
4. Include comprehensive test coverage for critical paths
5. Document any complex test setups

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
