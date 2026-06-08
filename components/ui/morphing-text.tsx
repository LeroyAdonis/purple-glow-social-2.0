'use client';

/**
 * MorphingText Component
 * Flips through an array of words with enter/exit animations using
 * framer-motion AnimatePresence. Great for hero: flips between
 * 'SOCIAL', '11 LANGUAGES', 'YOUR BRAND', etc.
 *
 * Props:
 *   words     - array of strings to cycle through
 *   className - additional classes for the text
 *   duration  - time in ms between word switches (default: 3000)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MorphingTextProps {
  words: string[];
  className?: string;
  duration?: number;
}

const variants = {
  enter: {
    y: 20,
    opacity: 0,
    filter: 'blur(4px)',
  },
  center: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: {
    y: -20,
    opacity: 0,
    filter: 'blur(4px)',
  },
};

export default function MorphingText({
  words,
  className,
  duration = 3000,
}: MorphingTextProps) {
  const [index, setIndex] = useState(0);

  const nextWord = useCallback(() => {
    setIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(nextWord, duration);
    return () => clearInterval(interval);
  }, [duration, nextWord, words.length]);

  if (words.length === 0) return null;

  return (
    <span className={cn('relative inline-block', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
            filter: { duration: 0.3 },
          }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
