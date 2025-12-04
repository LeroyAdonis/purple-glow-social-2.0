import { OAuthProvider, TokenResponse, UserProfile, OAuthError } from './base-provider';
import { logger } from '@/lib/logger';

export class InstagramProvider implements OAuthProvider {
  platform = 'instagram' as const;
  
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor() {
    this.clientId = process.env.META_APP_ID!;
    this.clientSecret = process.env.META_APP_SECRET!;
    this.redirectUri = `${process.env.BETTER_AUTH_URL}/api/oauth/instagram/callback`;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('META_APP_ID and META_APP_SECRET must be set');
    }
  }
  
  getAuthorizationUrl(state: string): string {
    // Default permissions that work in development mode
    // For production posting, you need App Review for:
    // - instagram_basic, instagram_content_publish
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'public_profile',
      response_type: 'code',
      state,
    });
    
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }
  
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      // Step 1: Exchange code for short-lived token
      const shortLivedResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${this.clientId}&` +
        `client_secret=${this.clientSecret}&` +
        `code=${code}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}`
      );
      
      if (!shortLivedResponse.ok) {
        const error = await shortLivedResponse.json();
        throw new OAuthError(
          error.error?.message || 'Failed to exchange code for token',
          error.error?.code || 'token_exchange_failed',
          shortLivedResponse.status
        );
      }
      
      const shortLivedData = await shortLivedResponse.json();
      
      // Step 2: Exchange short-lived for long-lived token
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${this.clientId}&` +
        `client_secret=${this.clientSecret}&` +
        `fb_exchange_token=${shortLivedData.access_token}`
      );
      
      if (!longLivedResponse.ok) {
        throw new OAuthError('Failed to get long-lived token', 'long_lived_token_failed');
      }
      
      const longLivedData = await longLivedResponse.json();
      
      return {
        accessToken: longLivedData.access_token,
        refreshToken: undefined, // Instagram doesn't use refresh tokens
        expiresIn: longLivedData.expires_in || 5184000, // 60 days default
        scope: 'instagram_basic,instagram_content_publish',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'instagram', action: 'token-exchange' });
      throw new OAuthError('Failed to exchange code for token', 'token_exchange_error');
    }
  }
  
  async refreshAccessToken(accessToken: string): Promise<TokenResponse> {
    // Instagram uses long-lived tokens that can be refreshed before expiry
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${this.clientId}&` +
        `client_secret=${this.clientSecret}&` +
        `fb_exchange_token=${accessToken}`
      );
      
      if (!response.ok) {
        throw new OAuthError('Failed to refresh token', 'token_refresh_failed');
      }
      
      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
        scope: 'instagram_basic,instagram_content_publish',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      throw new OAuthError('Failed to refresh access token', 'refresh_error');
    }
  }
  
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      // Get Facebook user ID first
      const meResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`
      );
      
      if (!meResponse.ok) {
        throw new OAuthError('Failed to get user profile', 'profile_fetch_failed');
      }
      
      const meData = await meResponse.json();
      
      // Try to get Instagram Business Account (may fail without proper permissions)
      try {
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${meData.id}/accounts?` +
          `fields=instagram_business_account&access_token=${accessToken}`
        );
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          const igAccountId = igData.data?.[0]?.instagram_business_account?.id;
          
          if (igAccountId) {
            // Get Instagram profile info
            const profileResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igAccountId}?` +
              `fields=id,username,name,profile_picture_url&access_token=${accessToken}`
            );
            
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              return {
                id: profile.id,
                username: profile.username,
                displayName: profile.name || profile.username,
                profileImageUrl: profile.profile_picture_url,
              };
            }
          }
        }
      } catch (e) {
        // Instagram Business Account not accessible, fall back to Facebook profile
        logger.oauth.debug('Instagram Business Account not accessible, using Facebook profile');
      }
      
      // Fall back to Facebook user profile
      return {
        id: meData.id,
        username: meData.name,
        displayName: meData.name,
        profileImageUrl: meData.picture?.data?.url,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'instagram', action: 'get-profile' });
      throw new OAuthError('Failed to get user profile', 'profile_error');
    }
  }
  
  async revokeToken(accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new OAuthError('Failed to revoke token', 'revoke_failed');
      }
    } catch (error) {
      logger.oauth.exception(error, { platform: 'instagram', action: 'revoke-token' });
      // Don't throw - token revocation is best effort
    }
  }
}
