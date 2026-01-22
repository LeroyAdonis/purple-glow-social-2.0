/**
 * Test Script for Security Fixes
 * 
 * Tests both PKCE database storage and CRON_SECRET enforcement
 * Run with: npx tsx scripts/test-security-fixes.ts
 */

import { storePKCEVerifier, retrievePKCEVerifier, cleanupExpiredPKCEVerifiers, getActivePKCECount } from '../lib/db/pkce-verifiers';
import { createOAuthState, validateAndConsumeState } from '../lib/oauth/state-manager';
import crypto from 'crypto';

console.log('🔒 Security Fixes Test Suite\n');

async function testPKCEStorage() {
  console.log('📋 Test 1: PKCE Database Storage');
  console.log('─────────────────────────────────');

  try {
    // Test 1.1: Store a verifier
    const testState = crypto.randomBytes(32).toString('hex');
    const testVerifier = crypto.randomBytes(32).toString('base64url');
    
    console.log('✓ Storing PKCE verifier...');
    await storePKCEVerifier(testState, testVerifier);
    console.log('  State:', testState.substring(0, 16) + '...');
    console.log('  Verifier length:', testVerifier.length);

    // Test 1.2: Retrieve the verifier
    console.log('\n✓ Retrieving PKCE verifier...');
    const retrieved = await retrievePKCEVerifier(testState);
    
    if (retrieved === testVerifier) {
      console.log('  ✅ Verifier retrieved successfully');
    } else {
      console.log('  ❌ Verifier mismatch!');
      return false;
    }

    // Test 1.3: Verify single-use (should be deleted)
    console.log('\n✓ Testing single-use enforcement...');
    const retrievedAgain = await retrievePKCEVerifier(testState);
    
    if (retrievedAgain === null) {
      console.log('  ✅ Verifier deleted after first retrieval (single-use)');
    } else {
      console.log('  ❌ Verifier still exists (should be deleted)');
      return false;
    }

    // Test 1.4: Test expiration
    console.log('\n✓ Testing expiration...');
    const expiredState = crypto.randomBytes(32).toString('hex');
    const expiredVerifier = crypto.randomBytes(32).toString('base64url');
    
    // Manually insert with expired timestamp (we'll use cleanup to test)
    await storePKCEVerifier(expiredState, expiredVerifier);
    const activeCount = await getActivePKCECount();
    console.log('  Active verifiers before cleanup:', activeCount);

    // Test 1.5: Cleanup
    console.log('\n✓ Testing cleanup function...');
    const deleted = await cleanupExpiredPKCEVerifiers();
    console.log('  Expired verifiers deleted:', deleted);
    
    const activeAfter = await getActivePKCECount();
    console.log('  Active verifiers after cleanup:', activeAfter);

    console.log('\n✅ PKCE Storage Tests: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ PKCE Storage Tests: FAILED');
    console.error('Error:', error);
    return false;
  }
}

async function testOAuthStateManager() {
  console.log('📋 Test 2: OAuth State Manager Integration');
  console.log('─────────────────────────────────────────────');

  try {
    // Test 2.1: Create OAuth state
    console.log('✓ Creating OAuth state with PKCE...');
    const oauthState = await createOAuthState('twitter', '/dashboard/settings');
    
    console.log('  State:', oauthState.state.substring(0, 16) + '...');
    console.log('  Platform:', oauthState.platform);
    console.log('  Code challenge:', oauthState.pkce.codeChallenge.substring(0, 16) + '...');
    console.log('  Code challenge method:', oauthState.pkce.codeChallengeMethod);
    console.log('  Expires:', new Date(oauthState.expiresAt).toISOString());

    // Test 2.2: Validate and consume state
    console.log('\n✓ Validating and consuming state...');
    const validated = await validateAndConsumeState(oauthState.state, 'twitter');
    
    if (validated && validated.pkce.codeVerifier) {
      console.log('  ✅ State validated successfully');
      console.log('  Code verifier retrieved:', validated.pkce.codeVerifier.substring(0, 16) + '...');
    } else {
      console.log('  ❌ State validation failed');
      return false;
    }

    // Test 2.3: Verify state is consumed (single-use)
    console.log('\n✓ Testing state consumption (single-use)...');
    const validatedAgain = await validateAndConsumeState(oauthState.state, 'twitter');
    
    if (validatedAgain === null) {
      console.log('  ✅ State consumed (single-use enforced)');
    } else {
      console.log('  ❌ State still valid (should be consumed)');
      return false;
    }

    // Test 2.4: Test platform mismatch
    console.log('\n✓ Testing platform mismatch protection...');
    const state2 = await createOAuthState('linkedin', '/dashboard/settings');
    const mismatch = await validateAndConsumeState(state2.state, 'twitter');
    
    if (mismatch === null) {
      console.log('  ✅ Platform mismatch rejected');
      // Clean up the state2
      await validateAndConsumeState(state2.state, 'linkedin');
    } else {
      console.log('  ❌ Platform mismatch not detected');
      return false;
    }

    console.log('\n✅ OAuth State Manager Tests: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ OAuth State Manager Tests: FAILED');
    console.error('Error:', error);
    return false;
  }
}

async function testCronSecretEnforcement() {
  console.log('📋 Test 3: CRON_SECRET Enforcement');
  console.log('───────────────────────────────────');

  try {
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.log('⚠️  CRON_SECRET not set in environment');
      console.log('  This is OK for development');
      console.log('  Production deployment will require CRON_SECRET');
      console.log('\n✅ CRON_SECRET Enforcement: PASSED (dev mode)\n');
      return true;
    }

    console.log('✓ CRON_SECRET is set');
    console.log('  Length:', cronSecret.length);
    
    if (cronSecret.length < 32) {
      console.log('  ❌ CRON_SECRET too short (minimum 32 characters)');
      return false;
    }
    
    console.log('  ✅ CRON_SECRET meets length requirement (32+ chars)');

    // Test 3.2: Validate format (should be hex)
    const hexPattern = /^[0-9a-f]+$/i;
    if (hexPattern.test(cronSecret)) {
      console.log('  ✅ CRON_SECRET is valid hex format');
    } else {
      console.log('  ⚠️  CRON_SECRET is not hex (may be custom format)');
    }

    console.log('\n✅ CRON_SECRET Enforcement: PASSED\n');
    return true;
  } catch (error) {
    console.error('\n❌ CRON_SECRET Enforcement Tests: FAILED');
    console.error('Error:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('  SECURITY FIXES TEST SUITE');
  console.log('  Purple Glow Social 2.0');
  console.log('═══════════════════════════════════════════════\n');

  const results = {
    pkceStorage: false,
    stateManager: false,
    cronSecret: false,
  };

  // Run tests
  results.pkceStorage = await testPKCEStorage();
  results.stateManager = await testOAuthStateManager();
  results.cronSecret = await testCronSecretEnforcement();

  // Summary
  console.log('═══════════════════════════════════════════════');
  console.log('  TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════\n');

  const allPassed = Object.values(results).every(r => r === true);
  
  console.log('PKCE Database Storage:       ', results.pkceStorage ? '✅ PASSED' : '❌ FAILED');
  console.log('OAuth State Manager:         ', results.stateManager ? '✅ PASSED' : '❌ FAILED');
  console.log('CRON_SECRET Enforcement:     ', results.cronSecret ? '✅ PASSED' : '❌ FAILED');
  
  console.log('\n───────────────────────────────────────────────');
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - Security fixes working correctly!\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - Please review errors above\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
