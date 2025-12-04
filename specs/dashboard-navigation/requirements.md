# Dashboard Navigation & Login Fix Requirements

## Overview
Address two critical user-reported issues:
1.  **Dashboard Navigation**: When logged in, clicking "Dashboard" on the landing page does not navigate to the dashboard.
2.  **Production Login**: Login flow fails in production environment.

## Requirements

### 1. Dashboard Navigation
- **Behavior**: If a user is authenticated, clicking the "Dashboard" button (or "Get Started" if it acts as such) on the landing page must redirect them to `/dashboard`.
- **State Awareness**: The landing page must accurately reflect the user's authentication state (Logged In vs. Logged Out).
- **UI**:
    - If Logged Out: Show "Login" / "Get Started" buttons.
    - If Logged In: Show "Dashboard" button that links to `/dashboard`.

### 2. Production Login
- **Configuration**: Ensure production environment variables are correctly configured to support the authentication flow (Better Auth).
- **Validation**: Verify that `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` are properly set and validated in production.

## Technical Constraints
- **Framework**: Next.js 14+ (App Router).
- **Auth Library**: Better Auth.
- **State Management**: React Context / Hooks for auth state.
