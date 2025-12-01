import { OAuthProvider, TokenResponse, UserProfile, OAuthError } from './base-provider';

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
    // Default permissions that work in development mode
    // For production posting, you need App Review for:
    // - pages_manage_posts (to post to Facebook Pages)
    // - instagram_content_publish (to post to Instagram)
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
        refreshToken: undefined, // Facebook doesn't use refresh tokens for long-lived tokens
        expiresIn: longLivedData.expires_in || 5184000, // 60 days default
        scope: 'pages_manage_posts,pages_read_engagement',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      console.error('Facebook token exchange error:', error);
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
      
      // Get user's Facebook Pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/${profile.id}/accounts?access_token=${accessToken}`
      );
      
      if (!pagesResponse.ok) {
        throw new OAuthError('Failed to get Facebook pages', 'pages_fetch_failed');
      }
      
      const pagesData = await pagesResponse.json();
      
      if (!pagesData.data || pagesData.data.length === 0) {
        throw new OAuthError(
          'No Facebook Pages found. You need to have at least one Facebook Page to post content.',
          'no_facebook_pages',
          400
        );
      }
      
      // Use the first page as the primary connection
      const primaryPage = pagesData.data[0];
      
      return {
        id: primaryPage.id,
        username: primaryPage.name,
        displayName: primaryPage.name,
        profileImageUrl: profile.picture?.data?.url,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      console.error('Facebook profile fetch error:', error);
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
      console.error('Facebook token revocation error:', error);
      // Don't throw - token revocation is best effort
    }
  }
}
