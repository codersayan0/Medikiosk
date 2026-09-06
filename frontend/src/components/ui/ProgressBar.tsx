import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

/** Linear progress indicator, used for consultation completion, uploads, etc. */
export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-mx-ink-soft">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-mx-surface-sunken"
      >
        <div
          className="h-full rounded-full bg-mx-green transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
