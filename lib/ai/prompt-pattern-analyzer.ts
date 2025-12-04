/**
 * Prompt Pattern Analyzer
 * Self-learning engine that identifies and refines successful prompt patterns
 * 
 * Based on Gemini prompting strategies:
 * - Tracks which prompt variations produce best results
 * - Aggregates patterns across users for system-wide learning
 * - Continuously refines prompt templates based on engagement data
 */

import { db } from '@/drizzle/db';
import { 
  promptPatterns, 
  postAnalytics,
  contentFeedback,
  highPerformingExamples,
  NewPromptPattern 
} from '@/drizzle/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { logger } from '@/lib/logger';

interface PatternAnalysis {
  patternType: string;
  platform: string;
  language: string | null;
  tone: 'professional' | 'casual' | 'friendly' | 'energetic' | null;
  patternContent: string;
  exampleOutput: string;
  usageCount: number;
  successCount: number;
  avgEngagementScore: number;
}

export class PromptPatternAnalyzer {
  // Pattern types we track
  private patternTypes = [
    'opening', // How posts start
    'cta', // Call-to-action patterns
    'hashtag_style', // Hashtag placement and style
    'emoji_usage', // Emoji patterns
    'sa_expression', // South African expression usage
    'structure', // Overall post structure
  ];

  /**
   * Analyze engagement data and update prompt patterns
   */
  async analyzeAndUpdatePatterns(): Promise<void> {
    try {
      logger.ai.info('Starting prompt pattern analysis');

      // Get high-performing posts with analytics
      const highPerformers = await db.select()
        .from(postAnalytics)
        .where(gte(postAnalytics.engagementScore, 60))
        .orderBy(desc(postAnalytics.engagementScore))
        .limit(100);

      // Get the actual post content for these
      const examplesWithContent = await db.select({
        content: highPerformingExamples.content,
        platform: highPerformingExamples.platform,
        tone: highPerformingExamples.tone,
        language: highPerformingExamples.language,
        engagementScore: highPerformingExamples.engagementScore,
      })
        .from(highPerformingExamples)
        .where(gte(highPerformingExamples.engagementScore, 60))
        .orderBy(desc(highPerformingExamples.engagementScore))
        .limit(50);

      // Analyze patterns from high performers
      const patterns = this.extractPatterns(examplesWithContent);

      // Update pattern database
      for (const pattern of patterns) {
        await this.upsertPattern(pattern);
      }

      // Update effectiveness scores
      await this.updateEffectivenessScores();

      // Prune underperforming patterns
      await this.pruneIneffectivePatterns();

      logger.ai.info('Pattern analysis complete', { 
        patternsUpdated: patterns.length 
      });
    } catch (error) {
      logger.ai.exception(error, { action: 'pattern-analysis' });
    }
  }

