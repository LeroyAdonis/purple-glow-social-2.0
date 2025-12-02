# Pollinations Image Generation - Requirements

## Problem Statement
Gemini image generation is geo-restricted in South Africa, causing the image preview to always be empty.

## Solution
Integrate Pollinations.ai - a free, open-source image generation API with no geo-restrictions and no API key required.

## Requirements

### R1: Generate Images via Pollinations API
- Use Pollinations.ai URL-based API: `https://image.pollinations.ai/prompt/{prompt}`
- Generate images based on post topic and platform
- Include South African context in image prompts

### R2: Platform-Specific Image Dimensions
- Instagram: 1024x1024 (1:1 square)
- Facebook: 1200x630 (landscape)
- Twitter: 1200x675 (landscape)
- LinkedIn: 1200x627 (landscape)

### R3: No Breaking Changes
- Maintain existing content generation flow
- Image generation should not block text generation
- Gracefully handle API failures

## API Reference
```
URL Format: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}&model={model}

Parameters:
- prompt: URL-encoded text prompt
- width: Image width in pixels
- height: Image height in pixels  
- model: flux, turbo (default: flux)
- nologo: true (remove watermark)
- seed: number (for reproducibility)
```

## Acceptance Criteria
- [x] Images generate successfully for all platforms
- [x] Images display in preview
- [x] No API key required
- [x] Works in South Africa
