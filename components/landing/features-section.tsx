/**
 * Features Section Component
 * Features Section Component
 * Server Component — converted to client for framer-motion animations
 * Static features showcase
 * SA-themed alternating layout breaking the 3-column grid
 */

import { SectionWrapper, FadeInDiv } from '@/components/ui/section-wrapper';

interface FeaturesSectionProps {
  translate: (key: string) => string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function FeaturesSection({ translate }: FeaturesSectionProps) {
  const titleParts = translate('features.title').split(' ');
  const firstWord = titleParts[0];
  const restOfTitle = titleParts.slice(1).join(' ');

  return (
    <SectionWrapper
      id="features"
      className="py-16 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative SA flag divider at top */}
      <div className="divider-flag mb-6"></div>

      {/* Subtle pattern-dots background */}
      <div className="pattern-dots absolute inset-0 pointer-events-none"></div>

      {/* Ambient glow orbs */}
      <div className="glow-orb-posta-orange w-[500px] h-[500px] -top-48 -left-48 pointer-events-none"></div>
      <div className="glow-orb-teal w-[400px] h-[400px] -bottom-32 -right-32 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <FadeInDiv
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sa-green/10 border border-sa-green/20 text-sa-green text-[10px] font-bold tracking-widest mb-4 uppercase">
            <i className="fa-solid fa-sparkles"></i>
            <span>{translate('features.badge') || 'What We Offer'}</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            {firstWord} <span className="text-gradient-teal">{restOfTitle}</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">{translate('features.subtitle')}</p>
        </FadeInDiv>

        {/* FEATURE 1 — left: text, right: visual concept (icon display) */}
        <FadeInDiv
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <FadeInDiv className="order-2 lg:order-1 space-y-5" variants={fadeInLeft}>
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-posta-orange/20 text-posta-orange flex items-center justify-center text-xl shadow-[0_0_20px_rgba(232,93,4,0.2)]">
                <i className="fa-solid fa-comments"></i>
              </div>
              <span className="font-mono text-xs tracking-widest text-posta-orange uppercase font-bold">Feature 01</span>
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
              {translate('features.aiEngine.title')}
            </h3>
            <p className="text-text-secondary leading-relaxed text-base">
              {translate('features.aiEngine.description')}
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-sa-green/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-sa-green text-[10px]"></i>
                </div>
                <span>Generate posts for all 11 SA languages</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-sa-green/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-sa-green text-[10px]"></i>
                </div>
                <span>Cultural context awareness per province</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-sa-green/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-sa-green text-[10px]"></i>
                </div>
                <span>Voice and tone matching your brand</span>
              </li>
            </ul>
          </FadeInDiv>
          <FadeInDiv className="order-1 lg:order-2 relative flex items-center justify-center" variants={fadeInRight}>
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-posta-orange/30 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-posta-orange/20 to-void-surface border border-posta-orange/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-posta-orange/30 text-posta-orange flex items-center justify-center text-4xl mb-4">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <p className="font-display font-bold text-lg text-posta-orange">AI Engine</p>
                  <p className="text-xs text-text-tertiary mt-1">Gemini Pro Powered</p>
                </div>
              </div>
            </div>
          </FadeInDiv>
        </FadeInDiv>

        {/* FEATURE 2 — right: text, left: visual (reversed) */}
        <FadeInDiv
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <FadeInDiv className="relative flex items-center justify-center" variants={fadeInLeft}>
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-surge-teal/20 to-transparent rounded-full blur-3xl"></div>
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-surge-teal/10 to-void-surface border border-surge-teal/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-surge-teal/20 text-surge-teal flex items-center justify-center text-4xl mb-4">
                    <i className="fa-solid fa-language"></i>
                  </div>
                  <p className="font-display font-bold text-lg text-gradient-teal">Multilingual</p>
                  <p className="text-xs text-text-tertiary mt-1">All 11 Official Languages</p>
                </div>
              </div>
            </div>
          </FadeInDiv>
          <FadeInDiv className="space-y-5" variants={fadeInRight}>
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surge-teal/20 text-surge-teal flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,212,170,0.2)]">
                <i className="fa-solid fa-image"></i>
              </div>
              <span className="font-mono text-xs tracking-widest text-surge-teal uppercase font-bold">Feature 02</span>
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
              {translate('features.multilingual.title')}
            </h3>
            <p className="text-text-secondary leading-relaxed text-base">
              {translate('features.multilingual.description')}
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-surge-teal/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-surge-teal text-[10px]"></i>
                </div>
                <span>isiZulu, Sesotho, Afrikaans, and more</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-surge-teal/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-surge-teal text-[10px]"></i>
                </div>
                <span>Culturally adapted imagery and phrases</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-surge-teal/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-surge-teal text-[10px]"></i>
                </div>
                <span>One click language switching per post</span>
              </li>
            </ul>
          </FadeInDiv>
        </FadeInDiv>

