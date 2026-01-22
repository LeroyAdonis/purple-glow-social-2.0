import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboardView from '../../components/admin-dashboard-view';
import { logger } from '@/lib/logger';

// Helper function to check if user has admin privileges
function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  
  // Check against ADMIN_EMAILS environment variable
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
  if (adminEmails.includes(email)) return true;
  
  // Check against admin domains (e.g., @purpleglow.co.za)
  const adminDomains = ['purpleglow.co.za'];
  return adminDomains.some(domain => email.endsWith(`@${domain}`));
}

export default async function AdminPage() {
  try {
    // Get session with Better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      logger.security.warn('Unauthenticated access attempt to admin page');
      redirect('/login?redirect=/admin');
    }

    const userEmail = session.user.email;
    const userId = session.user.id;

    // Check if user has admin privileges
    if (!isAdminEmail(userEmail)) {
      logger.security.warn('Unauthorized admin access attempt', { 
        userId, 
        email: userEmail 
      });
      
      // Return 403 Forbidden page
      return (
        <div className="min-h-screen bg-void flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg 
                className="mx-auto h-16 w-16 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-neon-grape mb-4">
              403 Forbidden
            </h1>
            <p className="text-gray-400 mb-6">
              You do not have permission to access the admin dashboard.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              This incident has been logged for security purposes.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block px-6 py-3 bg-neon-grape hover:bg-opacity-80 text-white font-semibold rounded-lg transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }

    // User is authorized - log access and render admin dashboard
    logger.admin.info('Admin dashboard accessed', { userId, email: userEmail });
    return <AdminDashboardView />;

  } catch (error) {
    logger.security.exception(error as Error, { 
      action: 'admin-page-authorization',
      context: 'Server-side admin access check failed'
    });
    
    // On error, redirect to login for safety
    redirect('/login?redirect=/admin');
  }
}
