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
   * Post content to a specific platform
   */
  async postToPlatform(
    userId: string,
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin',
    content: PostContent
  ): Promise<PostResult> {
    try {
      // Get connected account
      const connection = await getConnectedAccount(userId, platform);
      if (!connection || !connection.isActive) {
        return {
          success: false,
          platform,
          error: `${platform} account not connected`,
        };
      }

      // Get decrypted access token
      const accessToken = await getDecryptedToken(userId, platform);
      if (!accessToken) {
        return {
          success: false,
          platform,
          error: 'Failed to decrypt access token',
        };
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

      return {
        success: true,
        platform,
        postId: result.id,
        postUrl: result.postUrl,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.posting.exception(error, { platform, userId });
      return {
        success: false,
        platform,
        error: errorMessage,
      };
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
    if (content.imageUrl) {
      return await this.facebookPoster.postImage(accessToken, pageId, {
        message: content.content,
        imageUrl: content.imageUrl,
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
    if (!content.imageUrl) {
      throw new Error('Instagram requires an image');
    }

    return await this.instagramPoster.postImage(accessToken, igAccountId, {
      caption: content.content,
      imageUrl: content.imageUrl,
    });
  }

  /**
   * Post to Twitter
   */
  private async postToTwitter(accessToken: string, content: PostContent) {
    if (content.imageUrl) {
      return await this.twitterPoster.postWithImage(
        accessToken,
        content.content,
        content.imageUrl
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
    
    if (content.imageUrl) {
      return await this.linkedinPoster.postImage(accessToken, authorUrn, {
        text: content.content,
        imageUrl: content.imageUrl,
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
