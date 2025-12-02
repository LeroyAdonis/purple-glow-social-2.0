'use server';

import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { posts, user } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
import { GeminiService } from "../../lib/ai/gemini-service";
import { eq, sql } from "drizzle-orm";

// Only initialize database if DATABASE_URL is a real connection string
const isDatabaseConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock');
let db: any;
if (isDatabaseConfigured) {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema });
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
    if (isDatabaseConfigured) {
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

    const contentResult = await geminiService.generateContent({
      topic,
      platform,
      language, // Use language from user's selection
      tone,
      includeHashtags: true,
      includeEmojis: true,
    });
    
    const generatedText = contentResult.content + '\n\n' + contentResult.hashtags.join(' ');

    // 3. Generate Image with Gemini 2.0 Flash Image Generation
    let imageUrl = null;

    try {
        const imagePrompt = `Generate a high quality, photorealistic, professional social media image for: ${topic}. Style: ${vibe}. South African context, vibrant colors, modern composition. Make it visually appealing for ${platform}.`;
        
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp-image-generation',
            contents: imagePrompt,
            config: {
                responseModalities: ['Image', 'Text'],
            }
        });

        // Extract image from response
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                const imageBase64 = part.inlineData.data;
                if (imageBase64) {
                    const imageBuffer = Buffer.from(imageBase64, 'base64');
                    const filename = `purple-glow/${session.user.id}/${Date.now()}.png`;
                    
                    try {
                        const blob = await put(filename, imageBuffer, {
                            access: 'public',
                            contentType: part.inlineData.mimeType || 'image/png',
                            token: process.env.BLOB_READ_WRITE_TOKEN
                        });
                        imageUrl = blob.url;
                    } catch (blobError) {
                        console.warn("Blob upload failed, falling back to data URI");
                        imageUrl = `data:${part.inlineData.mimeType};base64,${imageBase64}`;
                    }
                    break;
                }
            }
        }
        
        if (!imageUrl) {
            console.warn("No image found in Gemini response. Response structure:", JSON.stringify(imageResponse, null, 2).substring(0, 500));
        }
    } catch (imgError: any) {
        console.error("Image generation failed:", imgError?.message || imgError);
        // We continue even if image generation fails, returning just text
    }

    // 5. Save Draft to Database and Deduct Credits
    let postId = "mock-post-id-" + Date.now();
    
    if (isDatabaseConfigured) {
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
        postId = newPost.id;

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

  } catch (error: any) {
    console.error("Generation Error:", error);
    return { error: error.message || "Failed to generate content." };
  }
}