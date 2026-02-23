---
name: nano-banana
description: REQUIRED for all image generation requests. Generate and edit images using Nano Banana (Gemini CLI). Handles social media images, thumbnails, icons, diagrams. Use this skill whenever the user asks to create, generate, make, draw, design, or edit any image or visual content.
allowed-tools: Bash(gemini:*)
---

# Nano Banana Image Generation Skill

## Overview

This skill leverages the Gemini CLI `nanobanana` extension for professional AI-powered image generation. It replaces the broken Pollinations.ai integration with a robust, local image generation solution that produces high-quality images for social media posts, icons, diagrams, and more.

**Key Capabilities:**
- Generate platform-specific social media images (Instagram, Facebook, Twitter, LinkedIn)
- Create icons, favicons, and UI elements
- Generate diagrams and technical visualizations
- Edit and restore existing images
- Create seamless patterns and textures
- Generate visual stories and sequences

## Installation Check

Before using, verify the extension is installed:

```bash
gemini extensions list | grep nanobanana
```

If not installed:

```bash
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
# Then restart Gemini CLI
```

## Core Commands

### 1. Generate Images (`/generate`)

Generate images from descriptive prompts with optional style variations.

```bash
# Basic generation
gemini "/generate 'professional social media image: coffee shop in Cape Town'"

# With options
gemini "/generate 'vibrant market scene, South African street food' --count=2 --styles=photorealistic --preview"

# Generate specific dimensions (use --variations for different prompts)
gemini "/generate 'modern tech startup office, Johannesburg skyline' --count=1 --styles=professional,bright"
```

**Options:**
- `--count` - Number of images to generate (default: 1)
- `--styles` - Comma-separated style variations (photorealistic, oil-painting, vector, etc.)
- `--variations` - Generate prompt variations
- `--preview` - Auto-open image after generation

### 2. Edit Images (`/edit`)

Edit existing images with AI-guided modifications.

```bash
gemini "/edit input.png 'add South African flag in corner'"
gemini "/edit photo.jpg 'make colors more vibrant, add sunset lighting' --preview"
```

### 3. Generate Icons (`/icon`)

Create app icons, favicons, or UI elements in multiple sizes.

```bash
# Social media app icon
gemini "/icon 'purple social media app icon with glow effect' --sizes=512,256,128,64 --style=vector --background=transparent"

# Platform-specific icon
gemini "/icon 'content calendar icon' --sizes=1024 --style=flat --background=#8b5cf6"
```

**Options:**
- `--sizes` - Comma-separated pixel sizes (e.g., 32,128,256,512,1024)
- `--type` - Icon type (app, favicon, ui)
- `--style` - Visual style (vector, flat, gradient, 3d)
- `--background` - Background color (hex or 'transparent')

### 4. Generate Diagrams (`/diagram`)

Create technical diagrams, flowcharts, architecture diagrams.

```bash
gemini "/diagram 'OAuth authentication flow for social media posting'"
gemini "/diagram 'microservices architecture: post generation pipeline'"
```

### 5. Natural Language Entry (`/nanobanana`)

Let the extension auto-select the right tool based on your prompt.

```bash
gemini "/nanobanana Create a professional Instagram post image about South African tourism"
```

## Platform-Specific Image Sizes

### Social Media Dimensions

```markdown
| Platform  | Width | Height | Aspect Ratio |
|-----------|-------|--------|--------------|
| Instagram | 1080  | 1080   | 1:1 (square) |
| Facebook  | 1200  | 630    | 1.91:1       |
| Twitter   | 1200  | 675    | 16:9         |
| LinkedIn  | 1200  | 627    | 1.91:1       |
```

**Note:** Gemini CLI generates images at optimal resolutions. You may need to resize using external tools or specify dimensions in the prompt.

## South African Themed Prompts

### Examples for Different Platforms

**Instagram (1080x1080):**
```bash
gemini "/generate 'Square social media post: Table Mountain at sunset, vibrant purple and orange sky, professional photography, high quality' --styles=photorealistic --count=1"
```

**Facebook/LinkedIn (1200x630):**
```bash
gemini "/generate 'Wide social media banner: South African township culture, colorful street art, modern aesthetic, professional composition' --styles=photorealistic --count=1"
```

**Twitter (1200x675):**
```bash
gemini "/generate 'Social media image: Cape Town waterfront, V&A skyline, golden hour lighting, cinematic, 16:9 aspect ratio' --styles=photorealistic --count=1"
```

### Topic-Based Prompt Templates

**Business/Professional:**
```
"Professional office scene in Johannesburg, modern workspace, South African professionals collaborating, bright natural lighting, corporate aesthetic"
```

**Tourism/Culture:**
```
"Vibrant Cape Town street scene, local market with South African crafts, colorful textiles, warm afternoon light, cultural authenticity"
```

**Technology:**
```
"Modern tech startup in South Africa, diverse team working on laptops, innovative workspace, purple accent lighting, professional photography"
```

**Food/Lifestyle:**
```
"South African braai (barbecue) setup, traditional foods, outdoor setting with friends, warm social atmosphere, lifestyle photography"
```

## Integration with Post Generation Flow

### Workflow

1. **Receive post generation request** with topic, platform, and vibe
2. **Construct SA-themed prompt** based on topic and platform
3. **Generate image** using `/generate` command
4. **Save to output directory** (`./nanobanana-output/`)
5. **Return image path/URL** to post generation action

### Implementation Pattern

