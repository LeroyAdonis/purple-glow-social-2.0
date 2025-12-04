/**
 * Instagram Posting Service
 * Posts content to Instagram Business Accounts using the Graph API
 * 
 * Reference: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing
 */

import { logger } from '@/lib/logger';

interface InstagramPostParams {
  caption: string;
  imageUrl: string;
}

interface InstagramPostResponse {
  id: string;
  postUrl: string;
}

interface ContainerStatus {
  status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR' | 'EXPIRED';
  statusCode?: string;
}

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

export class InstagramPoster {
  /**
   * Check the status of a media container
   */
  private async checkContainerStatus(
    accessToken: string,
    containerId: string
  ): Promise<ContainerStatus> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to check container status');
    }
    
    const data = await response.json();
    return {
      status: data.status_code || 'IN_PROGRESS',
      statusCode: data.status_code,
    };
  }

  /**
   * Wait for container to be ready with polling
   */
  private async waitForContainer(
    accessToken: string,
    containerId: string
  ): Promise<void> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const status = await this.checkContainerStatus(accessToken, containerId);
      
      if (status.status === 'FINISHED') {
        return;
      }
      
      if (status.status === 'ERROR') {
        throw new Error(`Container processing failed: ${status.statusCode}`);
      }
      
      if (status.status === 'EXPIRED') {
        throw new Error('Container expired before publishing');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    
    throw new Error('Container processing timed out');
  }

  /**
   * Post image to Instagram
   * Instagram requires a 2-step process: create container, then publish
   */
  async postImage(
    accessToken: string,
    igAccountId: string,
    params: InstagramPostParams
  ): Promise<InstagramPostResponse> {
    try {
      // Step 1: Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: params.imageUrl,
            caption: params.caption,
            access_token: accessToken,
          }),
        }
      );

      if (!containerResponse.ok) {
        const error = await containerResponse.json();
        throw new Error(error.error?.message || 'Failed to create Instagram media container');
      }

      const containerData = await containerResponse.json();
      const containerId = containerData.id;

      // Step 2: Wait for container to be ready (with polling)
      await this.waitForContainer(accessToken, containerId);

      // Step 3: Publish the container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        throw new Error(error.error?.message || 'Failed to publish Instagram post');
      }

      const publishData = await publishResponse.json();
      
      // Get the permalink for the post
      const permalink = await this.getPostPermalink(accessToken, publishData.id);
      
      return {
        id: publishData.id,
        postUrl: permalink || `https://www.instagram.com/p/${this.getShortcode(publishData.id)}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'instagram', action: 'post-image' });
      throw error;
    }
  }

  /**
   * Post video/reel to Instagram
   */
  async postVideo(
    accessToken: string,
    igAccountId: string,
    videoUrl: string,
    caption: string,
    isReel: boolean = false
  ): Promise<InstagramPostResponse> {
    try {
      // Step 1: Create video container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_url: videoUrl,
            caption,
            media_type: isReel ? 'REELS' : 'VIDEO',
            access_token: accessToken,
          }),
        }
      );

      if (!containerResponse.ok) {
        const error = await containerResponse.json();
        throw new Error(error.error?.message || 'Failed to create video container');
      }

      const containerData = await containerResponse.json();
      const containerId = containerData.id;

      // Step 2: Wait for video processing (takes longer than images)
      await this.waitForContainer(accessToken, containerId);

      // Step 3: Publish
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        throw new Error(error.error?.message || 'Failed to publish video');
      }

      const publishData = await publishResponse.json();
      const permalink = await this.getPostPermalink(accessToken, publishData.id);
      
      return {
        id: publishData.id,
        postUrl: permalink || `https://www.instagram.com/p/${this.getShortcode(publishData.id)}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'instagram', action: 'post-video' });
      throw error;
    }
  }

  /**
   * Post carousel (multiple images) to Instagram
   */
  async postCarousel(
    accessToken: string,
    igAccountId: string,
    images: string[],
    caption: string
  ): Promise<InstagramPostResponse> {
    try {
      // Step 1: Create containers for each image
      const containerIds: string[] = [];
      
      for (const imageUrl of images) {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${igAccountId}/media`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_url: imageUrl,
              is_carousel_item: true,
              access_token: accessToken,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to create carousel item');
        }

        const data = await response.json();
        containerIds.push(data.id);
        
        // Wait for each item to be ready
        await this.waitForContainer(accessToken, data.id);
      }

      // Step 2: Create carousel container
      const carouselResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_type: 'CAROUSEL',
            children: containerIds,
            caption,
            access_token: accessToken,
          }),
        }
      );

      if (!carouselResponse.ok) {
        throw new Error('Failed to create carousel container');
      }

      const carouselData = await carouselResponse.json();

      // Step 3: Wait for carousel container to be ready
      await this.waitForContainer(accessToken, carouselData.id);

      // Step 4: Publish carousel
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: carouselData.id,
            access_token: accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        throw new Error('Failed to publish carousel');
      }

      const publishData = await publishResponse.json();
      const permalink = await this.getPostPermalink(accessToken, publishData.id);
      
      return {
        id: publishData.id,
        postUrl: permalink || `https://www.instagram.com/p/${this.getShortcode(publishData.id)}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'instagram', action: 'post-carousel' });
      throw error;
    }
  }

  /**
   * Get the permalink for a published post
   */
  private async getPostPermalink(
    accessToken: string,
    mediaId: string
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${mediaId}?fields=permalink&access_token=${accessToken}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.permalink || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Delete an Instagram post
   */
  async deletePost(accessToken: string, mediaId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${mediaId}?access_token=${accessToken}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete Instagram post');
      }
    } catch (error) {
      logger.posting.exception(error, { platform: 'instagram', action: 'delete-post' });
      throw error;
    }
  }

  /**
   * Convert Instagram media ID to shortcode for URL
   * This is a simplified version - actual implementation may vary
   */
  private getShortcode(mediaId: string): string {
    // Instagram uses base64-like encoding for shortcodes
    // For now, return the media ID as we'd need the actual shortcode from the API
    return mediaId;
  }
}
