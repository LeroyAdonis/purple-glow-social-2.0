/**
 * Twitter/X Posting Service
 * Posts content to Twitter using the Twitter API v2
 * 
 * Reference: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload
 */

import { logger } from '@/lib/logger';

interface TwitterPostParams {
  text: string;
  mediaIds?: string[];
}

interface TwitterPostResponse {
  id: string;
  postUrl: string;
}

interface TwitterMediaUploadResponse {
  media_id_string: string;
}

interface ChunkedUploadInitResponse {
  media_id_string: string;
  expires_after_secs: number;
}

interface ChunkedUploadStatusResponse {
  processing_info?: {
    state: 'pending' | 'in_progress' | 'succeeded' | 'failed';
    check_after_secs?: number;
    progress_percent?: number;
    error?: {
      code: number;
      message: string;
    };
  };
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_POLL_ATTEMPTS = 60;

export class TwitterPoster {
  /**
   * Post text tweet
   */
  async postText(accessToken: string, text: string): Promise<TwitterPostResponse> {
    try {
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to post tweet');
      }

      const data = await response.json();
      const tweetId = data.data.id;
      
      return {
        id: tweetId,
        postUrl: `https://twitter.com/i/web/status/${tweetId}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'twitter', action: 'post-text' });
      throw error;
    }
  }

  /**
   * Initialize chunked media upload
   */
  private async initChunkedUpload(
    accessToken: string,
    totalBytes: number,
    mediaType: string,
    mediaCategory: 'tweet_image' | 'tweet_video' | 'tweet_gif' = 'tweet_image'
  ): Promise<string> {
    const params = new URLSearchParams({
      command: 'INIT',
      total_bytes: totalBytes.toString(),
      media_type: mediaType,
      media_category: mediaCategory,
    });

    const response = await fetch(
      `https://upload.twitter.com/1.1/media/upload.json?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize media upload');
    }

    const data: ChunkedUploadInitResponse = await response.json();
    return data.media_id_string;
  }

  /**
   * Append chunk to media upload
   */
  private async appendChunk(
    accessToken: string,
    mediaId: string,
    chunk: ArrayBuffer,
    segmentIndex: number
  ): Promise<void> {
    const formData = new FormData();
    formData.append('command', 'APPEND');
    formData.append('media_id', mediaId);
    formData.append('segment_index', segmentIndex.toString());
    formData.append('media', new Blob([chunk]));

    const response = await fetch(
      'https://upload.twitter.com/1.1/media/upload.json',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to upload chunk ${segmentIndex}`);
    }
  }

  /**
   * Finalize chunked media upload
   */
  private async finalizeUpload(
    accessToken: string,
    mediaId: string
  ): Promise<void> {
    const params = new URLSearchParams({
      command: 'FINALIZE',
      media_id: mediaId,
    });

    const response = await fetch(
      `https://upload.twitter.com/1.1/media/upload.json?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to finalize media upload');
    }

    const data: ChunkedUploadStatusResponse = await response.json();
    
    // If processing is needed, wait for it
    if (data.processing_info) {
      await this.waitForProcessing(accessToken, mediaId);
    }
  }

