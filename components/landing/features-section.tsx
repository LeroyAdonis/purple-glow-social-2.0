'use client';
import React from 'react';
import '@/components/landing/board.css';
import Reveal from './reveal';

const langs = ['Zulu','Xhosa','Afrikaans','English','Northern Sotho','Tswana','Southern Sotho','Tsonga','Swati','Venda','Ndebele'];

export default function FeaturesSection() {
  return (
    <section id="features" data-sf="features" style={{ background: 'var(--bg)', color: 'var(--ink)', padding: '120px 0 0' }}>
      <div className="board" data-sf="features-grid">
        <Reveal delay={0} className="tile tile--ink tile-span-6 tile-row-2">
          <h2 style={{ fontSize: 'var(--step-head)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.9, margin: 0 }}>What Posta does</h2>
          <p style={{ fontSize: 'var(--step-body)', marginTop: 16, maxWidth: '40ch' }}>Posta writes your social posts. You read them. You say yes. It posts.</p>
        </Reveal>
        <Reveal delay={60} className="tile tile-span-3 tile-row-2 tile--photo">
          <img src="/photos/03-nomonde-tuck-shop-jpg.jpg" alt="A spaza shop counter in KwaZulu-Natal"  width={600} height={800} className="movepic" />
        </Reveal>
        <Reveal delay={120} className="tile tile-span-3 tile-row-2 tile--photo">
          <img src="/photos/05-local-bakery-awesome-bread-5229115656-jp.jpg" alt="Fresh bread out of a small bakery oven"  width={600} height={800} />
        </Reveal>
        <Reveal delay={60} className="tile tile-span-4 tile-row-2">
          <h3 style={{ fontSize: 'var(--step-lead)', fontWeight: 500, margin: 0 }}>Writes in 11 languages</h3>
          <p style={{ fontSize: 'var(--step-body)', marginTop: 12, color: 'var(--muted)', maxWidth: '60ch' }}>{langs.join(', ')}.</p>
        </Reveal>
        <Reveal delay={120} className="tile tile-span-4 tile-row-2">
          <h3 style={{ fontSize: 'var(--step-lead)', fontWeight: 500, margin: 0 }}>Four platforms</h3>
          <p style={{ fontSize: 'var(--step-body)', marginTop: 12, color: 'var(--muted)' }}>Instagram, Facebook, X and LinkedIn from one screen.</p>
        </Reveal>
        <Reveal delay={180} className="tile tile-span-4 tile-row-2 tile--accent">
          <h3 style={{ fontSize: 'var(--step-lead)', fontWeight: 500, margin: 0 }}>You approve every post</h3>
          <p style={{ fontSize: 'var(--step-body)', marginTop: 12 }}>Nothing is published without your yes.</p>
        </Reveal>
        <Reveal delay={60} className="tile tile-span-6 tile-row-2">
          <h3 style={{ fontSize: 'var(--step-lead)', fontWeight: 500, margin: 0 }}>Schedule ahead</h3>
          <p style={{ fontSize: 'var(--step-body)', marginTop: 12 }}>Pick a day and time in SAST. Posta handles the rest.</p>
        </Reveal>
        <Reveal delay={120} className="tile tile-span-6 tile-row-2 tile--photo">
          <img src="/photos/09-street-vendor-joubert-street-johannesbur.jpg" alt="A street vendor on Joubert Street, Johannesburg"  width={1200} height={600} />
        </Reveal>
        <Reveal delay={60} className="tile tile-span-6 tile-row-2">
          <p style={{ fontSize: 'var(--step-lead)', fontWeight: 500, margin: 0 }}>A real draft</p>
          <p style={{ fontSize: 'var(--step-body)', marginTop: 12 }}>&ldquo;Isinkwa esisha siphuma ngo-7. Woza masinyane &mdash; amavetkoek aphela ngokushesha.&rdquo;</p>
          <p style={{ fontSize: 'var(--step-small)', marginTop: 8, color: 'var(--muted)' }}>Zulu draft for a bakery.</p>
        </Reveal>
      </div>
    </section>
  );
}
