'use client';

import React, { useState } from 'react';
import { signUp, signIn } from '../../lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      await signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // Better Auth uses signIn.social for both sign-in and sign-up
      // It will automatically create an account if the user doesn't exist
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      setError('Failed to sign up with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-5xl mb-2 glow-text">
            Purple Glow Social
          </h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        {/* Sign Up Card */}
        <div className="aerogel-card p-8 rounded-2xl border border-glass-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-exclamation-circle text-red-400"></i>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Thabo Nkosi"
                autoComplete="name"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                         focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                         transition-all outline-none disabled:opacity-50"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                         focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20
                         transition-all outline-none disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
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

          {/* Google Sign-Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold border border-glass-border
                     hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-3">
              <i className="fa-brands fa-google text-xl"></i>
              Sign up with Google
            </span>
          </button>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-neon-grape hover:underline font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 aerogel-card p-6 rounded-2xl border border-glass-border">
          <h3 className="font-bold mb-4 text-center">What you'll get (Free Plan):</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-emerald-400"></i>
              <span>10 free credits to start</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-emerald-400"></i>
              <span>AI-powered content generation in 11 SA languages</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-emerald-400"></i>
              <span>Connect Instagram, Facebook, Twitter & LinkedIn</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-emerald-400"></i>
              <span>Schedule posts with automation rules</span>
            </li>
          </ul>
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
