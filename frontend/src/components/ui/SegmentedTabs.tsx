import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";
import { smallTransition } from "../../utils/motion";

export interface SegmentedTab<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  /** Distinct layoutId per instance so multiple tab bars on one screen don't share an indicator. */
  layoutGroupId?: string;
}

/**
 * Pill-style filter bar reused across Lab Reports, Documents, and My
 * Visits — the category/status tab rows in the reference designs. Kept
 * generic over the tab id union so each page gets full type safety on
 * its own filter values.
 *
 * Motion: the active pill's background slides to the newly selected tab
 * via a shared `layoutId` rather than snapping — same small-transition
 * timing used for dropdowns/tab switches elsewhere. Reduced-motion users
 * get an instant swap with no shared-layout animation.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
  layoutGroupId = "segmented-tabs",
}: SegmentedTabsProps<T>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              isActive ? "text-mx-ink-inverse" : "text-mx-ink-soft hover:bg-mx-border"
            )}
          >
            {isActive && (
              prefersReducedMotion ? (
                <span className="absolute inset-0 rounded-full bg-mx-green" aria-hidden="true" />
              ) : (
                <motion.span
                  layoutId={`${layoutGroupId}-indicator`}
                  className="absolute inset-0 rounded-full bg-mx-green"
                  transition={smallTransition}
                  aria-hidden="true"
                />
              )
            )}
            {!isActive && <span className="absolute inset-0 rounded-full bg-mx-surface-sunken" aria-hidden="true" />}
            <span className="relative">
              {tab.label}
              {tab.count !== undefined && <span className="ml-1 opacity-80">({tab.count})</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
