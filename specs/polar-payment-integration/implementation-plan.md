# Implementation Plan: Polar Payment Integration

## Overview
This document outlines the phased implementation of Polar.sh payment system integration for Purple Glow Social 2.0.

---

## Phase 1: Discovery & Setup

### 1.1 Documentation Review
- [x] Review Polar TypeScript SDK documentation
- [x] Review Polar Next.js adapter documentation
- [x] Review Polar checkout flow documentation
- [x] Review Polar webhook documentation
- [x] Understand current mock payment implementation

### 1.2 Environment Setup
- [x] Install Polar SDK packages (`@polar-sh/sdk`, `@polar-sh/nextjs`)
- [ ] Create Polar account (sandbox environment)
- [ ] Generate API access token
- [ ] Generate webhook secret
- [x] Configure environment variables in `.env.example`
- [ ] Document Polar setup process in README

### 1.3 Product Configuration (Polar Dashboard)
- [ ] Create credit package products in Polar
  - 100 Credits - R150 ZAR
  - 500 Credits - R600 ZAR
  - 1000 Credits - R1000 ZAR
  - 50 Video Credits - R100 ZAR
- [ ] Create subscription products in Polar
  - Pro Monthly - R299 ZAR
  - Pro Annual - R3588 ZAR (R299*12*0.8)
  - Business Monthly - R999 ZAR
  - Business Annual - R11988 ZAR (R999*12*0.8)
- [ ] Document product IDs in configuration file

---

## Phase 2: Database Schema Updates

### 2.1 Create Migration Files
- [x] Create `transactions` table schema in `drizzle/schema.ts`
  - id (uuid, primary key)
  - userId (text, foreign key to user.id)
  - polarOrderId (text, unique)
  - type (enum: 'credit_purchase', 'subscription', 'refund')
  - amount (integer) - amount in cents
  - currency (text, default 'ZAR')
  - status (enum: 'pending', 'completed', 'failed', 'refunded')
  - credits (integer, nullable) - credits added/removed
  - description (text)
  - metadata (jsonb, nullable)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- [x] Create `subscriptions` table schema in `drizzle/schema.ts`
  - id (uuid, primary key)
  - userId (text, foreign key to user.id)
  - polarSubscriptionId (text, unique)
  - polarCustomerId (text)
  - planId (text) - 'pro' or 'business'
  - billingCycle (enum: 'monthly', 'annual')
  - status (enum: 'active', 'canceled', 'past_due', 'trialing')
  - currentPeriodStart (timestamp)
  - currentPeriodEnd (timestamp)
  - cancelAtPeriodEnd (boolean, default false)
  - canceledAt (timestamp, nullable)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- [x] Create `webhook_events` table schema in `drizzle/schema.ts`
  - id (uuid, primary key)
  - eventType (text)
  - eventId (text, unique) - Polar event ID for idempotency
  - payload (jsonb)
  - status (enum: 'pending', 'processed', 'failed')
  - processedAt (timestamp, nullable)
  - errorMessage (text, nullable)
  - retryCount (integer, default 0)
  - createdAt (timestamp)

- [x] Add `polarCustomerId` column to `user` table in `drizzle/schema.ts`

### 2.2 Generate and Run Migrations
- [ ] Run `npm run db:generate` to create migration files
- [ ] Review generated SQL migrations
- [ ] Run `npm run db:push` to apply migrations (dev environment)
- [ ] Verify tables created correctly using `npm run db:studio`

---

## Phase 3: Core Infrastructure

### 3.1 Configuration Management
- [x] Create `lib/polar/config.ts`
  - Export Polar configuration object
  - Product ID mappings (credit packages, subscription plans)
  - Environment-based settings (sandbox vs production)
  - Success/cancel URLs

### 3.2 Polar Client Setup
- [x] Create `lib/polar/client.ts`
  - Initialize Polar SDK client
  - Export configured client instance
  - Handle environment-based server selection

### 3.3 Database Service Layer
- [x] Create `lib/db/transactions.ts`
  - `createTransaction()` - Insert transaction record
  - `getTransactionByPolarOrderId()` - Find transaction
  - `updateTransactionStatus()` - Update status
  - `getUserTransactions()` - Get user's transaction history

