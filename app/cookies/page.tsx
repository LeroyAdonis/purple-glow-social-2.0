import '@/design-system/posta/tokens.css';
import type { Metadata } from 'next';
import Link from 'next/link';

import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: `Cookie policy | ${COMPANY.productName}`,
  description: `What ${COMPANY.productName} stores in your browser, and how to change your choice.`,
};

/**
 * Written against what the application actually stores, not from a template. The distinction matters: a
 * cookie policy that lists cookies we do not set is a false statement, and one that omits the storage we do
 * use fails the purpose. What is stored today:
 *   - a session cookie set by the auth layer, HttpOnly, needed to keep you signed in
 *   - the consent choice itself, in localStorage under the key `pgs-cookie-consent`
 *   - no advertising or cross-site tracking cookies
 * If that ever changes, this page changes in the same commit.
 */
export default function CookiePolicyPage() {
  return (
    <div className="legal-page min-h-screen bg-[var(--posta-paper)] text-[var(--posta-ink)]">
      <header className="border-b border-[var(--posta-line)] bg-[var(--posta-paper)] sticky top-0 z-50">
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
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">Cookie policy</h1>
        <p className="text-sm text-[var(--posta-ink-soft)] mb-10">Last updated 24 October 2026</p>

        <div className="space-y-8 text-[var(--posta-ink-soft)] leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">1. The short version</h2>
            <p>
              We use the minimum needed to keep you signed in. We do not use advertising cookies, we do not
              follow you around other websites, and we do not sell anything about your browsing to anyone.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">2. What is actually stored</h2>
            <p className="mb-3">Two things, and this is the complete list:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-[var(--posta-ink)]">A session cookie</strong> set when you sign in. It holds a
                reference to your session so the app knows who you are between page loads. It is marked
                HttpOnly, which means scripts on the page cannot read it, and it expires when your session
                does. Without it you cannot stay signed in, so it is not optional.
              </li>
              <li>
                <strong className="text-[var(--posta-ink)]">Your cookie choice</strong>, stored in your browser&apos;s local
                storage under the key <code className="text-[color:var(--posta-clay)]">pgs-cookie-consent</code>. This is what
                stops the consent banner appearing on every page. It stays until you clear your browser data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">3. What we do not use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No advertising or retargeting cookies.</li>
              <li>No cross-site trackers or social-media pixels that follow you after you leave.</li>
              <li>No selling or sharing of your browsing behaviour with data brokers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">4. Changing your mind</h2>
            <p>
              When you first visit, the consent banner asks what you are comfortable with. To change that later,
              clear the site data for this domain in your browser settings - the banner will appear again on
              your next visit. Blocking the session cookie will sign you out and stop the app working, which is
              the honest trade-off rather than a bug.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">5. POPIA</h2>
            <p>
              We process personal information in line with the Protection of Personal Information Act 4 of 2013.
              Our <Link className="text-[color:var(--posta-clay)] hover:underline" href="/privacy">privacy policy</Link> sets
              out what we collect, why, and how to exercise your rights. You may also complain to the
              Information Regulator of South Africa.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">6. Who we are</h2>
            <address className="not-italic bg-[var(--posta-white)] p-6 rounded-xl">
              <strong className="text-[var(--posta-ink)]">{COMPANY.legalName}</strong><br />
              Registration number: {COMPANY.registrationNumber}<br />
              {COMPANY.vatRegistered ? 'VAT registered' : 'Not VAT registered'}<br />
              Email:{' '}
              <a className="text-[color:var(--posta-clay)] hover:underline" href={`mailto:${COMPANY.privacyEmail}`}>
                {COMPANY.privacyEmail}
              </a>
            </address>
            <p className="mt-4">
              Questions about this policy or about the storage described above go to{' '}
              <a className="text-[color:var(--posta-clay)] hover:underline" href={`mailto:${COMPANY.privacyEmail}`}>
                {COMPANY.privacyEmail}
              </a>{' '}
              or see the <Link className="text-[color:var(--posta-clay)] hover:underline" href="/contact">contact page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
