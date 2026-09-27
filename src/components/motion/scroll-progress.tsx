'use client';

import { useScroll, useSpring, motion } from 'framer-motion';

/**
 * ScrollProgressBar
 * A thin, fixed accent bar at the very top of the viewport that fills
 * in proportion to document scroll depth. Uses useSpring for a
 * slightly damped, smooth trail effect.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #b08d4f 0%, #ecd49c 50%, #cda964 100%)',
      }}
    />
  );
}
