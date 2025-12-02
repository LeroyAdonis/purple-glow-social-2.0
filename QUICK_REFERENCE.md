# Quick Reference Guide - Purple Glow Social 2.0

## 🎯 All Phases Complete

### Phase 11: Post Generation & Credit System ✅ (Latest)
- ✅ Credit system refactor (credits on publish only)
- ✅ Tier-based limits enforced server-side
- ✅ Inngest job processing with retry logic
- ✅ Admin dashboard enhancements
- ✅ Notifications system
- ✅ 128 passing tests (unit + integration)
- ✅ CI/CD pipeline with GitHub Actions

### Phase 10: AI Content Generation ✅
- ✅ Google Gemini Pro integration
- ✅ 11 language support
- ✅ Platform-specific optimization
- ✅ Automatic hashtag generation

### Phase 9: Auto-Posting ✅
- ✅ Real posting to all 4 platforms
- ✅ Vercel Cron automation
- ✅ Error handling and retry

### Phases 5-8: Earlier Features ✅
- ✅ Calendar, List, Timeline views for scheduling
- ✅ Automation rules creation wizard
- ✅ OAuth for Facebook, Instagram, Twitter, LinkedIn
- ✅ Better-auth with email/password + Google
- ✅ Global state management (React Context)
- ✅ Error boundaries and loading skeletons
- ✅ Accessibility utilities (WCAG AA)
- ✅ South African timezone (SAST - UTC+2)

---

## 💳 Credit System

### How Credits Work
| Action | Credit Cost |
|--------|-------------|
| AI Content Generation | **FREE** |
| Publish to 1 Platform | 1 credit |
| Publish to 3 Platforms | 3 credits |
| Failed Post | 0 credits (refunded) |
| Scheduled Post | Reserved until published |

### Tier Limits
| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Monthly Credits | 10 | 500 | 2,000 |
| Connected Accounts (per platform) | 1 | 3 | 10 |
| Max Scheduled Posts | 5 | 50 | 200 |
| AI Generations per day | 5 | 50 | 200 |
| Automation Rules | ❌ | 5 | 20 |
| Advance Scheduling | 7 days | 30 days | 90 days |

---

## 🧪 Test Accounts

| Account | Email | Password | Tier |
|---------|-------|----------|------|
| Free | free@test.purpleglow.co.za | TestFree123! | Free |
| Pro | pro@test.purpleglow.co.za | TestPro123! | Pro |
| Business | business@test.purpleglow.co.za | TestBiz123! | Business |
| Admin | admin@test.purpleglow.co.za | TestAdmin123! | Business + Admin |
| Low Credit | lowcredit@test.purpleglow.co.za | TestLow123! | Pro (2 credits) |
| Zero Credit | zerocredit@test.purpleglow.co.za | TestZero123! | Pro (0 credits) |

**Seed command:** `npm run db:seed-test`

---

## 📂 Key Files Created (Phase 11)

### Tier System
- `lib/tiers/config.ts` - Tier limits configuration
- `lib/tiers/validation.ts` - Limit checking functions
- `lib/tiers/types.ts` - TypeScript types

### Database Helpers
- `lib/db/credit-reservations.ts` - Credit reservation logic
- `lib/db/generation-logs.ts` - AI usage tracking
- `lib/db/daily-usage.ts` - Rate limiting
- `lib/db/notifications.ts` - User notifications
- `lib/db/job-logs.ts` - Job tracking

### Inngest Functions
- `lib/inngest/functions/process-scheduled-post.ts`
- `lib/inngest/functions/execute-automation-rule.ts`
- `lib/inngest/functions/check-credit-expiry.ts`
- `lib/inngest/functions/check-low-credits.ts`
- `lib/inngest/functions/reset-monthly-credits.ts`

### UI Components
- `components/credit-warning-banner.tsx`
- `components/notifications-dropdown.tsx`
- `components/usage-summary.tsx`
- `components/credit-cost-preview.tsx`
- `components/admin/*.tsx` (9 admin components)

