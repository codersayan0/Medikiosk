import type { ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Shared fallback UI for any data-fetch failure across the patient
 * dashboard — e.g. "Unable to load health records." / "Document could not
 * be loaded." with a "Try Again" action. Mirrors EmptyState's shape/spacing
 * so a page can swap between the two without any layout shift.
 */
export function ErrorState({
  icon,
  title = "Unable to load this page.",
  description = "Something went wrong while fetching this data. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-mx-lg border border-dashed border-mx-danger/40 bg-mx-danger-soft/40 text-center",
        compact ? "px-5 py-7" : "px-6 py-10",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mx-danger-soft text-mx-danger">
        {icon ?? <AlertTriangle size={22} aria-hidden="true" />}
      </div>
      <div>
        <p className="font-display text-sm font-bold text-mx-ink">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-mx-ink-muted">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" icon={<RotateCw size={14} aria-hidden="true" />} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
