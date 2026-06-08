'use client';

/**
 * FadeIn Component
 * Reusable scroll-triggered entrance animation using framer-motion's useInView.
 * Wraps children in a motion.div that fades in from a specified direction.
 *
 * Props:
 *   direction - 'up' | 'down' | 'left' | 'right' (default: 'up')
 *   delay     - delay in seconds before animation starts (default: 0)
 *   duration  - animation duration in seconds (default: 0.6)
 *   className - additional classes for the wrapper
 *   once      - whether animation triggers only once (default: true)
 *   distance  - pixel distance for the translate offset (default: 40)
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  distance?: number;
}

const directionMap = {
  up: { y: 1, x: 0 },
  down: { y: -1, x: 0 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export default function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  distance = 40,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const dir = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: dir.x * distance,
        y: dir.y * distance,
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: dir.x * distance, y: dir.y * distance }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
