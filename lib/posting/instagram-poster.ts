/**
 * Instagram Posting Service
 * Posts content to Instagram Business Accounts using the Graph API
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

export class InstagramPoster {
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

      // Wait a moment for Instagram to process the image
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Publish the container
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
      
      return {
        id: publishData.id,
        postUrl: `https://www.instagram.com/p/${this.getShortcode(publishData.id)}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'instagram', action: 'post-image' });
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

      // Step 3: Publish carousel
      await new Promise(resolve => setTimeout(resolve, 2000));

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
      
      return {
        id: publishData.id,
        postUrl: `https://www.instagram.com/p/${this.getShortcode(publishData.id)}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'instagram', action: 'post-carousel' });
      throw error;
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
