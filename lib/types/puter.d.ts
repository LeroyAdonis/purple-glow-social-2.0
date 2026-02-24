/**
 * Puter.js Type Definitions
 * Client-side AI API for text and image generation
 * 
 * Reference: https://docs.puter.com/
 */

interface PuterAuth {
  /**
   * Sign in the user via Puter popup (must be user-initiated)
   */
  signIn(): Promise<{ username?: string } | undefined>;

  /**
   * Check if the user is signed in
   */
  isSignedIn(): boolean;
}

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
  auth: PuterAuth;
}

declare const puter: Puter;

interface Window {
  puter?: Puter;
}
