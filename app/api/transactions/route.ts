/**
 * API Route: Transactions
 * 
 * GET /api/transactions
 * Returns transaction history for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { getUserTransactions } from '../../../lib/db/transactions';

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

    // Get transactions
    const transactions = await getUserTransactions(session.user.id);

    // Format transactions for frontend
    const formattedTransactions = transactions.map(txn => ({
      id: txn.id,
      type: txn.type,
      amount: txn.amount / 100, // Convert cents to ZAR
      currency: txn.currency,
      status: txn.status,
      credits: txn.credits,
      description: txn.description,
      date: txn.createdAt,
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
