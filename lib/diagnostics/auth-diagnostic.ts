/**
 * Authentication Diagnostic Script
 *
 * Helps debug authentication issues in production
 */

import { auth } from '../auth';

export async function diagnoseAuth() {
  console.log('🔍 Authentication Diagnostic Report');
  console.log('=====================================');

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL || 'Not set'}`);
  console.log(`NEXT_PUBLIC_BETTER_AUTH_URL: ${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'Not set'}`);

  // Check database configuration
  const isDatabaseConfigured = process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('mock') &&
    process.env.DATABASE_URL.startsWith('postgresql://');

  console.log(`\n🗄️  Database Configuration: ${isDatabaseConfigured ? '✅ Configured' : '❌ Not configured'}`);

  if (!isDatabaseConfigured) {
    console.log('❌ Authentication will not work without proper DATABASE_URL');
    return {
      success: false,
      issue: 'Database not configured',
      solution: 'Set DATABASE_URL environment variable to a valid PostgreSQL connection string'
    };
  }

  // Check Better Auth configuration
  console.log('\n🔐 Better Auth Configuration:');
  console.log(`Secret: ${process.env.BETTER_AUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`Base URL: ${process.env.BETTER_AUTH_URL || 'Using default'}`);
  console.log(`Trusted Origins: http://localhost:3000, https://purple-glow-social-2-0.vercel.app`);

  if (!process.env.BETTER_AUTH_SECRET) {
    console.log('❌ Authentication will not work without BETTER_AUTH_SECRET');
    return {
      success: false,
      issue: 'Better Auth secret missing',
      solution: 'Set BETTER_AUTH_SECRET environment variable (min 32 characters)'
    };
  }

  // Check URL configuration
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const publicUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || baseUrl;

  if (baseUrl !== publicUrl) {
    console.log('⚠️  Warning: BETTER_AUTH_URL and NEXT_PUBLIC_BETTER_AUTH_URL differ');
    console.log(`   BETTER_AUTH_URL: ${baseUrl}`);
    console.log(`   NEXT_PUBLIC_BETTER_AUTH_URL: ${publicUrl}`);
  }

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    baseUrl.includes('vercel.app');

  if (isProduction) {
    console.log('\n🏭 Production Environment Detected');

    const expectedUrl = 'https://purple-glow-social-2-0.vercel.app';
    if (baseUrl !== expectedUrl) {
      console.log(`⚠️  Warning: BETTER_AUTH_URL should be '${expectedUrl}' in production`);
      console.log(`   Current: ${baseUrl}`);
    }

    if (publicUrl !== expectedUrl) {
      console.log(`⚠️  Warning: NEXT_PUBLIC_BETTER_AUTH_URL should be '${expectedUrl}' in production`);
      console.log(`   Current: ${publicUrl}`);
    }
  }

  console.log('\n✅ Configuration looks good!');
  console.log('\n🔧 If authentication still fails, check:');
  console.log('1. Database connectivity');
  console.log('2. OAuth redirect URIs match production URLs');
  console.log('3. Browser console for JavaScript errors');
  console.log('4. Vercel function logs for server errors');

  return {
    success: true,
    databaseConfigured: isDatabaseConfigured,
    secretConfigured: !!process.env.BETTER_AUTH_SECRET,
    isProduction,
    baseUrl,
    publicUrl
  };
}