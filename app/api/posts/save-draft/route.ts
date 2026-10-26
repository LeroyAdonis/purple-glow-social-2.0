import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, isDatabaseConfigured } from "@/lib/db/driver";
import { posts, user } from "@/drizzle/schema";
import * as schema from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { z } from "zod";

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
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
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

      // NO CREDIT DEDUCTION HERE — deliberately.
      //
      // This route used to run `credits - 1` on every saved draft, with no credit_reservations row to record
      // it and no release path. Because the content generator calls this route automatically straight after a
      // generation, every user was silently charged one credit for text they had not published, and then
      // charged AGAIN by /api/posts/publish when they actually posted it. That contradicts the documented
      // Phase 11 rule ("credits only deducted on successful publish") and it was invisible: nothing on screen
      // said a credit had gone. Found 2026-10-26 when the demo account dropped from 10 credits to 8 after two
      // generations that were never published.
      //
      // A draft is free. The charge belongs to the publish route, which deducts per successful platform and
      // refunds failures — see app/api/posts/publish/route.ts.

      logger.api.info("Draft saved after AI generation", {
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
