/**
 * POST /api/v1/posts — schedule one post across one or more platforms.
 *
 * Every limit is checked before the first write. A rejected request must not leave a customer with a
 * half-scheduled batch.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiAuthErrorResponse, authenticateApiRequest } from "../../../../lib/api/v1/auth";
import {
  countQueuedPosts,
  getUser,
  insertScheduledPosts,
  type ApiPlatform,
} from "../../../../lib/api/v1/store";
import { getTierLimits } from "../../../../lib/tiers/config";
import type { TierName } from "../../../../lib/tiers/types";

export const dynamic = "force-dynamic";

const CREDIT_COST_PER_PLATFORM = 1;

const PLATFORM_NAMES: ApiPlatform[] = ["facebook", "instagram", "twitter", "linkedin"];

const bodySchema = z.object({
  content: z.string().trim().min(1).max(5000),
  platforms: z.array(z.string()).min(1),
  scheduledAt: z.string(),
  imageUrl: z.string().url().optional(),
});

function parseScheduledAt(value: string): Date | null {
  if (value.trim().toLowerCase() === "now") return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return apiAuthErrorResponse(auth);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "The request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: parsed.error.issues[0]?.message ?? "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const scheduledAt = parseScheduledAt(parsed.data.scheduledAt);
  if (!scheduledAt) {
    return NextResponse.json(
      {
        error: "invalid_scheduled_at",
        message: 'scheduledAt must be an ISO 8601 timestamp or "now".',
      },
      { status: 400 }
    );
  }

  const unknown = parsed.data.platforms.filter(
    (platform) => !PLATFORM_NAMES.includes(platform as ApiPlatform)
  );
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: "unknown_platform",
        message: `Unknown platform: ${unknown.join(", ")}. Supported: ${PLATFORM_NAMES.join(", ")}.`,
        platforms: unknown,
      },
      { status: 400 }
    );
  }

  const user = await getUser(auth.userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found", message: "User not found." }, { status: 404 });
  }

  const tier = (user.tier ?? "free") as TierName;
  const limits = getTierLimits(tier);
  const platforms = parsed.data.platforms as ApiPlatform[];

  const queued = await countQueuedPosts(user.id);
  if (queued + platforms.length > limits.queueSize) {
    return NextResponse.json(
      {
        error: "queue_limit_reached",
        message: `Queue limit reached: the ${tier} tier allows ${limits.queueSize} scheduled posts, ${queued} are queued and this request adds ${platforms.length}.`,
        limit: limits.queueSize,
        current: queued,
        requested: platforms.length,
      },
      { status: 429 }
    );
  }

  const required = platforms.length * CREDIT_COST_PER_PLATFORM;
  const available = user.credits ?? 0;
  if (available < required) {
    return NextResponse.json(
      {
        error: "insufficient_credits",
        message: `Insufficient credits: this request needs ${required} but ${available} are available.`,
        required,
        available,
      },
      { status: 402 }
    );
  }

  const created = await insertScheduledPosts(
    platforms.map((platform) => ({
      userId: user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl ?? null,
      platform,
      status: "scheduled" as const,
      scheduledDate: scheduledAt,
    }))
  );

  return NextResponse.json({ posts: created }, { status: 201 });
}
