/**
 * POPIA/GDPR Data Export Endpoint
 * 
 * Allows users to download all their personal data in JSON format.
 * Required for POPIA compliance (Right to Data Portability).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { 
  user, 
  posts, 
  automationRules, 
  connectedAccounts,
  transactions,
  subscriptions,
  notifications,
  generationLogs,
  dailyUsage,
  contentFeedback,
  userLearningProfiles
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.security.info('Data export requested', { userId });

    // Fetch all user data (parallel queries)
    const [
      userData,
      userPosts,
      userRules,
      userConnections,
      userTransactions,
      userSubscriptions,
      userNotifications,
      userGenerations,
      userUsage,
      userFeedback,
      userProfile
    ] = await Promise.all([
      db.query.user.findFirst({ where: eq(user.id, userId) }),
      db.select().from(posts).where(eq(posts.userId, userId)),
      db.select().from(automationRules).where(eq(automationRules.userId, userId)),
      db.select({
        id: connectedAccounts.id,
        platform: connectedAccounts.platform,
        platformUserId: connectedAccounts.platformUserId,
        platformUsername: connectedAccounts.platformUsername,
        platformDisplayName: connectedAccounts.platformDisplayName,
        profileImageUrl: connectedAccounts.profileImageUrl,
        connectedAt: connectedAccounts.createdAt,
        isActive: connectedAccounts.isActive,
        // Exclude encrypted tokens for security
      }).from(connectedAccounts).where(eq(connectedAccounts.userId, userId)),
      db.select().from(transactions).where(eq(transactions.userId, userId)),
      db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
      db.select().from(notifications).where(eq(notifications.userId, userId)),
      db.select().from(generationLogs).where(eq(generationLogs.userId, userId)),
      db.select().from(dailyUsage).where(eq(dailyUsage.userId, userId)),
      db.select().from(contentFeedback).where(eq(contentFeedback.userId, userId)),
      db.query.userLearningProfiles.findFirst({ where: eq(userLearningProfiles.userId, userId) })
    ]);

    // Sanitize user data (remove sensitive fields)
    const sanitizedUser = userData ? {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      tier: userData.tier,
      credits: userData.credits,
      videoCredits: userData.videoCredits,
      lastCreditReset: userData.lastCreditReset,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    } : null;

    // Build export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      dataController: 'Purple Glow Social (Pty) Ltd',
      user: sanitizedUser,
      posts: userPosts,
      automationRules: userRules,
      connectedAccounts: userConnections,
      transactions: userTransactions,
      subscriptions: userSubscriptions,
      notifications: userNotifications,
      generationLogs: userGenerations,
      dailyUsage: userUsage,
      contentFeedback: userFeedback,
      learningProfile: userProfile,
    };

    logger.security.info('Data export completed', { 
      userId, 
      recordCount: {
        posts: userPosts.length,
        rules: userRules.length,
        transactions: userTransactions.length,
      }
    });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="purple-glow-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    logger.api.exception(error, { action: 'data-export' });
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
