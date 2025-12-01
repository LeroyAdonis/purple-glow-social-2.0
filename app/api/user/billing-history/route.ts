import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserBillingHistory } from '@/lib/db/analytics';

/**
 * GET /api/user/billing-history
 * Fetch current user's billing history (invoices)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    const invoices = await getUserBillingHistory(session.user.id, limit);

    return NextResponse.json({
      invoices,
    });
  } catch (error: any) {
    console.error('Billing history fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}
