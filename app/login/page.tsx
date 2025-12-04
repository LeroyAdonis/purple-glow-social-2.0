'use client';

import React, { useState } from 'react';
import { signIn } from '../../lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug environment on mount
  React.useEffect(() => {
    console.log('[Login] Environment check:', {
      baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      isProduction: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'),
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Login] Attempting sign in with:', { email, callbackURL: '/dashboard' });

      const result = await signIn.email({
        email,
        password,
        callbackURL: '/dashboard',
      });

      console.log('[Login] Sign in result:', JSON.stringify(result, null, 2));
      
      // Check if sign in was successful
      if (result?.error) {
        console.error('[Login] Sign in failed:', result.error);
        setError(result.error.message || 'Sign in failed');
        setIsLoading(false);
        return;
      }

      // Only redirect if we got a successful result
      if (result?.data) {
        console.log('[Login] Sign in successful, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.warn('[Login] Unexpected result format:', result);
        setError('Unexpected response from server');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('[Login] Sign in error:', err);
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err: any) {
      // FedCM AbortError is expected when user closes popup or navigates away
      if (err?.message?.includes('AbortError') || err?.name === 'AbortError') {
        console.log('Google sign-in cancelled by user');
      } else {
        console.error('Google sign-in error:', err);
        setError('Failed to sign in with Google. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-5xl mb-2 glow-text">
            Purple Glow Social
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="aerogel-card p-8 rounded-2xl border border-glass-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-exclamation-circle text-red-400"></i>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="thabo@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                         focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                         transition-all outline-none disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                         focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                         transition-all outline-none disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-lg
                       bg-gradient-to-r from-neon-grape to-joburg-teal
                       hover:scale-105 transition-transform duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-pretoria-blue text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold border border-glass-border
                     hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-3">
              <i className="fa-brands fa-google text-xl"></i>
              Sign in with Google
            </span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-neon-grape hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* South African Context */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🇿🇦 Made in South Africa, for South African Entrepreneurs
          </p>
        </div>
      </div>
    </div>
  );
}
