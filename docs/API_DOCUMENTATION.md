# Purple Glow Social 2.0 - API Documentation

## Overview

Purple Glow Social provides a RESTful API for managing social media content, automation, and user accounts. All API routes are located under `/api/`.

## Authentication

All protected endpoints require a valid session. The application uses Better-auth for authentication.

### Headers
```
Cookie: better-auth.session_token=<session_token>
```

## Endpoints

### User Endpoints

#### GET /api/user/profile
Get the current user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "tier": "free|pro|business",
  "credits": 100,
  "image": "https://..."
}
```

#### GET /api/user/posts
Get the user's posts with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (draft|scheduled|posted|failed)
- `platform` (optional): Filter by platform

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "content": "Post content...",
      "platform": "twitter",
      "status": "scheduled",
      "scheduledDate": "2025-12-25T10:00:00Z",
      "createdAt": "2025-12-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /api/user/posts
Create a new post.

**Request Body:**
```json
{
  "content": "Post content (required)",
  "platform": "twitter|facebook|instagram|linkedin",
  "scheduledDate": "2025-12-25T10:00:00Z",
  "imageUrl": "https://..."
}
```

#### DELETE /api/user/posts?id={postId}
Delete a post.

---

#### GET /api/user/automation-rules
Get the user's automation rules.

**Response:**
```json
{
  "rules": [
    {
      "id": "uuid",
      "coreTopic": "Tech tips",
      "frequency": "weekly",
      "platforms": ["twitter", "linkedin"],
      "tone": "professional",
      "language": "en",
      "isActive": true
    }
  ]
}
```

#### POST /api/user/automation-rules
Create a new automation rule.

**Request Body:**
```json
{
  "coreTopic": "Topic (required)",
  "frequency": "daily|weekly|monthly",
  "platforms": ["twitter", "linkedin"],
  "tone": "professional|casual|humorous|inspirational|educational",
  "language": "en|af|zu|xh|nso|tn|st|ts|ss|ve|nr"
}
```

---

#### GET /api/user/billing-history
Get the user's billing history.

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "date": "2025-12-01",
      "plan": "Pro Monthly",
      "amount": 259.13,
      "total": 298.00,
      "status": "paid"
    }
  ]
}
```

---

### Admin Endpoints

All admin endpoints require admin access (email ending in @purpleglow.co.za or in ADMIN_EMAILS).

#### GET /api/admin/users
Get all users with pagination.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "tier": "pro",
      "credits": 500,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### PATCH /api/admin/users
Update a user's tier or credits.

**Request Body:**
```json
{
  "userId": "uuid",
  "tier": "pro",
  "creditAdjustment": 100
}
```

---

#### GET /api/admin/stats
Get platform statistics.

**Response:**
```json
{
  "totalUsers": 1000,
  "activeUsers": 250,
  "totalRevenue": 50000,
  "postsCreated": 10000,
  "tierDistribution": {
    "free": 800,
    "pro": 150,
    "business": 50
  }
}
```

---

#### GET /api/admin/transactions
Get all transactions.

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: Filter by transaction type

---

### AI Content Generation

#### POST /api/ai/generate
Generate social media content using AI.

**Request Body:**
```json
{
  "topic": "Topic for content (required)",
  "platform": "twitter|facebook|instagram|linkedin",
  "tone": "professional|casual|humorous|inspirational|educational",
  "language": "en|af|zu|xh|nso|tn|st|ts|ss|ve|nr",
  "includeHashtags": true,
  "includeEmojis": true
}
```

**Response:**
```json
{
  "content": "Generated content with #hashtags 🚀",
  "platform": "twitter",
  "creditsUsed": 1
}
```

---

### OAuth Endpoints

#### GET /api/oauth/{platform}/authorize
Initiate OAuth flow for a social platform.

**Platforms:** facebook, instagram, twitter, linkedin

#### GET /api/oauth/{platform}/callback
Handle OAuth callback from social platform.

---

### Posting

#### POST /api/posts/publish
Immediately publish a post to a social platform.

**Request Body:**
```json
{
  "content": "Post content",
  "platform": "twitter",
  "imageUrl": "https://..."
}
```

---

### Cron Endpoints

#### POST /api/cron/process-scheduled-posts
Process and publish scheduled posts. Requires CRON_SECRET header.

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not enough permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| General API | 100 requests/minute |
| Authentication | 5 attempts/15 minutes |
| Content Generation | 10 requests/minute |
| Admin Endpoints | 50 requests/minute |

Rate limit headers are included in responses:
- `X-RateLimit-Remaining`: Remaining requests
- `Retry-After`: Seconds until limit resets (when exceeded)

---

## South African Languages

The platform supports all 11 official South African languages:

| Code | Language |
|------|----------|
| en | English |
| af | Afrikaans |
| zu | Zulu (isiZulu) |
| xh | Xhosa (isiXhosa) |
| nso | Northern Sotho (Sepedi) |
| tn | Tswana (Setswana) |
| st | Southern Sotho (Sesotho) |
| ts | Tsonga (Xitsonga) |
| ss | Swati (siSwati) |
| ve | Venda (Tshivenda) |
| nr | Ndebele (isiNdebele) |
