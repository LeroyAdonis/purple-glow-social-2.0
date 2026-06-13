/**
 * /api/posts/drafts
 * GET  — list drafts for current user
 * POST — create a new draft (alias for save-draft, used by post-creation-modal)
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const createDraftSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']),
  topic: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as string | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [eq(posts.userId, session.user.id), eq(posts.status, 'draft')];
    if (platform && ['facebook', 'instagram', 'twitter', 'linkedin'].includes(platform)) {
      conditions.push(eq(posts.platform, platform as any));
    }

    const drafts = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [desc(posts.updatedAt)],
      limit,
      offset,
    });

    return NextResponse.json({ drafts, total: drafts.length });
  } catch (error: any) {
    logger.api.exception(error, { endpoint: '/api/posts/drafts GET' });
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { content, platform, topic, imageUrl } = parsed.data;

    const [draft] = await db
      .insert(posts)
      .values({
        userId: session.user.id,
        content,
        platform,
        status: 'draft',
        topic: topic ?? null,
        imageUrl: imageUrl ?? null,
      })
      .returning();

    logger.api.info('Draft created', { postId: draft.id, platform, userId: session.user.id });

    // Return in the shape post-creation-modal expects: { draft: { id } }
    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    logger.api.exception(error, { endpoint: '/api/posts/drafts POST' });
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
