/**
 * Facebook Posting Service
 * Posts content to Facebook Pages using the Graph API
 */

interface FacebookPostParams {
  message: string;
  imageUrl?: string;
  link?: string;
}

interface FacebookPostResponse {
  id: string;
  postUrl: string;
}

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
      console.error('Facebook posting error:', error);
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
      console.error('Facebook image posting error:', error);
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
      console.error('Facebook link posting error:', error);
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
      console.error('Facebook post deletion error:', error);
      throw error;
    }
  }
}