- [x] Create `lib/db/subscriptions.ts`
  - `createSubscription()` - Insert subscription record
  - `getSubscriptionByPolarId()` - Find subscription
  - `updateSubscription()` - Update subscription details
  - `getUserActiveSubscription()` - Get user's active subscription
  - `cancelSubscription()` - Mark subscription as canceled

- [x] Create `lib/db/webhook-events.ts`
  - `createWebhookEvent()` - Insert webhook event
  - `markEventProcessed()` - Update event status
  - `markEventFailed()` - Record processing failure
  - `getUnprocessedEvents()` - Get events for retry

### 3.4 Polar Service Layer
- [x] Create `lib/polar/checkout-service.ts`
  - `createCreditCheckout()` - Create checkout for credit purchase
  - `createSubscriptionCheckout()` - Create checkout for subscription
  - `getCheckout()` - Retrieve checkout session details

- [x] Create `lib/polar/customer-service.ts`
  - `getOrCreateCustomer()` - Get existing or create new Polar customer
  - `updateCustomer()` - Update customer details

- [x] Create `lib/polar/webhook-service.ts`
  - `processWebhookEvent()` - Main webhook processing logic
  - `handleOrderPaid()` - Handle order paid event
  - `handleSubscriptionActive()` - Handle subscription activation
  - `handleSubscriptionCanceled()` - Handle subscription cancellation
  - `handleOrderRefunded()` - Handle refund event

---

## Phase 4: API Routes

### 4.1 Checkout Endpoints
- [x] Create `app/api/checkout/credits/route.ts`
  - POST handler
  - Validate authenticated user
  - Validate package selection
  - Create Polar checkout session
  - Return checkout URL

- [x] Create `app/api/checkout/subscription/route.ts`
  - POST handler
  - Validate authenticated user
  - Validate plan and billing cycle
  - Create Polar checkout session with subscription
  - Return checkout URL

- [x] Create `app/api/checkout/success/route.ts`
  - GET handler
  - Retrieve checkout session
  - Verify checkout status
  - Redirect to dashboard with success message

- [x] Create `app/api/checkout/cancel/route.ts`
  - GET handler
  - Redirect to dashboard with cancellation message

### 4.2 Webhook Endpoint
- [x] Create `app/api/webhooks/polar/route.ts`
  - POST handler using Polar Next.js adapter
  - Verify webhook signature
  - Route events to appropriate handlers
  - Implement idempotency (check eventId)
  - Return 200 OK for all events
  - Log errors for failed processing

### 4.3 Transaction History Endpoint
- [x] Create `app/api/transactions/route.ts`
  - GET handler
  - Validate authenticated user
  - Fetch user transactions from database
  - Return formatted transaction list

### 4.4 Subscription Management Endpoint
- [x] Create `app/api/subscription/route.ts`
  - GET handler - Get active subscription
  - POST handler - Create/update subscription
  - DELETE handler - Cancel subscription

### 4.5 Customer Portal Endpoint
- [ ] Create `app/api/portal/route.ts`
  - GET handler using Polar Next.js adapter
  - Generate customer portal URL
  - Redirect user to Polar customer portal

---

## Phase 5: Frontend Integration

### 5.1 Update Credit Top-up Modal
- [x] Update `components/modals/credit-topup-modal.tsx`
  - Replace mock purchase handler
  - Call `/api/checkout/credits` on package selection
  - Show loading state during checkout creation
  - Redirect to Polar checkout URL
  - Handle API errors gracefully

### 5.2 Update Subscription Modal
- [x] Update `components/modals/subscription-modal.tsx`
  - Replace mock subscription handler
  - Call `/api/checkout/subscription` on plan selection
  - Show loading state during checkout creation
  - Redirect to Polar checkout URL
  - Handle API errors gracefully

### 5.3 Update Settings View
- [ ] Update `components/settings-view.tsx`
  - Replace mock billing history with real data from `/api/transactions`
  - Display real subscription details from `/api/subscription`
  - Add "Manage Subscription" button linking to customer portal
  - Show loading states for async operations

