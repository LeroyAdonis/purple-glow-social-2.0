# Window SSR Fix - Custom Select Component

## Issue
```
Runtime Error: window is not defined
components\custom-select.tsx (123:40)
```

## Root Cause
The `CustomSelect` component was accessing `window.scrollY` and `window.scrollX` during server-side rendering (SSR). In Next.js, components are rendered on the server first, where the `window` object doesn't exist.

## Solution Applied

Added browser checks using `typeof window !== 'undefined'` before accessing the `window` object.

### Changes Made

#### 1. updatePosition() Function
**Before:**
```typescript
const updatePosition = () => {
  if (dropdownRef.current) {
    const rect = dropdownRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,  // ❌ Crashes on server
      left: rect.left + window.scrollX,   // ❌ Crashes on server
      width: rect.width
    });
  }
};
```

**After:**
```typescript
const updatePosition = () => {
  if (dropdownRef.current && typeof window !== 'undefined') {  // ✅ Check if in browser
    const rect = dropdownRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    });
  }
};
```

#### 2. Dropdown Content Style
**Before:**
```typescript
style={{
  top: `${dropdownPosition.top - window.scrollY}px`,      // ❌ Crashes on server
  left: `${dropdownPosition.left - window.scrollX}px`,   // ❌ Crashes on server
  width: `${dropdownPosition.width}px`
}}
```

**After:**
```typescript
style={{
  top: `${dropdownPosition.top - (typeof window !== 'undefined' ? window.scrollY : 0)}px`,    // ✅ Safe
  left: `${dropdownPosition.left - (typeof window !== 'undefined' ? window.scrollX : 0)}px`,  // ✅ Safe
  width: `${dropdownPosition.width}px`
}}
```

## Why This Works

### Server-Side Rendering (SSR)
1. Next.js renders the component on the server
2. `typeof window !== 'undefined'` returns `false`
3. Uses fallback value `0` for scroll positions
4. Component renders without crashing

### Client-Side Rendering (Browser)
1. Component hydrates in the browser
2. `typeof window !== 'undefined'` returns `true`
3. Accesses actual `window.scrollY` and `window.scrollX`
4. Dropdown positions correctly

## Files Modified
- `components/custom-select.tsx` - Added browser checks for window access

## Testing
1. ✅ Refresh the page in your browser
2. ✅ No "window is not defined" error
3. ✅ Dropdown menus work correctly
4. ✅ Server-side rendering works without crashes

## Best Practices for Next.js

### Always Check for Browser Environment
```typescript
// ✅ Good
if (typeof window !== 'undefined') {
  // Access window object
}

// ❌ Bad
window.scrollTo(0, 0);  // Crashes on server
```

### Use useEffect for Client-Only Code
```typescript
useEffect(() => {
  // This only runs in the browser
  window.addEventListener('scroll', handleScroll);
}, []);
```

### Dynamic Imports for Client-Only Components
```typescript
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false  // Don't render on server
});
```

## Related Components

If you encounter similar errors in other components, check for:
- `window` object access
- `document` object access
- `localStorage` or `sessionStorage`
- Browser-only APIs (e.g., `navigator`, `location`)

All of these need browser checks in Next.js components!

---

**Status:** Fixed and ready to use!
