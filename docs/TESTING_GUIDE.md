# Polar Payment Integration - Testing Guide

This guide provides comprehensive testing procedures for the Polar payment integration.

---

## Prerequisites

Before testing, ensure:
- ✅ Database migrations applied (`npm run db:push`)
- ✅ Polar sandbox account created
- ✅ All 8 products created in Polar dashboard
- ✅ Environment variables configured in `.env`
- ✅ Application running (`npm run dev`)
- ✅ Webhook forwarding set up (ngrok or Polar CLI)

---

## Test Environment Setup

### Test Cards (Polar Sandbox)

Polar provides test card numbers for different scenarios:

| Card Number | Scenario | CVV | Expiry |
|-------------|----------|-----|--------|
| `4242 4242 4242 4242` | Successful payment | Any 3 digits | Any future date |
| `4000 0000 0000 0002` | Card declined | Any 3 digits | Any future date |
| `4000 0000 0000 9995` | Insufficient funds | Any 3 digits | Any future date |
| `4000 0025 0000 3155` | Requires authentication | Any 3 digits | Any future date |

### Test User Account

1. Sign up or log in to your application
2. Note your user ID (check database or console logs)
3. Check initial credits balance

---

## Test Suite 1: Credit Purchase Flow

### Test 1.1: Purchase 100 Credits (Happy Path)

**Objective**: Verify successful credit purchase end-to-end

**Steps**:
1. Log in to the application
2. Navigate to dashboard
3. Click "Buy Credits" or credit top-up button
4. Select **"100 Credits"** package (R150)
5. Click **"Proceed to Payment"**

**Expected Results**:
- ✅ Loading state appears
- ✅ Redirected to Polar checkout page
- ✅ Checkout shows correct amount (R150)
- ✅ Checkout shows correct product (100 Credits)

6. Complete payment with test card `4242 4242 4242 4242`
7. Fill in test details:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVV: 123
   - Name: Test User
8. Submit payment

**Expected Results**:
- ✅ Payment processes successfully
- ✅ Redirected back to dashboard
- ✅ Success message displayed
- ✅ Credits balance increased by 100
- ✅ Transaction appears in transaction history

**Verify in Database**:
```sql
-- Check transaction was created
SELECT * FROM transactions 
WHERE user_id = 'your_user_id' 
ORDER BY created_at DESC LIMIT 1;

-- Check credits were added
SELECT credits FROM user WHERE id = 'your_user_id';

-- Check webhook event was received
SELECT * FROM webhook_events 
WHERE event_type = 'order.paid' 
ORDER BY created_at DESC LIMIT 1;
```

### Test 1.2: Purchase 500 Credits

**Steps**: Repeat Test 1.1 with 500 Credits package (R600)

**Expected Results**:
- ✅ Credits balance increased by 500
- ✅ Transaction recorded with correct amount

### Test 1.3: Purchase 1000 Credits

**Steps**: Repeat Test 1.1 with 1000 Credits package (R1000)

**Expected Results**:
- ✅ Credits balance increased by 1000

### Test 1.4: Purchase Video Credits

**Steps**: Repeat Test 1.1 with 50 Video Credits package (R100)

**Expected Results**:
- ✅ Credits balance increased by 50

### Test 1.5: Failed Payment

**Objective**: Verify error handling for failed payments

**Steps**:
1. Start credit purchase flow
2. Use declined card: `4000 0000 0000 0002`
3. Attempt payment

**Expected Results**:
- ✅ Payment fails with clear error message
- ✅ User not charged
- ✅ Credits not added
- ✅ User can retry payment

### Test 1.6: Cancelled Checkout

**Objective**: Verify handling of user cancellation

**Steps**:
1. Start credit purchase flow
2. Get to Polar checkout page
3. Click back button or close tab
4. Navigate back to application

**Expected Results**:
- ✅ No charge processed
- ✅ Credits unchanged
- ✅ User can restart purchase

---

## Test Suite 2: Subscription Flow

