/**
 * LinkedIn Posting Service
 * Implements LinkedIn Share API for posting content
 * 
 * Reference: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
 */

import { logger } from '@/lib/logger';

interface LinkedInPostResult {
  id: string;
  postUrl: string;
}

interface TextPostOptions {
  text: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

interface ImagePostOptions {
  text: string;
  imageUrl: string;
  imageTitle?: string;
  imageDescription?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

interface ArticlePostOptions {
  text: string;
  articleUrl: string;
  articleTitle?: string;
  articleDescription?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

export class LinkedInPoster {
  private baseUrl = 'https://api.linkedin.com/v2';
  
  /**
   * Post text content to LinkedIn
   */
  async postText(
    accessToken: string,
    authorUrn: string,
    options: TextPostOptions
  ): Promise<LinkedInPostResult> {
    const { text, visibility = 'PUBLIC' } = options;
    
    try {
      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: authorUrn,
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
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        logger.posting.error('LinkedIn post failed', { error, status: response.status });
        throw new Error(error.message || 'Failed to post to LinkedIn');
      }
      
      const data = await response.json();
      const postId = data.id;
      
      // Extract the share ID from the URN
      const shareId = postId.split(':').pop();
      
      return {
        id: postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'linkedin', action: 'post-text' });
      throw error;
    }
  }
  
  /**
   * Register an image asset for upload
   */
  private async registerImageUpload(
    accessToken: string,
    authorUrn: string
  ): Promise<{ uploadUrl: string; asset: string }> {
    const response = await fetch(`${this.baseUrl}/assets?action=registerUpload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register image upload');
    }
    
    const data = await response.json();
    const uploadUrl = data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = data.value.asset;
    
    return { uploadUrl, asset };
  }
  
  /**
   * Upload image binary to LinkedIn
   */
  private async uploadImage(uploadUrl: string, imageUrl: string): Promise<void> {
    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Upload to LinkedIn
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to LinkedIn');
    }
  }
  
  /**
   * Post content with an image to LinkedIn
   */
  async postImage(
    accessToken: string,
    authorUrn: string,
    options: ImagePostOptions
  ): Promise<LinkedInPostResult> {
    const { text, imageUrl, imageTitle, imageDescription, visibility = 'PUBLIC' } = options;
    
    try {
      // Step 1: Register the image upload
      const { uploadUrl, asset } = await this.registerImageUpload(accessToken, authorUrn);
      
      // Step 2: Upload the image
      await this.uploadImage(uploadUrl, imageUrl);
      
      // Step 3: Create the post with the image
      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text,
              },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  description: {
                    text: imageDescription || '',
                  },
                  media: asset,
                  title: {
                    text: imageTitle || '',
                  },
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        logger.posting.error('LinkedIn image post failed', { error, status: response.status });
        throw new Error(error.message || 'Failed to post image to LinkedIn');
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        postUrl: `https://www.linkedin.com/feed/update/${data.id}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'linkedin', action: 'post-image' });
      throw error;
    }
  }
  
  /**
   * Post an article/link to LinkedIn
   */
  async postArticle(
    accessToken: string,
    authorUrn: string,
    options: ArticlePostOptions
  ): Promise<LinkedInPostResult> {
    const { text, articleUrl, articleTitle, articleDescription, visibility = 'PUBLIC' } = options;
    
    try {
      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text,
              },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  description: {
                    text: articleDescription || '',
                  },
                  originalUrl: articleUrl,
                  title: {
                    text: articleTitle || '',
                  },
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        logger.posting.error('LinkedIn article post failed', { error, status: response.status });
        throw new Error(error.message || 'Failed to post article to LinkedIn');
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        postUrl: `https://www.linkedin.com/feed/update/${data.id}`,
      };
    } catch (error) {
      logger.posting.exception(error, { platform: 'linkedin', action: 'post-article' });
      throw error;
    }
  }
}
