import { useState } from "react";
import { PieChart } from "lucide-react";
import { EmptyState } from "../../ui/EmptyState";
import type { DistributionSlice } from "../../../utils/analytics";

interface DonutChartProps {
  slices: DistributionSlice[];
  ariaLabel: string;
  size?: number;
  /** Label shown in the donut's center, e.g. "42 Total". */
  centerLabel?: string;
}

const RADIUS = 60;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Donut/ring chart built from stacked SVG circle strokes — no external chart library required. */
export function DonutChart({ slices, ariaLabel, size = 168, centerLabel }: DonutChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <EmptyState
        compact
        icon={<PieChart size={20} aria-hidden="true" />}
        title="No data for this range"
        description="Try selecting a wider date range."
      />
    );
  }

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={ariaLabel} className="-rotate-90">
          <circle cx={70} cy={70} r={RADIUS} fill="none" stroke="var(--mx-border)" strokeWidth={STROKE} />
          {slices
            .filter((s) => s.value > 0)
            .map((s, i) => {
              const fraction = s.value / total;
              const dash = fraction * CIRCUMFERENCE;
              const offset = cumulative * CIRCUMFERENCE;
              cumulative += fraction;
              const isHovered = hoverIndex === i;
              return (
                <circle
                  key={s.label}
                  cx={70}
                  cy={70}
                  r={RADIUS}
                  fill="none"
                  stroke={s.colorVar}
                  strokeWidth={isHovered ? STROKE + 3 : STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offset}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <title>{`${s.label}: ${s.value} (${Math.round(fraction * 100)}%)`}</title>
                </circle>
              );
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {hoverIndex !== null && slices[hoverIndex] ? (
            <>
              <p className="font-display text-lg font-bold text-mx-ink">{slices[hoverIndex].value}</p>
              <p className="max-w-[80px] text-center text-[11px] leading-tight text-mx-ink-muted">{slices[hoverIndex].label}</p>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold text-mx-ink">{total}</p>
              <p className="text-[11px] text-mx-ink-muted">{centerLabel ?? "Total"}</p>
            </>
          )}
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {slices.map((s, i) => (
          <li
            key={s.label}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            className="flex items-center justify-between gap-3 rounded-mx-sm px-1.5 py-1 text-sm transition-colors duration-150 hover:bg-mx-surface-sunken"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.colorVar }} aria-hidden="true" />
              <span className="truncate text-mx-ink-soft">{s.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-mx-ink">
              {s.value} <span className="text-xs font-normal text-mx-ink-muted">({total ? Math.round((s.value / total) * 100) : 0}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}