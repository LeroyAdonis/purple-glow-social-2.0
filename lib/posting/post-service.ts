/**
 * Unified Post Service
 * Orchestrates posting to all social media platforms
 * Supports: Facebook, Instagram, Twitter, LinkedIn
 */

import { FacebookPoster } from './facebook-poster';
import { InstagramPoster } from './instagram-poster';
import { TwitterPoster } from './twitter-poster';
import { LinkedInPoster } from './linkedin-poster';
import { LinkedInProvider } from '@/lib/oauth/linkedin-provider';
import { getConnectedAccount, getDecryptedToken } from '@/lib/db/connected-accounts';
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
  private facebookPoster: FacebookPoster;
  private instagramPoster: InstagramPoster;
  private twitterPoster: TwitterPoster;
  private linkedinPoster: LinkedInPoster;
  private linkedinProvider: LinkedInProvider;

  constructor() {
    this.facebookPoster = new FacebookPoster();
    this.instagramPoster = new InstagramPoster();
    this.twitterPoster = new TwitterPoster();
    this.linkedinPoster = new LinkedInPoster();
    this.linkedinProvider = new LinkedInProvider();
  }

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

      // Post to platform
      let result;
      switch (platform) {
        case 'facebook':
          result = await this.postToFacebook(
            accessToken,
            connection.platformUserId,
            content
          );
          break;
        case 'instagram':
          result = await this.postToInstagram(
            accessToken,
            connection.platformUserId,
            content
          );
          break;
        case 'twitter':
          result = await this.postToTwitter(accessToken, content);
          break;
        case 'linkedin':
          result = await this.postToLinkedIn(accessToken, content);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return withWarnings({
        success: true,
        platform,
        postId: result.id,
        postUrl: result.postUrl,
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
   * Post to Facebook
   */
  private async postToFacebook(
    accessToken: string,
    pageId: string,
    content: PostContent
  ) {
    const media = this.resolveMedia('facebook', content);
    if (media.url) {
      return await this.facebookPoster.postImage(accessToken, pageId, {
        message: content.content,
        imageUrl: media.url,
      });
    } else if (content.link) {
      return await this.facebookPoster.postLink(accessToken, pageId, {
        message: content.content,
        link: content.link,
      });
    } else {
      return await this.facebookPoster.postText(accessToken, pageId, content.content);
    }
  }

  /**
   * Post to Instagram
   */
  private async postToInstagram(
    accessToken: string,
    igAccountId: string,
    content: PostContent
  ) {
    const media = this.resolveMedia('instagram', content);
    if (!media.url) {
      // Instagram genuinely cannot post text-only, so this is the one platform where a bad media URL
      // must fail loudly — but it names the reason instead of blaming the platform.
      throw new Error(media.warning || 'Instagram requires an image');
    }

    return await this.instagramPoster.postImage(accessToken, igAccountId, {
      caption: content.content,
      imageUrl: media.url,
    });
  }

  /**
   * Post to Twitter
   */
  private async postToTwitter(accessToken: string, content: PostContent) {
    const media = this.resolveMedia('twitter', content);
    if (media.url) {
      return await this.twitterPoster.postWithImage(
        accessToken,
        content.content,
        media.url
      );
    } else {
      return await this.twitterPoster.postText(accessToken, content.content);
    }
  }

  /**
   * Post to LinkedIn
   */
  private async postToLinkedIn(accessToken: string, content: PostContent) {
    // Get the author URN for the user
    const authorUrn = await this.linkedinProvider.getMemberUrn(accessToken);
    
    const media = this.resolveMedia('linkedin', content);
    if (media.url) {
      return await this.linkedinPoster.postImage(accessToken, authorUrn, {
        text: content.content,
        imageUrl: media.url,
      });
    } else if (content.link) {
      return await this.linkedinPoster.postArticle(accessToken, authorUrn, {
        text: content.content,
        articleUrl: content.link,
      });
    } else {
      return await this.linkedinPoster.postText(accessToken, authorUrn, {
        text: content.content,
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
