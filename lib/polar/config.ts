/**
 * Polar Payment Integration Configuration
 * 
 * This file contains all Polar-related configuration including:
 * - API credentials and environment settings
 * - Product ID mappings for credit packages and subscriptions
 * - Success/cancel URLs for checkout flows
 */

export const POLAR_CONFIG = {
  // API Configuration
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',
  organizationId: process.env.POLAR_ORGANIZATION_ID || '',
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
  
  // Base URL for callbacks
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};

/**
 * Credit Package Product IDs
 * These should match the products created in your Polar dashboard
 * 
 * To set up:
 * 1. Go to Polar dashboard > Products
 * 2. Create products with exact prices below
 * 3. Copy product IDs here
 */
export const CREDIT_PRODUCTS = {
  starter: {
    id: process.env.POLAR_PRODUCT_100_CREDITS || 'REPLACE_WITH_POLAR_PRODUCT_ID',
    name: '100 Credits',
    credits: 100,
    price: 15000, // R150 in cents
    currency: 'ZAR',
  },
  popular: {
    id: process.env.POLAR_PRODUCT_500_CREDITS || 'REPLACE_WITH_POLAR_PRODUCT_ID',
    name: '500 Credits',
    credits: 500,
    price: 60000, // R600 in cents
    currency: 'ZAR',
    savings: 15000, // R150 savings
  },
  bulk: {
    id: process.env.POLAR_PRODUCT_1000_CREDITS || 'REPLACE_WITH_POLAR_PRODUCT_ID',
    name: '1000 Credits',
    credits: 1000,
    price: 100000, // R1000 in cents
    currency: 'ZAR',
    savings: 50000, // R500 savings
  },
  video: {
    id: process.env.POLAR_PRODUCT_50_VIDEO_CREDITS || 'REPLACE_WITH_POLAR_PRODUCT_ID',
    name: '50 Video Credits',
    credits: 50,
    price: 10000, // R100 in cents
    currency: 'ZAR',
    badge: 'VIDEO',
  },
} as const;

/**
 * Subscription Product IDs
 * These should match the subscription products created in your Polar dashboard
 */
export const SUBSCRIPTION_PRODUCTS = {
  pro: {
    monthly: {
      id: process.env.POLAR_PRODUCT_PRO_MONTHLY || 'REPLACE_WITH_POLAR_PRODUCT_ID',
      name: 'Pro Plan - Monthly',
      planId: 'pro',
      price: 29900, // R299 in cents
      currency: 'ZAR',
      billingCycle: 'monthly' as const,
      credits: 500,
    },
    annual: {
      id: process.env.POLAR_PRODUCT_PRO_ANNUAL || 'REPLACE_WITH_POLAR_PRODUCT_ID',
      name: 'Pro Plan - Annual',
      planId: 'pro',
      price: 358800, // R3588 in cents (R299 * 12 * 0.8)
      currency: 'ZAR',
      billingCycle: 'annual' as const,
      credits: 500,
      savings: 71760, // 20% savings
    },
  },
  business: {
    monthly: {
      id: process.env.POLAR_PRODUCT_BUSINESS_MONTHLY || 'REPLACE_WITH_POLAR_PRODUCT_ID',
      name: 'Business Plan - Monthly',
      planId: 'business',
      price: 99900, // R999 in cents
      currency: 'ZAR',
      billingCycle: 'monthly' as const,
      credits: 2000,
    },
    annual: {
      id: process.env.POLAR_PRODUCT_BUSINESS_ANNUAL || 'REPLACE_WITH_POLAR_PRODUCT_ID',
      name: 'Business Plan - Annual',
      planId: 'business',
      price: 1198800, // R11988 in cents (R999 * 12 * 0.8)
      currency: 'ZAR',
      billingCycle: 'annual' as const,
      credits: 2000,
      savings: 239760, // 20% savings
    },
  },
} as const;

/**
 * Checkout URLs
 */
export const CHECKOUT_URLS = {
  success: `${POLAR_CONFIG.baseUrl}/api/checkout/success`,
  cancel: `${POLAR_CONFIG.baseUrl}/api/checkout/cancel`,
};

/**
 * Helper function to get credit product by package ID
 */
export function getCreditProduct(packageId: string) {
  const product = Object.entries(CREDIT_PRODUCTS).find(
    ([key]) => key === packageId
  );
  return product ? product[1] : null;
}

/**
 * Helper function to get subscription product by plan and billing cycle
 */
export function getSubscriptionProduct(planId: 'pro' | 'business', billingCycle: 'monthly' | 'annual') {
  return SUBSCRIPTION_PRODUCTS[planId][billingCycle];
}

/**
 * Validate Polar configuration
 */
export function validatePolarConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!POLAR_CONFIG.accessToken) {
    errors.push('POLAR_ACCESS_TOKEN is not set');
  }
  if (!POLAR_CONFIG.webhookSecret) {
    errors.push('POLAR_WEBHOOK_SECRET is not set');
  }
  if (!POLAR_CONFIG.organizationId) {
    errors.push('POLAR_ORGANIZATION_ID is not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
