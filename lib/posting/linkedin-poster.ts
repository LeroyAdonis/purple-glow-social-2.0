/**
 * LinkedIn Posting Service
 * Posts content to LinkedIn using the LinkedIn API
 */

interface LinkedInPostParams {
  text: string;
  imageUrl?: string;
  link?: string;
}

interface LinkedInPostResponse {
  id: string;
  postUrl: string;
}

export class LinkedInPoster {
  /**
   * Post text update to LinkedIn
   */
  async postText(accessToken: string, personUrn: string, text: string): Promise<LinkedInPostResponse> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post to LinkedIn');
      }

      const data = await response.json();
      const postId = data.id;
      
      return {
        id: postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}`,
      };
    } catch (error) {
      console.error('LinkedIn posting error:', error);
      throw error;
    }
  }

  /**
   * Post with link to LinkedIn
   */
  async postWithLink(
    accessToken: string,
    personUrn: string,
    params: LinkedInPostParams
  ): Promise<LinkedInPostResponse> {
    try {
      if (!params.link) {
        throw new Error('Link URL is required');
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: params.text,
              },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  originalUrl: params.link,
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post link to LinkedIn');
      }

      const data = await response.json();
      const postId = data.id;
      
      return {
        id: postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}`,
      };
    } catch (error) {
      console.error('LinkedIn link posting error:', error);
      throw error;
    }
  }

  /**
   * Post with image to LinkedIn
   * Requires 3 steps: register upload, upload image, create post
   */
  async postWithImage(
    accessToken: string,
    personUrn: string,
    params: LinkedInPostParams
  ): Promise<LinkedInPostResponse> {
    try {
      if (!params.imageUrl) {
        throw new Error('Image URL is required');
      }

      // Step 1: Register upload
      const registerResponse = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: personUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        }
      );

      if (!registerResponse.ok) {
        throw new Error('Failed to register image upload');
      }

      const registerData = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerData.value.asset;

      // Step 2: Download and upload image
      const imageResponse = await fetch(params.imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      const imageBuffer = await imageResponse.arrayBuffer();

      const uploadImageResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: imageBuffer,
      });

      if (!uploadImageResponse.ok) {
        throw new Error('Failed to upload image to LinkedIn');
      }

      // Step 3: Create post with uploaded image
      const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: params.text,
              },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  media: asset,
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      });

      if (!postResponse.ok) {
        const error = await postResponse.json();
        throw new Error(error.message || 'Failed to create LinkedIn post with image');
      }

      const data = await postResponse.json();
      const postId = data.id;
      
      return {
        id: postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}`,
      };
    } catch (error) {
      console.error('LinkedIn image posting error:', error);
      throw error;
    }
  }

  /**
   * Delete a LinkedIn post
   */
  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      const response = await fetch(`https://api.linkedin.com/v2/ugcPosts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete LinkedIn post');
      }
    } catch (error) {
      console.error('LinkedIn deletion error:', error);
      throw error;
    }
  }
}
