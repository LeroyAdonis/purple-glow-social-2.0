import '@/design-system/posta/tokens.css';
import React from 'react';
import Link from 'next/link';
import { COMPANY, legalFooterLine } from '@/lib/company';

export default function FooterSection() {
  return (
    <footer
      style={{
        background: 'var(--posta-clay-deep)',
        color: 'var(--posta-cream)',
        padding: '48px 16px',
      }}
    >
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.045em' }}>posta</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--posta-cream)', opacity: 0.85, maxWidth: '68ch' }}>
          {legalFooterLine()} {COMPANY.legalName}, reg {COMPANY.registrationNumber}, not VAT registered.
        </p>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14 }}>
          <Link href="/privacy" style={{ color: 'var(--posta-cream)', textDecoration: 'underline',
            minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'var(--posta-cream)', textDecoration: 'underline',
            minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Terms</Link>
          <Link href="/refund" style={{ color: 'var(--posta-cream)', textDecoration: 'underline',
            minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Refund</Link>
          <Link href="/contact" style={{ color: 'var(--posta-cream)', textDecoration: 'underline',
            minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Contact</Link>
          <Link href="/cookies" style={{ color: 'var(--posta-cream)', textDecoration: 'underline',
            minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Cookies</Link>
        </nav>
        <p style={{ fontSize: 12, color: 'var(--posta-cream)', opacity: 0.7 }}>
          © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}