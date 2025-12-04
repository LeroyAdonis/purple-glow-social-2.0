/**
 * Facebook Posting Service
 * Posts content to Facebook Pages using the Graph API
 * 
 * Reference: https://developers.facebook.com/docs/pages-api/posts
 */

import { logger } from '@/lib/logger';

interface FacebookPostParams {
  message: string;
  imageUrl?: string;
  link?: string;
}

interface FacebookPostResponse {
  id: string;
  postUrl: string;
}

interface VideoUploadStartResponse {
  video_id: string;
  upload_session_id: string;
  start_offset: string;
  end_offset: string;
}

const VIDEO_CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks

export class FacebookPoster {
  /**
   * Post text content to Facebook Page
   */
  async postText(accessToken: string, pageId: string, message: string): Promise<FacebookPostResponse> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post to Facebook');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        postUrl: `https://www.facebook.com/${data.id}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'facebook', action: 'post-text' });
      throw error;
    }
  }

  /**
   * Post image with caption to Facebook Page
   */
  async postImage(
    accessToken: string,
    pageId: string,
    params: FacebookPostParams
  ): Promise<FacebookPostResponse> {
    try {
      if (!params.imageUrl) {
        throw new Error('Image URL is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: params.imageUrl,
            caption: params.message,
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post image to Facebook');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        postUrl: `https://www.facebook.com/${data.id}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'facebook', action: 'post-image' });
      throw error;
    }
  }

  /**
   * Start resumable video upload session
   */
  private async startVideoUpload(
    accessToken: string,
    pageId: string,
    fileSize: number
  ): Promise<VideoUploadStartResponse> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/videos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          upload_phase: 'start',
          file_size: fileSize,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to start video upload');
    }

    return response.json();
  }

  /**
   * Upload a video chunk
   */
  private async uploadVideoChunk(
    accessToken: string,
    uploadSessionId: string,
    startOffset: number,
    chunk: ArrayBuffer
  ): Promise<{ start_offset: string; end_offset: string }> {
    const formData = new FormData();
    formData.append('upload_phase', 'transfer');
    formData.append('upload_session_id', uploadSessionId);
    formData.append('start_offset', startOffset.toString());
    formData.append('video_file_chunk', new Blob([chunk]));
    formData.append('access_token', accessToken);

    const response = await fetch(
      'https://graph.facebook.com/v18.0/me/videos',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload video chunk');
    }

    return response.json();
  }

  /**
   * Finish video upload
   */
  private async finishVideoUpload(
    accessToken: string,
    uploadSessionId: string,
    description?: string
  ): Promise<{ video_id: string }> {
    const params: Record<string, string> = {
      upload_phase: 'finish',
      upload_session_id: uploadSessionId,
      access_token: accessToken,
    };

    if (description) {
      params.description = description;
    }

    const response = await fetch(
      'https://graph.facebook.com/v18.0/me/videos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to finish video upload');
    }

    return response.json();
  }

  /**
   * Post video to Facebook Page using resumable upload
   */
  async postVideo(
    accessToken: string,
    pageId: string,
    videoUrl: string,
    description?: string
  ): Promise<FacebookPostResponse> {
    try {
      // Step 1: Download video
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video');
      }
      const videoBuffer = await videoResponse.arrayBuffer();
      const fileSize = videoBuffer.byteLength;

      // Step 2: Start upload session
      const uploadSession = await this.startVideoUpload(accessToken, pageId, fileSize);
      const { upload_session_id } = uploadSession;

      // Step 3: Upload chunks
      let offset = 0;
      while (offset < fileSize) {
        const end = Math.min(offset + VIDEO_CHUNK_SIZE, fileSize);
        const chunk = videoBuffer.slice(offset, end);
        
        const result = await this.uploadVideoChunk(
          accessToken,
          upload_session_id,
          offset,
          chunk
        );
        
        offset = parseInt(result.end_offset, 10);
      }

      // Step 4: Finish upload
      const result = await this.finishVideoUpload(accessToken, upload_session_id, description);

      return {
        id: result.video_id,
        postUrl: `https://www.facebook.com/${result.video_id}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'facebook', action: 'post-video' });
      throw error;
    }
  }

  /**
   * Post link to Facebook Page
   */
  async postLink(
    accessToken: string,
    pageId: string,
    params: FacebookPostParams
  ): Promise<FacebookPostResponse> {
    try {
      if (!params.link) {
        throw new Error('Link URL is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: params.message,
            link: params.link,
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post link to Facebook');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        postUrl: `https://www.facebook.com/${data.id}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'facebook', action: 'post-link' });
      throw error;
    }
  }

  /**
   * Delete a post from Facebook
   */
  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?access_token=${accessToken}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete Facebook post');
      }
    } catch (error) {
      logger.posting.exception(error, { platform: 'facebook', action: 'delete-post' });
      throw error;
    }
  }
}
