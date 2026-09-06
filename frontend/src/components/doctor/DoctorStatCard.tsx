import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { BadgeTone } from "../../types";
import { MedicalIcon } from "../healthcare/MedicalIcon";
import { cn } from "../../utils/cn";
import { staggerItem, hoverLiftProps } from "../../utils/motion";

interface DoctorStatCardProps {
  icon: LucideIcon;
  tone?: BadgeTone;
  title: string;
  value: string | number;
  meta?: string;
  className?: string;
}

/**
 * Overview summary tile: icon chip + title + large value + supporting
 * trend/status text (e.g. "↑ 8 from yesterday", "Completed: 15"). Reuses
 * MedicalIcon for the icon chip so it stays visually consistent with
 * HealthStatusCard elsewhere in the app. Entrance is driven by the parent's
 * `staggerContainer` (see DoctorOverviewPage); hover gets a subtle lift.
 */
export function DoctorStatCard({ icon, tone = "green", title, value, meta, className }: DoctorStatCardProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : staggerItem}
      {...(prefersReducedMotion ? {} : hoverLiftProps)}
      className={cn(
        "flex flex-col gap-3 rounded-mx-lg border border-mx-border bg-mx-surface-raised p-4 shadow-mx-sm sm:p-5",
        className
      )}
    >
      <MedicalIcon icon={icon} tone={tone} />
      <div>
        <p className="text-xs font-semibold text-mx-ink-muted">{title}</p>
        <p className="font-display mt-1 text-2xl font-bold text-mx-ink">{value}</p>
        {meta && <p className="mt-1 text-xs font-medium text-mx-ink-muted">{meta}</p>}
      </div>
    </motion.div>
  );
}