'use client';
import React from 'react';
import '@/components/landing/board.css';
import Reveal from './reveal';

const stages = [
  { dur: 'Two minutes', clause: 'Tell Posta the topic', grow: 1, color: '#f4f4f4', ink: '#111111' },
  { dur: 'About a day', clause: 'Posta writes the drafts', grow: 4, color: '#1a4be0', ink: '#ffffff' },
  { dur: 'You decide', clause: 'Approve and schedule', grow: 2, color: '#111111', ink: '#ffffff' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" data-sf="how" style={{ background: 'var(--bg)', color: 'var(--ink)', padding: '120px 16px 0' }}>
      <Reveal delay={0}>
        <h2 style={{ fontSize: 'clamp(48px, 6.4vw, 104px)', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.9, margin: '0 0 64px', marginLeft: 12 }}>How it works</h2>
      </Reveal>
      <div className="stages-bar" data-ui data-sf="steps">
        {stages.map((s, i) => (
          <div key={i} className="seg" style={{ flexGrow: s.grow, background: s.color, color: s.ink }}>
            <div className="dur">{s.dur}</div>
            <div className="clause">{s.clause}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, paddingLeft: 12, fontSize: 'var(--step-body)', color: 'var(--muted)', maxWidth: '60ch' }}>
        Tell Posta the topic. Read the drafts. Approve and schedule.
      </div>
    </section>
  );
}
