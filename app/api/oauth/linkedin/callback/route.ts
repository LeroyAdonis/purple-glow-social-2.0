import { NextRequest, NextResponse } from 'next/server';
import { LinkedInProvider } from '@/lib/oauth/linkedin-provider';
import { validateAndConsumeState } from '@/lib/oauth/state-manager';
import { saveConnectedAccount } from '@/lib/db/connected-accounts';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Get stored state and user ID from cookies
    const storedState = request.cookies.get('oauth_state')?.value;
    const userId = request.cookies.get('oauth_user_id')?.value;
    
    // Clear the cookies
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
    };
    
    // Handle OAuth errors
    if (error) {
      logger.oauth.error('LinkedIn OAuth error', { error, errorDescription });
      const errorUrl = new URL('/dashboard/settings', request.url);
      errorUrl.searchParams.set('error', 'oauth_denied');
      errorUrl.searchParams.set('platform', 'linkedin');
      errorUrl.searchParams.set('message', errorDescription || 'LinkedIn authorization was denied');
      
      const response = NextResponse.redirect(errorUrl);
      response.cookies.set('oauth_state', '', clearCookieOptions);
      response.cookies.set('oauth_user_id', '', clearCookieOptions);
      return response;
    }
    
    // Validate required parameters
    if (!code || !state) {
      const errorUrl = new URL('/dashboard/settings', request.url);
      errorUrl.searchParams.set('error', 'invalid_request');
      errorUrl.searchParams.set('platform', 'linkedin');
      return NextResponse.redirect(errorUrl);
    }
    
    // Validate state to prevent CSRF
    if (!storedState || state !== storedState) {
      logger.oauth.error('LinkedIn state mismatch', { received: state, stored: storedState });
      const errorUrl = new URL('/dashboard/settings', request.url);
      errorUrl.searchParams.set('error', 'state_mismatch');
      errorUrl.searchParams.set('platform', 'linkedin');
      
      const response = NextResponse.redirect(errorUrl);
      response.cookies.set('oauth_state', '', clearCookieOptions);
      response.cookies.set('oauth_user_id', '', clearCookieOptions);
      return response;
    }
    
    // Also validate via state manager (if stored there)
    const oauthState = validateAndConsumeState(state, 'linkedin');
    
    if (!userId) {
      const errorUrl = new URL('/dashboard/settings', request.url);
      errorUrl.searchParams.set('error', 'session_expired');
      errorUrl.searchParams.set('platform', 'linkedin');
      return NextResponse.redirect(errorUrl);
    }
    
    // Exchange code for token
    const provider = new LinkedInProvider();
    const tokenResponse = await provider.exchangeCodeForToken(code);
    
    // Get user profile
    const profile = await provider.getUserProfile(tokenResponse.accessToken);
    
    // Calculate token expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenResponse.expiresIn);
    
    // Save the connected account
    await saveConnectedAccount(userId, {
      platform: 'linkedin',
      platformUserId: profile.id,
      platformUsername: profile.username,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      tokenExpiresAt: expiresAt,
      profileImageUrl: profile.profileImageUrl,
    });
    
    logger.oauth.info('LinkedIn account connected', { 
      userId, 
      platformUserId: profile.id,
      username: profile.username 
    });
    
    // Redirect to settings with success
    const successUrl = new URL('/dashboard/settings', request.url);
    successUrl.searchParams.set('success', 'connected');
    successUrl.searchParams.set('platform', 'linkedin');
    
    const response = NextResponse.redirect(successUrl);
    response.cookies.set('oauth_state', '', clearCookieOptions);
    response.cookies.set('oauth_user_id', '', clearCookieOptions);
    
    return response;
  } catch (error) {
    logger.oauth.exception(error, { platform: 'linkedin', action: 'callback' });
    
    const errorUrl = new URL('/dashboard/settings', request.url);
    errorUrl.searchParams.set('error', 'connection_failed');
    errorUrl.searchParams.set('platform', 'linkedin');
    errorUrl.searchParams.set('message', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.redirect(errorUrl);
  }
}
