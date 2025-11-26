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
    const body = await request.json();
    const { planId, billingCycle } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Plan ID and billing cycle are required' },
        { status: 400 }
      );
    }

    if (!['pro', 'business'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    if (!['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

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
      planId: planId as 'pro' | 'business',
      billingCycle: billingCycle as 'monthly' | 'annual',
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.checkoutId,
    });

  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
