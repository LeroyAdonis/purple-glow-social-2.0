# F001 Draft Management - API Code Review

**Review Date:** January 20, 2025  
**Reviewer:** Code Reviewer Agent  
**Status:** 🔴 **CRITICAL - NO API IMPLEMENTATION FOUND**

---

## Executive Summary

### 🔴 CRITICAL FINDING: API Layer Does Not Exist

**All 5 required API endpoints are missing:**

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/api/posts/drafts` | GET | ❌ NOT FOUND | 🔴 CRITICAL |
| `/api/posts/drafts` | POST | ❌ NOT FOUND | 🔴 CRITICAL |
| `/api/posts/drafts/[id]` | PATCH | ❌ NOT FOUND | 🔴 CRITICAL |
| `/api/posts/drafts/[id]` | DELETE | ❌ NOT FOUND | 🔴 CRITICAL |
| `/api/upload/image` | POST | ❌ NOT FOUND | 🔴 CRITICAL |

**Impact:** 
- Feature is 100% non-functional
- All UI components will fail at runtime with 404 errors
- No way to create, read, update, or delete drafts
- No way to upload images for drafts

**Blocking Issue:** Cannot proceed with testing or deployment until API is implemented.

---

## Expected API Implementation

Based on the spec (`spec/purple-glow-social/features/F001.md`), here's what SHOULD exist:

### 1. GET /api/posts/drafts

**File:** `app/api/posts/drafts/route.ts` ❌ MISSING

**Expected Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const sort = searchParams.get('sort') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // 3. Build query
    const conditions = [
      eq(posts.userId, session.user.id),
      eq(posts.status, 'draft'),
    ];

    if (platform && platform !== 'all') {
      conditions.push(eq(posts.platform, platform));
    }

    // 4. Fetch drafts
    const drafts = await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(sort === 'newest' ? desc(posts.createdAt) : asc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // 5. Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(...conditions));

    // 6. Log success
    logger.api.info('Drafts retrieved', {
      userId: session.user.id,
      count: drafts.length,
      platform,
    });

    // 7. Return response
    return NextResponse.json({
      drafts,
      total: count,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < count,
      },
    });

  } catch (error) {
    logger.api.error('Failed to fetch drafts', { error });
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}
```

**Required Security Checks:**
- ✅ Authentication required (session check)
- ✅ Authorization enforced (userId filter)
- ✅ Input validation (limit max 100)
- ✅ SQL injection prevented (Drizzle ORM)
- ⚠️ Rate limiting needed (30 per minute)

**Status:** ❌ NOT IMPLEMENTED

---

### 2. POST /api/posts/drafts

**File:** `app/api/posts/drafts/route.ts` ❌ MISSING