### Test 2.1: Subscribe to Pro Monthly (Happy Path)

**Objective**: Verify successful subscription creation and tier upgrade

**Steps**:
1. Log in to the application
2. Navigate to subscription/upgrade page
3. Select **"Pro Plan"**
4. Select **"Monthly"** billing
5. Click **"Subscribe Now"**
6. Complete payment with test card `4242 4242 4242 4242`

**Expected Results**:
- ✅ Redirected to Polar checkout
- ✅ Checkout shows R299/month
- ✅ Payment processes successfully
- ✅ Redirected back to dashboard
- ✅ User tier upgraded to "pro"
- ✅ Subscription shows as active in settings

**Verify in Database**:
```sql
-- Check user tier upgraded
SELECT tier FROM user WHERE id = 'your_user_id';

-- Check subscription created
SELECT * FROM subscriptions 
WHERE user_id = 'your_user_id' 
ORDER BY created_at DESC LIMIT 1;

-- Check webhook events
SELECT * FROM webhook_events 
WHERE event_type IN ('subscription.created', 'subscription.active')
ORDER BY created_at DESC LIMIT 2;
```

### Test 2.2: Subscribe to Pro Annual

**Steps**: Repeat Test 2.1 with Annual billing

**Expected Results**:
- ✅ Checkout shows R3588/year
- ✅ Subscription created with annual billing cycle
- ✅ User tier upgraded to "pro"

### Test 2.3: Subscribe to Business Monthly

**Steps**: Subscribe to Business plan with monthly billing

**Expected Results**:
- ✅ Checkout shows R999/month
- ✅ User tier upgraded to "business"

### Test 2.4: Subscribe to Business Annual

**Steps**: Subscribe to Business plan with annual billing

**Expected Results**:
- ✅ Checkout shows R11988/year
- ✅ User tier upgraded to "business"

### Test 2.5: Cancel Subscription

**Objective**: Verify subscription cancellation

**Steps**:
1. Have an active subscription (from previous tests)
2. Navigate to Settings > Subscription
3. Click **"Cancel Subscription"**
4. Confirm cancellation

**Expected Results**:
- ✅ Subscription marked for cancellation at period end
- ✅ User retains access until end of billing period
- ✅ Database updated with `cancel_at_period_end = true`

---

## Test Suite 3: Webhook Processing

### Test 3.1: Webhook Idempotency

**Objective**: Verify duplicate webhook events are handled correctly

**Steps**:
1. Make a credit purchase
2. In Polar dashboard, find the webhook event
3. Click "Resend" to send duplicate event
4. Check database

**Expected Results**:
- ✅ Duplicate event logged in webhook_events table
- ✅ Credits only added once (not duplicated)
- ✅ No errors in application logs

### Test 3.2: Webhook Signature Verification

**Objective**: Verify webhook security

**Steps**:
1. Send a fake webhook request:
```bash
curl -X POST http://localhost:3000/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -H "webhook-signature: fake_signature" \
  -d '{"type": "order.paid", "data": {"id": "fake"}}'
```

**Expected Results**:
- ✅ Request rejected (401 or 403 status)
- ✅ No database changes
- ✅ Error logged

### Test 3.3: Webhook Event Processing

**Objective**: Verify all event types are handled

**Events to Test**:
- ✅ `order.created` - Transaction record created
- ✅ `order.paid` - Credits added
- ✅ `subscription.created` - Subscription record created
- ✅ `subscription.active` - Tier upgraded
- ✅ `subscription.canceled` - Tier downgraded
- ✅ `order.refunded` - Credits deducted

---

## Test Suite 4: Error Handling

### Test 4.1: Unauthenticated User

**Steps**:
1. Log out
2. Try to access `/api/checkout/credits` directly

**Expected Results**:
- ✅ Returns 401 Unauthorized
- ✅ No checkout created

### Test 4.2: Invalid Package ID

