import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCreditBalance } from '@/lib/db/credit-ledger';
import { centsToCredits, formatZar } from '@/lib/credits/ledger';
import { logger } from '@/lib/logger';

/**
 * GET /api/user/credits
 * Return the signed-in user's credit balance.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // The balance is the ledger SUM in cents. `credits` stays as the derived whole-credit count because
    // every existing screen reads it; the money value is `balanceCents` / `display`.
    const balanceCents = await getCreditBalance(session.user.id);

    return NextResponse.json({
      credits: centsToCredits(balanceCents),
      balanceCents,
      display: formatZar(balanceCents),
    });
  } catch (error) {
    logger.api.exception(error instanceof Error ? error : new Error(String(error)), {
      action: 'fetch-credits',
    });
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}