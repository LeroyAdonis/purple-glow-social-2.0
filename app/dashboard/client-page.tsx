'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardClient from './dashboard-client';

export default function DashboardClientPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('[Dashboard Client] Session check:', {
      isPending,
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString()
    });

    if (!isPending && !session) {
      console.log('[Dashboard Client] No session found, redirecting to login');
      router.push('/login');
    } else if (session) {
      console.log('[Dashboard Client] Session found, staying on dashboard');
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
