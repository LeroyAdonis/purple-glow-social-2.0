/**
 * Puter.js AI Service
 * Client-side AI generation for text and images using Puter.js
 * 
 * Reference: https://docs.puter.com/
 */

'use client';

import {
  buildEnhancedPrompt,
  type Platform,
  type Tone,
} from './prompt-templates';
import { validateContent, shouldRegenerate, type ValidationResult } from './content-validator';
import { ensureWithinLimit } from './content-truncator';

interface GenerateContentParams {
  topic: string;
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin';
  language: string;
  tone: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

interface GeneratedContent {
  content: string;
  hashtags: string[];
  imageUrl?: string;
}

// Default model configurations
const DEFAULT_TEXT_MODEL = 'google/gemini-2.5-flash';
const DEFAULT_IMAGE_MODEL = 'dall-e-3';
const FALLBACK_IMAGE_MODEL = 'gemini-2.5-flash-image-preview';

// Timeout durations
const TEXT_GENERATION_TIMEOUT_MS = 30_000; // 30 seconds
const IMAGE_GENERATION_TIMEOUT_MS = 60_000; // 60 seconds

/**
 * Wrap a promise with a timeout to prevent indefinite hangs.
 * Puter.js can hang forever on auth/rate-limit errors (known bug #2410).
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(
        `${label} timed out after ${ms / 1000}s. This can happen when Puter authentication didn't complete. Please reload the page and try again.`
      )), ms)
    ),
  ]);
}

/**
 * Check if Puter.js is available in the browser
 */
export function isPuterAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.puter !== 'undefined';
}

/**
 * Ensure the user is authenticated with Puter before making API calls.
 * Must be called from a user-initiated action (click handler) so the
 * browser allows the popup.
 */
