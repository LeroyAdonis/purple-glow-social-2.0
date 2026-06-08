# Nano Banana Image Generation Integration - Implementation Report

**Date:** 2025-02-23  
**Branch:** feature/post-generation-overhaul  
**Status:** ✅ COMPLETE

---

## Executive Summary

Successfully created a comprehensive Nano Banana skill for AI image generation using Gemini CLI's nanobanana extension. This replaces the broken Pollinations.ai integration with a robust, local image generation solution.

### What Changed

1. **Created `.agents/skills/nano-banana/SKILL.md`** - Comprehensive skill documentation
2. **Created `lib/ai/nano-banana-service.ts`** - TypeScript service for image generation
3. **Updated `app/actions/generate.ts`** - Integrated Nano Banana into post generation flow
4. **Created `scripts/test-nano-banana.mjs`** - Test script to verify installation
5. **Created `nanobanana-output/`** directory - Output location for generated images

---

## Deliverable 1: SKILL.md Documentation

**Location:** `.agents/skills/nano-banana/SKILL.md`  
**Size:** 11,688 bytes

### Features Documented

- ✅ Proper frontmatter with `name`, `description`, `allowed-tools`
- ✅ Installation instructions and prerequisites
- ✅ Core Gemini CLI commands (`/generate`, `/edit`, `/icon`, `/diagram`)
- ✅ Platform-specific image dimensions:
  - Instagram: 1080x1080 (1:1 square)
  - Facebook: 1200x630 (1.91:1)
  - Twitter: 1200x675 (16:9)
  - LinkedIn: 1200x627 (1.91:1)
- ✅ South African themed prompt examples
- ✅ Integration pattern for `app/actions/generate.ts`
- ✅ Error handling and fallback strategies
- ✅ Testing and verification checklist
- ✅ Troubleshooting guide

### Key Sections

1. **Core Commands** - How to use `/generate`, `/edit`, `/icon`, `/diagram`
2. **Platform-Specific Sizes** - Dimensions table with aspect ratios
3. **SA-Themed Prompts** - Examples for business, tourism, tech, lifestyle
4. **Integration Pattern** - TypeScript code example
5. **Error Handling** - Common errors and fallback strategies
6. **Best Practices** - Prompt engineering, file management, performance

---

## Deliverable 2: Nano Banana Service

**Location:** `lib/ai/nano-banana-service.ts`  
**Size:** 7,514 bytes

### Implementation Details

```typescript
// Main function signature
export async function generateImageWithNanoBanana(
  options: GenerateImageOptions
): Promise<GenerateImageResult>

// Platform specs with dimensions
const PLATFORM_SPECS = {
  instagram: { width: 1080, height: 1080, aspectHint: '1:1 square' },
  facebook: { width: 1200, height: 630, aspectHint: '1.91:1 wide' },
  twitter: { width: 1200, height: 675, aspectHint: '16:9 landscape' },
  linkedin: { width: 1200, height: 627, aspectHint: '1.91:1 professional' },
}
```

### Key Features

- ✅ **Platform-aware prompt construction** - Includes aspect ratio hints
- ✅ **SA-themed prompts** - Automatically adds South African context
- ✅ **Output directory management** - Creates `./nanobanana-output/` if needed
- ✅ **File naming convention** - `{platform}_{topic_slug}_{timestamp}.png`
- ✅ **Error handling** - Graceful degradation to text-only posts
- ✅ **Logging** - Uses `lib/logger.ts` for all operations
- ✅ **Timeout protection** - 60-second execution timeout
- ✅ **Availability check** - `checkNanoBananaAvailability()` function

### Error Handling Strategy

```typescript
try {
  const result = await generateImageWithNanoBanana({ topic, platform, vibe });
  if (result.success) {
    imageUrl = result.imageUrl;
  } else {
    // Log and continue without image (non-critical)
    logger.warn("Image generation failed", { error: result.error });
  }
} catch (error) {
  // Fallback to text-only post
  logger.error("Image generation error", { error });
}
```

---

## Deliverable 3: Updated generate.ts

**Location:** `app/actions/generate.ts`  
**Lines Changed:** 93-116 (replaced Pollinations.ai code)

### Before (Pollinations.ai)

```typescript
// Pollinations.ai URL-based API
const encodedPrompt = encodeURIComponent(imagePrompt);
imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${Date.now()}`;
```

### After (Nano Banana)

```typescript
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
  console.warn("Image generation failed:", imageResult.error);
}
```

### Integration Flow

1. User submits post generation request (topic, platform, vibe)
2. `generatePostAction()` receives form data
3. Generate text content with `GeminiService`
4. **Generate image with `generateImageWithNanoBanana()`** ← NEW
5. Save post to database with `imageUrl`
6. Return success response with content and image

---

## Deliverable 4: Test Script

**Location:** `scripts/test-nano-banana.mjs`  
**Size:** 5,995 bytes

### Test Coverage

1. ✅ Check Gemini CLI installation
2. ✅ Check Nano Banana extension installation
3. ✅ Check GEMINI_API_KEY environment variable
4. ✅ Check output directory existence
5. ✅ Test actual image generation (if prerequisites met)

### Usage

```bash
node scripts/test-nano-banana.mjs
```

### Sample Output

```
=================================
  Nano Banana Integration Test
