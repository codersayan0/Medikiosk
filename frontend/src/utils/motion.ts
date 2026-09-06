import type { Transition, Variants } from "framer-motion";

/**
 * MEDIKIOSK DASHBOARD MOTION SYSTEM
 * Single source of truth for every hover state, page transition, and
 * loading animation across the patient (and shared doctor/admin) dashboard
 * shell. Tone target: healthcare SaaS — subtle, fast, purposeful. Nothing
 * here should bounce, spin excessively, or feel playful. Reuse these
 * tokens/variants directly instead of hand-rolling bespoke values per
 * component so the whole app reads as one considered motion system.
 *
 * Duration scale:
 *   micro    120-150ms  hover / press feedback
 *   small    180-220ms  dropdown open, tab switch, small UI transitions
 *   entrance 250-350ms  page / section entrances
 * Nothing in this app should take longer than ~400ms.
 */

/** Standard entrance curve — for things appearing/entering. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** Snappier curve for hover/press feedback. */
export const EASE_SNAPPY = "easeOut" as const;

export const DURATION = {
  micro: 0.14,
  small: 0.2,
  entrance: 0.28,
} as const;

export const microTransition: Transition = { duration: DURATION.micro, ease: EASE_SNAPPY };
export const smallTransition: Transition = { duration: DURATION.small, ease: EASE_OUT };
export const entranceTransition: Transition = { duration: DURATION.entrance, ease: EASE_OUT };

/** Cards/sections entering the viewport or mounting on page load. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: entranceTransition },
};

/** Wrap a list/grid in this, then give each child `staggerItem`. */
export const staggerContainer = (stagger = 0.045, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: smallTransition },
};

/** Route/page-level entrance — one connected app, not static screens. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: entranceTransition },
  exit: { opacity: 0, transition: { duration: DURATION.micro, ease: EASE_SNAPPY } },
};

/** Hover state for clickable/navigable cards (stat cards, quick-action tiles, list rows). */
export const hoverLiftProps = {
  whileHover: { y: -2, boxShadow: "var(--mx-shadow-md)" },
  whileTap: { scale: 0.98 },
  transition: microTransition,
};

/** Press feedback for buttons. */
export const tapScale = { scale: 0.97 };

/** Dropdowns / popovers (notification bell, profile menu): fade + slide down ~4px. */
export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  show: { opacity: 1, y: 0, transition: smallTransition },
  exit: { opacity: 0, y: -4, transition: microTransition },
};

/** Toast/snackbar confirmations: consistent slide+fade in, fade out. */
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: smallTransition },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: microTransition },
};

/** Brief scale pulse for a badge/count when its value changes — not a shake. */
export const badgePulse: Variants = {
  initial: { scale: 1 },
  pulse: { scale: [1, 1.22, 1], transition: { duration: 0.32, ease: EASE_SNAPPY } },
};

/** No-op fallback so reduced-motion users get an instant, transform-free state. */
export const reducedFallback: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};
