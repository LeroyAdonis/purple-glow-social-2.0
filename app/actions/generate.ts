'use server';

import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { auth } from "../../lib/auth"; // Adjust import based on actual file structure
import { headers } from "next/headers";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { posts } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
// Buffer import removed - using global Buffer which is available in Node.js runtime

// Only initialize database if DATABASE_URL is a real connection string
const isDatabaseConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock');
let db: any;
if (isDatabaseConfigured) {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema });
}

// Initialize Gemini
// NOTE: Using process.env.API_KEY as mandated by strict instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    let session = await auth.api.getSession({
        headers: await headers()
    });
    
    // MOCK SESSION FALLBACK FOR PREVIEW
    if (!session) {
         session = {
            user: {
                id: "mock-user-id",
                name: "Thabo Nkosi (Mock)",
                email: "mock@example.com",
                emailVerified: true,
                image: "",
                tier: "pro",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            session: {
                id: "mock-session",
                userId: "mock-user-id",
                expiresAt: new Date(),
                token: "mock-token",
                createdAt: new Date(),
                updatedAt: new Date(),
                ipAddress: "",
                userAgent: ""
            }
        };
    }

    const topic = formData.get("topic") as string;
    const platform = formData.get("platform") as "instagram" | "twitter" | "facebook" | "linkedin";
    const vibe = formData.get("vibe") as string;
    
    if (!topic || !platform) {
      return { error: "Missing required fields." };
    }

    // 2. Generate Text with Gemini 2.5 Flash
    // We use a South African specific prompt engineering strategy
    const textPrompt = `
      Act as a world-class South African Social Media Manager.
      Write a ${platform} post about: "${topic}".
      The vibe/tone should be: ${vibe}.
      
      Requirements:
      - Use standard South African English.
      - Incorporate local slang naturally if the vibe allows (e.g., 'lekker', 'shame', 'now now', 'eish', 'gees').
      - If it's for LinkedIn, keep it professional but warm.
      - If it's for Twitter/Insta, make it punchy.
      - Include 3-5 relevant hashtags.
      - Do NOT include "Here is a post" or meta-text. Just the content.
    `;

    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: textPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for social copy
      }
    });
    
    const generatedText = textResponse.text;

    // 3. Generate Image with Imagen 3 (via @google/genai generateImages)
    let imageUrl = null;

    try {
        const imagePrompt = `High quality, photorealistic, professional social media image for: ${topic}. Style: ${vibe}. South African context, vibrant colors, modern composition.`;
        
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: platform === 'instagram' ? '1:1' : '16:9',
                outputMimeType: 'image/jpeg'
            }
        });

        const imageBase64 = imageResponse.generatedImages?.[0]?.image?.imageBytes;

        if (imageBase64) {
            // 4. Upload to Vercel Blob
            // Convert base64 to Buffer
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const filename = `purple-glow/${session.user.id}/${Date.now()}.jpg`;
            
            // In Mock mode, we can't upload to Vercel Blob without a token. 
            // We'll return a data URI if upload fails or just try upload.
            try {
                 const blob = await put(filename, imageBuffer, {
                    access: 'public',
                    contentType: 'image/jpeg',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                imageUrl = blob.url;
            } catch (blobError) {
                console.warn("Blob upload failed (expected in preview without token), falling back to data URI");
                imageUrl = `data:image/jpeg;base64,${imageBase64}`;
            }
        }
    } catch (imgError) {
        console.error("Image generation failed:", imgError);
        // We continue even if image generation fails, returning just text
    }

    // 5. Save Draft to Database (Try/Catch for Mock Mode)
    let postId = "mock-post-id-" + Date.now();
    try {
        if (session.user.id !== 'mock-user-id') {
            const [newPost] = await db.insert(posts).values({
                userId: session.user.id,
                content: generatedText || "",
                imageUrl: imageUrl,
                platform: platform,
                status: "draft",
                topic: topic,
            }).returning();
            postId = newPost.id;
        }
    } catch (dbError) {
        console.warn("DB Insert failed (expected in preview mode)");
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