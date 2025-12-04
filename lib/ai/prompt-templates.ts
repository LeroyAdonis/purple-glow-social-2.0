/**
 * AI Prompt Templates
 * Structured prompt templates with few-shot examples for each SA language
 * 
 * Reference: https://ai.google.dev/docs/prompt_best_practices
 */

import { getLanguageContext, SA_LANGUAGE_CONTEXTS, type LanguageContext } from './sa-cultural-context';

export type Tone = 'professional' | 'casual' | 'friendly' | 'energetic';
export type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

export interface PromptConfig {
  topic: string;
  platform: Platform;
  language: string;
  tone: Tone;
  includeHashtags: boolean;
  includeEmojis: boolean;
  targetAudience?: string;
  callToAction?: string;
}

/**
 * Platform-specific character limits and formatting rules
 */
export const PLATFORM_SPECS: Record<Platform, {
  charLimit: number;
  hashtagLimit: number;
  emojiStyle: 'liberal' | 'moderate' | 'minimal';
  formatHints: string;
}> = {
  twitter: {
    charLimit: 280,
    hashtagLimit: 3,
    emojiStyle: 'moderate',
    formatHints: 'Keep it punchy and engaging. Thread if needed. End with clear CTA.',
  },
  instagram: {
    charLimit: 2200,
    hashtagLimit: 30,
    emojiStyle: 'liberal',
    formatHints: 'Use line breaks for readability. First line is crucial. Hashtags at end.',
  },
  facebook: {
    charLimit: 2000,
    hashtagLimit: 5,
    emojiStyle: 'moderate',
    formatHints: 'Conversational tone. Ask questions to boost engagement. Tag if relevant.',
  },
  linkedin: {
    charLimit: 3000,
    hashtagLimit: 5,
    emojiStyle: 'minimal',
    formatHints: 'Professional but personable. Use formatting for readability. Share insights.',
  },
};

/**
 * Tone-specific instructions
 */
export const TONE_INSTRUCTIONS: Record<Tone, {
  description: string;
  wordChoices: string[];
  avoid: string[];
}> = {
  professional: {
    description: 'Polished, credible, and business-appropriate',
    wordChoices: ['expertise', 'solution', 'opportunity', 'growth', 'results', 'impact'],
    avoid: ['slang (unless SA-specific)', 'overly casual language', 'excessive emojis'],
  },
  casual: {
    description: 'Relaxed, conversational, and approachable',
    wordChoices: ['check out', 'love', 'awesome', 'cool', 'great', 'vibes'],
    avoid: ['formal business jargon', 'stiff language', 'complex sentences'],
  },
  friendly: {
    description: 'Warm, welcoming, and personable',
    wordChoices: ['welcome', 'together', 'join', 'share', 'community', 'family'],
    avoid: ['cold or distant tone', 'impersonal language', 'aggressive CTAs'],
  },
  energetic: {
    description: 'Exciting, dynamic, and action-oriented',
    wordChoices: ['amazing', 'incredible', 'don\'t miss', 'hurry', 'exclusive', 'wow'],
    avoid: ['dull language', 'passive voice', 'low-energy words'],
  },
};

/**
 * Few-shot examples for each language
 */
