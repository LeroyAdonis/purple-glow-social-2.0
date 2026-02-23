/**
 * Testimonials Section Component
 * Server Component - User testimonials showcase
 */

interface TestimonialsSectionProps {
  translate: (key: string) => string;
}

export default function TestimonialsSection({ translate }: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl mb-4">{translate('testimonials.title')}</h2>
          <p className="text-gray-400">{translate('testimonials.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
            <div className="mb-4 text-neon-grape text-2xl"><i className="fa-solid fa-quote-left"></i></div>
            <p className="text-gray-300 italic mb-6 flex-1">
              "{translate('testimonials.thabo.quote')}"
            </p>
            <div className="flex items-center gap-4 border-t border-glass-border pt-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
              <div>
                <h4 className="font-bold text-sm text-white">{translate('testimonials.thabo.name')}</h4>
                <p className="text-xs text-gray-500">{translate('testimonials.thabo.role')}</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
            <div className="mb-4 text-joburg-teal text-2xl"><i className="fa-solid fa-quote-left"></i></div>
            <p className="text-gray-300 italic mb-6 flex-1">
              "{translate('testimonials.zanele.quote')}"
            </p>
            <div className="flex items-center gap-4 border-t border-glass-border pt-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
              <div>
                <h4 className="font-bold text-sm text-white">{translate('testimonials.zanele.name')}</h4>
                <p className="text-xs text-gray-500">{translate('testimonials.zanele.role')}</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="aerogel-card p-8 rounded-3xl flex flex-col h-full hover:border-white/30 transition-all">
            <div className="mb-4 text-mzansi-gold text-2xl"><i className="fa-solid fa-quote-left"></i></div>
            <p className="text-gray-300 italic mb-6 flex-1">
              "{translate('testimonials.pieter.quote')}"
            </p>
            <div className="flex items-center gap-4 border-t border-glass-border pt-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-regular fa-user"></i></div>
              <div>
                <h4 className="font-bold text-sm text-white">{translate('testimonials.pieter.name')}</h4>
                <p className="text-xs text-gray-500">{translate('testimonials.pieter.role')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