export async function ensurePuterAuth(): Promise<boolean> {
  if (!isPuterAvailable()) return false;
  try {
    const user = await withTimeout(
      window.puter!.auth.signIn(),
      TEXT_GENERATION_TIMEOUT_MS,
      'Puter authentication'
    );
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Parse Puter.js chat response
 * Handles both string and object response formats
 */
function parsePuterResponse(response: string | { message: { content: string } }): string {
  if (typeof response === 'string') {
    return response;
  }
  if (response && typeof response === 'object' && response.message && response.message.content) {
    return response.message.content;
  }
  throw new Error('Invalid Puter.js response format');
}

/**
 * Parse generated content and extract hashtags
 * Extracted from GeminiService for client-side use
 */
function parseGeneratedContent(text: string): { content: string; hashtags: string[] } {
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

  return {
    content,
    hashtags: uniqueHashtags,
  };
}

/**
 * Generate content using Puter.js with retry logic
 * Similar to GeminiService.generateContentWithRetry
 */
async function generateContentWithRetry(
  params: GenerateContentParams,
  maxRetries: number = 3
): Promise<{ content: string; hashtags: string[]; validation?: ValidationResult }> {
  if (!isPuterAvailable()) {
    throw new Error('Puter.js is not available. Please ensure the script is loaded.');
  }

  let lastResult: { content: string; hashtags: string[]; validation?: ValidationResult } | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Map tone string to Tone type
    let tone: Tone = 'friendly';
    if (params.tone.includes('Professional')) tone = 'professional';
    else if (params.tone.includes('Cool') || params.tone.includes('Slang')) tone = 'casual';
    else if (params.tone.includes('Bold') || params.tone.includes('Energy')) tone = 'energetic';

    // Build enhanced prompt using shared template system
    const prompt = buildEnhancedPrompt({
      topic: params.topic,
      platform: params.platform as Platform,
      language: params.language,
      tone,
      includeHashtags: params.includeHashtags ?? true,
      includeEmojis: params.includeEmojis ?? true,
    });

    try {
      const response = await withTimeout(
        window.puter!.ai.chat(prompt, {
          model: DEFAULT_TEXT_MODEL,
        }),
        TEXT_GENERATION_TIMEOUT_MS,
        'AI text generation'
      );

      const generatedText = parsePuterResponse(response);
      const parsed = parseGeneratedContent(generatedText);
      
      // Validate content quality
      const validation = validateContent(parsed.content, params.platform, params.language);
      lastResult = {
        ...parsed,
        validation,
      };
      
      // Check if we need to regenerate
      if (!shouldRegenerate(validation)) {
        console.info('Puter.js: Content accepted', {
          attempt: attempt + 1,
          qualityScore: validation.qualityScore,
          characterCount: validation.characterCount,
        });
        return lastResult;
      }
      
      // Log why we're regenerating
      console.warn('Puter.js: Regenerating content', {
        attempt: attempt + 1,
        reason: !validation.withinLimit ? 'OVER_LIMIT' : 'LOW_QUALITY',
        characterCount: validation.characterCount,
        qualityScore: validation.qualityScore,
        issues: validation.issues,
      });
    } catch (error) {
      console.error('Puter.js generation error:', error);
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  
  // STRICT ENFORCEMENT: If still over-limit after retries, use emergency truncation
  if (lastResult?.validation && !lastResult.validation.withinLimit) {
    console.error('Puter.js: Content still over-limit after max retries - applying truncation', {
      characterCount: lastResult.validation.characterCount,
      platform: params.platform,
    });
    
    const truncated = ensureWithinLimit(lastResult.content, params.platform);
    const truncatedValidation = validateContent(truncated, params.platform, params.language);
    
    return {
      content: truncated,
      hashtags: lastResult.hashtags,
      validation: truncatedValidation,
    };
  }
  
  // Return last result if quality is low but within limits
  if (lastResult) {
    console.warn('Puter.js: Max retries reached, returning last result', {
      characterCount: lastResult.validation?.characterCount,
      qualityScore: lastResult.validation?.qualityScore,
    });
    return lastResult;
  }
  
  throw new Error('Failed to generate content after all retries');
}

/**
 * Generate image using Puter.js Nano Banana
 * @param prompt - Image description prompt
 * @returns Data URL string or null if generation fails
 */
export async function generateImageWithPuter(prompt: string): Promise<string | null> {
  if (!isPuterAvailable()) {
    console.warn('Puter.js is not available for image generation');
    return null;
  }

  const models = [DEFAULT_IMAGE_MODEL, FALLBACK_IMAGE_MODEL];

  for (const model of models) {
    try {
      console.info('Puter.js: Generating image...', { prompt, model });

      const image = await withTimeout(
        window.puter!.ai.txt2img(prompt, { model }),
        IMAGE_GENERATION_TIMEOUT_MS,
        'AI image generation'
      );

      if (image && image.src) {
        console.info('Puter.js: Image generated successfully', { model });
        return image.src;
      }

      console.warn('Puter.js: Image generation returned no src', { model });
    } catch (error) {
      console.warn(`Puter.js: Image generation failed with model ${model}`, error);
    }
  }

  console.error('Puter.js: All image models failed');
  return null;
}

/**
 * Generate image prompt based on topic and platform
 * Extracted from GeminiService for reuse
 */
function generateImagePrompt(topic: string, platform: string): string {
  const prompts: Record<string, string> = {
    instagram: `High-quality, vibrant photo related to "${topic}". South African aesthetic, bright colors, professional photography.`,
    facebook: `Engaging image related to "${topic}". Clear, eye-catching, suitable for business use.`,
    twitter: `Simple, bold image related to "${topic}". Easy to understand at a glance.`,
    linkedin: `Professional image related to "${topic}". Clean, business-appropriate, high-quality.`,
  };

  return prompts[platform] ?? prompts.facebook!;
}

/**
 * Main function: Generate content with Puter.js (text + optional image)
 */
export async function generateWithPuter(params: {
  topic: string;
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin';
  language: string;
  tone: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}): Promise<{ content: string; hashtags: string[]; imageUrl?: string }> {
  // Generate text content with retry logic
  const textResult = await generateContentWithRetry(params, 3);
  
  // Apply final safety truncation as absolute fallback
  const finalContent = ensureWithinLimit(textResult.content, params.platform);

  // Generate image (non-blocking - continue without image if it fails)
  let imageUrl: string | undefined;
  try {
    const imagePrompt = generateImagePrompt(params.topic, params.platform);
    const dataUrl = await generateImageWithPuter(imagePrompt);
    if (dataUrl) {
      imageUrl = dataUrl;
    }
  } catch (imgError) {
    console.warn('Puter.js: Image generation error (non-critical)', imgError);
  }

  return {
    content: finalContent,
    hashtags: textResult.hashtags,
    imageUrl,
  };
}
