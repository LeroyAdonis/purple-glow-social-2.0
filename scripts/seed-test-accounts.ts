/**
 * Test Account Seeding Script
 * 
 * Seeds the database with test accounts for all tiers and edge cases.
 * Run with: npm run db:seed-test
 * 
 * IMPORTANT: This script uses scrypt password hashing compatible with better-auth.
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { 
  user, 
  account, 
  posts, 
  automationRules, 
  connectedAccounts,
  notifications,
  dailyUsage 
} from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { bytesToHex } from '@noble/hashes/utils.js';

// Load environment variables from .env file
config();

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Make sure you have a .env file with DATABASE_URL set');
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

// Test account configurations
interface TestAccountConfig {
  email: string;
  name: string;
  password: string;
  tier: 'free' | 'pro' | 'business';
  credits: number;
  videoCredits?: number;
  isAdmin?: boolean;
  connectedAccounts?: Array<{
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
    username: string;
  }>;
  scheduledPosts?: number;
  automationRules?: number;
  purpose?: string;
}

const TEST_ACCOUNTS: TestAccountConfig[] = [
  {
    email: 'free@test.purpleglow.co.za',
    name: 'Free Test User',
    password: 'TestFree123!',
    tier: 'free',
    credits: 10,
    connectedAccounts: [
      { platform: 'instagram', username: 'free_test_insta' },
    ],
    scheduledPosts: 3,
    purpose: 'Test free tier limits',
  },
  {
    email: 'pro@test.purpleglow.co.za',
    name: 'Pro Test User',
    password: 'TestPro123!',
    tier: 'pro',
    credits: 500,
    videoCredits: 10,
    connectedAccounts: [
      { platform: 'instagram', username: 'pro_test_insta1' },
      { platform: 'instagram', username: 'pro_test_insta2' },
      { platform: 'facebook', username: 'pro_test_fb1' },
      { platform: 'facebook', username: 'pro_test_fb2' },
      { platform: 'twitter', username: 'pro_test_twitter' },
    ],
    scheduledPosts: 25,
    automationRules: 3,
    purpose: 'Test pro tier features',
  },
  {
    email: 'business@test.purpleglow.co.za',
    name: 'Business Test User',
    password: 'TestBiz123!',
    tier: 'business',
    credits: 2000,
    videoCredits: 50,
    connectedAccounts: [
      { platform: 'instagram', username: 'biz_test_insta1' },
      { platform: 'instagram', username: 'biz_test_insta2' },
      { platform: 'instagram', username: 'biz_test_insta3' },
      { platform: 'facebook', username: 'biz_test_fb1' },
      { platform: 'facebook', username: 'biz_test_fb2' },
      { platform: 'twitter', username: 'biz_test_twitter1' },
      { platform: 'twitter', username: 'biz_test_twitter2' },
      { platform: 'linkedin', username: 'biz_test_linkedin' },
    ],
    scheduledPosts: 100,
    automationRules: 10,
    purpose: 'Test unlimited features',
  },
  {
    email: 'admin@test.purpleglow.co.za',
    name: 'Admin Test User',
    password: 'TestAdmin123!',
    tier: 'business',
    credits: 2000,
    videoCredits: 50,
    isAdmin: true,
    purpose: 'Test admin dashboard',
  },
  {
    email: 'lowcredit@test.purpleglow.co.za',
    name: 'Low Credit User',
    password: 'TestLow123!',
    tier: 'pro',
    credits: 2,
    purpose: 'Test low credit warnings (< 20%)',
  },
  {
    email: 'zerocredit@test.purpleglow.co.za',
    name: 'Zero Credit User',
    password: 'TestZero123!',
    tier: 'pro',
    credits: 0,
    connectedAccounts: [
      { platform: 'instagram', username: 'zero_test_insta' },
    ],
    scheduledPosts: 5,
    purpose: 'Test zero credit behavior and post skipping',
  },
];

// South African themed sample content for posts
const SA_POST_CONTENT = [
  "🌍 Howzit Mzansi! Check out our lekker new range of products! #LocalIsLekker #SouthAfrica",
  "🇿🇦 Sharp sharp! Black Friday specials are here - don't miss out! #Mzansi #BlackFriday",
  "☀️ Jislaaik, it's a beautiful day in Joburg! Perfect for our summer sale! #Johannesburg #Shopping",
  "🍔 Eish, this braai is going to be lekker! Join us this weekend! #BraaiDay #SouthAfrican",
  "💼 Looking for work in Cape Town? We're hiring! Apply now - no CV required! #CapeTownJobs",
  "🎉 Happy Heritage Day, Mzansi! Celebrating our beautiful diversity! #HeritageDay #Ubuntu",
  "🏆 Ja nee, our team won! Congrats to the Proteas! #CricketSA #ProudlySA",
  "📱 New tech gadgets now available in Sandton! Come check it out, my bru! #TechSA",
  "🌸 Spring is here! Fresh flowers from our Durban nursery! #DurbanSummer #Flowers",
  "🎵 Amapiano vibes only! New music dropping Friday! #Amapiano #SAMusic",
];

// Sample automation rule topics
const AUTOMATION_TOPICS = [
  'Weekly product updates',
  'Daily motivation quotes',
  'Customer testimonials',
  'Industry news digest',
  'Behind the scenes content',
  'Holiday greetings',
  'Flash sale announcements',
  'New arrival alerts',
  'Tips and tricks',
  'Community highlights',
];

// Scrypt config matching better-auth
const scryptConfig = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};

/**
 * Hash password using better-auth compatible scrypt method
 */
