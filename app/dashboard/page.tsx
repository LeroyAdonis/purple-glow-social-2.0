import { drizzle } from "drizzle-orm/neon-http";
import { posts } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ContentGenerator from "../../components/content-generator";
import LogoutButton from "../../components/LogoutButton";
import * as schema from "../../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Fetch recent posts
  let recentPosts = [];
  try {
    recentPosts = await db.query.posts.findMany({
      where: eq(posts.userId, session.user.id),
      orderBy: [desc(posts.createdAt)],
      limit: 5
    });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    // Fallback to empty array on error
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Server Rendered Static */}
      <aside className="w-64 border-r border-glass-border bg-black/20 hidden lg:flex flex-col p-6 gap-8 fixed h-full backdrop-blur-md z-20">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
             <span className="font-display font-bold">P</span>
           </div>
           <h1 className="font-display font-bold text-lg tracking-tight">Purple Glow</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-glass-border text-white text-sm font-medium">
                <i className="fa-solid fa-layer-group text-neon-grape"></i> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors text-sm font-medium">
                <i className="fa-regular fa-calendar"></i> Schedule
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors text-sm font-medium">
                <i className="fa-solid fa-bolt"></i> Automation
            </a>
        </nav>

        <div className="mt-auto">
            <div className="p-4 rounded-xl border border-glass-border bg-gradient-to-br from-white/5 to-transparent">
                <p className="text-xs font-mono text-gray-400 mb-2">CREDITS REMAINING</p>
                <div className="flex justify-between items-end">
                    <span className="text-2xl font-display font-bold text-white">450</span>
                    <span className="text-xs text-mzansi-gold mb-1">PRO TIER</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div className="h-full w-3/4 bg-joburg-teal"></div>
                </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <img src={session.user.image || "https://picsum.photos/50"} alt="User" className="w-10 h-10 rounded-full border border-glass-border" />
                <div>
                  <p className="text-sm font-bold truncate w-32">{session.user.name}</p>
                  <p className="text-xs text-gray-400">{session.user.email}</p>
                </div>
              </div>
              <div className="mt-3">
                <LogoutButton />
              </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header */}
            <header className="flex justify-between items-end animate-enter">
                <div>
                    <h2 className="font-display font-bold text-4xl mb-2">Welcome back, {session.user.name?.split(' ')[0]}</h2>
                    <p className="text-gray-400 font-body">Your AI fleet is ready. System status: <span className="text-joburg-teal">OPTIMAL</span></p>
                </div>
                <button className="hidden md:flex items-center gap-2 px-6 py-3 border border-glass-border rounded-xl text-sm hover:bg-white/5 transition-colors">
                    <i className="fa-solid fa-filter"></i> Filters
                </button>
            </header>

            {/* Generator Section */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-12">
                     <ContentGenerator />
                </div>
            </section>

            {/* Recent Posts Grid */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-sm tracking-widest text-gray-500 uppercase">Recent Drafts</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentPosts.map((post) => (
                        <div key={post.id} className="aerogel-card p-0 rounded-2xl overflow-hidden flex flex-col group h-full hover:border-neon-grape/30 transition-colors">
                            {post.imageUrl ? (
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={post.imageUrl} alt={post.topic || 'Post Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono border border-white/10">
                                        {post.platform}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 bg-white/5 flex items-center justify-center border-b border-glass-border relative">
                                    <i className="fa-solid fa-align-left text-3xl text-gray-600"></i>
                                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono border border-white/10">
                                        {post.platform}
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-6 flex flex-col flex-1">
                                <h4 className="font-bold text-lg mb-2 line-clamp-1">{post.topic || "Untitled Draft"}</h4>
                                <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1 font-body">{post.content}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${
                                        post.status === 'scheduled' ? 'border-joburg-teal text-joburg-teal bg-joburg-teal/10' : 
                                        'border-gray-600 text-gray-400'
                                    }`}>
                                        {post.status?.toUpperCase()}
                                    </span>
                                    <button className="text-sm text-white hover:text-neon-grape transition-colors">
                                        Edit <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add New Placeholder */}
                    <div className="border border-dashed border-glass-border rounded-2xl flex flex-col items-center justify-center p-8 gap-4 text-gray-500 hover:text-white hover:border-white/20 transition-all cursor-pointer bg-white/[0.02]">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">
                            <i className="fa-solid fa-plus"></i>
                        </div>
                        <span className="font-mono text-xs">CREATE MANUALLY</span>
                    </div>
                </div>
            </section>
        </div>
      </main>
    </div>
  );
}