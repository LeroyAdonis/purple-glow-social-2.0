import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { logger } from '@/lib/logger';
import { TIER_LIMITS } from '@/lib/tiers/config';
import type { TierName } from '@/lib/tiers/types';

/**
 * GET /api/limits/check
 *
 * This route did not exist, and six components were already calling it - the content generator, the AI
 * studio, schedule view, automation view and the connected-accounts screen all fetch it on mount. Every one
 * of those fetches got a 404, caught it, and carried on quietly. That means the UI had no idea what the
 * signed-in user's plan actually allowed, which is exactly the kind of silence that looks like it works
 * until a free user posts more than a free user should.
 *
 * Returns the caller's real tier and credit balance plus that tier's allowances. Unauthenticated callers get
 * 401 rather than a default set of limits, because handing out limits without a session would tell anyone
 * what paid plans include and, worse, invite the UI to trust numbers that belong to nobody.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { id: true, tier: true, credits: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tier = (userRecord.tier ?? 'free') as TierName;
    const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

    return NextResponse.json({
      tier,
      // The three fields the existing callers read.
      credits: userRecord.credits,
      dailyGenerations: limits.dailyGenerations,
      // The full allowance set, so components can check queue size and automation rules without inventing
      // their own numbers.
      limits,
    });
  } catch (error) {
    logger.api.error('Failed to check limits', { error });
    return NextResponse.json({ error: 'Failed to check limits' }, { status: 500 });
  }
}
