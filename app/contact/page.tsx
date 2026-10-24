import '@/design-system/posta/tokens.css';
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
    <div className="legal-page min-h-screen bg-[var(--posta-paper)] text-[var(--posta-ink)]">
      <header className="border-b border-[var(--posta-line)]  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 min-h-[44px] hover:opacity-80 transition">
              <div className="w-8 h-8 rounded bg-[var(--posta-clay)] flex items-center justify-center">
                <span className="font-display font-bold text-sm text-[var(--posta-cream)]">P</span>
              </div>
              <span className="font-display font-bold text-lg uppercase">{COMPANY.productName}</span>
            </Link>
            <Link href="/" className="text-sm text-[var(--posta-ink-soft)] hover:text-[color:var(--posta-clay)] transition flex items-center gap-2 min-h-[44px]">
              <i className="fa-solid fa-arrow-left"></i> Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3">Contact us</h1>
        <p className="text-[var(--posta-ink-soft)] mb-10">
          One person reads every message, so you will get a reply from a human rather than a ticket number.
        </p>

        <div className="space-y-6">
          <section className="bg-[var(--posta-white)] border border-[var(--posta-line)] rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Support and billing</h2>
            <p className="text-[var(--posta-ink-soft)] mb-2">
              Email <a className="text-[color:var(--posta-clay)] hover:underline" href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>
            </p>
            <p className="text-[var(--posta-ink-soft)]">
              We reply within {COMPANY.responseTime}. Hours are {COMPANY.supportHours}. South Africa does not
              observe daylight saving, so that is a fixed offset from anywhere else in the world.
            </p>
          </section>

          <section className="bg-[var(--posta-white)] border border-[var(--posta-line)] rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Privacy and your data</h2>
            <p className="text-[var(--posta-ink-soft)]">
              For anything about your personal information - access, correction, or deletion - email{' '}
              <a className="text-[color:var(--posta-clay)] hover:underline" href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>{' '}
              and read our <Link className="text-[color:var(--posta-clay)] hover:underline" href="/privacy">privacy policy</Link>.
            </p>
          </section>

          <section className="bg-[var(--posta-white)] border border-[var(--posta-line)] rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">The business behind {COMPANY.productName}</h2>
            <address className="not-italic text-[var(--posta-ink-soft)] leading-relaxed">
              <strong className="text-[var(--posta-ink)]">{COMPANY.legalName}</strong><br />
              {companyAddressLine()}<br /><br />
              Registration number: {COMPANY.registrationNumber}<br />
              {COMPANY.vatRegistered ? 'VAT registered' : 'Not VAT registered'}
            </address>
          </section>

          <section className="bg-[var(--posta-white)] border border-[var(--posta-line)] rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Cancelling or changing a plan</h2>
            <p className="text-[var(--posta-ink-soft)]">
              You can cancel from the dashboard at any time, or email us and we will do it. See the{' '}
              <Link className="text-[color:var(--posta-clay)] hover:underline" href="/refund">refunds and cancellations policy</Link>{' '}
              for exactly what happens to your billing period.
            </p>
          </section>

          <section className="bg-[var(--posta-white)] border border-[var(--posta-line)] rounded-xl p-6">
            <h2 className="font-display font-bold text-xl mb-3">Credits</h2>
            <p className="text-[var(--posta-ink-soft)]">
              Icons by <a className="text-[color:var(--posta-clay)] hover:underline" href="https://fontawesome.com" target="_blank" rel="noopener noreferrer">Font Awesome Free</a>{' '}
              by Fonticons, Inc., used under CC BY 4.0. Typefaces Space Grotesk and Inter, both under the SIL
              Open Font License. Full licence details are in the LICENSES file in our source repository.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
