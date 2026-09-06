import type { ReactNode } from "react";
import type { BadgeTone } from "../../types";
import { cn } from "../../utils/cn";

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-mx-surface-sunken text-mx-ink-soft",
  green: "bg-mx-green-soft text-mx-green-strong",
  purple: "bg-mx-purple-soft text-mx-purple",
  blue: "bg-mx-blue-soft text-mx-blue",
  danger: "bg-mx-danger-soft text-mx-danger",
  warning: "bg-mx-warning-soft text-mx-warning",
};

/** Small pill used for categories and light-weight status labels. */
export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONE_STYLES[tone],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
