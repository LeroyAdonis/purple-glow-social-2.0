/**
 * Polar Checkout Service
 * 
 * Handles creation and management of Polar checkout sessions
 */

import { polarClient } from './client';
import { getCreditProduct, getSubscriptionProduct, CHECKOUT_URLS } from './config';
import type { User } from '../../drizzle/schema';
import { logger } from '@/lib/logger';

export interface CreateCreditCheckoutParams {
  user: User;
  packageId: string;
}

export interface CreateSubscriptionCheckoutParams {
  user: User;
  planId: 'pro' | 'business';
  billingCycle: 'monthly' | 'annual';
}

/**
 * Create a checkout session for credit purchase
 */
export async function createCreditCheckout(params: CreateCreditCheckoutParams) {
  const { user, packageId } = params;
  
  const product = getCreditProduct(packageId);
  if (!product) {
    throw new Error(`Invalid package ID: ${packageId}`);
  }

  try {
    const checkout = await polarClient.checkouts.create({
      products: [product.id],
      successUrl: `${CHECKOUT_URLS.success}?type=credits&packageId=${packageId}`,
      customerEmail: user.email,
      customerName: user.name || undefined,
      customerId: user.polarCustomerId || undefined,
      metadata: {
        userId: user.id,
        packageId,
        credits: product.credits.toString(),
        type: 'credit_purchase',
      },
    });

    return {
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
      clientSecret: checkout.clientSecret,
    };
  } catch (error) {
    logger.polar.exception(error, { action: 'create-credit-checkout', packageId });
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createSubscriptionCheckout(params: CreateSubscriptionCheckoutParams) {
  const { user, planId, billingCycle } = params;
  
  const product = getSubscriptionProduct(planId, billingCycle);
  if (!product) {
    throw new Error(`Invalid plan: ${planId} - ${billingCycle}`);
  }

  try {
    const checkout = await polarClient.checkouts.create({
      products: [product.id],
      successUrl: `${CHECKOUT_URLS.success}?type=subscription&planId=${planId}&billingCycle=${billingCycle}`,
      customerEmail: user.email,
      customerName: user.name || undefined,
      customerId: user.polarCustomerId || undefined,
      metadata: {
        userId: user.id,
        planId,
        billingCycle,
        type: 'subscription',
      },
    });

    return {
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
      clientSecret: checkout.clientSecret,
    };
  } catch (error) {
    logger.polar.exception(error, { action: 'create-subscription-checkout', planId });
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Get checkout session details
 */
export async function getCheckout(checkoutId: string) {
  try {
    return await polarClient.checkouts.get({ id: checkoutId });
  } catch (error) {
    logger.polar.exception(error, { action: 'get-checkout', checkoutId });
    throw new Error('Failed to fetch checkout session');
  }
}
