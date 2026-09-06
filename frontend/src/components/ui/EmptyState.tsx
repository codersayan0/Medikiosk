import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Tighter padding (px-5 py-7 instead of the default px-6 py-10) for use
   *  on pages that must fit within one viewport without scrolling. Scoped
   *  per call site — the default stays unchanged everywhere else. */
  compact?: boolean;
  className?: string;
}

/** Shown when a list/section has no data yet. Frames it as an invitation, not a dead end. */
export function EmptyState({ icon, title, description, action, compact = false, className }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-mx-lg border border-dashed border-mx-border-strong bg-mx-surface-sunken/60 text-center",
        compact ? "px-5 py-7" : "px-6 py-10",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mx-surface text-mx-ink-muted">
        {icon ?? <Inbox size={22} aria-hidden="true" />}
      </div>
      <div>
        <p className="font-display text-sm font-bold text-mx-ink">{title ?? t.emptyState.title}</p>
        <p className="mt-1 max-w-xs text-sm text-mx-ink-muted">{description ?? t.emptyState.description}</p>
      </div>
      {action}
    </div>
  );
}
