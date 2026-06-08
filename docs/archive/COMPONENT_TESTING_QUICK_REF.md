# Component Testing Quick Reference Card

## 🚀 Quick Start

```bash
# Run component tests
npm run test:run -- tests/components

# Watch mode
npm run test -- <filename>

# Coverage
npm run test:coverage
```

## 📝 Basic Test Template

```typescript
import { render, screen } from '../utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from '../../components/my-component';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    const userEvent = (await import('@testing-library/user-event')).default;
    
    render(<MyComponent onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🔍 Common Queries

```typescript
// By Role (PREFERRED)
screen.getByRole('button', { name: 'Submit' })
screen.getByRole('textbox', { name: 'Email' })

// By Label
screen.getByLabelText('Username')

// By Text
screen.getByText('Hello')
screen.getByText(/hello/i) // case insensitive

// By Test ID (last resort)
screen.getByTestId('custom-element')

// Query variants
getBy...     // throws error if not found
queryBy...   // returns null if not found
findBy...    // async, waits for element
```

## ✅ Test Checklist

- [ ] Renders without crashing
- [ ] Props displayed correctly  
- [ ] User interactions work
- [ ] Conditional rendering
- [ ] Error states
- [ ] Accessibility (ARIA)
- [ ] Edge cases

## 🎯 Examples from Codebase

### Simple Display Component
```typescript
// See: tests/components/limit-status-badge.test.tsx
it('displays current and limit values correctly', () => {
  render(<LimitStatusBadge current={3} limit={10} label="Posts" />);
  expect(screen.getByText('3/10')).toBeInTheDocument();
});
```

### Conditional Rendering
```typescript
// See: tests/components/credit-cost-preview.test.tsx
it('does not render when no platforms selected', () => {
  const { container } = render(<CreditCostPreview platforms={[]} />);
  expect(container.firstChild).toBeNull();
});
```

### User Interaction
```typescript
// See: tests/components/draft-card.test.tsx
it('calls onEdit when edit button clicked', async () => {
  const onEdit = vi.fn();
  const userEvent = (await import('@testing-library/user-event')).default;
  
  render(<DraftCard draft={mockDraft} onEdit={onEdit} />);
  await userEvent.click(screen.getByLabelText('Edit draft'));
  
  expect(onEdit).toHaveBeenCalledTimes(1);
});
```

### Async Behavior
```typescript
// See: tests/components/language-selector.test.tsx
it('opens dropdown when clicked', async () => {
  const userEvent = (await import('@testing-library/user-event')).default;
  
  render(<Dropdown />);
  await userEvent.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
```

### Accessibility
```typescript
// See: tests/components/credit-expiry-warning.test.tsx
it('has correct ARIA attributes', () => {
  render(<Alert />);
  const alert = screen.getByRole('alert');
  expect(alert).toHaveAttribute('aria-live', 'polite');
});
```

## 🛠️ Utilities

```typescript
import { 
  render,           // Render with providers
  screen,           // Query DOM
  waitFor,          // Async waiting
  mockHandlers,     // Pre-made mocks
} from '../utils/test-utils';
```

## 🚫 Common Mistakes

❌ Testing implementation details
```typescript
expect(component.state.count).toBe(5) // DON'T
```

✅ Testing user-visible behavior  
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument() // DO
```

❌ Using `querySelector` everywhere
```typescript
container.querySelector('.my-class') // DON'T
```

✅ Using semantic queries
```typescript
screen.getByRole('button', { name: 'Submit' }) // DO
```

## 📚 Learn More

- Full guide: `tests/components/README.md`
- Example tests: `tests/components/*.test.tsx`
- Test utilities: `tests/utils/test-utils.tsx`

## 🎓 Tested Components (Examples)

✅ LimitStatusBadge (42 tests)
✅ CreditCostPreview (29 tests)  
✅ CreditExpiryWarning (32 tests)
✅ LanguageSelector (23 tests)
✅ DraftCard (36 tests)

**Total: 126 passing tests**

Follow these patterns for remaining components!
