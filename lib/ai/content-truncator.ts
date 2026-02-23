/**
 * Intelligent Content Truncator
 * Truncates content to fit character limits while preserving meaning and hashtags
 */

import { logger } from '@/lib/logger';

interface TruncateOptions {
  maxLength: number;
  preserveHashtags?: boolean;
  ellipsis?: string;
}

/**
 * Intelligently truncate content to fit character limit
 * Preserves complete sentences and hashtags when possible
 */
export function truncateContent(
  content: string,
  options: TruncateOptions
): string {
  const { maxLength, preserveHashtags = true, ellipsis = '...' } = options;
  
  // If content already fits, return as-is
  if (content.length <= maxLength) {
    return content;
  }
  
  logger.ai.warn('Truncating over-limit content', {
    original: content.length,
    target: maxLength,
  });
  
  // Extract hashtags if we need to preserve them
  let hashtags: string[] = [];
  let mainContent = content;
  
  if (preserveHashtags) {
    const hashtagRegex = /#\w+/g;
    hashtags = content.match(hashtagRegex) || [];
    mainContent = content.replace(hashtagRegex, '').trim();
  }
  
  // Calculate space available for main content
  const hashtagsText = hashtags.length > 0 ? ' ' + hashtags.join(' ') : '';
  const availableLength = maxLength - hashtagsText.length - ellipsis.length;
  
  if (availableLength < 50) {
    // Not enough space even with truncation - fallback to hard truncate
    return content.substring(0, maxLength - ellipsis.length) + ellipsis;
  }
  
  // Try to preserve complete sentences
  const sentences = mainContent.split(/(?<=[.!?])\s+/);
  let truncated = '';
  
  for (const sentence of sentences) {
    const testContent = truncated + (truncated ? ' ' : '') + sentence;
    if ((testContent + hashtagsText + ellipsis).length <= maxLength) {
      truncated = testContent;
    } else {
      break;
    }
  }
  
  // If no complete sentences fit, do word-based truncation
  if (!truncated) {
    const words = mainContent.split(/\s+/);
    for (const word of words) {
      const testContent = truncated + (truncated ? ' ' : '') + word;
      if ((testContent + hashtagsText + ellipsis).length <= maxLength) {
        truncated = testContent;
      } else {
        break;
      }
    }
  }
  
  // Construct final truncated content
  const result = truncated + ellipsis + hashtagsText;
  
  logger.ai.info('Content truncated', {
    original: content.length,
    truncated: result.length,
    preserved: hashtags.length + ' hashtags',
  });
  
  return result.trim();
}

/**
 * Validate and auto-truncate if needed
 */
export function ensureWithinLimit(
  content: string,
  platform: string
): string {
  const limits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    facebook: 2000,
    linkedin: 3000,
  };
  
  const maxLength = limits[platform.toLowerCase()] || 2000;
  
  if (content.length > maxLength) {
    return truncateContent(content, {
      maxLength,
      preserveHashtags: true,
      ellipsis: '...',
    });
  }
  
  return content;
}
