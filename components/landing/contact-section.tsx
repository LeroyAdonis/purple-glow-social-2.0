'use client';
import React from 'react';
import Link from 'next/link';
import '@/components/landing/board.css';
import Reveal from './reveal';

const widths = [112, 150, 225]; // 3:4, 1:1, 3:2 of 150px height
const photos = [
  '/photos/01-adderley-street-flower-sellers-cape-town.jpg',
  '/photos/02-greenmarket-cape-town-p1050987-jpg.jpg',
  '/photos/03-nomonde-tuck-shop-jpg.jpg',
  '/photos/04-spaza-shop-cathedral-peak-kwazulu-natal-.jpg',
  '/photos/05-local-bakery-awesome-bread-5229115656-jp.jpg',
  '/photos/06-waiting-for-fresh-bread-5228521457-jpg.jpg',
  '/photos/07-an-informal-hair-salon-yeoville-2015-jpg.jpg',
  '/photos/08-nelly-s-hair-salon-internet-cafe-jpg.jpg',
  '/photos/09-street-vendor-joubert-street-johannesbur.jpg',
];

export default function ContactSection() {
  return (
    <section id="contact" data-sf="contact" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', minHeight: '80vh', padding: '48px 0 0', overflow: 'hidden' }}>
      {/* photo strip */}
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div className="marquee">
          {[...photos, ...photos].map((p, i) => {
            const w = widths[i % 3];
            return (
              <div key={i} style={{ width: w, height: 150, flex: 'none', overflow: 'hidden' }}>
                <img src={p} alt=""  width={w} height={150} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Constrained to the same measure as the rest of the board: edge-to-edge here left 2050px of nothing
          between the heading and the form at 1440px (inspector: empty-middle). */}
      <div style={{ padding: '72px 16px 0', maxWidth: 1100, margin: '0 auto' }}>
        {/* The heading and the reply promise share one row, so the line between the measure's two
            edges is closed on both sides — the inspector failed this section when the heading sat
            alone on the left with the form's full width only underneath it. */}
        <Reveal delay={0}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, auto)', gap: 24, alignItems: 'end', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'var(--step-head)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.9, margin: 0, maxWidth: '20ch' }}>Talk to a person</h2>
            <p style={{ fontSize: 'var(--step-body)', margin: 0, maxWidth: '34ch', justifySelf: 'end' }}>We reply within one working day. Or email hello@posta.co.za</p>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
          <input className="contact-field" placeholder="Your name" aria-label="Your name" />
          <input className="contact-field" placeholder="Your email" aria-label="Your email" type="email" />
          <Link href="/contact" className="contact-field contact-submit" style={{ textDecoration: 'none' }}>Send</Link>
        </div>
      </div>
    </section>
  );
}
