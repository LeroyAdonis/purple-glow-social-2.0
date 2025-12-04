# AI Feedback Loop & Analytics Learning System

## Overview

A self-improving AI content generation system that learns from user engagement and feedback to continuously enhance prompt generation for social media posting.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interaction Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Generate   │  │   Feedback   │  │   Profile    │          │
│  │   Content    │  │   Submit     │  │   Update     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                   │
│  /api/ai/generate  │  /api/ai/feedback  │  /api/ai/learning     │
└─────────┬─────────────────┬─────────────────┬──────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Service Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ EnhancedGemini   │  │ LearningProfile  │  │  Analytics    │ │
│  │ Service          │──│ Service          │──│  Service      │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │         │
│           ▼                     ▼                     ▼         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Prompt Pattern Analyzer                      │  │
│  │         (Self-Learning Engine - Runs Daily)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Layer                                │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │postAnalytics│  │userLearning   │  │highPerforming        │  │
│  │            │  │Profiles        │  │Examples              │  │
│  └────────────┘  └────────────────┘  └──────────────────────┘  │
│  ┌────────────┐  ┌────────────────┐                            │
│  │content     │  │promptPatterns  │                            │
│  │Feedback    │  │                │                            │
│  └────────────┘  └────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. User Learning Profiles
- Tracks industry, target audience, and brand voice
- Learns preferred tones, languages, and topics from engagement data
- Identifies effective South African expressions per user
- Stores platform-specific insights (avg engagement, best times)

### 2. Few-Shot Learning
- Selects high-performing examples from user's post history
- Falls back to system-wide examples for new users
- Dynamically includes examples in Gemini prompts

### 3. Engagement Analytics
- Platform-specific engagement scoring (0-100)
- Weighted metrics: comments > shares > likes for learning
- Correlates engagement with generation parameters (topic, tone, language)

### 4. Feedback Collection
- Explicit feedback: thumbs up/down, star ratings
- Implicit feedback: edit tracking, selection tracking
- Rejection reasons for negative learning

### 5. Self-Learning Patterns
- Extracts successful patterns: openings, CTAs, SA expressions
- Tracks pattern effectiveness across all users
- Prunes underperforming patterns automatically
- Daily cron job updates system-wide insights

## API Reference

### POST /api/ai/feedback
Submit feedback on generated content.

```typescript
{
  content: string;
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'selected' | 'edited' | 'rejected';
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topic?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
  language?: string;
  editedContent?: string;
  rejectionReason?: string;
}
```

### GET /api/ai/analytics
Get analytics summary for the authenticated user.

Query params: `?days=30` (default 30, max 90)

Returns:
- totalPosts
- avgEngagement
- topPerformers
- platformBreakdown
- trendingTopics

### POST /api/ai/analytics
Record engagement metrics for a post.

```typescript
{
  postId: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    reach?: number;
  };
  generationContext?: {
    topic?: string;
    tone?: string;
    language?: string;
    promptVariation?: string;
  };
}
```

### GET /api/ai/learning
Get learning context for content generation.

Query params: `?platform=instagram`

### POST /api/ai/learning
Update user's industry context.

```typescript
{
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
}
```

### PUT /api/ai/learning
Trigger manual learning analysis for the user.

## Gemini Prompting Strategy

Based on official Gemini documentation, the enhanced prompts use:

1. **Structured XML Tags**: `<role>`, `<constraints>`, `<personalization>`, `<sa_context>`, `<examples>`, `<task>`, `<output_format>`, `<final_instruction>`

2. **Few-Shot Examples**: High-performing content from user's history included as examples

3. **Personalized Context**: Industry, brand voice, preferred tones injected into prompts

4. **SA Cultural Context**: Learned effective expressions, locations, and cultural notes

5. **Clear Constraints**: Character limits, language requirements, platform optimization

## Database Schema

### postAnalytics
Tracks engagement metrics for each published post with generation context correlation.

### userLearningProfiles
Stores accumulated learning per user including preferences, insights, and effective expressions.

### contentFeedback
Records explicit user feedback for learning (thumbs up/down, edits, rejections).

### promptPatterns
System-wide successful prompt patterns with effectiveness scoring.

### highPerformingExamples
Few-shot examples from posts with high engagement scores.

## South African Context

The system specifically learns and optimizes for:
- All 11 official SA languages
- Local expressions (howzit, lekker, sharp sharp, eish)
- Regional references (Joburg, Cape Town, Durban, Soweto)
- Cultural hashtags (#Mzansi, #LocalIsLekker, #ProudlySA)
- Seasonal and cultural events

## Cron Jobs

**Learn Patterns** (`/api/cron/learn-patterns`)
- Schedule: Daily at 3 AM SAST (1 AM UTC)
- Actions:
  1. Analyze system-wide prompt patterns
  2. Update pattern effectiveness scores
  3. Prune underperforming patterns
  4. Run learning analysis for active users

## Usage Example

```typescript
import { enhancedGeminiService } from '@/lib/ai/enhanced-gemini-service';

// Generate content with learning
const content = await enhancedGeminiService.generateContent({
  topic: 'Weekend sale announcement',
  platform: 'instagram',
  language: 'en',
  tone: 'energetic',
  includeHashtags: true,
  includeEmojis: true,
  userId: session.user.id, // Enables personalized learning
});

// Submit feedback
await enhancedGeminiService.submitFeedback(
  userId,
  content.content,
  'thumbs_up',
  {
    platform: 'instagram',
    topic: 'Weekend sale announcement',
    tone: 'energetic',
    language: 'en',
  }
);
```

## Future Enhancements

1. **Platform API Integration**: Fetch real engagement metrics from Instagram, Facebook, Twitter, LinkedIn APIs
2. **Feedback UI Components**: React components for inline feedback collection
3. **A/B Testing**: Test prompt variations and measure performance
4. **Trend Detection**: Identify trending topics and hashtags in SA
5. **Content Calendar Learning**: Optimize posting times based on engagement patterns
