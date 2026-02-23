/**
 * Custom 404 Not Found Page
 * 
 * Server Component - Displays branded 404 page when route is not found.
 * Provides navigation options to help users get back on track.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Purple Glow',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void text-white font-body flex items-center justify-center relative overflow-hidden selection:bg-neon-grape selection:text-white">
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-grape opacity-[0.08] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-joburg-teal opacity-[0.08] blur-[150px] rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        
        {/* 404 Graphic */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold font-display bg-gradient-to-r from-neon-grape via-joburg-teal to-hyper-crimson bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          
          {/* Home Button */}
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-neon-grape to-hyper-crimson rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:scale-105"
          >
            Go Home
          </Link>

          {/* Dashboard Button */}
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-obsidian-800 border border-neon-grape/30 rounded-lg font-semibold hover:border-neon-grape hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300"
          >
            Dashboard
          </Link>

          {/* Login Button */}
          <Link
            href="/login"
            className="px-8 py-3 bg-obsidian-800 border border-joburg-teal/30 rounded-lg font-semibold hover:border-joburg-teal hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300"
          >
            Login
          </Link>
          
        </div>

        {/* Additional Help */}
        <p className="mt-12 text-sm text-gray-500">
          Need help? Contact our support team.
        </p>
        
      </div>
    </div>
  );
}
