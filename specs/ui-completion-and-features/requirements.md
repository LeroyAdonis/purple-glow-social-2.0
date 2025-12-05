# Requirements: UI Completion and Core Features ✅ COMPLETE

## Feature Overview
Complete the Purple Glow Social platform with missing UI components, admin functionality, payment systems, multi-language support, and automation features.

## Status: ✅ FULLY IMPLEMENTED
All UI completion and core features have been implemented as per implementation-plan.md.

## 1. Admin Dashboard & User Management

### 1.1 Admin Dashboard View
- **Requirement**: Create a comprehensive admin dashboard accessible at `/admin`
- **Components**:
  - User management table with ability to view all users
  - User tier management (upgrade/downgrade Free/Pro/Business)
  - Credit balance viewing and manual adjustment
  - Active user statistics
  - Revenue overview (MRR - Monthly Recurring Revenue)
  - Transaction log with filtering
- **Mock Data**: Simulate 10-15 users with various tiers and activity levels
- **Security**: Mock role-based access (admin vs regular user)

### 1.2 Admin Navigation
- Add admin detection logic (e.g., email contains 'admin')
- Route to `/admin` instead of `/dashboard` for admin users
- Admin sidebar with sections: Users, Revenue, Transactions, System

## 2. Client Settings Page & Subscription Management

### 2.1 Settings Page Structure
- **Location**: Accessible from client dashboard sidebar
- **Tabs**:
  - Account (Profile, Email, Password)
  - Subscription (Current plan, Billing cycle, Next payment)
  - Payment Methods (Add/Remove cards - mocked)
  - Billing History (Past invoices with download option)
  - Preferences (Notifications, Language)

### 2.2 Subscription Management
- Display current tier (Free/Pro/Business)
- Show next billing date and amount in ZAR
- "Upgrade Plan" button → Opens pricing modal
- "Downgrade Plan" button with confirmation
- "Cancel Subscription" with retention flow
- Billing cycle toggle (Monthly/Annual with 20% discount)

### 2.3 Payment Methods
- Card list display (last 4 digits, expiry, brand)
- "Add Payment Method" button → Polar modal simulation
- "Remove" and "Set as Default" actions
- Mock Stripe/Polar-style card management UI

## 3. Payment Modals & Polar Integration (Simulated)

### 3.1 Credit Top-up Modal
- **Trigger**: "Buy Credits" buttons on landing page and dashboard
- **Packages**:
  - 100 Credits → R150.00
  - 500 Credits → R600.00 (Save R150)
  - 1000 Credits → R1,000.00 (Save R500)
  - Video Pack (50 videos) → R850.00
- **Checkout Flow**:
  1. Package selection
  2. Payment summary (Subtotal, VAT 15%, Total)
  3. Polar payment interface simulation
  4. Success confirmation with credit update

### 3.2 Subscription Checkout Modal
- **Trigger**: "Get Started", "Get Pro", "Contact Sales" buttons
- **Flow**:
  1. Plan selection confirmation
  2. Billing cycle selection (Monthly/Annual)
  3. Payment details (simulated Polar form)
  4. Terms acceptance checkbox
  5. Success → Route to dashboard with updated tier

### 3.3 Polar UI Simulation
- Authentic Polar.sh styled checkout interface
- Card input fields (Number, Expiry, CVC, Name)
- Secure badge indicators
- Loading states during "processing"
- Success/Error states with animations

## 4. Multi-Language Support (11 South African Languages)

### 4.1 Language System
- **Framework**: Implement using next-intl or i18next
- **Languages**:
  1. English
  2. Afrikaans
  3. isiZulu
  4. isiXhosa
  5. Sepedi
  6. Setswana
  7. Sesotho
  8. Xitsonga
  9. siSwati
  10. Tshivenda
  11. isiNdebele

### 4.2 Translation Coverage
- **Landing Page**: Full translation of all sections
- **Dashboard**: Navigation, buttons, labels, messages
- **Forms**: Input labels, placeholders, validation messages
- **AI Generation**: Platform-specific content in selected language
- **Legal Pages**: Terms, Privacy Policy localized for SA

