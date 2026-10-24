import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { connectedAccounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/user/connected-accounts
 * Return the signed-in user's connected social accounts (safe fields only).
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

    const rows = await db
      .select({
        id: connectedAccounts.id,
        platform: connectedAccounts.platform,
        platformUsername: connectedAccounts.platformUsername,
        platformDisplayName: connectedAccounts.platformDisplayName,
        profileImageUrl: connectedAccounts.profileImageUrl,
        isActive: connectedAccounts.isActive,
        lastSyncedAt: connectedAccounts.lastSyncedAt,
        createdAt: connectedAccounts.createdAt,
      })
      .from(connectedAccounts)
      .where(eq(connectedAccounts.userId, session.user.id));

    const accounts = rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      platformUsername: row.platformUsername,
      platformDisplayName: row.platformDisplayName,
      profileImageUrl: row.profileImageUrl,
      isActive: row.isActive,
      connected: row.isActive,
      username: row.platformUsername,
      connectedAt: row.createdAt,
      lastSyncedAt: row.lastSyncedAt,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({
      accounts,
    });
  } catch (error) {
    logger.api.exception(error instanceof Error ? error : new Error(String(error)), {
      action: 'fetch-connected-accounts',
    });
    return NextResponse.json(
      { error: 'Failed to fetch connected accounts' },
      { status: 500 }
    );
  }
}