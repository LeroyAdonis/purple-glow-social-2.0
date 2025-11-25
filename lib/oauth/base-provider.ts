/**
 * Base OAuth Provider Interface
 * All OAuth providers (Instagram, Facebook, Twitter, LinkedIn) implement this interface
 */

export interface OAuthProvider {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  
  /**
   * Get the authorization URL to redirect user to
   */
  getAuthorizationUrl(state: string): string;
  
  /**
   * Exchange authorization code for access token
   */
  exchangeCodeForToken(code: string): Promise<TokenResponse>;
  
  /**
   * Refresh an access token
   */
  refreshAccessToken(refreshToken: string): Promise<TokenResponse>;
  
  /**
   * Get user profile information
   */
  getUserProfile(accessToken: string): Promise<UserProfile>;
  
  /**
   * Revoke access token
   */
  revokeToken(accessToken: string): Promise<void>;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds
  scope: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
}

export class OAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}
