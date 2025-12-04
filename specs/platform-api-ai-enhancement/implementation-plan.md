# Platform API & AI Enhancement - Implementation Plan

## Overview

This implementation plan follows a phased approach to enhance platform API integrations and AI content generation for Purple Glow Social 2.0.

**Branch**: `feature/platform-api-ai-enhancement`

---

## Phase 1: OAuth 2.0 Security Enhancements

### 1.1 PKCE Implementation
- [x] Create `lib/oauth/pkce-utils.ts` with code_verifier and code_challenge generation
- [x] Update `lib/oauth/base-provider.ts` to include PKCE interface methods
- [ ] Update `lib/oauth/facebook-provider.ts` with PKCE support
- [ ] Update `lib/oauth/instagram-provider.ts` with PKCE support
- [x] Update `lib/oauth/twitter-provider.ts` with PKCE support (Twitter already requires PKCE)

### 1.2 State Parameter Security
- [x] Create `lib/oauth/state-manager.ts` for secure state token generation and validation
- [x] Implement state token storage with 10-minute expiry
- [x] Update OAuth callback routes to validate state tokens
- [x] Add state mismatch error handling and logging

### 1.3 Token Refresh Enhancement
- [x] Create `lib/oauth/token-refresh-service.ts` for centralized token refresh
- [x] Implement proactive refresh (24 hours before expiry)
- [x] Add exponential backoff retry logic for failed refreshes
- [x] Create cron job route `app/api/cron/refresh-tokens/route.ts`
- [ ] Add token expiry warning to dashboard UI

---

## Phase 2: LinkedIn Integration

### 2.1 LinkedIn OAuth Provider
- [x] Create `lib/oauth/linkedin-provider.ts` implementing OAuthProvider interface
- [x] Implement LinkedIn OAuth 2.0 authorization URL generation
- [x] Implement code-to-token exchange with LinkedIn API
- [x] Implement token refresh for LinkedIn
- [x] Implement user profile fetching from LinkedIn

### 2.2 LinkedIn API Routes
- [x] Create `app/api/oauth/linkedin/connect/route.ts` for OAuth initiation
- [x] Create `app/api/oauth/linkedin/callback/route.ts` for OAuth callback
- [x] Create `app/api/oauth/linkedin/disconnect/route.ts` for disconnection
- [ ] Add LinkedIn to connected accounts UI

### 2.3 LinkedIn Posting Service
- [x] Create `lib/posting/linkedin-poster.ts` with text posting
- [x] Implement LinkedIn image upload (asset registration flow)
- [x] Implement LinkedIn video upload (if supported)
- [x] Update `lib/posting/post-service.ts` to include LinkedIn

### 2.4 LinkedIn UI Integration
- [ ] Add LinkedIn option to platform selector in content generator
- [ ] Add LinkedIn connection card to settings page
- [ ] Update post preview for LinkedIn format
- [ ] Add LinkedIn-specific character limit (3000)

---

## Phase 3: Enhanced Media Upload

### 3.1 Facebook/Instagram Media Improvements
- [ ] Update `lib/posting/facebook-poster.ts` with resumable upload support
- [ ] Update `lib/posting/instagram-poster.ts` with proper container-based flow
- [ ] Add media container status polling for Instagram
- [ ] Implement retry logic for failed uploads

### 3.2 Twitter Media Upload
- [ ] Update `lib/posting/twitter-poster.ts` with chunked upload API
- [ ] Implement INIT, APPEND, FINALIZE flow for large media
- [ ] Add media processing status check
- [ ] Support video uploads with chunking

### 3.3 LinkedIn Media Upload
- [ ] Implement LinkedIn asset registration API
- [ ] Implement image upload to LinkedIn
- [ ] Implement video upload with LinkedIn's async processing
- [ ] Add upload progress tracking

---

## Phase 4: AI Content Generation Enhancement

### 4.1 Prompt Engineering Improvements
- [x] Create `lib/ai/prompt-templates.ts` with structured prompt templates
- [x] Implement few-shot examples for each SA language
- [x] Create tone-specific prompt variations (professional, casual, friendly, energetic)
- [x] Add platform-specific formatting instructions

### 4.2 Cultural Context Database
- [x] Create `lib/ai/sa-cultural-context.ts` with language-specific data
- [x] Add common phrases/expressions for each of 11 SA languages
- [x] Include regional references (cities, events, holidays)
- [x] Add cultural sensitivity guidelines per language

### 4.3 Content Quality Enhancement
- [ ] Implement character count validation before returning content
- [ ] Add language detection check on generated content
- [ ] Create content quality scoring system
- [ ] Implement automatic regeneration for low-quality outputs

### 4.4 Update Gemini Service
- [ ] Refactor `lib/ai/gemini-service.ts` to use new prompt templates
- [ ] Integrate cultural context database
- [ ] Add content validation pipeline
- [ ] Implement prompt A/B testing infrastructure

---

## Phase 5: Localization & Cultural Accuracy