### 5.4 Update Admin Dashboard
- [ ] Update `components/admin-dashboard-view.tsx`
  - Replace `MOCK_TRANSACTIONS` with real database queries
  - Update revenue metrics calculation
  - Add real-time transaction display
  - Add filters and pagination for transactions

### 5.5 Update Payment Success Modal
- [ ] Update `components/modals/payment-success-modal.tsx`
  - Receive real transaction data from checkout success callback
  - Display actual payment details (amount, credits, plan)
  - Add link to view transaction in billing history

### 5.6 Update Dashboard Client
- [ ] Update `app/dashboard/dashboard-client.tsx`
  - Remove mock subscription handlers
  - Integrate real checkout flows
  - Update credit display to reflect real balance

### 5.7 Update Landing Page
- [ ] Update `app/page.tsx`
  - Update pricing section with real Polar product links
  - Ensure proper authentication check before checkout

---

## Phase 6: Testing & Validation

### 6.1 Sandbox Testing
- [ ] Test credit purchase flow in sandbox
  - Select 100 credits package
  - Complete checkout in Polar
  - Verify credits added to account
  - Verify transaction recorded in database

- [ ] Test subscription flow in sandbox
  - Select Pro monthly plan
  - Complete checkout in Polar
  - Verify user tier upgraded
  - Verify subscription recorded in database

- [ ] Test webhook processing
  - Trigger test webhooks from Polar dashboard
  - Verify events processed correctly
  - Check database records updated

- [ ] Test error scenarios
  - Failed payment
  - Cancelled checkout
  - Webhook signature validation failure
  - Network errors

### 6.2 Edge Cases
- [ ] Test concurrent checkout attempts
- [ ] Test duplicate webhook events (idempotency)
- [ ] Test subscription cancellation
- [ ] Test refund processing
- [ ] Test user without Polar customer ID
- [ ] Test database transaction rollback scenarios

### 6.3 Data Migration Testing
- [ ] Test transition from mock to real data
- [ ] Verify existing mock users can make real purchases
- [ ] Ensure no data loss during migration

---

## Phase 7: Documentation & Deployment

### 7.1 Documentation
- [ ] Update README.md with Polar setup instructions
- [ ] Create `docs/POLAR_SETUP_GUIDE.md` with detailed configuration steps
- [ ] Document environment variables in `.env.example`
- [ ] Add inline code comments for complex logic
- [ ] Create troubleshooting guide for common issues

### 7.2 Environment Configuration
- [ ] Add Polar credentials to production environment variables
- [ ] Configure webhook URL in Polar dashboard
- [ ] Set up proper CORS and security headers
- [ ] Verify SSL certificates for webhook endpoints

### 7.3 Production Preparation
- [ ] Switch from sandbox to production Polar products
- [ ] Update product IDs in configuration
- [ ] Test in staging environment
- [ ] Set up monitoring and alerting for webhook failures
- [ ] Create database backups before deployment

### 7.4 Deployment
- [ ] Deploy database migrations to production
- [ ] Deploy application code to production
- [ ] Verify webhook endpoint is accessible
- [ ] Test end-to-end flows in production
- [ ] Monitor logs for errors

### 7.5 Post-Deployment
- [ ] Monitor webhook processing success rate
- [ ] Monitor checkout conversion rates
- [ ] Check for any error logs
- [ ] Verify transaction data consistency
- [ ] Update monitoring dashboards

---

## Phase 8: Cleanup & Optimization

### 8.1 Remove Mock Data Dependencies
- [ ] Remove mock transaction generation from `lib/mock-data.ts`
- [ ] Update components to use real data exclusively
- [ ] Remove simulation logic from payment handlers
- [ ] Clean up unused mock transaction code

### 8.2 Performance Optimization
- [ ] Add database indexes on frequently queried columns
  - transactions.userId
  - transactions.polarOrderId
  - subscriptions.userId
  - subscriptions.polarSubscriptionId
  - webhook_events.eventId

- [ ] Implement query result caching where appropriate
- [ ] Optimize transaction history queries with pagination
- [ ] Add connection pooling for database

### 8.3 Error Handling Enhancement
- [ ] Implement retry logic for failed webhooks
- [ ] Add comprehensive error logging
- [ ] Create error recovery procedures
- [ ] Set up alerts for critical failures

