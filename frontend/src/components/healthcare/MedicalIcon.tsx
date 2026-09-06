import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CircleHelp,
} from "lucide-react";

import type { BadgeTone } from "../../types";
import { cn } from "../../utils/cn";

interface MedicalIconProps {
  icon?: LucideIcon;
  tone?: BadgeTone;
  size?: number;
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

export function MedicalIcon({
  icon: Icon,
  tone = "green",
  size = 20,
  className,
}: MedicalIconProps) {
  const SafeIcon = Icon ?? CircleHelp;

  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-mx-md",
        TONE_STYLES[tone],
        className,
      )}
    >
      <SafeIcon size={size} aria-hidden="true" />
    </span>
  );
}