/**
 * API Route: Mark Notification as Read
 * 
 * Marks a single notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { markAsRead as markNotificationAsRead } from '@/lib/db/notifications';
import { db } from '@/drizzle/db';
import { notifications } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

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

    const body = await parseRequestBody<{ notificationId: string }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID required' },
        { status: 400 }
      );
    }

    // Verify ownership before marking as read
    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      ),
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    await markNotificationAsRead(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.api.exception(error, { action: 'mark-read' });
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
