import type { Variants } from "framer-motion";

/**
 * MEDIKIOSK ANIMATION SYSTEM
 * A small, named set of motion patterns reused across every homepage section
 * so the page reads as one considered piece of motion design instead of
 * scattered per-section effects. Everything here is intentionally gentle:
 * long-ish durations, soft easing, small travel distances.
 */

const EASE = [0.16, 1, 0.3, 1] as const; // expo-out — premium, no bounce

export const FadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

export const SlideUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const SlideUpLarge: Variants = {
  hidden: { opacity: 0, y: 56 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export const ScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

export const StaggerChildren = (stagger = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Reveals a heading word-by-word. Split the string on spaces before mapping to spans. */
export const WordReveal: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const wordContainer = (stagger = 0.055, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Used for the AI-assistant → structured-record product transitions. */
export const ProductTransition: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: -14, scale: 0.98, transition: { duration: 0.35, ease: EASE } },
};

export const reducedFallback: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

/** Standard viewport config for scroll-triggered reveals — fires a bit before center. */
export const VIEWPORT = { once: true, amount: 0.35, margin: "0px 0px -10% 0px" };