```typescript
// Example integration in app/actions/generate.ts
async function generateImageWithNanoBanana(
  topic: string,
  platform: string,
  vibe: string
): Promise<string | null> {
  try {
    // Platform dimensions mapping
    const dimensions = {
      instagram: "1080x1080 square",
      facebook: "1200x630 wide banner",
      twitter: "1200x675 16:9",
      linkedin: "1200x630 professional banner"
    };
    
    const aspectHint = dimensions[platform] || dimensions.instagram;
    
    // Construct SA-themed prompt
    const prompt = `Professional ${platform} social media image: ${topic}. 
South African context, ${vibe} style, ${aspectHint}, 
vibrant colors, high quality, photorealistic composition`;
    
    // Execute Gemini CLI command
    const outputDir = "./nanobanana-output";
    const timestamp = Date.now();
    const filename = `${platform}_${timestamp}.png`;
    
    // Run generation command
    await execAsync(
      `gemini "/generate '${prompt.replace(/'/g, "\\'")}' --count=1 --styles=photorealistic"`
    );
    
    // Move generated file to output directory with proper naming
    // (Gemini CLI saves to default location, move it to nanobanana-output)
    
    return `${outputDir}/${filename}`;
  } catch (error) {
    console.error("Nano Banana generation failed:", error);
    return null; // Non-critical, continue without image
  }
}
```

## Output Location

All generated images should be saved to:

```
./nanobanana-output/
```

**Naming Convention:**
```
{platform}_{topic_slug}_{timestamp}.png
```

Examples:
- `instagram_coffee_culture_1705920000000.png`
- `linkedin_tech_innovation_1705920001000.png`
- `facebook_tourism_cape_town_1705920002000.png`

## Error Handling & Fallback Strategies

### Common Errors

1. **Extension Not Installed**
   ```bash
   # Check installation
   gemini extensions list | grep nanobanana
   # If missing, install it
   gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
   ```

2. **API Key Not Configured**
   ```bash
   # Set Gemini API key
   export GEMINI_API_KEY="your-api-key"
   # Or in PowerShell
   $env:GEMINI_API_KEY = "your-api-key"
   ```

3. **Generation Timeout**
   - Default timeout: 60 seconds
   - Retry with simpler prompt
   - Fall back to text-only post

4. **Output File Not Found**
   - Check Gemini CLI default output location
   - Verify file permissions
   - Ensure output directory exists

### Fallback Strategy

```typescript
async function generatePostImage(/* params */): Promise<string | null> {
  try {
    // 1. Try Nano Banana
    const image = await generateWithNanoBanana(/* params */);
    if (image) return image;
  } catch (err) {
    logger.error("Nano Banana failed", { error: err });
  }
  
  // 2. Fall back to text-only post
  logger.info("Continuing with text-only post (no image)");
  return null;
}
```

## Testing & Verification

### Quick Test

```bash
# Test basic generation
gemini "/generate 'test image: purple social media icon' --count=1"

# Test with preview
gemini "/generate 'Cape Town Table Mountain at sunset' --preview"

# Check output location
ls -la ./nanobanana-output/
```

### Verification Checklist

- [ ] Extension is installed and activated
- [ ] API key is configured (GEMINI_API_KEY)
- [ ] Output directory exists and is writable
- [ ] Generated images have correct dimensions
- [ ] File naming follows convention
- [ ] Error handling works (test without API key)
- [ ] Integration with post generation is functional

## Advanced Usage

### Custom Styles

```bash
# Professional business
gemini "/generate 'corporate team meeting' --styles=professional,bright,clean"

# Artistic/Creative
gemini "/generate 'abstract art, South African colors' --styles=artistic,vibrant,abstract"

# Photorealistic
gemini "/generate 'Cape Town street photography' --styles=photorealistic,cinematic,4k"
```

### Batch Generation

For generating multiple variations:

```bash
gemini "/generate 'social media post: innovation in South Africa' --count=3 --variations"
```

### Pattern/Texture Generation

```bash
gemini "/pattern 'South African geometric patterns' --colors=#8b5cf6,#ec4899,#f59e0b --style=seamless"
```

## Best Practices

1. **Prompt Engineering**
   - Always include platform context (Instagram, LinkedIn, etc.)
   - Specify South African context for cultural relevance
   - Include quality descriptors (professional, high-quality, photorealistic)
   - Add lighting and color guidance (vibrant, warm, purple accent)

2. **File Management**
   - Clean up old generated images periodically
   - Use descriptive filenames with timestamps
   - Keep output directory organized

3. **Performance**
   - Cache recently generated images by topic hash
   - Set reasonable timeouts (30-60 seconds)
   - Use async/await for non-blocking generation

4. **Quality Control**
   - Test prompts manually before integrating
   - Monitor generation success rate
   - Keep fallback to text-only posts

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "gemini: command not found" | Install Gemini CLI, add to PATH |
| "Extension not found" | Run installation command, restart CLI |
| "API key invalid" | Set GEMINI_API_KEY environment variable |
| "Generation timeout" | Simplify prompt, check network connection |
| "File permission denied" | Check write permissions on output directory |
| "Image quality poor" | Add quality descriptors to prompt, use --styles |

## Resources

- [Gemini CLI Extensions](https://github.com/gemini-cli-extensions/nanobanana)
- [Nano Banana Documentation](https://deepwiki.com/gemini-cli-extensions/nanobanana/4-command-reference)
- [Command Reference Guide](https://www.geminicliextensions.com/extension/gemini-cli-extensions-nanobanana)

---

**Remember:** Always test image generation with a simple prompt first before integrating into the post generation pipeline. The extension is powerful but requires proper setup and prompt engineering for best results.
