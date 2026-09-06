import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Optional "Showing X–Y of Z" label rendered on the left, desktop only. */
  summary?: string;
  className?: string;
}

/**
 * Compact numbered pagination bar reused across admin list pages (Patients,
 * Appointments, and any future directory/table view). Always shows Prev /
 * Next plus up to 5 page numbers, collapsing with an ellipsis for longer
 * lists so it never wraps awkwardly at mobile widths.
 */
export function Pagination({ page, totalPages, onChange, summary, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageList(page, totalPages);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-mx-border px-4 py-3.5 sm:px-5", className)}>
      {summary && <p className="hidden text-xs font-semibold text-mx-ink-muted sm:block">{summary}</p>}
      <div className="flex flex-1 items-center justify-center gap-1.5 sm:flex-initial sm:justify-end">
        <PageButton aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={15} aria-hidden="true" />
        </PageButton>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-mx-ink-muted">
              …
            </span>
          ) : (
            <PageButton key={p} isActive={p === page} onClick={() => onChange(p)}>
              {p}
            </PageButton>
          )
        )}

        <PageButton aria-label="Next page" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRight size={15} aria-hidden="true" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  isActive = false,
  disabled = false,
  onClick,
  ...rest
}: {
  children: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-mx-sm px-2 text-xs font-semibold transition-colors duration-150",
        isActive ? "bg-mx-green text-mx-ink-inverse" : "text-mx-ink-soft hover:bg-mx-surface-sunken",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function getPageList(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

  if (page <= 3) return [1, 2, 3, 4, "…", totalPages];
  if (page >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "…", page - 1, page, page + 1, "…", totalPages];
}
