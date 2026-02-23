/**
 * Ambient Background Component
 * Server Component - Pure CSS animations, no interactivity
 */

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-grape opacity-15 blur-[150px] rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-joburg-teal opacity-15 blur-[150px] rounded-full"
        style={{ animationDelay: '2s' }}
      ></div>
      <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-hyper-crimson opacity-5 blur-[120px] rounded-full"></div>
    </div>
  );
}
