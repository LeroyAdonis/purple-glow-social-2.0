/**
 * Script to create test scheduled posts for testing Inngest
 * 
 * Usage: npx tsx scripts/schedule-test-posts.ts
 */

import 'dotenv/config';
import { db } from '../drizzle/db';
import { posts, creditReservations, user } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '../lib/inngest/client';
import { randomUUID } from 'crypto';

const USER_ID = 'q4qNEwtkURuCufgg3GLMbZbFb9rMCu08';

async function scheduleTestPosts() {
  console.log('🚀 Creating test scheduled posts...\n');

  // Get user to verify they exist and have credits
  const userData = await db.query.user.findFirst({
    where: eq(user.id, USER_ID),
  });

  if (!userData) {
    console.error('❌ User not found:', USER_ID);
    process.exit(1);
  }

  console.log(`✅ Found user: ${userData.name || userData.email}`);
  console.log(`   Credits: ${userData.credits}`);
  console.log(`   Tier: ${userData.tier}\n`);

  // Schedule times: 2 minutes, 4 minutes, and 6 minutes from now
  const now = new Date();
  const scheduleTimes = [
    new Date(now.getTime() + 2 * 60 * 1000), // 2 minutes
    new Date(now.getTime() + 4 * 60 * 1000), // 4 minutes
    new Date(now.getTime() + 6 * 60 * 1000), // 6 minutes
  ];

  const testPosts = [
    {
      platform: 'twitter' as const,
      content: `🧪 Twitter Test from Purple Glow Social! Scheduled at ${now.toISOString()}. This is lekker automated posting! #Mzansi #TestPost`,
      scheduledDate: scheduleTimes[0],
      imageUrl: null,
    },
    {
      platform: 'facebook' as const,
      content: `🚀 Facebook Test from Purple Glow Social! Sharp sharp Mzansi! 🇿🇦 Testing our scheduled posting to Pages. This is lekker! #PurpleGlowSocial #SouthAfrica`,
      scheduledDate: scheduleTimes[1],
      imageUrl: null,
    },
    {
      platform: 'instagram' as const,
      content: `✨ Instagram Test - Howzit! Testing Purple Glow Social's scheduled posting. Lekker vibes from South Africa! 🇿🇦 #Mzansi #LocalIsLekker #PurpleGlowSocial #SouthAfrica #TechTest`,
      scheduledDate: scheduleTimes[2],
      // Using a publicly accessible test image for Instagram
      imageUrl: 'https://picsum.photos/1080/1080',
    },
  ];

  const createdPosts = [];

  for (const testPost of testPosts) {
    // Create the post
    const [newPost] = await db
      .insert(posts)
      .values({
        id: randomUUID(),
        userId: USER_ID,
        content: testPost.content,
        platform: testPost.platform,
        status: 'scheduled',
        scheduledDate: testPost.scheduledDate,
        imageUrl: testPost.imageUrl,
        topic: 'Test Post',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log(`📝 Created post: ${newPost.id}`);
    console.log(`   Platform: ${newPost.platform}`);
    console.log(`   Scheduled: ${testPost.scheduledDate.toISOString()}`);
    console.log(`   Content: ${testPost.content.substring(0, 50)}...\n`);

    // Create credit reservation
    const expiresAt = new Date(testPost.scheduledDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after scheduled time
    await db.insert(creditReservations).values({
      userId: USER_ID,
      postId: newPost.id,
      credits: 1,
      status: 'pending',
      expiresAt,
      createdAt: new Date(),
    });

    console.log(`   ✅ Credit reservation created\n`);

    createdPosts.push({
      postId: newPost.id,
      platform: newPost.platform,
      scheduledAt: testPost.scheduledDate.toISOString(),
    });
  }

  // Send events to Inngest
  console.log('📤 Sending events to Inngest...\n');

  for (const post of createdPosts) {
    await inngest.send({
      name: 'post/scheduled.process',
      data: {
        postId: post.postId,
        userId: USER_ID,
        platform: post.platform,
        scheduledAt: post.scheduledAt,
      },
    });

    console.log(`   ✅ Sent event for post ${post.postId}`);
    console.log(`      Will publish at: ${post.scheduledAt}\n`);
  }

  console.log('🎉 Done! Check Inngest dashboard for the scheduled runs.');
  console.log('\nSchedule summary:');
  createdPosts.forEach((post, i) => {
    console.log(`   Post ${i + 1}: ${new Date(post.scheduledAt).toLocaleTimeString()} (${post.postId.substring(0, 8)}...)`);
  });

  process.exit(0);
}

scheduleTestPosts().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
