/**
 * Unified Post Service
 * Orchestrates posting to all social media platforms
 * Supports: Facebook, Instagram, Twitter, LinkedIn
 */

import { getConnectedAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
import { getProvider } from '@/lib/providers/registry';
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { resolvePostableMediaUrl, type MediaResolution } from './media-guard';

interface PostContent {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
}

interface PostResult {
  success: boolean;
  platform: string;
  postId?: string;
  postUrl?: string;
  error?: string;
  /** Non-fatal degradations, e.g. an image URL the platform could never fetch. */
  warnings?: string[];
}

export class PostService {
  /**
   * Resolve the media URL once, before any platform is called.
   *
   * Platforms fetch media server-side, so only an absolute http(s) URL can work. A relative path or a
   * filesystem path is refused here, with the offending value named, so the failure points at us
   * instead of showing up as a generic platform error.
   */
  private resolveMedia(platform: string, content: PostContent): MediaResolution {
    const media = resolvePostableMediaUrl(content.imageUrl);
    if (media.warning) {
      logger.posting.warn('Skipping media: not an absolute URL', {
        platform,
        rejectedImageUrl: content.imageUrl,
      });
    }
    return media;
  }

  /**
   * Post content to a specific platform
   */
  async postToPlatform(
    userId: string,
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin',
    content: PostContent
  ): Promise<PostResult> {
    // Surface a rejected media URL on the result itself: the per-platform guard below degrades to
    // text-only (or fails loudly on Instagram), but the caller must also SEE what was dropped.
    const mediaWarning = resolvePostableMediaUrl(content.imageUrl).warning;
    const withWarnings = <T extends PostResult>(result: T): T =>
      mediaWarning ? { ...result, warnings: [mediaWarning] } : result;

    try {
      // Get connected account
      const connection = await getConnectedAccount(userId, platform);
      if (!connection || !connection.isActive) {
        return withWarnings({
          success: false,
          platform,
          error: `${platform} account not connected`,
        });
      }

      // Get decrypted access token
      const accessToken = await getDecryptedToken(userId, platform);
      if (!accessToken) {
        return withWarnings({
          success: false,
          platform,
          error: 'Failed to decrypt access token',
        });
      }

      // Resolve the channel from the registry: no platform is named in this class.
      const provider = getProvider(platform);

      // The media guard stays the single decision point, so a provider only ever sees a postable URL.
      const media = this.resolveMedia(platform, content);
      if (provider.requiresMedia && !media.url) {
        throw new Error(media.warning || `${provider.displayName} requires an image`);
      }

      const outcome = await provider.publish({
        accessToken,
        accountId: connection.platformUserId,
        content: {
          text: content.content,
          mediaUrl: media.url,
          link: content.link,
        },
      });

      if (outcome.status === 'failed') {
        return withWarnings({ success: false, platform, error: outcome.message });
      }

      if (outcome.status === 'pending') {
        // No provider returns this yet and PostResult has no pending state.
        // shortcut: an unfinished publish is recorded as a failure; add a pending status when a
        // channel actually needs polling.
        return withWarnings({
          success: false,
          platform,
          error: `Publish pending: ${outcome.pendingData}`,
        });
      }

      return withWarnings({
        success: true,
        platform,
        postId: outcome.platformPostId,
        postUrl: outcome.url,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.posting.exception(error, { platform, userId });
      return withWarnings({
        success: false,
        platform,
        error: errorMessage,
      });
    }
  }

  /**
   * Post to multiple platforms at once
   */
  async postToMultiplePlatforms(
    userId: string,
    platforms: Array<'facebook' | 'instagram' | 'twitter' | 'linkedin'>,
    content: PostContent
  ): Promise<PostResult[]> {
    const results = await Promise.all(
      platforms.map(platform => this.postToPlatform(userId, platform, content))
    );

    return results;
  }

  /**
   * Publish a scheduled post from database
   */
  async publishScheduledPost(postId: string): Promise<PostResult[]> {
    try {
      // Get post from database
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      });

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.status !== 'scheduled') {
        throw new Error('Post is not scheduled');
      }

      // Prepare content
      const content: PostContent = {
        content: post.content,
        imageUrl: post.imageUrl || undefined,
        videoUrl: post.videoUrl || undefined,
      };

      // Post to platform (LinkedIn is now supported)
      const result = await this.postToPlatform(
        post.userId,
        post.platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
        content
      );

      // Update post status in database
      if (result.success) {
        await db
          .update(posts)
          .set({
            status: 'posted',
            platformPostId: result.postId,
            platformPostUrl: result.postUrl,
            publishedAt: new Date(),
            errorMessage: null,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));
      } else {
        await db
          .update(posts)
          .set({
            status: 'failed',
            errorMessage: result.error,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));
      }

      return [result];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.posting.exception(error, { postId, action: 'publish-scheduled' });
      
      // Update post status to failed
      await db
        .update(posts)
        .set({
          status: 'failed',
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      throw error;
    }
  }

  /**
   * Process all scheduled posts that are due
   */
  async processScheduledPosts(): Promise<void> {
    try {
      // Get all posts scheduled for now or earlier
      const duePosts = await db.query.posts.findMany({
        where: (posts, { eq, and, lte }) =>
          and(
            eq(posts.status, 'scheduled'),
            lte(posts.scheduledDate, new Date())
          ),
      });

      logger.posting.info(`Found ${duePosts.length} posts due for publishing`);

      // Process each post
      for (const post of duePosts) {
        try {
          await this.publishScheduledPost(post.id);
          logger.posting.info(`Successfully published post ${post.id}`);
        } catch (error) {
          logger.posting.exception(error, { postId: post.id, action: 'process-scheduled' });
        }
      }
    } catch (error) {
      logger.posting.exception(error, { action: 'process-scheduled-posts' });
      throw error;
    }
  }
}
