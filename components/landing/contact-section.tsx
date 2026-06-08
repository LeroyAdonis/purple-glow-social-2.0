/**
 * Contact Section Component
 * Server Component - Contact form section
 * SA-themed contact form with decorative elements
 */

import { SectionWrapper, FadeInDiv } from '@/components/ui/section-wrapper';

interface ContactSectionProps {
  translate: (key: string) => string;
}

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function ContactSection({ translate }: ContactSectionProps) {
  return (
    <SectionWrapper
      id="contact"
      className="py-16 relative bg-cosmic-void overflow-hidden"
      delay={0}
    >
      {/* Background patterns */}
      <div className="pattern-dots absolute inset-0 pointer-events-none opacity-20"></div>

      {/* Decorative glow orbs */}
      <div className="glow-orb-teal w-[500px] h-[500px] -bottom-48 -right-48 pointer-events-none"></div>
      <div className="glow-orb-posta-orange w-[400px] h-[400px] -top-32 -left-32 pointer-events-none"></div>

      {/* SA flag stripe at top */}
      <div className="flag-stripe absolute top-0 left-0 right-0"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* LEFT — Info & Decorative */}
          <FadeInDiv
            className="lg:col-span-2 space-y-6"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {/* Section Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sa-green/10 border border-sa-green/20 text-sa-green text-[10px] font-bold tracking-widest mb-4 uppercase">
                <i className="fa-solid fa-paper-plane"></i>
                <span>{translate('contact.badge') || 'Get In Touch'}</span>
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                {translate('contact.title')}
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {translate('contact.subtitle')}
              </p>
            </div>

            {/* Contact info cards */}
            <FadeInDiv
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <FadeInDiv className="flex items-center gap-4 premium-card p-4 rounded-xl border-l-2 border-posta-orange" variants={staggerItem}>
                <div className="w-10 h-10 rounded-lg bg-posta-orange/20 text-posta-orange flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-mono tracking-wide">EMAIL</p>
                  <p className="text-sm text-white font-bold">hello@posta.co.za</p>
                </div>
              </FadeInDiv>
              <FadeInDiv className="flex items-center gap-4 premium-card p-4 rounded-xl border-l-2 border-surge-teal" variants={staggerItem}>
                <div className="w-10 h-10 rounded-lg bg-surge-teal/20 text-surge-teal flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-mono tracking-wide">PHONE</p>
                  <p className="text-sm text-white font-bold">+27 87 123 4567</p>
                </div>
              </FadeInDiv>
              <FadeInDiv className="flex items-center gap-4 premium-card p-4 rounded-xl border-l-2 border-sa-gold" variants={staggerItem}>
                <div className="w-10 h-10 rounded-lg bg-sa-gold/20 text-sa-gold flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-mono tracking-wide">OFFICE</p>
                  <p className="text-sm text-white font-bold">Johannesburg, Gauteng</p>
                </div>
              </FadeInDiv>
            </FadeInDiv>

            {/* SA decorative badge */}
            <FadeInDiv
              className="hidden lg:flex items-center gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flag-stripe-vertical h-16 rounded-full overflow-hidden"></div>
              <div>
                <p className="text-xs text-text-tertiary font-mono">PROUDLY SOUTH AFRICAN</p>
                <p className="text-sm text-text-secondary">Built in Mzansi, serving Mzansi</p>
              </div>
            </FadeInDiv>
          </FadeInDiv>

          {/* RIGHT — Contact Form */}
          <FadeInDiv
            className="lg:col-span-3"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden">
              {/* Decorative glow behind form */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-posta-orange/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-joburg-teal/8 rounded-full blur-[60px] pointer-events-none"></div>

              {/* SA flag accent inside card */}
              <div className="flag-accent mb-6"></div>

              <form className="relative z-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-text-tertiary tracking-wider uppercase flex items-center gap-2">
                      <i className="fa-regular fa-user text-[10px] text-posta-orange"></i>
                      {translate('contact.name')}
                    </label>
                    <input
                      type="text"
                      placeholder="Thabo Mokoena"
                      className="w-full bg-void-hover/50 border border-border-default rounded-xl px-5 py-3.5 text-white placeholder:text-text-quaternary focus:outline-none focus:border-posta-orange focus:shadow-[0_0_15px_rgba(232,93,4,0.15)] transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-text-tertiary tracking-wider uppercase flex items-center gap-2">
                      <i className="fa-regular fa-envelope text-[10px] text-posta-orange"></i>
                      {translate('contact.email')}
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.co.za"
                      className="w-full bg-void-hover/50 border border-border-default rounded-xl px-5 py-3.5 text-white placeholder:text-text-quaternary focus:outline-none focus:border-posta-orange focus:shadow-[0_0_15px_rgba(232,93,4,0.15)] transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-tertiary tracking-wider uppercase flex items-center gap-2">
                    <i className="fa-regular fa-building text-[10px] text-posta-orange"></i>
                    {translate('contact.company') || 'Company (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Your Business Name"
                    className="w-full bg-void-hover/50 border border-border-default rounded-xl px-5 py-3.5 text-white placeholder:text-text-quaternary focus:outline-none focus:border-posta-orange focus:shadow-[0_0_15px_rgba(232,93,4,0.15)] transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-tertiary tracking-wider uppercase flex items-center gap-2">
                    <i className="fa-regular fa-message text-[10px] text-posta-orange"></i>
                    {translate('contact.message')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your social media needs..."
                    className="w-full bg-void-hover/50 border border-border-default rounded-xl px-5 py-3.5 text-white placeholder:text-text-quaternary focus:outline-none focus:border-posta-orange focus:shadow-[0_0_15px_rgba(232,93,4,0.15)] transition-all text-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="button"
                  className="w-full py-4 bg-gradient-to-r from-posta-orange to-amber-600 text-white font-bold rounded-xl hover:shadow-[0_0_25px_rgba(232,93,4,0.35)] transition-all duration-300 text-sm tracking-wide flex items-center justify-center gap-3 group"
                >
                  <i className="fa-solid fa-paper-plane group-hover:translate-x-1 transition-transform"></i>
                  {translate('contact.send')}
                </button>

                {/* Trust indicator */}
                <p className="text-center text-[10px] text-text-quaternary font-mono flex items-center justify-center gap-2 pt-2">
                  <i className="fa-solid fa-lock text-sa-green"></i>
                  Your information is safe with us. We respect the <strong className="text-text-tertiary">POPI Act</strong>.
                </p>
              </form>
            </div>
          </FadeInDiv>
        </div>

        {/* SA flag accent at bottom */}
        <div className="flag-accent mt-12"></div>
      </div>
    </SectionWrapper>
  );
}