  /**
   * Check media processing status
   */
  private async checkStatus(
    accessToken: string,
    mediaId: string
  ): Promise<ChunkedUploadStatusResponse> {
    const params = new URLSearchParams({
      command: 'STATUS',
      media_id: mediaId,
    });

    const response = await fetch(
      `https://upload.twitter.com/1.1/media/upload.json?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check media status');
    }

    return response.json();
  }

  /**
   * Wait for media processing to complete
   */
  private async waitForProcessing(
    accessToken: string,
    mediaId: string
  ): Promise<void> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const status = await this.checkStatus(accessToken, mediaId);
      
      if (!status.processing_info) {
        return; // Done
      }
      
      const { state, check_after_secs, error } = status.processing_info;
      
      if (state === 'succeeded') {
        return;
      }
      
      if (state === 'failed') {
        throw new Error(error?.message || 'Media processing failed');
      }
      
      // Wait before next check
      const waitTime = (check_after_secs || 5) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    throw new Error('Media processing timed out');
  }

  /**
   * Upload media using chunked upload (supports large files)
   */
  async uploadMediaChunked(
    accessToken: string,
    mediaBuffer: ArrayBuffer,
    mediaType: string,
    category: 'tweet_image' | 'tweet_video' | 'tweet_gif' = 'tweet_image'
  ): Promise<string> {
    const totalBytes = mediaBuffer.byteLength;
    
    // For small files, use simple upload
    if (totalBytes < CHUNK_SIZE && category === 'tweet_image') {
      return this.uploadMediaSimple(accessToken, mediaBuffer);
    }
    
    // Initialize chunked upload
    const mediaId = await this.initChunkedUpload(
      accessToken,
      totalBytes,
      mediaType,
      category
    );
    
    // Upload chunks
    let offset = 0;
    let segmentIndex = 0;
    
    while (offset < totalBytes) {
      const end = Math.min(offset + CHUNK_SIZE, totalBytes);
      const chunk = mediaBuffer.slice(offset, end);
      
      await this.appendChunk(accessToken, mediaId, chunk, segmentIndex);
      
      offset = end;
      segmentIndex++;
    }
    
    // Finalize upload
    await this.finalizeUpload(accessToken, mediaId);
    
    return mediaId;
  }

  /**
   * Simple media upload for small files
   */
  private async uploadMediaSimple(
    accessToken: string,
    mediaBuffer: ArrayBuffer
  ): Promise<string> {
    const formData = new FormData();
    formData.append('media', new Blob([mediaBuffer]), 'media');

    const response = await fetch(
      'https://upload.twitter.com/1.1/media/upload.json',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload media');
    }

    const data: TwitterMediaUploadResponse = await response.json();
    return data.media_id_string;
  }

  /**
   * Post tweet with image
   */
  async postWithImage(
    accessToken: string,
    text: string,
    imageUrl: string
  ): Promise<TwitterPostResponse> {
    try {
      // Step 1: Download image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

      // Step 2: Upload media using chunked upload
      const mediaId = await this.uploadMediaChunked(
        accessToken,
        imageBuffer,
        contentType,
        'tweet_image'
      );

      // Step 3: Post tweet with media (using v2 API)
      const tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          media: {
            media_ids: [mediaId],
          },
        }),
      });

      if (!tweetResponse.ok) {
        const error = await tweetResponse.json();
        throw new Error(error.detail || 'Failed to post tweet with image');
      }

      const data = await tweetResponse.json();
      const tweetId = data.data.id;
      
      return {
        id: tweetId,
        postUrl: `https://twitter.com/i/web/status/${tweetId}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'twitter', action: 'post-with-image' });
      throw error;
    }
  }

  /**
   * Post tweet with video
   */
  async postWithVideo(
    accessToken: string,
    text: string,
    videoUrl: string
  ): Promise<TwitterPostResponse> {
    try {
      // Step 1: Download video
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video');
      }
      const videoBuffer = await videoResponse.arrayBuffer();
      const contentType = videoResponse.headers.get('content-type') || 'video/mp4';

      // Step 2: Upload video using chunked upload
      const mediaId = await this.uploadMediaChunked(
        accessToken,
        videoBuffer,
        contentType,
        'tweet_video'
      );

      // Step 3: Post tweet with media
      const tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          media: {
            media_ids: [mediaId],
          },
        }),
      });

      if (!tweetResponse.ok) {
        const error = await tweetResponse.json();
        throw new Error(error.detail || 'Failed to post tweet with video');
      }

      const data = await tweetResponse.json();
      const tweetId = data.data.id;
      
      return {
        id: tweetId,
        postUrl: `https://twitter.com/i/web/status/${tweetId}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'twitter', action: 'post-with-video' });
      throw error;
    }
  }

  /**
   * Post thread (multiple tweets)
   */
  async postThread(accessToken: string, tweets: string[]): Promise<TwitterPostResponse[]> {
    const results: TwitterPostResponse[] = [];
    let previousTweetId: string | undefined;

    try {
      for (const text of tweets) {
        const body: any = { text };
        
        // If this is a reply to previous tweet
        if (previousTweetId) {
          body.reply = {
            in_reply_to_tweet_id: previousTweetId,
          };
        }

        const response = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Failed to post tweet in thread');
        }

        const data = await response.json();
        const tweetId = data.data.id;
        
        results.push({
          id: tweetId,
          postUrl: `https://twitter.com/i/web/status/${tweetId}`,
        });

        previousTweetId = tweetId;
      }

      return results;
    } catch (error) {
      logger.posting.exception(error, { platform: 'twitter', action: 'post-thread' });
      throw error;
    }
  }

  /**
   * Delete a tweet
   */
  async deleteTweet(accessToken: string, tweetId: string): Promise<void> {
    try {
      const response = await fetch(`https://api.twitter.com/2/tweets/${tweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete tweet');
      }
    } catch (error) {
      logger.posting.exception(error, { platform: 'twitter', action: 'delete-tweet' });
      throw error;
    }
  }

  /**
   * Get tweet details
   */
  async getTweet(accessToken: string, tweetId: string): Promise<unknown> {
    try {
      const response = await fetch(
        `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=created_at,public_metrics`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tweet');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      logger.posting.exception(error, { platform: 'twitter', action: 'get-tweet' });
      throw error;
    }
  }
}
