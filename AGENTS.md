# AGENTS.md - Purple Glow Social 2.0

## 🎯 Project Overview

**Purple Glow Social 2.0** is a South African-focused AI-powered social media management platform. It enables small businesses and entrepreneurs to generate, schedule, and automate social media content across multiple platforms (Instagram, Twitter, LinkedIn, Facebook) with culturally relevant, localized content in all 11 South African official languages.

### Tech Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Font Awesome
- **Routing:** Client-side routing (Next.js App Router structure)
- **State Management:** React Context API
- **Data:** Mock data system (ready for backend integration)

---

## 🏗️ Architecture Overview

### File Structure
```
purple-glow-social-2.0/
├── app/                          # Next.js App Router structure
│   ├── layout.tsx               # Root layout
│   ├── actions/generate.ts      # Server actions for content generation
│   ├── admin/page.tsx           # Admin dashboard
│   └── dashboard/page.tsx       # User dashboard
├── components/                   # React components
│   ├── calendar-view.tsx        # Calendar scheduling view
│   ├── schedule-view.tsx        # Main scheduling interface
│   ├── automation-view.tsx      # Automation rules dashboard
│   ├── smart-suggestions.tsx    # AI suggestions widget
│   ├── content-generator.tsx    # Content generation UI
│   ├── admin-dashboard-view.tsx # Admin interface
│   ├── settings-view.tsx        # User settings
│   ├── language-selector.tsx    # Language switcher
│   ├── LoadingSkeletons.tsx     # Loading state components
│   └── modals/                  # Modal components
│       ├── schedule-post-modal.tsx
│       ├── automation-wizard.tsx
│       ├── credit-topup-modal.tsx
│       ├── subscription-modal.tsx
│       └── payment-success-modal.tsx
├── lib/                         # Utilities and helpers
│   ├── mock-data.ts            # Centralized mock data
│   ├── auth.ts                 # Better-auth integration
│   ├── i18n.ts                 # Internationalization
│   ├── load-translations.ts    # Translation loader
│   ├── ErrorBoundary.tsx       # Error boundaries
│   ├── accessibility.ts        # Accessibility utilities
│   ├── responsive-utils.ts     # Responsive design hooks
│   ├── context/
│   │   └── AppContext.tsx      # Global state management
│   └── translations/            # Language files (11 SA languages)
│       ├── en.json
│       ├── af.json
│       ├── zu.json
│       ├── xh.json
│       ├── nso.json
│       ├── tn.json
│       ├── st.json
│       ├── ts.json
│       ├── ss.json
│       ├── ve.json
│       └── nr.json
├── drizzle/
│   └── schema.ts               # Database schema (Drizzle ORM)
├── docs/                       # Documentation
│   ├── COMPONENT_GUIDE.md
│   ├── MOCK_DATA_STRUCTURE.md
│   ├── create-feature-agent-prompt.md
│   └── pgs-2.0-prompt.txt
├── specs/                      # Feature specifications
│   └── ui-completion-and-features/
│       ├── implementation-plan.md
│       └── requirements.md
├── App.tsx                     # Main app component
├── index.tsx                   # Entry point
└── AGENTS.md                   # This file
```

---

## 🎨 Design System

### Color Palette (South African Theme)
```css
/* Primary Colors */
--neon-grape: #9D4EDD        /* Primary purple */
--joburg-teal: #00E0FF       /* Accent teal */
--pretoria-blue: #1A1F3A     /* Dark blue */
--mzansi-gold: #FFCC00       /* Gold accent */

/* Backgrounds */
--void: #0D0F1C              /* Dark background */
--glass-border: rgba(255, 255, 255, 0.1)

/* Platform Colors */
--instagram: linear-gradient(purple-500, pink-500)
--twitter: #1DA1F2
--linkedin: #0A66C2
--facebook: #1877F2
```

### Typography
- **Font Display:** Custom display font for headings
- **Font Sans:** System sans-serif for body text
- **Font Mono:** Monospace for code/data

### Component Patterns
- **Modals:** Fixed overlay, centered content, backdrop blur
- **Cards:** Rounded corners (rounded-xl), shadow-lg, border styling
- **Buttons:** Gradient backgrounds, hover effects, transitions
- **Forms:** Consistent input styling, focus rings, validation states

---

## 📦 Core Features (Implemented)

