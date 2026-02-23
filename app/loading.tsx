/**
 * Root Loading State
 * Displays during initial page load/navigation for the landing page
 */

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-void text-white overflow-hidden relative">
      {/* Ambient background shimmer */}
      <div className="fixed inset-0 bg-gradient-to-br from-electric-indigo/20 via-void to-neon-grape/20 animate-pulse" />
      
      <div className="relative z-10">
        {/* Navigation skeleton */}
        <nav className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="h-8 w-32 bg-neon-grape/20 rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="h-8 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-24 bg-neon-grape/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </nav>

        {/* Hero section skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="h-16 w-3/4 mx-auto bg-gradient-to-r from-neon-grape/30 to-joburg-teal/30 rounded animate-pulse" />
            <div className="h-8 w-2/3 mx-auto bg-white/5 rounded animate-pulse" />
            <div className="h-12 w-48 mx-auto bg-neon-grape/40 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Features grid skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-neon-grape/20 bg-white/5 rounded-lg p-6 animate-pulse">
                <div className="h-12 w-12 bg-neon-grape/30 rounded-lg mb-4" />
                <div className="h-6 w-3/4 bg-white/10 rounded mb-3" />
                <div className="h-4 w-full bg-white/5 rounded mb-2" />
                <div className="h-4 w-5/6 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
