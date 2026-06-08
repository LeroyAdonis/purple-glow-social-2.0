/**
 * Hero Section Component
 * Server Component - Static hero content with CTA buttons
 */

import Link from 'next/link';
import Image from 'next/image';

interface HeroSectionProps {
  translate: (key: string) => string;
}

export default function HeroSection({ translate }: HeroSectionProps) {
  return (
    <header className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-mzansi-gold animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-300">
              AI That Speaks Your Language
            </span>
          </div>

          <h1 className="font-display font-extrabold text-6xl md:text-7xl leading-[0.9]">
            AI Writes Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-grape via-white to-joburg-teal">
              SOCIAL POSTS
            </span>
          </h1>

          <p className="font-body text-xl text-gray-400 max-w-lg leading-relaxed">
            {translate('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-neon-grape text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-[0_0_30px_-10px_#9D4EDD] hover:scale-105 text-center"
            >
              {translate('hero.cta')}
            </Link>
            <button className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group">
              <i className="fa-solid fa-play text-xs group-hover:text-joburg-teal transition-colors"></i>{' '}
              {translate('hero.demo')}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-500 pt-4">
            <span>
              <i className="fa-solid fa-check text-joburg-teal mr-2"></i>In all 11 languages
            </span>
            <span>
              <i className="fa-solid fa-check text-joburg-teal mr-2"></i>No card needed
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          {/* Glass Card Mockup */}
          <div className="aerogel-card p-6 rounded-3xl relative z-10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border-t border-white/20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-black border border-white/10"></div>
                <div>
                  <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                  <div className="h-2 w-16 bg-white/10 rounded"></div>
                </div>
              </div>
              <i className="fa-brands fa-instagram text-xl text-gray-400"></i>
            </div>

            <div className="aspect-square rounded-2xl bg-black/50 mb-6 overflow-hidden relative group">
              <Image
                src="https://picsum.photos/600/600"
                alt="Example social media post created by Purple Glow"
                width={600}
                height={600}
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                unoptimized
                priority
              />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-neon-grape text-xs"></i>
                <span className="text-[10px] font-mono tracking-wider">WRITTEN FOR YOU</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-3 w-3/4 bg-white/20 rounded"></div>
              <div className="h-3 w-full bg-white/10 rounded"></div>
              <div className="h-3 w-1/2 bg-white/10 rounded"></div>
            </div>
          </div>

          {/* Floating Elements */}
          <div
            className="absolute -top-10 -right-10 aerogel-card p-4 rounded-2xl flex items-center gap-3 animate-bounce"
            style={{ animationDuration: '3s' }}
          >
            <div className="w-8 h-8 bg-mzansi-gold/20 text-mzansi-gold rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-language"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-white">All 11 Languages</div>
              <div className="text-[10px] text-gray-400 font-mono">ZULU / XHOSA / ENG +</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
