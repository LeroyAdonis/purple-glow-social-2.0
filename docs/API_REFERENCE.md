# Purple Glow Social 2.0 - Complete API Reference

> **Version:** 2.0  
> **Last Updated:** January 2025  
> **Base URL:** `https://purpleglow.co.za/api` (Production) | `http://localhost:3000/api` (Development)

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#1-authentication-endpoints)
   - [OAuth Connections](#2-oauth-connection-endpoints)
   - [AI Content Generation](#3-ai-content-generation-endpoints)
   - [Post Publishing](#4-post-publishing-endpoints)
   - [User Management](#5-user-management-endpoints)
   - [Payments & Subscriptions](#6-payments--subscriptions-endpoints)
   - [Admin](#7-admin-endpoints)
   - [Utilities](#8-utility-endpoints)
6. [Webhooks](#webhooks)
7. [South African Languages](#south-african-languages)
8. [Tier Limits](#tier-limits)
9. [SDKs & Examples](#sdks--examples)
10. [Testing](#testing)

---

## Overview

Purple Glow Social 2.0 provides a RESTful API for AI-powered social media management. The API enables:

- **AI Content Generation** using Google Gemini Pro
- **Multi-platform Publishing** to Facebook, Instagram, Twitter/X, and LinkedIn
- **Scheduling & Automation** with queue management
- **Credit-based Usage** with tier-based limits
- **Full Internationalization** supporting all 11 South African languages

### API Conventions

- All requests and responses use JSON format
- Timestamps are in ISO 8601 format (UTC)
- Currency amounts are in South African Rand (ZAR) cents
- All endpoints require HTTPS in production

### Content-Type

```
Content-Type: application/json
```

---

## Authentication

Purple Glow Social uses **Better-auth** for session-based authentication.

### Session Cookie

All protected endpoints require a valid session cookie:

```
Cookie: better-auth.session_token=<session_token>
```

### Obtaining a Session

1. **Sign Up** - `POST /api/auth/sign-up/email`
2. **Sign In** - `POST /api/auth/sign-in/email`
3. **OAuth** - `GET /api/auth/sign-in/social` (Google)

### Session Duration

- Sessions expire after **7 days** of inactivity
- Sessions are automatically refreshed on activity

### Protected Routes

Most API endpoints require authentication. Unauthenticated requests return:

```json
{
  "error": "Unauthorized"
}
```

**Status Code:** `401 Unauthorized`

---

## Rate Limiting

Rate limits protect the API from abuse and ensure fair usage.

### Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 1 minute |
| Authentication | 5 attempts | 15 minutes |
| AI Generation | 10 requests | 1 minute |
| Hashtag/Topic Generation | 20 requests | 1 minute |
| Post Publishing | 5 requests | 1 minute |
| Post Scheduling | 10 requests | 1 minute |
| OAuth Connection | 5 requests | 1 minute |
| Admin Endpoints | 50 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704067200
```

### Rate Limit Exceeded Response

**Status Code:** `429 Too Many Requests`

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45
}
```

---

## Error Handling

### Standard Error Format

All errors follow a consistent format:

```json
{
  "error": "Error type or message",
  "message": "Human-readable description (optional)",
  "code": "ERROR_CODE (optional)",
  "details": {} 
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input or validation error |
| `401` | Unauthorized | Authentication required |
| `402` | Payment Required | Insufficient credits |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Service temporarily unavailable |

### Validation Errors

**Status Code:** `400 Bad Request`

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "topic",
      "message": "Topic is required"
    },
    {
      "field": "platform",
      "message": "Invalid platform"
    }
  ]
}
```

### Insufficient Credits

**Status Code:** `402 Payment Required`

```json
{
  "error": "Insufficient credits",
  "message": "You need 3 credits but only have 1",
  "creditsNeeded": 3,
  "currentBalance": 1
}
```

---

## API Endpoints

### 1. Authentication Endpoints

Better-auth handles all authentication. These endpoints are automatically provided.

---

#### POST /api/auth/sign-up/email

Create a new user account with email and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Thabo Nkosi"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "Thabo Nkosi",
    "emailVerified": false,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "session": {
    "id": "sess_xyz789",
    "expiresAt": "2025-01-22T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input
```json
{
  "error": "Password must be at least 8 characters"
}
```

- **409 Conflict** - Email already exists
```json
{
  "error": "User with this email already exists"
}
```

---

#### POST /api/auth/sign-in/email

Sign in with email and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "Thabo Nkosi",
    "emailVerified": true
  },
  "session": {
    "id": "sess_xyz789",
    "expiresAt": "2025-01-22T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **401 Unauthorized** - Invalid credentials
```json
{
  "error": "Invalid email or password"
}
```

- **429 Too Many Requests** - Too many failed attempts
```json
{
  "error": "Too many login attempts. Try again in 15 minutes."
}
```

---

#### POST /api/auth/sign-out

Sign out and invalidate the current session.

**Authentication:** Required

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true
}
```

---

#### GET /api/auth/session

Get the current session and user information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "Thabo Nkosi",
    "emailVerified": true,
    "image": "https://example.com/avatar.jpg"
  },
  "session": {
    "id": "sess_xyz789",
    "expiresAt": "2025-01-22T10:30:00.000Z"
  }
}
```

**Response (401 Unauthorized):** No active session
```json
{
  "user": null,
  "session": null
}
```

---

#### POST /api/auth/forgot-password

Request a password reset email.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account exists, a reset email has been sent"
}
```

---

#### POST /api/auth/reset-password

Reset password using token from email.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid or expired token
```json
{
  "error": "Invalid or expired reset token"
}
```

---

### 2. OAuth Connection Endpoints

Connect social media accounts for posting. Supports Facebook, Instagram, Twitter/X, and LinkedIn.

---

#### GET /api/oauth/{platform}/connect

Initiate OAuth flow to connect a social media account.

**Platforms:** `facebook`, `instagram`, `twitter`, `linkedin`

**Authentication:** Required

**Rate Limit:** 5 requests per minute

**Query Parameters:** None

**Response:** Redirects to platform's OAuth authorization page

**Flow:**
1. User visits `/api/oauth/facebook/connect`
2. Server generates CSRF state token
3. Server redirects to Facebook's OAuth page
4. User authorizes the app
5. Facebook redirects to `/api/oauth/facebook/callback`

**Error Responses:**

- **401 Unauthorized** - Not authenticated
- **404 Not Found** - User not found
- **429 Too Many Requests** - Rate limit exceeded

**Tier Limit Error:** Redirects to dashboard with error params
```
/dashboard?error=tier_limit&message=Connection+limit+reached&platform=facebook
```

---

#### GET /api/oauth/{platform}/callback

Handle OAuth callback from social platform.

**Platforms:** `facebook`, `instagram`, `twitter`, `linkedin`

**Authentication:** Via OAuth state cookie

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Authorization code from platform |
| `state` | string | CSRF state token |
| `error` | string | Error code (if authorization failed) |

**Success Response:** Redirects to:
```
/oauth/callback/success?platform=facebook
```

**Error Response:** Redirects to:
```
/oauth/callback/error?error=<error_message>
```

**Notes:**
- Tokens are encrypted with AES-256-GCM before storage
- Twitter uses PKCE (Proof Key for Code Exchange) for additional security

---

#### POST /api/oauth/{platform}/disconnect

Disconnect a social media account.

**Platforms:** `facebook`, `instagram`, `twitter`, `linkedin`

**Authentication:** Required

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Facebook account disconnected successfully"
}
```

**Error Responses:**

- **401 Unauthorized** - Not authenticated
- **500 Internal Server Error** - Disconnect failed

**Notes:**
- Attempts to revoke token on platform (best effort)
- Always deletes local connection even if revocation fails

---

#### GET /api/oauth/connections

Get all connected social media accounts for the current user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "connections": [
    {
      "id": "conn_abc123",
      "platform": "facebook",
      "platformUsername": "thabo.nkosi",
      "platformDisplayName": "Thabo Nkosi",
      "profileImageUrl": "https://facebook.com/avatar.jpg",
      "isActive": true,
      "lastSyncedAt": "2025-01-15T10:30:00.000Z",
      "tokenExpiresAt": "2025-03-15T10:30:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "conn_def456",
      "platform": "twitter",
      "platformUsername": "@thabo_nkosi",
      "platformDisplayName": "Thabo Nkosi 🇿🇦",
      "profileImageUrl": "https://twitter.com/avatar.jpg",
      "isActive": true,
      "lastSyncedAt": "2025-01-15T09:00:00.000Z",
      "tokenExpiresAt": null,
      "createdAt": "2025-01-05T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Encrypted tokens are never exposed in the response
- `tokenExpiresAt` is null for platforms with non-expiring tokens

---

### 3. AI Content Generation Endpoints

Generate social media content using Google Gemini Pro AI.

---

#### POST /api/ai/generate

Generate AI-powered social media content.

**Authentication:** Required

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "topic": "Small business success tips for Johannesburg entrepreneurs",
  "platform": "twitter",
  "language": "en",
  "tone": "friendly",
  "includeHashtags": true,
  "includeEmojis": true,
  "variations": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Content topic (max 500 chars) |
| `platform` | string | Yes | `facebook`, `instagram`, `twitter`, `linkedin` |
| `language` | string | No | Language code (default: `en`) |
| `tone` | string | No | `professional`, `casual`, `friendly`, `energetic` (default: `friendly`) |
| `includeHashtags` | boolean | No | Include hashtags (default: `true`) |
| `includeEmojis` | boolean | No | Include emojis (default: `true`) |
| `variations` | number | No | Number of variations 1-3 (default: `1`) |

**Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "content": "🚀 Ready to take your Joburg business to the next level? Here are 5 game-changing tips that local entrepreneurs swear by!\n\n1. Network at local markets\n2. Embrace mobile payments\n3. Use social media stories\n4. Partner with fellow SMEs\n5. Join business WhatsApp groups\n\nShare your best tip below! 👇\n\n#JoburgBusiness #SAEntrepreneur #LocalIsLekker #SMETips",
      "platform": "twitter",
      "characterCount": 298,
      "hashtags": ["#JoburgBusiness", "#SAEntrepreneur", "#LocalIsLekker", "#SMETips"],
      "imagePrompt": "Vibrant image of diverse South African entrepreneurs collaborating in a modern Johannesburg co-working space"
    }
  ],
  "credits": 450,
  "dailyGenerations": {
    "used": 12,
    "limit": 50,
    "remaining": 38
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input
```json
{
  "error": "Topic and platform are required"
}
```

- **429 Too Many Requests** - Daily limit reached
```json
{
  "error": "Daily generation limit reached",
  "limit": 50,
  "current": 50,
  "remaining": 0
}
```

- **429 Too Many Requests** - Rate limit
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many AI generation requests. Try again in 45 seconds.",
  "retryAfter": 45
}
```

**Notes:**
- Credits are NOT deducted for generation (only for publishing)
- Daily generation limits are tier-based
- Content is optimized for each platform's character limits

---

#### POST /api/ai/hashtags

Generate hashtag suggestions for a topic.

**Authentication:** Required

**Rate Limit:** 20 requests per minute

**Request Body:**
```json
{
  "topic": "Cape Town tourism",
  "count": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Topic for hashtags |
| `count` | number | No | Number of hashtags (default: `10`, max: `20`) |

**Response (200 OK):**
```json
{
  "success": true,
  "hashtags": [
    "#CapeTown",
    "#VisitCapeTown",
    "#SouthAfricaTravel",
    "#TableMountain",
    "#MotherCity",
    "#WesternCape",
    "#TravelSA",
    "#ExploreSouthAfrica",
    "#CapeTownVibes",
    "#MzansiTravel"
  ]
}
```

---

#### POST /api/ai/topics

Get AI-generated topic suggestions by industry.

**Authentication:** Required

**Rate Limit:** 20 requests per minute

**Request Body:**
```json
{
  "industry": "restaurant"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `industry` | string | No | Industry type (default: `general business`) |

**Response (200 OK):**
```json
{
  "success": true,
  "topics": [
    "Behind-the-scenes kitchen tour",
    "Spotlight on local ingredient suppliers",
    "Customer favourite dishes of the month",
    "Meet our chef and their culinary journey",
    "Weekend specials and promotions",
    "Food pairing tips for SA wines",
    "Celebrating local food traditions",
    "Sustainable dining practices",
    "Recipe sneak peeks",
    "Community events and pop-ups"
  ]
}
```

---

#### POST /api/ai/feedback

Submit feedback on generated content to improve AI learning.

**Authentication:** Required

**Request Body:**
```json
{
  "content": "The generated post content...",
  "feedbackType": "thumbs_up",
  "platform": "instagram",
  "topic": "Small business tips",
  "tone": "friendly",
  "language": "en",
  "editedContent": "Modified content if edited...",
  "rejectionReason": "Reason if rejected..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The generated content |
| `feedbackType` | string | Yes | `thumbs_up`, `thumbs_down`, `selected`, `edited`, `rejected` |
| `platform` | string | Yes | Platform the content was for |
| `topic` | string | No | Original topic |
| `tone` | string | No | Tone used |
| `language` | string | No | Language used |
| `editedContent` | string | No | User's edited version |
| `rejectionReason` | string | No | Why content was rejected |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback recorded successfully"
}
```

---

#### GET /api/ai/analytics

Get AI generation analytics for the user.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `days` | number | Number of days to analyze (default: `30`, max: `90`) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalGenerations": 145,
    "byPlatform": {
      "facebook": 40,
      "instagram": 55,
      "twitter": 30,
      "linkedin": 20
    },
    "byTone": {
      "professional": 45,
      "casual": 30,
      "friendly": 50,
      "energetic": 20
    },
    "topTopics": [
      "Business tips",
      "Product launches",
      "Industry news"
    ],
    "successRate": 94.5
  }
}
```

---

#### GET /api/ai/learning

Get user's AI learning profile and preferences.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | Platform context (default: `instagram`) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "industry": "retail",
    "targetAudience": "Young professionals in South Africa",
    "brandVoice": "Friendly and approachable",
    "preferredTopics": ["Product showcases", "Customer stories"],
    "avoidTopics": ["Politics", "Controversial subjects"],
    "platformPreferences": {
      "instagram": {
        "preferredTone": "casual",
        "hashtagCount": 15,
        "emojiUsage": "high"
      }
    }
  }
}
```

#### POST /api/ai/learning

Update user's learning profile.

**Authentication:** Required

**Request Body:**
```json
{
  "industry": "retail",
  "targetAudience": "Young professionals",
  "brandVoice": "Friendly and approachable"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Learning profile updated"
}
```

#### PUT /api/ai/learning

Trigger learning analysis based on feedback history.

**Authentication:** Required

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Learning analysis triggered"
}
```

---

### 4. Post Publishing Endpoints

Publish content to connected social media platforms.

---

#### POST /api/posts/publish

Immediately publish a post to one or more platforms.

**Authentication:** Required

**Rate Limit:** 5 requests per minute

**Request Body:**
```json
{
  "platforms": ["facebook", "twitter"],
  "content": "🚀 Excited to announce our new product launch! #Innovation #SouthAfrica",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com/product"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platforms` | string[] | Yes | Platforms to publish to |
| `platform` | string | Yes* | Single platform (alternative to `platforms`) |
| `content` | string | Yes | Post content |
| `imageUrl` | string | No | Image URL (required for Instagram) |
| `link` | string | No | Link to include |

**Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "platform": "facebook",
      "success": true,
      "postId": "fb_123456789",
      "postUrl": "https://facebook.com/post/123456789"
    },
    {
      "platform": "twitter",
      "success": true,
      "postId": "tw_987654321",
      "postUrl": "https://twitter.com/user/status/987654321"
    }
  ],
  "creditsDeducted": 2,
  "creditsRemaining": 448
}
```

**Partial Success Response (200 OK):**
```json
{
  "success": true,
  "partial": true,
  "message": "Published to 1 of 2 platforms",
  "results": [
    {
      "platform": "facebook",
      "success": true,
      "postId": "fb_123456789",
      "postUrl": "https://facebook.com/post/123456789"
    },
    {
      "platform": "twitter",
      "success": false,
      "error": "Rate limit exceeded on Twitter"
    }
  ],
  "creditsDeducted": 1,
  "creditsRemaining": 449
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input
```json
{
  "error": "At least one platform and content are required"
}
```

- **400 Bad Request** - Instagram requires image
```json
{
  "error": "Instagram posts require an image"
}
```

- **402 Payment Required** - Insufficient credits
```json
{
  "error": "Insufficient credits",
  "message": "You need 2 credits but only have 1",
  "required": 2,
  "available": 1
}
```

- **429 Too Many Requests** - Daily limit reached
```json
{
  "error": "Daily post limit reached for twitter",
  "platform": "twitter",
  "limit": 10,
  "current": 10
}
```

**Notes:**
- 1 credit is deducted per platform per successful post
- Failed posts are automatically refunded
- Instagram requires an image URL

---

#### POST /api/posts/schedule

Schedule a post for future publishing.

**Authentication:** Required

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "postId": "post_abc123",
  "scheduledDate": "2025-01-20T14:00:00.000Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `postId` | string (UUID) | Yes | ID of the post to schedule |
| `scheduledDate` | string (ISO 8601) | Yes | When to publish |

**Response (200 OK):**
```json
{
  "success": true,
  "post": {
    "id": "post_abc123",
    "status": "scheduled",
    "scheduledDate": "2025-01-20T14:00:00.000Z"
  },
  "message": "Post scheduled successfully",
  "creditsReserved": 1,
  "creditsAvailable": 447,
  "reservationId": "res_xyz789",
  "queuePosition": 5,
  "queueLimit": 50
}
```

**Error Responses:**

- **400 Bad Request** - Invalid data
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "path": ["scheduledDate"],
      "message": "Invalid datetime format"
    }
  ]
}
```

- **402 Payment Required** - Insufficient credits
```json
{
  "error": "Insufficient credits",
  "required": 1,
  "available": 0
}
```

- **403 Forbidden** - Post belongs to another user
```json
{
  "error": "Unauthorized"
}
```

- **404 Not Found** - Post not found
```json
{
  "error": "Post not found"
}
```

- **429 Too Many Requests** - Queue full
```json
{
  "error": "Queue size limit reached",
  "limit": 50,
  "current": 50
}
```

**Notes:**
- Credits are reserved when scheduling (deducted on publish)
- Queue size limits are tier-based
- Advance scheduling days are tier-based

---

#### POST /api/posts/scheduled/publish

Manually publish a scheduled or draft post immediately.

**Authentication:** Required

**Request Body:**
```json
{
  "postId": "post_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "platform": "instagram",
  "postId": "ig_123456789",
  "postUrl": "https://instagram.com/p/abc123"
}
```

**Error Responses:**

- **400 Bad Request** - Post not schedulable
```json
{
  "error": "Post is not scheduled or draft"
}
```

- **404 Not Found** - Post not found
```json
{
  "error": "Post not found"
}
```

---

#### GET /api/user/posts

Get the current user's posts.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `draft`, `scheduled`, `posted`, `failed` |
| `platform` | string | Filter: `facebook`, `instagram`, `twitter`, `linkedin` |
| `limit` | number | Results per page (default: `50`) |
| `offset` | number | Pagination offset (default: `0`) |

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post_abc123",
      "content": "Excited to share our latest update! 🚀",
      "platform": "twitter",
      "status": "posted",
      "scheduledDate": null,
      "postedAt": "2025-01-15T10:30:00.000Z",
      "platformPostId": "tw_123456789",
      "platformPostUrl": "https://twitter.com/status/123456789",
      "imageUrl": null,
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": "post_def456",
      "content": "Coming soon! Stay tuned...",
      "platform": "instagram",
      "status": "scheduled",
      "scheduledDate": "2025-01-20T14:00:00.000Z",
      "postedAt": null,
      "platformPostId": null,
      "platformPostUrl": null,
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2025-01-14T09:00:00.000Z"
    }
  ],
  "stats": {
    "total": 45,
    "posted": 30,
    "scheduled": 10,
    "draft": 3,
    "failed": 2
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 5. User Management Endpoints

Manage user profiles, settings, and data.

---

#### GET /api/user/profile

Get the current user's profile information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "usr_abc123",
  "name": "Thabo Nkosi",
  "email": "thabo@example.com",
  "tier": "pro",
  "credits": 450,
  "image": "https://example.com/avatar.jpg",
  "emailVerified": true
}
```

---

#### PATCH /api/user/profile

Update user profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Thabo M. Nkosi",
  "image": "https://example.com/new-avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "name": "Thabo M. Nkosi",
    "email": "thabo@example.com",
    "image": "https://example.com/new-avatar.jpg",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### GET /api/user/automation-rules

Get user's automation rules.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `isActive` | boolean | Filter by active status |
| `limit` | number | Results per page (default: `50`) |
| `offset` | number | Pagination offset (default: `0`) |

**Response (200 OK):**
```json
{
  "rules": [
    {
      "id": "rule_abc123",
      "frequency": "weekly",
      "coreTopic": "Industry news and updates",
      "isActive": true,
      "nextRun": "2025-01-22T09:00:00.000Z",
      "lastRun": "2025-01-15T09:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "stats": {
    "total": 3,
    "active": 2
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

#### POST /api/user/automation-rules

Create a new automation rule.

**Authentication:** Required

**Request Body:**
```json
{
  "frequency": "weekly",
  "coreTopic": "Product tips and tutorials",
  "isActive": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `frequency` | string | No | `daily`, `weekly`, `monthly` (default: `weekly`) |
| `coreTopic` | string | No | Topic for content generation |
| `isActive` | boolean | No | Whether rule is active (default: `true`) |

**Response (200 OK):**
```json
{
  "success": true,
  "rule": {
    "id": "rule_xyz789",
    "frequency": "weekly",
    "coreTopic": "Product tips and tutorials",
    "isActive": true,
    "nextRun": "2025-01-22T09:00:00.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **403 Forbidden** - Automation not available or limit reached
```json
{
  "error": "Automation rule limit reached",
  "limit": 5,
  "current": 5
}
```

---

#### PATCH /api/user/automation-rules

Update an automation rule.

**Authentication:** Required

**Request Body:**
```json
{
  "id": "rule_abc123",
  "frequency": "daily",
  "coreTopic": "Updated topic",
  "toggle": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Rule ID |
| `toggle` | boolean | No | If true, toggles isActive |
| Other fields | varies | No | Fields to update |

**Response (200 OK):**
```json
{
  "success": true,
  "rule": {
    "id": "rule_abc123",
    "frequency": "daily",
    "coreTopic": "Updated topic",
    "isActive": true,
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### DELETE /api/user/automation-rules

Delete an automation rule.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Rule ID (required) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Automation rule deleted"
}
```

---

#### GET /api/user/billing-history

Get user's billing history/invoices.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Number of invoices (default: `12`) |

**Response (200 OK):**
```json
{
  "invoices": [
    {
      "id": "inv_abc123",
      "date": "2025-01-01T00:00:00.000Z",
      "description": "Pro Plan - Monthly",
      "amount": 29900,
      "currency": "ZAR",
      "status": "paid",
      "invoiceUrl": "https://polar.sh/invoice/abc123"
    }
  ]
}
```

---

#### GET /api/user/export

Export all user data (POPIA compliance).

**Authentication:** Required

**Response (200 OK):**

Returns a downloadable JSON file:

```json
{
  "exportedAt": "2025-01-15T10:30:00.000Z",
  "exportVersion": "1.0",
  "dataController": "Purple Glow Social (Pty) Ltd",
  "user": {
    "id": "usr_abc123",
    "name": "Thabo Nkosi",
    "email": "thabo@example.com",
    "tier": "pro",
    "credits": 450,
    "createdAt": "2024-06-01T00:00:00.000Z"
  },
  "posts": [...],
  "automationRules": [...],
  "connectedAccounts": [...],
  "transactions": [...],
  "subscriptions": [...],
  "notifications": [...],
  "generationLogs": [...],
  "dailyUsage": [...],
  "contentFeedback": [...],
  "learningProfile": {...}
}
```

**Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="purple-glow-data-export-2025-01-15.json"
```

**Notes:**
- Encrypted tokens are excluded for security
- Required for POPIA/GDPR compliance (Right to Data Portability)

---

#### POST /api/user/delete

Permanently delete user account and all data (POPIA compliance).

**Authentication:** Required

**Request Body:**
```json
{
  "confirm": "DELETE_MY_ACCOUNT",
  "email": "thabo@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Your account and all associated data have been permanently deleted.",
  "deletedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Confirmation required
```json
{
  "error": "Confirmation required",
  "message": "Send { \"confirm\": \"DELETE_MY_ACCOUNT\", \"email\": \"your@email.com\" } to confirm deletion"
}
```

**Notes:**
- This action is irreversible
- All user data is permanently deleted
- Transaction records are anonymized for tax compliance
- Required for POPIA/GDPR compliance (Right to Erasure)

---

### 6. Payments & Subscriptions Endpoints

Manage credits, subscriptions, and transactions via Polar.sh.

---

#### POST /api/checkout/credits

Create a checkout session to purchase credits.

**Authentication:** Required

**Request Body:**
```json
{
  "packageId": "credits_100"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `packageId` | string | Yes | Credit package ID |

**Available Packages:**
| Package ID | Credits | Price (ZAR) |
|------------|---------|-------------|
| `credits_50` | 50 | R49 |
| `credits_100` | 100 | R89 |
| `credits_250` | 250 | R199 |
| `credits_500` | 500 | R349 |

**Response (200 OK):**
```json
{
  "success": true,
  "checkoutUrl": "https://polar.sh/checkout/abc123",
  "checkoutId": "chk_abc123"
}
```

---

#### POST /api/checkout/subscription

Create a checkout session for subscription upgrade.

**Authentication:** Required

**Request Body:**
```json
{
  "planId": "pro",
  "billingCycle": "monthly"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | string | Yes | `pro` or `business` |
| `billingCycle` | string | Yes | `monthly` or `annual` |

**Pricing:**
| Plan | Monthly | Annual |
|------|---------|--------|
| Pro | R299/mo | R2,999/yr (save R590) |
| Business | R799/mo | R7,999/yr (save R1,589) |

**Response (200 OK):**
```json
{
  "success": true,
  "checkoutUrl": "https://polar.sh/checkout/xyz789",
  "checkoutId": "chk_xyz789"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid plan or cycle
```json
{
  "error": "Invalid plan ID"
}
```

---

#### GET /api/checkout/success

Handle successful checkout redirect.

**Authentication:** Not required (redirect endpoint)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | `credits` or `subscription` |
| `packageId` | string | Credit package (for credits) |
| `planId` | string | Plan ID (for subscription) |
| `billingCycle` | string | Billing cycle (for subscription) |

**Response:** Redirects to:
```
/dashboard?payment_success=true&payment_type=credits&package_id=credits_100
```

---

#### GET /api/checkout/cancel

Handle cancelled checkout redirect.

**Authentication:** Not required (redirect endpoint)

**Response:** Redirects to:
```
/dashboard?payment_canceled=true
```

---

#### GET /api/subscription

Get user's active subscription.

**Authentication:** Required

**Response (200 OK):** Active subscription
```json
{
  "success": true,
  "subscription": {
    "id": "sub_abc123",
    "planId": "pro",
    "billingCycle": "monthly",
    "status": "active",
    "currentPeriodStart": "2025-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2025-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

**Response (200 OK):** No subscription
```json
{
  "success": true,
  "subscription": null
}
```

---

#### DELETE /api/subscription

Cancel user's subscription.

**Authentication:** Required

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription will be canceled at the end of the billing period"
}
```

**Error Responses:**

- **404 Not Found** - No active subscription
```json
{
  "error": "No active subscription found"
}
```

---

#### GET /api/transactions

Get user's transaction history.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn_abc123",
      "type": "credit_purchase",
      "amount": 89.00,
      "currency": "ZAR",
      "status": "completed",
      "credits": 100,
      "description": "100 Credits Package",
      "date": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": "txn_def456",
      "type": "subscription",
      "amount": 299.00,
      "currency": "ZAR",
      "status": "completed",
      "credits": 500,
      "description": "Pro Plan - Monthly",
      "date": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Amounts are in ZAR (converted from cents)
- Includes both credit purchases and subscription payments

---

### 7. Admin Endpoints

Administrative endpoints for platform management. Requires admin role.

**Admin Access:** Email ending in `@purpleglow.co.za` or listed in `ADMIN_EMAILS` env variable.

---

#### GET /api/admin/users

Get all users with statistics.

**Authentication:** Required (Admin only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Results per page (default: `50`) |
| `offset` | number | Pagination offset (default: `0`) |

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "usr_abc123",
      "name": "Thabo Nkosi",
      "email": "thabo@example.com",
      "tier": "pro",
      "credits": 450,
      "postsCount": 125,
      "rulesCount": 3,
      "createdAt": "2024-06-01T00:00:00.000Z",
      "lastActiveAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "total": 1250,
    "tierDistribution": {
      "free": 950,
      "pro": 250,
      "business": 50
    }
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

#### PATCH /api/admin/users

Update a user's tier or credits.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "userId": "usr_abc123",
  "tier": "business",
  "creditAdjustment": 100
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID to update |
| `tier` | string | No | New tier: `free`, `pro`, `business` |
| `creditAdjustment` | number | No | Credits to add (+) or remove (-) |

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "tier": "business",
    "credits": 550
  },
  "message": "User updated successfully"
}
```

---

#### GET /api/admin/stats

Get platform-wide statistics.

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "platform": {
    "totalUsers": 1250,
    "activeUsers": 450,
    "totalPosts": 15000,
    "scheduledPosts": 1200,
    "postedPosts": 13500,
    "totalAutomationRules": 180,
    "activeAutomationRules": 120
  },
  "revenue": {
    "totalRevenue": 125000,
    "mrr": 45000,
    "thisMonth": 52000,
    "lastMonth": 48000
  },
  "users": {
    "total": 1250,
    "active": 450,
    "tierDistribution": {
      "free": 950,
      "pro": 250,
      "business": 50
    }
  },
  "posts": {
    "total": 15000,
    "scheduled": 1200,
    "posted": 13500
  },
  "automation": {
    "total": 180,
    "active": 120
  }
}
```

---

#### GET /api/admin/analytics

Get comprehensive platform analytics.

**Authentication:** Required (Admin only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `days` | number | Analysis period (default: `30`) |

**Response (200 OK):**
```json
{
  "credits": {
    "totalCreditsUsed": 5420,
    "byPlatform": {
      "facebook": 1500,
      "instagram": 2200,
      "twitter": 1200,
      "linkedin": 520
    },
    "byContentType": {
      "text_only": 3794,
      "with_image": 1355,
      "with_video": 271
    },
    "generationVsPublishing": {
      "generations": 8500,
      "published": 5420
    },
    "byDay": [
      { "date": "2025-01-14", "credits": 180 },
      { "date": "2025-01-15", "credits": 195 }
    ]
  },
  "generation": {
    "total": 8500,
    "successful": 8200,
    "failed": 300,
    "successRate": 96.5,
    "byPlatform": {
      "facebook": 2000,
      "instagram": 3500,
      "twitter": 2000,
      "linkedin": 1000
    }
  },
  "publishing": {
    "totalPosts": 5500,
    "posted": 5200,
    "scheduled": 200,
    "failed": 100,
    "successRate": 98.1,
    "retryRate": 2.5,
    "byPlatform": {
      "facebook": { "posted": 1450, "failed": 30 },
      "instagram": { "posted": 2100, "failed": 40 },
      "twitter": { "posted": 1150, "failed": 20 },
      "linkedin": { "posted": 500, "failed": 10 }
    }
  },
  "jobs": {
    "total": 12000,
    "completed": 11500,
    "failed": 300,
    "pending": 200,
    "averageRetries": 0.3
  },
  "tiers": {
    "free": 950,
    "pro": 250,
    "business": 50,
    "totalUsers": 1250,
    "revenueEstimate": {
      "monthly": 114550,
      "annual": 1374600
    },
    "conversionRates": {
      "freeToProPercent": 20,
      "proToBusinessPercent": 16.7
    }
  },
  "automation": {
    "rules": [...],
    "stats": {
      "totalRules": 180,
      "activeRules": 120,
      "totalCreditsConsumed": 2400,
      "totalPostsGenerated": 1800
    }
  }
}
```

---

#### GET /api/admin/transactions

Get all platform transactions.

**Authentication:** Required (Admin only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Results per page |
| `type` | string | Filter by transaction type |

**Response (200 OK):**
```json
{
  "transactions": [
    {
      "id": "txn_abc123",
      "userId": "usr_xyz789",
      "userEmail": "user@example.com",
      "type": "subscription",
      "amount": 29900,
      "currency": "ZAR",
      "status": "completed",
      "credits": 500,
      "description": "Pro Plan - Monthly",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2500,
    "totalPages": 50
  }
}
```

---

#### GET /api/admin/jobs

Get job queue status and logs.

**Authentication:** Required (Admin only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `pending`, `running`, `completed`, `failed`, `cancelled` |
| `limit` | number | Results (default: `50`) |
| `function` | string | Filter by function name |

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "job_abc123",
      "inngestEventId": "evt_xyz789",
      "functionName": "process-scheduled-post",
      "status": "completed",
      "payload": {
        "postId": "post_123",
        "userId": "usr_456"
      },
      "result": {
        "success": true,
        "platform": "twitter"
      },
      "errorMessage": null,
      "retryCount": 0,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:15.000Z"
    }
  ],
  "stats": {
    "total": 12000,
    "completed": 11500,
    "failed": 300,
    "pending": 200,
    "averageRetries": 0.3,
    "byStatus": {
      "completed": 11500,
      "failed": 300,
      "pending": 200
    }
  }
}
```

---

#### POST /api/admin/jobs/retry

Manually retry a failed job.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "jobId": "job_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job queued for retry",
  "jobId": "job_abc123"
}
```

**Error Responses:**

- **400 Bad Request** - Job not retryable
```json
{
  "error": "Only failed jobs can be retried"
}
```

- **404 Not Found** - Job not found
```json
{
  "error": "Job not found"
}
```

---

#### GET /api/admin/errors

Get generation and publishing errors.

**Authentication:** Required (Admin only)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | `generation`, `publishing`, or `all` (default: `all`) |
| `limit` | number | Results (default: `50`) |

**Response (200 OK):**
```json
{
  "generationErrors": [
    {
      "id": "err_abc123",
      "userId": "usr_xyz789",
      "userName": "Thabo Nkosi",
      "userEmail": "thabo@example.com",
      "platform": "twitter",
      "topic": "Business tips",
      "tone": "professional",
      "language": "en",
      "errorMessage": "Gemini API rate limit exceeded",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "publishingErrors": [
    {
      "id": "post_def456",
      "userId": "usr_abc123",
      "userName": "Zanele Dlamini",
      "userEmail": "zanele@example.com",
      "platform": "instagram",
      "content": "Preview of post content...",
      "status": "failed",
      "errorMessage": "Instagram API: Invalid image format",
      "scheduledDate": "2025-01-15T14:00:00.000Z",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 8. Utility Endpoints

System utilities, health checks, and diagnostics.

---

#### GET /api/health

Health check endpoint for monitoring.

**Authentication:** Not required

**Response (200 OK):** Healthy
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 86400,
  "responseTime": 45,
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12
    },
    "environment": {
      "status": "configured",
      "checks": {
        "database": true,
        "auth": true,
        "gemini": true,
        "meta": true,
        "twitter": true,
        "linkedin": true,
        "encryption": true,
        "cron": true
      }
    }
  },
  "version": "2.0.0",
  "environment": "production"
}
```

**Response (503 Service Unavailable):** Unhealthy
```json
{
  "status": "degraded",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "services": {
    "database": {
      "status": "unhealthy",
      "responseTime": 0
    }
  }
}
```

---

#### GET /api/diagnostics/auth

Get authentication configuration diagnostics.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": {
    "nodeEnv": "production",
    "vercelEnv": "production",
    "isProduction": true
  },
  "configuration": {
    "databaseConfigured": true,
    "secretConfigured": true,
    "baseUrl": "https://purpleglow.co.za",
    "publicUrl": "https://purpleglow.co.za"
  },
  "diagnostics": {
    "dbHealth": "healthy",
    "cookie": {
      "useSecureCookies": true
    },
    "runtime": {
      "auth": "nodejs",
      "dynamic": "force-dynamic"
    },
    "devFallbackActive": false
  },
  "issues": []
}
```

---

#### GET /api/limits/check

Get user's current limits and usage.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "tier": "pro",
  "credits": {
    "total": 450,
    "reserved": 5,
    "available": 445,
    "percentage": 90,
    "isLow": false
  },
  "connectedAccounts": {
    "total": {
      "current": 4,
      "limit": 12,
      "remaining": 8,
      "percentage": 33,
      "isAtLimit": false
    },
    "byPlatform": {
      "facebook": { "current": 1, "limit": 3, "remaining": 2, "percentage": 33, "isAtLimit": false },
      "instagram": { "current": 1, "limit": 3, "remaining": 2, "percentage": 33, "isAtLimit": false },
      "twitter": { "current": 1, "limit": 3, "remaining": 2, "percentage": 33, "isAtLimit": false },
      "linkedin": { "current": 1, "limit": 3, "remaining": 2, "percentage": 33, "isAtLimit": false }
    }
  },
  "scheduling": {
    "queueSize": {
      "current": 12,
      "limit": 50,
      "remaining": 38,
      "percentage": 24,
      "isAtLimit": false
    },
    "advanceSchedulingDays": 30
  },
  "dailyGenerations": {
    "current": 15,
    "limit": 50,
    "remaining": 35,
    "percentage": 30,
    "isAtLimit": false
  },
  "dailyPosts": {
    "total": {
      "current": 8,
      "limit": 40,
      "remaining": 32,
      "percentage": 20,
      "isAtLimit": false
    },
    "byPlatform": {
      "facebook": { "current": 2, "limit": 10, "remaining": 8, "percentage": 20, "isAtLimit": false },
      "instagram": { "current": 3, "limit": 10, "remaining": 7, "percentage": 30, "isAtLimit": false },
      "twitter": { "current": 2, "limit": 10, "remaining": 8, "percentage": 20, "isAtLimit": false },
      "linkedin": { "current": 1, "limit": 10, "remaining": 9, "percentage": 10, "isAtLimit": false }
    }
  },
  "automation": {
    "enabled": true,
    "rules": {
      "current": 3,
      "limit": 5,
      "remaining": 2,
      "percentage": 60,
      "isAtLimit": false
    }
  }
}
```

---

#### GET /api/notifications

Get user's notifications.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif_abc123",
      "type": "low_credits",
      "title": "Low Credits Warning",
      "message": "You have less than 20% of your monthly credits remaining.",
      "read": false,
      "expiresAt": "2025-01-22T00:00:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": "notif_def456",
      "type": "post_failed",
      "title": "Post Failed",
      "message": "Your scheduled post to Instagram failed to publish.",
      "read": true,
      "expiresAt": null,
      "createdAt": "2025-01-14T14:00:00.000Z"
    }
  ],
  "unreadCount": 1
}
```

---

#### POST /api/notifications/read

Mark a notification as read.

**Authentication:** Required

**Request Body:**
```json
{
  "notificationId": "notif_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### POST /api/notifications/read-all

Mark all notifications as read.

**Authentication:** Required

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

#### POST /api/notifications/dismiss

Dismiss (delete) a notification.

**Authentication:** Required

**Request Body:**
```json
{
  "notificationId": "notif_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification dismissed"
}
```

---

## Webhooks

Purple Glow Social receives webhooks from Polar.sh for payment events.

### Polar Webhook Endpoint

```
POST /api/webhooks/polar
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `order.created` | New order created |
| `order.paid` | Order payment completed |
| `order.refunded` | Order refunded |
| `subscription.created` | New subscription created |
| `subscription.active` | Subscription activated |
| `subscription.canceled` | Subscription canceled |

### Webhook Security

Webhooks are verified using the `POLAR_WEBHOOK_SECRET` environment variable:

```typescript
// Signature verification is handled automatically by @polar-sh/nextjs
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    // Process webhook
  }
});
```

### Webhook Payload Example

```json
{
  "type": "order.paid",
  "data": {
    "id": "ord_abc123",
    "customer_id": "cus_xyz789",
    "amount": 8900,
    "currency": "ZAR",
    "status": "paid",
    "metadata": {
      "user_id": "usr_abc123",
      "package_id": "credits_100"
    }
  }
}
```

---

## South African Languages

Purple Glow Social supports all 11 official South African languages.

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `af` | Afrikaans | Afrikaans |
| `zu` | Zulu | isiZulu |
| `xh` | Xhosa | isiXhosa |
| `nso` | Northern Sotho | Sepedi |
| `tn` | Tswana | Setswana |
| `st` | Southern Sotho | Sesotho |
| `ts` | Tsonga | Xitsonga |
| `ss` | Swati | siSwati |
| `ve` | Venda | Tshivenda |
| `nr` | Ndebele | isiNdebele |

### Using Languages

Specify the language code in AI generation requests:

```json
{
  "topic": "Business tips",
  "platform": "facebook",
  "language": "zu"
}
```

The AI will generate culturally appropriate content in isiZulu.

---

## Tier Limits

### Free Tier (R0/month)

| Limit | Value |
|-------|-------|
| Monthly Credits | 10 |
| Connected Accounts (per platform) | 1 |
| Total Connected Accounts | 4 |
| Queue Size | 5 |
| Advance Scheduling | 7 days |
| Daily Posts (per platform) | 2 |
| Daily Generations | 5 |
| Automation | ❌ Not available |

### Pro Tier (R299/month)

| Limit | Value |
|-------|-------|
| Monthly Credits | 500 |
| Connected Accounts (per platform) | 3 |
| Total Connected Accounts | 12 |
| Queue Size | 50 |
| Advance Scheduling | 30 days |
| Daily Posts (per platform) | 10 |
| Daily Generations | 50 |
| Automation Rules | 5 |
| Credit Carryover | Up to 100 |

### Business Tier (R799/month)

| Limit | Value |
|-------|-------|
| Monthly Credits | 2,000 |
| Connected Accounts (per platform) | 10 |
| Total Connected Accounts | 40 |
| Queue Size | 200 |
| Advance Scheduling | 90 days |
| Daily Posts (per platform) | 50 |
| Daily Generations | 200 |
| Automation Rules | 20 |
| Credit Carryover | Up to 500 |

### Credit System

- **1 credit = 1 post to 1 platform**
- Credits are deducted on successful publish only
- Failed posts are automatically refunded
- Scheduled posts reserve credits until published
- Generation is free (limited by daily generation quota)

---

## SDKs & Examples

### JavaScript/TypeScript (fetch)

```typescript
// Create API client
const API_BASE = 'https://purpleglow.co.za/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include session cookie
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error);
  }
  
  return response.json();
}

// Generate content
const content = await apiRequest('/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'Small business tips for Johannesburg',
    platform: 'twitter',
    language: 'en',
    tone: 'friendly',
  }),
});

console.log(content.results[0].content);

// Publish to multiple platforms
const result = await apiRequest('/posts/publish', {
  method: 'POST',
  body: JSON.stringify({
    platforms: ['facebook', 'twitter'],
    content: 'Hello from Purple Glow Social! 🚀 #MzansiMagic',
  }),
});

console.log(`Published to ${result.results.length} platforms`);
```

### cURL Examples

**Generate Content:**
```bash
curl -X POST https://purpleglow.co.za/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{
    "topic": "Cape Town tourism highlights",
    "platform": "instagram",
    "language": "en",
    "tone": "energetic",
    "includeHashtags": true
  }'
```

**Publish Post:**
```bash
curl -X POST https://purpleglow.co.za/api/posts/publish \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{
    "platforms": ["facebook", "linkedin"],
    "content": "Exciting news from South Africa! 🇿🇦",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

**Get User Profile:**
```bash
curl -X GET https://purpleglow.co.za/api/user/profile \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

**Check Limits:**
```bash
curl -X GET https://purpleglow.co.za/api/limits/check \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

---

## Testing

### Test Accounts

Purple Glow Social provides test accounts for development:

| Account | Email | Password | Tier | Credits |
|---------|-------|----------|------|---------|
| Free User | free@test.purpleglow.co.za | TestFree123! | Free | 10 |
| Pro User | pro@test.purpleglow.co.za | TestPro123! | Pro | 500 |
| Business User | business@test.purpleglow.co.za | TestBiz123! | Business | 2000 |
| Admin User | admin@test.purpleglow.co.za | TestAdmin123! | Business | 2000 |
| Low Credit | lowcredit@test.purpleglow.co.za | TestLow123! | Pro | 2 |
| Zero Credit | zerocredit@test.purpleglow.co.za | TestZero123! | Pro | 0 |

### Seed Test Accounts

```bash
npm run db:seed-test
```

### Testing Best Practices

1. **Use test accounts** - Don't test with real social media accounts in development
2. **Check rate limits** - Test rate limiting behavior with rapid requests
3. **Test error cases** - Verify error responses match documentation
4. **Validate tier limits** - Test with different tier accounts to verify limits
5. **Test credit flow** - Verify credits are properly reserved, deducted, and refunded

### Health Check

```bash
curl https://purpleglow.co.za/api/health
```

### Auth Diagnostics

```bash
curl https://purpleglow.co.za/api/diagnostics/auth
```

---

## Changelog

### Version 2.0 (January 2025)

- Complete API rewrite with Next.js 16
- Better-auth authentication system
- Google Gemini Pro AI integration
- Polar.sh payment integration
- 11 South African languages support
- Tier-based credit and limit system
- Inngest job processing
- POPIA compliance (data export/delete)

---

## Support

For API support:

- **Documentation:** https://purpleglow.co.za/docs
- **Email:** support@purpleglow.co.za
- **Status Page:** https://status.purpleglow.co.za

---

*Last updated: January 2025*
*API Version: 2.0*
