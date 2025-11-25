import { OAuthProvider, TokenResponse, UserProfile, OAuthError } from './base-provider';

export class LinkedInProvider implements OAuthProvider {
  platform = 'linkedin' as const;
  
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID!;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    this.redirectUri = `${process.env.BETTER_AUTH_URL}/api/oauth/linkedin/callback`;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set');
    }
  }
  
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'w_member_social r_liteprofile r_emailaddress',
      state,
    });
    
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }
  
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
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
          error.error_description || 'Failed to exchange code for token',
          error.error || 'token_exchange_failed',
          response.status
        );
      }
      
      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in, // Usually 60 days
        scope: data.scope,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      console.error('LinkedIn token exchange error:', error);
      throw new OAuthError('Failed to exchange code for token', 'token_exchange_error');
    }
  }
  
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
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
      // Get basic profile
      const profileResponse = await fetch(
        'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!profileResponse.ok) {
        throw new OAuthError('Failed to get user profile', 'profile_fetch_failed');
      }
      
      const profile = await profileResponse.json();
      
      // Get profile picture
      let profileImageUrl: string | undefined;
      try {
        const pictureResponse = await fetch(
          'https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (pictureResponse.ok) {
          const pictureData = await pictureResponse.json();
          const elements = pictureData.profilePicture?.['displayImage~']?.elements;
          if (elements && elements.length > 0) {
            // Get the largest image
            const largestImage = elements[elements.length - 1];
            profileImageUrl = largestImage.identifiers?.[0]?.identifier;
          }
        }
      } catch (error) {
        console.error('Failed to fetch LinkedIn profile picture:', error);
        // Continue without picture
      }
      
      const displayName = `${profile.localizedFirstName} ${profile.localizedLastName}`;
      
      return {
        id: profile.id,
        username: displayName.toLowerCase().replace(/\s+/g, ''),
        displayName,
        profileImageUrl,
      };
    } catch (error) {
      if (error instanceof OAuthError) throw error;
      console.error('LinkedIn profile fetch error:', error);
      throw new OAuthError('Failed to get user profile', 'profile_error');
    }
  }
  
  async revokeToken(accessToken: string): Promise<void> {
    try {
      // LinkedIn doesn't have a standard token revocation endpoint
      // The token will expire naturally after 60 days
      // We just delete it from our database
      console.log('LinkedIn token revocation - token will expire naturally');
    } catch (error) {
      console.error('LinkedIn token revocation error:', error);
      // Don't throw - best effort
    }
  }
}
