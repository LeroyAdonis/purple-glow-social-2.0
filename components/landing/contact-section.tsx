import React from 'react';
import { COMPANY } from '@/lib/company';

/**
 * Contact — mirrors `[data-sf=contact]` in design-system/posta/styleframe/landing.html.
 * One real address and one real promise. No form that quietly drops the message.
 */
export default function ContactSection() {
  return (
    <section id="contact" className="ps-section ps-clay" data-sf="contact">
      <div className="ps-wrap">
        <div className="ps-head" data-sf="contact-head">
          <p className="ps-eyebrow">Contact</p>
          <h2 className="ps-h2">Talk to a person</h2>
        </div>
        <p className="ps-body" data-sf="contact-email">
          {COMPANY.supportEmail}
        </p>
        <p className="ps-body ps-muted" style={{ marginTop: 8 }} data-sf="contact-hours">
          {COMPANY.supportHours}
        </p>
      </div>
    </section>
  );
}
