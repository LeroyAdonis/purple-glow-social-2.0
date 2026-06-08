/**
 * How It Works Section Component
 * Server Component - Step-by-step process explanation
 * SA-themed vertical timeline with staggered cards
 */

interface HowItWorksSectionProps {
  translate: (key: string) => string;
}

export default function HowItWorksSection({ translate }: HowItWorksSectionProps) {
  const steps = [
    {
      icon: 'fa-solid fa-link',
      title: translate('howItWorks.step1.title'),
      description: translate('howItWorks.step1.description'),
      color: 'posta-orange',
      colorText: 'posta-orange',
      glowClass: 'glow-orange',
      accent: 'bg-posta-orange/20 border-posta-orange/40',
    },
    {
      icon: 'fa-solid fa-wand-magic-sparkles',
      title: translate('howItWorks.step2.title'),
      description: translate('howItWorks.step2.description'),
      color: 'sa-gold',
      colorText: 'sa-gold',
      glowClass: 'glow-gold',
      accent: 'bg-sa-gold/20 border-sa-gold/40',
    },
    {
      icon: 'fa-solid fa-rocket',
      title: translate('howItWorks.step3.title'),
      description: translate('howItWorks.step3.description'),
      color: 'surge-teal',
      colorText: 'surge-teal',
      glowClass: 'glow-teal',
      accent: 'bg-surge-teal/20 border-surge-teal/40',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-cosmic-void overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay !fixed pointer-events-none"></div>

      {/* Subtle pattern dots */}
      <div className="pattern-dots-teal absolute inset-0 pointer-events-none opacity-30"></div>

      {/* Ambient glow */}
      <div className="glow-orb-posta-orange w-[600px] h-[600px] -top-64 -right-64 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sa-green/10 border border-sa-green/20 text-sa-green text-[10px] font-bold tracking-widest mb-4 uppercase">
            <i className="fa-solid fa-arrow-right-arrow-left"></i>
            <span>{translate('howItWorks.badge') || 'Simple Process'}</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            {translate('howItWorks.title')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">{translate('howItWorks.subtitle') || 'Three steps to social media mastery, made for South Africa'}</p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Timeline line — SA flag gradient down the center */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-posta-orange via-sa-gold to-surge-teal rounded-full opacity-40"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative mb-16 last:mb-0">
              {/* Connecting stripe between steps */}
              {index > 0 && (
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-8 w-0.5 h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${index % 2 === 1 ? 'md:direction-rtl' : ''}`}>
                {/* Content Card — alternates left/right */}
                <div className={`${index % 2 === 1 ? 'md:col-start-2' : 'md:col-start-1'}`}>
                  <div className={`premium-card p-8 rounded-2xl border-l-4 border-${step.color} hover:shadow-2xl transition-all duration-500 group ${step.glowClass}`}
                       style={{ borderLeftColor: `var(--color-${step.color})` }}>
                    {/* Step indicator */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl ${step.accent} flex items-center justify-center text-lg text-${step.colorText} group-hover:scale-110 transition-transform`}>
                        <i className={step.icon}></i>
                      </div>
                      <div>
                        <span className={`font-mono text-[10px] tracking-widest text-${step.colorText} uppercase font-bold`}>
                          Step {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className={`font-display font-bold text-xl text-white`}>{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed pl-0">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Visual Decor — empty side with icon badge */}
                <div className={`hidden md:flex items-center justify-center ${index % 2 === 1 ? 'md:col-start-1' : 'md:col-start-2'}`}>
                  <div className="relative">
                    {/* Timeline dot on the center line */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cosmic-void border-2 border-posta-orange shadow-[0_0_15px_rgba(232,93,4,0.3)] z-10"
                         style={{
                           borderColor: index === 0 ? '#E85D04' : index === 1 ? '#FFB81C' : '#00D4AA',
                           boxShadow: index === 0 ? '0 0 15px rgba(232,93,4,0.3)' : index === 1 ? '0 0 15px rgba(255,184,28,0.3)' : '0 0 15px rgba(0,212,170,0.3)'
                         }}>
                      <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1.5 opacity-70"></div>
                    </div>

                    {/* Decorative number badge */}
                    <div className={`w-20 h-20 rounded-full bg-void-elevated border-2 border-${step.color}/30 flex items-center justify-center`}
                         style={{
                           borderColor: index === 0 ? 'rgba(232,93,4,0.3)' : index === 1 ? 'rgba(255,184,28,0.3)' : 'rgba(0,212,170,0.3)'
                         }}>
                      <span className={`font-display font-bold text-3xl text-${step.colorText} glow-text-${step.colorText === 'posta-orange' ? 'posta-orange' : step.colorText === 'sa-gold' ? 'gold' : 'teal'}`}
                            style={{
                              color: index === 0 ? '#E85D04' : index === 1 ? '#FFB81C' : '#00D4AA',
                            }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SA flag accent divider between steps (visible on mobile) */}
              {index < steps.length - 1 && (
                <div className="flex md:hidden items-center gap-3 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <div className="w-4 h-4 rounded-full border-2 border-posta-orange/40 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-posta-orange/60"></div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom flag accent */}
        <div className="flag-accent mt-16"></div>

        {/* SA decorative stamp at bottom */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/5">
            <div className="flex gap-0.5">
              <div className="w-2 h-2 rounded-full bg-sa-green"></div>
              <div className="w-2 h-2 rounded-full bg-sa-gold"></div>
              <div className="w-2 h-2 rounded-full bg-sa-red"></div>
              <div className="w-2 h-2 rounded-full bg-sa-blue"></div>
            </div>
            <span className="text-xs text-text-tertiary font-mono tracking-wide">Built for Mzansi business</span>
          </div>
        </div>
      </div>
    </section>
  );
}
