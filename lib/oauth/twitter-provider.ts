import { OAuthProvider, TokenResponse, UserProfile, OAuthError } from './base-provider';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

export class TwitterProvider implements OAuthProvider {
  platform = 'twitter' as const;
  
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor() {
    this.clientId = process.env.TWITTER_CLIENT_ID!;
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    this.redirectUri = `${process.env.BETTER_AUTH_URL}/api/oauth/twitter/callback`;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET must be set');
    }
  }
  
  /**
   * Generate PKCE code verifier and challenge
   */
  private generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    
    return { verifier, challenge };
  }
  
  getAuthorizationUrl(state: string, codeVerifier?: string): string {
    // Generate PKCE challenge
    const verifier = codeVerifier || crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }
  
  async exchangeCodeForToken(code: string, codeVerifier?: string): Promise<TokenResponse> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const body = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier || 'challenge', // Should match the one from authorization
      });
      
      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new OAuthError(
          error.error_description || 'Failed to exchange code for token',
          error.error || 'token_exchange_failed',
          response.status
        );
      }
      
      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in, // Usually 2 hours
        scope: data.scope,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'twitter', action: 'token-exchange' });
      throw new OAuthError('Failed to exchange code for token', 'token_exchange_error');
    }
  }
  
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const body = new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      
      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      
      if (!response.ok) {
        throw new OAuthError('Failed to refresh token', 'token_refresh_failed');
      }
      
      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      throw new OAuthError('Failed to refresh access token', 'refresh_error');
    }
  }
  
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const response = await fetch(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new OAuthError('Failed to get user profile', 'profile_fetch_failed');
      }
      
      const { data } = await response.json();
      
      return {
        id: data.id,
        username: data.username,
        displayName: data.name,
        profileImageUrl: data.profile_image_url,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'twitter', action: 'get-profile' });
      throw new OAuthError('Failed to get user profile', 'profile_error');
    }
  }
  
  async revokeToken(accessToken: string): Promise<void> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const body = new URLSearchParams({
        token: accessToken,
        token_type_hint: 'access_token',
      });
      
      await fetch('https://api.twitter.com/2/oauth2/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
    } catch (error) {
      logger.oauth.exception(error, { platform: 'twitter', action: 'revoke-token' });
      // Don't throw - best effort
    }
  }
}
