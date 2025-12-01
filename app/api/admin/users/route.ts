import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllUsersWithStats, updateUser, countUsers, getTierDistribution } from '@/lib/db/users';
import { addCredits, deductCredits } from '@/lib/db/users';

/**
 * Check if user is admin (email-based for now)
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * GET /api/admin/users
 * Fetch all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

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
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
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
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
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
    const updateData: Record<string, any> = { ...otherUpdates };
    if (tier) {
      updateData.tier = tier;
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
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
