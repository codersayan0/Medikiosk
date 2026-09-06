import { CheckCircle2, AlertTriangle, AlertOctagon, Clock, ShieldCheck } from "lucide-react";
import type { StatusTone } from "../../types";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

interface StatusBadgeProps {
  tone: StatusTone;
  label?: string;
  className?: string;
}

const TONE_CONFIG: Record<StatusTone, { icon: typeof CheckCircle2; classes: string; key: keyof ReturnType<typeof useTranslation>["t"]["status"] }> = {
  stable: { icon: CheckCircle2, classes: "bg-mx-green-soft text-mx-green-strong", key: "stable" },
  attention: { icon: AlertTriangle, classes: "bg-mx-warning-soft text-mx-warning", key: "attention" },
  critical: { icon: AlertOctagon, classes: "bg-mx-danger-soft text-mx-danger", key: "critical" },
  pending: { icon: Clock, classes: "bg-mx-surface-sunken text-mx-ink-soft", key: "pending" },
  verified: { icon: ShieldCheck, classes: "bg-mx-blue-soft text-mx-blue", key: "verified" },
};

/**
 * Clinical status indicator. Always pairs an icon + text label so meaning
 * never depends on color alone — important for colorblind users and for
 * decisions made under stress.
 */
export function StatusBadge({ tone, label, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = TONE_CONFIG[tone];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.classes,
        className
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {label ?? t.status[config.key]}
    </span>
  );
}
