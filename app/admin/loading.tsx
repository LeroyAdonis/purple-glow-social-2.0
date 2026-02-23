/**
 * Admin Dashboard Loading State
 * Displays skeleton for admin interface with tables and metrics
 */

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gradient-to-r from-neon-grape/40 to-joburg-teal/40 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-neon-grape/30 rounded-lg animate-pulse" />
            <div className="h-10 w-10 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-neon-grape/20 bg-white/5 rounded-lg p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-20 bg-white/10 rounded" />
                <div className="h-8 w-8 bg-neon-grape/30 rounded" />
              </div>
              <div className="h-7 w-16 bg-gradient-to-r from-neon-grape/40 to-joburg-teal/40 rounded mb-2" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="border-b border-white/10">
          <div className="flex gap-6">
            {['Overview', 'Users', 'Analytics', 'Settings'].map((tab, i) => (
              <div key={tab} className={`h-10 w-24 rounded-t-lg animate-pulse ${
                i === 0 ? 'bg-neon-grape/30' : 'bg-white/5'
              }`} />
            ))}
          </div>
        </div>

        {/* Main content - Data table skeleton */}
        <div className="border border-neon-grape/20 bg-white/5 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="border-b border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Table rows */}
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="border-b border-white/5 p-4 animate-pulse">
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((col) => (
                  <div key={col} className={`h-4 rounded ${
                    col === 1 ? 'bg-neon-grape/20' : 'bg-white/5'
                  }`} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="border border-neon-grape/20 bg-white/5 rounded-lg p-6">
          <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-6" />
          <div className="h-64 bg-gradient-to-t from-neon-grape/10 to-transparent rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