### ✅ Phase 1-2: Foundation & UI Components
- Landing page with hero, features, pricing
- Better-auth integration (ready)
- Responsive navigation
- Design system implementation

### ✅ Phase 3: Payment & Admin
- Polar payment simulation
- Admin dashboard with user management
- Transaction history
- Credit top-up system
- Subscription management (Free/Pro/Business)

### ✅ Phase 4: Internationalization
- 11 South African official languages:
  - English, Afrikaans, Zulu, Xhosa
  - Northern Sotho, Tswana, Southern Sotho
  - Tsonga, Swati, Venda, Ndebele
- Language selector component
- Translation infrastructure
- Cultural context in all content

### ✅ Phase 5: Automation & Scheduling
- **Calendar View:** Monthly grid with scheduled posts
- **Schedule View:** 3 modes (Calendar/List/Timeline)
- **Schedule Post Modal:** AI-powered best time suggestions
- **Automation Rules:** Create, manage, activate/deactivate
- **Automation Wizard:** 4-step rule creation
- **Smart Suggestions:** 5 categories of AI recommendations
- **Features:**
  - Recurring posts (Daily/Weekly/Monthly)
  - Platform filtering (Instagram/Twitter/LinkedIn/Facebook)
  - Bulk actions
  - Queue position tracking
  - SAST (UTC+2) timezone

### ✅ Phase 6: Integration & Polish
- **Global State:** React Context for user, credits, tier, modals
- **Mock Data:** Centralized with helper functions
- **Error Handling:** Error boundaries for crash prevention
- **Loading States:** 10+ skeleton components
- **Accessibility:** WCAG AA compliance utilities
- **Responsive:** Hooks and utilities for breakpoints
- **Documentation:** 1,500+ lines of comprehensive docs

---

## 🗄️ Data Models

### MockUser
```typescript
{
  id: string;                    // e.g., "user-1"
  name: string;                  // Full name
  email: string;                 // Email address
  tier: 'free' | 'pro' | 'business';
  credits: number;               // Available credits
  image: string;                 // Avatar URL
  joined: Date;
  lastActive: Date;
  postsCreated: number;
  status: 'active' | 'inactive';
}
```

### MockScheduledPost
```typescript
{
  id: string;
  userId: string;
  content: string;               // Post content
  imageUrl: string | null;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  scheduledDate: Date;
  status: 'scheduled' | 'posted' | 'failed';
  topic: string;
}
```

### MockAutomationRule
```typescript
{
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  coreTopic: string;
  platforms: string[];
  isActive: boolean;
  lastRun: Date | null;
  nextRun: Date;
  postsGenerated: number;
  createdAt: Date;
}
```

**See:** `docs/MOCK_DATA_STRUCTURE.md` for complete data documentation

---

## 🔧 Development Patterns

### State Management
```tsx
// Use AppContext for global state
import { useAppContext } from './lib/context/AppContext';

function MyComponent() {
  const { user, credits, addCredits, openModal } = useAppContext();
  // Component logic
}
```

### Mock Data Access
```tsx
// Always use centralized helpers
import { getCurrentUser, getScheduledPostsByUserId } from './lib/mock-data';

const user = getCurrentUser();
const posts = getScheduledPostsByUserId(user.id);
```

### Error Handling
```tsx
// Wrap components with error boundaries
import { ErrorBoundary } from './lib/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Loading States
```tsx
// Use skeleton components
import { CalendarSkeleton } from './components/LoadingSkeletons';

if (loading) return <CalendarSkeleton />;
```

### Responsive Design
```tsx
// Use responsive hooks
import { useIsMobile } from './lib/responsive-utils';

const isMobile = useIsMobile();
return isMobile ? <MobileView /> : <DesktopView />;
```

### Accessibility
```tsx
// Use accessibility utilities
import { trapFocus, announce } from './lib/accessibility';

