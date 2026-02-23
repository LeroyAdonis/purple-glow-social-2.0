#!/usr/bin/env node

/**
 * Test script for Nano Banana image generation
 * 
 * Usage:
 *   node scripts/test-nano-banana.mjs
 * 
 * Prerequisites:
 *   1. Gemini CLI installed and in PATH
 *   2. Nano Banana extension installed
 *   3. GEMINI_API_KEY environment variable set
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkGeminiCLI() {
  log('\n1. Checking Gemini CLI installation...', colors.cyan);
  
  try {
    const { stdout } = await execAsync('gemini --version', { timeout: 5000 });
    log(`✓ Gemini CLI found: ${stdout.trim()}`, colors.green);
    return true;
  } catch (error) {
    log('✗ Gemini CLI not found in PATH', colors.red);
    log('  Install: npm install -g @google/generative-ai-cli', colors.yellow);
    return false;
  }
}

async function checkNanoBananaExtension() {
  log('\n2. Checking Nano Banana extension...', colors.cyan);
  
  try {
    const { stdout } = await execAsync('gemini extensions list', { timeout: 5000 });
    
    if (stdout.includes('nanobanana')) {
      log('✓ Nano Banana extension installed', colors.green);
      return true;
    } else {
      log('✗ Nano Banana extension not found', colors.red);
      log('  Install: gemini extensions install https://github.com/gemini-cli-extensions/nanobanana', colors.yellow);
      return false;
    }
  } catch (error) {
    log('✗ Failed to check extensions', colors.red);
    console.error(error);
    return false;
  }
}

async function checkAPIKey() {
  log('\n3. Checking Gemini API key...', colors.cyan);
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (apiKey && apiKey.length > 10) {
    log(`✓ API key found (${apiKey.substring(0, 10)}...)`, colors.green);
    return true;
  } else {
    log('✗ GEMINI_API_KEY environment variable not set', colors.red);
    log('  Set it in your .env.local file or shell profile', colors.yellow);
    return false;
  }
}

async function testImageGeneration() {
  log('\n4. Testing image generation...', colors.cyan);
  log('  Generating test image: "purple social media icon"', colors.yellow);
  
  try {
    const command = `gemini "/generate 'test image: purple social media icon with glow effect' --count=1"`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 90000, // 90 seconds for image generation
      maxBuffer: 10 * 1024 * 1024,
    });
    
    if (stderr) {
      log(`  Warning: ${stderr}`, colors.yellow);
    }
    
    log('✓ Image generation command executed successfully', colors.green);
    log(`  Output: ${stdout.substring(0, 200)}...`, colors.cyan);
    
    return true;
  } catch (error) {
    log('✗ Image generation failed', colors.red);
    
    if (error.message.includes('timeout')) {
      log('  Error: Command timed out (90s limit)', colors.yellow);
      log('  This might indicate network issues or slow API response', colors.yellow);
    } else {
      console.error(error);
    }
    
    return false;
  }
}

async function checkOutputDirectory() {
  log('\n5. Checking output directory...', colors.cyan);
  
  try {
    const { stdout } = await execAsync('dir nanobanana-output', { 
      timeout: 5000,
      shell: 'cmd.exe',
    });
    
    log('✓ Output directory exists', colors.green);
    
    // Check for image files
    if (stdout.match(/\.png|\.jpg|\.jpeg/i)) {
      log('✓ Generated images found in directory', colors.green);
    } else {
      log('⚠ No images found yet', colors.yellow);
    }
    
    return true;
  } catch (error) {
    log('⚠ Output directory does not exist or is empty', colors.yellow);
    log('  It will be created automatically on first generation', colors.cyan);
    return true; // Not critical
  }
}

async function runTests() {
  log(`${colors.bold}=================================`, colors.cyan);
  log('  Nano Banana Integration Test', colors.cyan);
  log(`=================================${colors.reset}`, colors.cyan);
  
  const results = {
    geminiCLI: false,
    nanoBanana: false,
    apiKey: false,
    imageGen: false,
    outputDir: false,
  };
  
  // Run checks
  results.geminiCLI = await checkGeminiCLI();
  
  if (results.geminiCLI) {
    results.nanoBanana = await checkNanoBananaExtension();
  }
  
  results.apiKey = await checkAPIKey();
  results.outputDir = await checkOutputDirectory();
  
  // Only test image generation if prerequisites are met
  if (results.geminiCLI && results.nanoBanana && results.apiKey) {
    results.imageGen = await testImageGeneration();
  } else {
    log('\n4. Testing image generation...', colors.cyan);
    log('  ⊗ Skipped (prerequisites not met)', colors.yellow);
  }
  
  // Summary
  log(`\n${colors.bold}=================================`, colors.cyan);
  log('  Test Summary', colors.cyan);
  log(`=================================${colors.reset}`, colors.cyan);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  if (passed === total) {
    log(`✓ All tests passed (${passed}/${total})`, colors.green);
    log('\nNano Banana is ready to use! 🎉', colors.green);
    process.exit(0);
  } else {
    log(`⚠ ${passed}/${total} tests passed`, colors.yellow);
    log('\nPlease fix the issues above before using Nano Banana.', colors.yellow);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log('\nUnexpected error during testing:', colors.red);
  console.error(error);
  process.exit(1);
});
