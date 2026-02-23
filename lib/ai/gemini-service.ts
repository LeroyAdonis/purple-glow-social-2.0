/**
 * Google Gemini AI Service
 * Generates culturally relevant South African content
 * 
 * Reference: https://ai.google.dev/docs/prompt_best_practices
 */

import { logger } from '@/lib/logger';

/**
 * Timeout helper for AI API calls
 * Wraps a promise with a timeout to prevent hanging requests
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}
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
      
      const response = await withTimeout(
        fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
        }),
        30000 // 30 second timeout
      );

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
   * Generate content with automatic regeneration for low quality or over-limit posts
   */
  async generateContentWithRetry(
    params: GenerateContentParams,
    maxRetries: number = 3
  ): Promise<GeneratedContent> {
    let lastResult: GeneratedContent | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await this.generateContent(params);
      lastResult = result;
      
      // Check if we need to regenerate
      if (result.validation && !shouldRegenerate(result.validation)) {
        logger.ai.info('Content accepted', {
          attempt: attempt + 1,
          qualityScore: result.validation.qualityScore,
          characterCount: result.validation.characterCount,
        });
        return result;
      }
      
      // Log why we're regenerating
      if (result.validation) {
        logger.ai.warn('Regenerating content', {
          attempt: attempt + 1,
          reason: !result.validation.withinLimit ? 'OVER_LIMIT' : 'LOW_QUALITY',
          characterCount: result.validation.characterCount,
          qualityScore: result.validation.qualityScore,
          issues: result.validation.issues,
        });
      }
    }
    
    // STRICT ENFORCEMENT: If still over-limit after retries, regenerate with emergency fallback
    if (lastResult?.validation && !lastResult.validation.withinLimit) {
      logger.ai.error('Content still over-limit after max retries - using emergency short generation', {
        characterCount: lastResult.validation.characterCount,
        platform: params.platform,
      });
      
      // Emergency regeneration with ultra-short constraints
      return await this.generateEmergencyShortContent(params);
    }
    
    // Return last result if quality is low but within limits
    logger.ai.warn('Max retries reached, returning last result (within limits but low quality)', {
      characterCount: lastResult?.validation?.characterCount,
      qualityScore: lastResult?.validation?.qualityScore,
    });
    return lastResult!;
  }
  
  /**
   * Emergency fallback for over-limit content
   * Generates extremely concise content guaranteed to fit
   */
  private async generateEmergencyShortContent(
    params: GenerateContentParams
  ): Promise<GeneratedContent> {
    const platformLimits: Record<string, number> = {
      twitter: 280,
      instagram: 2200,
      facebook: 2000,
      linkedin: 3000,
    };
    
    const limit = platformLimits[params.platform] || 280;
    const targetLength = Math.floor(limit * 0.8); // Aim for 80% of limit
    
    logger.ai.info('Emergency short generation', {
      platform: params.platform,
      targetLength,
      hardLimit: limit,
    });
    
    // Ultra-concise prompt
    const emergencyPrompt = `Generate a VERY SHORT ${params.platform} post about "${params.topic}" in ${params.language}.

CRITICAL CONSTRAINT: Maximum ${targetLength} characters total (including hashtags and emojis).

ULTRA-CONCISE REQUIREMENTS:
- Single sentence or two short sentences maximum
- ${params.includeHashtags ? '1-2 hashtags only' : 'No hashtags'}
- ${params.includeEmojis ? '1-2 emojis maximum' : 'No emojis'}
- Direct and punchy message
- Professional ${params.tone || 'friendly'} tone

Target length: ${targetLength} characters
Hard limit: ${limit} characters

Generate ONLY the post text, nothing else:`;
    
    try {
      const response = await this.callGeminiAPI(emergencyPrompt);
      const content = response.trim();
      
      // Validate emergency content
      const validation = validateContent(content, params.platform, params.language);
      
      // Extract hashtags if present
      const hashtagMatches = content.match(/#\w+/g);
      const hashtags = hashtagMatches || [];
      
      if (!validation.withinLimit) {
        // Last resort: hard truncate with intelligent boundary
        logger.ai.error('Emergency content still over-limit - hard truncating', {
          length: content.length,
          limit,
        });
        
        const truncated = this.intelligentTruncate(content, limit);
        const truncatedValidation = validateContent(truncated, params.platform, params.language);
        
        return {
          content: truncated,
          hashtags,
          validation: truncatedValidation,
        };
      }
      
      return {
        content,
        hashtags,
        validation,
      };
    } catch (error) {
      logger.ai.error('Emergency generation failed', { error });
      throw new Error('Failed to generate compliant content after all retry strategies');
    }
  }
  
  /**
   * Intelligent truncation that preserves meaning
   * Only used as absolute last resort
   */
  private intelligentTruncate(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    
    // Extract and preserve hashtags
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex) || [];
    const mainContent = content.replace(hashtagRegex, '').trim();
    
    // Calculate available space for main content
    const hashtagText = hashtags.length > 0 ? ' ' + hashtags.slice(0, 2).join(' ') : '';
    const ellipsis = '...';
    const available = maxLength - hashtagText.length - ellipsis.length - 1;
    
    if (available < 50) {
      // Not enough space for meaningful content
      return content.substring(0, maxLength - 3) + '...';
    }
    
    // Try to preserve complete sentences
    const sentences = mainContent.split(/(?<=[.!?])\s+/);
    let truncated = '';
    
    for (const sentence of sentences) {
      const test = truncated + (truncated ? ' ' : '') + sentence;
      if (test.length <= available) {
        truncated = test;
      } else {
        break;
      }
    }
    
    // If no complete sentences fit, truncate at word boundary
    if (!truncated && mainContent.length > available) {
      const words = mainContent.split(/\s+/);
      for (const word of words) {
        const test = truncated + (truncated ? ' ' : '') + word;
        if (test.length <= available) {
          truncated = test;
        } else {
          break;
        }
      }
    }
    
    return (truncated || mainContent.substring(0, available)) + ellipsis + hashtagText;
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
    return examples[language] ?? examples.en!;
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

    return prompts[platform] ?? prompts.facebook!;
  }

  /**
   * Raw API call to Gemini (extracted for reuse)
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const response = await withTimeout(
      fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
        }),
      }),
      30000 // 30 second timeout
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
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

      const response = await withTimeout(
        fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
        }),
        30000 // 30 second timeout
      );

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

      const response = await withTimeout(
        fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
        }),
        30000 // 30 second timeout
      );

      if (!response.ok) {
        throw new Error('Failed to generate topic suggestions');
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // Extract topics from numbered list
      const topics = text
        .split('\n')
        .filter((line: string) => line.match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
      
      return topics;
    } catch (error) {
      logger.ai.exception(error, { action: 'topic-suggestions', industry });
      return [];
    }
  }
}
