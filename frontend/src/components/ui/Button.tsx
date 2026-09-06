import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";
import { microTransition, tapScale } from "../../utils/motion";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

// Omit handlers whose signatures framer-motion's motion.button redefines,
// so this still spreads cleanly onto a motion component.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-mx-green text-mx-ink-inverse hover:bg-mx-green-strong active:bg-mx-green-strong disabled:bg-mx-border",
  secondary:
    "bg-mx-blue-soft text-mx-blue hover:bg-mx-blue hover:text-mx-ink-inverse disabled:bg-mx-surface-sunken disabled:text-mx-ink-muted",
  outline:
    "bg-transparent text-mx-ink border border-mx-border-strong hover:bg-mx-surface-sunken hover:shadow-mx-sm disabled:text-mx-ink-muted disabled:hover:shadow-none",
  ghost: "bg-transparent text-mx-ink-soft hover:bg-mx-surface-sunken disabled:text-mx-ink-muted",
  danger: "bg-mx-danger text-mx-ink-inverse hover:opacity-90 disabled:bg-mx-border",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-mx-sm",
  md: "h-11 px-5 text-sm gap-2 rounded-mx-md",
  lg: "h-12 px-6 text-base gap-2.5 rounded-mx-md",
};

/**
 * Base action control used across patient, doctor, and admin surfaces.
 * Minimum height of 36px (sm) and 44px+ (md/lg) keeps touch targets
 * comfortable for elderly and stressed users on mobile.
 *
 * Motion: hover transitions background/border/shadow (~150ms, CSS) and
 * press gives a subtle `tapScale`. Disabled/loading buttons get neither —
 * only the reduced opacity from the disabled styles above.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    isLoading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref
) {
  const prefersReducedMotion = useReducedMotion();
  const isInert = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      disabled={isInert}
      whileTap={!isInert && !prefersReducedMotion ? tapScale : undefined}
      transition={microTransition}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-[background-color,border-color,box-shadow,color,opacity] duration-150 ease-out disabled:cursor-not-allowed",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </motion.button>
  );
});
