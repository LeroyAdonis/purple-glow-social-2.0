import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllTransactions } from '@/lib/db/analytics';

/**
 * Check if user is admin (email-based for now)
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * GET /api/admin/transactions
 * Fetch all transactions (admin only)
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

    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'credit_purchase' | 'subscription' | 'refund' | null;
    const status = searchParams.get('status') as 'pending' | 'completed' | 'failed' | 'refunded' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactions = await getAllTransactions({
      type: type || undefined,
      status: status || undefined,
      limit,
      offset,
    });

    // Calculate totals for filtered results
    let totalAmount = 0;
    let completedCount = 0;

    for (const txn of transactions) {
      if (txn.status === 'completed') {
        totalAmount += txn.amount;
        completedCount++;
      }
    }

    return NextResponse.json({
      transactions,
      stats: {
        count: transactions.length,
        totalAmount: totalAmount / 100, // Convert from cents to rand
        completedCount,
      },
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Admin transactions fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
