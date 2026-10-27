import React from 'react';
import Link from 'next/link';
import { COMPANY, companyAddressLine, legalFooterLine } from '@/lib/company';
import '@/components/landing/board.css';

const links = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/refund', label: 'Refund' },
  { href: '/contact', label: 'Contact' },
  { href: '/cookies', label: 'Cookies' },
];

export default function FooterSection() {
  return (
    <footer data-sf="footer" style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '16px' }}>
      <div className="board" style={{ padding: 0 }}>
        <div className="tile tile--ink tile-span-6" style={{ background: 'transparent', color: 'var(--bg)' }}>
          <p style={{ fontSize: 'var(--step-head)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.9, margin: 0 }}>posta</p>
        </div>
        <div className="tile tile--ink tile-span-6" style={{ background: 'transparent', color: 'var(--bg)' }}>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-end' }} data-sf="footer-nav">
            {links.map((l) => (
              <Link key={l.href} href={l.href} style={{ color: 'var(--bg)', fontSize: 'var(--step-small)', textDecoration: 'underline', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{l.label}</Link>
            ))}
          </nav>
          <p style={{ fontSize: 'var(--step-small)', margin: '8px 0 0', opacity: 0.75 }}>
            Photographs: Wikimedia Commons contributors (CC BY / CC BY-SA).{' '}
            <a href="/photo-credits.txt" style={{ color: 'inherit', textDecoration: 'underline' }}>Credits</a>
          </p>
        </div>
        <div className="tile tile--ink tile-span-12" style={{ background: 'transparent', color: 'var(--bg)', paddingTop: 0 }}>
          <p style={{ fontSize: 'var(--step-small)', margin: 0, opacity: 0.8 }}>{legalFooterLine()} Not VAT registered. {companyAddressLine()}.</p>
          <p style={{ fontSize: 'var(--step-small)', margin: '8px 0 0', opacity: 0.6 }}>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
          <p style={{ fontSize: 'var(--step-small)', margin: '4px 0 0', opacity: 0.5 }}>Photographs: picsum.photos (see .taste-skill/CREDITS.md).</p>
        </div>
      </div>
    </footer>
  );
}