export const LANGUAGE_EXAMPLES: Record<string, {
  topic: string;
  output: string;
  platform: Platform;
}[]> = {
  en: [
    {
      topic: 'Weekend sale promotion',
      platform: 'instagram',
      output: `🔥 Howzit Mzansi! This weekend is going to be LEKKER! 

We're dropping prices like it's hot - up to 50% OFF everything in store! 

From Joburg to Cape Town, from Durban to Pretoria - we've got you covered, fam! 

Don't sleep on this one, come through and grab the deals before they're gone! 

Sharp sharp! 🇿🇦

#LocalIsLekker #MzansiDeals #WeekendSale #SouthAfrica #ShopLocal`,
    },
    {
      topic: 'New product launch',
      platform: 'twitter',
      output: `Eish! 🚀 Something BIG is coming to Mzansi! 

Our new product drops tomorrow and trust us, it's going to be LEKKER! 

RT if you're ready! #NewDrop #Mzansi #ProudlySA`,
    },
  ],
  af: [
    {
      topic: 'Restaurant special',
      platform: 'facebook',
      output: `Goeie môre, Suid-Afrika! ☀️

Hierdie naweek by ons restaurant - 'n BAIE LEKKER aanbieding wat jy nie wil mis nie!

🍽️ Koop een, kry een GRATIS op alle hoofgeregte
🍷 R50 af op enige bottel wyn

Bring die gesin, bring die vriende - ons wag vir julle!

Totsiens en lekker eet! 🇿🇦

#AfrikaansEet #LekkerKos #Suid-Afrika`,
    },
  ],
  zu: [
    {
      topic: 'Community event',
      platform: 'facebook',
      output: `Sawubona Mzansi! 🇿🇦

Siyanimema nonke emcimbini wethu omkhulu ngoMgqibelo!

📍 Durban Beachfront
🕐 Kusukela ngo-10 ekuseni
🎶 Umculo, ukudla, nobungane!

Woza uzojabulela nathi - sonke sihlangene!

Siyabonga, sobonana khona! 

Halala! ✨

#isiZulu #Durban #Ubuntu #Mzansi`,
    },
  ],
  xh: [
    {
      topic: 'Business anniversary',
      platform: 'instagram',
      output: `Molweni bantu bakuthi! 🎉

Namhlanje sibhiyozela iminyaka eli-5 sisebenza nani!

Enkosi kakhulu ngothando nenkxaso yenu - aniyeke ukuba yinxalenye yohambo lwethu! 

Eli phulo liyi-50% kususa yonke into! 

Masithi siyabulela! Camagu! 🇿🇦

#isiXhosa #EasternCape #ShopLocal #Ubuntu`,
    },
  ],
};

/**
 * Build a comprehensive prompt for content generation
 */
export function buildEnhancedPrompt(config: PromptConfig): string {
  const {
    topic,
    platform,
    language,
    tone,
    includeHashtags,
    includeEmojis,
    targetAudience,
    callToAction,
  } = config;

  const langContext = getLanguageContext(language);
  const platformSpec = PLATFORM_SPECS[platform];
  const toneSpec = TONE_INSTRUCTIONS[tone];
  const examples = LANGUAGE_EXAMPLES[language] || LANGUAGE_EXAMPLES.en;

  // Find a relevant example
  const relevantExample = examples.find(ex => ex.platform === platform) || examples[0];

  const prompt = `You are an expert South African social media content creator specializing in ${langContext.name} (${langContext.nativeName}) content.

═══════════════════════════════════════════════════════════════
                    CONTENT REQUIREMENTS
═══════════════════════════════════════════════════════════════

📱 PLATFORM: ${platform.toUpperCase()}
   Character Limit: ${platformSpec.charLimit} (STRICT - do not exceed!)
   Hashtag Limit: ${platformSpec.hashtagLimit}
   Format: ${platformSpec.formatHints}

🌍 LANGUAGE: ${langContext.name} (${langContext.nativeName})
   ${language !== 'en' ? `⚠️ CRITICAL: Write the ENTIRE post in ${langContext.nativeName}. Only use English for hashtags, brand names, or widely understood terms.` : 'Write in South African English with authentic local expressions.'}

📝 TOPIC: ${topic}
${targetAudience ? `👥 TARGET AUDIENCE: ${targetAudience}` : ''}
${callToAction ? `🎯 CALL TO ACTION: ${callToAction}` : ''}

🎭 TONE: ${tone.toUpperCase()}
   ${toneSpec.description}
   Use words like: ${toneSpec.wordChoices.join(', ')}
   Avoid: ${toneSpec.avoid.join(', ')}

═══════════════════════════════════════════════════════════════
                    CULTURAL CONTEXT
═══════════════════════════════════════════════════════════════

📍 REGIONS TO REFERENCE: ${langContext.regions.slice(0, 3).join(', ')}

💬 AUTHENTIC EXPRESSIONS TO USE:
   Greetings: ${langContext.greetings.slice(0, 3).join(', ')}
   Expressions: ${langContext.commonExpressions.slice(0, 5).join(', ')}
   Farewells: ${langContext.farewells.slice(0, 2).join(', ')}

📌 CULTURAL NOTES:
   ${langContext.culturalNotes}

═══════════════════════════════════════════════════════════════
                    EXAMPLE OUTPUT
═══════════════════════════════════════════════════════════════

Topic: "${relevantExample.topic}"
Platform: ${relevantExample.platform}

${relevantExample.output}

═══════════════════════════════════════════════════════════════
                    YOUR TASK
═══════════════════════════════════════════════════════════════

Create a ${platform} post about "${topic}" in ${langContext.nativeName}.

REQUIREMENTS CHECKLIST:
✅ UNDER ${platformSpec.charLimit} characters total (count carefully!)
✅ Written in ${langContext.nativeName}${language !== 'en' ? ' (not English!)' : ''}
✅ ${tone} tone throughout
✅ Authentic South African cultural references
✅ ${includeHashtags ? `Include ${platformSpec.hashtagLimit} relevant hashtags` : 'NO hashtags'}
✅ ${includeEmojis ? 'Use emojis naturally (they count as characters!)' : 'NO emojis'}
✅ ${callToAction ? `Include CTA: ${callToAction}` : 'Natural call to action'}

Generate the post now:`;

  return prompt;
}

