import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getUserAutomationRules, 
  countUserAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  toggleAutomationRule
} from '@/lib/db/automation';

/**
 * GET /api/user/automation-rules
 * Fetch current user's automation rules
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

    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

    const rules = await getUserAutomationRules(session.user.id, {
      isActive,
      limit,
      offset,
    });

    const totalActive = await countUserAutomationRules(session.user.id, true);
    const totalRules = await countUserAutomationRules(session.user.id);

    return NextResponse.json({
      rules,
      stats: {
        total: totalRules,
        active: totalActive,
      },
      pagination: {
        limit,
        offset,
        hasMore: rules.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Automation rules fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch automation rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/automation-rules
 * Create a new automation rule
 */
export async function POST(request: NextRequest) {
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

    // Import tier validation
    const { canUseAutomation } = await import('@/lib/tiers/validation');
    const { db } = await import('@/drizzle/db');
    const { user } = await import('@/drizzle/schema');
    const { eq } = await import('drizzle-orm');

    // Get user tier
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userTier = (userRecord.tier || 'free') as 'free' | 'pro' | 'business';

    // Check if user can use automation
    const currentRulesCount = await countUserAutomationRules(session.user.id);
    const automationCheck = canUseAutomation(userTier, currentRulesCount);

    if (!automationCheck.allowed) {
      return NextResponse.json(
        { 
          error: automationCheck.message,
          limit: automationCheck.limit,
          current: automationCheck.current,
        },
        { status: 403 } // Forbidden
      );
    }

    const body = await request.json();
    const { frequency, coreTopic, isActive } = body;

    const rule = await createAutomationRule({
      userId: session.user.id,
      frequency: frequency || 'weekly',
      coreTopic: coreTopic || '',
      isActive: isActive ?? true,
    });

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('Automation rule create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create automation rule' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/automation-rules
 * Update an automation rule
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

    const body = await request.json();
    const { id, toggle, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    let rule;
    if (toggle) {
      rule = await toggleAutomationRule(id);
    } else {
      rule = await updateAutomationRule(id, updateData);
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('Automation rule update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update automation rule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/automation-rules
 * Delete an automation rule
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    await deleteAutomationRule(id);

    return NextResponse.json({
      success: true,
      message: 'Automation rule deleted',
    });
  } catch (error: any) {
    console.error('Automation rule delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete automation rule' },
      { status: 500 }
    );
  }
}