**Steps**:
1. Send API request with invalid package ID:
```bash
curl -X POST http://localhost:3000/api/checkout/credits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"packageId": "invalid"}'
```

**Expected Results**:
- ✅ Returns 400 Bad Request
- ✅ Error message indicates invalid package

### Test 4.3: Missing Polar Credentials

**Steps**:
1. Temporarily remove `POLAR_ACCESS_TOKEN` from `.env`
2. Restart server
3. Try to purchase credits

**Expected Results**:
- ✅ Returns 500 Internal Server Error
- ✅ Error logged in console

### Test 4.4: Database Connection Failure

**Steps**:
1. Stop database temporarily
2. Try to purchase credits

**Expected Results**:
- ✅ Graceful error handling
- ✅ User-friendly error message
- ✅ No data corruption

---

## Test Suite 5: UI/UX Testing

### Test 5.1: Loading States

**Verify**:
- ✅ Loading spinner shows when creating checkout
- ✅ Button disabled during processing
- ✅ Loading text displays ("Creating checkout...")

### Test 5.2: Error Messages

**Verify**:
- ✅ Network errors show user-friendly message
- ✅ Payment failures show appropriate message
- ✅ Error messages can be dismissed

### Test 5.3: Success Feedback

**Verify**:
- ✅ Success modal displays after payment
- ✅ Confetti animation plays
- ✅ Correct credit/subscription details shown
- ✅ User can close modal and continue

### Test 5.4: Responsive Design

**Test on**:
- ✅ Mobile (320px width)
- ✅ Tablet (768px width)
- ✅ Desktop (1024px+ width)

### Test 5.5: Browser Compatibility

**Test on**:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Test Suite 6: Data Integrity

### Test 6.1: Transaction History Accuracy

**Steps**:
1. Make multiple purchases (credits + subscription)
2. Navigate to Settings > Billing History
3. Verify all transactions appear

**Expected Results**:
- ✅ All transactions listed
- ✅ Correct amounts displayed
- ✅ Correct dates/times
- ✅ Correct status (completed/pending/failed)

### Test 6.2: Credits Balance Consistency

**Steps**:
1. Note initial credits
2. Purchase 100 credits
3. Use 50 credits (generate content)
4. Purchase 500 more credits

**Verify**:
```sql
-- Check credits match expected value
SELECT credits FROM user WHERE id = 'your_user_id';
-- Should be: initial + 100 - 50 + 500
```

### Test 6.3: Subscription Status Accuracy

**Steps**:
1. Subscribe to Pro plan
2. Check subscription table
3. Check user tier
4. Cancel subscription
5. Verify status updates

**Expected Results**:
- ✅ Database reflects current subscription state
- ✅ Tier matches subscription level
- ✅ Period dates are accurate

---

## Test Suite 7: Performance Testing

### Test 7.1: Checkout Creation Speed

**Objective**: Verify checkout creates quickly

**Steps**:
1. Measure time from button click to redirect
2. Should be < 2 seconds

**Verify**:
- ✅ Response time < 2000ms
- ✅ No user-perceivable lag

### Test 7.2: Webhook Processing Speed

**Objective**: Verify webhooks process efficiently

**Steps**:
1. Make a purchase
2. Check webhook processing time in logs

**Expected**:
- ✅ Webhook processed in < 5 seconds
- ✅ No timeout errors

### Test 7.3: Concurrent Checkouts

**Objective**: Test multiple simultaneous users

**Steps**:
1. Open 5 browser tabs
2. Start checkout in all simultaneously

**Expected Results**:
- ✅ All checkouts create successfully
- ✅ No race conditions
- ✅ No data corruption

---

## Test Suite 8: Edge Cases

### Test 8.1: Multiple Quick Purchases

**Steps**:
1. Purchase 100 credits
2. Immediately purchase 500 credits
3. Immediately purchase 1000 credits

**Expected Results**:
- ✅ All purchases process correctly
- ✅ Credits total is accurate
- ✅ No transactions lost

### Test 8.2: Subscription Upgrade Path

