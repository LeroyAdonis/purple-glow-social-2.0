import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TwitterProvider } from '@/lib/oauth/twitter-provider';
import { countConnectionsByPlatform } from '@/lib/db/connected-accounts';
import { canConnect } from '@/lib/tiers/validation';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { TierName } from '@/lib/tiers/types';
import { createOAuthState } from '@/lib/oauth/state-manager';
import { rateLimiters } from '@/lib/security/rate-limit';
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

    // Apply rate limiting (5 OAuth connections per minute for security)
    const rateLimitResult = await rateLimiters.oauth.limit(`oauth-connect:${session.user.id}`);
    if (!rateLimitResult.success) {
      const resetTime = Math.ceil(((rateLimitResult as any).reset - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `Too many connection attempts. Try again in ${resetTime} seconds.`,
          retryAfter: resetTime,
        },
        { status: 429 }
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
    const connectionCheck = canConnect(userTier, currentConnections, 'twitter');

    if (!connectionCheck.allowed) {
      // Redirect to dashboard with error
      const errorUrl = new URL('/dashboard', request.url);
      errorUrl.searchParams.set('error', 'tier_limit');
      errorUrl.searchParams.set('message', connectionCheck.message || 'Connection limit reached');
      errorUrl.searchParams.set('platform', 'twitter');
      return NextResponse.redirect(errorUrl);
    }
    
    // Generate state with PKCE using state manager (stores verifier in DB)
    const oauthState = await createOAuthState('twitter', '/dashboard/settings');
    
    // Create Twitter provider
    const provider = new TwitterProvider();
    
    // Get authorization URL with PKCE challenge
    const authUrl = provider.getAuthorizationUrl(oauthState.state, oauthState.pkce.codeVerifier);
    
    // Store state and user ID in cookies for verification in callback
    // Note: PKCE verifier is now stored securely in database, not in cookies
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
    logger.oauth.error('Twitter connect failed', { error });
    return NextResponse.json(
      { error: 'Failed to initiate Twitter connection' },
      { status: 500 }
    );
  }
}
