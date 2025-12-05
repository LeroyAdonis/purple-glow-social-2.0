/**
 * Script to verify and re-encrypt all tokens
 * 
 * Usage: npx tsx scripts/verify-tokens.ts
 */

import 'dotenv/config';
import { db } from '../drizzle/db';
import { connectedAccounts } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { encryptToken, decryptToken } from '../lib/crypto/token-encryption';

const USER_ID = 'q4qNEwtkURuCufgg3GLMbZbFb9rMCu08';

async function verifyTokens() {
  console.log('🔍 Verifying token encryption...\n');
  console.log(`Using TOKEN_ENCRYPTION_KEY: ${process.env.TOKEN_ENCRYPTION_KEY?.substring(0, 8)}...${process.env.TOKEN_ENCRYPTION_KEY?.substring(56)}\n`);

  const accounts = await db
    .select()
    .from(connectedAccounts)
    .where(eq(connectedAccounts.userId, USER_ID));

  console.log(`Found ${accounts.length} connected accounts:\n`);

  for (const account of accounts) {
    console.log(`Platform: ${account.platform}`);
    console.log(`  ID: ${account.id}`);
    console.log(`  Username: ${account.platformUsername}`);
    console.log(`  Token (first 50 chars): ${account.accessToken?.substring(0, 50)}...`);
    
    try {
      const decrypted = decryptToken(account.accessToken);
      console.log(`  ✅ Decryption SUCCESS - token length: ${decrypted.length}`);
    } catch (error) {
      console.log(`  ❌ Decryption FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log('');
  }

  process.exit(0);
}

verifyTokens().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
