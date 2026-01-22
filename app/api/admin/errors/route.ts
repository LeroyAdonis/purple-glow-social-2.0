import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { generationLogs, posts, user } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getGenerationErrors } from '@/lib/db/generation-logs';
import type { GenerationError, PublishingError } from '@/lib/types';
import { requireAdmin, handleAuthError } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/errors
 * Get generation and publishing errors for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'generation', 'publishing', 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    const result: {
      generationErrors: GenerationError[];
      publishingErrors: PublishingError[];
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
            userName: userData?.name ?? undefined,
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
            userName: userData?.name ?? undefined,
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
  } catch (error: unknown) {
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'fetch-errors' });
    const message = error instanceof Error ? error.message : 'Failed to fetch errors';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