useEffect(() => {
  if (modalOpen) {
    const cleanup = trapFocus(modalRef.current);
    announce('Modal opened', 'polite');
    return cleanup;
  }
}, [modalOpen]);
```

---

## 🌍 South African Context

### Critical: Always Maintain SA Context
1. **Timezone:** SAST (UTC+2) is the default
2. **Currency:** ZAR (South African Rand) with 15% VAT
3. **Language:** Support all 11 official languages
4. **Names:** Use diverse South African names (Thabo, Zanele, Pieter, etc.)
5. **Locations:** Reference SA cities (Joburg, Cape Town, Durban, Pretoria)
6. **Hashtags:** Use SA-relevant tags (#LocalIsLekker, #MzansiMagic, #Joburg)
7. **Slang:** Incorporate local expressions ("Sharp sharp!", "Howzit!", "Lekker")

### Pricing (ZAR)
- **Free Plan:** R 0/month (10 credits)
- **Pro Plan:** R 299/month (500 credits)
- **Business Plan:** R 999/month (2000 credits)

### User Personas
- **Thabo Nkosi** - Pro user, 450 credits, active
- **Zanele Dlamini** - Business user, 1850 credits, power user
- **Pieter van der Merwe** - Free user, 3 credits, new
- (15 total mock users representing diverse SA demographics)

---

## 🚀 Common Tasks

### Adding a New Component
1. Create in `components/` directory
2. Use TypeScript with proper interfaces
3. Wrap with ErrorBoundary if complex
4. Add loading skeleton if async
5. Use AppContext for global state
6. Follow accessibility patterns
7. Document in `docs/COMPONENT_GUIDE.md`

### Adding a New Modal
1. Create in `components/modals/`
2. Add modal state to AppContext
3. Implement focus management
4. Add keyboard navigation (Escape to close)
5. Use proper ARIA labels
6. Add to App.tsx modal integration

### Adding Mock Data
1. Add to `lib/mock-data.ts`
2. Create TypeScript interface
3. Link to existing users via `userId`
4. Create helper function for retrieval
5. Document in `docs/MOCK_DATA_STRUCTURE.md`

### Adding a Translation
1. Add key to all 11 language files in `lib/translations/`
2. Use `translate()` function from i18n
3. Maintain cultural context per language
4. Test with language selector

---

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] Verify all modals open/close correctly
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Check loading states display properly
- [ ] Verify error boundaries catch errors
- [ ] Test with different languages
- [ ] Check responsive breakpoints
- [ ] Verify mock data consistency

### Browser Compatibility
- ✅ Chrome/Edge (Primary)
- ✅ Firefox
- ✅ Safari
- ❌ Internet Explorer (Not supported)

---

## 📚 Documentation References

### For Component Usage
- `docs/COMPONENT_GUIDE.md` - Complete API reference, props, examples

### For Mock Data
- `docs/MOCK_DATA_STRUCTURE.md` - Data models, helpers, migration guide

### For Features
- `specs/ui-completion-and-features/requirements.md` - Feature requirements
- `specs/ui-completion-and-features/implementation-plan.md` - Implementation plan

### For Quick Help
- `QUICK_REFERENCE.md` - Quick developer guide
- `PHASE_5_AND_6_SUMMARY.md` - Recent implementation summary

---

## 🔐 Authentication & Backend

### Current State: MOCK/SIMULATION
- Better-auth is integrated but not active
- All data is in-memory mock data
- No real API calls or database connections
- Ready for backend integration

### Migration Path to Production
1. **Replace Mock Data:**
   ```typescript
   // Before
   import { getCurrentUser } from './lib/mock-data';
   const user = getCurrentUser();
   
   // After
   import { getCurrentUser } from './lib/api/users';
   const user = await getCurrentUser();
   ```

2. **Add Authentication:**
   - Activate Better-auth
   - Implement login/signup flows
   - Add session management
   - Protect routes with middleware

3. **Connect Database:**
   - Drizzle ORM schema already defined
   - Connect to Postgres/MySQL
   - Migrate mock data structure to real tables

4. **Add API Layer:**
   - Create API routes in `app/api/`
   - Implement CRUD operations
   - Add error handling
   - Rate limiting

---

## ⚠️ Important Notes

### DO NOT:
- ❌ Modify mock data structure without updating docs
- ❌ Add components without TypeScript types
- ❌ Skip error boundaries on complex components
- ❌ Hardcode user data (always use getCurrentUser)
- ❌ Ignore accessibility (keyboard nav, ARIA labels)
- ❌ Remove South African context (timezone, currency, language)
- ❌ Skip loading states for async operations

### ALWAYS:
- ✅ Use centralized mock data helpers
- ✅ Follow existing component patterns
- ✅ Add TypeScript interfaces
- ✅ Test responsive design
- ✅ Include accessibility features
- ✅ Document new features
- ✅ Maintain South African context
- ✅ Use AppContext for global state

---

## 🎓 Learning Resources

### Internal
- Start with `QUICK_REFERENCE.md` for overview
- Read `docs/COMPONENT_GUIDE.md` for component APIs
- Check `docs/MOCK_DATA_STRUCTURE.md` for data models
- Review implementation plan for context

### External
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Better-auth](https://www.better-auth.com/docs)

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** Component not rendering
- Check imports are correct
- Verify TypeScript types match
- Check console for errors
- Ensure AppProvider wraps app

**Problem:** State not updating
- Verify using AppContext correctly
- Check state updates trigger re-renders
- Ensure not mutating state directly

**Problem:** Modal not opening
- Check modal state in AppContext
- Verify `openModal()` is called correctly
- Check z-index conflicts

**Problem:** Mock data not found
- Use helper functions from `lib/mock-data.ts`
- Verify userId references are correct
- Check data exists in mock arrays

**Problem:** Responsive design broken
- Test with DevTools device emulation
- Verify Tailwind breakpoint classes
- Check for hardcoded widths
- Use responsive hooks

---

## 📞 Getting Help

1. **Check Documentation First:**
   - `docs/COMPONENT_GUIDE.md` for component usage
   - `docs/MOCK_DATA_STRUCTURE.md` for data questions
   - `QUICK_REFERENCE.md` for common tasks

2. **Review Existing Code:**
   - Look at similar components
   - Check how others solved the problem
   - Follow established patterns

3. **Common Gotchas:**
   - Not wrapping with AppProvider
   - Forgetting error boundaries
   - Skipping TypeScript types
   - Not using responsive hooks
   - Missing accessibility features

---

## 🎯 Current Status

### ✅ Completed (Phases 1-6)
- Landing page & design system
- Admin dashboard & user management
- Payment simulation (Polar)
- 11-language internationalization
- Scheduling system (Calendar/List/Timeline)
- Automation rules & wizard
- Smart AI suggestions
- Global state management
- Error handling & loading states
- Accessibility utilities
- Comprehensive documentation

### 🚧 In Progress (Phase 7)
- Final testing & cleanup
- Browser compatibility testing
- Performance profiling
- Code optimization

### 📋 Future Phases
- Real backend integration
- Authentication system
- WebSocket for real-time updates
- PWA implementation
- Analytics integration

---

## 💡 Tips for Future Agents

1. **Start with Documentation:** Read `QUICK_REFERENCE.md` and `docs/COMPONENT_GUIDE.md` first

2. **Follow Patterns:** Look at existing components before creating new ones

3. **Maintain Context:** Always preserve South African cultural context

4. **Type Safety:** Use TypeScript interfaces for everything

5. **Accessibility First:** Include keyboard navigation and ARIA labels

6. **Document Changes:** Update relevant docs when adding features

7. **Test Thoroughly:** Mobile, tablet, desktop at minimum

8. **Use Utilities:** Leverage existing helpers in `lib/`

9. **Error Handling:** Wrap complex components with ErrorBoundary

10. **Ask Questions:** Check existing docs and code before assumptions

---

## 🔄 Version History

- **Phase 1-2:** Foundation & UI Components
- **Phase 3:** Payment & Admin Dashboard
- **Phase 4:** Internationalization (11 languages)
- **Phase 5:** Automation & Scheduling Features
- **Phase 6:** Integration & Polish (Current)
- **Phase 7:** Final Testing & Cleanup (Next)

---

**Last Updated:** Phase 6 Completion  
**Maintainer:** Purple Glow Social Team  
**License:** Proprietary

---

## 🤝 Contributing Guidelines

When working on this codebase:

1. **Read this file first** - Understand the architecture and patterns
2. **Check existing docs** - Don't duplicate effort
3. **Follow conventions** - Maintain consistency
4. **Test your changes** - Especially responsive and accessibility
5. **Update documentation** - Keep docs in sync with code
6. **Preserve context** - Maintain South African focus
7. **Use TypeScript** - No `any` types
8. **Add comments** - Explain complex logic
9. **Error handling** - Always include try/catch or boundaries
10. **Ask for help** - When uncertain, reference docs or ask

---

**Welcome to Purple Glow Social 2.0!** 🇿🇦✨

This is a well-structured, documented, and accessible codebase. Take time to understand the patterns, and you'll be productive quickly. The South African context is core to this project—keep it authentic and culturally relevant.

*Lekker coding!* 🚀
