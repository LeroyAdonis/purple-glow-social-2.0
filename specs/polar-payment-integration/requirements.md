# Requirements: Polar Payment Integration

## Overview
Integrate Polar.sh payment system into Purple Glow Social 2.0 to handle real payments for credit purchases and subscription management, replacing the current mock/simulation system.

## Objectives
1. Replace mock payment simulation with real Polar.sh payment processing
2. Enable users to purchase credits using Polar checkout
3. Enable users to subscribe to Pro/Business plans using Polar subscriptions
4. Handle webhook events for payment confirmations and subscription updates
5. Store transaction records in the database
6. Maintain South African context (ZAR currency, timezone, etc.)

## Functional Requirements

### FR-1: Environment Configuration
- **FR-1.1**: Add Polar API credentials to environment variables
  - `POLAR_ACCESS_TOKEN` - Server-side access token
  - `POLAR_WEBHOOK_SECRET` - Webhook signature verification
  - `POLAR_ORGANIZATION_ID` - Organization identifier
  - `POLAR_SERVER` - Environment (sandbox/production)
- **FR-1.2**: Secure storage of sensitive credentials
- **FR-1.3**: Support both sandbox and production environments

### FR-2: Product Configuration
- **FR-2.1**: Create Polar products for credit packages:
  - 100 Credits (R150)
  - 500 Credits (R600)
  - 1000 Credits (R1000)
  - 50 Video Credits (R100)
- **FR-2.2**: Create Polar subscription products:
  - Pro Plan - R299/month or R3588/year
  - Business Plan - R999/month or R11988/year
- **FR-2.3**: Configure products with ZAR currency
- **FR-2.4**: Store product IDs in configuration

### FR-3: Checkout Flow
- **FR-3.1**: Credit Purchase Flow
  - User selects credit package
  - System creates Polar checkout session
  - User redirects to Polar hosted checkout
  - System handles success/failure callbacks
  - Credits added to user account on success
- **FR-3.2**: Subscription Flow
  - User selects subscription plan and billing cycle
  - System creates Polar checkout session with subscription
  - User redirects to Polar hosted checkout
  - System handles success/failure callbacks
  - User tier updated on success
- **FR-3.3**: Pre-fill customer information from user profile
- **FR-3.4**: Maintain session state during checkout

### FR-4: API Endpoints
- **FR-4.1**: `POST /api/checkout/credits` - Create credit purchase checkout
  - Input: packageId, userId
  - Output: checkout URL
- **FR-4.2**: `POST /api/checkout/subscription` - Create subscription checkout
  - Input: planId, billingCycle, userId
  - Output: checkout URL
- **FR-4.3**: `GET /api/checkout/success` - Handle successful checkout
  - Input: checkout session ID
  - Output: redirect to dashboard with success modal
- **FR-4.4**: `GET /api/checkout/cancel` - Handle cancelled checkout
  - Input: checkout session ID
  - Output: redirect to dashboard with message
- **FR-4.5**: `POST /api/webhooks/polar` - Handle Polar webhooks
  - Input: webhook payload
  - Output: 200 OK acknowledgment

### FR-5: Webhook Handling
- **FR-5.1**: Verify webhook signatures
- **FR-5.2**: Handle `order.created` event
- **FR-5.3**: Handle `order.paid` event - Add credits to user
- **FR-5.4**: Handle `subscription.created` event
- **FR-5.5**: Handle `subscription.active` event - Upgrade user tier
- **FR-5.6**: Handle `subscription.canceled` event - Downgrade user tier
- **FR-5.7**: Handle `subscription.updated` event
- **FR-5.8**: Handle `order.refunded` event - Deduct credits
- **FR-5.9**: Store webhook events for audit trail

### FR-6: Database Schema
- **FR-6.1**: Add transactions table
  - id, userId, polarOrderId, type, amount, status, credits, description, createdAt
- **FR-6.2**: Add subscriptions table
  - id, userId, polarSubscriptionId, planId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd
- **FR-6.3**: Add webhook_events table for logging
  - id, eventType, payload, processedAt, status
- **FR-6.4**: Update user table with polarCustomerId

