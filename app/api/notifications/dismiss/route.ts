/**
 * API Route: Dismiss Notification
 * 
 * Deletes a notification for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dismissNotification as deleteNotification } from '@/lib/db/notifications';
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

    // Verify ownership before dismissing
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

    await deleteNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification dismissed',
    });
  } catch (error) {
    logger.api.exception(error, { action: 'dismiss-notification' });
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss notification' },
      { status: 500 }
    );
  }
}
