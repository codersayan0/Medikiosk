import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { EmptyState } from "../../ui/EmptyState";
import type { DistributionSlice } from "../../../utils/analytics";

interface DistributionBarListProps {
  slices: DistributionSlice[];
  ariaLabel: string;
}

/**
 * Same horizontal animated-bar pattern as the "Verification statistics"
 * section on AdminOverviewPage.tsx — reused here rather than introducing a
 * new visual style for demographic breakdowns.
 */
export function DistributionBarList({ slices, ariaLabel }: DistributionBarListProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <EmptyState
        compact
        icon={<Users size={20} aria-hidden="true" />}
        title="No patient data for this range"
        description="Try selecting a wider date range."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4" role="img" aria-label={ariaLabel}>
      {slices.map((row) => {
        const percent = total ? Math.round((row.value / total) * 100) : 0;
        return (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-mx-ink-soft">
              <span>{row.label}</span>
              <span>
                {row.value} <span className="font-normal text-mx-ink-muted">({percent}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-mx-surface-sunken">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ backgroundColor: row.colorVar }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}