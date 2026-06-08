/**
 * Ambient Background Component
 * Server Component - Layered depth system with nebula blobs, grid patterns,
 * SA flag color whispers, and noise texture for a premium atmospheric feel.
 */

export default function AmbientBackground() {
  return (
    <>
      {/* Base gradient - deep-charcoal melting into orange depths */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-deep-charcoal">
        {/* Deep backdrop gradient */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,93,4,0.12) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 100% 100%, rgba(0,212,170,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 0% 80%, rgba(232,93,4,0.08) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      {/* Layer 1: Deep background grid/line pattern — subtle, like a blueprint */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(232,93,4,0.3) 1px, transparent 1px),
              linear-gradient(0deg, rgba(232,93,4,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(500px) rotateX(2deg)',
            transformOrigin: 'center top',
          }}
        />
      </div>

      {/* Layer 2: Slow-drift aurora/nebula blobs (depth 1 — far, slowest) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Orange nebula — far background, very slow */}
        <div
          className="glow-orb-orange"
          style={{
            width: '900px',
            height: '900px',
            top: '-20%',
            left: '-10%',
            opacity: 0.5,
            animation: 'drift-slow 40s ease-in-out infinite',
          }}
        />

        {/* Gold nebula warmth — bottom left */}
        <div
          className="glow-orb-gold"
          style={{
            width: '600px',
            height: '600px',
            bottom: '-15%',
            left: '-5%',
            opacity: 0.3,
            animation: 'drift-slow 50s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Layer 3: Mid-depth blobs (depth 2 — medium speed) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* SA green-teal whisper — bottom right */}
        <div
          className="glow-orb-teal"
          style={{
            width: '500px',
            height: '500px',
            bottom: '-10%',
            right: '-5%',
            opacity: 0.35,
            animation: 'drift-medium 25s ease-in-out infinite',
          }}
        />

        {/* SA red accent — top right */}
        <div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(100px)',
            width: '450px',
            height: '450px',
            top: '-5%',
            right: '0%',
            opacity: 0.2,
            background:
              'radial-gradient(circle, rgba(224,60,49,0.12) 0%, rgba(224,60,49,0.1) 40%, transparent 70%)',
            animation: 'drift-medium 30s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Layer 4: Foreground accent orbs (depth 3 — faster motion) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Small orange accent — floating mid-right */}
        <div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(60px)',
            width: '250px',
            height: '250px',
            top: '40%',
            right: '15%',
            opacity: 0.15,
            background:
              'radial-gradient(circle, rgba(232,93,4,0.15) 0%, rgba(232,93,4,0.08) 40%, transparent 70%)',
            animation: 'drift-fast 18s ease-in-out infinite',
          }}
        />

        {/* Gold sparkle — near hero content */}
        <div
          className="glow-orb-gold"
          style={{
            width: '200px',
            height: '200px',
            top: '25%',
            left: '35%',
            opacity: 0.12,
            animation: 'drift-fast 15s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Subtle grain texture */}
      <div className="noise-overlay" />

      {/* Animation keyframes */}
      <style>{`
        @keyframes drift-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(60px, -40px) scale(1.05); }
          50% { transform: translate(-30px, 50px) scale(0.95); }
          75% { transform: translate(40px, 20px) scale(1.02); }
        }
        @keyframes drift-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 30px) scale(1.08); }
          66% { transform: translate(40px, -20px) scale(0.92); }
        }
        @keyframes drift-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
    </>
  );
}
