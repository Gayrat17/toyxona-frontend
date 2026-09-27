'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  /** Stagger delay between each child (seconds) */
  staggerDelay?: number;
  /** Initial delay before the first child animates */
  initialDelay?: number;
  /** Forwarded className */
  className?: string;
  /** Viewport margin that triggers stagger */
  margin?: string;
}

const containerVariants = (staggerDelay: number, initialDelay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
});

export const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/**
 * StaggerContainer
 * Orchestrates staggered entrance animations for its direct children.
 * Wrap each child in <StaggerItem> to participate in the stagger.
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  className = '',
  margin = '-80px',
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants(staggerDelay, initialDelay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem
 * Each direct child of StaggerContainer should be wrapped in this.
 */
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