### 8.4 Security Hardening
- [ ] Implement rate limiting on checkout endpoints
- [ ] Add CSRF protection for API routes
- [ ] Audit all API endpoints for authentication
- [ ] Review and update security headers
- [ ] Implement webhook replay attack prevention

---

## Implementation Notes

### Technology Stack
- **SDK**: `@polar-sh/sdk` v1.x
- **Adapter**: `@polar-sh/nextjs` v1.x
- **Database**: PostgreSQL via Drizzle ORM
- **Framework**: Next.js 16 with App Router
- **Authentication**: Better-auth

### Key Design Decisions
1. **Hosted Checkout**: Use Polar's hosted checkout for PCI compliance and simplicity
2. **Webhook-Driven**: All payment confirmations processed via webhooks for reliability
3. **Idempotent Processing**: Use Polar event IDs to prevent duplicate processing
4. **Atomic Transactions**: Use database transactions to ensure data consistency
5. **Sandbox First**: All testing done in sandbox before production deployment

### Testing Strategy
- Manual testing in Polar sandbox environment
- End-to-end testing of checkout flows
- Webhook event simulation and validation
- Error scenario testing
- Data consistency validation

### Rollback Plan
If issues arise after deployment:
1. Revert to mock payment system by feature flag
2. Restore database from backup if needed
3. Disable webhook processing temporarily
4. Investigate and fix issues in staging
5. Re-deploy with fixes

### Success Metrics
- 100% of credit purchases result in correct credit addition
- 100% of subscriptions result in correct tier updates
- 99%+ webhook processing success rate
- < 2 second checkout creation time
- Zero payment/credit discrepancies

---

## Dependencies & Prerequisites

### External Dependencies
- Polar.sh account (sandbox and production)
- API access tokens
- Webhook secrets
- SSL/TLS certificates for webhook endpoint
- Domain configured for production webhooks

### Internal Dependencies
- Better-auth authentication system
- Drizzle ORM database connection
- Existing user management system
- Current UI components for modals

### Team Skills Required
- Next.js App Router expertise
- Drizzle ORM knowledge
- Payment integration experience
- Webhook handling experience
- Database migration management

---

## Timeline Estimate

| Phase | Estimated Time | Dependencies |
|-------|----------------|--------------|
| Phase 1: Discovery & Setup | 2-3 hours | Polar account access |
| Phase 2: Database Schema | 2-3 hours | Database access |
| Phase 3: Core Infrastructure | 4-6 hours | Phase 2 complete |
| Phase 4: API Routes | 4-6 hours | Phase 3 complete |
| Phase 5: Frontend Integration | 3-4 hours | Phase 4 complete |
| Phase 6: Testing & Validation | 4-6 hours | Phase 5 complete |
| Phase 7: Documentation & Deployment | 2-3 hours | Phase 6 complete |
| Phase 8: Cleanup & Optimization | 2-3 hours | Phase 7 complete |
| **Total** | **23-34 hours** | |

---

## Risk Mitigation

### High Priority Risks
1. **Webhook Delivery Failures**
   - Mitigation: Implement retry logic and manual reconciliation
   - Monitoring: Alert on failed webhook processing

2. **Payment/Credit Inconsistencies**
   - Mitigation: Atomic database transactions
   - Monitoring: Regular data consistency checks

3. **Security Vulnerabilities**
   - Mitigation: Follow security best practices, audit code
   - Monitoring: Security scanning and penetration testing

### Medium Priority Risks
1. **API Rate Limits**
   - Mitigation: Implement caching and request throttling
   
2. **Database Performance**
   - Mitigation: Proper indexing and query optimization

3. **User Experience Issues**
   - Mitigation: Comprehensive testing and error handling

---

## Next Steps

1. **Review this implementation plan** with stakeholders
2. **Obtain Polar account access** (sandbox environment)
3. **Begin Phase 1** - Discovery & Setup
4. **Checkpoint after Phase 3** - Review core infrastructure
5. **Checkpoint after Phase 6** - Validate sandbox testing
6. **Final review before Phase 7** - Production deployment

---

**Document Status**: Draft  
**Last Updated**: 2024  
**Version**: 1.0  
**Owner**: Development Team
