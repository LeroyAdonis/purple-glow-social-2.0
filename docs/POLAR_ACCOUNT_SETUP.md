# Polar Account Setup - Step-by-Step Guide

This guide walks you through creating and configuring your Polar.sh account for Purple Glow Social 2.0.

---

## Part 1: Create Polar Sandbox Account

### Step 1: Sign Up for Polar Sandbox

1. Go to **https://sandbox.polar.sh**
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - Email address
   - GitHub account (recommended)
   - Google account

4. Verify your email if required

### Step 2: Create Your Organization

1. After login, you'll be prompted to create an organization
2. Fill in:
   - **Organization Name**: "Purple Glow Social" (or your company name)
   - **Organization Slug**: `purple-glow-social` (used in URLs)
   - **Description**: "South African social media automation platform"

3. Click **"Create Organization"**

4. **Copy your Organization ID**:
   - Go to Settings > General
   - Find "Organization ID" (looks like `org_xxxxxxxxx`)
   - Save this - you'll need it for environment variables

---

## Part 2: Generate API Credentials

### Step 3: Create Access Token

1. Navigate to **Settings > API** (or Developer Settings)
2. Click **"Create Access Token"** or **"Generate Token"**
3. Configure the token:
   - **Name**: "Purple Glow Social Production"
   - **Description**: "API token for payment processing"
   
4. **Select Scopes** (permissions):
   - ✅ `checkouts:read` - Read checkout sessions
   - ✅ `checkouts:write` - Create checkout sessions
   - ✅ `products:read` - Read product information
   - ✅ `customers:read` - Read customer data
   - ✅ `customers:write` - Create/update customers
   - ✅ `subscriptions:read` - Read subscriptions
   - ✅ `subscriptions:write` - Manage subscriptions
   - ✅ `orders:read` - Read order information

5. Click **"Generate Token"**

6. **⚠️ IMPORTANT**: Copy the token immediately!
   - Format: `polar_at_xxxxxxxxxxxxxxxxxxxxxxxxx`
   - **You won't be able to see it again**
   - Save it securely (password manager recommended)

### Step 4: Set Up Webhook

1. Navigate to **Settings > Webhooks**
2. Click **"Add Webhook"** or **"Create Webhook"**
3. Configure webhook:
   - **URL**: `http://localhost:3000/api/webhooks/polar` (for local testing)
   - **Description**: "Purple Glow Social Webhook Handler"
   
4. **Select Events** to listen to:
   - ✅ `order.created` - Order is created
   - ✅ `order.paid` - Payment completed
   - ✅ `order.refunded` - Refund processed
   - ✅ `subscription.created` - Subscription created
   - ✅ `subscription.active` - Subscription activated
   - ✅ `subscription.canceled` - Subscription canceled
   - ✅ `subscription.updated` - Subscription modified

5. Click **"Create Webhook"**

