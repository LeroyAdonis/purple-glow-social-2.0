# Polar Payment Integration Setup Guide

This guide walks you through setting up Polar.sh payment integration for Purple Glow Social 2.0.

## Prerequisites

- A Polar.sh account (sandbox and/or production)
- Access to the project's environment variables
- Database access for running migrations
- Administrative access to configure webhooks

---

## Step 1: Create Polar Account

### Sandbox Environment (Testing)

1. Go to [Polar.sh Sandbox](https://sandbox.polar.sh)
2. Sign up or log in
3. Create an organization for your project

### Production Environment

1. Go to [Polar.sh](https://polar.sh)
2. Sign up or log in
3. Create an organization for your project

---

## Step 2: Generate API Credentials

### Access Token

1. Navigate to Settings > API
2. Click "Generate Access Token"
3. Give it a descriptive name (e.g., "Purple Glow Social Production")
4. Grant required scopes:
   - `checkouts:read`
   - `checkouts:write`
   - `products:read`
   - `customers:read`
   - `customers:write`
   - `subscriptions:read`
   - `subscriptions:write`
5. Copy and save the access token securely

### Webhook Secret

1. Navigate to Settings > Webhooks
2. Click "Add Webhook"
3. Set webhook URL: `https://yourdomain.com/api/webhooks/polar`
4. Select events to listen to:
   - `order.created`
   - `order.paid`
   - `order.refunded`
   - `subscription.created`
   - `subscription.active`
   - `subscription.canceled`
   - `subscription.updated`
5. Copy the webhook secret

---

## Step 3: Create Products in Polar Dashboard

### Credit Packages

Create the following one-time purchase products:

#### 1. 100 Credits Starter Pack
- **Name**: 100 Credits
- **Price**: R150.00 ZAR
- **Type**: One-time
- **Description**: 100 credits for AI content generation

#### 2. 500 Credits Popular Pack
- **Name**: 500 Credits
- **Price**: R600.00 ZAR
- **Type**: One-time
- **Description**: 500 credits - Best value for regular users

#### 3. 1000 Credits Bulk Pack
- **Name**: 1000 Credits
- **Price**: R1000.00 ZAR
- **Type**: One-time
- **Description**: 1000 credits for power users

#### 4. 50 Video Credits Pack
- **Name**: 50 Video Credits
- **Price**: R100.00 ZAR
- **Type**: One-time
- **Description**: 50 video generation credits

### Subscription Products

Create the following recurring subscription products:

#### 1. Pro Plan - Monthly
- **Name**: Pro Plan - Monthly
- **Price**: R299.00 ZAR
- **Type**: Recurring
- **Interval**: Monthly
- **Description**: 500 credits per month + pro features

#### 2. Pro Plan - Annual
- **Name**: Pro Plan - Annual
- **Price**: R3588.00 ZAR (R299 * 12 * 0.8)
- **Type**: Recurring
- **Interval**: Annual
- **Description**: 500 credits per month + pro features (20% savings)

#### 3. Business Plan - Monthly
- **Name**: Business Plan - Monthly
- **Price**: R999.00 ZAR
- **Type**: Recurring
- **Interval**: Monthly
- **Description**: 2000 credits per month + business features

#### 4. Business Plan - Annual
- **Name**: Business Plan - Annual
- **Price**: R11988.00 ZAR (R999 * 12 * 0.8)
- **Type**: Recurring
- **Interval**: Annual
- **Description**: 2000 credits per month + business features (20% savings)

### Copy Product IDs

After creating each product, copy its Product ID from the product details page. You'll need these for the next step.

---

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Polar Configuration
POLAR_ACCESS_TOKEN=polar_at_xxxxxxxxxxxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxxx
POLAR_SERVER=sandbox  # or 'production'

# Base URL (for callbacks)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Product IDs - Credit Packages
POLAR_PRODUCT_100_CREDITS=prod_xxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_500_CREDITS=prod_xxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_1000_CREDITS=prod_xxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_50_VIDEO_CREDITS=prod_xxxxxxxxxxxxxxxxxxxxxx

# Product IDs - Subscriptions
POLAR_PRODUCT_PRO_MONTHLY=prod_xxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_PRO_ANNUAL=prod_xxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_BUSINESS_MONTHLY=prod_xxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_BUSINESS_ANNUAL=prod_xxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 5: Run Database Migrations

Generate and apply the database migrations:

```bash
# Generate migration files
npm run db:generate

# Review the generated SQL in drizzle/migrations/

# Apply migrations to database
npm run db:push

# Optional: Open Drizzle Studio to verify tables
npm run db:studio
```

Verify the following tables were created:
- `transactions`
- `subscriptions`
- `webhook_events`
- `user` table should have `polar_customer_id` column

---

## Step 6: Test in Sandbox Environment

### Testing Credit Purchase

1. Start your development server: `npm run dev`
2. Log in to your application
3. Navigate to credit top-up modal
4. Select a credit package
5. Click "Proceed to Payment"
6. You should be redirected to Polar's hosted checkout
7. Use test card details (provided by Polar in sandbox)
8. Complete the checkout
9. Verify you're redirected back to the dashboard
10. Check that credits were added to your account

### Testing Subscription Purchase

1. Navigate to subscription/upgrade modal
2. Select a plan and billing cycle
3. Complete checkout process
4. Verify your tier was upgraded
5. Check subscription appears in settings

### Testing Webhooks

1. Go to Polar dashboard > Webhooks
2. View webhook delivery logs
3. Ensure events are being delivered successfully
4. Check your application logs for webhook processing
5. Verify database records in `webhook_events` table

---

## Step 7: Verify Integration

### Checklist

- [ ] Credit purchases create transactions in database
- [ ] Credits are added to user accounts after payment
- [ ] Subscriptions create subscription records in database
- [ ] User tier is upgraded after subscription activation
- [ ] Webhook events are processed successfully
- [ ] Transaction history displays correctly
- [ ] Error handling works (canceled checkouts, failed payments)
- [ ] Idempotency works (duplicate webhook events don't cause issues)

---

## Step 8: Deploy to Production

### Update Environment Variables

1. Switch `POLAR_SERVER` from `sandbox` to `production`
2. Update `POLAR_ACCESS_TOKEN` with production token
3. Update `POLAR_WEBHOOK_SECRET` with production webhook secret
4. Update all `POLAR_PRODUCT_*` IDs with production product IDs
5. Update `NEXT_PUBLIC_BASE_URL` to your production domain

### Configure Production Webhook

1. In Polar production dashboard, add webhook
2. URL: `https://yourdomain.com/api/webhooks/polar`
3. Ensure HTTPS is properly configured
4. Test webhook delivery with a test event

### Deploy

```bash
# Build the application
npm run build

# Deploy to your hosting platform (Vercel, etc.)
# Ensure environment variables are set in production
```

### Post-Deployment Testing

1. Make a small real purchase to verify end-to-end flow
2. Monitor webhook delivery in Polar dashboard
3. Check application logs for any errors
4. Verify database records are created correctly

---

## Troubleshooting

### Checkout Creation Fails

**Symptoms**: Error when clicking "Proceed to Payment"

**Solutions**:
- Verify `POLAR_ACCESS_TOKEN` is set correctly
- Check product IDs match your Polar products
- Ensure user is authenticated
- Check API error logs in console

### Webhooks Not Processing

**Symptoms**: Payments complete but credits/tier don't update

**Solutions**:
- Verify webhook URL is accessible (HTTPS, no firewall blocking)
- Check webhook secret matches
- Review webhook event logs in Polar dashboard
- Check `webhook_events` table for failed events
- Review application logs for processing errors

### Credits Not Added After Payment

**Symptoms**: Payment succeeds but user credits unchanged

**Solutions**:
- Check `order.paid` webhook was received
- Verify transaction record exists in database
- Check for errors in webhook processing logs
- Manually process webhook event if needed

### Subscription Not Activated

**Symptoms**: Payment succeeds but user tier not upgraded

**Solutions**:
- Check `subscription.active` webhook was received
- Verify subscription record exists in database
- Check metadata includes `userId` and `planId`
- Review webhook processing logs

### Duplicate Webhook Events

**Symptoms**: Same webhook processed multiple times

**Solutions**:
- Idempotency is handled via `eventId` in `webhook_events` table
- Verify `eventId` is unique for each event
- Check database for duplicate event records

---

## Security Best Practices

1. **Never commit credentials**: Keep tokens in `.env`, never in code
2. **Use HTTPS**: Webhooks require secure connections
3. **Verify signatures**: Webhook adapter automatically verifies signatures
4. **Rate limiting**: Consider adding rate limits to checkout endpoints
5. **Input validation**: Always validate user input before creating checkouts
6. **Error logging**: Log errors but don't expose sensitive details to users

---

## Monitoring & Maintenance

### What to Monitor

- Webhook delivery success rate (should be >99%)
- Checkout creation success rate
- Transaction processing time
- Failed webhook events in database
- Discrepancies between Polar and local database

### Regular Tasks

- Weekly: Review failed webhook events and retry if needed
- Monthly: Reconcile transactions with Polar dashboard
- Quarterly: Review and update product prices if needed
- As needed: Update product IDs when creating new products

---

## Support Resources

- **Polar Documentation**: https://polar.sh/docs
- **Polar API Reference**: https://api.polar.sh/redoc
- **Polar Discord**: https://discord.gg/polar
- **Email Support**: support@polar.sh

---

## FAQ

### Q: Can I test without a real payment?

A: Yes, use the sandbox environment with test cards provided by Polar.

### Q: How do I handle refunds?

A: Process refunds through the Polar dashboard. The `order.refunded` webhook will automatically deduct credits.

### Q: Can users have multiple subscriptions?

A: No, the current implementation allows one active subscription per user.

### Q: What happens if a webhook fails?

A: Failed webhooks are logged in the `webhook_events` table and can be manually retried.

### Q: Can I change product prices?

A: Yes, update prices in Polar dashboard. Existing subscriptions maintain their original price.

### Q: How do I add a new credit package?

A: Create the product in Polar dashboard, add product ID to env vars, update `lib/polar/config.ts`, and redeploy.

---

**Last Updated**: 2024  
**Version**: 1.0
