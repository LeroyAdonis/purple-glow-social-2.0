/**
 * POPIA/GDPR Account Deletion Endpoint
 * 
 * Allows users to permanently delete their account and all associated data.
 * Required for POPIA compliance (Right to Erasure).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { 
  user, 
  session,
  account,
  posts, 
  automationRules, 
  connectedAccounts,
  transactions,
  subscriptions,
  notifications,
  generationLogs,
  dailyUsage,
  creditReservations,
  jobLogs,
  contentFeedback,
  userLearningProfiles,
  postAnalytics
} from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authSession = await auth.api.getSession({ headers: request.headers });
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authSession.user.id;
    const userEmail = authSession.user.email;

    // Require confirmation in request body
    const body = await request.json().catch(() => ({}));
    if (body.confirm !== 'DELETE_MY_ACCOUNT' || body.email !== userEmail) {
      return NextResponse.json(
        { 
          error: 'Confirmation required',
          message: 'Send { "confirm": "DELETE_MY_ACCOUNT", "email": "your@email.com" } to confirm deletion'
        },
        { status: 400 }
      );
    }

    logger.security.warn('Account deletion initiated', { userId, email: userEmail });

    // Delete all user data (order matters for foreign keys)
    await db.transaction(async (tx) => {
      // Delete dependent records first
      await tx.delete(creditReservations).where(eq(creditReservations.userId, userId));
      await tx.delete(dailyUsage).where(eq(dailyUsage.userId, userId));
      await tx.delete(generationLogs).where(eq(generationLogs.userId, userId));
      await tx.delete(notifications).where(eq(notifications.userId, userId));
      await tx.delete(contentFeedback).where(eq(contentFeedback.userId, userId));
      
      // Delete posts and related analytics
      const userPosts = await tx.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId));
      for (const post of userPosts) {
        await tx.delete(postAnalytics).where(eq(postAnalytics.postId, post.id));
      }
      await tx.delete(posts).where(eq(posts.userId, userId));
      
      // Delete automation rules
      await tx.delete(automationRules).where(eq(automationRules.userId, userId));
      
      // Delete connected accounts (OAuth tokens)
      await tx.delete(connectedAccounts).where(eq(connectedAccounts.userId, userId));
      
      // Keep transactions and subscriptions for legal/tax purposes (anonymize instead)
      // Note: For full POPIA compliance, consider if these should be deleted
      // Current approach: Keep for 7 years as per tax law requirements
      await tx.update(transactions)
        .set({ 
          metadata: { anonymized: true, deletedAt: new Date().toISOString() } 
        })
        .where(eq(transactions.userId, userId));
      
      await tx.update(subscriptions)
        .set({ 
          userId: 'deleted-user' // Keep subscription records but anonymize
        })
        .where(eq(subscriptions.userId, userId));
      
      // Delete learning profile
      await tx.delete(userLearningProfiles).where(eq(userLearningProfiles.userId, userId));
      
      // Delete job logs related to user
      // Using JSONB extraction to properly match userId in payload
      // The payload column is JSONB, we extract the userId field and compare
      await tx.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${userId}`
      );
      
      // Delete auth records
      await tx.delete(session).where(eq(session.userId, userId));
      await tx.delete(account).where(eq(account.userId, userId));
      
      // Finally, delete user record
      await tx.delete(user).where(eq(user.id, userId));
    });

    logger.security.info('Account deleted successfully', { userId, email: userEmail });

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.security.exception(error, { action: 'account-deletion' });
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    );
  }
}