**Steps**:
1. Subscribe to Pro Monthly
2. Immediately try to subscribe to Business Monthly

**Expected Results**:
- ✅ System prevents duplicate active subscriptions
- ✅ Clear message about existing subscription
- ✅ Option to upgrade/change plan

### Test 8.3: Refund Scenario

**Objective**: Verify refund processing

**Steps**:
1. Purchase credits
2. In Polar dashboard, process a refund
3. Check application response

**Expected Results**:
- ✅ Refund webhook received
- ✅ Credits deducted (or account balance adjusted)
- ✅ Transaction marked as refunded
- ✅ Credits don't go negative

---

## Monitoring & Logs

### What to Monitor

1. **Application Logs**:
```bash
# Watch for errors
tail -f logs/app.log | grep ERROR
```

2. **Webhook Delivery** (Polar Dashboard):
- Check webhook logs
- Monitor delivery success rate
- Review failed deliveries

3. **Database**:
```sql
-- Check for failed webhooks
SELECT * FROM webhook_events WHERE status = 'failed';

-- Check for pending transactions
SELECT * FROM transactions WHERE status = 'pending';
```

---

## Test Report Template

After completing tests, document results:

### Test Summary

**Date**: _____________  
**Tester**: _____________  
**Environment**: Sandbox / Production  
**Application Version**: _____________  

### Results

| Test Suite | Tests Passed | Tests Failed | Notes |
|------------|--------------|--------------|-------|
| Credit Purchase | __/6 | __/6 | |
| Subscription Flow | __/5 | __/5 | |
| Webhook Processing | __/3 | __/3 | |
| Error Handling | __/4 | __/4 | |
| UI/UX | __/5 | __/5 | |
| Data Integrity | __/3 | __/3 | |
| Performance | __/3 | __/3 | |
| Edge Cases | __/3 | __/3 | |
| **TOTAL** | **__/32** | **__/32** | |

### Issues Found

1. **Issue**: _____________  
   **Severity**: Critical / High / Medium / Low  
   **Status**: Open / Fixed / Won't Fix  

2. **Issue**: _____________  
   **Severity**: Critical / High / Medium / Low  
   **Status**: Open / Fixed / Won't Fix  

### Recommendations

- _____________
- _____________
- _____________

---

## Troubleshooting Common Test Failures

### Credits Not Added After Payment

**Possible Causes**:
- Webhook not received (check ngrok/forwarding)
- Webhook processing error (check logs)
- Database connection issue

**Solution**:
1. Check webhook_events table for the event
2. Check application logs for errors
3. Manually trigger webhook if needed

### Checkout Creation Fails

**Possible Causes**:
- Invalid product ID
- Missing/incorrect API token
- Network connectivity issue

**Solution**:
1. Verify product IDs in .env
2. Check POLAR_ACCESS_TOKEN is valid
3. Test Polar API connectivity

### Subscription Not Upgrading Tier

**Possible Causes**:
- `subscription.active` webhook not received
- Metadata missing userId or planId
- Database update failed

**Solution**:
1. Check webhook_events for subscription.active
2. Verify payload includes correct metadata
3. Check database user table for tier update

---

## Production Testing Checklist

Before going live:

- [ ] All sandbox tests pass
- [ ] Production Polar account configured
- [ ] Production products created with correct IDs
- [ ] Production environment variables set
- [ ] Production webhook URL configured (HTTPS required)
- [ ] SSL certificate valid
- [ ] Database backups configured
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Real test purchase with small amount
- [ ] Refund test purchase to verify refund flow
- [ ] Monitor logs for 24 hours after launch

---

## Support & Resources

- **Polar Dashboard**: Check webhook delivery logs
- **Application Logs**: Check server logs for errors
- **Database**: Query webhook_events and transactions tables
- **Polar Support**: support@polar.sh
- **Documentation**: `docs/POLAR_SETUP_GUIDE.md`

---

**Ready to Test?** Follow this guide step-by-step and document your results!