### 4.3 Language Selector
- Dropdown in navigation (both landing and dashboard)
- Flag icons for visual identification
- Persist language preference in localStorage
- Update route with locale prefix (e.g., `/zu/dashboard`)

### 4.4 AI Content Generation in Local Languages
- Update `app/actions/generate.ts` to accept language parameter
- Modify Gemini prompts to generate content in selected language
- Maintain South African cultural context across all languages
- Example: "Howzit" (English) → "Heita" (Zulu) → "Haai" (Afrikaans)

## 5. Automation & Scheduling Features

### 5.1 Calendar/Schedule View
- **Location**: `/dashboard/schedule` or tab in dashboard
- **Features**:
  - Monthly calendar grid view
  - Daily list view toggle
  - Scheduled posts displayed on calendar
  - Drag-and-drop rescheduling
  - Color coding by platform (Instagram=Pink, Twitter=Blue, etc.)
  - Time slot suggestions based on engagement data (mock)

### 5.2 Post Scheduling Interface
- Time picker with timezone (SAST - South African Standard Time)
- Best time suggestions powered by mock AI analysis
- Recurring post option (Daily, Weekly, Monthly)
- Bulk scheduling for multiple posts
- Queue management (pause, resume, delete)

### 5.3 AI Pilot Automation
- **Location**: `/dashboard/automation` or tab
- **Features**:
  - Automation rules creation wizard
  - Rule template selection:
    - "Weekly Product Showcase"
    - "Daily Tips & Tricks"
    - "Monthly Newsletter Recap"
  - Frequency selector (Daily, Weekly, Bi-weekly, Monthly)
  - Core topic/theme input
  - Platform distribution settings
  - Active/Inactive toggle per rule
  - Rule history and performance (mock analytics)

### 5.4 Smart Suggestions
- Optimal posting times based on platform and audience (mock data)
- Content type recommendations (Image post, Video, Carousel)
- Hashtag suggestions based on topic and language
- Tone/vibe recommendations for different times of day

## Technical Constraints

1. **All functionality must be simulated** - No real payment processing, no real API calls to external services
2. **Mock data** - All user data, transactions, analytics are client-side mocks
3. **Responsive design** - All components must work on mobile, tablet, desktop
4. **Accessibility** - Proper ARIA labels, keyboard navigation, color contrast
5. **Performance** - Lazy load images, code splitting for admin routes
6. **Design System Compliance** - All new components use Purple Glow design tokens

## Acceptance Criteria

### Admin Dashboard
- [ ] Admin can view list of all users with their tiers and credits
- [ ] Admin can manually adjust user credits
- [ ] Admin can upgrade/downgrade user tiers
- [ ] Admin can view revenue metrics (MRR, total transactions)
- [ ] Admin can view transaction log with filtering

### Settings & Subscription
- [ ] User can view current subscription details
- [ ] User can upgrade to higher tier via modal
- [ ] User can cancel subscription with confirmation
- [ ] User can view billing history (5+ mock invoices)
- [ ] User can add/remove payment methods (simulated)

### Payment Modals
- [ ] Credit top-up modal opens with 4 package options
- [ ] Checkout flow shows accurate pricing with VAT
- [ ] Success state updates user credits in UI
- [ ] Subscription modal allows plan selection
- [ ] Payment simulation shows loading and success states

### Multi-Language
- [ ] Language dropdown available in navigation
- [ ] Changing language updates all UI text
- [ ] Language preference persists across sessions
- [ ] AI content generation works in selected language
- [ ] All 11 SA languages have core translations

### Automation & Scheduling
- [ ] Calendar view displays scheduled posts
- [ ] User can schedule posts with date/time picker
- [ ] Best time suggestions are displayed
- [ ] User can create automation rules
- [ ] Automation rules can be activated/deactivated
- [ ] Schedule view color-codes posts by platform

## Out of Scope (This Phase)

- Real payment processing integration
- Real database persistence
- Real authentication beyond mock sessions
- Video generation (Veo) - UI only, no actual generation
- Analytics and reporting (beyond mock data display)
- Email notifications
- Team collaboration features
- API integrations with actual social media platforms
