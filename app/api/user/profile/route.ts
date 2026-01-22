import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { auditLog } from '@/lib/db/audit';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

/**
 * GET /api/user/profile
 * Fetch current user's profile data including tier and credits
 */
export async function GET(request: NextRequest) {
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

    // Fetch user data from database
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog(session.user.id, 'profile_view', { 
      timestamp: new Date().toISOString() 
    });

    // Return user profile data
    return NextResponse.json({
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      tier: userRecord.tier || 'free',
      credits: userRecord.credits || 10,
      image: userRecord.image,
      emailVerified: userRecord.emailVerified,
    });
  } catch (error: any) {
    logger.api.exception(error, { action: 'fetch-profile' });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile information
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await parseRequestBody<{ name?: string; image?: string }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const { name, image } = body;

    // Update user profile
    const [updatedUser] = await db
      .update(user)
      .set({
        name: name || session.user.name,
        image: image || session.user.image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning();

    // Audit log
    await auditLog(session.user.id, 'profile_update', { 
      changes: { name: !!name, image: !!image },
      timestamp: new Date().toISOString() 
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    logger.api.exception(error, { action: 'update-profile' });
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