/**
 * Build a prompt for hashtag generation
 */
export function buildHashtagPrompt(topic: string, language: string, count: number = 10): string {
  const langContext = getLanguageContext(language);
  
  return `Generate ${count} relevant hashtags for a South African social media post about "${topic}".

Language context: ${langContext.name} (${langContext.nativeName})
Region focus: ${langContext.regions.slice(0, 3).join(', ')}

Include a mix of:
1. Topic-specific hashtags
2. South African hashtags (e.g., #Mzansi, #SouthAfrica, #LocalIsLekker)
3. ${language !== 'en' ? `${langContext.nativeName} hashtags (e.g., ${langContext.hashtags.slice(0, 2).join(', ')})` : 'Local slang hashtags'}
4. Industry/niche hashtags
5. Trending SA hashtags

Format: Return only the hashtags, one per line, starting with #`;
}

/**
 * Build a prompt for topic suggestions
 */
export function buildTopicSuggestionPrompt(industry: string, language: string): string {
  const langContext = getLanguageContext(language);
  
  return `Suggest 10 engaging content topics for a South African ${industry} business.

Target market: South Africa
Primary language: ${langContext.name}
Regions: ${langContext.regions.slice(0, 4).join(', ')}

Include:
1. Evergreen topics (always relevant)
2. Seasonal/timely topics for South Africa
3. Cultural celebration topics (Heritage Day, Freedom Day, etc.)
4. Local community topics
5. Industry-specific topics

Format: Return a numbered list with brief topic descriptions.`;
}

/**
 * Build a prompt for content quality validation
 */
export function buildValidationPrompt(content: string, expectedLanguage: string): string {
  const langContext = getLanguageContext(expectedLanguage);
  
  return `Analyze this social media post and validate its quality:

POST:
"""
${content}
"""

EXPECTED LANGUAGE: ${langContext.name} (${langContext.nativeName})

Check and report:
1. Is the content primarily in ${langContext.nativeName}? (Yes/No)
2. Language accuracy score (1-10)
3. Cultural authenticity score (1-10)
4. Engagement potential score (1-10)
5. Any cultural insensitivities? (Yes/No - explain if yes)
6. Suggested improvements (if any)

Format: JSON response with these fields`;
}

/**
 * Get optimized generation config for Gemini
 */
export function getGenerationConfig(platform: Platform, tone: Tone): {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
} {
  const baseConfig = {
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  };

  // Adjust temperature based on tone
  const temperatureByTone: Record<Tone, number> = {
    professional: 0.7,
    friendly: 0.85,
    casual: 0.9,
    energetic: 0.95,
  };

  // Adjust max tokens based on platform
  const tokensByPlatform: Record<Platform, number> = {
    twitter: 256,
    instagram: 512,
    facebook: 512,
    linkedin: 768,
  };

  return {
    ...baseConfig,
    temperature: temperatureByTone[tone],
    maxOutputTokens: tokensByPlatform[platform],
  };
}
