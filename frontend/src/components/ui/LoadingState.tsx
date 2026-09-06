import { Loader2 } from "lucide-react";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

interface LoadingStateProps {
  label?: string;
  fullHeight?: boolean;
  className?: string;
}

/** Consistent loading placeholder for async sections and route-level suspense. */
export function LoadingState({ label, fullHeight = false, className }: LoadingStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-mx-ink-muted",
        fullHeight && "min-h-[60vh]",
        className
      )}
    >
      <Loader2 size={26} className="animate-spin text-mx-green" aria-hidden="true" />
      <span className="text-sm font-medium">{label ?? `${t.common.loading}…`}</span>
    </div>
  );
}
