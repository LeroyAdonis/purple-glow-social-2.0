/**
 * Google Gemini AI Service
 * Generates culturally relevant South African content
 */

interface GenerateContentParams {
  topic: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  language: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

interface GeneratedContent {
  content: string;
  hashtags: string[];
  suggestedImagePrompt?: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
    }
  }

  /**
   * Generate content for social media post
   */
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    try {
      const prompt = this.buildPrompt(params);
      
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

      return this.parseGeneratedContent(generatedText, params);
    } catch (error) {
      console.error('Gemini content generation error:', error);
      throw error;
    }
  }

  /**
   * Build context-aware prompt for Gemini
   */
  private buildPrompt(params: GenerateContentParams): string {
    const { topic, platform, language, tone = 'friendly', includeHashtags = true, includeEmojis = true } = params;

    // Platform-specific constraints
    const platformConstraints = {
      twitter: 'Keep it under 280 characters.',
      instagram: 'Write an engaging caption. Can be longer, up to 2200 characters.',
      facebook: 'Write a compelling post. Can be detailed, up to 500 words.',
      linkedin: 'Write a professional post. Focus on value and insights, up to 700 words.',
    };

    // Language-specific context with full language names
    const languageContext = this.getLanguageContext(language);
    const languageFullName = this.getLanguageFullName(language);

    // Language-specific greeting examples
    const languageExamples = this.getLanguageExamples(language);

    const prompt = `You are a South African social media content creator for small businesses and entrepreneurs.

**CRITICAL: LANGUAGE REQUIREMENT**
You MUST write the entire post in ${languageFullName} (language code: ${language}).
${language !== 'en' ? `The main content MUST be written in ${languageFullName}. Only use English for hashtags, brand names, or widely understood words.` : 'Write in South African English with local expressions.'}

**Context:**
- Platform: ${platform}
- Topic: ${topic}
- Language: ${languageFullName} (${languageContext})
- Tone: ${tone}
- Include hashtags: ${includeHashtags}
- Include emojis: ${includeEmojis}

**Requirements:**
1. ${platformConstraints[platform]}
2. WRITE THE POST ENTIRELY IN ${languageFullName.toUpperCase()}
3. Use South African context, culture, and local references
4. ${languageExamples}
5. Reference South African locations (Joburg, Cape Town, Durban, Pretoria, etc.)
6. ${includeHashtags ? 'Include 3-5 relevant hashtags at the end (hashtags can be in English or the target language)' : 'Do not include hashtags'}
7. ${includeEmojis ? 'Use relevant emojis naturally throughout' : 'Do not use emojis'}
8. Make it authentic and relatable to South African audiences
9. Focus on the topic: ${topic}
10. Keep the ${tone} tone throughout

**Format:**
- Main content in ${languageFullName} (with emojis if requested)
- Blank line
- Hashtags on separate lines (if requested)

**Example South African touches:**
- "Howzit Mzansi!"
- "Sharp sharp, don't miss out!"
- "Lekker deals this weekend!"
- "#LocalIsLekker #MzansiMagic"
- References to braai, biltong, rugby, etc.

Generate the content in ${languageFullName} now:`;

    return prompt;
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
        console.error(`Failed to generate variation ${i + 1}:`, error);
      }
    }

    return variations;
  }

  /**
   * Generate hashtag suggestions for a topic
   */
  async generateHashtags(topic: string, count: number = 10): Promise<string[]> {
    try {
      const prompt = `Generate ${count} relevant hashtags for a South African social media post about "${topic}".

Requirements:
1. Mix of popular and niche hashtags
2. Include South African-specific hashtags (e.g., #Mzansi, #SouthAfrica, #LocalIsLekker)
3. Include topic-specific hashtags
4. Make them relevant for small businesses and entrepreneurs
5. Format each hashtag starting with #

Generate the hashtags as a comma-separated list:`;

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
      const hashtags: string[] = text.match(/#\w+/g) || [];
      return Array.from(new Set(hashtags)).slice(0, count);
    } catch (error) {
      console.error('Hashtag generation error:', error);
      return [];
    }
  }

  /**
   * Get content suggestions based on current trends
   */
  async getTopicSuggestions(industry: string): Promise<string[]> {
    try {
      const prompt = `Suggest 10 trending content topics for a South African ${industry} business to post on social media.

Requirements:
1. Topics should be relevant to South Africa
2. Include local events, holidays, and cultural moments
3. Mix of evergreen and timely topics
4. Suitable for small businesses
5. Engaging and relatable

Format as a simple numbered list:`;

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
      console.error('Topic suggestion error:', error);
      return [];
    }
  }
}
