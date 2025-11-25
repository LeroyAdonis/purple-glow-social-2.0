# Component Usage Guide - Purple Glow Social 2.0

## Overview
This guide provides comprehensive documentation for all components in the Purple Glow Social application, including usage examples, props, and best practices.

---

## Table of Contents
1. [Scheduling Components](#scheduling-components)
2. [Automation Components](#automation-components)
3. [Modal Components](#modal-components)
4. [Utility Components](#utility-components)
5. [Context & State Management](#context--state-management)
6. [Error Handling](#error-handling)

---

## Scheduling Components

### CalendarView

**Location:** `components/calendar-view.tsx`

**Purpose:** Displays a monthly calendar grid with scheduled posts.

**Props:**
```typescript
interface CalendarViewProps {
  scheduledPosts?: ScheduledPost[];
}

interface ScheduledPost {
  id: string;
  title: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  content: string;
}
```

**Usage Example:**
```tsx
import CalendarView from './components/calendar-view';
import { MOCK_SCHEDULED_POSTS } from './lib/mock-data';

function MyComponent() {
  const posts = MOCK_SCHEDULED_POSTS.map(post => ({
    id: post.id,
    title: post.topic,
    platform: post.platform,
    scheduledTime: post.scheduledDate.toISOString(),
    status: post.status,
    content: post.content,
  }));

  return <CalendarView scheduledPosts={posts} />;
}
```

**Features:**
- Monthly calendar grid with navigation
- Platform color coding (Instagram gradient, Twitter blue, etc.)
- Hover tooltips showing post preview
- "Today" highlight styling
- Empty state for days with no posts
- "+N more" indicator when multiple posts per day

---

### ScheduleView

**Location:** `components/schedule-view.tsx`

**Purpose:** Main scheduling interface with multiple view modes.

**Props:**
```typescript
interface ScheduleViewProps {
  onSchedulePost?: () => void;
}
```

**Usage Example:**
```tsx
import ScheduleView from './components/schedule-view';

function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ScheduleView onSchedulePost={() => setShowModal(true)} />
      {/* Schedule modal */}
    </>
  );
}
```

**Features:**
- Three view modes: Calendar, List, Timeline
- Platform filtering
- Date range filtering
- Bulk selection and actions
- Statistics dashboard
- Integrated Smart Suggestions widget

---

### SmartSuggestions

**Location:** `components/smart-suggestions.tsx`

**Purpose:** AI-powered suggestions widget for optimal posting.

**Props:**
```typescript
interface SmartSuggestionsProps {
  topic?: string;
  platform?: string;
}
```

**Usage Example:**
```tsx
import SmartSuggestions from './components/smart-suggestions';

function Sidebar() {
  return (
    <SmartSuggestions 
      topic="Product Launch" 
      platform="instagram" 
    />
  );
}
```

**Features:**
- Best Times tab with engagement metrics
- Best Practices tab with platform-specific tips
- Trending Hashtags tab with SA-focused hashtags
- Content Type recommendations
- Tone suggestions based on time of day

---

## Automation Components

### AutomationView

**Location:** `components/automation-view.tsx`

**Purpose:** Dashboard for managing automation rules.

**Props:**
```typescript
interface AutomationViewProps {
  onCreateRule?: () => void;
}
```

**Usage Example:**
```tsx
import AutomationView from './components/automation-view';

function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      <AutomationView onCreateRule={() => setShowWizard(true)} />
      {/* Automation wizard modal */}
    </>
  );
}
```

**Features:**
- Active rules display with status indicators
- Rule statistics (Posts Generated, Last Run, Next Run)
- Active/Inactive toggle per rule
- Run Now, Edit, Delete actions
- Execution history viewer
- Empty state with template showcase

---

### AutomationWizard

**Location:** `components/modals/automation-wizard.tsx`

**Purpose:** 4-step wizard for creating automation rules.

**Props:**
```typescript
interface AutomationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (rule: any) => void;
}
```

**Usage Example:**
```tsx
import AutomationWizard from './components/modals/automation-wizard';

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (rule) => {
    console.log('Rule created:', rule);
    // Save rule to state/backend
  };

  return (
    <AutomationWizard
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onComplete={handleComplete}
    />
  );
}
```

**Wizard Steps:**
1. **Template Selection:** Choose from pre-built templates or custom
2. **Frequency Configuration:** Set schedule (Daily/Weekly/Monthly)
3. **Content Settings:** Define topic, tone, and platforms
4. **Review & Activate:** Final review before activation

---

## Modal Components

### SchedulePostModal

**Location:** `components/modals/schedule-post-modal.tsx`

**Purpose:** Modal for scheduling social media posts.

**Props:**
```typescript
interface SchedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent?: string;
  platform?: string;
}
```

**Usage Example:**
```tsx
import SchedulePostModal from './components/modals/schedule-post-modal';

function ContentGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Schedule Post</button>
      <SchedulePostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        postContent={content}
        platform="Instagram"
      />
    </>
  );
}
```

**Features:**
- AI-powered best time suggestions
- Date and time pickers
- SAST (UTC+2) timezone support
- Recurring post options
- Queue position indicator
- Post content preview

---

## Utility Components

### LoadingSkeletons

**Location:** `components/LoadingSkeletons.tsx`

**Purpose:** Loading state components for better UX.

**Available Components:**
- `Skeleton` - Generic skeleton component
- `CalendarSkeleton` - Calendar loading state
- `PostListSkeleton` - Post list loading state
- `AutomationRuleSkeleton` - Automation rule card skeleton
- `StatsCardSkeleton` - Stats card skeleton
- `DashboardSkeleton` - Full dashboard skeleton
- `TableSkeleton` - Data table skeleton
- `ModalSkeleton` - Modal loading state
- `SmartSuggestionsSkeleton` - Smart suggestions skeleton

**Usage Example:**
```tsx
import { CalendarSkeleton, PostListSkeleton } from './components/LoadingSkeletons';

function ScheduleView() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  if (loading) {
    return <CalendarSkeleton />;
  }

  return <CalendarView posts={posts} />;
}
```

---

## Context & State Management

### AppContext

**Location:** `lib/context/AppContext.tsx`

**Purpose:** Global state management for user, credits, subscription, and modals.

**Usage Example:**
```tsx
import { AppProvider, useAppContext } from './lib/context/AppContext';

// Wrap your app
function App() {
  return (
    <AppProvider>
      <YourApp />
    </AppProvider>
  );
}

// Use in components
function Dashboard() {
  const { user, credits, addCredits, openModal } = useAppContext();

  const handlePurchase = () => {
    addCredits(100);
    openModal('paymentSuccess');
  };

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Credits: {credits}</p>
      <button onClick={handlePurchase}>Buy Credits</button>
    </div>
  );
}
```

**Available Context Values:**
```typescript
interface AppContextType {
  user: MockUser;
  updateUser: (updates: Partial<MockUser>) => void;
  credits: number;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  tier: 'free' | 'pro' | 'business';
  upgradeTier: (newTier: 'free' | 'pro' | 'business') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  modals: {
    creditTopup: boolean;
    subscription: boolean;
    paymentSuccess: boolean;
    schedulePost: boolean;
    automationWizard: boolean;
  };
  openModal: (modal: keyof AppContextType['modals']) => void;
  closeModal: (modal: keyof AppContextType['modals']) => void;
}
```

---

## Error Handling

### ErrorBoundary

**Location:** `lib/ErrorBoundary.tsx`

**Purpose:** Catch and handle React component errors gracefully.

**Usage Example:**
```tsx
import { ErrorBoundary, ModalErrorBoundary } from './lib/ErrorBoundary';

// Wrap entire app or sections
function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

// Use modal-specific boundary
function Modal() {
  return (
    <ModalErrorBoundary>
      <ComplexModalContent />
    </ModalErrorBoundary>
  );
}

// Custom fallback
function App() {
  return (
    <ErrorBoundary fallback={<CustomErrorUI />}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

---

## Mock Data

### Centralized Mock Data

**Location:** `lib/mock-data.ts`

**Purpose:** Consistent mock data across all components.

**Available Data:**
- `MOCK_USERS` - Array of mock users
- `MOCK_TRANSACTIONS` - Array of transactions
- `MOCK_SCHEDULED_POSTS` - Array of scheduled posts
- `MOCK_AUTOMATION_RULES` - Array of automation rules

**Helper Functions:**
```typescript
getUserById(userId: string): MockUser | undefined
getTransactionsByUserId(userId: string): MockTransaction[]
getScheduledPostsByUserId(userId: string): MockScheduledPost[]
getAutomationRulesByUserId(userId: string): MockAutomationRule[]
getCurrentUser(): MockUser
```

**Usage Example:**
```tsx
import { 
  MOCK_USERS, 
  MOCK_SCHEDULED_POSTS,
  getCurrentUser,
  getScheduledPostsByUserId 
} from './lib/mock-data';

function MyComponent() {
  const currentUser = getCurrentUser();
  const userPosts = getScheduledPostsByUserId(currentUser.id);

  return (
    <div>
      <h1>{currentUser.name}</h1>
      <p>Scheduled Posts: {userPosts.length}</p>
    </div>
  );
}
```

---

## Responsive Utilities

**Location:** `lib/responsive-utils.ts`

**Available Hooks:**
- `useBreakpoint()` - Get current breakpoint (sm, md, lg, xl, 2xl)
- `useIsMobile()` - Check if mobile (< 768px)
- `useIsTablet()` - Check if tablet (768px - 1024px)

**Usage Example:**
```tsx
import { useBreakpoint, useIsMobile } from './lib/responsive-utils';

function MyComponent() {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
      <p>Current breakpoint: {breakpoint}</p>
    </div>
  );
}
```

---

## Accessibility Utilities

**Location:** `lib/accessibility.ts`

**Available Functions:**
- `trapFocus(element)` - Trap focus within modal
- `announce(message, priority)` - Screen reader announcements
- `generateId(prefix)` - Generate unique IDs for ARIA
- `handleArrowNavigation(e, items, currentIndex)` - Keyboard navigation

**Usage Example:**
```tsx
import { trapFocus, announce, FocusManager } from './lib/accessibility';

function Modal({ isOpen, onClose }) {
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
        announce('Modal closed', 'polite');
      };
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

---

## Best Practices

### Component Organization
1. Keep components focused and single-purpose
2. Use TypeScript interfaces for all props
3. Export types alongside components
4. Document complex logic with comments

### State Management
1. Use context for global state (user, credits, language)
2. Keep local state in components when possible
3. Lift state up only when necessary
4. Use mock data helpers for consistent data

### Accessibility
1. Always include ARIA labels on interactive elements
2. Implement keyboard navigation for complex UI
3. Use focus management in modals
4. Test with screen readers

### Performance
1. Use loading skeletons for async operations
2. Lazy load heavy components
3. Implement error boundaries
4. Optimize re-renders with React.memo when needed

### Responsive Design
1. Mobile-first approach
2. Use responsive utility hooks
3. Test on multiple screen sizes
4. Ensure touch targets are adequate (44px minimum)

---

## Troubleshooting

### Common Issues

**Modal not closing:**
- Ensure `onClose` prop is properly connected
- Check for conflicting z-index values
- Verify modal state management

**Data not updating:**
- Check if using centralized mock data
- Ensure state updates trigger re-renders
- Verify context provider wraps components

**Accessibility warnings:**
- Add missing ARIA labels
- Ensure proper heading hierarchy
- Check color contrast ratios

**Responsive issues:**
- Test with DevTools device emulation
- Verify Tailwind breakpoint classes
- Check for hardcoded widths

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility](https://react.dev/learn/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Font Awesome Icons](https://fontawesome.com/icons)

---

**Last Updated:** Phase 6 Completion
**Maintainer:** Purple Glow Social Team
