import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PieChart } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "../../utils/cn";
import { useSimulatedLoad } from "../../hooks/useSimulatedLoad";
import { entranceTransition, microTransition } from "../../utils/motion";

export interface TodaysSummarySlice {
  label: string;
  value: number;
  /** Display percentage — may be pre-rounded to match a reporting total that isn't a strict sum of all slices (e.g. "Completed" overlaps the triage tiers rather than adding to them). */
  percent: number;
  colorVar: string;
}

interface TodaysSummaryDonutProps {
  slices: TodaysSummarySlice[];
  total: number;
  centerLabel?: string;
  size?: number;
}

const RADIUS = 60;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Today's Summary donut — today's patient mix across triage tiers plus how
 * many consultations are complete. Purely operational headcounts, no
 * financial data. Renders its own animated SVG ring (no chart library
 * dependency) with a floating tooltip, legend, loading skeleton, and
 * empty state, kept separate from the shared admin DonutChart so this
 * change is scoped to the doctor Overview page only.
 */
export function TodaysSummaryDonut({ slices, total, centerLabel = "Total", size = 168 }: TodaysSummaryDonutProps) {
  const prefersReducedMotion = useReducedMotion();
  const { loading } = useSimulatedLoad(550);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center" role="status" aria-label="Loading today's summary">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <Skeleton className="h-full w-full rounded-full" />
        </div>
        <ul className="flex w-full flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-1.5 py-1">
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-3 w-14" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const hasData = total > 0 && slices.some((s) => s.value > 0);
  if (!hasData) {
    return (
      <EmptyState
        compact
        icon={<PieChart size={20} aria-hidden="true" />}
        title="No summary data yet"
        description="Today's patient breakdown will appear here once patients start checking in."
      />
    );
  }

  let cumulative = 0;
  const active = activeIndex !== null ? slices[activeIndex] : null;

  // Plain-language sentence for screen readers — the visual ring + legend
  // already convey this, but a single descriptive label makes the chart
  // as a whole announce sensibly instead of as an unlabeled image.
  const summarySentence = `Today's summary: ${total} total patients tracked. ${slices
    .map((s) => `${s.label}: ${s.value}, ${s.percent} percent`)
    .join(". ")}.`;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 140 140"
          width="100%"
          height="100%"
          role="img"
          aria-label={summarySentence}
          className="-rotate-90 overflow-visible"
        >
          <circle cx={70} cy={70} r={RADIUS} fill="none" stroke="var(--mx-border)" strokeWidth={STROKE} />
          {slices
            .filter((s) => s.value > 0)
            .map((s, i) => {
              const fraction = s.value / total;
              const dash = fraction * CIRCUMFERENCE;
              const offset = cumulative * CIRCUMFERENCE;
              cumulative += fraction;
              const isActive = activeIndex === i;
              return (
                <motion.circle
                  key={s.label}
                  cx={70}
                  cy={70}
                  r={RADIUS}
                  fill="none"
                  stroke={s.colorVar}
                  strokeWidth={isActive ? STROKE + 3 : STROKE}
                  strokeLinecap="butt"
                  strokeDashoffset={-offset}
                  initial={prefersReducedMotion ? false : { strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                  animate={{ strokeDasharray: `${dash} ${CIRCUMFERENCE - dash}` }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { ...entranceTransition, delay: 0.08 * i, duration: 0.6 }
                  }
                  className="cursor-pointer transition-[stroke-width] duration-150"
                  tabIndex={0}
                  role="button"
                  aria-label={`${s.label}: ${s.value} patients, ${s.percent} percent`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                />
              );
            })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.label}
                initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                transition={microTransition}
                className="flex flex-col items-center"
              >
                <p className="font-display text-lg font-bold text-mx-ink">{active.value}</p>
                <p className="max-w-[86px] text-center text-[11px] leading-tight text-mx-ink-muted">{active.label}</p>
                <p className="text-[11px] font-semibold text-mx-ink-soft">{active.percent}%</p>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                transition={microTransition}
                className="flex flex-col items-center"
              >
                <p className="font-display text-lg font-bold text-mx-ink">{total}</p>
                <p className="text-[11px] text-mx-ink-muted">{centerLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating tooltip bubble, anchored above the ring, for the hovered/focused segment. */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
              transition={microTransition}
              role="tooltip"
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-mx-sm border border-mx-border bg-mx-surface-raised px-2.5 py-1.5 text-xs font-semibold text-mx-ink shadow-mx-md"
            >
              {active.label}: {active.value} ({active.percent}%)
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {slices.map((s, i) => (
          <li
            key={s.label}
            tabIndex={0}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(i)}
            onBlur={() => setActiveIndex(null)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-mx-sm px-1.5 py-1 text-sm transition-colors duration-150 hover:bg-mx-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-mx-green",
              activeIndex === i && "bg-mx-surface-sunken"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.colorVar }} />
              <span className="truncate text-mx-ink-soft">{s.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-mx-ink">
              {s.value} <span className="text-xs font-normal text-mx-ink-muted">({s.percent}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}