import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { InstagramProvider } from '@/lib/oauth/instagram-provider';
import { countConnectionsByPlatform } from '@/lib/db/connected-accounts';
import { canConnect } from '@/lib/tiers/validation';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { TierName } from '@/lib/tiers/types';
import crypto from 'crypto';

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
    const connectionCheck = canConnect(userTier, currentConnections, 'instagram');

    if (!connectionCheck.allowed) {
      // Redirect to dashboard with error
      const errorUrl = new URL('/dashboard', request.url);
      errorUrl.searchParams.set('error', 'tier_limit');
      errorUrl.searchParams.set('message', connectionCheck.message || 'Connection limit reached');
      errorUrl.searchParams.set('platform', 'instagram');
      return NextResponse.redirect(errorUrl);
    }
    
    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Create Instagram provider
    const provider = new InstagramProvider();
    
    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(state);
    
    // Store state in session/cookie for verification in callback
    const response = NextResponse.redirect(authUrl);
    
    response.cookies.set('oauth_state', state, {
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
    console.error('Instagram connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Instagram connection' },
      { status: 500 }
    );
  }
}
