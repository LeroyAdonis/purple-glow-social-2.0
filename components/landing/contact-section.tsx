/**
 * Contact Section Component
 * Server Component - Contact form section
 */

interface ContactSectionProps {
  translate: (key: string) => string;
}

export default function ContactSection({ translate }: ContactSectionProps) {
  return (
    <section id="contact" className="py-24 relative bg-white/[0.02]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display font-bold text-4xl mb-6">{translate('contact.title')}</h2>
        <p className="text-gray-400 mb-12">{translate('contact.subtitle')}</p>

        <div className="aerogel-card p-8 rounded-3xl text-left">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">{translate('contact.name').toUpperCase()}</label>
                <input type="text" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">{translate('contact.email').toUpperCase()}</label>
                <input type="email" className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400">{translate('contact.message').toUpperCase()}</label>
              <textarea rows={4} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"></textarea>
            </div>
            <button type="button" className="w-full py-4 bg-gradient-to-r from-neon-grape to-electric-indigo text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all">
              {translate('contact.send')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
