# Nano Banana Quick Reference

## Installation (One-time Setup)

```bash
# 1. Install Gemini CLI globally
npm install -g @google/generative-ai-cli

# 2. Install Nano Banana extension
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana

# 3. Set API key in .env.local
echo "GEMINI_API_KEY=your-api-key-here" >> .env.local
```

## Verify Installation

```bash
node scripts/test-nano-banana.mjs
```

Expected output:
```
✓ All tests passed (5/5)
Nano Banana is ready to use! 🎉
```

## Usage in Code

```typescript
import { generateImageWithNanoBanana } from '@/lib/ai/nano-banana-service';

const result = await generateImageWithNanoBanana({
  topic: 'South African coffee culture',
  platform: 'instagram',
  vibe: 'professional',
  language: 'en',
});

if (result.success) {
  console.log('Image URL:', result.imageUrl);
  console.log('Image Path:', result.imagePath);
} else {
  console.error('Generation failed:', result.error);
}
```

## Platform Dimensions

| Platform  | Size        | Aspect Ratio |
|-----------|-------------|--------------|
| Instagram | 1080x1080   | 1:1          |
| Facebook  | 1200x630    | 1.91:1       |
| Twitter   | 1200x675    | 16:9         |
| LinkedIn  | 1200x627    | 1.91:1       |

## Manual Image Generation

```bash
# Basic generation
gemini "/generate 'professional social media image: topic here'"

# With options
gemini "/generate 'topic' --count=1 --styles=photorealistic --preview"

# Icon generation
gemini "/icon 'purple social media icon' --sizes=512,256,128 --style=vector"

# Diagram generation
gemini "/diagram 'system architecture for post generation'"
```

## Output Location

All generated images are saved to:
```
./nanobanana-output/{platform}_{topic_slug}_{timestamp}.png
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "gemini: command not found" | Install Gemini CLI globally |
| "Extension not found" | Install nanobanana extension |
| "API key invalid" | Set GEMINI_API_KEY in .env.local |
| "Generation timeout" | Check network, simplify prompt |
| Images not generated | Run test script to diagnose |

## Error Handling

The system gracefully degrades to **text-only posts** if image generation fails.

No user-facing errors - posts are always created.

## Files Changed

- `.agents/skills/nano-banana/SKILL.md` - Skill documentation
- `lib/ai/nano-banana-service.ts` - Image generation service
- `app/actions/generate.ts` - Integration point
- `scripts/test-nano-banana.mjs` - Test script
- `nanobanana-output/` - Output directory

## Next Steps

1. ✅ Run test script: `node scripts/test-nano-banana.mjs`
2. ✅ Test in dev environment: `npm run dev`
3. ✅ Generate a test post with image
4. ⏳ Deploy to production (after prerequisites installed)
5. ⏳ Add E2E tests for image generation
6. ⏳ Integrate CDN upload (Vercel Blob)

## Support

- **Documentation:** See `.agents/skills/nano-banana/SKILL.md`
- **Full Report:** See `NANO_BANANA_IMPLEMENTATION_REPORT.md`
- **Test Script:** `scripts/test-nano-banana.mjs`
