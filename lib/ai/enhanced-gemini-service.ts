/**
 * Enhanced Gemini AI Service with Learning Integration
 * Generates culturally relevant South African content with personalized learning
 * 
 * Based on Gemini prompting best practices:
 * - Clear and specific instructions
 * - Few-shot examples from user's high-performing content
 * - Structured prompting with XML tags
 * - Personalized context injection
 */

import { logger } from '@/lib/logger';
import { learningProfileService, LearningContext } from './learning-profile-service';
import { db } from '@/drizzle/db';
import { promptPatterns, generationLogs } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

interface GenerateContentParams {
  topic: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  language: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  userId?: string; // For personalized learning
}

interface GeneratedContent {
  content: string;
  hashtags: string[];
  suggestedImagePrompt?: string;
  promptVariation?: string; // Track which prompt style was used
}

export class EnhancedGeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      logger.ai.warn('GEMINI_API_KEY not found in environment variables');
    }
  }

  /**
   * Generate content with learning-enhanced prompts
   */
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    try {
      // Get learning context if userId provided
      let learningContext: LearningContext | null = null;
      if (params.userId) {
        learningContext = await learningProfileService.getLearningContext(
          params.userId, 
          params.platform
        );
      }

      // Get effective prompt patterns
      const patterns = await this.getEffectivePatterns(params.platform, params.language);

      // Build enhanced prompt with learning
      const prompt = this.buildEnhancedPrompt(params, learningContext, patterns);
      const promptVariation = this.getPromptVariation(learningContext, patterns);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

      // Log generation for learning
      if (params.userId) {
        await this.logGeneration(params, true);
      }

      const result = this.parseGeneratedContent(generatedText, params);
      result.promptVariation = promptVariation;

      return result;
    } catch (error) {
      // Log failed generation
      if (params.userId) {
        await this.logGeneration(params, false, error instanceof Error ? error.message : 'Unknown error');
      }
      logger.ai.exception(error, { topic: params.topic, platform: params.platform });
      throw error;
    }
  }

  /**
   * Build enhanced prompt with learning context and best practices
   * Uses structured XML tags as recommended by Gemini 3 prompting guidelines
   */
  private buildEnhancedPrompt(
    params: GenerateContentParams,
    learningContext: LearningContext | null,
    patterns: typeof promptPatterns.$inferSelect[]
  ): string {
    const { topic, platform, language, tone = 'friendly', includeHashtags = true, includeEmojis = true } = params;

    // Platform-specific character limits
    const platformLimits: Record<string, { limit: number; description: string }> = {
      twitter: { limit: 280, description: 'STRICTLY under 280 characters total including hashtags' },
      instagram: { limit: 2200, description: 'STRICTLY under 2000 characters to leave room for hashtags' },
      facebook: { limit: 2000, description: 'Keep it concise, around 1500-2000 characters' },
      linkedin: { limit: 3000, description: 'Professional post under 2500 characters' },
    };

    const limitInfo = platformLimits[platform] || platformLimits.instagram;
    const languageFullName = this.getLanguageFullName(language);

    // Build few-shot examples from learning context
    const fewShotExamples = this.buildFewShotExamples(learningContext, platform);
    
    // Build personalization context
    const personalizationContext = this.buildPersonalizationContext(learningContext);
    
    // Build SA context from patterns
    const saContext = this.buildSaContext(patterns, learningContext);

    // Structured prompt following Gemini 3 best practices
    const prompt = `<role>
You are a South African social media content creator specializing in authentic, culturally relevant content for small businesses and entrepreneurs in Mzansi.
</role>

<constraints>
1. CHARACTER LIMIT: ${limitInfo.limit} characters MAXIMUM - THIS IS MANDATORY
2. LANGUAGE: Write entirely in ${languageFullName} (code: ${language})
3. PLATFORM: ${platform} - optimize for this platform's audience
4. TONE: ${tone} - maintain this throughout
5. ${includeHashtags ? 'Include 3-5 relevant hashtags (counted in limit)' : 'NO hashtags'}
6. ${includeEmojis ? 'Use relevant emojis naturally' : 'NO emojis'}
</constraints>

${personalizationContext}

<sa_context>
${saContext}
</sa_context>

${fewShotExamples}

<task>
Create a ${platform} post about: "${topic}"

Requirements:
- Stay UNDER ${limitInfo.limit} characters total
- Write in ${languageFullName} with South African flair
- Make it authentic and relatable to South African audiences
- Include local references (Joburg, Cape Town, Durban, etc.)
- Use appropriate SA expressions naturally
</task>

<output_format>
Main content (with emojis if applicable)

[blank line]

Hashtags (if applicable)
</output_format>

<final_instruction>
Generate CONCISE, CULTURALLY AUTHENTIC content in ${languageFullName} now. Count your characters carefully.
</final_instruction>`;

    return prompt;
  }

  /**
   * Build few-shot examples from user's high-performing content
   */
  private buildFewShotExamples(context: LearningContext | null, platform: string): string {
    if (!context || context.recentHighPerformers.length === 0) {
      return '';
    }

    const platformExamples = context.recentHighPerformers
      .filter(ex => ex.platform === platform)
      .slice(0, 2);

    if (platformExamples.length === 0) {
      return '';
    }

    const examples = platformExamples
      .map((ex, i) => `Example ${i + 1} (Engagement Score: ${ex.engagementScore}/100):
"${ex.content}"`)
      .join('\n\n');

    return `<examples>
These are examples of your high-performing content. Use similar style and approach:

${examples}
</examples>`;
  }

  /**
   * Build personalization context from learning profile
   */
  private buildPersonalizationContext(context: LearningContext | null): string {
    if (!context) {
      return '';
    }

    const sections: string[] = [];

    if (context.industry) {
      sections.push(`Industry: ${context.industry}`);
    }

    if (context.brandVoice) {
      sections.push(`Brand Voice: ${context.brandVoice}`);
    }

    if (context.preferredTones.length > 0) {
      sections.push(`Tones that work well: ${context.preferredTones.join(', ')}`);
    }

    if (context.topTopics.length > 0) {
      sections.push(`Successful topics: ${context.topTopics.slice(0, 3).join(', ')}`);
    }

    if (context.topHashtags.length > 0) {
      sections.push(`Best hashtags: ${context.topHashtags.slice(0, 5).join(' ')}`);
    }

    if (sections.length === 0) {
      return '';
    }

    return `<personalization>
Based on your content history and audience engagement:
${sections.join('\n')}
</personalization>`;
  }

  /**
   * Build South African context from patterns and learning
   */
  private buildSaContext(
    patterns: typeof promptPatterns.$inferSelect[],
    context: LearningContext | null
  ): string {
    const sections: string[] = [];

    // Add effective SA expressions from learning
    if (context?.effectiveSaExpressions && context.effectiveSaExpressions.length > 0) {
      sections.push(`Your effective SA expressions: ${context.effectiveSaExpressions.join(', ')}`);
    }

    // Add from patterns
    for (const pattern of patterns.slice(0, 3)) {
      if (pattern.saContext) {
        const sa = pattern.saContext as { expressions?: string[]; locations?: string[]; culturalNotes?: string[] };
        if (sa.expressions?.length) {
          sections.push(`Popular expressions: ${sa.expressions.join(', ')}`);
        }
        if (sa.culturalNotes?.length) {
          sections.push(`Cultural notes: ${sa.culturalNotes.join('; ')}`);
        }
      }
    }

    // Default SA context
    sections.push(`Local references: Joburg, Cape Town, Durban, Pretoria, Soweto, Sandton`);
    sections.push(`Common expressions: howzit, lekker, sharp sharp, eish, ja nee, aweh`);
    sections.push(`Hashtags: #Mzansi #LocalIsLekker #SouthAfrica #ProudlySA`);

    return sections.join('\n');
  }

  /**
   * Get effective prompt patterns from database
   */
  private async getEffectivePatterns(platform: string, language: string) {
    return db.select()
      .from(promptPatterns)
      .where(and(
        eq(promptPatterns.platform, platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin'),
        eq(promptPatterns.isActive, true)
      ))
      .orderBy(desc(promptPatterns.effectivenessScore))
      .limit(5);
  }

  /**
   * Determine prompt variation for tracking
   */
  private getPromptVariation(
    context: LearningContext | null, 
    patterns: typeof promptPatterns.$inferSelect[]
  ): string {
    const parts: string[] = [];
    
    if (context?.recentHighPerformers && context.recentHighPerformers.length > 0) {
      parts.push('few-shot');
    }
    
    if (context?.industry) {
      parts.push('personalized');
    }
    
    if (patterns.length > 0) {
      parts.push('pattern-enhanced');
    }
    
    return parts.length > 0 ? parts.join('+') : 'base';
  }

  /**
   * Log generation for learning analytics
   */
  private async logGeneration(
    params: GenerateContentParams, 
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    if (!params.userId) return;

    try {
      await db.insert(generationLogs).values({
        userId: params.userId,
        platform: params.platform,
        topic: params.topic,
        tone: params.tone || 'friendly',
        language: params.language,
        success,
        errorMessage: errorMessage || null,
      });
    } catch (error) {
      logger.ai.exception(error, { action: 'log-generation' });
    }
  }

  /**
   * Get full language name
   */
  private getLanguageFullName(language: string): string {
    const names: Record<string, string> = {
      en: 'English',
      af: 'Afrikaans',
      zu: 'isiZulu',
      xh: 'isiXhosa',
      nso: 'Sepedi (Northern Sotho)',
      tn: 'Setswana',
      st: 'Sesotho (Southern Sotho)',
      ts: 'Xitsonga',
      ss: 'siSwati',
      ve: 'Tshivenda',
      nr: 'isiNdebele',
    };
    return names[language] || 'English';
  }

  /**
   * Parse generated content
   */
  private parseGeneratedContent(text: string, params: GenerateContentParams): GeneratedContent {
    const lines = text.trim().split('\n');
    const contentLines: string[] = [];
    const hashtags: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        const tags = trimmedLine.split(' ').filter(word => word.startsWith('#'));
        hashtags.push(...tags);
      } else if (trimmedLine) {
        contentLines.push(trimmedLine);
      }
    }

    let content = contentLines.join('\n').trim();
    const inlineHashtags = content.match(/#\w+/g) || [];
    hashtags.push(...inlineHashtags);
    const uniqueHashtags = Array.from(new Set(hashtags));

    const suggestedImagePrompt = this.generateImagePrompt(params.topic, params.platform);

    return {
      content,
      hashtags: uniqueHashtags,
      suggestedImagePrompt,
    };
  }

  /**
   * Generate image prompt
   */
  private generateImagePrompt(topic: string, platform: string): string {
    const prompts: Record<string, string> = {
      instagram: `High-quality, vibrant photo related to "${topic}". South African aesthetic, bright colors.`,
      facebook: `Engaging image related to "${topic}". Clear, eye-catching, business-appropriate.`,
      twitter: `Simple, bold image related to "${topic}". Easy to understand at a glance.`,
      linkedin: `Professional image related to "${topic}". Clean, business-appropriate.`,
    };
    return prompts[platform] || prompts.facebook;
  }

  /**
   * Submit feedback for a generation
   */
  async submitFeedback(
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
    await learningProfileService.processFeedback(userId, content, feedbackType, context);
  }

  /**
   * Trigger learning analysis for a user
   */
  async runUserLearning(userId: string): Promise<void> {
    await learningProfileService.runLearningAnalysis(userId);
  }
}

export const enhancedGeminiService = new EnhancedGeminiService();
