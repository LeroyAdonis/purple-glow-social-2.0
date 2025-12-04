/**
 * Content Quality Validator
 * Validates AI-generated content for quality, character limits, and language correctness
 * 
 * South African context: Validates content includes appropriate SA expressions
 */

import { logger } from '@/lib/logger';

// Platform character limits
const PLATFORM_LIMITS: Record<string, { min: number; max: number; optimal: { min: number; max: number } }> = {
  twitter: { min: 10, max: 280, optimal: { min: 70, max: 200 } },
  instagram: { min: 10, max: 2200, optimal: { min: 125, max: 1000 } },
  facebook: { min: 10, max: 63206, optimal: { min: 40, max: 500 } },
  linkedin: { min: 10, max: 3000, optimal: { min: 50, max: 700 } },
};

// South African language indicators
const SA_LANGUAGE_INDICATORS: Record<string, string[]> = {
  en: ['lekker', 'sharp', 'howzit', 'eish', 'mzansi', 'braai', 'ubuntu', 'bru', 'ja'],
  af: ['baie', 'lekker', 'nou', 'sommer', 'ag', 'nee', 'ja', 'dankie', 'asseblief'],
  zu: ['sawubona', 'yebo', 'ngiyabonga', 'siyabonga', 'impela', 'kakhulu', 'mina', 'wena'],
  xh: ['molo', 'enkosi', 'ewe', 'hayi', 'mnandi', 'kakhulu', 'ndiyabulela'],
  nso: ['dumela', 'leboga', 'lokile', 'thata', 'bj', 'ke'],
  tn: ['dumela', 'leboga', 'siame', 'thata', 'rra', 'mma'],
  st: ['dumela', 'leboha', 'lokile', 'haholo', 'ntate', 'mme'],
  ts: ['avuxeni', 'inkomu', 'ndza', 'swinene', 'tata', 'manana'],
  ss: ['sawubona', 'ngiyabonga', 'yebo', 'kakhulu', 'babe', 'make'],
  ve: ['ndaa', 'livhuwa', 'zwavhudi', 'vhukuma', 'khotsi', 'mme'],
  nr: ['lotjhani', 'ngiyathokoza', 'yebo', 'khulu', 'baba', 'mama'],
};

// Quality scoring factors
interface QualityFactors {
  hasCallToAction: boolean;
  hasEmojis: boolean;
  hasHashtags: boolean;
  hasSAContext: boolean;
  characterOptimal: boolean;
  hasQuestions: boolean;
  readabilityScore: number;
}

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number; // 0-100
  characterCount: number;
  withinLimit: boolean;
  isOptimalLength: boolean;
  hasSALanguageMarkers: boolean;
  issues: string[];
  suggestions: string[];
  factors: QualityFactors;
}

/**
 * Validate generated content for quality and constraints
 */
export function validateContent(
  content: string,
  platform: string,
  language: string = 'en'
): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Get platform limits
  const limits = PLATFORM_LIMITS[platform.toLowerCase()] || PLATFORM_LIMITS.facebook;
  const characterCount = content.length;
  
  // Check character limits
  const withinLimit = characterCount <= limits.max;
  const isOptimalLength = characterCount >= limits.optimal.min && characterCount <= limits.optimal.max;
  
  if (!withinLimit) {
    issues.push(`Content exceeds ${platform} character limit (${characterCount}/${limits.max})`);
  }
  
  if (characterCount < limits.min) {
    issues.push(`Content is too short (minimum ${limits.min} characters)`);
  }
  
  if (!isOptimalLength && withinLimit && characterCount >= limits.min) {
    if (characterCount < limits.optimal.min) {
      suggestions.push(`Consider expanding content for better engagement (optimal: ${limits.optimal.min}+ characters)`);
    } else if (characterCount > limits.optimal.max) {
      suggestions.push(`Consider condensing for better readability (optimal: ${limits.optimal.max} characters max)`);
    }
  }
  
  // Check for SA language markers
  const languageMarkers = SA_LANGUAGE_INDICATORS[language] || SA_LANGUAGE_INDICATORS.en;
  const contentLower = content.toLowerCase();
  const hasSALanguageMarkers = languageMarkers.some(marker => 
    contentLower.includes(marker.toLowerCase())
  );
  
  if (!hasSALanguageMarkers && language !== 'en') {
    suggestions.push(`Consider adding authentic ${getLanguageName(language)} expressions`);
  }
  
  // Quality factors
  const hasCallToAction = detectCallToAction(content);
  const hasEmojis = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
  const hasHashtags = content.includes('#');
  const hasQuestions = content.includes('?');
  const readabilityScore = calculateReadability(content);
  
  // Build quality factors
  const factors: QualityFactors = {
    hasCallToAction,
    hasEmojis,
    hasHashtags,
    hasSAContext: hasSALanguageMarkers,
    characterOptimal: isOptimalLength,
    hasQuestions,
    readabilityScore,
  };
  
  // Calculate quality score (0-100)
  const qualityScore = calculateQualityScore(factors, platform);
  
  // Add engagement suggestions
  if (!hasCallToAction) {
    suggestions.push('Add a call-to-action to boost engagement');
  }
  
  if (!hasEmojis && platform !== 'linkedin') {
    suggestions.push('Consider adding relevant emojis for visual appeal');
  }
  
  if (!hasHashtags && (platform === 'instagram' || platform === 'twitter')) {
    suggestions.push('Add relevant hashtags for discoverability');
  }
  
  if (!hasQuestions && platform !== 'linkedin') {
    suggestions.push('Consider adding a question to encourage comments');
  }
  
  // Determine validity
  const isValid = withinLimit && 
                  characterCount >= limits.min && 
                  qualityScore >= 40;
  
  return {
    isValid,
    qualityScore,
    characterCount,
    withinLimit,
    isOptimalLength,
    hasSALanguageMarkers,
    issues,
    suggestions,
    factors,
  };
}

