import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ElementType } from "react";
import type { ReactNode } from "react";
import { FadeIn, VIEWPORT, reducedFallback } from "./motion";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: Variants;
  as?: ElementType;
  className?: string;
  delay?: number;
  amount?: number;
  id?: string;
}

/**
 * Fires a variant once an element scrolls into view. Falls back to a plain,
 * static render for anyone who has asked their OS for reduced motion —
 * content still appears, it just doesn't move to get there.
 */
export function ScrollReveal({ children, variant = FadeIn, as = "div", className, delay = 0, amount, id }: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as as "div"] ?? motion.div;

  return (
    <MotionTag
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { ...VIEWPORT, amount } : VIEWPORT}
      variants={prefersReducedMotion ? reducedFallback : variant}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
}

/** Parent wrapper — pair with <StaggerItem> children for a staggered reveal group. */
export function StaggerGroup({ children, className, as = "div", stagger = 0.12, delayChildren = 0, amount }: StaggerGroupProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as as "div"] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={amount ? { ...VIEWPORT, amount } : VIEWPORT}
      variants={
        prefersReducedMotion
          ? reducedFallback
          : { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren } } }
      }
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, className, variant = FadeIn, as = "div" }: { children: ReactNode; className?: string; variant?: Variants; as?: ElementType }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as as "div"] ?? motion.div;
  return (
    <MotionTag className={className} variants={prefersReducedMotion ? reducedFallback : variant}>
      {children}
    </MotionTag>
  );
}
