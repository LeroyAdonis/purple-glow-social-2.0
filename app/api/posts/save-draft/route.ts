import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { posts, user } from "@/drizzle/schema";
import * as schema from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { z } from "zod";

const isDatabaseConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('mock');
let db: NeonHttpDatabase<typeof schema> | undefined;
if (isDatabaseConfigured) {
  const sqlClient = neon(process.env.DATABASE_URL!);
  db = drizzle(sqlClient, { schema });
}

const saveDraftSchema = z.object({
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
  platform: z.enum(["instagram", "twitter", "facebook", "linkedin"]),
  topic: z.string().min(1, "Topic is required"),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = saveDraftSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { content, imageUrl, platform, topic } = parsed.data;

    let postId = "mock-post-id-" + Date.now();

    if (isDatabaseConfigured && db) {
      // Check credits
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
      });

      if (!userRecord) {
        return Response.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      if (userRecord.credits <= 0) {
        return Response.json(
          { success: false, error: "Insufficient credits. Please top up to continue." },
          { status: 402 }
        );
      }

      // Save draft
      const [newPost] = await db
        .insert(posts)
        .values({
          userId: session.user.id,
          content: content,
          imageUrl: imageUrl ?? null,
          platform: platform,
          status: "draft",
          topic: topic,
        })
        .returning();

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

      logger.api.info("Draft saved via Puter.js generation", {
        postId,
        platform,
        userId: session.user.id,
      });
    }

    return Response.json({
      success: true,
      data: { postId },
    });
  } catch (error) {
    logger.api.exception(error, { endpoint: "/api/posts/save-draft" });
    return Response.json(
      { success: false, error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