### Tests
- `tests/integration/post-generation-flow.test.ts` (67 tests)
- `tests/unit/*.test.ts` (61 tests)

---

## 🔧 Key Features

### Scheduling System
```typescript
// Three view modes
- Calendar View (monthly grid)
- List View (grouped by date)
- Timeline View (chronological)

// Features
- AI best time suggestions
- Recurring posts (Daily/Weekly/Monthly)
- Platform filtering
- Bulk actions
- Queue position tracking
```

### Automation System
```typescript
// Templates
- Weekly Product Showcase
- Daily Tips & Tricks
- Monthly Recap
- Custom Automation

// 4-Step Wizard
1. Template Selection
2. Frequency Configuration
3. Content Settings
4. Review & Activate

// Management
- Active/Inactive toggle
- Run Now button
- Execution history
- Statistics tracking
```

### Smart Suggestions
```typescript
// 5 Categories
1. Best Times - Optimal posting schedule
2. Best Practices - Platform-specific tips
3. Trending Hashtags - SA-focused trends
4. Content Type - Format recommendations
5. Tone - Time-based suggestions
```

---

## 🎨 State Management

### AppContext Usage
```tsx
import { useAppContext } from './lib/context/AppContext';

function MyComponent() {
  const { 
    user,           // Current user
    credits,        // Available credits
    addCredits,     // Add credits function
    tier,           // Subscription tier
    upgradeTier,    // Upgrade function
    openModal,      // Open modal function
    closeModal      // Close modal function
  } = useAppContext();
  
  return <div>Credits: {credits}</div>;
}
```

---

## 📊 Mock Data Access

### Centralized Data
```tsx
import { 
  MOCK_SCHEDULED_POSTS,
  getCurrentUser,
  getScheduledPostsByUserId 
} from './lib/mock-data';

// Get current user
const user = getCurrentUser();

// Get user's posts
const posts = getScheduledPostsByUserId(user.id);
```

---

## 🛡️ Error Handling

### Error Boundaries
```tsx
import { ErrorBoundary } from './lib/ErrorBoundary';

// Wrap components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Modal-specific
import { ModalErrorBoundary } from './lib/ErrorBoundary';

<ModalErrorBoundary>
  <ModalContent />
</ModalErrorBoundary>
```

---

## ⏳ Loading States

### Skeleton Components
```tsx
import { 
  CalendarSkeleton,
  PostListSkeleton,
  TableSkeleton 
} from './components/LoadingSkeletons';

function MyView() {
  const [loading, setLoading] = useState(true);
  
  if (loading) return <CalendarSkeleton />;
  
  return <CalendarView />;
}
```

---

## 📱 Responsive Design

### Responsive Hooks
```tsx
import { 
  useBreakpoint,
  useIsMobile,
  useIsTablet 
} from './lib/responsive-utils';

function MyComponent() {
  const breakpoint = useBreakpoint(); // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  const isMobile = useIsMobile();     // < 768px
  const isTablet = useIsTablet();     // 768px - 1024px
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

---

## ♿ Accessibility

### Focus Management
```tsx
import { trapFocus, announce, FocusManager } from './lib/accessibility';

