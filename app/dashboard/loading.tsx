/**
 * Dashboard Loading State
 * Displays skeleton matching dashboard layout with sidebar and main content
 */

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-void flex">
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-white/10 bg-white/5">
        <div className="p-6">
          <div className="h-8 w-32 bg-neon-grape/30 rounded animate-pulse" />
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 px-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </nav>

        {/* User profile skeleton */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-neon-grape/30 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header skeleton */}
        <header className="border-b border-white/10 bg-void/50 backdrop-blur">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-9 w-32 bg-neon-grape/20 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-white/5 rounded-lg animate-pulse" />
            </div>
          </div>
        </header>

        {/* Tab navigation skeleton */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex gap-4">
            {['Dashboard', 'Schedule', 'Automation'].map((tab, i) => (
              <div key={tab} className={`h-10 w-28 rounded-lg animate-pulse ${
                i === 0 ? 'bg-neon-grape/30' : 'bg-white/5'
              }`} />
            ))}
          </div>
        </div>

        {/* Content skeleton - Dashboard cards */}
        <div className="p-6 space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-neon-grape/20 bg-white/5 rounded-lg p-6 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                <div className="h-8 w-16 bg-neon-grape/30 rounded mb-2" />
                <div className="h-3 w-32 bg-white/5 rounded" />
              </div>
            ))}
          </div>

          {/* Post cards skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-neon-grape/20 bg-white/5 rounded-lg p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-neon-grape/30 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-5/6 bg-white/5 rounded" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 w-20 bg-white/5 rounded" />
                      <div className="h-8 w-20 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
