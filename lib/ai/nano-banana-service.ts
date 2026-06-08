/**
 * Nano Banana Image Generation Service
 * 
 * Integrates Gemini CLI nanobanana extension for AI image generation.
 * Replaces the broken Pollinations.ai integration.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, access, readdir } from 'fs/promises';
import path from 'path';
import { logger } from '../logger';

const execAsync = promisify(exec);

// Output directory for generated images
const OUTPUT_DIR = path.join(process.cwd(), 'nanobanana-output');

// Platform-specific image dimensions and aspect ratio hints
const PLATFORM_SPECS = {
  instagram: {
    width: 1080,
    height: 1080,
    aspectHint: '1:1 square format',
  },
  facebook: {
    width: 1200,
    height: 630,
    aspectHint: '1.91:1 wide banner',
  },
  twitter: {
    width: 1200,
    height: 675,
    aspectHint: '16:9 landscape',
  },
  linkedin: {
    width: 1200,
    height: 627,
    aspectHint: '1.91:1 professional banner',
  },
} as const;

type Platform = keyof typeof PLATFORM_SPECS;

interface GenerateImageOptions {
  topic: string;
  platform: Platform;
  vibe: string;
  language?: string;
}

interface GenerateImageResult {
  success: boolean;
  imagePath?: string;
  imageUrl?: string;
  error?: string;
}

/**
 * Ensure output directory exists
 */
async function ensureOutputDirectory(): Promise<void> {
  try {
    await access(OUTPUT_DIR);
  } catch {
    await mkdir(OUTPUT_DIR, { recursive: true });
    logger.ai.info('Created nanobanana output directory', { path: OUTPUT_DIR });
  }
}

/**
 * Construct SA-themed image prompt based on topic, platform, and vibe
 */
function constructImagePrompt(
  topic: string,
  platform: Platform,
  vibe: string
): string {
  const spec = PLATFORM_SPECS[platform];
  
  // Base prompt with platform and aspect ratio context
  const prompt = `Professional ${platform} social media image: ${topic}. 
South African context, ${vibe} style, ${spec.aspectHint}, 
vibrant colors, high quality, photorealistic composition, modern aesthetic.`;

  return prompt.trim().replace(/\n/g, ' ');
}

/**
 * Execute Gemini CLI nanobanana command
 */
async function executeGeminiGenerate(prompt: string): Promise<string> {
  const safePrompt = prompt.replace(/'/g, "\\'");
  
  // Use /generate command with photorealistic style
  const command = `gemini "/generate '${safePrompt}' --count=1 --styles=photorealistic"`;
  
  logger.ai.info('Executing Gemini CLI command', { command });
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    
    if (stderr) {
      logger.ai.warn('Gemini CLI stderr output', { stderr });
    }
    
    logger.ai.info('Gemini CLI stdout', { stdout });
    
    return stdout;
  } catch (error) {
    logger.ai.error('Gemini CLI execution failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Find the most recently generated image in the Gemini CLI output directory
 * Gemini CLI typically saves to a default location, we need to find and move it
 */
async function findLatestGeneratedImage(): Promise<string | null> {
  try {
    // Gemini CLI typically saves to current directory or a specific output folder
    // Check common locations
    const possibleDirs = [
      process.cwd(),
      path.join(process.cwd(), 'generated'),
      path.join(process.cwd(), 'output'),
    ];
    
    let latestFile: { path: string; mtime: Date } | null = null;
    
    for (const dir of possibleDirs) {
      try {
        const files = await readdir(dir);
        const imageFiles = files.filter(f => 
          /\.(png|jpg|jpeg|webp)$/i.test(f)
        );
        
        for (const file of imageFiles) {
          const fullPath = path.join(dir, file);
          const stats = await import('fs/promises').then(fs => fs.stat(fullPath));
          
          if (!latestFile || stats.mtime > latestFile.mtime) {
            latestFile = { path: fullPath, mtime: stats.mtime };
          }
        }
      } catch {
        // Directory doesn't exist or not accessible, skip
        continue;
      }
    }
    
    return latestFile?.path || null;
  } catch (error) {
    logger.ai.error('Failed to find generated image', { error });
    return null;
  }
}

/**
 * Generate image using Nano Banana (Gemini CLI)
 */
export async function generateImageWithNanoBanana(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const { topic, platform, vibe } = options;
  
  try {
    // Ensure output directory exists
    await ensureOutputDirectory();
    
    // Construct prompt
    const prompt = constructImagePrompt(topic, platform, vibe);
    logger.ai.info('Generated image prompt', { prompt, platform, topic });
    
    // Execute Gemini CLI command
    const output = await executeGeminiGenerate(prompt);
    
    // Find the generated image
    const generatedImagePath = await findLatestGeneratedImage();
    
    if (!generatedImagePath) {
      logger.ai.error('No generated image found after Gemini CLI execution');
      return {
        success: false,
        error: 'Image generation completed but file not found',
      };
    }
    
    // Move to output directory with proper naming
    const timestamp = Date.now();
    const topicSlug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30);
    const filename = `${platform}_${topicSlug}_${timestamp}.png`;
    const targetPath = path.join(OUTPUT_DIR, filename);
    
    // Copy file to target location
    const fs = await import('fs/promises');
    await fs.copyFile(generatedImagePath, targetPath);
    
    logger.ai.info('Image generated successfully', { 
      path: targetPath,
      platform,
      topic 
    });
    
    return {
      success: true,
      imagePath: targetPath,
      imageUrl: `/nanobanana-output/${filename}`, // Public URL path
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.ai.error('Nano Banana image generation failed', { 
      error: errorMessage,
      topic,
      platform 
    });
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if Gemini CLI with nanobanana extension is available
 */
export async function checkNanoBananaAvailability(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('gemini extensions list', {
      timeout: 5000,
    });
    
    const hasNanoBanana = stdout.includes('nanobanana');
    
    if (!hasNanoBanana) {
      logger.ai.warn('Nano Banana extension not installed', {
        hint: 'Run: gemini extensions install https://github.com/gemini-cli-extensions/nanobanana'
      });
    }
    
    return hasNanoBanana;
  } catch (error) {
    logger.ai.error('Failed to check Gemini CLI availability', { error });
    return false;
  }
}

/**
 * Fallback to text-only post generation
 * Returns null to indicate no image should be included
 */
export function fallbackToTextOnly(): GenerateImageResult {
  logger.ai.info('Falling back to text-only post (no image)');
  return {
    success: false,
    error: 'Image generation unavailable, continuing with text-only post',
  };
}
