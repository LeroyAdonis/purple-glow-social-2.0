/**
 * /api/posts/drafts/[id]
 * PATCH  — update an existing draft
 * DELETE — delete a draft
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const updateDraftSchema = z.object({
  content: z.string().min(1).optional(),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']).optional(),
  topic: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.query.posts.findFirst({
      where: and(eq(posts.id, id), eq(posts.userId, session.user.id)),
    });
    if (!existing) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
    if (parsed.data.platform !== undefined) updateData.platform = parsed.data.platform;
    if (parsed.data.topic !== undefined) updateData.topic = parsed.data.topic;
    if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(and(eq(posts.id, id), eq(posts.userId, session.user.id)))
      .returning();

    return NextResponse.json({ success: true, draft: updated });
  } catch (error: any) {
    logger.api.exception(error, { endpoint: '/api/posts/drafts/[id] PATCH' });
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const existing = await db.query.posts.findFirst({
      where: and(eq(posts.id, id), eq(posts.userId, session.user.id)),
    });
    if (!existing) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, session.user.id)));

    logger.api.info('Draft deleted', { postId: id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.api.exception(error, { endpoint: '/api/posts/drafts/[id] DELETE' });
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}
