/**
 * Post Analytics Service
 * Tracks engagement metrics and calculates engagement scores for learning
 */

import { db } from '@/drizzle/db';
import { 
  postAnalytics, 
  posts, 
  NewPostAnalytics,
  Post 
} from '@/drizzle/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { learningProfileService } from './learning-profile-service';

interface EngagementMetrics {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  clicks?: number;
}

interface PlatformWeights {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
}

export class AnalyticsService {
  // Platform-specific engagement weights
  private platformWeights: Record<string, PlatformWeights> = {
    instagram: { likes: 1, comments: 3, shares: 4, saves: 5, reach: 0.01 },
    facebook: { likes: 1, comments: 2, shares: 3, saves: 2, reach: 0.01 },
    twitter: { likes: 1, comments: 2, shares: 4, saves: 2, reach: 0.005 },
    linkedin: { likes: 1, comments: 3, shares: 5, saves: 2, reach: 0.01 },
  };

  /**
   * Record analytics for a post
   */
  async recordAnalytics(
    postId: string,
    userId: string,
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin',
    metrics: EngagementMetrics,
    generationContext?: {
      topic?: string;
      tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
      language?: string;
      promptVariation?: string;
    }
  ): Promise<void> {
    try {
      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(platform, metrics);

      // Check for existing analytics
      const existing = await db.select()
        .from(postAnalytics)
        .where(eq(postAnalytics.postId, postId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db.update(postAnalytics)
          .set({
            likes: metrics.likes ?? existing[0].likes,
            comments: metrics.comments ?? existing[0].comments,
            shares: metrics.shares ?? existing[0].shares,
            saves: metrics.saves ?? existing[0].saves,
            reach: metrics.reach ?? existing[0].reach,
            impressions: metrics.impressions ?? existing[0].impressions,
            clicks: metrics.clicks ?? existing[0].clicks,
            engagementScore,
            fetchedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(postAnalytics.postId, postId));
      } else {
        // Insert new
        await db.insert(postAnalytics).values({
          postId,
          userId,
          platform,
          likes: metrics.likes ?? 0,
          comments: metrics.comments ?? 0,
          shares: metrics.shares ?? 0,
          saves: metrics.saves ?? 0,
          reach: metrics.reach ?? 0,
          impressions: metrics.impressions ?? 0,
          clicks: metrics.clicks ?? 0,
          engagementScore,
          topic: generationContext?.topic,
          tone: generationContext?.tone,
          language: generationContext?.language,
          promptVariation: generationContext?.promptVariation,
        });
      }

      logger.ai.info('Analytics recorded', { postId, platform, engagementScore });

      // Trigger learning update if this is a high performer
      if (engagementScore >= 70) {
        await learningProfileService.runLearningAnalysis(userId);
      }
    } catch (error) {
      logger.ai.exception(error, { action: 'record-analytics', postId });
    }
  }

  /**
   * Calculate engagement score (0-100) based on platform-specific weights
   */
  calculateEngagementScore(
    platform: string, 
    metrics: EngagementMetrics
  ): number {
    const weights = this.platformWeights[platform] || this.platformWeights.facebook;
    
    const rawScore = 
      (metrics.likes || 0) * weights.likes +
      (metrics.comments || 0) * weights.comments +
      (metrics.shares || 0) * weights.shares +
      (metrics.saves || 0) * weights.saves +
      (metrics.reach || 0) * weights.reach;

    // Normalize to 0-100 scale (using logarithmic scaling for better distribution)
    // A score of ~100 raw points = 50, ~1000 = 75, ~10000 = 100
    if (rawScore === 0) return 0;
    
    const normalizedScore = Math.min(100, Math.round(
      25 * Math.log10(rawScore + 1)
    ));

    return normalizedScore;
  }

  /**
   * Get analytics summary for a user
   */
  async getUserAnalyticsSummary(userId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const analytics = await db.select()
      .from(postAnalytics)
      .where(and(
        eq(postAnalytics.userId, userId),
        gte(postAnalytics.createdAt, cutoffDate)
      ))
      .orderBy(desc(postAnalytics.engagementScore));

    if (analytics.length === 0) {
      return {
        totalPosts: 0,
        avgEngagement: 0,
        topPerformers: [],
        platformBreakdown: {},
        trendingTopics: [],
      };
    }

    // Calculate averages
    const avgEngagement = Math.round(
      analytics.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / analytics.length
    );

    // Platform breakdown
    const platformBreakdown: Record<string, { count: number; avgEngagement: number }> = {};
    for (const a of analytics) {
      if (!platformBreakdown[a.platform]) {
        platformBreakdown[a.platform] = { count: 0, avgEngagement: 0 };
      }
      platformBreakdown[a.platform].count += 1;
      platformBreakdown[a.platform].avgEngagement += a.engagementScore || 0;
    }
    
    // Calculate averages per platform
    for (const platform of Object.keys(platformBreakdown)) {
      platformBreakdown[platform].avgEngagement = Math.round(
        platformBreakdown[platform].avgEngagement / platformBreakdown[platform].count
      );
    }

    // Get top topics
    const topicScores: Record<string, { total: number; count: number }> = {};
    for (const a of analytics) {
      if (a.topic) {
        if (!topicScores[a.topic]) {
          topicScores[a.topic] = { total: 0, count: 0 };
        }
        topicScores[a.topic].total += a.engagementScore || 0;
        topicScores[a.topic].count += 1;
      }
    }

    const trendingTopics = Object.entries(topicScores)
      .map(([topic, { total, count }]) => ({
        topic,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    return {
      totalPosts: analytics.length,
      avgEngagement,
      topPerformers: analytics.slice(0, 5).map(a => ({
        postId: a.postId,
        platform: a.platform,
        engagementScore: a.engagementScore,
        topic: a.topic,
      })),
      platformBreakdown,
      trendingTopics,
    };
  }

  /**
   * Fetch analytics from platform APIs (placeholder for platform integration)
   */
  async fetchPlatformAnalytics(
    post: Post,
    accessToken: string
  ): Promise<EngagementMetrics | null> {
    // This would integrate with platform-specific APIs
    // For now, return null - implement when platform APIs are connected
    logger.ai.info('Platform analytics fetch requested', { 
      platform: post.platform, 
      postId: post.id 
    });
    
    // TODO: Implement platform-specific API calls
    // - Instagram: Graph API insights
    // - Facebook: Graph API insights
    // - Twitter: Tweet metrics API
    // - LinkedIn: Share statistics API
    
    return null;
  }

  /**
   * Batch update analytics for all recent posts
   */
  async batchUpdateAnalytics(userId: string): Promise<void> {
    try {
      // Get posts from last 7 days that are published
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      const recentPosts = await db.select()
        .from(posts)
        .where(and(
          eq(posts.userId, userId),
          eq(posts.status, 'posted'),
          gte(posts.publishedAt, cutoffDate)
        ));

      logger.ai.info('Batch analytics update', { userId, postCount: recentPosts.length });

      // Would fetch analytics for each post from platform APIs
      // For now, just log the intent
      for (const post of recentPosts) {
        // TODO: Fetch actual analytics from platform APIs
        logger.ai.debug('Would fetch analytics for post', { 
          postId: post.id, 
          platform: post.platform 
        });
      }
    } catch (error) {
      logger.ai.exception(error, { action: 'batch-analytics-update', userId });
    }
  }
}

export const analyticsService = new AnalyticsService();
