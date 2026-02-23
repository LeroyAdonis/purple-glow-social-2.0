/**
 * API Route: Create Subscription Checkout
 * 
 * POST /api/checkout/subscription
 * Creates a Polar checkout session for subscription purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { createSubscriptionCheckout } from '../../../../lib/polar/checkout-service';
import { db } from '../../../../drizzle/db';
import { user as userTable } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../../lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';
import { subscriptionCheckoutSchema } from '@/lib/security/validation';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await parseRequestBody(request);
    if (!body) {
      return invalidJsonResponse();
    }

    // Validate with Zod schema
    const validationResult = subscriptionCheckoutSchema.safeParse(body);
    if (!validationResult.success) {
      logger.polar.warn('Invalid subscription checkout request', {
        userId: session.user.id,
        errors: validationResult.error.format(),
      });
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { planId, billingCycle } = validationResult.data;

    // Get full user data from database
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create checkout session
    const checkout = await createSubscriptionCheckout({
      user,
      planId,
      billingCycle,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.checkoutId,
    });

  } catch (error) {
    logger.polar.exception(error, { action: 'create-subscription' });
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
