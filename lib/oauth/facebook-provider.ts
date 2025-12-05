import { OAuthProvider, TokenResponse, UserProfile, OAuthError } from './base-provider';
import { logger } from '@/lib/logger';

export class FacebookProvider implements OAuthProvider {
  platform = 'facebook' as const;
  
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor() {
    this.clientId = process.env.META_APP_ID!;
    this.clientSecret = process.env.META_APP_SECRET!;
    this.redirectUri = `${process.env.BETTER_AUTH_URL}/api/oauth/facebook/callback`;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('META_APP_ID and META_APP_SECRET must be set');
    }
  }
  
  getAuthorizationUrl(state: string): string {
    // Request Page permissions for posting to Facebook Pages
    // NOTE: These permissions must be added to your Meta App first:
    // 1. Go to developers.facebook.com > Your App > App Review > Permissions and Features
    // 2. Add: pages_show_list, pages_read_engagement, pages_manage_posts
    // 3. For development, add yourself as a Tester in App Roles
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'public_profile,email',
      response_type: 'code',
      state,
    });
    
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }
  
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      // Step 1: Exchange code for short-lived user token
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
      
      // Step 2: Exchange short-lived for long-lived user token
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
      const userAccessToken = longLivedData.access_token;
      
      // Step 3: Get user's Pages and their Page Access Tokens
      // Page tokens derived from long-lived user tokens are also long-lived (never expire)
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
      );
      
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data && pagesData.data.length > 0) {
          // Use the first page's access token (this is a Page Access Token)
          const primaryPage = pagesData.data[0];
          logger.oauth.info('Using Page Access Token for Facebook', { 
            pageId: primaryPage.id, 
            pageName: primaryPage.name 
          });
          
          return {
            accessToken: primaryPage.access_token, // Page Access Token (never expires)
            refreshToken: undefined,
            expiresIn: 5184000, // 60 days, but Page tokens from long-lived user tokens don't expire
            scope: 'pages_manage_posts,pages_read_engagement',
          };
        }
      }
      
      // Fallback to user token if no pages available
      logger.oauth.warn('No Facebook Pages found, using user access token');
      return {
        accessToken: userAccessToken,
        refreshToken: undefined,
        expiresIn: longLivedData.expires_in || 5184000,
        scope: 'pages_manage_posts,pages_read_engagement',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'facebook', action: 'token-exchange' });
      throw new OAuthError('Failed to exchange code for token', 'token_exchange_error');
    }
  }
  
  async refreshAccessToken(accessToken: string): Promise<TokenResponse> {
    // Facebook uses long-lived tokens that can be refreshed before expiry
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
        scope: 'pages_manage_posts,pages_read_engagement',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      throw new OAuthError('Failed to refresh access token', 'refresh_error');
    }
  }
  
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      // Get Facebook user profile
      const meResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`
      );
      
      if (!meResponse.ok) {
        throw new OAuthError('Failed to get user profile', 'profile_fetch_failed');
      }
      
      const profile = await meResponse.json();
      
      // Try to get user's Facebook Pages (may fail without pages_show_list permission)
      try {
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/${profile.id}/accounts?access_token=${accessToken}`
        );
        
        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          
          if (pagesData.data && pagesData.data.length > 0) {
            // Use the first page as the primary connection
            const primaryPage = pagesData.data[0];
            return {
              id: primaryPage.id,
              username: primaryPage.name,
              displayName: primaryPage.name,
              profileImageUrl: profile.picture?.data?.url,
            };
          }
        }
      } catch (e) {
        // Pages permission not available, fall back to user profile
        logger.oauth.debug('Pages not accessible, using user profile instead');
      }
      
      // Fall back to user profile if no pages accessible
      return {
        id: profile.id,
        username: profile.name,
        displayName: profile.name,
        profileImageUrl: profile.picture?.data?.url,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'facebook', action: 'get-profile' });
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
      logger.oauth.exception(error, { platform: 'facebook', action: 'revoke-token' });
      // Don't throw - token revocation is best effort
    }
  }
}