### FR-7: User Interface Updates
- **FR-7.1**: Update credit top-up modal to use real Polar checkout
- **FR-7.2**: Update subscription modal to use real Polar checkout
- **FR-7.3**: Add loading states during checkout creation
- **FR-7.4**: Display real transaction history from database
- **FR-7.5**: Show active subscription details with Polar data
- **FR-7.6**: Add customer portal link for subscription management

### FR-8: Error Handling
- **FR-8.1**: Handle Polar API errors gracefully
- **FR-8.2**: Handle webhook processing errors
- **FR-8.3**: Log errors for debugging
- **FR-8.4**: Display user-friendly error messages
- **FR-8.5**: Implement retry logic for failed webhook processing

### FR-9: Security
- **FR-9.1**: Verify webhook signatures
- **FR-9.2**: Validate user authentication before creating checkouts
- **FR-9.3**: Prevent unauthorized access to checkout endpoints
- **FR-9.4**: Secure storage of API credentials
- **FR-9.5**: Rate limiting on checkout creation

### FR-10: Testing & Validation
- **FR-10.1**: Test in Polar sandbox environment first
- **FR-10.2**: Verify credit purchases work end-to-end
- **FR-10.3**: Verify subscription purchases work end-to-end
- **FR-10.4**: Test webhook event handling
- **FR-10.5**: Test error scenarios (failed payments, network errors)
- **FR-10.6**: Validate ZAR currency handling

## Non-Functional Requirements

### NFR-1: Performance
- Checkout creation should complete within 2 seconds
- Webhook processing should complete within 5 seconds
- Database queries optimized with indexes

### NFR-2: Reliability
- 99.9% uptime for payment endpoints
- Idempotent webhook processing (handle duplicate events)
- Transaction atomicity (credits and payments in sync)

### NFR-3: Scalability
- Handle concurrent checkout requests
- Queue webhook processing for high volume
- Database schema supports millions of transactions

### NFR-4: Maintainability
- Clear separation of concerns (services, routes, models)
- Comprehensive error logging
- Documentation for Polar configuration
- Easy switching between sandbox and production

### NFR-5: Compliance
- PCI DSS compliance through Polar
- GDPR-compliant data handling
- South African consumer protection compliance
- Proper VAT handling (15%)

## Success Criteria
1. Users can purchase credits using real payment methods
2. Users can subscribe to plans using real payment methods
3. Credits are automatically added upon successful payment
4. User tiers are automatically updated upon subscription
5. All webhook events are processed correctly
6. Transaction history shows real payment data
7. Zero data inconsistencies between Polar and database
8. Smooth migration from mock to real payments

## Constraints
- Must maintain backward compatibility with existing UI
- Must preserve South African context (ZAR, SAST timezone)
- Must work with existing Better-auth authentication
- Must use existing Drizzle ORM schema patterns
- Must support both monthly and annual billing cycles

## Dependencies
- Polar.sh account with API access
- @polar-sh/sdk package
- @polar-sh/nextjs adapter package
- Existing authentication system (Better-auth)
- Database (PostgreSQL via Drizzle ORM)

## Out of Scope
- Payment method storage (handled by Polar)
- Invoice generation (handled by Polar)
- Refund UI (handled through Polar dashboard)
- Payment dispute handling (handled by Polar)
- Multi-currency support (ZAR only for now)
- Cryptocurrency payments

## Assumptions
1. Polar.sh supports ZAR currency
2. Users have valid payment methods
3. Webhook delivery is reliable with retries
4. SSL/TLS certificates are properly configured
5. Environment variables are securely managed

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Polar API downtime | High | Low | Implement fallback error messages, queue retries |
| Webhook delivery failure | High | Medium | Implement manual reconciliation, retry logic |
| Currency conversion issues | Medium | Low | Test thoroughly in sandbox, use ZAR exclusively |
| Database transaction failures | High | Low | Implement proper rollback, atomic operations |
| Security vulnerabilities | Critical | Low | Follow security best practices, verify signatures |

## Future Enhancements
- Support for additional currencies
- Custom payment forms (embedded checkout)
- Promo codes and discounts
- Gift card support
- Payment analytics dashboard
- Subscription upgrade/downgrade flows
- Trial period management
