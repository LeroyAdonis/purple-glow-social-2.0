/**
 * Puter.js Type Definitions
 * Client-side AI API for text and image generation
 * 
 * Reference: https://docs.puter.com/
 */

interface PuterAI {
  /**
   * Generate text content using AI chat models
   * @param prompt - The text prompt for generation
   * @param options - Optional configuration (model, stream, etc.)
   * @returns Promise resolving to string or object with message content
   */
  chat(
    prompt: string,
    options?: { 
      model?: string; 
      stream?: boolean 
    }
  ): Promise<string | { message: { content: string } }>;

  /**
   * Generate image from text description
   * @param prompt - The image description prompt
   * @param options - Optional configuration (model)
   * @returns Promise resolving to HTMLImageElement with data URL src
   */
  txt2img(
    prompt: string,
    options?: { 
      model?: string 
    }
  ): Promise<HTMLImageElement>;
}

interface Puter {
  ai: PuterAI;
}

declare const puter: Puter;

interface Window {
  puter?: Puter;
}
