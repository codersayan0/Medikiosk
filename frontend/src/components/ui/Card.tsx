import type { HTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";
import { hoverLiftProps } from "../../utils/motion";

// Omit handlers whose signatures framer-motion's motion.div redefines, so
// this still spreads cleanly onto a motion component when interactive.
type NativeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface CardProps extends NativeDivProps {
  padded?: boolean;
  interactive?: boolean;
}

const BASE_CLASSES = "rounded-mx-lg border border-mx-border bg-mx-surface-raised shadow-mx-sm";

/**
 * Base surface for grouped content. Compact by default per the reference
 * language.
 *
 * Motion: purely informational cards (the default) get no hover motion —
 * don't add motion to things that don't do anything. `interactive` cards
 * (stat tiles, quick-action tiles, navigable rows) get `hoverLift` (a
 * subtle -2px lift + deeper shadow) and a `tapScale` press state.
 */
export function Card({ padded = true, interactive = false, className, children, ...rest }: CardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!interactive) {
    return (
      <div className={cn(BASE_CLASSES, padded && "p-4 sm:p-5", className)} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(BASE_CLASSES, "cursor-pointer", padded && "p-4 sm:p-5", className)}
      {...(prefersReducedMotion ? {} : hoverLiftProps)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3 className={cn("font-display text-base font-bold text-mx-ink", className)} {...rest}>
      {children}
    </h3>
  );
}
