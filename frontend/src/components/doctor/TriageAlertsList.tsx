import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { TriageAlertCard } from "./TriageAlertCard";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { cn } from "../../utils/cn";
import { staggerContainer, staggerItem } from "../../utils/motion";
import { TRIAGE_ALERTS } from "../../data/mockDoctorDashboard";
import { DOCTOR_DASHBOARD_ROOT } from "../../data/doctorDashboardNav";

const RISK_ORDER = { high: 0, medium: 1, low: 2 } as const;

interface TriageAlertsListProps {
  /** Caps the number of alerts shown (Overview shows a short preview; the full page shows everything). */
  limit?: number;
  /** Grid vs. single-column stack — the full page uses a responsive grid, the Overview sidebar card stacks. */
  layout?: "stack" | "grid";
  /** Demo hook: force the fetch to fail so the ErrorState + retry flow can be shown. */
  simulateError?: boolean;
}

/**
 * Triage Alerts list — every AI-flagged patient, highest risk first. This
 * is demo dashboard UI only: it surfaces alert cards over static mock
 * data and never computes or infers any medical diagnosis.
 */
export function TriageAlertsList({ limit, layout = "stack", simulateError = false }: TriageAlertsListProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(
    () => new Set(TRIAGE_ALERTS.filter((a) => a.acknowledged).map((a) => a.id))
  );

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    const t = window.setTimeout(() => {
      setLoading(false);
      setFailed(simulateError);
    }, 500);
    return () => window.clearTimeout(t);
  }, [simulateError, attempt]);

  const sorted = [...TRIAGE_ALERTS].sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
  const rows = limit ? sorted.slice(0, limit) : sorted;

  const gridClass = layout === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2.5";
  const skeletonCount = limit ?? (layout === "grid" ? 6 : 3);

  if (loading) {
    return (
      <div className={gridClass} role="status" aria-label="Loading triage alerts">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="rounded-mx-md border border-mx-border bg-mx-surface-sunken/60 p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="mt-3 h-3.5 w-32" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-3 ml-auto h-8 w-24 rounded-mx-sm" />
          </div>
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <ErrorState
        compact
        title="Couldn't load triage alerts"
        description="Something went wrong while fetching the latest alerts. Please try again."
        onRetry={() => setAttempt((a) => a + 1)}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        icon={<AlertTriangle size={22} aria-hidden="true" />}
        title="No active alerts"
        description="AI-flagged alerts will appear here as soon as a patient needs attention."
      />
    );
  }

  return (
    <motion.div
      className={cn(gridClass)}
      variants={prefersReducedMotion ? undefined : staggerContainer(0.06)}
      initial={prefersReducedMotion ? undefined : "hidden"}
      animate={prefersReducedMotion ? undefined : "show"}
    >
      {rows.map((alert) => (
        <motion.div key={alert.id} variants={prefersReducedMotion ? undefined : staggerItem}>
          <TriageAlertCard
            alert={alert}
            acknowledged={acknowledgedIds.has(alert.id)}
            onAcknowledge={() => setAcknowledgedIds((prev) => new Set(prev).add(alert.id))}
            onOpenPatient={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/patient-details/basic-profile`)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}