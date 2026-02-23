/**
 * Homepage - Server Component
 * Renders the landing page with server-side rendering for optimal SEO and performance.
 * Fetches session server-side and passes to client components as needed.
 */

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getServerLanguage, createTranslator } from '@/lib/i18n-server';

// Server Components (Static)
import AmbientBackground from '@/components/landing/ambient-background';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import ContactSection from '@/components/landing/contact-section';

// Client Components (Interactive)
import Navigation from '@/components/landing/navigation';
import PricingSection from '@/components/landing/pricing-section';
import FooterSection from '@/components/landing/footer-section';

export default async function HomePage() {
  // Fetch session server-side
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Get current language and create translator
  const language = await getServerLanguage();
  const translate = createTranslator(language);

  return (
    <div className="min-h-screen bg-void text-white font-body overflow-x-hidden relative selection:bg-neon-grape selection:text-white">
      {/* Ambient Background - Server Component */}
      <AmbientBackground />

      {/* Navigation - Client Component (interactive) */}
      <Navigation session={session} />

      {/* Hero Section - Server Component */}
      <HeroSection translate={translate} />

      {/* Features Section - Server Component */}
      <FeaturesSection translate={translate} />

      {/* How It Works Section - Server Component */}
      <HowItWorksSection translate={translate} />

      {/* Testimonials Section - Server Component */}
      <TestimonialsSection translate={translate} />

      {/* Pricing Section - Client Component (billing toggle) */}
      <PricingSection />

      {/* Contact Section - Server Component */}
      <ContactSection translate={translate} />

      {/* Footer - Client Component (smooth scroll links) */}
      <FooterSection />
    </div>
  );
}
