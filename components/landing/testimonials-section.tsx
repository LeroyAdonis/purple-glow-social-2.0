/**
 * Testimonials Section Component
 * Server Component - User testimonials showcase
 * SA-themed magazine-style layout: featured + stacked cards
 */

interface TestimonialsSectionProps {
  translate: (key: string) => string;
}

export default function TestimonialsSection({ translate }: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background patterns */}
      <div className="pattern-dots-gold absolute inset-0 pointer-events-none"></div>
      <div className="pattern-lines-teal absolute inset-0 pointer-events-none opacity-30"></div>

      {/* Ambient glow */}
      <div className="glow-orb-posta-orange w-[400px] h-[400px] top-1/2 -translate-y-1/2 -left-32 pointer-events-none"></div>

      {/* SA flag accent bar */}
      <div className="flag-stripe absolute top-0 left-0 right-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-posta-orange/10 border border-posta-orange/20 text-posta-orange text-[10px] font-bold tracking-widest mb-4 uppercase">
            <i className="fa-solid fa-star"></i>
            <span>{translate('testimonials.badge') || 'Real Stories'}</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">{translate('testimonials.title')}</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">{translate('testimonials.subtitle')}</p>
        </div>

        {/* Magazine-style layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FEATURED — Large left card */}
          <div className="lg:col-span-2 lg:row-span-1">
            <div className="premium-card p-8 md:p-10 rounded-3xl h-full relative overflow-hidden group hover:border-posta-orange/40 transition-all duration-500">
              {/* Orange glow behind quote */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-posta-orange/10 rounded-full blur-[60px] pointer-events-none"></div>

              {/* SA flag vertical accent */}
              <div className="flag-stripe-vertical absolute left-0 top-0 bottom-0 rounded-l-3xl overflow-hidden"></div>

              <div className="relative pl-4 md:pl-6">
                {/* Quote mark — large decorative */}
                <div className="text-6xl md:text-7xl text-posta-orange mb-4 opacity-60 leading-none font-display">
                  <i className="fa-solid fa-quote-left"></i>
                </div>

                <p className="text-white text-lg md:text-xl italic leading-relaxed mb-8 font-body">
                  &ldquo;{translate('testimonials.thabo.quote')}&rdquo;
                </p>

                {/* Stats badge */}
                <div className="inline-flex items-center gap-4 flex-wrap mb-8">
                  <div className="px-4 py-2 rounded-lg bg-sa-green/10 border border-sa-green/20">
                    <span className="text-sa-green font-bold font-display text-lg">+340%</span>
                    <span className="text-xs text-text-tertiary ml-2">Engagement</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-joburg-teal/10 border border-joburg-teal/20">
                    <span className="text-joburg-teal font-bold font-display text-lg">3×</span>
                    <span className="text-xs text-text-tertiary ml-2">Content Output</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-sa-gold/10 border border-sa-gold/20">
                    <span className="text-sa-gold font-bold font-display text-lg">11</span>
                    <span className="text-xs text-text-tertiary ml-2">Languages</span>
                  </div>
                </div>

                {/* User info */}
                <div className="flex items-center gap-5 border-t border-white/5 pt-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-posta-orange to-surge-teal flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{translate('testimonials.thabo.name')}</h4>
                    <p className="text-sm text-text-tertiary">{translate('testimonials.thabo.role')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Two stacked testimonial cards */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Card 2 */}
            <div className="premium-card p-6 rounded-2xl flex-1 relative overflow-hidden group hover:border-joburg-teal/40 transition-all duration-500">
              {/* Teal quote mark */}
              <div className="text-3xl text-joburg-teal mb-3 opacity-50">
                <i className="fa-solid fa-quote-left"></i>
              </div>

              <p className="text-text-secondary text-sm italic leading-relaxed mb-5">
                &ldquo;{translate('testimonials.zanele.quote')}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-joburg-teal to-sa-green flex items-center justify-center text-white font-bold text-sm">
                  <i className="fa-regular fa-user"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{translate('testimonials.zanele.name')}</h4>
                  <p className="text-xs text-text-tertiary">{translate('testimonials.zanele.role')}</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="premium-card p-6 rounded-2xl flex-1 relative overflow-hidden group hover:border-sa-gold/40 transition-all duration-500">
              {/* Gold quote mark */}
              <div className="text-3xl text-sa-gold mb-3 opacity-50">
                <i className="fa-solid fa-quote-left"></i>
              </div>

              <p className="text-text-secondary text-sm italic leading-relaxed mb-5">
                &ldquo;{translate('testimonials.pieter.quote')}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sa-gold to-sa-red flex items-center justify-center text-white font-bold text-sm">
                  <i className="fa-regular fa-user"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{translate('testimonials.pieter.name')}</h4>
                  <p className="text-xs text-text-tertiary">{translate('testimonials.pieter.role')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom SA decorative element */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex items-center gap-2 text-xs text-text-tertiary font-mono">
            <span className="w-8 h-px bg-white/10"></span>
            <i className="fa-solid fa-heart text-sa-red text-[10px]"></i>
            <span>Trusted by entrepreneurs across South Africa</span>
            <i className="fa-solid fa-heart text-sa-red text-[10px]"></i>
            <span className="w-8 h-px bg-white/10"></span>
          </div>
        </div>
      </div>
    </section>
  );
}
