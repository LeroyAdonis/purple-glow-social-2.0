/**
 * API Route: Mark All Notifications as Read
 * 
 * Marks all notifications for the user as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { markAllAsRead } from '@/lib/db/notifications';

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await markAllAsRead(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('[notifications/read-all] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