/**
 * Detect call-to-action phrases
 */
function detectCallToAction(content: string): boolean {
  const ctaPhrases = [
    // English CTAs
    'click', 'tap', 'visit', 'shop now', 'learn more', 'sign up', 'subscribe',
    'follow', 'like', 'share', 'comment', 'dm', 'message', 'contact',
    'check out', 'discover', 'explore', 'get yours', 'order now',
    'link in bio', 'swipe up', 'see more', 'read more',
    // SA expressions
    'come check', 'pop by', 'give us a shout', 'drop us a line',
    'let us know', 'tell us', 'what do you think',
  ];
  
  const contentLower = content.toLowerCase();
  return ctaPhrases.some(cta => contentLower.includes(cta));
}

/**
 * Calculate simple readability score (0-100)
 */
function calculateReadability(content: string): number {
  // Count sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 50;
  
  // Count words
  const words = content.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 50;
  
  // Average sentence length (ideal: 15-20 words)
  const avgSentenceLength = words.length / sentences.length;
  
  // Penalize very long or very short sentences
  let score = 100;
  if (avgSentenceLength > 25) {
    score -= (avgSentenceLength - 25) * 3;
  } else if (avgSentenceLength < 8) {
    score -= (8 - avgSentenceLength) * 5;
  }
  
  // Penalize very short content
  if (words.length < 10) {
    score -= (10 - words.length) * 2;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate overall quality score
 */
function calculateQualityScore(factors: QualityFactors, platform: string): number {
  let score = 50; // Base score
  
  // Platform-specific weights
  const weights = getPlatformWeights(platform);
  
  // Add points for quality factors
  if (factors.hasCallToAction) score += weights.cta;
  if (factors.hasEmojis) score += weights.emoji;
  if (factors.hasHashtags) score += weights.hashtag;
  if (factors.hasSAContext) score += weights.saContext;
  if (factors.characterOptimal) score += weights.optimal;
  if (factors.hasQuestions) score += weights.question;
  
  // Add readability factor
  score += (factors.readabilityScore - 50) * 0.2;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get platform-specific scoring weights
 */
function getPlatformWeights(platform: string): Record<string, number> {
  const weights: Record<string, Record<string, number>> = {
    instagram: { cta: 10, emoji: 8, hashtag: 12, saContext: 8, optimal: 6, question: 6 },
    twitter: { cta: 8, emoji: 5, hashtag: 10, saContext: 10, optimal: 8, question: 9 },
    facebook: { cta: 10, emoji: 6, hashtag: 5, saContext: 8, optimal: 8, question: 10 },
    linkedin: { cta: 12, emoji: 2, hashtag: 6, saContext: 6, optimal: 10, question: 8 },
  };
  
  return weights[platform.toLowerCase()] || weights.facebook;
}

/**
 * Get full language name
 */
function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    af: 'Afrikaans',
    zu: 'isiZulu',
    xh: 'isiXhosa',
    nso: 'Sepedi',
    tn: 'Setswana',
    st: 'Sesotho',
    ts: 'Xitsonga',
    ss: 'siSwati',
    ve: 'Tshivenda',
    nr: 'isiNdebele',
  };
  return names[code] || 'English';
}

/**
 * Detect language of content (basic detection)
 */
export function detectLanguage(content: string): { detected: string; confidence: number } {
  const contentLower = content.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Check each language's markers
  for (const [lang, markers] of Object.entries(SA_LANGUAGE_INDICATORS)) {
    scores[lang] = 0;
    for (const marker of markers) {
      if (contentLower.includes(marker.toLowerCase())) {
        scores[lang] += 1;
      }
    }
  }
  
  // Find highest scoring language
  const maxScore = Math.max(...Object.values(scores));
  const detected = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'en';
  
  // Calculate confidence (0-100)
  const totalMarkers = SA_LANGUAGE_INDICATORS[detected]?.length || 1;
  const confidence = Math.min(100, (scores[detected] / totalMarkers) * 100);
  
  return { detected, confidence };
}

/**
 * Check if content should be regenerated based on quality
 */
export function shouldRegenerate(validation: ValidationResult): boolean {
  // Regenerate if invalid or very low quality
  if (!validation.isValid) return true;
  if (validation.qualityScore < 30) return true;
  if (validation.issues.length > 2) return true;
  
  return false;
}

/**
 * Get content improvement recommendations
 */
export function getImprovementRecommendations(validation: ValidationResult, platform: string): string[] {
  const recommendations: string[] = [...validation.suggestions];
  
  // Add platform-specific recommendations
  if (platform === 'instagram' && !validation.factors.hasHashtags) {
    recommendations.push('Instagram posts with 9-11 hashtags get highest engagement');
  }
  
  if (platform === 'twitter' && validation.characterCount > 250) {
    recommendations.push('Shorter tweets (70-100 characters) often get more retweets');
  }
  
  if (platform === 'linkedin' && !validation.factors.hasCallToAction) {
    recommendations.push('LinkedIn posts with questions get 50% more comments');
  }
  
  if (!validation.factors.hasSAContext) {
    recommendations.push('Add South African expressions to connect with local audiences');
  }
  
  return recommendations;
}

logger.ai.info('Content validator initialized');
