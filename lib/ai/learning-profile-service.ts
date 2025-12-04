/**
 * User Learning Profile Service
 * Manages user-specific learning profiles for AI content improvement
 */

import { db } from '@/drizzle/db';
import { 
  userLearningProfiles, 
  postAnalytics, 
  contentFeedback,
  highPerformingExamples,
  posts,
  UserLearningProfile 
} from '@/drizzle/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface LearningContext {
  preferredTones: string[];
  preferredLanguages: string[];
  topHashtags: string[];
  topTopics: string[];
  effectiveSaExpressions: string[];
  platformInsights: Record<string, {
    avgEngagement: number;
    bestPostingTimes: string[];
    topContentTypes: string[];
  }>;
  recentHighPerformers: Array<{
    content: string;
    platform: string;
    engagementScore: number;
  }>;
  industry?: string;
  brandVoice?: string;
}

export class LearningProfileService {
  /**
   * Get or create a learning profile for a user
   */
  async getOrCreateProfile(userId: string): Promise<UserLearningProfile> {
    const existing = await db.select()
      .from(userLearningProfiles)
      .where(eq(userLearningProfiles.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new profile
    const [newProfile] = await db.insert(userLearningProfiles)
      .values({
        userId,
        preferredTones: [],
        preferredLanguages: [],
        topHashtags: [],
        topTopics: [],
        effectiveSaExpressions: [],
        platformInsights: {},
        localTrends: [],
      })
      .returning();

    return newProfile;
  }

  /**
   * Get learning context for prompt enhancement
   */
  async getLearningContext(userId: string, platform: string): Promise<LearningContext> {
    const profile = await this.getOrCreateProfile(userId);

    // Get recent high-performing examples for this user and platform
    const recentHighPerformers = await db.select({
      content: highPerformingExamples.content,
      platform: highPerformingExamples.platform,
      engagementScore: highPerformingExamples.engagementScore,
    })
      .from(highPerformingExamples)
      .where(and(
        eq(highPerformingExamples.userId, userId),
        eq(highPerformingExamples.platform, platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin')
      ))
      .orderBy(desc(highPerformingExamples.engagementScore))
      .limit(3);

    // If user has no examples, get system-wide examples
    const systemExamples = recentHighPerformers.length < 2 
      ? await db.select({
          content: highPerformingExamples.content,
          platform: highPerformingExamples.platform,
          engagementScore: highPerformingExamples.engagementScore,
        })
          .from(highPerformingExamples)
          .where(and(
            eq(highPerformingExamples.isSystemWide, true),
            eq(highPerformingExamples.platform, platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin')
          ))
          .orderBy(desc(highPerformingExamples.engagementScore))
          .limit(3 - recentHighPerformers.length)
      : [];

    return {
      preferredTones: profile.preferredTones as string[] || [],
      preferredLanguages: profile.preferredLanguages as string[] || [],
      topHashtags: profile.topHashtags as string[] || [],
      topTopics: profile.topTopics as string[] || [],
      effectiveSaExpressions: profile.effectiveSaExpressions as string[] || [],
      platformInsights: profile.platformInsights as Record<string, {
        avgEngagement: number;
        bestPostingTimes: string[];
        topContentTypes: string[];
      }> || {},
      recentHighPerformers: [...recentHighPerformers, ...systemExamples],
      industry: profile.industry || undefined,
      brandVoice: profile.brandVoice || undefined,
    };
  }

  /**
   * Update profile with new industry context
   */
  async updateIndustryContext(
    userId: string, 
    industry: string, 
    targetAudience?: string, 
    brandVoice?: string
  ): Promise<void> {
    await db.update(userLearningProfiles)
      .set({
        industry,
        targetAudience: targetAudience || null,
        brandVoice: brandVoice || null,
        updatedAt: new Date(),
      })
      .where(eq(userLearningProfiles.userId, userId));
  }

  /**
   * Run learning analysis on user's posts and update profile
   */
  async runLearningAnalysis(userId: string): Promise<void> {
    try {
      // Get all analytics for this user
      const analytics = await db.select()
        .from(postAnalytics)
        .where(eq(postAnalytics.userId, userId))
        .orderBy(desc(postAnalytics.engagementScore));

      if (analytics.length === 0) {
        logger.ai.info('No analytics data for learning', { userId });
        return;
      }

      // Analyze tones
      const toneScores: Record<string, { total: number; count: number }> = {};
      // Analyze languages
      const languageScores: Record<string, { total: number; count: number }> = {};
      // Analyze topics
      const topicScores: Record<string, { total: number; count: number }> = {};
      // Platform insights
      const platformData: Record<string, { scores: number[]; count: number }> = {};

      for (const analytic of analytics) {
        const score = analytic.engagementScore || 0;
        
        if (analytic.tone) {
          if (!toneScores[analytic.tone]) toneScores[analytic.tone] = { total: 0, count: 0 };
          toneScores[analytic.tone].total += score;
          toneScores[analytic.tone].count += 1;
        }
        
        if (analytic.language) {
          if (!languageScores[analytic.language]) languageScores[analytic.language] = { total: 0, count: 0 };
          languageScores[analytic.language].total += score;
          languageScores[analytic.language].count += 1;
        }
        
        if (analytic.topic) {
          if (!topicScores[analytic.topic]) topicScores[analytic.topic] = { total: 0, count: 0 };
          topicScores[analytic.topic].total += score;
          topicScores[analytic.topic].count += 1;
        }

        if (!platformData[analytic.platform]) {
          platformData[analytic.platform] = { scores: [], count: 0 };
        }
        platformData[analytic.platform].scores.push(score);
        platformData[analytic.platform].count += 1;
      }

      // Calculate rankings
      const preferredTones = Object.entries(toneScores)
        .map(([tone, { total, count }]) => ({ tone, avg: total / count }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
        .map(t => t.tone);

      const preferredLanguages = Object.entries(languageScores)
        .map(([lang, { total, count }]) => ({ lang, avg: total / count }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
        .map(l => l.lang);

      const topTopics = Object.entries(topicScores)
        .map(([topic, { total, count }]) => ({ topic, avg: total / count }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5)
        .map(t => t.topic);

      const platformInsights: Record<string, { avgEngagement: number; bestPostingTimes: string[]; topContentTypes: string[] }> = {};
      for (const [platform, data] of Object.entries(platformData)) {
        const avgEngagement = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        platformInsights[platform] = {
          avgEngagement: Math.round(avgEngagement),
          bestPostingTimes: [], // Would need time data to calculate
          topContentTypes: [], // Would need content type data
        };
      }

      // Update profile
      await db.update(userLearningProfiles)
        .set({
          preferredTones,
          preferredLanguages,
          topTopics,
          platformInsights,
          totalPostsAnalyzed: analytics.length,
          avgEngagementScore: Math.round(
            analytics.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / analytics.length
          ),
          lastLearningUpdate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userLearningProfiles.userId, userId));

      // Update high-performing examples
      await this.updateHighPerformingExamples(userId, analytics);

      logger.ai.info('Learning analysis complete', { 
        userId, 
        postsAnalyzed: analytics.length,
        preferredTones,
        topTopics: topTopics.slice(0, 3),
      });
    } catch (error) {
      logger.ai.exception(error, { action: 'learning-analysis', userId });
    }
  }

  /**
   * Update high-performing examples from analytics
   */
  private async updateHighPerformingExamples(
    userId: string, 
    analytics: typeof postAnalytics.$inferSelect[]
  ): Promise<void> {
    // Get top 10% performers
    const threshold = analytics.length > 10 
      ? analytics[Math.floor(analytics.length * 0.1)].engagementScore || 50
      : 50;

    const topPerformers = analytics.filter(a => (a.engagementScore || 0) >= threshold);

    for (const performer of topPerformers.slice(0, 10)) {
      // Get the post content
      const [post] = await db.select()
        .from(posts)
        .where(eq(posts.id, performer.postId))
        .limit(1);

      if (!post) continue;

      // Check if already exists
      const existing = await db.select()
        .from(highPerformingExamples)
        .where(eq(highPerformingExamples.postId, performer.postId))
        .limit(1);

      if (existing.length > 0) {
        // Update engagement score
        await db.update(highPerformingExamples)
          .set({
            engagementScore: performer.engagementScore || 0,
            engagementMetrics: {
              likes: performer.likes || 0,
              comments: performer.comments || 0,
              shares: performer.shares || 0,
              reach: performer.reach || 0,
            },
          })
          .where(eq(highPerformingExamples.postId, performer.postId));
      } else {
        // Insert new example
        await db.insert(highPerformingExamples)
          .values({
            userId,
            postId: performer.postId,
            content: post.content,
            platform: performer.platform,
            topic: performer.topic,
            tone: performer.tone,
            language: performer.language,
            engagementScore: performer.engagementScore || 0,
            engagementMetrics: {
              likes: performer.likes || 0,
              comments: performer.comments || 0,
              shares: performer.shares || 0,
              reach: performer.reach || 0,
            },
            isSystemWide: false,
          });
      }
    }
  }

  /**
   * Process content feedback to improve learning
   */
  async processFeedback(
    userId: string,
    content: string,
    feedbackType: 'thumbs_up' | 'thumbs_down' | 'selected' | 'edited' | 'rejected',
    context: {
      platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
      topic?: string;
      tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
      language?: string;
      editedContent?: string;
      rejectionReason?: string;
    }
  ): Promise<void> {
    // Store feedback
    await db.insert(contentFeedback)
      .values({
        userId,
        generatedContent: content,
        platform: context.platform,
        topic: context.topic,
        tone: context.tone,
        language: context.language,
        feedbackType,
        editedContent: context.editedContent,
        rejectionReason: context.rejectionReason,
        learningWeight: feedbackType === 'thumbs_up' || feedbackType === 'selected' ? 2 : 1,
      });

    // Trigger learning update if significant feedback
    if (feedbackType === 'thumbs_up' || feedbackType === 'selected') {
      // Positive feedback - learn from this
      const profile = await this.getOrCreateProfile(userId);
      
      // Add to effective expressions if SA content detected
      const saExpressions = this.extractSaExpressions(content);
      if (saExpressions.length > 0) {
        const currentExpressions = (profile.effectiveSaExpressions as string[]) || [];
        const updated = [...new Set([...currentExpressions, ...saExpressions])].slice(0, 20);
        
        await db.update(userLearningProfiles)
          .set({
            effectiveSaExpressions: updated,
            updatedAt: new Date(),
          })
          .where(eq(userLearningProfiles.userId, userId));
      }
    }

    logger.ai.info('Feedback processed', { userId, feedbackType, platform: context.platform });
  }

  /**
   * Extract South African expressions from content
   */
  private extractSaExpressions(content: string): string[] {
    const saPatterns = [
      /\bhowzit\b/gi,
      /\blekker\b/gi,
      /\bsharp sharp\b/gi,
      /\beish\b/gi,
      /\bja nee\b/gi,
      /\baweh\b/gi,
      /\bmzansi\b/gi,
      /\bbraai\b/gi,
      /\bbiltong\b/gi,
      /\bboerewors\b/gi,
      /\bhay[i]?\s*bo\b/gi,
      /\bsawubona\b/gi,
      /\bmolo\b/gi,
      /\bdumela\b/gi,
      /\benkosi\b/gi,
      /\bsiyabonga\b/gi,
    ];

    const found: string[] = [];
    for (const pattern of saPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        found.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(found)];
  }
}

export const learningProfileService = new LearningProfileService();