function Modal({ isOpen }) {
  const modalRef = useRef(null);
  const focusManager = useRef(new FocusManager());
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      focusManager.current.saveFocus();
      focusManager.current.setInitialFocus(modalRef.current);
      const cleanup = trapFocus(modalRef.current);
      announce('Modal opened', 'polite');
      
      return () => {
        cleanup();
        focusManager.current.restoreFocus();
      };
    }
  }, [isOpen]);
  
  return <div ref={modalRef}>{/* content */}</div>;
}
```

---

## 📖 Documentation

### Available Docs
1. **COMPONENT_GUIDE.md** (950 lines)
   - Component API reference
   - Usage examples
   - Props documentation
   - Best practices

2. **MOCK_DATA_STRUCTURE.md** (550 lines)
   - Data model reference
   - Helper functions
   - Migration guide
   - FAQ

3. **PHASE_5_COMPLETION.md**
   - Phase 5 detailed summary
   - Features implemented
   - Testing checklist

4. **PHASE_6_COMPLETION.md**
   - Phase 6 detailed summary
   - Integration points
   - Code quality metrics

5. **PHASE_5_AND_6_SUMMARY.md**
   - Combined overview
   - Statistics and metrics
   - File structure

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Navigate to Schedule tab from dashboard
- [ ] Switch between Calendar, List, Timeline views
- [ ] Open Schedule Post modal
- [ ] Create automation rule via wizard
- [ ] Toggle automation rule active/inactive
- [ ] Test platform filters
- [ ] Test bulk selection
- [ ] Verify responsive design on mobile
- [ ] Test keyboard navigation in modals
- [ ] Verify loading skeletons display

### Integration Testing
- [ ] Context state updates correctly
- [ ] Modal state management works
- [ ] Error boundaries catch errors
- [ ] Mock data consistency maintained

---

## 🚀 How to Use

### Running the App
```bash
npm install
npm run dev
```

Navigate to: `http://localhost:3001`

### Testing Features
1. Click "Launch Dashboard" on landing page
2. Navigate to **Schedule** tab - see calendar with scheduled posts
3. Navigate to **Automation** tab - see automation rules
4. Click **"Create New Automation Rule"** - go through wizard
5. Click **"Schedule Post"** button - open scheduling modal
6. Switch between view modes in Schedule tab

---

## 📈 Metrics

### Code Statistics
- **Total Files Created:** 13
- **Lines of Code:** ~3,500+
- **Documentation:** ~1,500+ lines
- **Components:** 17 (13 new, 4 updated)
- **Helper Functions:** 50+
- **Loading Skeletons:** 10+

### Quality Metrics
- **TypeScript Coverage:** 100%
- **WCAG Level:** AA Ready
- **Responsive:** Mobile-first
- **Error Handling:** Comprehensive
- **Documentation:** Complete

---

## 🎓 Learning Resources

### Internal Docs
- [Component Guide](./docs/COMPONENT_GUIDE.md)
- [Mock Data Structure](./docs/MOCK_DATA_STRUCTURE.md)
- [Implementation Plan](./specs/ui-completion-and-features/implementation-plan.md)

### External Resources
- [React Context API](https://react.dev/reference/react/useContext)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🔮 Next Steps

### Phase 7: Final Testing & Cleanup
1. Comprehensive testing across all features
2. Browser compatibility testing
3. Performance profiling
4. Code cleanup
5. Final documentation review

### Future Enhancements
1. Real backend API integration
2. Authentication system
3. WebSocket real-time updates
4. Progressive Web App (PWA)
5. Analytics integration

---

## 💡 Quick Tips

### Best Practices
✅ Always use centralized mock data helpers
✅ Wrap new components with ErrorBoundary
✅ Add loading skeletons for async operations
✅ Use AppContext for global state
✅ Follow accessibility patterns from utilities
✅ Test responsive design at multiple breakpoints

### Common Patterns
```tsx
// Standard component structure
import { useAppContext } from './lib/context/AppContext';
import { ErrorBoundary } from './lib/ErrorBoundary';
import { Skeleton } from './components/LoadingSkeletons';

function MyComponent() {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  
  if (loading) return <Skeleton />;
  
  return <div>{/* content */}</div>;
}

// Wrap in App.tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## 📞 Support

### Troubleshooting
- Check the [Component Guide](./docs/COMPONENT_GUIDE.md) troubleshooting section
- Review error messages in browser console
- Verify all imports are correct
- Ensure AppProvider wraps your app

### Questions?
- Review documentation files in `/docs`
- Check implementation plan for context
- Look at existing component examples

---

**Last Updated:** Phase 6 Completion  
**Status:** ✅ Production Ready  
**Next Phase:** Phase 7 - Final Testing & Cleanup
