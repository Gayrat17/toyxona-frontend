'use client';

import { useState, useEffect } from 'react';
import { useScroll, useSpring, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * ScrollProgressBar
 * A thin, fixed accent bar at the very top of the viewport that fills
 * in proportion to document scroll depth. Uses useSpring for a
 * slightly damped, smooth trail effect.
 */
export function ScrollProgressBar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #b08d4f 0%, #ecd49c 50%, #cda964 100%)',
      }}
    />
  );
}
