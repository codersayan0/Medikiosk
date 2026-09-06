import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, AlertTriangle, Flame } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { cn } from "../../utils/cn";
import { staggerContainer, staggerItem, smallTransition } from "../../utils/motion";
import { QUEUE_PATIENTS, QUEUE_COUNTS, type QueueRiskTier, type QueuePatient } from "../../data/mockDoctorDashboard";
import { DOCTOR_DASHBOARD_ROOT } from "../../data/doctorDashboardNav";

interface PatientQueueTableProps {
  activeTier: QueueRiskTier;
  onTierChange: (tier: QueueRiskTier) => void;
  /** Caps the number of rows shown (Overview shows a short preview; the full page shows everything). */
  limit?: number;
  /** Demo hook: force this tab's fetch to fail so the ErrorState + retry flow can be shown. */
  simulateError?: boolean;
}

const TABS: Array<{ id: QueueRiskTier; label: string }> = [
  { id: "normal", label: "Normal" },
  { id: "priority", label: "Priority" },
  { id: "emergency", label: "Emergency" },
];

const TAB_ACTIVE_CLASS: Record<QueueRiskTier, string> = {
  normal: "bg-mx-blue-soft text-mx-blue",
  priority: "bg-mx-warning-soft text-mx-warning",
  emergency: "bg-mx-danger-soft text-mx-danger",
};

/** Waiting time gets progressively more urgent styling the longer a patient has been waiting. */
function urgencyClass(minutes: number) {
  if (minutes >= 30) return "text-mx-danger font-bold";
  if (minutes >= 15) return "text-mx-warning font-semibold";
  return "text-mx-ink-soft font-medium";
}

const ROW_TIER_CLASS: Record<QueueRiskTier, string> = {
  normal: "border-l-4 border-l-transparent",
  priority: "border-l-4 border-l-mx-warning bg-mx-warning-soft/20",
  emergency: "border-l-4 border-l-mx-danger bg-mx-danger-soft/25",
};

const SKELETON_ROW_COUNT = 5;

/** Shared Patient Queue table with Normal/Priority/Emergency tabs — used on both the Overview preview and the dedicated Patient Queue page. */
export function PatientQueueTable({ activeTier, onTierChange, limit, simulateError = false }: PatientQueueTableProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Re-"fetches" whenever the active tab changes, so switching tabs shows a
  // brief loading state the way a real filtered query would.
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    const t = window.setTimeout(() => {
      setLoading(false);
      setFailed(simulateError);
    }, 450);
    return () => window.clearTimeout(t);
  }, [activeTier, simulateError, attempt]);

  const allRows: QueuePatient[] = QUEUE_PATIENTS.filter((p) => p.tier === activeTier);
  const rows = limit ? allRows.slice(0, limit) : allRows;

  return (
    <div>
      <div className="mb-3 flex gap-2 border-b border-mx-border pb-3" role="tablist" aria-label="Patient queue tier">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTier;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTierChange(tab.id)}
              className={cn(
                "rounded-mx-sm px-3 py-1.5 text-sm font-semibold transition-colors duration-150",
                isActive ? TAB_ACTIVE_CLASS[tab.id] : "text-mx-ink-muted hover:bg-mx-surface-sunken"
              )}
            >
              {tab.label} ({QUEUE_COUNTS[tab.id]})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="overflow-x-auto" role="status" aria-label="Loading patient queue">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-mx-border text-left text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Patient</th>
                <th className="hidden py-2 pr-3 font-semibold sm:table-cell">Complaint</th>
                <th className="py-2 pr-3 font-semibold">Waiting</th>
                <th className="py-2 pl-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(limit ?? SKELETON_ROW_COUNT, SKELETON_ROW_COUNT) }).map((_, i) => (
                <tr key={i} className="border-b border-mx-border last:border-b-0">
                  <td className="py-3 pr-3">
                    <Skeleton className="h-3 w-3" />
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-14" />
                      </div>
                    </div>
                  </td>
                  <td className="hidden py-3 pr-3 sm:table-cell">
                    <Skeleton className="h-3 w-28" />
                  </td>
                  <td className="py-3 pr-3">
                    <Skeleton className="h-3 w-12" />
                  </td>
                  <td className="py-3 pl-3">
                    <Skeleton className="ml-auto h-8 w-14 rounded-mx-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : failed ? (
        <ErrorState
          compact
          title="Couldn't load the queue"
          description="Something went wrong while fetching this tier's patients. Please try again."
          onRetry={() => setAttempt((a) => a + 1)}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          compact
          icon={<Clock size={22} aria-hidden="true" />}
          title={`No ${activeTier} patients waiting`}
          description="This queue is clear right now — new patients will appear here as they check in."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-mx-border text-left text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Patient</th>
                <th className="hidden py-2 pr-3 font-semibold sm:table-cell">Complaint</th>
                <th className="py-2 pr-3 font-semibold">Waiting</th>
                <th className="py-2 pl-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={activeTier}
                variants={prefersReducedMotion ? undefined : staggerContainer(0.05)}
                initial={prefersReducedMotion ? undefined : "hidden"}
                animate={prefersReducedMotion ? undefined : "show"}
                exit={prefersReducedMotion ? undefined : { opacity: 0, transition: smallTransition }}
              >
                {rows.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    variants={prefersReducedMotion ? undefined : staggerItem}
                    className={cn(
                      "border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken/60",
                      ROW_TIER_CLASS[p.tier]
                    )}
                  >
                    <td className="py-2.5 pr-3 text-mx-ink-muted">{i + 1}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <Avatar name={p.name} size={30} />
                          {p.tier === "emergency" && (
                            <span
                              className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-mx-danger ring-2 ring-mx-surface-raised"
                              aria-hidden="true"
                            >
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate font-semibold text-mx-ink">{p.name}</p>
                            {p.tier === "emergency" && (
                              <Badge tone="danger" icon={<AlertTriangle size={11} aria-hidden="true" />}>
                                Emergency
                              </Badge>
                            )}
                            {p.tier === "priority" && (
                              <Badge tone="warning" icon={<Flame size={11} aria-hidden="true" />}>
                                Priority
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-mx-ink-muted">
                            {p.age} / {p.sex}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden py-2.5 pr-3 text-mx-ink-soft sm:table-cell">{p.complaint}</td>
                    <td className="py-2.5 pr-3">
                      <span className={cn("inline-flex items-center gap-1", urgencyClass(p.waitingMinutes))}>
                        <Clock size={13} className={p.waitingMinutes >= 30 ? "text-mx-danger" : p.waitingMinutes >= 15 ? "text-mx-warning" : "text-mx-ink-muted"} aria-hidden="true" />
                        {p.waitingMinutes} min
                      </span>
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      <Button
                        size="sm"
                        variant={p.tier === "emergency" ? "danger" : "outline"}
                        className="h-8 px-3 text-xs"
                        onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/patient-details/basic-profile`)}
                      >
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      )}
    </div>
  );
}