async function hashPassword(password: string): Promise<string> {
  // Generate 16 random bytes for salt, convert to hex
  const saltBytes = crypto.randomBytes(16);
  const salt = bytesToHex(saltBytes);
  
  // Hash using scrypt with same params as better-auth
  const key = await scryptAsync(
    password.normalize("NFKC"), 
    salt, 
    {
      N: scryptConfig.N,
      p: scryptConfig.p,
      r: scryptConfig.r,
      dkLen: scryptConfig.dkLen,
      maxmem: 128 * scryptConfig.N * scryptConfig.r * 2
    }
  );
  
  return `${salt}:${bytesToHex(key)}`;
}

/**
 * Generate a fake encrypted token for connected accounts
 */
function generateFakeToken(): string {
  return `fake_token_${nanoid(32)}`;
}

/**
 * Create a test user with all associated data
 */
async function createTestUser(config: TestAccountConfig): Promise<string> {
  const userId = nanoid();
  const now = new Date();
  
  console.log(`\n📧 Creating: ${config.email}`);
  
  // Create user
  await db.insert(user).values({
    id: userId,
    email: config.email,
    name: config.name,
    emailVerified: true,
    tier: config.tier,
    credits: config.credits,
    videoCredits: config.videoCredits || 0,
    lastCreditReset: now,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();
  
  // Create credential account (for email/password login)
  const passwordHash = await hashPassword(config.password);
  await db.insert(account).values({
    id: nanoid(),
    accountId: userId,
    providerId: 'credential',
    userId: userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();
  
  console.log(`  ✅ User created (${config.tier} tier, ${config.credits} credits)`);
  
  // Create connected accounts
  if (config.connectedAccounts && config.connectedAccounts.length > 0) {
    for (const account of config.connectedAccounts) {
      await db.insert(connectedAccounts).values({
        id: nanoid(),
        userId: userId,
        platform: account.platform,
        platformUserId: `${account.platform}_${nanoid(8)}`,
        platformUsername: account.username,
        platformDisplayName: account.username.replace(/_/g, ' '),
        accessToken: generateFakeToken(),
        refreshToken: generateFakeToken(),
        tokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        scope: 'read write',
        isActive: true,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }
    console.log(`  ✅ Connected ${config.connectedAccounts.length} social accounts`);
  }
  
  // Create scheduled posts
  if (config.scheduledPosts && config.scheduledPosts > 0) {
    const platforms: Array<'facebook' | 'instagram' | 'twitter' | 'linkedin'> = ['facebook', 'instagram', 'twitter', 'linkedin'];
    
    for (let i = 0; i < config.scheduledPosts; i++) {
      const scheduledDate = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000); // Spread over days
      const platform = platforms[i % platforms.length];
      const content = SA_POST_CONTENT[i % SA_POST_CONTENT.length];
      
      await db.insert(posts).values({
        userId: userId,
        content: content,
        platform: platform,
        status: 'scheduled',
        scheduledDate: scheduledDate,
        topic: 'Test post',
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }
    console.log(`  ✅ Created ${config.scheduledPosts} scheduled posts`);
  }
  
  // Create automation rules (only for pro/business tiers)
  if (config.automationRules && config.automationRules > 0 && config.tier !== 'free') {
    for (let i = 0; i < config.automationRules; i++) {
      const topic = AUTOMATION_TOPICS[i % AUTOMATION_TOPICS.length];
      
      await db.insert(automationRules).values({
        userId: userId,
        frequency: i % 2 === 0 ? 'weekly' : 'daily',
        coreTopic: topic,
        isActive: true,
        createdAt: now,
      }).onConflictDoNothing();
    }
    console.log(`  ✅ Created ${config.automationRules} automation rules`);
  }
  
  // Create sample notifications for certain users
  if (config.email.includes('lowcredit')) {
    await db.insert(notifications).values({
      userId: userId,
      type: 'low_credits',
      title: 'Low Credits Warning',
      message: 'You have only 2 credits remaining. Consider purchasing more to continue posting.',
      read: false,
      createdAt: now,
    }).onConflictDoNothing();
    console.log(`  ✅ Created low credit notification`);
  }
  
  if (config.email.includes('zerocredit')) {
    await db.insert(notifications).values({
      userId: userId,
      type: 'credits_expiring',
      title: 'Credits Depleted',
      message: 'You have no credits remaining. Your scheduled posts will be skipped until you add more credits.',
      read: false,
      createdAt: now,
    }).onConflictDoNothing();
    console.log(`  ✅ Created zero credit notification`);
  }
  
  // Create daily usage for today
  const today = new Date().toISOString().split('T')[0];
  await db.insert(dailyUsage).values({
    userId: userId,
    date: today,
    generationsCount: Math.floor(Math.random() * 5),
    postsCount: Math.floor(Math.random() * 3),
    platformBreakdown: JSON.stringify({
      facebook: Math.floor(Math.random() * 2),
      instagram: Math.floor(Math.random() * 2),
      twitter: Math.floor(Math.random() * 2),
      linkedin: Math.floor(Math.random() * 2),
    }),
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();
  
  console.log(`  ✅ Purpose: ${config.purpose}`);
  
  return userId;
}

/**
 * Clean up existing test accounts
 */
async function cleanupTestAccounts(): Promise<void> {
  console.log('\n🧹 Cleaning up existing test accounts...');
  
  const testEmails = TEST_ACCOUNTS.map(a => a.email);
  
  for (const email of testEmails) {
    // Find user by email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    
    if (existingUser) {
      // Delete related data (cascade should handle most, but be explicit)
      await db.delete(posts).where(eq(posts.userId, existingUser.id));
      await db.delete(automationRules).where(eq(automationRules.userId, existingUser.id));
      await db.delete(connectedAccounts).where(eq(connectedAccounts.userId, existingUser.id));
      await db.delete(notifications).where(eq(notifications.userId, existingUser.id));
      await db.delete(dailyUsage).where(eq(dailyUsage.userId, existingUser.id));
      await db.delete(account).where(eq(account.userId, existingUser.id));
      await db.delete(user).where(eq(user.id, existingUser.id));
      
      console.log(`  🗑️  Deleted: ${email}`);
    }
  }
}

/**
 * Main seeding function
 */
async function seedTestAccounts(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     Purple Glow Social 2.0 - Test Account Seeding Script       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  try {
    // Clean up existing test accounts first
    await cleanupTestAccounts();
    
    console.log('\n🌱 Creating test accounts...');
    
    const createdUsers: string[] = [];
    
    for (const config of TEST_ACCOUNTS) {
      const userId = await createTestUser(config);
      createdUsers.push(userId);
    }
    
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('✅ Successfully created', createdUsers.length, 'test accounts!');
    console.log('════════════════════════════════════════════════════════════════');
    
    console.log('\n📋 Test Account Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const config of TEST_ACCOUNTS) {
      console.log(`\n  👤 ${config.name}`);
      console.log(`     Email: ${config.email}`);
      console.log(`     Password: ${config.password}`);
      console.log(`     Tier: ${config.tier.toUpperCase()}`);
      console.log(`     Credits: ${config.credits}`);
      if (config.purpose) {
        console.log(`     Purpose: ${config.purpose}`);
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Seeding complete! You can now log in with any test account.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding test accounts:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedTestAccounts();
