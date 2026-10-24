import type { Metadata } from 'next';
import Link from 'next/link';

import { COMPANY, companyAddressLine } from '@/lib/company';

export const metadata: Metadata = {
  title: `Contact | ${COMPANY.productName}`,
  description: `Contact ${COMPANY.productName} for support, billing or privacy questions.`,
};

/**
 * A real contact page. Beyond being what a customer looks for, a payment processor reviews this: an app
 * that takes money but offers no way to reach a human is a common reason for a rejected or frozen account.
 * Everything here is a fact about the business - no invented phone number, no fake live-chat promise.
 */
export default function ContactPage() {
  return (
    <div className="legal-page min-h-screen bg-void text-white">
      <header className="border-b border-white/10 bg-pretoria-blue/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
                <span className="font-display font-bold text-sm text-white">P</span>
              </div>
              <span className="font-display font-bold text-lg uppercase">{COMPANY.productName}</span>
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-joburg-teal transition flex items-center gap-2">
              <i className="fa-solid fa-arrow-left"></i> Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3">Contact us</h1>
        <p className="text-gray-300 mb-10">
          One person reads every message, so you will get a reply from a human rather than a ticket number.
        </p>

        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Support and billing</h2>
            <p className="text-gray-300 mb-2">
              Email <a className="text-joburg-teal hover:underline" href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>
            </p>
            <p className="text-gray-300">
              We reply within {COMPANY.responseTime}. Hours are {COMPANY.supportHours}. South Africa does not
              observe daylight saving, so that is a fixed offset from anywhere else in the world.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Privacy and your data</h2>
            <p className="text-gray-300">
              For anything about your personal information - access, correction, or deletion - email{' '}
              <a className="text-joburg-teal hover:underline" href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>{' '}
              and read our <Link className="text-joburg-teal hover:underline" href="/privacy">privacy policy</Link>.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">The business behind {COMPANY.productName}</h2>
            <address className="not-italic text-gray-300 leading-relaxed">
              <strong className="text-white">{COMPANY.legalName}</strong><br />
              {companyAddressLine()}<br /><br />
              Registration number: {COMPANY.registrationNumber}<br />
              {COMPANY.vatRegistered ? 'VAT registered' : 'Not VAT registered'}
            </address>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Cancelling or changing a plan</h2>
            <p className="text-gray-300">
              You can cancel from the dashboard at any time, or email us and we will do it. See the{' '}
              <Link className="text-joburg-teal hover:underline" href="/refund">refunds and cancellations policy</Link>{' '}
              for exactly what happens to your billing period.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Credits</h2>
            <p className="text-gray-300">
              Icons by <a className="text-joburg-teal hover:underline" href="https://fontawesome.com" target="_blank" rel="noopener noreferrer">Font Awesome Free</a>{' '}
              by Fonticons, Inc., used under CC BY 4.0. Typefaces Space Grotesk and Inter, both under the SIL
              Open Font License. Full licence details are in the LICENSES file in our source repository.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