  /**
   * Extract patterns from high-performing content
   */
  private extractPatterns(examples: Array<{
    content: string;
    platform: string;
    tone: string | null;
    language: string | null;
    engagementScore: number;
  }>): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];

    for (const example of examples) {
      // Extract opening pattern
      const opening = this.extractOpeningPattern(example.content);
      if (opening) {
        patterns.push({
          patternType: 'opening',
          platform: example.platform,
          language: example.language,
          tone: example.tone as 'professional' | 'casual' | 'friendly' | 'energetic' | null,
          patternContent: opening.pattern,
          exampleOutput: opening.example,
          usageCount: 1,
          successCount: 1,
          avgEngagementScore: example.engagementScore,
        });
      }

      // Extract CTA pattern
      const cta = this.extractCtaPattern(example.content);
      if (cta) {
        patterns.push({
          patternType: 'cta',
          platform: example.platform,
          language: example.language,
          tone: example.tone as 'professional' | 'casual' | 'friendly' | 'energetic' | null,
          patternContent: cta.pattern,
          exampleOutput: cta.example,
          usageCount: 1,
          successCount: 1,
          avgEngagementScore: example.engagementScore,
        });
      }

      // Extract SA expression pattern
      const saPattern = this.extractSaExpressionPattern(example.content);
      if (saPattern) {
        patterns.push({
          patternType: 'sa_expression',
          platform: example.platform,
          language: example.language,
          tone: example.tone as 'professional' | 'casual' | 'friendly' | 'energetic' | null,
          patternContent: saPattern.pattern,
          exampleOutput: saPattern.example,
          usageCount: 1,
          successCount: 1,
          avgEngagementScore: example.engagementScore,
        });
      }
    }

    return patterns;
  }

  /**
   * Extract opening patterns (first line/phrase)
   */
  private extractOpeningPattern(content: string): { pattern: string; example: string } | null {
    const firstLine = content.split('\n')[0].trim();
    if (!firstLine || firstLine.length < 5) return null;

    // Categorize opening types
    if (firstLine.match(/^(howzit|hello|hey|hi|molo|sawubona|dumela)/i)) {
      return {
        pattern: 'greeting_opening',
        example: firstLine.substring(0, 50),
      };
    }

    if (firstLine.includes('?')) {
      return {
        pattern: 'question_opening',
        example: firstLine.substring(0, 50),
      };
    }

    if (firstLine.match(/^[🎉🔥💪✨🚀]/)) {
      return {
        pattern: 'emoji_opening',
        example: firstLine.substring(0, 50),
      };
    }

    if (firstLine.match(/^(exciting|big|amazing|incredible|lekker)/i)) {
      return {
        pattern: 'excitement_opening',
        example: firstLine.substring(0, 50),
      };
    }

    return null;
  }

  /**
   * Extract call-to-action patterns
   */
  private extractCtaPattern(content: string): { pattern: string; example: string } | null {
    const ctaPatterns = [
      { regex: /(click|tap|visit|check out|head to).{1,30}(link|bio|profile)/i, type: 'link_cta' },
      { regex: /(comment|tell us|share|drop).{1,30}(below|thoughts|opinion)/i, type: 'engagement_cta' },
      { regex: /(book|order|shop|buy|get).{1,30}(now|today|here)/i, type: 'action_cta' },
      { regex: /(follow|subscribe|join).{1,30}(for|to|us)/i, type: 'follow_cta' },
      { regex: /(tag|mention).{1,30}(friend|someone|who)/i, type: 'viral_cta' },
    ];

    for (const { regex, type } of ctaPatterns) {
      const match = content.match(regex);
      if (match) {
        return {
          pattern: type,
          example: match[0].substring(0, 50),
        };
      }
    }

    return null;
  }

  /**
   * Extract South African expression patterns
   */
  private extractSaExpressionPattern(content: string): { pattern: string; example: string } | null {
    const saExpressions = [
      { regex: /howzit\s+(mzansi|sa|south africa|fam)/i, type: 'howzit_greeting' },
      { regex: /lekker\s+(deal|sale|offer|vibes|day)/i, type: 'lekker_adjective' },
      { regex: /sharp\s+sharp/i, type: 'sharp_affirmation' },
      { regex: /(eish|haibo|hayibo)/i, type: 'exclamation' },
      { regex: /ja\s+nee/i, type: 'ja_nee_expression' },
      { regex: /#(mzansi|localislekker|proudlysa)/i, type: 'sa_hashtag' },
    ];

    for (const { regex, type } of saExpressions) {
      const match = content.match(regex);
      if (match) {
        return {
          pattern: type,
          example: match[0],
        };
      }
    }

    return null;
  }

  /**
   * Upsert a pattern into the database
   */
  private async upsertPattern(pattern: PatternAnalysis): Promise<void> {
    // Check if pattern exists
    const existing = await db.select()
      .from(promptPatterns)
      .where(and(
        eq(promptPatterns.patternType, pattern.patternType),
        eq(promptPatterns.platform, pattern.platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin'),
        eq(promptPatterns.patternContent, pattern.patternContent)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing pattern
      const newUsageCount = existing[0].usageCount! + 1;
      const newSuccessCount = existing[0].successCount! + 1;
      const newAvgScore = Math.round(
        ((existing[0].avgEngagementScore || 0) * existing[0].usageCount! + pattern.avgEngagementScore) / newUsageCount
      );

      await db.update(promptPatterns)
        .set({
          usageCount: newUsageCount,
          successCount: newSuccessCount,
          avgEngagementScore: newAvgScore,
          updatedAt: new Date(),
        })
        .where(eq(promptPatterns.id, existing[0].id));
    } else {
      // Insert new pattern
      await db.insert(promptPatterns).values({
        patternType: pattern.patternType,
        platform: pattern.platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
        language: pattern.language,
        tone: pattern.tone,
        patternContent: pattern.patternContent,
        exampleOutput: pattern.exampleOutput,
        usageCount: 1,
        successCount: 1,
        avgEngagementScore: pattern.avgEngagementScore,
        effectivenessScore: pattern.avgEngagementScore,
        isActive: true,
      });
    }
  }

  /**
   * Update effectiveness scores based on latest data
   */
  private async updateEffectivenessScores(): Promise<void> {
    const patterns = await db.select().from(promptPatterns);

    for (const pattern of patterns) {
      // Calculate effectiveness: success rate * average engagement
      const successRate = pattern.usageCount! > 0 
        ? pattern.successCount! / pattern.usageCount! 
        : 0;
      
      const effectivenessScore = Math.round(
        successRate * (pattern.avgEngagementScore || 0)
      );

      await db.update(promptPatterns)
        .set({ 
          effectivenessScore,
          updatedAt: new Date(),
        })
        .where(eq(promptPatterns.id, pattern.id));
    }
  }

  /**
   * Prune patterns that consistently underperform
   */
  private async pruneIneffectivePatterns(): Promise<void> {
    // Deactivate patterns with low effectiveness after sufficient usage
    await db.update(promptPatterns)
      .set({ 
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(
        gte(promptPatterns.usageCount, 10),
        sql`${promptPatterns.effectivenessScore} < 20`
      ));

    logger.ai.info('Pruned ineffective patterns');
  }

  /**
   * Get best patterns for a given context
   */
  async getBestPatterns(
    platform: string,
    patternType?: string,
    limit: number = 5
  ): Promise<typeof promptPatterns.$inferSelect[]> {
    const conditions = [
      eq(promptPatterns.platform, platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin'),
      eq(promptPatterns.isActive, true),
    ];

    if (patternType) {
      conditions.push(eq(promptPatterns.patternType, patternType));
    }

    return db.select()
      .from(promptPatterns)
      .where(and(...conditions))
      .orderBy(desc(promptPatterns.effectivenessScore))
      .limit(limit);
  }

  /**
   * Process feedback and update pattern effectiveness
   */
  async processFeedbackForPatterns(
    content: string,
    platform: string,
    isPositive: boolean
  ): Promise<void> {
    // Find which patterns this content matches
    const opening = this.extractOpeningPattern(content);
    const cta = this.extractCtaPattern(content);
    const saPattern = this.extractSaExpressionPattern(content);

    const matchedPatterns = [opening, cta, saPattern].filter(Boolean);

    for (const matched of matchedPatterns) {
      if (!matched) continue;

      const existing = await db.select()
        .from(promptPatterns)
        .where(and(
          eq(promptPatterns.platform, platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin'),
          eq(promptPatterns.patternContent, matched.pattern)
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(promptPatterns)
          .set({
            usageCount: (existing[0].usageCount || 0) + 1,
            successCount: isPositive 
              ? (existing[0].successCount || 0) + 1 
              : existing[0].successCount,
            updatedAt: new Date(),
          })
          .where(eq(promptPatterns.id, existing[0].id));
      }
    }
  }
}

export const promptPatternAnalyzer = new PromptPatternAnalyzer();
