import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { disconnectAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
import { TwitterProvider } from '@/lib/oauth/twitter-provider';
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
      const accessToken = await getDecryptedToken(session.user.id, 'twitter');
      
      if (accessToken) {
        try {
          const provider = new TwitterProvider();
          await provider.revokeToken(accessToken);
        } catch (error) {
          logger.oauth.warn('Failed to revoke Twitter token', { error, platform: 'twitter' });
          // Continue anyway - we'll delete locally
        }
      }
    } catch (decryptError) {
      logger.oauth.warn('Failed to decrypt token for revocation (will still disconnect)', { 
        error: decryptError, 
        platform: 'twitter',
        userId: session.user.id 
      });
      // Continue with disconnection even if decryption fails
    }
    
    // Delete connection from database
    await disconnectAccount(session.user.id, 'twitter');
    
    return NextResponse.json({
      success: true,
      message: 'Twitter account disconnected successfully'
    });
  } catch (error) {
    logger.oauth.error('Twitter disconnect error', { error, platform: 'twitter' });
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter account' },
      { status: 500 }
    );
  }
}
