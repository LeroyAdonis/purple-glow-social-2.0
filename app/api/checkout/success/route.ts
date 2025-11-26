/**
 * API Route: Checkout Success
 * 
 * GET /api/checkout/success
 * Handles successful checkout completion and redirects to dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const packageId = searchParams.get('packageId');
  const planId = searchParams.get('planId');
  const billingCycle = searchParams.get('billingCycle');

  // Build redirect URL with success parameters
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUrl = new URL('/dashboard', baseUrl);
  
  redirectUrl.searchParams.set('payment_success', 'true');
  redirectUrl.searchParams.set('payment_type', type || 'unknown');
  
  if (type === 'credits' && packageId) {
    redirectUrl.searchParams.set('package_id', packageId);
  } else if (type === 'subscription' && planId && billingCycle) {
    redirectUrl.searchParams.set('plan_id', planId);
    redirectUrl.searchParams.set('billing_cycle', billingCycle);
  }

  return NextResponse.redirect(redirectUrl.toString());
}
