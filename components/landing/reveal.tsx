'use client';
import React, { useEffect, useRef } from 'react';

export default function Reveal({ children, delay = 0, className = '', style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Safety net, and the reason it exists: the inspector measures 1.2s after load and reported the h1 as
    // having no size, plus four feature headings 100% hidden at the second screen. A reveal that depends on
    // an observer firing is a reveal that can leave real content invisible — so everything reveals on a
    // timer as well, and content is never allowed to stay hidden because a callback did not run.
    const settle = window.setTimeout(() => el.classList.add('in'), 900);
    if (typeof IntersectionObserver === 'undefined') { el.classList.add('in'); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('in'), delay);
          io.unobserve(el);
        }
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => { window.clearTimeout(settle); io.disconnect(); };
  }, [delay]);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>;
}
