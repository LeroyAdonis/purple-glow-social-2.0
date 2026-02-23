/**
 * How It Works Section Component
 * Server Component - Step-by-step process explanation
 */

interface HowItWorksSectionProps {
  translate: (key: string) => string;
}

export default function HowItWorksSection({ translate }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-24 relative bg-black/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl mb-4">{translate('howItWorks.title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-neon-grape via-white/20 to-joburg-teal z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-void border border-neon-grape shadow-[0_0_20px_rgba(157,78,221,0.5)] flex items-center justify-center text-xl font-bold font-mono mb-6">1</div>
            <h3 className="font-display font-bold text-xl mb-3">{translate('howItWorks.step1.title')}</h3>
            <p className="text-gray-400 text-sm">
              {translate('howItWorks.step1.description')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-void border border-white/30 flex items-center justify-center text-xl font-bold font-mono mb-6">2</div>
            <h3 className="font-display font-bold text-xl mb-3">{translate('howItWorks.step2.title')}</h3>
            <p className="text-gray-400 text-sm">
              {translate('howItWorks.step2.description')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-void border border-joburg-teal shadow-[0_0_20px_rgba(0,224,255,0.5)] flex items-center justify-center text-xl font-bold font-mono mb-6">3</div>
            <h3 className="font-display font-bold text-xl mb-3">{translate('howItWorks.step3.title')}</h3>
            <p className="text-gray-400 text-sm">
              {translate('howItWorks.step3.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
