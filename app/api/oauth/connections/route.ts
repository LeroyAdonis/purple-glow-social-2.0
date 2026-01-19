import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnectedAccounts } from '@/lib/db/connected-accounts';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all connected accounts for the user
    const connections = await getConnectedAccounts(session.user.id);
    
    // Return connections without exposing encrypted tokens
    const safeConnections = connections.map(conn => ({
      id: conn.id,
      platform: conn.platform,
      platformUsername: conn.platformUsername,
      platformDisplayName: conn.platformDisplayName,
      profileImageUrl: conn.profileImageUrl,
      isActive: conn.isActive,
      lastSyncedAt: conn.lastSyncedAt,
      tokenExpiresAt: conn.tokenExpiresAt,
      createdAt: conn.createdAt,
    }));
    
    return NextResponse.json({
      connections: safeConnections
    });
  } catch (error) {
    logger.oauth.error('Failed to fetch connections', { error });
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
