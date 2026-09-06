import type { LucideIcon } from "lucide-react";
import type { BadgeTone, StatusTone } from "../../types";
import { MedicalIcon } from "./MedicalIcon";
import { StatusBadge } from "../ui/StatusBadge";
import { cn } from "../../utils/cn";

interface HealthStatusCardProps {
  icon: LucideIcon;
  tone?: BadgeTone;
  title: string;
  value: string;
  meta?: string;
  status?: StatusTone;
  className?: string;
}

/**
 * Compact tile for a single vital, record type, or quick-access item —
 * the small icon+label+value cards seen throughout the reference
 * dashboards ("My Timeline", "AYUSH Mode", "Previous Visits", etc.).
 */
export function HealthStatusCard({ icon, tone = "green", title, value, meta, status, className }: HealthStatusCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-mx-lg border border-mx-border bg-mx-surface-raised p-4 shadow-mx-sm transition-shadow hover:shadow-mx-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <MedicalIcon icon={icon} tone={tone} />
        {status && <StatusBadge tone={status} />}
      </div>
      <div>
        <p className="text-xs font-semibold text-mx-ink-muted">{title}</p>
        <p className="font-display mt-0.5 text-lg font-bold text-mx-ink">{value}</p>
        {meta && <p className="mt-0.5 text-xs text-mx-ink-muted">{meta}</p>}
      </div>
    </div>
  );
}
