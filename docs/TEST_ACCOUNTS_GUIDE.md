# Test Accounts & Testing Guide

**Created:** Phase 7 Implementation  
**Purpose:** Comprehensive guide for test accounts and tier-based testing

---

## 📋 Overview

Purple Glow Social 2.0 includes a comprehensive test account system for verifying tier-based functionality, credit management, and feature limits. This guide covers all test accounts, their purposes, and testing procedures.

---

## 🔑 Test Accounts

### Quick Reference

| Account | Email | Password | Tier | Credits | Purpose |
|---------|-------|----------|------|---------|---------|
| Free User | free@test.purpleglow.co.za | TestFree123! | Free | 10 | Test free tier limits |
| Pro User | pro@test.purpleglow.co.za | TestPro123! | Pro | 500 | Test pro tier features |
| Business User | business@test.purpleglow.co.za | TestBiz123! | Business | 2000 | Test unlimited features |
| Admin User | admin@test.purpleglow.co.za | TestAdmin123! | Business | 2000 | Test admin dashboard |
| Low Credit User | lowcredit@test.purpleglow.co.za | TestLow123! | Pro | 2 | Test low credit warnings |
| Zero Credit User | zerocredit@test.purpleglow.co.za | TestZero123! | Pro | 0 | Test zero credit behavior |

---

## 🧪 Account Details

### 1. Free Test User

**Email:** `free@test.purpleglow.co.za`  
**Password:** `TestFree123!`  
**Tier:** Free  
**Credits:** 10

**Configuration:**
- 1 Instagram account connected
- 3 scheduled posts
- 0 automation rules (disabled for free tier)

**Test Scenarios:**
- ✅ Verify can only connect 1 account per platform
- ✅ Verify cannot create automation rules
- ✅ Verify 5 daily generation limit
- ✅ Verify 7-day advance scheduling limit
- ✅ Verify 5-post queue limit
- ✅ Verify 2 posts per day per platform limit
- ✅ Verify upgrade prompts appear at limits

---

### 2. Pro Test User

**Email:** `pro@test.purpleglow.co.za`  
**Password:** `TestPro123!`  
**Tier:** Pro  
**Credits:** 500 (+ 10 video credits)

**Configuration:**
- 2 Instagram accounts connected
- 2 Facebook accounts connected
- 1 Twitter account connected
- 25 scheduled posts
- 3 automation rules

**Test Scenarios:**
- ✅ Verify can connect up to 3 accounts per platform
- ✅ Verify automation rules work correctly
- ✅ Verify 50 daily generation limit
- ✅ Verify 30-day advance scheduling limit
- ✅ Verify 50-post queue limit
- ✅ Verify 10 posts per day per platform limit
- ✅ Verify 5 automation rules limit
- ✅ Verify credit purchase functionality

---

### 3. Business Test User

**Email:** `business@test.purpleglow.co.za`  
**Password:** `TestBiz123!`  
**Tier:** Business  
**Credits:** 2000 (+ 50 video credits)

**Configuration:**
- 3 Instagram accounts connected
- 2 Facebook accounts connected
- 2 Twitter accounts connected
- 1 LinkedIn account connected
- 100 scheduled posts
- 10 automation rules

**Test Scenarios:**
- ✅ Verify can connect up to 10 accounts per platform
- ✅ Verify unlimited automation rules
- ✅ Verify 200 daily generation limit
- ✅ Verify 90-day advance scheduling limit
- ✅ Verify 200-post queue limit
- ✅ Verify 50 posts per day per platform limit
- ✅ Verify priority support features

---

### 4. Admin Test User

**Email:** `admin@test.purpleglow.co.za`  
**Password:** `TestAdmin123!`  
**Tier:** Business  
**Credits:** 2000 (+ 50 video credits)  
**Role:** Admin

**Configuration:**
- No connected accounts (for clean admin testing)
- No scheduled posts

**Test Scenarios:**
- ✅ Verify access to admin dashboard
- ✅ Verify can view all user analytics
- ✅ Verify can view generation/publishing errors
- ✅ Verify can view job monitor
- ✅ Verify can retry failed jobs
- ✅ Verify can export analytics data

---

### 5. Low Credit User

**Email:** `lowcredit@test.purpleglow.co.za`  
**Password:** `TestLow123!`  
**Tier:** Pro  
**Credits:** 2 (< 20% of Pro tier allocation)

**Configuration:**
- Has low credit notification pre-created
- No connected accounts

**Test Scenarios:**
- ✅ Verify low credit warning banner appears
- ✅ Verify notification shows in notifications dropdown
- ✅ Verify credit warning threshold (20%) works
- ✅ Verify can still post with remaining credits
- ✅ Verify upgrade/topup prompts appear

