'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup', '/oauth/callback/success', '/oauth/callback/error'];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // If not loading and no session and trying to access protected route
    if (!isPending && !session && !isPublicRoute && !pathname.startsWith('/api')) {
      router.push('/login');
    }
  }, [session, isPending, pathname, router]);

  // Show loading state while checking session
  if (isPending && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && pathname !== '/') {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-neon-grape border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
