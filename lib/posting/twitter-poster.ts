/**
 * Twitter/X Posting Service
 * Posts content to Twitter using the Twitter API v2
 */

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
      console.error('Twitter posting error:', error);
      throw error;
    }
  }

  /**
   * Post tweet with image
   * Note: Media upload requires Twitter API v1.1 for upload, then v2 for posting
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

      // Step 2: Upload media (using v1.1 API)
      const formData = new FormData();
      formData.append('media', new Blob([imageBuffer]), 'image.jpg');

      const uploadResponse = await fetch(
        'https://upload.twitter.com/1.1/media/upload.json',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload media to Twitter');
      }

      const uploadData: TwitterMediaUploadResponse = await uploadResponse.json();
      const mediaId = uploadData.media_id_string;

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
      console.error('Twitter image posting error:', error);
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
      console.error('Twitter thread posting error:', error);
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
      console.error('Twitter deletion error:', error);
      throw error;
    }
  }

  /**
   * Get tweet details
   */
  async getTweet(accessToken: string, tweetId: string): Promise<any> {
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
      console.error('Twitter fetch error:', error);
      throw error;
    }
  }
}
