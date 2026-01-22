import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersWithStats, updateUser, countUsers, getTierDistribution } from '@/lib/db/users';
import { addCredits, deductCredits } from '@/lib/db/users';
import type { UserUpdateData, UserTier } from '@/lib/types';
import { requireAdmin, handleAuthError } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

/**
 * GET /api/admin/users
 * Fetch all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const users = await getAllUsersWithStats({ limit, offset });
    const totalUsers = await countUsers();
    const tierDistribution = await getTierDistribution();

    return NextResponse.json({
      users,
      stats: {
        total: totalUsers,
        tierDistribution,
      },
      pagination: {
        limit,
        offset,
        hasMore: users.length === limit,
      },
    });
  } catch (error: unknown) {
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'fetch-users' });
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Update a user (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

    const body = await parseRequestBody<{
      userId: string;
      tier?: UserTier;
      creditAdjustment?: number;
      [key: string]: any;
    }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const { userId, tier, creditAdjustment, ...otherUpdates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Handle credit adjustment
    if (creditAdjustment !== undefined && creditAdjustment !== 0) {
      if (creditAdjustment > 0) {
        await addCredits(userId, creditAdjustment);
      } else {
        await deductCredits(userId, Math.abs(creditAdjustment));
      }
    }

    // Handle tier and other updates
    const updateData: UserUpdateData = { ...otherUpdates };
    if (tier) {
      updateData.tier = tier as UserTier;
    }

    let updatedUser;
    if (Object.keys(updateData).length > 0) {
      updatedUser = await updateUser(userId, updateData);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error: unknown) {
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'update-user' });
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
