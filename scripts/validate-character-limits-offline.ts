/**
 * Offline Character Limit Logic Validation
 * Tests the enforcement logic without requiring API calls
 */

import { validateContent } from '@/lib/ai/content-validator';

interface TestCase {
  name: string;
  content: string;
  platform: string;
  expectedWithinLimit: boolean;
  expectedCharCount: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Twitter - Well within limit',
    content: '🔥 Black Friday is HERE! Amazing deals on electronics! 🛍️ #BlackFriday #TechDeals #Mzansi',
    platform: 'twitter',
    expectedWithinLimit: true,
    expectedCharCount: 92,
  },
  {
    name: 'Twitter - At limit boundary (280 chars)',
    content: 'Looking for the perfect gift? 🎁 Our Johannesburg store is having a massive sale this weekend with incredible deals on everything from electronics to home goods! Come visit us Saturday and Sunday 10am-6pm for the best prices of the year! #Shopping #Deals #JHB #SouthAfrica #Sale',
    platform: 'twitter',
    expectedWithinLimit: true,
    expectedCharCount: 280,
  },
  {
    name: 'Twitter - OVER limit (should fail)',
    content: 'Looking for the perfect gift this holiday season? 🎁 Our Johannesburg store is having a massive sale this weekend with incredible deals on everything from electronics to home goods and furniture! Come visit us Saturday and Sunday 10am-6pm for the best prices of the year! Limited stock available! #Shopping #Deals #Johannesburg #SouthAfrica #HolidaySale #BlackFriday',
    platform: 'twitter',
    expectedWithinLimit: false,
    expectedCharCount: 365,
  },
  {
    name: 'Instagram - Within limit',
    content: `🌟 Exciting news, Mzansi! 🌟

Join us this weekend for the biggest community braai of the year! 🔥

📍 Location: Durban Beachfront
🕐 Time: 10am - 6pm
🎶 Live music, delicious food, and great vibes!

Bring your family and friends for a lekker time together! 

See you there! ✨

#Durban #Braai #Community #Mzansi #SouthAfrica #WeekendVibes #LocalIsLekker`,
    platform: 'instagram',
    expectedWithinLimit: true,
    expectedCharCount: 322,
  },
  {
    name: 'LinkedIn - Professional post',
    content: `Excited to share insights from our recent digital marketing workshop! 🚀

Key takeaways:
• Data-driven decision making is crucial
• Personalization increases engagement by 40%
• Mobile-first approach is no longer optional

Looking forward to implementing these strategies with our team.

#DigitalMarketing #Leadership #Innovation #SouthAfrica`,
    platform: 'linkedin',
    expectedWithinLimit: true,
    expectedCharCount: 334,
  },
];

function runOfflineValidation(): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('     OFFLINE CHARACTER LIMIT LOGIC VALIDATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  TEST_CASES.forEach((testCase, index) => {
    console.log(`\n─────────────────────────────────────────────────────────────`);
    console.log(`TEST ${index + 1}/${TEST_CASES.length}: ${testCase.name}`);
    console.log(`─────────────────────────────────────────────────────────────`);

    const validation = validateContent(testCase.content, testCase.platform, 'en');
    
    console.log(`\n📄 Content Preview:`);
    console.log(`   ${testCase.content.substring(0, 100)}${testCase.content.length > 100 ? '...' : ''}`);
    
    console.log(`\n📊 Validation Results:`);
    console.log(`   Character Count: ${validation.characterCount} (expected: ${testCase.expectedCharCount})`);
    console.log(`   Within Limit: ${validation.withinLimit ? '✅ YES' : '❌ NO'} (expected: ${testCase.expectedWithinLimit ? 'YES' : 'NO'})`);
    console.log(`   Quality Score: ${validation.qualityScore}/100`);
    console.log(`   Is Valid: ${validation.isValid ? '✅' : '❌'}`);

    // Verify expectations
    const charCountMatch = validation.characterCount === testCase.expectedCharCount;
    const limitMatch = validation.withinLimit === testCase.expectedWithinLimit;

    if (charCountMatch && limitMatch) {
      console.log(`\n✅ TEST PASSED`);
      passed++;
    } else {
      console.log(`\n❌ TEST FAILED`);
      if (!charCountMatch) {
        console.log(`   Character count mismatch: got ${validation.characterCount}, expected ${testCase.expectedCharCount}`);
      }
      if (!limitMatch) {
        console.log(`   Limit validation mismatch: got ${validation.withinLimit}, expected ${testCase.expectedWithinLimit}`);
      }
      failed++;
    }

    if (validation.issues.length > 0) {
      console.log(`\n⚠️  Issues:`);
      validation.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    if (validation.suggestions.length > 0) {
      console.log(`\n💡 Suggestions:`);
      validation.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
    }
  });

  // Final summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('                    VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Total Tests: ${TEST_CASES.length}`);
  console.log(`Passed: ${passed} ${passed === TEST_CASES.length ? '✅' : ''}`);
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
  console.log(`Success Rate: ${Math.round((passed / TEST_CASES.length) * 100)}%`);

  console.log('\n═══════════════════════════════════════════════════════════════');

  if (failed === 0) {
    console.log('✅ ALL VALIDATION LOGIC TESTS PASSED');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - Review validation logic');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Run validation
runOfflineValidation();
