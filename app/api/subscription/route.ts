/**
 * API Route: Subscription
 * 
 * GET /api/subscription - Get active subscription
 * DELETE /api/subscription - Cancel subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { getUserActiveSubscription, cancelSubscription } from '../../../lib/db/subscriptions';
import { polarClient } from '../../../lib/polar/client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active subscription
    const subscription = await getUserActiveSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    // Format subscription for frontend
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        billingCycle: subscription.billingCycle,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active subscription
    const subscription = await getUserActiveSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription in Polar (revoke = immediate cancel)
    await polarClient.subscriptions.revoke({
      id: subscription.polarSubscriptionId,
    });

    // Update local subscription record
    await cancelSubscription(subscription.id, true);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
