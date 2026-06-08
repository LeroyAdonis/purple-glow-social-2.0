/**
 * Hero Section Component
 * Server Component - Asymmetrical layout with dramatic typography,
 * SA flag gradients, and an atmospheric decorative orb instead of mockups.
 *
 * NOTE: Some text is hardcoded EN for visual impact. Update translate()
 * calls in the i18n JSON to match these new copy points.
 */

import Link from 'next/link';

interface HeroSectionProps {
  translate: (key: string) => string;
}

export default function HeroSection({ translate }: HeroSectionProps) {
  return (
    <header className="max-w-7xl mx-auto px-6 pt-44 pb-28 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-16 items-center">
        {/* ─── COLUMN 1: Text Content (60% width) ─────────────────────── */}
        <div className="relative z-10 animate-fade-up">
          {/* Premium Badge — sa-gold dot accent */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sa-gold/20 bg-sa-gold/[0.04] backdrop-blur-md mb-8 group hover:border-sa-gold/40 transition-all duration-500">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: '#FFB81C',
                boxShadow: '0 0 8px rgba(255,184,28,0.6)',
              }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sa-gold/90 font-semibold">
              {translate('hero.badge') || 'AI That Speaks Your Language'}
            </span>
            <span className="w-px h-3 bg-sa-gold/20 mx-1" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
              {translate('hero.flag') || 'Proudly SA'}
            </span>
          </div>

          {/* Dramatic Headline — broken & staggered typography */}
          <h1 className="mb-6">
            {/* Line 1: Smaller, elegant — body style */}
            <span className="font-body text-2xl md:text-3xl font-normal tracking-wide text-text-secondary block mb-1">
              {translate('hero.prefix') || 'AI Writes Your'}
            </span>

            {/* Line 2: MASSIVE, SA flag gradient */}
            <span className="font-display font-extrabold text-7xl sm:text-8xl md:text-9xl leading-[0.82] text-gradient-sa block">
              {translate('hero.gradientWord') || 'SOCIAL'}
            </span>

            {/* Line 3: Massive white with orange glow accent */}
            <span className="font-display font-extrabold text-7xl sm:text-8xl md:text-9xl leading-[0.82] text-white block mt-1">
              {translate('hero.mainWord') || 'POSTS'}
              <span className="inline-block text-posta-orange ml-3 glow-text-orange">.</span>
            </span>
          </h1>

          {/* Subtitle — compact, confident */}
          <p className="font-body text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed mb-10">
            {translate('hero.subtitle') ||
              'Content that connects in all 11 languages. Built for South African businesses that want to stand out.'}
          </p>

          {/* ─── CTA Group ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/signup"
              className="group relative px-8 py-4 bg-posta-orange text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-center cursor-pointer"
            >
              {/* Glow background */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(232,93,4,0.2) 0%, rgba(232,93,4,0.3) 100%)',
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <i className="fa-solid fa-sparkles text-sm" />
                {translate('hero.cta') || 'Get Started Free'}
              </span>
            </Link>

            <button className="px-8 py-4 border border-border-default text-text-secondary rounded-xl hover:border-posta-orange/30 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer">
              <span
                className="w-8 h-8 rounded-full bg-posta-orange/20 flex items-center justify-center group-hover:bg-posta-orange/20 transition-colors"
              >
                <i className="fa-solid fa-play text-xs text-posta-orange group-hover:text-white transition-colors ml-0.5" />
              </span>
              <span className="font-medium">{translate('hero.demo') || 'Watch Demo'}</span>
            </button>
          </div>

          {/* ─── Floating Stat Badge — visual proof ─────────────────── */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-10">
            {/* Stat 1 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sa-green/15 border border-sa-green/20 flex items-center justify-center">
                <i className="fa-solid fa-building text-sa-green text-sm" />
              </div>
              <div>
                <div className="text-white font-bold font-display text-lg leading-tight">
                  5,000+
                </div>
                <div className="text-text-tertiary font-mono text-[10px] uppercase tracking-wider">
                  {translate('hero.stat1') || 'SA Businesses'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-border-default hidden lg:block" />

            {/* Stat 2 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sa-gold/15 border border-sa-gold/20 flex items-center justify-center">
                <i className="fa-solid fa-language text-sa-gold text-sm" />
              </div>
              <div>
                <div className="text-white font-bold font-display text-lg leading-tight">11</div>
                <div className="text-text-tertiary font-mono text-[10px] uppercase tracking-wider">
                  {translate('hero.stat2') || 'Languages'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-border-default hidden lg:block" />

            {/* Stat 3 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-posta-orange/15 border border-posta-orange/20 flex items-center justify-center">
                <i className="fa-solid fa-brain text-posta-orange text-sm" />
              </div>
              <div>
                <div className="text-white font-bold font-display text-lg leading-tight">AI</div>
                <div className="text-text-tertiary font-mono text-[10px] uppercase tracking-wider">
                  {translate('hero.stat3') || 'Powered'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 2: Decorative Visual Element (40% width) ─────────── */}
        <div className="relative hidden lg:flex items-center justify-center h-full min-h-[500px]">
          {/* Ambient glow backdrop for the orb */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(232,93,4,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Concentric glowing rings */}
          <div className="relative flex items-center justify-center">
            {/* Ring 3 — outermost, very subtle */}
            <div
              className="absolute rounded-full border border-posta-orange/20 animate-spin-slow"
              style={{
                width: '420px',
                height: '420px',
                animationDuration: '20s',
              }}
            />

            {/* Ring 2 — gold accent, counter-rotating */}
            <div
              className="absolute rounded-full border border-sa-gold/15"
              style={{
                width: '320px',
                height: '320px',
                animation: 'spin-reverse 16s linear infinite',
              }}
            />

            {/* Ring 1 — teal inner, closer orbit */}
            <div
              className="absolute rounded-full border border-surge-teal/20"
              style={{
                width: '220px',
                height: '220px',
                animation: 'spin 12s linear infinite',
              }}
            />

            {/* Central glowing orb */}
            <div className="relative flex items-center justify-center">
              {/* Inner glow aura */}
              <div
                className="absolute rounded-full animate-pulse-glow"
                style={{
                  width: '160px',
                  height: '160px',
                  background:
                    'radial-gradient(circle, rgba(232,93,4,0.25) 0%, rgba(232,93,4,0.1) 40%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Core orb */}
              <div
                className="relative rounded-full animate-float flex items-center justify-center"
                style={{
                  width: '120px',
                  height: '120px',
                  background:
                    'radial-gradient(circle at 35% 35%, rgba(232,93,4,0.4) 0%, rgba(232,93,4,0.3) 30%, rgba(13,0,26,0.8) 70%)',
                  boxShadow:
                    '0 0 40px rgba(232,93,4,0.25), 0 0 80px rgba(232,93,4,0.15), inset 0 0 30px rgba(232,93,4,0.1)',
                  border: '1px solid rgba(232,93,4,0.15)',
                }}
              >
                {/* Brand icon in center */}
                <div className="w-12 h-12 rounded-full bg-posta-orange flex items-center justify-center shadow-[0_0_20px_rgba(232,93,4,0.4)]">
                  <i className="fa-solid fa-bolt text-white text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating decorative particles (SA color whispers) */}
          <div
            className="absolute w-2 h-2 rounded-full bg-sa-green/30"
            style={{
              top: '20%',
              right: '15%',
              animation: 'float-particle 6s ease-in-out infinite',
              animationDelay: '0s',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-sa-gold/25"
            style={{
              top: '35%',
              right: '5%',
              animation: 'float-particle 7s ease-in-out infinite',
              animationDelay: '1s',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-sa-red/20"
            style={{
              bottom: '30%',
              right: '10%',
              animation: 'float-particle 5s ease-in-out infinite',
              animationDelay: '2s',
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-surge-teal/25"
            style={{
              bottom: '20%',
              left: '15%',
              animation: 'float-particle 8s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
          />
        </div>
      </div>

      {/* Extra keyframes for custom hero animations */}
      <style>{`
        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-15px) scale(1.5); opacity: 0.8; }
        }
      `}</style>
    </header>
  );
}
