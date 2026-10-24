import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getServerLanguage, createTranslator } from '@/lib/i18n-server';

import '@/design-system/posta/tokens.css';

import Navigation from '@/components/landing/navigation';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import PricingSection from '@/components/landing/pricing-section';
import ContactSection from '@/components/landing/contact-section';
import FooterSection from '@/components/landing/footer-section';

export default async function HomePage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  return (
    <div style={{ minHeight: '100vh', background: 'var(--posta-clay)', color: 'var(--posta-cream)', fontFamily: 'var(--font-body)' }}>
      <Navigation session={session} />
      <main style={{ paddingTop: 64 }}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <ContactSection />
      </main>
      <FooterSection />
    </div>
  );
}