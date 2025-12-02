import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { generationLogs, posts, user } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getGenerationErrors } from '@/lib/db/generation-logs';

/**
 * Check if user is admin
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * GET /api/admin/errors
 * Get generation and publishing errors for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'generation', 'publishing', 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    const result: {
      generationErrors: any[];
      publishingErrors: any[];
    } = {
      generationErrors: [],
      publishingErrors: [],
    };

    // Get generation errors
    if (type === 'all' || type === 'generation') {
      const genErrors = await getGenerationErrors({ limit });
      
      // Enrich with user info
      const enrichedGenErrors = await Promise.all(
        genErrors.map(async (error) => {
          const [userData] = await db
            .select({ email: user.email, name: user.name })
            .from(user)
            .where(eq(user.id, error.userId))
            .limit(1);
          
          return {
            id: error.id,
            userId: error.userId,
            userName: userData?.name,
            userEmail: userData?.email,
            platform: error.platform,
            topic: error.topic,
            tone: error.tone,
            language: error.language,
            errorMessage: error.errorMessage,
            createdAt: error.createdAt.toISOString(),
          };
        })
      );
      
      result.generationErrors = enrichedGenErrors;
    }

    // Get publishing errors
    if (type === 'all' || type === 'publishing') {
      const failedPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.status, 'failed'))
        .orderBy(desc(posts.createdAt))
        .limit(limit);

      // Enrich with user info
      const enrichedPostErrors = await Promise.all(
        failedPosts.map(async (post) => {
          const [userData] = await db
            .select({ email: user.email, name: user.name })
            .from(user)
            .where(eq(user.id, post.userId))
            .limit(1);
          
          return {
            id: post.id,
            userId: post.userId,
            userName: userData?.name,
            userEmail: userData?.email,
            platform: post.platform,
            content: post.content.slice(0, 200) + (post.content.length > 200 ? '...' : ''),
            status: post.status,
            errorMessage: post.errorMessage,
            scheduledDate: post.scheduledDate?.toISOString() || null,
            createdAt: post.createdAt?.toISOString() || null,
          };
        })
      );
      
      result.publishingErrors = enrichedPostErrors;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Admin errors fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}
