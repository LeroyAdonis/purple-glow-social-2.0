/**
 * API Route: Checkout Cancel
 * 
 * GET /api/checkout/cancel
 * Handles cancelled checkout and redirects to dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '../../../../lib/config/urls';

export async function GET(request: NextRequest) {
  // Build redirect URL with cancel parameters
  const baseUrl = getBaseUrl();
  const redirectUrl = new URL('/dashboard', baseUrl);
  
  redirectUrl.searchParams.set('payment_canceled', 'true');

  return NextResponse.redirect(redirectUrl.toString());
}
