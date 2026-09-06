import { cn } from "../../utils/cn";

/** Base shimmering placeholder bar/block. Compose these into page-shaped skeletons below. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("mx-shimmer rounded-mx-sm", className)} aria-hidden="true" />;
}

function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("rounded-mx-lg border border-mx-border bg-mx-surface-raised p-4 sm:p-5", className)}>
      <Skeleton className="mb-3 h-4 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching the Overview (Dashboard) page layout: stat tiles + card grid. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading dashboard">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-4">
            <Skeleton className="mb-2 h-3 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SkeletonCard lines={4} className="lg:col-span-2" />
        <SkeletonCard lines={3} />
      </div>
      <SkeletonCard lines={5} />
    </div>
  );
}

/** Generic list/table-shaped skeleton for Medical Records, Lab Reports, Prescriptions, Documents, Visits. */
export function ListPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="rounded-mx-lg border border-mx-border bg-mx-surface-raised">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-mx-border p-4 last:border-b-0">
            <Skeleton className="h-9 w-9 shrink-0 rounded-mx-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching the AI Health Summary page: a badge/heading row followed by several labeled sections. */
export function SummaryPageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading AI Health Summary">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <SkeletonCard lines={2} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
