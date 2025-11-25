import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { disconnectAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
import { InstagramProvider } from '@/lib/oauth/instagram-provider';

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
    const accessToken = await getDecryptedToken(session.user.id, 'instagram');
    
    // Revoke token with Instagram (best effort)
    if (accessToken) {
      try {
        const provider = new InstagramProvider();
        await provider.revokeToken(accessToken);
      } catch (error) {
        console.error('Failed to revoke Instagram token:', error);
        // Continue anyway - we'll delete locally
      }
    }
    
    // Delete connection from database
    await disconnectAccount(session.user.id, 'instagram');
    
    return NextResponse.json({
      success: true,
      message: 'Instagram account disconnected successfully'
    });
  } catch (error) {
    console.error('Instagram disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram account' },
      { status: 500 }
    );
  }
}
