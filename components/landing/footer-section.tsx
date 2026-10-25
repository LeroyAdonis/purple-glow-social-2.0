import React from 'react';
import Link from 'next/link';
import { COMPANY, companyAddressLine, legalFooterLine } from '@/lib/company';

/**
 * Footer — mirrors `[data-sf=footer]` in design-system/posta/styleframe/landing.html.
 *
 * The legal identity comes from lib/company.ts, never typed here: one source of truth for the entity name,
 * registration number and VAT status, so a stale detail cannot survive in one place and not another.
 */
const links = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/refund', label: 'Refund' },
  { href: '/contact', label: 'Contact' },
  { href: '/cookies', label: 'Cookies' },
];

export default function FooterSection() {
  return (
    <footer className="ps-footer ps-deep" data-sf="footer">
      <div className="ps-wrap ps-stack ps-gap-24">
        <p className="ps-small">
          {/* legalFooterLine() already names the entity AND its registration number. The old footer appended
              both again, so the page said "Digital Wave Tech (Pty) Ltd, registration 2026/809312/07" twice in
              one sentence. One entity, stated once. */}
          {legalFooterLine()} Not VAT registered. {companyAddressLine()}.
        </p>
        <nav className="ps-footer-nav" data-sf="footer-nav">
          {links.map((l) => (
            <Link href={l.href} key={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <hr className="ps-rule" />
        <p className="ps-caption" style={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
