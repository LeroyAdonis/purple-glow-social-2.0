import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { auth } from '@/lib/auth';
import { rateLimiters } from '@/lib/security/rate-limit';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

/**
 * POST /api/ai/generate-image
 *
 * Free image generation for the content generator, via NVIDIA NIM FLUX.1-dev (no per-image cost).
 * Body: { prompt: string, platform?: string, seed?: number }
 *
 * `prompt` is the user's topic; this route turns it into the image prompt (see buildPrompt) so the
 * scene wording is written once, server-side, instead of being duplicated in every client.
 *
 * Sends ONLY prompt/width/height/seed. Adding mode/cfg_scale/steps makes the endpoint 500 after 60s.
 * width must be one of 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344 — anything else is a 422.
 */

const NIM_URL = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';
const NIM_SIZE = 1024; // square, matches the Instagram-style preview card
const NIM_TIMEOUT_MS = 30_000;
const PROMPT_MAX = 400;
const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');
const MIN_CACHED_BYTES = 20 * 1024;
const MAX_FILES = 200;
const NEGATIVE_CLAUSE = 'no text, no logos, no watermark, no people, no hands';

// Positive, concrete settings. FLUX renders whatever it is told to depict, so naming a scene works and
// a list of exclusions alone does not.
const PLATFORM_SCENE: Record<string, string> = {
  instagram: 'a bright still life on a sunlit café table, shot top-down, warm terracotta and cream tones',
  facebook: 'a small neighbourhood shopfront on a sunny afternoon, seen from the pavement, warm earthy tones',
  twitter: 'a clean editorial still life on a plain paper backdrop in daylight, strong simple shapes',
  linkedin: 'a tidy professional desk by a window with soft morning daylight, muted natural colours',
};
const DEFAULT_SCENE = 'a calm South African street scene in late afternoon daylight, warm earthy tones';

function buildPrompt(topic: string, platform?: string): string {
  const scene = (platform && PLATFORM_SCENE[platform]) || DEFAULT_SCENE;
  return `${scene}, themed around ${topic}, sharp focus, high detail, photographic, ${NEGATIVE_CLAUSE}.`;
}

/** The hash IS the cache key: same prompt and seed returns the same file, no NIM call. */
function cacheKey(prompt: string, seed: number): string {
  return createHash('sha256').update(`${prompt}|${seed}`).digest('hex');
}

async function pruneOldFiles(keep: string) {
  try {
    const files = (await readdir(GENERATED_DIR)).filter(f => f.endsWith('.jpg'));
    if (files.length <= MAX_FILES) return;
    const withTimes = await Promise.all(
      files.map(async f => ({ f, mtime: (await stat(path.join(GENERATED_DIR, f))).mtimeMs }))
    );
    withTimes.sort((a, b) => a.mtime - b.mtime);
    for (const { f } of withTimes.slice(0, withTimes.length - MAX_FILES)) {
      if (f === keep) continue;
      await unlink(path.join(GENERATED_DIR, f)).catch(() => {});
    }
  } catch {
    // Pruning is housekeeping; a failure here must not cost the caller their image.
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResult = await rateLimiters.contentGen.limit(`ai-image:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await parseRequestBody<{ prompt?: unknown; platform?: unknown; seed?: unknown }>(request);
    if (!body) return invalidJsonResponse();

    const topic = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, PROMPT_MAX) : '';
    if (!topic) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }
    const platform = typeof body.platform === 'string' ? body.platform : undefined;

    const prompt = buildPrompt(topic, platform);
    // Same topic in, same image out: with no explicit seed we derive one from the prompt text.
    const seed = typeof body.seed === 'number' && Number.isFinite(body.seed)
      ? Math.trunc(Math.abs(body.seed))
      : parseInt(cacheKey(prompt, 0).slice(0, 8), 16);

    const key = cacheKey(prompt, seed);
    const fileName = `${key}.jpg`;
    const filePath = path.join(GENERATED_DIR, fileName);
    const imageUrl = `/generated/${fileName}`;

    await mkdir(GENERATED_DIR, { recursive: true });

    // Cached: a real file on disk, so repeated demos cost nothing.
    const existing = await stat(filePath).catch(() => null);
    if (existing && existing.size > MIN_CACHED_BYTES) {
      return NextResponse.json({ imageUrl, cached: true });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      logger.ai.error('Image generation unavailable: NVIDIA_API_KEY is not set');
      return NextResponse.json(
        { error: 'Image generation is not configured: NVIDIA_API_KEY is not set' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NIM_TIMEOUT_MS);
    let payload: { artifacts?: { base64?: string; finishReason?: string }[] };
    try {
      const response = await fetch(NIM_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ prompt, width: NIM_SIZE, height: NIM_SIZE, seed }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        logger.ai.error('Image generation failed upstream', {
          status: response.status,
          detail: detail.slice(0, 300),
        });
        return NextResponse.json(
          { error: `Image provider returned HTTP ${response.status}` },
          { status: 502 }
        );
      }
      payload = await response.json();
    } catch (error: unknown) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      logger.ai.error('Image generation request failed', { aborted, error });
      return NextResponse.json(
        { error: aborted ? `Image provider did not answer within ${NIM_TIMEOUT_MS / 1000} seconds` : 'Image provider request failed' },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeout);
    }

    const artifact = payload?.artifacts?.[0];
    if (!artifact?.base64) {
      return NextResponse.json({ error: 'Image provider returned no image' }, { status: 502 });
    }
    if (artifact.finishReason && artifact.finishReason !== 'SUCCESS') {
      // e.g. CONTENT_FILTERED — an honest refusal, never a blank image.
      logger.ai.warn('Image generation refused', { finishReason: artifact.finishReason });
      return NextResponse.json(
        { error: `Image generation stopped by the provider: ${artifact.finishReason}`, finishReason: artifact.finishReason },
        { status: 422 }
      );
    }

    const buffer = Buffer.from(artifact.base64, 'base64');
    if (buffer.length < MIN_CACHED_BYTES) {
      return NextResponse.json({ error: 'Image provider returned an unusable image' }, { status: 502 });
    }

    await writeFile(filePath, buffer);
    await pruneOldFiles(fileName);

    logger.ai.info('Generated image with NVIDIA NIM', { userId: session.user.id, bytes: buffer.length, platform });
    return NextResponse.json({ imageUrl, cached: false });
  } catch (error: unknown) {
    logger.ai.exception(error, { endpoint: '/api/ai/generate-image' });
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