---

### 6. Zero Credit User

**Email:** `zerocredit@test.purpleglow.co.za`  
**Password:** `TestZero123!`  
**Tier:** Pro  
**Credits:** 0

**Configuration:**
- 1 Instagram account connected
- 5 scheduled posts (to test skipping behavior)
- Has zero credit notification pre-created

**Test Scenarios:**
- ✅ Verify scheduled posts are skipped (not published)
- ✅ Verify post_skipped notification is created
- ✅ Verify cannot publish immediately
- ✅ Verify clear messaging about zero credits
- ✅ Verify posts marked as failed with appropriate error

---

## 🚀 Setting Up Test Accounts

### Prerequisites

1. PostgreSQL database configured (DATABASE_URL in .env)
2. Dependencies installed (`npm install`)
3. Schema pushed to database (`npm run db:push`)

### Running the Seed Script

```bash
# Seed all test accounts
npm run db:seed-test
```

The script will:
1. Clean up any existing test accounts
2. Create all 6 test users with proper tiers
3. Create connected accounts where specified
4. Create scheduled posts where specified
5. Create automation rules for Pro/Business tiers
6. Create relevant notifications
7. Display all credentials on completion

### Expected Output

```
╔════════════════════════════════════════════════════════════════╗
║     Purple Glow Social 2.0 - Test Account Seeding Script       ║
╚════════════════════════════════════════════════════════════════╝

🧹 Cleaning up existing test accounts...
  🗑️  Deleted: free@test.purpleglow.co.za
  🗑️  Deleted: pro@test.purpleglow.co.za
  ...

🌱 Creating test accounts...

📧 Creating: free@test.purpleglow.co.za
  ✅ User created (free tier, 10 credits)
  ✅ Connected 1 social accounts
  ✅ Created 3 scheduled posts
  ✅ Purpose: Test free tier limits
...

✅ Successfully created 6 test accounts!
```

---

## 🧪 Testing Procedures

### Test Suite 1: Tier Limits

#### Test 1.1: Free Tier Connected Account Limit

1. Log in as `free@test.purpleglow.co.za`
2. Navigate to Connected Accounts
3. Try to connect a second Instagram account
4. **Expected:** Connection blocked with upgrade prompt

#### Test 1.2: Free Tier Generation Limit

1. Log in as `free@test.purpleglow.co.za`
2. Go to AI Content Studio
3. Generate 5 posts
4. Try to generate a 6th post
5. **Expected:** Generation blocked with "5/5 daily limit reached" message

#### Test 1.3: Free Tier Automation Disabled

1. Log in as `free@test.purpleglow.co.za`
2. Navigate to Automation
3. **Expected:** Locked state with "Upgrade to Pro" message

#### Test 1.4: Pro Tier Queue Limit

1. Log in as `pro@test.purpleglow.co.za`
2. Check existing scheduled posts (25)
3. Try to schedule 26 more posts (total 51)
4. **Expected:** Scheduling blocked at 50-post limit

---

### Test Suite 2: Credit System

#### Test 2.1: Credit Deduction on Publish

1. Log in as `pro@test.purpleglow.co.za`
2. Note current credit balance
3. Create and publish a post to Instagram
4. **Expected:** Credits reduced by 1

#### Test 2.2: Multi-Platform Credit Deduction

1. Log in as `pro@test.purpleglow.co.za`
2. Note current credit balance
3. Publish a post to Instagram, Facebook, and Twitter
4. **Expected:** Credits reduced by 3 (1 per platform)

#### Test 2.3: Zero Credit Publishing Block

1. Log in as `zerocredit@test.purpleglow.co.za`
2. Try to publish a post
3. **Expected:** Publishing blocked with "0 credits" message

#### Test 2.4: Low Credit Warning

1. Log in as `lowcredit@test.purpleglow.co.za`
2. **Expected:** Yellow warning banner appears
3. **Expected:** Notification in dropdown about low credits

---

### Test Suite 3: Notifications

#### Test 3.1: Notification Display

1. Log in as `lowcredit@test.purpleglow.co.za`
2. Click notifications icon in header
3. **Expected:** See "Low Credits Warning" notification
4. Click to mark as read
5. **Expected:** Notification marked as read (styling changes)

#### Test 3.2: Notification Dismissal

1. Log in as any test user
2. Open notifications dropdown
3. Dismiss a notification
4. **Expected:** Notification removed from list

---

### Test Suite 4: Admin Dashboard

#### Test 4.1: Admin Access

1. Log in as `admin@test.purpleglow.co.za`
2. Navigate to Admin Dashboard
3. **Expected:** Full admin dashboard loads with all sections

