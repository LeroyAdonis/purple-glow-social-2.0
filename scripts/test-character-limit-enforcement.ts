/**
 * Character Limit Enforcement Test Suite
 * Tests strict character limit enforcement with real Gemini API calls
 * 
 * REQUIREMENTS:
 * 1. Generate 5 Twitter posts (280 char limit)
 * 2. Verify ALL are under 280 characters
 * 3. No truncated content allowed
 * 4. Test emergency fallback scenarios
 */

import { GeminiService } from '@/lib/ai/gemini-service';
import { logger } from '@/lib/logger';

interface TestResult {
  topic: string;
  content: string;
  characterCount: number;
  withinLimit: boolean;
  platform: string;
  attemptNumber: number;
  qualityScore?: number;
  passed: boolean;
}

const TEST_TOPICS = [
  'Black Friday deals on electronics',
  'New restaurant opening in Johannesburg with traditional South African cuisine',
  'Weekend braai tips and recipes for summer',
  'Professional development workshop on digital marketing strategies',
  'Community fundraiser event for local school with live music and food',
];

const TWITTER_LIMIT = 280;

async function testCharacterLimitEnforcement(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        CHARACTER LIMIT ENFORCEMENT TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    console.error('Set it with: $env:GEMINI_API_KEY="your-key-here"\n');
    process.exit(1);
  }

  const geminiService = new GeminiService(apiKey);
  const results: TestResult[] = [];
  
  console.log(`📝 Testing with ${TEST_TOPICS.length} topics on Twitter (${TWITTER_LIMIT} char limit)\n`);

  for (let i = 0; i < TEST_TOPICS.length; i++) {
    const topic = TEST_TOPICS[i]!;
    console.log(`\n─────────────────────────────────────────────────────────────`);
    console.log(`TEST ${i + 1}/${TEST_TOPICS.length}: ${topic}`);
    console.log(`─────────────────────────────────────────────────────────────`);

    try {
      const startTime = Date.now();
      
      const generated = await geminiService.generateContentWithRetry({
        topic,
        platform: 'twitter',
        language: 'en',
        tone: 'friendly',
        includeHashtags: true,
        includeEmojis: true,
      });

      const duration = Date.now() - startTime;
      const charCount = generated.content.length;
      const withinLimit = charCount <= TWITTER_LIMIT;

      results.push({
        topic,
        content: generated.content,
        characterCount: charCount,
        withinLimit,
        platform: 'twitter',
        attemptNumber: i + 1,
        qualityScore: generated.validation?.qualityScore,
        passed: withinLimit,
      });

      // Display result
      console.log(`\n📄 Generated Content:`);
      console.log(`┌${'─'.repeat(78)}┐`);
      console.log(`│ ${generated.content.substring(0, 76).padEnd(76)} │`);
      if (generated.content.length > 76) {
        const remaining = generated.content.substring(76);
        for (let j = 0; j < remaining.length; j += 76) {
          console.log(`│ ${remaining.substring(j, j + 76).padEnd(76)} │`);
        }
      }
      console.log(`└${'─'.repeat(78)}┘`);

      console.log(`\n📊 Metrics:`);
      console.log(`   Character Count: ${charCount}/${TWITTER_LIMIT}`);
      console.log(`   Within Limit: ${withinLimit ? '✅ YES' : '❌ NO'}`);
      console.log(`   Quality Score: ${generated.validation?.qualityScore || 'N/A'}/100`);
      console.log(`   Generation Time: ${duration}ms`);
      console.log(`   Hashtags: ${generated.hashtags.join(', ')}`);

      if (!withinLimit) {
        console.log(`\n❌ CRITICAL FAILURE: Content exceeds ${TWITTER_LIMIT} character limit!`);
        console.log(`   Overflow: ${charCount - TWITTER_LIMIT} characters`);
      } else if (charCount > TWITTER_LIMIT * 0.95) {
        console.log(`\n⚠️  WARNING: Content is ${charCount - Math.floor(TWITTER_LIMIT * 0.95)} chars over the 95% safety threshold`);
      } else {
        console.log(`\n✅ PASSED: Content within character limit with ${TWITTER_LIMIT - charCount} chars buffer`);
      }

    } catch (error) {
      console.error(`\n❌ Test ${i + 1} FAILED with error:`);
      console.error(error);
      
      results.push({
        topic,
        content: '',
        characterCount: 0,
        withinLimit: false,
        platform: 'twitter',
        attemptNumber: i + 1,
        passed: false,
      });
    }

    // Rate limiting pause
    if (i < TEST_TOPICS.length - 1) {
      console.log(`\n⏳ Waiting 2s before next test (rate limit protection)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final Report
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('                    FINAL TEST REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passedTests = results.filter(r => r.passed);
  const failedTests = results.filter(r => !r.passed);
  const overLimitTests = results.filter(r => r.characterCount > TWITTER_LIMIT);

  console.log(`📊 Summary Statistics:`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${passedTests.length} ${passedTests.length === results.length ? '✅' : ''}`);
  console.log(`   Failed: ${failedTests.length} ${failedTests.length > 0 ? '❌' : ''}`);
  console.log(`   Over-Limit: ${overLimitTests.length} ${overLimitTests.length > 0 ? '❌ CRITICAL' : '✅'}`);

  if (results.length > 0) {
    const avgChars = Math.round(
      results.reduce((sum, r) => sum + r.characterCount, 0) / results.length
    );
    const maxChars = Math.max(...results.map(r => r.characterCount));
    const minChars = Math.min(...results.filter(r => r.characterCount > 0).map(r => r.characterCount));
    
    console.log(`\n📈 Character Count Analysis:`);
    console.log(`   Average: ${avgChars} chars`);
    console.log(`   Maximum: ${maxChars} chars ${maxChars > TWITTER_LIMIT ? '❌ OVER LIMIT' : '✅'}`);
    console.log(`   Minimum: ${minChars} chars`);
    console.log(`   Utilization: ${Math.round((avgChars / TWITTER_LIMIT) * 100)}%`);
  }

  if (overLimitTests.length > 0) {
    console.log(`\n❌ CRITICAL FAILURES (Over-Limit Content):`);
    overLimitTests.forEach((test, idx) => {
      console.log(`\n   ${idx + 1}. Topic: "${test.topic}"`);
      console.log(`      Characters: ${test.characterCount}/${TWITTER_LIMIT} (${test.characterCount - TWITTER_LIMIT} over)`);
      console.log(`      Content Preview: ${test.content.substring(0, 100)}...`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  
  if (overLimitTests.length === 0 && failedTests.length === 0) {
    console.log('✅ ALL TESTS PASSED - Character limits strictly enforced!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.log('❌ TESTS FAILED - Character limit enforcement needs fixes');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Run tests
testCharacterLimitEnforcement().catch(error => {
  console.error('\n❌ Test suite crashed:', error);
  process.exit(1);
});
