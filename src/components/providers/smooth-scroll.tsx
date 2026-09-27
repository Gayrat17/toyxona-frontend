'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScrollProvider
 * Initialises Lenis for high-performance, responsive inertia scrolling.
 * Exposes global window.lenis for instant programmatic scrolls and resets.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis;
    }

    let raf: number;
    function onFrame(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(onFrame);
    }
    raf = requestAnimationFrame(onFrame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      if (typeof window !== 'undefined') {
        delete (window as any).lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
