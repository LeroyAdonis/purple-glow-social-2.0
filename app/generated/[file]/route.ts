import { NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * GET /generated/[file]
 *
 * Serves the images written by /api/ai/generate-image at runtime.
 *
 * Why this exists: Next 16 builds its list of public/ files once, when the server starts
 * (node_modules/next/dist/server/lib/router-utils/filesystem.js — `recursiveReadDir(publicFolderPath)`),
 * so a JPEG written into public/generated after boot is never served by `next start`. The route keeps the
 * `/generated/<hash>.jpg` URL the API returns without pretending the image is there when it is not.
 */

const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');
const FILE_PATTERN = /^[a-f0-9]{64}\.jpg$/; // also the path-traversal guard

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!FILE_PATTERN.test(file)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = path.join(GENERATED_DIR, file);
  const info = await stat(filePath).catch(() => null);
  if (!info) {
    return new NextResponse('Not found', { status: 404 });
  }

  const bytes = await readFile(filePath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