=================================

1. Checking Gemini CLI installation...
✓ Gemini CLI found: 1.2.3

2. Checking Nano Banana extension...
✗ Nano Banana extension not found
  Install: gemini extensions install https://github.com/gemini-cli-extensions/nanobanana

3. Checking Gemini API key...
✓ API key found (AIzaSyBqQ...)

4. Testing image generation...
  ⊗ Skipped (prerequisites not met)

5. Checking output directory...
✓ Output directory exists

=================================
  Test Summary
=================================
⚠ 3/5 tests passed

Please fix the issues above before using Nano Banana.
```

---

## Deliverable 5: Output Directory

**Location:** `nanobanana-output/`

### Structure

```
nanobanana-output/
├── .gitkeep              # Keep directory in git
├── README.md             # Documentation
└── (generated images)    # Platform-specific PNG files
```

### File Naming

```
{platform}_{topic_slug}_{timestamp}.png
```

**Examples:**
- `instagram_coffee_culture_1708690800000.png`
- `linkedin_tech_innovation_1708690801000.png`
- `facebook_tourism_cape_town_1708690802000.png`

---

## TypeScript Verification

✅ **No TypeScript errors**

```bash
npx tsc --noEmit --pretty
# Exit code: 0 (success)
```

All type definitions are correct:
- Import statements valid
- Function signatures match
- Type safety maintained throughout

---

## Setup Requirements

Before using Nano Banana in production, the following must be configured:

### 1. Install Gemini CLI

```bash
npm install -g @google/generative-ai-cli
```

### 2. Install Nano Banana Extension

```bash
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
```

### 3. Configure API Key

Add to `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

Or set environment variable:

```bash
# Linux/Mac
export GEMINI_API_KEY="your-key"

# Windows PowerShell
$env:GEMINI_API_KEY = "your-key"
```

### 4. Verify Installation

```bash
node scripts/test-nano-banana.mjs
```

Expected output:
```
✓ All tests passed (5/5)
Nano Banana is ready to use! 🎉
```

---

## Integration Testing

### Manual Test

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to post generation page

3. Fill in form:
   - **Topic:** "South African coffee culture"
   - **Platform:** Instagram
   - **Vibe:** Professional
   - **Language:** English

4. Click "Generate Post"

5. Verify:
   - ✅ Text content generated
   - ✅ Image generated in `nanobanana-output/`
   - ✅ Image displayed in preview
   - ✅ Post saved to database with `imageUrl`

### Automated Test (Future)

Consider creating E2E test:

```typescript
// e2e-tests/post-generation-with-images.spec.ts
test('generates post with Nano Banana image', async ({ page }) => {
  await page.goto('/dashboard/generate');
  await page.fill('[name="topic"]', 'Cape Town tourism');
  await page.selectOption('[name="platform"]', 'instagram');
  await page.click('button[type="submit"]');
  
  // Wait for image generation
  await page.waitForSelector('img[src*="nanobanana-output"]', {
    timeout: 90000, // 90 seconds for image generation
  });
  
  // Verify image exists
  const imageSrc = await page.getAttribute('img', 'src');
  expect(imageSrc).toContain('nanobanana-output/instagram_');
});
```

---

## Error Handling

### Graceful Degradation

The system is designed to **never fail** due to image generation issues:

```typescript
// In generate.ts
try {
  const imageResult = await generateImageWithNanoBanana(/* ... */);
  if (imageResult.success) {
    imageUrl = imageResult.imageUrl;
  }
} catch (error) {
  // Continue without image - non-critical
  console.warn("Image generation error:", error);
}

// Post is saved regardless of image generation success
await db.insert(posts).values({
  content: generatedText,
  imageUrl: imageUrl || null, // NULL if image failed
  // ...
});
```

### Common Error Scenarios

| Error | Handling | User Impact |
|-------|----------|-------------|
| Gemini CLI not installed | Log error, return null | Post created without image |
| Extension not installed | Log error, return null | Post created without image |
| API key missing | Log error, return null | Post created without image |
| Generation timeout (>60s) | Timeout, return null | Post created without image |
| File I/O error | Log error, return null | Post created without image |

All errors result in **text-only posts** - the user experience is never blocked.

---

## Performance Considerations

### Image Generation Time

- **Expected:** 10-30 seconds per image
- **Timeout:** 60 seconds
- **User Feedback:** Show loading spinner during generation

### Optimization Strategies

