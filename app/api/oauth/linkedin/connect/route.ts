import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { LinkedInProvider } from '@/lib/oauth/linkedin-provider';
import { createOAuthState } from '@/lib/oauth/state-manager';
import { countConnectionsByPlatform } from '@/lib/db/connected-accounts';
import { canConnect } from '@/lib/tiers/validation';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { TierName } from '@/lib/tiers/types';

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

    // Get user tier
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check tier limits before allowing connection
    const userTier = (userRecord.tier || 'free') as TierName;
    const currentConnections = await countConnectionsByPlatform(session.user.id);
    const connectionCheck = canConnect(userTier, currentConnections, 'linkedin');

    if (!connectionCheck.allowed) {
      const errorUrl = new URL('/dashboard', request.url);
      errorUrl.searchParams.set('error', 'tier_limit');
      errorUrl.searchParams.set('message', connectionCheck.message || 'Connection limit reached');
      errorUrl.searchParams.set('platform', 'linkedin');
      return NextResponse.redirect(errorUrl);
    }
    
    // Create LinkedIn provider
    const provider = new LinkedInProvider();
    
    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: 'LinkedIn integration is not configured' },
        { status: 503 }
      );
    }
    
    // Generate state with PKCE using state manager
    const oauthState = createOAuthState('linkedin', '/dashboard/settings');
    
    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(oauthState.state);
    
    // Store state and user info in cookies
    const response = NextResponse.redirect(authUrl);
    
    response.cookies.set('oauth_state', oauthState.state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
    
    response.cookies.set('oauth_user_id', session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });
    
    return response;
  } catch (error) {
    console.error('LinkedIn connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn connection' },
      { status: 500 }
    );
  }
}