**Expected Implementation:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await request.json();
    
    // 3. Validate with Zod
    const draftSchema = z.object({
      content: z.string().min(1).max(10000),
      platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']),
      topic: z.string().max(200).optional(),
      imageUrl: z.string().url().optional(),
    });

    const validated = draftSchema.parse(body);

    // 4. Create draft
    const [draft] = await db.insert(posts).values({
      userId: session.user.id,
      content: validated.content,
      platform: validated.platform,
      topic: validated.topic,
      imageUrl: validated.imageUrl,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 5. Log creation
    logger.api.info('Draft created', {
      userId: session.user.id,
      draftId: draft.id,
      platform: draft.platform,
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      draft,
      message: 'Draft saved successfully',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.api.error('Failed to create draft', { error });
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}
```

**Required Security Checks:**
- ✅ Authentication required
- ✅ Input validation (Zod schema)
- ✅ Content length limit (10,000 chars)
- ✅ Platform enum validation
- ⚠️ Rate limiting needed (30 per minute)

**Status:** ❌ NOT IMPLEMENTED

---

### 3. PATCH /api/posts/drafts/[id]

**File:** `app/api/posts/drafts/[id]/route.ts` ❌ MISSING

**Expected Implementation:**
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Check if draft exists and belongs to user
    const [existingDraft] = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.id, params.id),
          eq(posts.userId, session.user.id),
          eq(posts.status, 'draft')
        )
      );

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // 3. Parse and validate body
    const body = await request.json();
    
    const updateSchema = z.object({
      content: z.string().min(1).max(10000).optional(),
      platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']).optional(),
      topic: z.string().max(200).optional(),
      imageUrl: z.string().url().nullable().optional(),
    });

    const validated = updateSchema.parse(body);

    // 4. Update draft
    const [updatedDraft] = await db
      .update(posts)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, params.id))
      .returning();

    // 5. Log update
    logger.api.info('Draft updated', {
      userId: session.user.id,
      draftId: params.id,
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      draft: updatedDraft,
      message: 'Draft updated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.api.error('Failed to update draft', { error, draftId: params.id });
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}
```

**Required Security Checks:**
- ✅ Authentication required
- ✅ Authorization (check userId matches)
- ✅ Draft ownership verification
- ✅ Input validation (Zod)
- ⚠️ Rate limiting needed

**Status:** ❌ NOT IMPLEMENTED

---

### 4. DELETE /api/posts/drafts/[id]

**File:** `app/api/posts/drafts/[id]/route.ts` ❌ MISSING

**Expected Implementation:**
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Verify ownership
    const [draft] = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.id, params.id),
          eq(posts.userId, session.user.id),
          eq(posts.status, 'draft')
        )
      );

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // 3. Delete associated image if exists
    if (draft.imageUrl) {
      // TODO: Delete from Vercel Blob
      // await del(draft.imageUrl);
    }

    // 4. Delete draft
    await db
      .delete(posts)
      .where(eq(posts.id, params.id));

    // 5. Log deletion
    logger.api.info('Draft deleted', {
      userId: session.user.id,
      draftId: params.id,
    });

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });

  } catch (error) {
    logger.api.error('Failed to delete draft', { error, draftId: params.id });
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
```

**Required Security Checks:**
- ✅ Authentication required
- ✅ Authorization (ownership check)
- ✅ Cascade delete (cleanup images)
- ⚠️ Rate limiting needed

**Status:** ❌ NOT IMPLEMENTED

---

### 5. POST /api/upload/image

**File:** `app/api/upload/image/route.ts` ❌ MISSING

**Expected Implementation:**
```typescript
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') || 'post';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // 4. Upload to Vercel Blob
    const blob = await put(
      `posts/${session.user.id}/${Date.now()}-${file.name}`,
      file,
      {
        access: 'public',
        addRandomSuffix: true,
      }
    );

    // 5. Log upload
    logger.api.info('Image uploaded', {
      userId: session.user.id,
      size: file.size,
      contentType: file.type,
      url: blob.url,
    });

    // 6. Return URL
    return NextResponse.json({
      success: true,
      url: blob.url,
      size: file.size,
      contentType: file.type,
    });

  } catch (error) {
    logger.api.error('Failed to upload image', { error });
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
```

**Required Security Checks:**
- ✅ Authentication required
- ✅ File type validation
- ✅ File size validation (5MB max)
- ⚠️ Content verification (magic bytes check)
- ⚠️ Rate limiting needed (10 per minute)

**Status:** ❌ NOT IMPLEMENTED

---

## Database Functions Missing

**File:** `lib/db/posts.ts` needs these functions:

### getDrafts()
```typescript
export async function getDrafts(
  userId: string,
  options: {
    platform?: string;
    sort?: 'newest' | 'oldest';
    limit?: number;
    offset?: number;
  }
) {
  // Implementation needed
}
```
**Status:** ❌ NOT IMPLEMENTED

### countDrafts()
```typescript
export async function countDrafts(
  userId: string,
  platform?: string
) {
  // Implementation needed
}
```
**Status:** ❌ NOT IMPLEMENTED

---

## Security Issues

### 🔴 CRITICAL: No Authentication Layer
- API endpoints don't exist, so no authentication
- **Risk:** Anyone could create/modify/delete drafts (if API existed)
- **Fix:** Implement Better-auth session checks in all endpoints

### 🔴 CRITICAL: No Authorization Checks
- No verification that user owns the draft they're modifying
- **Risk:** User A could delete User B's drafts
- **Fix:** Add userId check in all queries

### 🔴 CRITICAL: No Input Validation
- No Zod schemas for request validation
- **Risk:** Invalid data could corrupt database
- **Fix:** Add Zod validation to all POST/PATCH endpoints

### 🟠 HIGH: No Rate Limiting
- No protection against spam/abuse
- **Risk:** User could create thousands of drafts
- **Fix:** Implement rate limiting (30 requests per minute)

### 🟠 HIGH: No File Upload Security
- No magic byte verification for images
- **Risk:** Malicious files could be uploaded
- **Fix:** Verify file content matches declared type

---

## Performance Issues

### Cannot Assess (No API)
- ❌ Response time: Cannot measure
- ❌ Database query optimization: No queries to review
- ❌ N+1 queries: Cannot detect
- ❌ Caching strategy: Not implemented

---

## API Quality Score: 0/100

| Category | Score | Comments |
|----------|-------|----------|
| Implementation | 0/100 | No files exist |
| Security | 0/100 | No protection |
| Validation | 0/100 | No schemas |
| Error Handling | 0/100 | No handlers |
| Logging | 0/100 | No logs |
| Performance | 0/100 | Cannot measure |
| Documentation | 0/100 | No inline docs |
| **Overall** | **0/100** | 🔴 **NOT STARTED** |

---

## Recommendation

### 🔴 REJECT - API MUST BE IMPLEMENTED

**The feature cannot proceed without the API layer.**

**Estimated Implementation Time:** 10-15 hours

**Priority:** 🔴 P0 (Critical - Blocking)

---

**Reviewed By:** Code Reviewer Agent  
**Date:** January 20, 2025  
**Status:** ❌ BLOCKED - No API to review