6. **Copy the Webhook Secret**:
   - Format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxx`
   - This is used to verify webhook authenticity
   - Save it securely

---

## Part 3: Create Products

### Product Creation Overview

You need to create **8 products**:
- 4 Credit Packages (one-time purchases)
- 4 Subscription Plans (recurring)

### Step 5: Create Credit Packages

#### Product 1: 100 Credits Starter Pack

1. Go to **Products** section
2. Click **"Create Product"** or **"New Product"**
3. Fill in details:
   - **Name**: `100 Credits`
   - **Description**: `100 credits for AI content generation. Perfect for trying out our service.`
   - **Type**: `One-time purchase`
   - **Price**: `150.00`
   - **Currency**: `ZAR` (South African Rand)
   - **Benefits** (optional):
     - 100 AI image generations
     - Instant delivery
     - No expiry

4. Click **"Create Product"**
5. **Copy the Product ID**: `prod_xxxxxxxxxxxxxxxxx`
6. Save it as `POLAR_PRODUCT_100_CREDITS`

#### Product 2: 500 Credits Popular Pack

Repeat the process with:
- **Name**: `500 Credits`
- **Description**: `500 credits - Best value for regular users. Save R150!`
- **Type**: `One-time purchase`
- **Price**: `600.00`
- **Currency**: `ZAR`

Copy Product ID → Save as `POLAR_PRODUCT_500_CREDITS`

#### Product 3: 1000 Credits Bulk Pack

- **Name**: `1000 Credits`
- **Description**: `1000 credits for power users. Save R500!`
- **Type**: `One-time purchase`
- **Price**: `1000.00`
- **Currency**: `ZAR`

Copy Product ID → Save as `POLAR_PRODUCT_1000_CREDITS`

#### Product 4: 50 Video Credits Pack

- **Name**: `50 Video Credits`
- **Description**: `50 video generation credits for Veo 2 AI video creation.`
- **Type**: `One-time purchase`
- **Price**: `100.00`
- **Currency**: `ZAR`

Copy Product ID → Save as `POLAR_PRODUCT_50_VIDEO_CREDITS`

### Step 6: Create Subscription Products

#### Product 5: Pro Plan - Monthly

1. Click **"Create Product"**
2. Fill in details:
   - **Name**: `Pro Plan - Monthly`
   - **Description**: `500 credits per month + pro features. Perfect for small businesses.`
   - **Type**: `Subscription`
   - **Billing Interval**: `Monthly`
   - **Price**: `299.00`
   - **Currency**: `ZAR`
   - **Benefits**:
     - 500 credits per month
     - Priority support
     - Advanced analytics
     - Multi-platform posting

3. Click **"Create Product"**
4. Copy Product ID → Save as `POLAR_PRODUCT_PRO_MONTHLY`

#### Product 6: Pro Plan - Annual

- **Name**: `Pro Plan - Annual`
- **Description**: `500 credits per month + pro features. Save 20% with annual billing!`
- **Type**: `Subscription`
- **Billing Interval**: `Annual`
- **Price**: `3588.00` (R299 × 12 × 0.8 = 20% discount)
- **Currency**: `ZAR`

Copy Product ID → Save as `POLAR_PRODUCT_PRO_ANNUAL`

#### Product 7: Business Plan - Monthly

- **Name**: `Business Plan - Monthly`
- **Description**: `2000 credits per month + business features. For growing businesses.`
- **Type**: `Subscription`
- **Billing Interval**: `Monthly`
- **Price**: `999.00`
- **Currency**: `ZAR`
- **Benefits**:
  - 2000 credits per month
  - Priority support
  - Team management
  - API access
  - White-label options

Copy Product ID → Save as `POLAR_PRODUCT_BUSINESS_MONTHLY`

#### Product 8: Business Plan - Annual

- **Name**: `Business Plan - Annual`
- **Description**: `2000 credits per month + business features. Save 20% with annual billing!`
- **Type**: `Subscription`
- **Billing Interval**: `Annual`
- **Price**: `11988.00` (R999 × 12 × 0.8)
- **Currency**: `ZAR`

Copy Product ID → Save as `POLAR_PRODUCT_BUSINESS_ANNUAL`

---

## Part 4: Configure Environment Variables

### Step 7: Update Your .env File

Create or update your `.env` file with all the credentials:

```bash
# Polar Configuration
POLAR_ACCESS_TOKEN=polar_at_your_actual_token_here
POLAR_WEBHOOK_SECRET=whsec_your_actual_secret_here
POLAR_ORGANIZATION_ID=org_your_actual_org_id_here
POLAR_SERVER=sandbox

# Base URL (change for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Product IDs - Credit Packages
POLAR_PRODUCT_100_CREDITS=prod_your_actual_product_id_here
POLAR_PRODUCT_500_CREDITS=prod_your_actual_product_id_here
POLAR_PRODUCT_1000_CREDITS=prod_your_actual_product_id_here
POLAR_PRODUCT_50_VIDEO_CREDITS=prod_your_actual_product_id_here

