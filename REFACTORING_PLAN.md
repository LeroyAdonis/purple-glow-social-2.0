# Homepage Server Component Refactoring Plan

## Current State Analysis

**File:** `app/page.tsx` (808 lines)
**Status:** Client Component with `'use client'` directive

### Client-Side Dependencies Identified:
1. **Hooks:**
   - `useSession()` - Better-auth session management
   - `useLanguage()` - Language context for i18n
   - `useRouter()` - Next.js navigation
   - `useState()` - Multiple state variables (14 instances)
   - `useEffect()` - Scroll and click-outside handlers

2. **Interactive Features:**
   - Mobile menu toggle
   - User dropdown menu  
   - Scroll-based navbar styling
   - Click-outside detection
   - Smooth scrolling to sections
   - Modal state management (credits, subscription, success)
   - View switching (landing/dashboard/admin)

3. **Event Handlers:**
   - `onClick` handlers for navigation
   - `onError` image fallback
   - Form submissions

## Refactoring Strategy

### 1. Server Component Structure (New `app/page.tsx`)

The main page will be a **Server Component** that:
- Fetches session data server-side using Better-auth
- Renders static content (hero, features, testimonials, pricing, footer)
- Embeds client components for interactive islands
- Provides proper SEO meta tags

### 2. Client Components to Extract

#### A. **Navigation Component** (`components/landing/navigation.tsx`)
**Why Client:** Interactive menu, scroll effects, user dropdown, session-dependent rendering
**Props:** 
- `session` (from server)
- Language translations

**Features:**
- Mobile menu state
- Scroll-based styling
- User dropdown menu
- Language selector integration

#### B. **Hero Section Component** (`components/landing/hero-section.tsx`)
**Server Component** - Purely presentational
**Props:** Translations only

#### C. **Features Section** (`components/landing/features-section.tsx`)
**Server Component** - Static content
**Props:** Translations only

#### D. **How It Works Section** (`components/landing/how-it-works-section.tsx`)
**Server Component** - Static content
**Props:** Translations only

#### E. **Testimonials Section** (`components/landing/testimonials-section.tsx`)
**Server Component** - Static content  
**Props:** Translations only

#### F. **Pricing Section** (`components/landing/pricing-section.tsx`)
**Client Component** - Has billing cycle toggle
**Props:**
- Session status
- Translations
- Modal handlers

**Features:**
- Billing cycle toggle (monthly/annual)
- CTA buttons with modal triggers

#### G. **Contact Section** (`components/landing/contact-section.tsx`)
**Server Component** - Static content (no form submission yet)
**Props:** Translations only

#### H. **Footer Section** (`components/landing/footer-section.tsx`)
**Hybrid:**
- Base: Server Component
- Smooth scroll links: Client wrapper for interactive links

#### I. **Background Effects** (`components/landing/ambient-background.tsx`)
**Server Component** - Pure CSS animations
No props needed

### 3. Language/Translation Strategy

**Problem:** `useLanguage()` is a client-side hook
**Solution:** 
- Server components can read language from cookies/headers
- Pass translations as props from server component
- OR create server-side language utility

**Implementation:**
```typescript
// lib/language/server.ts
export async function getServerTranslations() {
  const { cookies } = await import('next/headers');
  const lang = cookies().get('preferred-language')?.value || 'en';
  // Return translations for current language
}
```

### 4. Session Handling

**Current:** Client-side `useSession()` hook
**New:** Server-side session validation

```typescript
// app/page.tsx (Server Component)
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Pass session to client components
}
```

### 5. Modal Management

**Current:** Modal state managed in page.tsx
**New:** Move to client-side provider or component

Options:
- Keep modal state in pricing component (localized)
- Create modal provider component
- Use URL state for modals (recommended for deep linking)

### 6. View Switching (Landing/Dashboard/Admin)

**Current:** State-based view switching
**Analysis:** This is an anti-pattern for Next.js App Router

**Solution:**
- Remove view switching logic entirely
- `/` = Landing page (this file)
- `/dashboard` = Separate route (already exists)
- `/admin` = Separate route

**Benefit:** Proper routing, better SEO, cleaner code

## Implementation Steps

### Phase 1: Setup Infrastructure
1. ✅ Create `components/landing/` directory
2. ✅ Create server-side language utility
3. ✅ Update session handling to server-side

### Phase 2: Extract Server Components (Non-Interactive)
4. ✅ Extract `ambient-background.tsx`
5. ✅ Extract `hero-section.tsx`
6. ✅ Extract `features-section.tsx`
7. ✅ Extract `how-it-works-section.tsx`
8. ✅ Extract `testimonials-section.tsx`
9. ✅ Extract `contact-section.tsx`

### Phase 3: Extract Client Components (Interactive)
10. ✅ Extract `navigation.tsx` (client)
11. ✅ Extract `pricing-section.tsx` (client)
12. ✅ Extract `footer-section.tsx` (hybrid)

### Phase 4: Refactor Main Page
13. ✅ Remove `'use client'` directive
14. ✅ Convert to async Server Component
15. ✅ Fetch session server-side
16. ✅ Get translations server-side
17. ✅ Compose components
18. ✅ Remove view switching logic

### Phase 5: Verification
19. ✅ Build application (`npm run build`)
20. ✅ Check for RSC boundary errors
21. ✅ Verify all interactivity works
22. ✅ Test authentication flows
23. ✅ Verify SEO meta tags render
24. ✅ Check lighthouse scores

## File Structure (After Refactoring)

```
app/
  page.tsx                          (Server Component - 50 lines)
  
components/landing/
  ambient-background.tsx            (Server - 15 lines)
  navigation.tsx                    (Client - 150 lines)
  hero-section.tsx                  (Server - 80 lines)
  features-section.tsx              (Server - 100 lines)
  how-it-works-section.tsx          (Server - 80 lines)
  testimonials-section.tsx          (Server - 100 lines)
  pricing-section.tsx               (Client - 150 lines)
  contact-section.tsx               (Server - 60 lines)
  footer-section.tsx                (Server with client links - 80 lines)

lib/language/
  server.ts                         (Server utility for i18n)
```

## Expected Benefits

1. **SEO:** Server-rendered content, proper meta tags, faster FCP
2. **Performance:** Smaller client bundle, reduced hydration time
3. **Maintainability:** Smaller, focused components
4. **Scalability:** Clear separation of concerns
5. **Type Safety:** Explicit prop interfaces across RSC boundary

## Potential Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking authentication | Test session handling thoroughly in both states |
| Translation context issues | Create server-side alternative, pass as props |
| Lost interactivity | Ensure all onClick handlers in client components |
| Modal state management | Keep modal state localized to interactive components |
| Smooth scrolling breaks | Use client wrapper for navigation links |

## Success Criteria

- [ ] `app/page.tsx` is a Server Component (no `'use client'`)
- [ ] `npm run build` succeeds with no errors
- [ ] All navigation links work (smooth scrolling intact)
- [ ] User authentication flows work (login/logout/dashboard)
- [ ] Language switching works
- [ ] Modals open/close correctly
- [ ] Mobile menu works
- [ ] No visual regressions
- [ ] Lighthouse SEO score > 95
- [ ] Initial page load faster than current implementation
