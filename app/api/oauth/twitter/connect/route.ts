import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TwitterProvider } from '@/lib/oauth/twitter-provider';
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
    
    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Generate PKCE code verifier
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    
    // Create Twitter provider
    const provider = new TwitterProvider();
    
    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(state, codeVerifier);
    
    // Store state and code verifier in cookies for verification in callback
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
    
    response.cookies.set('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });
    
    return response;
  } catch (error) {
    console.error('Twitter connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter connection' },
      { status: 500 }
    );
  }
}