#### Test 4.2: Analytics Display

1. In admin dashboard, check Credits Analytics
2. **Expected:** Shows credits per platform breakdown
3. **Expected:** Shows generation vs publishing stats

#### Test 4.3: Job Monitor

1. In admin dashboard, check Job Monitor section
2. **Expected:** Shows pending/failed/completed jobs
3. Try retry button on failed job (if any)
4. **Expected:** Job queued for retry

#### Test 4.4: Error Tracking

1. In admin dashboard, check Generation Errors
2. In admin dashboard, check Publishing Errors
3. **Expected:** Error tables load with filtering options

---

### Test Suite 5: Scheduling

#### Test 5.1: Advance Scheduling Limit

1. Log in as `free@test.purpleglow.co.za`
2. Try to schedule a post 8 days in advance
3. **Expected:** Blocked with "Free tier: 7-day limit"

4. Log in as `pro@test.purpleglow.co.za`
5. Try to schedule a post 31 days in advance
6. **Expected:** Blocked with "Pro tier: 30-day limit"

7. Log in as `business@test.purpleglow.co.za`
8. Schedule a post 60 days in advance
9. **Expected:** Scheduling succeeds

#### Test 5.2: Queue Size Display

1. Log in as any test user
2. Navigate to Schedule view
3. **Expected:** Shows "X/Y posts scheduled" based on tier

---

### Test Suite 6: Automation

#### Test 6.1: Automation Rule Creation

1. Log in as `pro@test.purpleglow.co.za`
2. Navigate to Automation
3. Try to create a 6th automation rule
4. **Expected:** Blocked with "Pro tier: 5 rules max"

5. Log in as `business@test.purpleglow.co.za`
6. Create multiple automation rules
7. **Expected:** No limit on rule creation

---

## ✅ Testing Checklist

### Before Release

- [ ] All 6 test accounts created successfully
- [ ] Free tier limits enforced correctly
- [ ] Pro tier limits enforced correctly
- [ ] Business tier has no artificial limits
- [ ] Credit deduction works on publish only
- [ ] Credit warnings appear at 20%
- [ ] Zero credits blocks publishing
- [ ] Scheduled posts skip when no credits
- [ ] Notifications system works
- [ ] Admin dashboard accessible to admin users
- [ ] Job monitor displays jobs correctly
- [ ] Error tracking shows errors

### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile Testing

- [ ] Mobile (320px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)

---

## 🔧 Troubleshooting

### Test Accounts Not Working

1. Verify DATABASE_URL is set correctly
2. Run `npm run db:push` to ensure schema is up to date
3. Re-run `npm run db:seed-test`
4. Check database directly for user records

### Login Fails

Better-auth may use different password hashing. If logins fail:
1. Delete the test user from database
2. Register manually through the app with the test credentials
3. Update tier/credits manually in database

### Connected Accounts Not Appearing

Connected accounts require real OAuth tokens. The seeded accounts have fake tokens and won't work for actual posting. They're for UI testing only.

### Scheduled Posts Not Processing

The scheduler (Inngest/Vercel Cron) must be running. For local testing:
1. Set up Inngest dev server: `npx inngest-cli dev`
2. Or use the manual trigger in admin dashboard

---

## 📊 Database Queries

### Check Test Account Status

```sql
-- List all test accounts
SELECT id, email, name, tier, credits, video_credits 
FROM "user" 
WHERE email LIKE '%@test.purpleglow.co.za';

-- Check connected accounts for a user
SELECT ca.* 
FROM connected_account ca
JOIN "user" u ON ca.user_id = u.id
WHERE u.email = 'pro@test.purpleglow.co.za';

-- Check scheduled posts
SELECT p.* 
FROM posts p
JOIN "user" u ON p.user_id = u.id
WHERE u.email = 'pro@test.purpleglow.co.za' 
AND p.status = 'scheduled';

-- Check notifications
SELECT n.* 
FROM notifications n
JOIN "user" u ON n.user_id = u.id
WHERE u.email = 'lowcredit@test.purpleglow.co.za';
```

---

## 🌍 South African Context Testing

All test accounts include SA-themed content:
- Posts use local slang: "howzit", "lekker", "sharp sharp"
- Hashtags include: #Mzansi, #LocalIsLekker, #SouthAfrica
- References to SA cities: Joburg, Cape Town, Durban
- All 11 languages should be testable in AI generation

---

## 📝 Notes

- Test account passwords are for development/testing only
- Fake OAuth tokens won't work for actual social media posting
- The seeding script is idempotent (safe to run multiple times)
- Test accounts are cleaned up before re-seeding

---

**Version:** Phase 7 Implementation  
**Last Updated:** 2025-12-02
