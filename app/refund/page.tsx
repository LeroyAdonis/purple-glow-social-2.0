import '@/design-system/posta/tokens.css';
import type { Metadata } from 'next';
import Link from 'next/link';

import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: `Refunds and cancellations | ${COMPANY.productName}`,
  description: `How billing, cancellation and refunds work for ${COMPANY.productName} subscriptions.`,
};

/**
 * A refund and cancellation policy is not optional for a subscription business: it is the first thing a
 * payment processor checks and the first thing a customer looks for before paying. Written to state only
 * what we actually do, and to make clear it does not override the Consumer Protection Act.
 */
export default function RefundPolicyPage() {
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
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">Refunds and cancellations</h1>
        <p className="text-sm text-[var(--posta-ink-soft)] mb-10">
          Last updated 24 October 2026 · applies to {COMPANY.productName} subscriptions billed by{' '}
          {COMPANY.legalName}
        </p>

        <div className="space-y-8 text-[var(--posta-ink-soft)] leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">1. What you are buying</h2>
            <p>
              {COMPANY.productName} is a monthly software subscription. You are buying access to the service for
              a period of one month at a time, paid in advance by card. It is not a once-off purchase of
              software you keep, and no physical goods are shipped.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">2. Cancelling</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You can cancel at any time from the dashboard, or by emailing us.</li>
              <li>
                Cancelling stops the next charge. Your access continues until the end of the period you have
                already paid for, and then the account drops to the free plan.
              </li>
              <li>We do not require a notice period and we do not charge a cancellation fee.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">3. Refunds</h2>
            <p className="mb-3">
              Because you can cancel before the next charge, we do not refund part of a month that has already
              started. In these situations we do refund:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You were charged twice for the same period.</li>
              <li>You were charged after cancelling, and the cancellation reached us before the charge.</li>
              <li>The service was unavailable for a prolonged period and we could not fix it for you.</li>
              <li>A charge you did not authorise.</li>
            </ul>
            <p className="mt-3">
              Refunds go back to the card that paid, through the same payment provider. We process approved
              refunds within 5 business days; how quickly it appears depends on your bank.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">4. Credits</h2>
            <p>
              Paid plans include a monthly allowance of generation credits. The allowance is granted at the
              start of each billing period and does not roll over to the next month. Credits are consumed when
              a post is successfully published, not when it is generated. If you cancel, any remaining credits
              stay usable until the end of the period you paid for.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">5. Your statutory rights</h2>
            <p>
              Nothing in this policy limits any right you have under the Consumer Protection Act 68 of 2008 or
              the Electronic Communications and Transactions Act 25 of 2002. If the law gives you a
              cooling-off right for a purchase like this, tell us within the period the law allows and we will
              honour it.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">6. Before you dispute a charge</h2>
            <p>
              Please email us first. A chargeback takes weeks and usually resolves in a day if you tell us what
              went wrong. Write to{' '}
              <a className="text-[color:var(--posta-clay)] hover:underline" href={`mailto:${COMPANY.supportEmail}`}>
                {COMPANY.supportEmail}
              </a>{' '}
              with the email address on the account and the date of the charge.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[var(--posta-ink)] mb-3">7. Who you are dealing with</h2>
            <address className="not-italic bg-[var(--posta-white)] p-6 rounded-xl">
              <strong className="text-[var(--posta-ink)]">{COMPANY.legalName}</strong><br />
              Registration number: {COMPANY.registrationNumber}<br />
              {COMPANY.vatRegistered ? 'VAT registered' : 'Not VAT registered'}<br />
              Email:{' '}
              <a className="text-[color:var(--posta-clay)] hover:underline" href={`mailto:${COMPANY.supportEmail}`}>
                {COMPANY.supportEmail}
              </a>
            </address>
          </section>
        </div>
      </main>
    </div>
  );
}
