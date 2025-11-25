import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { disconnectAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
import { FacebookProvider } from '@/lib/oauth/facebook-provider';

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
    
    // Get the access token to revoke it
    const accessToken = await getDecryptedToken(session.user.id, 'facebook');
    
    // Revoke token with Facebook (best effort)
    if (accessToken) {
      try {
        const provider = new FacebookProvider();
        await provider.revokeToken(accessToken);
      } catch (error) {
        console.error('Failed to revoke Facebook token:', error);
        // Continue anyway - we'll delete locally
      }
    }
    
    // Delete connection from database
    await disconnectAccount(session.user.id, 'facebook');
    
    return NextResponse.json({
      success: true,
      message: 'Facebook account disconnected successfully'
    });
  } catch (error) {
    console.error('Facebook disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Facebook account' },
      { status: 500 }
    );
  }
}
