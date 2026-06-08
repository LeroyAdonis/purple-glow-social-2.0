/**
 * Hero Section Component
 * Server Component - Asymmetrical layout with dramatic typography,
 * reduced whitespace, and a premium pill-shaped device mockup.
 * Wraps a client Spotlight effect via HeroSpotlightWrapper.
 *
 * NOTE: Some text is hardcoded EN for visual impact. Update translate()
 * calls in the i18n JSON to match these new copy points.
 */

import Link from 'next/link';
import HeroSpotlightWrapper from './hero-spotlight-wrapper';

interface HeroSectionProps {
  translate: (key: string) => string;
}

export default function HeroSection({ translate }: HeroSectionProps) {
  return (
    <header className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-10 items-center">
        {/* ─── COLUMN 1: Text Content (60% width) ─────────────────────── */}
        <div className="relative z-10">
          {/* Premium Badge — sa-gold dot accent */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sa-gold/20 bg-sa-gold/[0.04] backdrop-blur-md mb-5 group hover:border-sa-gold/40 transition-all duration-500">
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

          {/* Dramatic Headline — tighter, more compact */}
          <h1 className="mb-4">
            {/* Line 1: Smaller, elegant — body style */}
            <span className="font-body text-xl md:text-2xl font-normal tracking-wide text-text-secondary block mb-0.5">
              {translate('hero.prefix') || 'AI Writes Your'}
            </span>

            {/* Line 2: MASSIVE, SA flag gradient — tighter leading */}
            <span className="font-display font-extrabold text-6xl sm:text-7xl md:text-8xl leading-[0.85] text-gradient-sa block">
              {translate('hero.gradientWord') || 'SOCIAL'}
            </span>

            {/* Line 3: Massive white with orange glow accent */}
            <span className="font-display font-extrabold text-6xl sm:text-7xl md:text-8xl leading-[0.85] text-white block mt-0.5">
              {translate('hero.mainWord') || 'POSTS'}
              <span className="inline-block text-posta-orange ml-2 glow-text-orange">.</span>
            </span>
          </h1>

          {/* Subtitle — compact, confident, less mb */}
          <p className="font-body text-base md:text-lg text-text-secondary max-w-lg leading-relaxed mb-7">
            {translate('hero.subtitle') ||
              'Content that connects in all 11 languages. Built for South African businesses that want to stand out.'}
          </p>

          {/* ─── CTA Group — closer together ─────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href="/signup"
              className="group relative px-7 py-3.5 bg-posta-orange text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-center cursor-pointer"
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

            <button className="px-7 py-3.5 border border-border-default text-text-secondary rounded-xl hover:border-posta-orange/30 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer">
              <span
                className="w-8 h-8 rounded-full bg-posta-orange/20 flex items-center justify-center group-hover:bg-posta-orange/20 transition-colors"
              >
                <i className="fa-solid fa-play text-xs text-posta-orange group-hover:text-white transition-colors ml-0.5" />
              </span>
              <span className="font-medium">{translate('hero.demo') || 'Watch Demo'}</span>
            </button>
          </div>

          {/* ─── Floating Stat Badge — visual proof, more compact ────── */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-8">
            {/* Stat 1 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sa-green/15 border border-sa-green/20 flex items-center justify-center">
                <i className="fa-solid fa-building text-sa-green text-sm" />
              </div>
              <div>
                <div className="text-white font-bold font-display text-base leading-tight">
                  5,000+
                </div>
                <div className="text-text-tertiary font-mono text-[10px] uppercase tracking-wider">
                  {translate('hero.stat1') || 'SA Businesses'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-border-default hidden lg:block" />

            {/* Stat 2 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sa-gold/15 border border-sa-gold/20 flex items-center justify-center">
                <i className="fa-solid fa-language text-sa-gold text-sm" />
              </div>
              <div>
                <div className="text-white font-bold font-display text-base leading-tight">11</div>
                <div className="text-text-tertiary font-mono text-[10px] uppercase tracking-wider">
                  {translate('hero.stat2') || 'Languages'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-border-default hidden lg:block" />

            {/* Stat 3 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-posta-orange/15 border border-posta-orange/20 flex items-center justify-center">
                <i className="fa-solid fa-brain text-posta-orange text-sm" />
              </div>
              <div>
                <div className="text-white font-bold font-display text-base leading-tight">AI</div>
                <div className="text-text-tertiary font-mono text-[10px] uppercase tracking-wider">
                  {translate('hero.stat3') || 'Powered'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 2: Premium Device Mockup (40% width) ─────────────── */}
        <div className="relative hidden lg:flex items-center justify-center h-full min-h-[500px]">
          {/* Ambient glow backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(232,93,4,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Spotlight effect wrapper */}
          <HeroSpotlightWrapper />

          {/* Pill-shaped device mockup */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Outer glow ring */}
            <div
              className="absolute rounded-[32px]"
              style={{
                width: '380px',
                height: '460px',
                background: 'radial-gradient(ellipse at center, rgba(232,93,4,0.12) 0%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'pulse-subtle 4s ease-in-out infinite',
              }}
            />

            {/* Device pill body */}
            <div
              className="relative rounded-[32px] overflow-hidden animate-float-gentle"
              style={{
                width: '340px',
                height: '420px',
                background: 'linear-gradient(175deg, rgba(26,28,35,0.95) 0%, rgba(36,38,46,0.9) 100%)',
                border: '1px solid rgba(232,93,4,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(232,93,4,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Device notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-deep-charcoal rounded-b-2xl z-20">
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-charcoal-hover" />
              </div>

              {/* Device content area */}
              <div className="pt-10 px-5 pb-5 h-full flex flex-col">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono text-text-tertiary">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-2 rounded-sm border border-text-tertiary/40 relative">
                      <span className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 rounded-[1px] bg-sa-green/60" />
                    </span>
                    <i className="fa-solid fa-wifi text-[9px] text-text-tertiary" />
                  </div>
                </div>

                {/* Notification card — social post being approved */}
                <div
                  className="rounded-2xl p-4 mb-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,93,4,0.1) 0%, rgba(0,168,181,0.05) 100%)',
                    border: '1px solid rgba(232,93,4,0.15)',
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-posta-orange flex items-center justify-center">
                      <i className="fa-solid fa-bolt text-white text-xs" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold font-display leading-tight">POSTA</div>
                      <div className="text-text-tertiary text-[10px] font-mono">AI Assistant</div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-mono text-sa-green/80 bg-sa-green/10 px-2 py-0.5 rounded-full">Just now</span>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-3">
                    Your social post has been generated in{' '}
                    <span className="text-posta-orange font-semibold">Zulu</span>
                    {' '}and{' '}
                    <span className="text-surge-teal font-semibold">Afrikaans</span>.
                    Ready to review?
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-posta-orange text-white text-xs font-bold rounded-lg">
                      Approve
                    </button>
                    <button className="flex-1 py-2 border border-border-default text-text-secondary text-xs rounded-lg hover:border-posta-orange/30 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>

                {/* Secondary card — analytics */}
                <div
                  className="rounded-2xl p-3.5"
                  style={{
                    background: 'rgba(18,18,24,0.6)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Engagement ↑</span>
                    <span className="text-xs font-bold text-sa-green">+43%</span>
                  </div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1 h-12">
                    <div className="w-6 rounded-t-sm bg-posta-orange/60 animate-pulse-subtle" style={{ height: '70%' }} />
                    <div className="w-6 rounded-t-sm bg-posta-orange/80" style={{ height: '85%' }} />
                    <div className="w-6 rounded-t-sm bg-surge-teal/60" style={{ height: '55%' }} />
                    <div className="w-6 rounded-t-sm bg-posta-orange/70" style={{ height: '75%' }} />
                    <div className="w-6 rounded-t-sm bg-posta-orange/90" style={{ height: '95%' }} />
                    <div className="w-6 rounded-t-sm bg-surge-teal/50 animate-pulse-subtle" style={{ height: '60%' }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[8px] font-mono text-text-quaternary">MON</span>
                    <span className="text-[8px] font-mono text-text-quaternary">TUE</span>
                    <span className="text-[8px] font-mono text-text-quaternary">WED</span>
                    <span className="text-[8px] font-mono text-text-quaternary">THU</span>
                    <span className="text-[8px] font-mono text-text-quaternary">FRI</span>
                    <span className="text-[8px] font-mono text-text-quaternary">SAT</span>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="mt-auto flex justify-center">
                  <div className="w-28 h-1 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Inner glare */}
              <div
                className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                }}
              />
            </div>
          </div>

          {/* Floating decorative particles (SA color whispers) */}
          <div
            className="absolute w-2 h-2 rounded-full bg-sa-green/30"
            style={{
              top: '20%',
              right: '10%',
              animation: 'float-particle 6s ease-in-out infinite',
              animationDelay: '0s',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-sa-gold/25"
            style={{
              top: '35%',
              left: '5%',
              animation: 'float-particle 7s ease-in-out infinite',
              animationDelay: '1s',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-sa-red/20"
            style={{
              bottom: '30%',
              right: '8%',
              animation: 'float-particle 5s ease-in-out infinite',
              animationDelay: '2s',
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-surge-teal/25"
            style={{
              bottom: '20%',
              left: '12%',
              animation: 'float-particle 8s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
          />
        </div>
      </div>

      {/* Extra keyframes for custom hero animations */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-15px) scale(1.5); opacity: 0.8; }
        }
      `}</style>
    </header>
  );
}
