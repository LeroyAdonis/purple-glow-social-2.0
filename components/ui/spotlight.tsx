'use client';

/**
 * Spotlight Component
 * A mouse-following radial gradient spotlight effect.
 * Creates a div with a large radial gradient that moves with the cursor.
 * Positioned absolute/inset-0 with pointer-events-none.
 *
 * Props:
 *   className - additional classes
 *   fill      - color for the spotlight (default: 'white')
 *   size      - diameter of the spotlight in px (default: 600)
 *   opacity   - opacity of the gradient (default: 0.08)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightProps {
  className?: string;
  fill?: string;
  size?: number;
  opacity?: number;
}

export default function Spotlight({
  className,
  fill = 'white',
  size = 600,
  opacity = 0.08,
}: SpotlightProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentPos = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        currentPos.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        setPosition({ ...currentPos.current });
      }
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${fill}, transparent ${size * 0.6}px)`,
          opacity,
        }}
      />
    </div>
  );
}
