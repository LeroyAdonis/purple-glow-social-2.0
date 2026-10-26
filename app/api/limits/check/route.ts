import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import {
  automationRules,
  connectedAccounts,
  creditReservations,
  dailyUsage,
  posts,
  user,
} from '@/drizzle/schema';
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
 *
 * TWO SHAPES, ON PURPOSE (2026-10-26). Five callers read the flat fields (`credits` as a number,
 * `dailyGenerations`, `limits.*`). `components/usage-summary.tsx` reads a nested `usage` tree with a
 * `current`/`limit` pair per allowance. The route shipped flat only, so UsageSummary dereferenced
 * `limits.dailyPosts.total` on an object that never had `dailyPosts` and threw - which took the whole
 * `/dashboard` route to the error boundary for every signed-in user. Fixing the component alone would
 * have left the page showing zero usage; fixing the route alone would have broken the other five. So the
 * route now serves both, and every number in `usage` is a real query against this user's rows.
 */

/** pg returns SUM/COUNT as strings; never let a string into arithmetic the UI does. */
function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function status(current: number, limit: number) {
  const safeLimit = limit > 0 ? limit : 0;
  const percentage = safeLimit > 0 ? Math.min(100, Math.round((current / safeLimit) * 100)) : 0;
  return {
    current,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - current),
    percentage,
    isAtLimit: safeLimit > 0 ? current >= safeLimit : true,
  };
}

/** Today in SAST (UTC+2), because a daily limit that resets at midnight UTC resets at 02:00 for the user. */
function todayInSast(): string {
  const now = new Date();
  const sast = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return sast.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { id: true, tier: true, credits: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tier = (userRecord.tier ?? 'free') as TierName;
    const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
    const today = todayInSast();

    // Every figure below is this user's own rows. Nothing is estimated or defaulted to a nice-looking number.
    const [reservedRow, accountsByPlatform, queuedRow, todayRow, rulesRow] = await Promise.all([
      db
        .select({ reserved: sql`coalesce(sum(${creditReservations.credits}), 0)` })
        .from(creditReservations)
        .where(
          and(eq(creditReservations.userId, userId), eq(creditReservations.status, 'pending'))
        ),
      db
        .select({ platform: connectedAccounts.platform, n: sql`count(*)` })
        .from(connectedAccounts)
        .where(and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.isActive, true)))
        .groupBy(connectedAccounts.platform),
      db
        .select({ n: sql`count(*)` })
        .from(posts)
        .where(and(eq(posts.userId, userId), eq(posts.status, 'scheduled'))),
      db.query.dailyUsage.findFirst({
        where: and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)),
        columns: { generationsCount: true, postsCount: true },
      }),
      db
        .select({ n: sql`count(*)` })
        .from(automationRules)
        .where(and(eq(automationRules.userId, userId), eq(automationRules.isActive, true))),
    ]);

    const reserved = num(reservedRow[0]?.reserved);
    const available = num(userRecord.credits);
    const creditTotal = available + reserved;

    const accountsTotal = accountsByPlatform.reduce((sum, row) => sum + num(row.n), 0);
    const byPlatform: Record<string, ReturnType<typeof status>> = {
      facebook: status(0, limits.connectedAccountsPerPlatform),
      instagram: status(0, limits.connectedAccountsPerPlatform),
      twitter: status(0, limits.connectedAccountsPerPlatform),
      linkedin: status(0, limits.connectedAccountsPerPlatform),
    };
    for (const row of accountsByPlatform) {
      if (row.platform in byPlatform) {
        byPlatform[row.platform] = status(num(row.n), limits.connectedAccountsPerPlatform);
      }
    }

    const generationsUsed = num(todayRow?.generationsCount);
    const postsUsed = num(todayRow?.postsCount);
    const queueUsed = num(queuedRow[0]?.n);
    const rulesUsed = num(rulesRow[0]?.n);

    // The nested tree, spread at the TOP LEVEL on purpose.
    //
    // All five pre-existing callers read it from the root: `data.dailyGenerations.used`,
    // `limitsData.scheduling.queueSize`, `limitsData.automation.rules`,
    // `tierLimits.connectedAccounts.total.limit`, `data.credits.available`. An earlier version of this
    // route returned `credits` as a bare number and `dailyGenerations` as a bare number, so every one of
    // those reads was `undefined.something`. Three of them threw outright (schedule view, automation view,
    // connected accounts, plus usage-summary) and the dashboard's error boundary swallowed the whole page.
    // `usage` is kept as an alias so the shape can be renamed later without a second outage.
    const usage = {
      tier,
      credits: {
        total: creditTotal,
        reserved,
        available,
        percentage: creditTotal > 0 ? Math.round((available / creditTotal) * 100) : 0,
        isLow: creditTotal > 0 && available / creditTotal <= 0.2,
      },
      connectedAccounts: {
        total: status(accountsTotal, limits.totalConnectedAccounts),
        byPlatform,
      },
      scheduling: {
        queueSize: status(queueUsed, limits.queueSize),
        advanceSchedulingDays: limits.advanceSchedulingDays,
      },
      dailyGenerations: status(generationsUsed, limits.dailyGenerations),
      dailyPosts: {
        total: status(postsUsed, limits.dailyPostsPerPlatform),
        byPlatform: {},
      },
      automation: {
        enabled: limits.automationEnabled,
        rules: status(rulesUsed, limits.maxAutomationRules),
      },
    };

    return NextResponse.json({
      ...usage,
      usage,
      // The raw tier allowance config, unchanged, for anything that wants the published plan numbers.
      limits,
    });
  } catch (error) {
    logger.api.error('Failed to check limits', { error });
    return NextResponse.json({ error: 'Failed to check limits' }, { status: 500 });
  }
}
