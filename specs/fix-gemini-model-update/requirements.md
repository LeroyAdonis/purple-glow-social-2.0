# Fix Gemini Model Update - Requirements

## Problem Statement
The AI content generation feature is broken due to the deprecated `gemini-pro` model endpoint. The error message indicates:
> models/gemini-pro is not found for API version v1beta, or is not supported for generateContent.

## Root Cause
The Google Gemini API has deprecated the `gemini-pro` model. The current code uses:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

## Requirements

### R1: Update Gemini Model Reference
- Update the model from `gemini-pro` to a supported model (e.g., `gemini-1.5-flash` or `gemini-1.5-pro`)
- Ensure the updated model supports the `generateContent` method

### R2: Maintain Existing Functionality
- All existing features must continue to work:
  - Content generation for all 4 platforms (Facebook, Instagram, Twitter, LinkedIn)
  - Support for all 11 South African languages
  - Hashtag generation
  - Topic suggestions
  - Content variations

### R3: No Breaking Changes
- Keep the same interface and response format
- No changes to generation config parameters unless required by new model

## Acceptance Criteria
- [x] Post generation works without the model not found error
- [x] Generated content maintains quality and SA cultural context
- [x] All API endpoints using Gemini continue to function

## ✅ Implementation Complete
**Model updated**: `gemini-pro` → `gemini-2.5-flash-lite`
**File modified**: `lib/ai/gemini-service.ts`