# Product IDs - Subscriptions
POLAR_PRODUCT_PRO_MONTHLY=prod_your_actual_product_id_here
POLAR_PRODUCT_PRO_ANNUAL=prod_your_actual_product_id_here
POLAR_PRODUCT_BUSINESS_MONTHLY=prod_your_actual_product_id_here
POLAR_PRODUCT_BUSINESS_ANNUAL=prod_your_actual_product_id_here
```

### Step 8: Restart Your Application

```bash
# Stop your dev server (Ctrl+C)
# Restart it
npm run dev
```

---

## Part 5: Test Webhook Connectivity

### Step 9: Test Webhook Locally (Using ngrok)

Since Polar webhooks need a public URL, you'll need to expose your local server:

#### Option A: Using ngrok (Recommended)

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm
   npm install -g ngrok
   ```

2. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (looks like `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

4. **Update Polar Webhook URL**:
   - Go to Polar Dashboard > Settings > Webhooks
   - Edit your webhook
   - Change URL to: `https://your-ngrok-url.ngrok-free.app/api/webhooks/polar`
   - Save

#### Option B: Using Polar CLI (Alternative)

```bash
# Install Polar CLI
npm install -g @polar-sh/cli

# Forward webhooks to localhost
polar webhooks forward http://localhost:3000/api/webhooks/polar
```

---

## Part 6: Production Setup

### Step 10: Repeat for Production

When ready for production:

1. **Create Production Account**: https://polar.sh (not sandbox)
2. **Create same 8 products** with production URLs
3. **Generate new API token** and webhook secret
4. **Update environment variables**:
   - Change `POLAR_SERVER=production`
   - Update `NEXT_PUBLIC_BASE_URL` to your production domain
   - Update webhook URL to production domain

---

## Checklist

Use this checklist to track your progress:

### Sandbox Setup
- [ ] Created Polar sandbox account
- [ ] Created organization
- [ ] Copied organization ID
- [ ] Generated API access token
- [ ] Created webhook endpoint
- [ ] Copied webhook secret
- [ ] Created 100 Credits product
- [ ] Created 500 Credits product
- [ ] Created 1000 Credits product
- [ ] Created 50 Video Credits product
- [ ] Created Pro Monthly subscription
- [ ] Created Pro Annual subscription
- [ ] Created Business Monthly subscription
- [ ] Created Business Annual subscription
- [ ] Updated .env file with all credentials
- [ ] Restarted application
- [ ] Set up ngrok or webhook forwarding
- [ ] Updated webhook URL in Polar dashboard

### Production Setup (Later)
- [ ] Created Polar production account
- [ ] Created production organization
- [ ] Generated production API token
- [ ] Created production webhook
- [ ] Created all 8 products in production
- [ ] Updated production environment variables
- [ ] Configured production webhook URL
- [ ] Tested end-to-end in production

---

## Troubleshooting

### Can't find Organization ID
- Go to Settings > General in Polar dashboard
- Look for "Organization Details" section
- ID format: `org_xxxxxxxxx`

### Can't find Product IDs
- Go to Products in Polar dashboard
- Click on a product
- Product ID is in the URL or product details
- Format: `prod_xxxxxxxxx`

### Webhook not receiving events
- Check webhook URL is correct and accessible
- Verify webhook secret matches
- Check application logs for errors
- Test webhook with Polar's "Send Test Event" button

### Products showing wrong currency
- Ensure you selected `ZAR` when creating products
- Contact Polar support if ZAR is not available
- Consider using USD as alternative (update prices accordingly)

---

## Support

- **Polar Documentation**: https://polar.sh/docs
- **Polar Discord**: https://discord.gg/polar
- **Email Support**: support@polar.sh

---

**Next**: After completing this setup, proceed to the Testing Guide to verify everything works!
