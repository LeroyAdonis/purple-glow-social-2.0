/**
 * Google Gemini AI Service
 * Generates culturally relevant South African content
 * 
 * Reference: https://ai.google.dev/docs/prompt_best_practices
 */

import { logger } from '@/lib/logger';
import { 
  buildEnhancedPrompt, 
  buildHashtagPrompt, 
  buildTopicSuggestionPrompt,
  getGenerationConfig,
  type Tone,
  type Platform 
} from './prompt-templates';
import { getLanguageContext, getLanguageHashtags } from './sa-cultural-context';
import { validateContent, shouldRegenerate, type ValidationResult } from './content-validator';

interface GenerateContentParams {
  topic: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  language: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  targetAudience?: string;
  callToAction?: string;
}

interface GeneratedContent {
  content: string;
  hashtags: string[];
  suggestedImagePrompt?: string;
  validation?: ValidationResult;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      logger.ai.warn('GEMINI_API_KEY not found in environment variables');
    }
  }

  /**
   * Generate content for social media post using enhanced prompts
   */
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    try {
      const { 
        topic, 
        platform, 
        language, 
        tone = 'friendly', 
        includeHashtags = true, 
        includeEmojis = true,
        targetAudience,
        callToAction 
      } = params;
      
      // Build enhanced prompt using new template system
      const prompt = buildEnhancedPrompt({
        topic,
        platform: platform as Platform,
        language,
        tone: tone as Tone,
        includeHashtags,
        includeEmojis,
        targetAudience,
        callToAction,
      });
      
      // Get optimized generation config
      const genConfig = getGenerationConfig(platform as Platform, tone as Tone);
      
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
          generationConfig: genConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

      const result = this.parseGeneratedContent(generatedText, params);
      
      // Validate content quality
      const validation = validateContent(result.content, platform, language);
      result.validation = validation;
      
      // Log quality metrics
      logger.ai.info('Content generated', {
        topic,
        platform,
        language,
        qualityScore: validation.qualityScore,
        isValid: validation.isValid,
        characterCount: validation.characterCount,
      });
      
      return result;
    } catch (error) {
      logger.ai.exception(error, { topic: params.topic, platform: params.platform });
      throw error;
    }
  }

  /**
   * Generate content with automatic regeneration for low quality
   */
  async generateContentWithRetry(
    params: GenerateContentParams,
    maxRetries: number = 2
  ): Promise<GeneratedContent> {
    let lastResult: GeneratedContent | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await this.generateContent(params);
      lastResult = result;
      
      if (result.validation && !shouldRegenerate(result.validation)) {
        return result;
      }
      
      logger.ai.info('Regenerating content due to low quality', {
        attempt: attempt + 1,
        qualityScore: result.validation?.qualityScore,
      });
    }
    
    // Return last result even if quality is low
    return lastResult!;
  }

  /**
   * Legacy method - kept for backward compatibility
   * Build context-aware prompt for Gemini
   */
  private buildPrompt(params: GenerateContentParams): string {
    // Use the new enhanced prompt builder
    return buildEnhancedPrompt({
      topic: params.topic,
      platform: params.platform as Platform,
      language: params.language,
      tone: (params.tone || 'friendly') as Tone,
      includeHashtags: params.includeHashtags ?? true,
      includeEmojis: params.includeEmojis ?? true,
    });
  }

  /**
   * Get full language name for clarity in prompts
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
   * Get language-specific examples and guidance
   */
  private getLanguageExamples(language: string): string {
    const examples: Record<string, string> = {
      en: 'Use South African English with local expressions like "lekker", "sharp sharp", "howzit", "eish"',
      af: 'Use authentic Afrikaans expressions like "baie lekker", "sommer net so", "nou-nou", "ag shame"',
      zu: 'Use isiZulu greetings and expressions like "Sawubona", "Yebo", "Siyabonga", "Hhayi bo!"',
      xh: 'Use isiXhosa greetings and expressions like "Molo", "Enkosi", "Hayi khona!", "Ewe"',
      nso: 'Use Sepedi expressions like "Dumela", "Ke a leboga", "Go lokile"',
      tn: 'Use Setswana expressions like "Dumela", "Ke a leboga", "Go siame"',
      st: 'Use Sesotho expressions like "Dumela", "Kea leboha", "Ho lokile"',
      ts: 'Use Xitsonga expressions like "Avuxeni", "Inkomu", "Swi ta famba"',
      ss: 'Use siSwati expressions like "Sawubona", "Ngiyabonga", "Yebo"',
      ve: 'Use Tshivenda expressions like "Ndaa", "Ndo livhuwa", "Ndi zwavhudi"',
      nr: 'Use isiNdebele expressions like "Lotjhani", "Ngiyathokoza", "Yebo"',
    };
    return examples[language] || examples.en;
  }

  /**
   * Get language-specific context
   */
  private getLanguageContext(language: string): string {
    const contexts: Record<string, string> = {
      en: 'English - South African English with local expressions',
      af: 'Afrikaans - Use authentic Afrikaans with warmth',
      zu: 'Zulu (isiZulu) - Use respectful and cultural language',
      xh: 'Xhosa (isiXhosa) - Use respectful and cultural language',
      nso: 'Northern Sotho (Sepedi) - Use respectful language',
      tn: 'Tswana (Setswana) - Use respectful language',
      st: 'Southern Sotho (Sesotho) - Use respectful language',
      ts: 'Tsonga (Xitsonga) - Use respectful language',
      ss: 'Swati (siSwati) - Use respectful language',
      ve: 'Venda (Tshivenda) - Use respectful language',
      nr: 'Ndebele (isiNdebele) - Use respectful language',
    };

    return contexts[language] || 'English';
  }

  /**
   * Parse generated content and extract hashtags
   */
  private parseGeneratedContent(text: string, params: GenerateContentParams): GeneratedContent {
    // Split content and hashtags
    const lines = text.trim().split('\n');
    const contentLines: string[] = [];
    const hashtags: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Lines starting with # are hashtags
      if (trimmedLine.startsWith('#')) {
        const tags = trimmedLine.split(' ').filter(word => word.startsWith('#'));
        hashtags.push(...tags);
      } else if (trimmedLine) {
        contentLines.push(trimmedLine);
      }
    }

    let content = contentLines.join('\n').trim();

    // Extract inline hashtags if any
    const inlineHashtags = content.match(/#\w+/g) || [];
    hashtags.push(...inlineHashtags);

    // Remove duplicate hashtags
    const uniqueHashtags = Array.from(new Set(hashtags));

    // Generate image prompt based on topic
    const suggestedImagePrompt = this.generateImagePrompt(params.topic, params.platform);

    return {
      content,
      hashtags: uniqueHashtags,
      suggestedImagePrompt,
    };
  }

  /**
   * Generate image prompt suggestion
   */
  private generateImagePrompt(topic: string, platform: string): string {
    const prompts: Record<string, string> = {
      instagram: `High-quality, vibrant photo related to "${topic}". South African aesthetic, bright colors, professional photography.`,
      facebook: `Engaging image related to "${topic}". Clear, eye-catching, suitable for business use.`,
      twitter: `Simple, bold image related to "${topic}". Easy to understand at a glance.`,
      linkedin: `Professional image related to "${topic}". Clean, business-appropriate, high-quality.`,
    };

    return prompts[platform] || prompts.facebook;
  }

  /**
   * Generate multiple content variations
   */
  async generateVariations(params: GenerateContentParams, count: number = 3): Promise<GeneratedContent[]> {
    const variations: GeneratedContent[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const content = await this.generateContent(params);
        variations.push(content);
        
        // Small delay to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.ai.exception(error, { variation: i + 1 });
      }
    }

    return variations;
  }

  /**
   * Generate hashtag suggestions for a topic using enhanced prompts
   */
  async generateHashtags(topic: string, language: string = 'en', count: number = 10): Promise<string[]> {
    try {
      // Use the new hashtag prompt builder
      const prompt = buildHashtagPrompt(topic, language, count);
      
      // Get language-specific hashtags to mix in
      const langHashtags = getLanguageHashtags(language);

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
            temperature: 0.8,
            maxOutputTokens: 256,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hashtags');
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // Extract hashtags
      const generatedHashtags: string[] = text.match(/#\w+/g) || [];
      
      // Combine with language-specific hashtags
      const allHashtags = [...generatedHashtags, ...langHashtags];
      return Array.from(new Set(allHashtags)).slice(0, count);
    } catch (error) {
      logger.ai.exception(error, { action: 'hashtag-generation', topic });
      return [];
    }
  }

  /**
   * Get content suggestions based on current trends using enhanced prompts
   */
  async getTopicSuggestions(industry: string, language: string = 'en'): Promise<string[]> {
    try {
      // Use the new topic suggestion prompt builder
      const prompt = buildTopicSuggestionPrompt(industry, language);

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
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate topic suggestions');
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // Extract topics from numbered list
      const topics = text
        .split('\n')
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
      
      return topics;
    } catch (error) {
      logger.ai.exception(error, { action: 'topic-suggestions', industry });
      return [];
    }
  }
}
