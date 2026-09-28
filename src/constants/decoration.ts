/**
 * Shared decorative SVG patterns and animation constants.
 * Centralized here to avoid duplication across login/register/home pages.
 */

/** Ornamental star-lattice SVG used as background overlay on dark panels. */
export const STAR_LATTICE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")";

/** Scroll-driven scale animation keyframes for marquee rows. */
export const MARQUEE_SCROLL_INPUT: number[]   = [0, 0.45, 0.75, 1];
export const MARQUEE_SCALE_OUTPUT: number[]   = [0.88, 1, 1.02, 1.04];
export const MARQUEE_OPACITY_INPUT: number[]  = [0, 0.35, 0.75, 1];
export const MARQUEE_OPACITY_OUTPUT: number[] = [0.35, 1, 1, 0.35];

/** Spring config for smooth scroll-driven animations. */
export const SMOOTH_SPRING = { stiffness: 200, damping: 25, restDelta: 0.001 } as const;

/** Standard ease curve used across page transitions. */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
