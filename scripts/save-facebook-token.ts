/**
 * Script to save a Facebook Page token to connected accounts
 * 
 * Usage: npx tsx scripts/save-facebook-token.ts
 */

import 'dotenv/config';
import { db } from '../drizzle/db';
import { connectedAccounts } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { encryptToken } from '../lib/crypto/token-encryption';
import { nanoid } from 'nanoid';

const USER_ID = 'q4qNEwtkURuCufgg3GLMbZbFb9rMCu08';
const ACCESS_TOKEN = 'EAARMdc6W0mABQAAS8PBBhHxr48YOqkZBgXVqbeNAZClYSrk8xUs3VLoyvoStPIXXteZCHiJLveVssk1GYGQSZAbLLq3m81vSxJvDwroRvZAEzDTyCxMWtXJs7J7GO0lNs9hs6IG3k1ziqlmAxFZCUiPUYU2nodn2KGgTVMZB3hYdXLbZBOZADcScrmQ8abvsamZCvJqHPtg8bcZBkx3l8BKflsyQNTtt62w8y92RU8PJbtYYSZCs9cKTSCXyIEZBFcsmBfEwnzrFlYCZCGfQE4EJDcyB0ZD';

async function saveFacebookToken() {
  console.log('🔐 Saving Facebook Page token...\n');

  try {
    // Step 1: Get Page info using the token
    console.log('📡 Fetching Page information...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${ACCESS_TOKEN}`
    );

    if (!pagesResponse.ok) {
      const error = await pagesResponse.json();
      throw new Error(`Failed to fetch pages: ${error.error?.message}`);
    }

    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      // Try getting user info if no pages
      const meResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${ACCESS_TOKEN}`
      );
      const meData = await meResponse.json();
      console.log('User info:', meData);
      throw new Error('No Facebook Pages found for this token. Make sure you selected a Page in Graph API Explorer.');
    }

    const page = pagesData.data[0];
    console.log(`✅ Found Page: ${page.name} (ID: ${page.id})`);

    // Use the Page access token (not user token)
    const pageAccessToken = page.access_token;

    // Step 2: Encrypt the token
    console.log('🔒 Encrypting token...');
    const encryptedToken = encryptToken(pageAccessToken);

    // Step 3: Check if Facebook connection already exists
    const existing = await db.query.connectedAccounts.findFirst({
      where: and(
        eq(connectedAccounts.userId, USER_ID),
        eq(connectedAccounts.platform, 'facebook')
      ),
    });

    const now = new Date();
    // Page tokens from long-lived user tokens don't expire, but set 60 days for safety
    const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    if (existing) {
      // Update existing connection
      console.log('📝 Updating existing Facebook connection...');
      await db
        .update(connectedAccounts)
        .set({
          platformUserId: page.id,
          platformUsername: page.name,
          platformDisplayName: page.name,
          accessToken: encryptedToken,
          tokenExpiresAt: expiresAt,
          scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
          isActive: true,
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(connectedAccounts.id, existing.id));
      
      console.log(`✅ Updated connection ID: ${existing.id}`);
    } else {
      // Create new connection
      console.log('📝 Creating new Facebook connection...');
      const newId = nanoid();
      await db.insert(connectedAccounts).values({
        id: newId,
        userId: USER_ID,
        platform: 'facebook',
        platformUserId: page.id,
        platformUsername: page.name,
        platformDisplayName: page.name,
        accessToken: encryptedToken,
        tokenExpiresAt: expiresAt,
        scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
        isActive: true,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      
      console.log(`✅ Created connection ID: ${newId}`);
    }

    console.log('\n🎉 Facebook Page token saved successfully!');
    console.log(`   Page: ${page.name}`);
    console.log(`   Page ID: ${page.id}`);
    console.log(`   Expires: ${expiresAt.toISOString()}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

saveFacebookToken();
