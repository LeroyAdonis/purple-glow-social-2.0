import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { LinkedInProvider } from '@/lib/oauth/linkedin-provider';
import { getConnectedAccount, deleteConnectedAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
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
    
    const userId = session.user.id;
    
    // Get the connected account
    const account = await getConnectedAccount(userId, 'linkedin');
    
    if (!account) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected' },
        { status: 404 }
      );
    }
    
    // Try to revoke the token (best effort)
    try {
      const accessToken = await getDecryptedToken(userId, 'linkedin');
      if (accessToken) {
        const provider = new LinkedInProvider();
        await provider.revokeToken(accessToken);
      }
    } catch (revokeError) {
      // Log but don't fail - token revocation is best effort
      logger.oauth.warn('Failed to revoke LinkedIn token', { error: revokeError });
    }
    
    // Delete the connected account from database
    await deleteConnectedAccount(userId, 'linkedin');
    
    logger.oauth.info('LinkedIn account disconnected', { userId });
    
    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected successfully',
    });
  } catch (error) {
    logger.oauth.exception(error, { platform: 'linkedin', action: 'disconnect' });
    
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn account' },
      { status: 500 }
    );
  }
}

// Also support DELETE method
export async function DELETE(request: NextRequest) {
  return POST(request);
}