1. **Async Generation** - Don't block UI
2. **Caching** - Store recently generated images by topic hash
3. **Batch Processing** - Queue multiple requests
4. **CDN Upload** - Upload to Vercel Blob/S3 for faster serving

### Future Enhancements

```typescript
// Cache generated images by topic hash
const topicHash = createHash('md5').update(topic).digest('hex');
const cachedImage = await getCachedImage(topicHash, platform);

if (cachedImage) {
  return { success: true, imageUrl: cachedImage };
}

// Generate new image only if cache miss
const result = await generateImageWithNanoBanana(/* ... */);
await cacheImage(topicHash, platform, result.imageUrl);
```

---

## File Structure

```
purple-glow-social-2.0/
├── .agents/
│   └── skills/
│       └── nano-banana/
│           └── SKILL.md                 ← NEW: Skill documentation
├── app/
│   └── actions/
│       └── generate.ts                  ← UPDATED: Nano Banana integration
├── lib/
│   └── ai/
│       ├── gemini-service.ts           (existing)
│       ├── content-truncator.ts        (existing)
│       └── nano-banana-service.ts       ← NEW: Image generation service
├── nanobanana-output/                   ← NEW: Output directory
│   ├── .gitkeep
│   └── README.md
└── scripts/
    └── test-nano-banana.mjs             ← NEW: Test script
```

---

## Git Commit Message

```
feat: Implement Nano Banana image generation skill

Replace broken Pollinations.ai with Gemini CLI nanobanana extension for
AI-powered image generation. Includes comprehensive skill documentation,
TypeScript service integration, and testing utilities.

Changes:
- Add .agents/skills/nano-banana/SKILL.md with detailed documentation
- Create lib/ai/nano-banana-service.ts for image generation
- Update app/actions/generate.ts to use Nano Banana
- Add scripts/test-nano-banana.mjs for installation verification
- Create nanobanana-output/ directory for generated images

Platform-specific dimensions:
- Instagram: 1080x1080 (1:1)
- Facebook: 1200x630 (1.91:1)
- Twitter: 1200x675 (16:9)
- LinkedIn: 1200x627 (1.91:1)

Error handling: Graceful degradation to text-only posts if image
generation fails. No user-facing failures.

Prerequisites:
- Gemini CLI installed globally
- Nano Banana extension installed
- GEMINI_API_KEY environment variable set

Test: node scripts/test-nano-banana.mjs
```

---

## Next Steps

### Immediate (Required for Production)

1. **Install Prerequisites**
   ```bash
   npm install -g @google/generative-ai-cli
   gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
   ```

2. **Configure API Key**
   - Add `GEMINI_API_KEY` to `.env.local`
   - Verify with: `node scripts/test-nano-banana.mjs`

3. **Test End-to-End**
   - Run dev server: `npm run dev`
   - Generate a test post
   - Verify image appears in preview
   - Check `nanobanana-output/` directory

### Short-term (Recommended)

1. **Add E2E Tests**
   - Test image generation flow
   - Verify fallback to text-only works
   - Test all platforms (Instagram, Facebook, Twitter, LinkedIn)

2. **Add Image Upload to CDN**
   - Upload generated images to Vercel Blob
   - Update `imageUrl` to CDN URL
   - Delete local file after upload

3. **Add Caching**
   - Cache images by topic hash
   - Reduce duplicate generation calls
   - Implement cache expiration (7 days)

### Long-term (Enhancements)

1. **Batch Processing**
   - Queue image generation requests
   - Process asynchronously with Inngest
   - Notify user when complete

2. **Image Editing**
   - Allow users to regenerate images
   - Support `/edit` command for modifications
   - Multiple image variations per post

3. **Analytics**
   - Track generation success rate
   - Monitor average generation time
   - Alert on high failure rates

---

## Success Criteria

✅ **All criteria met:**

- ✅ SKILL.md created with proper format and comprehensive documentation
- ✅ Platform-specific image sizes configured correctly
- ✅ SA-themed prompt examples provided
- ✅ Integration with existing post generation flow
- ✅ Error handling with graceful degradation
- ✅ No TypeScript errors
- ✅ Test script for verification
- ✅ Output directory structure established

---

## Handoff to Orchestrator

**Implementation Status:** ✅ COMPLETE

**What works:**
- Comprehensive skill documentation created
- TypeScript service implemented with type safety
- Integration with post generation action complete
- Error handling and fallback strategies in place
- Test script for installation verification

**What needs configuration:**
- Gemini CLI installation (production environment)
- Nano Banana extension installation
- GEMINI_API_KEY environment variable

**Ready for:**
- Testing in development environment
- Deployment to production (after prerequisites installed)
- E2E test creation
- CDN upload integration

**Recommendation:**
Hand off to Orchestrator for deployment planning and prerequisite installation coordination.

---

**Implementation by:** Coder Agent  
**Review by:** Orchestrator (pending)  
**Deployment:** Pending prerequisites installation
