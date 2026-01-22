'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardClient from './dashboard-client';
import { logger } from '@/lib/logger';

export default function DashboardClientPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check cookies on mount
    const cookies = typeof document !== 'undefined' ? document.cookie : '';
    const hasSessionCookie = cookies.includes('better-auth.session');
    
    logger.auth.debug('Dashboard session check initiated', {
      isPending,
      hasSession: !!session,
      hasSessionCookie,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    });

    if (!isPending && !session) {
      logger.auth.warn('No session found, redirecting to login', {
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '/dashboard',
        hadSessionCookie: hasSessionCookie
      });
      router.push('/login');
    } else if (session) {
      logger.auth.info('Dashboard session verified', {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      });
    }
  }, [session, isPending, router]);

  // Show loading state
  if (isPending) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-neon-grape border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Will redirect via useEffect
  if (!session) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-neon-grape border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      userName={session.user.name || "User"}
      userEmail={session.user.email}
      userImage={session.user.image}
      userId={session.user.id}
    />
  );
}
