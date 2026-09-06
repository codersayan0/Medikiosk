import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EmptyState } from "../../ui/EmptyState";
import { BarChart3 } from "lucide-react";
import type { TrendPoint } from "../../../utils/analytics";

export interface TrendChartSeries {
  name: string;
  colorVar: string;
  points: TrendPoint[];
}

interface TrendChartProps {
  /** Pass either a single unnamed series (no legend shown) or several named series (legend shown). */
  series: TrendChartSeries[];
  height?: number;
  ariaLabel: string;
  /** Suffix appended to values in the tooltip, e.g. " patients". */
  valueSuffix?: string;
}

const WIDTH = 640;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

/**
 * Dependency-free SVG line/area chart. The project has no chart library
 * installed (see package inventory) — per the brief's "choose the smallest
 * appropriate solution compatible with the existing project" guidance, this
 * avoids adding a new dependency entirely rather than pulling in recharts.
 */
export function TrendChart({ series, height = 220, ariaLabel, valueSuffix = "" }: TrendChartProps) {
  const gradientId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const pointCount = series[0]?.points.length ?? 0;
  const hasData = series.some((s) => s.points.some((p) => p.value > 0));

  const maxValue = useMemo(() => {
    const max = Math.max(0, ...series.flatMap((s) => s.points.map((p) => p.value)));
    return max === 0 ? 4 : Math.ceil(max * 1.2);
  }, [series]);

  if (pointCount === 0) {
    return (
      <EmptyState
        compact
        icon={<BarChart3 size={20} aria-hidden="true" />}
        title="No data for this range"
        description="Try selecting a wider date range."
      />
    );
  }

  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = height - PAD_TOP - PAD_BOTTOM;

  const xFor = (i: number) => PAD_LEFT + (pointCount === 1 ? innerWidth / 2 : (i / (pointCount - 1)) * innerWidth);
  const yFor = (v: number) => PAD_TOP + innerHeight - (v / maxValue) * innerHeight;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Show a readable subset of x-axis labels so they never overlap on mobile.
  const labelStride = Math.max(1, Math.ceil(pointCount / 7));

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5 text-xs font-medium text-mx-ink-soft">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.colorVar }} aria-hidden="true" />
              {s.name}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full"
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {!hasData && (
            <text x={WIDTH / 2} y={height / 2} textAnchor="middle" className="fill-mx-ink-muted text-[13px]">
              No activity recorded in this period
            </text>
          )}

          {/* Gridlines + y-axis labels */}
          {gridLines.map((g) => {
            const y = PAD_TOP + innerHeight - g * innerHeight;
            return (
              <g key={g}>
                <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="var(--mx-border)" strokeWidth={1} />
                <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" className="fill-mx-ink-muted text-[10px]">
                  {Math.round(g * maxValue)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {series[0]?.points.map((p, i) =>
            i % labelStride === 0 ? (
              <text key={p.label + i} x={xFor(i)} y={height - 8} textAnchor="middle" className="fill-mx-ink-muted text-[10px]">
                {p.label}
              </text>
            ) : null
          )}

          {/* Series lines + areas */}
          {hasData &&
            series.map((s) => {
              const linePath = s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`).join(" ");
              const areaPath = `${linePath} L ${xFor(s.points.length - 1)} ${PAD_TOP + innerHeight} L ${xFor(0)} ${PAD_TOP + innerHeight} Z`;
              const uid = `${gradientId}-${s.name.replace(/\s+/g, "")}`;

              return (
                <g key={s.name}>
                  {series.length === 1 && (
                    <>
                      <defs>
                        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={s.colorVar} stopOpacity={0.22} />
                          <stop offset="100%" stopColor={s.colorVar} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill={`url(#${uid})`} />
                    </>
                  )}
                  <motion.path
                    d={linePath}
                    fill="none"
                    stroke={s.colorVar}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={prefersReducedMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {s.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={xFor(i)}
                      cy={yFor(p.value)}
                      r={hoverIndex === i ? 4 : 2.5}
                      fill={s.colorVar}
                      className="transition-all duration-150"
                    />
                  ))}
                </g>
              );
            })}

          {/* Invisible hover targets, one per x position, spanning full height */}
          {hasData &&
            series[0]?.points.map((_, i) => (
              <rect
                key={i}
                x={xFor(i) - innerWidth / pointCount / 2}
                y={PAD_TOP}
                width={innerWidth / pointCount}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
              />
            ))}

          {hasData && hoverIndex !== null && (
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PAD_TOP}
              y2={PAD_TOP + innerHeight}
              stroke="var(--mx-border-strong)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {hasData && hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-mx-sm border border-mx-border bg-mx-surface-raised px-2.5 py-1.5 text-xs shadow-mx-md"
            style={{
              left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
              top: `${((PAD_TOP - 8) / height) * 100}%`,
            }}
          >
            <p className="font-semibold text-mx-ink">{series[0]?.points[hoverIndex]?.label}</p>
            {series.map((s) => (
              <p key={s.name} className="flex items-center gap-1.5 text-mx-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.colorVar }} aria-hidden="true" />
                {series.length > 1 ? `${s.name}: ` : ""}
                {s.points[hoverIndex]?.value}
                {valueSuffix}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}