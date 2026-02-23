/**
 * Features Section Component
 * Server Component - Static features showcase
 */

interface FeaturesSectionProps {
  translate: (key: string) => string;
}

export default function FeaturesSection({ translate }: FeaturesSectionProps) {
  const titleParts = translate('features.title').split(' ');
  const firstWord = titleParts[0];
  const restOfTitle = titleParts.slice(1).join(' ');

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl mb-4">
            {firstWord} <span className="text-joburg-teal">{restOfTitle}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{translate('features.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aerogel-card p-8 rounded-3xl group hover:border-neon-grape/30 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-neon-grape/10 text-neon-grape flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h3 className="font-display font-bold text-xl mb-3">
              {translate('features.aiEngine.title')}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {translate('features.aiEngine.description')}
            </p>
          </div>

          <div className="aerogel-card p-8 rounded-3xl group hover:border-joburg-teal/30 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-joburg-teal/10 text-joburg-teal flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-image"></i>
            </div>
            <h3 className="font-display font-bold text-xl mb-3">
              {translate('features.multilingual.title')}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {translate('features.multilingual.description')}
            </p>
          </div>

          <div className="aerogel-card p-8 rounded-3xl group hover:border-mzansi-gold/30 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-mzansi-gold/10 text-mzansi-gold flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-video"></i>
            </div>
            <h3 className="font-display font-bold text-xl mb-3">
              {translate('features.scheduling.title')}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {translate('features.scheduling.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
