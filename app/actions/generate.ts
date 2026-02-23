'use server';

import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { posts, user } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
import { GeminiService } from "../../lib/ai/gemini-service";
import { ensureWithinLimit } from "../../lib/ai/content-truncator";
import { generateImageWithNanoBanana } from "../../lib/ai/nano-banana-service";
import { eq, sql } from "drizzle-orm";

// Only initialize database if DATABASE_URL is a real connection string
const isDatabaseConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock');
let db: NeonHttpDatabase<typeof schema> | undefined;
if (isDatabaseConfigured) {
  const sqlClient = neon(process.env.DATABASE_URL!);
  db = drizzle(sqlClient, { schema });
}

// Initialize Gemini (for image generation)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

type GenerateState = {
  success?: boolean;
  error?: string;
  data?: {
    content: string;
    imageUrl?: string;
    postId?: string;
  };
};

export async function generatePostAction(prevState: any, formData: FormData): Promise<GenerateState> {
  try {
    // 1. Authentication Check
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session) {
      return { error: "Unauthorized. Please login to generate content." };
    }

    const topic = formData.get("topic") as string;
    const platform = formData.get("platform") as "instagram" | "twitter" | "facebook" | "linkedin";
    const vibe = formData.get("vibe") as string;
    const language = (formData.get("language") as string) || 'en';
    
    if (!topic || !platform) {
      return { error: "Missing required fields." };
    }

    // Check user credits
    if (isDatabaseConfigured && db) {
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
      });

      if (!userRecord) {
        return { error: "User not found." };
      }

      if (userRecord.credits <= 0) {
        return { error: "Insufficient credits. Please top up to continue." };
      }
    }

    // 2. Generate Text with GeminiService (improved South African content)
    const geminiService = new GeminiService();
    
    // Map vibe to tone
    let tone: 'professional' | 'casual' | 'friendly' | 'energetic' = 'friendly';
    if (vibe.includes('Professional')) tone = 'professional';
    else if (vibe.includes('Cool') || vibe.includes('Slang')) tone = 'casual';
    else if (vibe.includes('Bold')) tone = 'energetic';

    // Use generateContentWithRetry for automatic quality checking and regeneration
    const contentResult = await geminiService.generateContentWithRetry({
      topic,
      platform,
      language, // Use language from user's selection
      tone,
      includeHashtags: true,
      includeEmojis: true,
    }, 3); // Max 3 retries for over-limit or low-quality content
    
    // FIX: Don't concatenate hashtags - they're already in content
    // Apply final safety truncation as absolute fallback
    const generatedText = ensureWithinLimit(contentResult.content, platform);

    // 3. Generate Image with Nano Banana (Gemini CLI)
    let imageUrl = null;

    try {
      // Generate image using Gemini CLI nanobanana extension
      const imageResult = await generateImageWithNanoBanana({
        topic,
        platform,
        vibe,
        language,
      });
      
      if (imageResult.success && imageResult.imageUrl) {
        imageUrl = imageResult.imageUrl;
      } else {
        // Log the error but continue without image (non-critical)
        console.warn("Image generation failed:", imageResult.error);
      }
    } catch (imgError: unknown) {
      // Continue without image - non-critical error
      console.warn("Image generation error:", imgError);
    }

    // 4. Save Draft to Database and Deduct Credits
    let postId = "mock-post-id-" + Date.now();
    
    if (isDatabaseConfigured && db) {
      try {
        // Save post as draft
        const [newPost] = await db.insert(posts).values({
          userId: session.user.id,
          content: generatedText || "",
          imageUrl: imageUrl,
          platform: platform,
          status: "draft",
          topic: topic,
        }).returning();
        
        if (newPost) {
          postId = newPost.id;
        }

        // Deduct 1 credit
        await db
          .update(user)
          .set({
            credits: sql`${user.credits} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(user.id, session.user.id));

      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        return { error: "Failed to save post to database." };
      }
    }

    return {
      success: true,
      data: {
        content: generatedText || "",
        imageUrl: imageUrl || undefined,
        postId: postId,
      }
    };

  } catch (error: unknown) {
    console.error("Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate content.";
    return { error: errorMessage };
  }
}