import { NextRequest, NextResponse } from 'next/server';
import { FacebookProvider } from '@/lib/oauth/facebook-provider';
import { OAuthError } from '@/lib/oauth/base-provider';
import { encryptToken } from '@/lib/crypto/token-encryption';
import { db } from '@/drizzle/db';
import { connectedAccounts } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Check for OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/oauth/callback/error?error=${error}`, request.url)
    );
  }
  
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/oauth/callback/error?error=missing_parameters', request.url)
    );
  }
  
  // Verify state (CSRF protection)
  const storedState = request.cookies.get('oauth_state')?.value;
  const userId = request.cookies.get('oauth_user_id')?.value;
  
  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(
      new URL('/oauth/callback/error?error=invalid_state', request.url)
    );
  }
  
  try {
    const provider = new FacebookProvider();
    
    // Exchange code for token
    const tokenResponse = await provider.exchangeCodeForToken(code);
    
    // Get user profile
    const profile = await provider.getUserProfile(tokenResponse.accessToken);
    
    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + tokenResponse.expiresIn * 1000);
    
    // Encrypt tokens
    const encryptedAccessToken = encryptToken(tokenResponse.accessToken);
    const encryptedRefreshToken = tokenResponse.refreshToken 
      ? encryptToken(tokenResponse.refreshToken)
      : null;
    
    // Check if connection already exists
    const existing = await db
      .select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          eq(connectedAccounts.platform, 'facebook')
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing connection
      await db
        .update(connectedAccounts)
        .set({
          platformUserId: profile.id,
          platformUsername: profile.username,
          platformDisplayName: profile.displayName,
          profileImageUrl: profile.profileImageUrl,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt,
          scope: tokenResponse.scope,
          isActive: true,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(connectedAccounts.id, existing[0].id));
    } else {
      // Create new connection
      await db.insert(connectedAccounts).values({
        id: nanoid(),
        userId,
        platform: 'facebook',
        platformUserId: profile.id,
        platformUsername: profile.username,
        platformDisplayName: profile.displayName,
        profileImageUrl: profile.profileImageUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt,
        scope: tokenResponse.scope,
        isActive: true,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Clear state cookies
    const response = NextResponse.redirect(
      new URL('/oauth/callback/success?platform=facebook', request.url)
    );
    
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_user_id');
    
    return response;
  } catch (error) {
    console.error('Facebook callback error:', error);
    
    const errorMessage = error instanceof OAuthError 
      ? error.message 
      : 'Failed to connect Facebook account';
    
    return NextResponse.redirect(
      new URL(`/oauth/callback/error?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