        {/* FEATURE 3 — left: text, right: visual */}
        <FadeInDiv
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <FadeInDiv className="order-2 lg:order-1 space-y-5" variants={fadeInLeft}>
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sa-gold/20 text-sa-gold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,184,28,0.2)]">
                <i className="fa-solid fa-calendar-days"></i>
              </div>
              <span className="font-mono text-xs tracking-widest text-sa-gold uppercase font-bold">Feature 03</span>
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
              {translate('features.scheduling.title')}
            </h3>
            <p className="text-text-secondary leading-relaxed text-base">
              {translate('features.scheduling.description')}
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-sa-gold/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-sa-gold text-[10px]"></i>
                </div>
                <span>SAST (UTC+2) timezone smart scheduling</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-sa-gold/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-sa-gold text-[10px]"></i>
                </div>
                <span>Best-time AI recommendations</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-sa-gold/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-sa-gold text-[10px]"></i>
                </div>
                <span>Calendar, list &amp; timeline views</span>
              </li>
            </ul>
          </FadeInDiv>
          <FadeInDiv className="order-1 lg:order-2 relative flex items-center justify-center" variants={fadeInRight}>
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sa-gold/15 to-transparent rounded-full blur-3xl"></div>
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-sa-gold/10 to-void-surface border border-sa-gold/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-sa-gold/20 text-sa-gold flex items-center justify-center text-4xl mb-4">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <p className="font-display font-bold text-lg text-gradient-gold">Smart Schedule</p>
                  <p className="text-xs text-text-tertiary mt-1">AI-Optimized Timing</p>
                </div>
              </div>
            </div>
          </FadeInDiv>
        </FadeInDiv>

        {/* Additional Feature Highlight — staggered mini cards */}
        <FadeInDiv
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <FadeInDiv className="premium-card group hover:border-posta-orange/40 transition-all" variants={staggerItem}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-posta-orange/20 text-posta-orange flex items-center justify-center text-base">
                <i className="fa-solid fa-robot"></i>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-posta-orange uppercase font-bold">Automation</span>
            </div>
            <h4 className="font-display font-bold text-lg text-white mb-2">Auto-Post &amp; Queue</h4>
            <p className="text-xs text-text-tertiary leading-relaxed">Set it and forget it — AI queues your best content for peak engagement times across all platforms.</p>
          </FadeInDiv>
          <FadeInDiv className="premium-card group hover:border-surge-teal/40 transition-all" variants={staggerItem}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-surge-teal/20 text-surge-teal flex items-center justify-center text-base">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-surge-teal uppercase font-bold">Analytics</span>
            </div>
            <h4 className="font-display font-bold text-lg text-white mb-2">Real-time Insights</h4>
            <p className="text-xs text-text-tertiary leading-relaxed">Track engagement, follower growth, and content performance with SA-market benchmarks.</p>
          </FadeInDiv>
          <FadeInDiv className="premium-card group hover:border-sa-gold/40 transition-all" variants={staggerItem}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sa-gold/20 text-sa-gold flex items-center justify-center text-base">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-sa-gold uppercase font-bold">Agency</span>
            </div>
            <h4 className="font-display font-bold text-lg text-white mb-2">Team Collaboration</h4>
            <p className="text-xs text-text-tertiary leading-relaxed">Invite team members, manage multiple client accounts, and collaborate in real-time.</p>
          </FadeInDiv>
        </FadeInDiv>

        {/* Bottom flag accent divider */}
        <div className="flag-accent mt-16"></div>
      </div>
    </SectionWrapper>
  );
}
