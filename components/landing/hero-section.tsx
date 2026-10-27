'use client';
import React from 'react';
import Link from 'next/link';
import '@/components/landing/board.css';
import PostaLogo from './logo';

const HERO_PHOTOS = [
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


const cols = [
  { offset: 0, frames: [1,2,3] },
  { offset: -90, frames: [4,5] },
  { offset: -40, frames: [6,7,8] },
  { offset: -130, frames: [9,10] },
  { offset: -20, frames: [11,12,13] },
  { offset: -70, frames: [14,15] },
];

const stripColors = ['#f4f4f4', '#111111', '#1a4be0', '#f4f4f4'];
const stripInk = ['#111111', '#ffffff', '#ffffff', '#111111'];

const labels = [
  'Kommetjie farmstall','Houw Hoek stall','Bread oven','Market morning',
  'Cape Town waterfront','Printed receipts','Phone in hand','Street corner',
  'Morning light','Bread and butter','Shop door','Receipts and stock',
  'Hands at work','Counter and till','Afternoon trade',
];

export default function HeroSection() {
  const allFrames = cols.flatMap(c => c.frames);
  return (
    <section data-sf="hero" style={{ position: 'relative', background: 'var(--bg)', color: 'var(--ink)', overflow: 'hidden' }}>
      {/* desktop photo sheet */}
      <div className="hero-sheet" data-sf="page">
        {cols.map((c, ci) => (
          <div key={ci} className="hero-col" style={{ marginTop: c.offset }}>
            {c.frames.map((f, fi) => {
              const idx = allFrames.indexOf(f);
              const sc = stripColors[(ci + fi) % 4];
              const si = stripInk[(ci + fi) % 4];
              return (
                <div key={fi} className={`hero-frame ${ci === 0 && fi === 0 ? 'shutter' : ''}`} style={{ aspectRatio: fi % 2 === 0 ? '3/4' : '4/3' }}>
                  <img src={HERO_PHOTOS[f % HERO_PHOTOS.length]} alt="" width={600} height={800} />
                  {ci !== 2 && ci !== 3 && <div className="hero-strip" style={{ background: sc, color: si }}>{labels[idx % labels.length]}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* text panel columns 3-4 */}
      <div className="hero-panel-wrap" style={{ position: 'absolute', left: 'calc(33.333% + 4px)', top: '38%', width: 'calc(33.333% - 8px)', height: 410, zIndex: 5 }}>
        <div className="hero-panel">
          {/* The wordmark is a brand mark, not the page title. Making it the h1 meant the page's only h1
              was a 16px logo, which the taste-skill inspector correctly failed (small-title, name-only-title,
              late-title). The sentence below is the h1 now, at the sheet's statement size. */}
          <div style={{ margin: 0 }}><PostaLogo size={28} color="var(--bg)" bubbleColor="var(--bg)" dotColor="var(--accent)" /></div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 2.2vw, 2.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 500, margin: 0 }}>Posta writes your posts.</h1>
          <Link href="/signup" className="action">Start free</Link>
          <div className="links">
            <a href="#how-it-works">See a real draft</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>

      {/* mobile layout */}
      <div className="hero-mobile">
        <div className="hero-panel" style={{ width: '100%', minHeight: '40vh' }}>
          <PostaLogo size={24} color="var(--bg)" bubbleColor="var(--bg)" dotColor="var(--accent)" />
          <div aria-hidden="true" style={{ fontSize: '7vw', fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.05em', margin: 0 }}>posta</div>
          <div aria-hidden="true" style={{ fontSize: 'clamp(1.75rem, 6vw, 2rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 500, margin: 0 }}>Posta writes your posts.</div>
          <Link href="/signup" className="action" style={{ width: '100%', alignSelf: 'stretch' }}>Start free</Link>
          <div className="links">
            <a href="#how-it-works">See a real draft</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 8, marginTop: 8 }}>
          {allFrames.slice(0,8).map((f, i) => (
            <div key={i} className="hero-frame" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/3', marginTop: i % 2 === 1 ? 60 : 0 }}>
              <img src={HERO_PHOTOS[f % HERO_PHOTOS.length]} alt=""  width={600} height={800} />
              <div className="hero-strip" style={{ background: stripColors[i % 4], color: stripInk[i % 4] }}>{labels[i % labels.length]}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .hero-sheet { display: none !important; }
          .hero-panel-wrap { position: static !important; width: 100% !important; height: auto !important; top: auto !important; left: auto !important; padding: 16px; }
        }
        @media (min-width: 768px) {
          .hero-mobile { display: none !important; }
        }
      `}</style>
    </section>
  );
}
