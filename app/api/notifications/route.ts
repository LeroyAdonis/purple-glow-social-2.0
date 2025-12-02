/**
 * API Route: Get User Notifications
 * 
 * Returns all active notifications for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserNotifications, getUnreadCount } from '@/lib/db/notifications';

export async function GET(request: NextRequest) {
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

    const userId = session.user.id;

    // Get notifications (including read ones for history)
    const notifications = await getUserNotifications(userId, {
      includeRead: true,
      limit: 50,
    });

    // Get unread count separately for accuracy
    const unreadCount = await getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        expiresAt: n.expiresAt?.toISOString() || null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('[notifications] Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
