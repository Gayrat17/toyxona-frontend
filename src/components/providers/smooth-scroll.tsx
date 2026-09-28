'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/**
 * SmoothScrollProvider
 * Initialises Lenis for high-performance, responsive inertia scrolling.
 * Exposes global window.lenis for instant programmatic scrolls and resets.
 * 
 * Automatically disables itself on /dashboard routes to allow native
 * container scrolling on dashboard layouts with fixed sidebars.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // If inside dashboard or nested admin routes, disable Lenis
    if (pathname?.startsWith('/dashboard')) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        if (typeof window !== 'undefined') {
          delete (window as any).lenis;
        }
      }
      return;
    }

    // Initialize Lenis for public marketing and venue browsing pages
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;

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
      lenisRef.current = null;
      if (typeof window !== 'undefined') {
        delete (window as any).lenis;
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
