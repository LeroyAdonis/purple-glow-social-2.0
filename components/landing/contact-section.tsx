import '@/design-system/posta/tokens.css';
import React from 'react';
import { COMPANY } from '@/lib/company';

export default function ContactSection() {
  return (
    <section id="contact" style={{ background: 'var(--posta-clay)', color: 'var(--posta-cream)', padding: '64px 16px' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-h2)', marginBottom: 16 }}>
          Contact
        </h2>
        <p style={{ fontSize: 'var(--text-body)', marginBottom: 8 }}>
          {COMPANY.supportEmail}
        </p>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.85 }}>
          {COMPANY.supportHours}
        </p>
      </div>
    </section>
  );
}