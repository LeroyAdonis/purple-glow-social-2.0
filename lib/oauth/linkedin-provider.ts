/**
 * LinkedIn OAuth Provider
 * Implements LinkedIn OAuth 2.0 for Share API access
 * 
 * Reference: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
 */

import { OAuthProvider, TokenResponse, UserProfile, OAuthError } from './base-provider';
import { logger } from '@/lib/logger';

export class LinkedInProvider implements OAuthProvider {
  platform = 'linkedin' as const;
  
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.BETTER_AUTH_URL}/api/oauth/linkedin/callback`;
    
    if (!this.clientId || !this.clientSecret) {
      logger.oauth.warn('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET not set');
    }
  }
  
  /**
   * Check if LinkedIn credentials are configured
   */
  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }
  
  /**
   * Get LinkedIn authorization URL
   * Scopes:
   * - openid: Required for OpenID Connect
   * - profile: Access to name and profile picture
   * - w_member_social: Permission to post on behalf of user
   */
  getAuthorizationUrl(state: string): string {
    if (!this.isConfigured()) {
      throw new OAuthError('LinkedIn credentials not configured', 'not_configured', 500);
    }
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: 'openid profile w_member_social',
    });
    
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }
  
  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    if (!this.isConfigured()) {
      throw new OAuthError('LinkedIn credentials not configured', 'not_configured', 500);
    }
    
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      });
      
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
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
        expiresIn: data.expires_in || 5184000, // 60 days default
        scope: data.scope || 'openid profile w_member_social',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'linkedin', action: 'token-exchange' });
      throw new OAuthError('Failed to exchange code for token', 'token_exchange_error');
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    if (!this.isConfigured()) {
      throw new OAuthError('LinkedIn credentials not configured', 'not_configured', 500);
    }
    
    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });
      
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new OAuthError(
          error.error_description || 'Failed to refresh token',
          error.error || 'token_refresh_failed',
          response.status
        );
      }
      
      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in || 5184000,
        scope: data.scope || 'openid profile w_member_social',
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'linkedin', action: 'token-refresh' });
      throw new OAuthError('Failed to refresh access token', 'refresh_error');
    }
  }
  
  /**
   * Get user profile from LinkedIn
   * Uses the /userinfo endpoint (OpenID Connect)
   */
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      // Get basic profile info via OpenID Connect userinfo
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!profileResponse.ok) {
        throw new OAuthError('Failed to get user profile', 'profile_fetch_failed');
      }
      
      const profile = await profileResponse.json();
      
      return {
        id: profile.sub, // LinkedIn member ID
        username: profile.name || profile.given_name || 'LinkedIn User',
        displayName: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
        profileImageUrl: profile.picture,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      logger.oauth.exception(error, { platform: 'linkedin', action: 'get-profile' });
      throw new OAuthError('Failed to get user profile', 'profile_error');
    }
  }
  
  /**
   * Get LinkedIn member URN for posting
   */
  async getMemberUrn(accessToken: string): Promise<string> {
    const profile = await this.getUserProfile(accessToken);
    return `urn:li:person:${profile.id}`;
  }
  
  /**
   * Revoke access token
   * Note: LinkedIn doesn't have a direct revoke endpoint, 
   * tokens expire naturally after 60 days
   */
  async revokeToken(_accessToken: string): Promise<void> {
    // LinkedIn tokens expire naturally
    // No explicit revocation endpoint available for OAuth 2.0 apps
    logger.oauth.debug('LinkedIn tokens expire naturally, no explicit revocation');
  }
}
