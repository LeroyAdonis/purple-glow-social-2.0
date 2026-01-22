import { NextRequest, NextResponse } from 'next/server';
import { getAllTransactions } from '@/lib/db/analytics';
import { requireAdmin, handleAuthError } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/transactions
 * Fetch all transactions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

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
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'fetch-transactions' });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
