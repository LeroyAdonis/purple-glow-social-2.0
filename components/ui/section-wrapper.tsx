'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionWrapperProps extends HTMLMotionProps<'section'> {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function SectionWrapper({ children, className = '', delay = 0, id, ...motionProps }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.section>
  );
}

interface FadeInDivProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInDiv({ children, className = '', delay = 0, ...motionProps }: FadeInDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
