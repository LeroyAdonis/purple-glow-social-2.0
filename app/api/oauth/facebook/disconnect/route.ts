import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { disconnectAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
import { FacebookProvider } from '@/lib/oauth/facebook-provider';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
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
    
    // Try to get the access token to revoke it (best effort)
    // If decryption fails, we'll still proceed with disconnection
    try {
      const accessToken = await getDecryptedToken(session.user.id, 'facebook');
      
      if (accessToken) {
        try {
          const provider = new FacebookProvider();
          await provider.revokeToken(accessToken);
        } catch (error) {
          logger.oauth.warn('Failed to revoke Facebook token', { error, platform: 'facebook' });
          // Continue anyway - we'll delete locally
        }
      }
    } catch (decryptError) {
      logger.oauth.warn('Failed to decrypt token for revocation (will still disconnect)', { 
        error: decryptError, 
        platform: 'facebook',
        userId: session.user.id 
      });
      // Continue with disconnection even if decryption fails
    }
    
    // Delete connection from database
    await disconnectAccount(session.user.id, 'facebook');
    
    return NextResponse.json({
      success: true,
      message: 'Facebook account disconnected successfully'
    });
  } catch (error) {
    logger.oauth.error('Facebook disconnect error', { error, platform: 'facebook' });
    return NextResponse.json(
      { error: 'Failed to disconnect Facebook account' },
      { status: 500 }
    );
  }
}