### 5.1 SA Language Libraries
- [ ] Create `lib/ai/languages/english-sa.ts` with SA English expressions
- [ ] Create `lib/ai/languages/afrikaans.ts` with Afrikaans expressions
- [ ] Create `lib/ai/languages/zulu.ts` with isiZulu expressions
- [ ] Create `lib/ai/languages/xhosa.ts` with isiXhosa expressions
- [ ] Create `lib/ai/languages/sotho-north.ts` with Sepedi expressions
- [ ] Create `lib/ai/languages/tswana.ts` with Setswana expressions
- [ ] Create `lib/ai/languages/sotho-south.ts` with Sesotho expressions
- [ ] Create `lib/ai/languages/tsonga.ts` with Xitsonga expressions
- [ ] Create `lib/ai/languages/swati.ts` with siSwati expressions
- [ ] Create `lib/ai/languages/venda.ts` with Tshivenda expressions
- [ ] Create `lib/ai/languages/ndebele.ts` with isiNdebele expressions

### 5.2 Regional Context
- [ ] Create `lib/ai/regions/gauteng.ts` with Joburg/Pretoria references
- [ ] Create `lib/ai/regions/western-cape.ts` with Cape Town references
- [ ] Create `lib/ai/regions/kwazulu-natal.ts` with Durban references
- [ ] Create `lib/ai/regions/eastern-cape.ts` with regional references
- [ ] Implement region detection/selection in content generator

### 5.3 Cultural Sensitivity
- [ ] Create cultural sensitivity guidelines document
- [ ] Implement content review checklist
- [ ] Add warnings for potentially sensitive topics
- [ ] Create feedback mechanism for cultural accuracy

---

## Phase 6: Integration & Refinement

### 6.1 Dashboard Updates
- [ ] Add connection health status indicators
- [ ] Show token expiry warnings (7 days before expiry)
- [ ] Add LinkedIn to platform statistics
- [ ] Update content generator with new language options

### 6.2 Error Handling
- [ ] Implement consistent error responses across all platforms
- [ ] Add user-friendly error messages for common failures
- [ ] Create error recovery suggestions
- [ ] Add error tracking and analytics

### 6.3 Documentation
- [ ] Update AGENTS.md with LinkedIn integration
- [ ] Document new OAuth security features
- [ ] Create AI prompt engineering guide
- [ ] Update API documentation

---

## Phase 7: Delivery

### 7.1 Code Review Preparation
- [ ] Ensure all TypeScript types are properly defined
- [ ] Verify no `any` types are used
- [ ] Check all API routes have proper auth validation
- [ ] Validate all tokens are encrypted

### 7.2 Final Verification
- [ ] Test OAuth flows for all 4 platforms
- [ ] Test content generation in all 11 languages
- [ ] Test media uploads on all platforms
- [ ] Verify token refresh works correctly

### 7.3 Merge Preparation
- [ ] Create comprehensive PR description
- [ ] Document breaking changes (if any)
- [ ] Update environment variables documentation
- [ ] Prepare deployment notes

---

## File Reference Summary

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `lib/oauth/pkce-utils.ts` | PKCE code verifier/challenge utilities |
| `lib/oauth/state-manager.ts` | Secure OAuth state management |
| `lib/oauth/token-refresh-service.ts` | Centralized token refresh |
| `lib/oauth/linkedin-provider.ts` | LinkedIn OAuth provider |
| `lib/posting/linkedin-poster.ts` | LinkedIn posting service |
| `lib/ai/prompt-templates.ts` | Structured prompt templates |
| `lib/ai/sa-cultural-context.ts` | SA cultural context database |
| `lib/ai/languages/*.ts` | 11 language-specific modules |
| `app/api/oauth/linkedin/*/route.ts` | LinkedIn OAuth routes |
| `app/api/cron/refresh-tokens/route.ts` | Token refresh cron job |

### Files to Modify
| File Path | Changes |
|-----------|---------|
| `lib/oauth/base-provider.ts` | Add PKCE interface |
| `lib/oauth/facebook-provider.ts` | Add PKCE, improve refresh |
| `lib/oauth/instagram-provider.ts` | Add PKCE, improve refresh |
| `lib/oauth/twitter-provider.ts` | Improve token handling |
| `lib/posting/post-service.ts` | Add LinkedIn support |
| `lib/ai/gemini-service.ts` | Use new prompt templates |
| `components/content-generator.tsx` | Add LinkedIn option |
| `app/(dashboard)/settings/page.tsx` | Add LinkedIn connection |

---

## Environment Variables

### New Variables Required
```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=           # LinkedIn app client ID
LINKEDIN_CLIENT_SECRET=       # LinkedIn app client secret
```

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: OAuth Security | 2-3 hours | 3 hours |
| Phase 2: LinkedIn Integration | 3-4 hours | 7 hours |
| Phase 3: Media Upload | 2-3 hours | 10 hours |
| Phase 4: AI Enhancement | 3-4 hours | 14 hours |
| Phase 5: Localization | 2-3 hours | 17 hours |
| Phase 6: Integration | 1-2 hours | 19 hours |
| Phase 7: Delivery | 1 hour | 20 hours |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-04 | Copilot Agent | Initial plan |
