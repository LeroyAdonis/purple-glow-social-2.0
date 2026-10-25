'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Pricing — mirrors `[data-sf=pricing]` in design-system/posta/styleframe/landing.html.
 *
 * Honesty rules baked into the copy: the prices are the real plan prices, "No VAT" is true because Digital Wave
 * Tech is not VAT registered, and credits are described as spent on publish because that is when they are.
 * A price card that promises a capability we do not have is a refund waiting to happen.
 */
const plans = [
  { name: 'Free', price: 'R0', note: '10 credits, 5 scheduled posts', cta: 'Start free', variant: 'quiet' },
  { name: 'Pro', price: 'R299', note: '500 credits, 50 scheduled posts, 5 automation rules', cta: 'Choose Pro', variant: 'ink' },
  { name: 'Business', price: 'R999', note: '2000 credits, 200 scheduled posts, 20 automation rules', cta: 'Choose Business', variant: 'quiet' },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="ps-section ps-paper" data-sf="pricing">
      <div className="ps-wrap">
        <div className="ps-head" data-sf="pricing-head">
          <p className="ps-eyebrow">Pricing</p>
          <h2 className="ps-h2">Pay in rands, cancel any time</h2>
          <p className="ps-lead ps-muted">
            No VAT — R299 is R299. Credits are spent only when a post actually publishes.
          </p>
        </div>
        <div className="ps-grid-3" data-sf="pricing-grid">
          {plans.map((p) => (
            <article className="ps-card ps-card--full" data-sf="price-card" key={p.name}>
              <h3 className="ps-h3">{p.name}</h3>
              <p className="ps-price">
                {p.price}
                <span> /month</span>
              </p>
              <p className="ps-small ps-muted">{p.note}</p>
              <Link
                href="/signup"
                className={`ps-pill ps-pill--${p.variant} ps-pill--sm`}
                style={{ marginTop: 'auto' }}
              >
                {p.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
