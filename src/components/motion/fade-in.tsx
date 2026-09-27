'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  /** Delay in seconds before the animation starts */
  delay?: number;
  /** Y-axis offset to slide from (default: 28px) */
  y?: number;
  /** Additional class names forwarded to the wrapper div */
  className?: string;
  /** Margin from the viewport edge that triggers the animation */
  margin?: string;
}

/**
 * FadeIn
 * Wraps children in a motion.div that fades + slides up when entering the viewport.
 * Uses `once: true` so the animation only fires once per element.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 28,
  className = '',
  margin = '-100px',
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1], // custom ease-out-expo
      }}
    >
      {children}
    </motion.div>
  );
}
