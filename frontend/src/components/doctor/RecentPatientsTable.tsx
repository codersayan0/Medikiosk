import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import type { BadgeTone } from "../../types";
import { RECENT_PATIENTS, type RecentPatientStatus, type RecentPatientRow } from "../../data/mockDoctorDashboard";
import { DOCTOR_DASHBOARD_ROOT } from "../../data/doctorDashboardNav";
import { useSimulatedLoad } from "../../hooks/useSimulatedLoad";
import { staggerContainer, staggerItem } from "../../utils/motion";

const STATUS_TONE: Record<RecentPatientStatus, BadgeTone> = {
  "In Consultation": "blue",
  Waiting: "warning",
  Completed: "green",
};

interface RecentPatientsTableProps {
  limit?: number;
  /** Overrides the mock dataset — mainly so a page can demo the empty state with `rows={[]}`. */
  rows?: RecentPatientRow[];
}

const SKELETON_ROW_COUNT = 5;

/** Recent Patients table shown on the Overview page: name, UID, complaint, status, last seen, and a View action. */
export function RecentPatientsTable({ limit, rows: rowsProp }: RecentPatientsTableProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { loading } = useSimulatedLoad(500);

  const source = rowsProp ?? RECENT_PATIENTS;
  const rows = limit ? source.slice(0, limit) : source;

  if (loading) {
    return (
      <div className="overflow-x-auto" role="status" aria-label="Loading recent patients">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-mx-border text-left text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
              <th className="py-2 pr-3 font-semibold">Patient Name</th>
              <th className="hidden py-2 pr-3 font-semibold sm:table-cell">UID</th>
              <th className="py-2 pr-3 font-semibold">Complaint</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="hidden py-2 pr-3 font-semibold md:table-cell">Last Seen</th>
              <th className="py-2 pl-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(limit ?? SKELETON_ROW_COUNT, SKELETON_ROW_COUNT) }).map((_, i) => (
              <tr key={i} className="border-b border-mx-border last:border-b-0">
                <td className="py-3 pr-3">
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="hidden py-3 pr-3 sm:table-cell">
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="py-3 pr-3">
                  <Skeleton className="h-3 w-28" />
                </td>
                <td className="py-3 pr-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </td>
                <td className="hidden py-3 pr-3 md:table-cell">
                  <Skeleton className="h-3 w-32" />
                </td>
                <td className="py-3 pl-3">
                  <Skeleton className="ml-auto h-8 w-14 rounded-mx-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        icon={<Users size={22} aria-hidden="true" />}
        title="No recent patients"
        description="Patients you've seen today will show up here as they're checked in."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-mx-border text-left text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
            <th className="py-2 pr-3 font-semibold">Patient Name</th>
            <th className="hidden py-2 pr-3 font-semibold sm:table-cell">UID</th>
            <th className="py-2 pr-3 font-semibold">Complaint</th>
            <th className="py-2 pr-3 font-semibold">Status</th>
            <th className="hidden py-2 pr-3 font-semibold md:table-cell">Last Seen</th>
            <th className="py-2 pl-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <motion.tbody
          variants={prefersReducedMotion ? undefined : staggerContainer(0.05)}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "show"}
        >
          {rows.map((p) => (
            <motion.tr
              key={p.id}
              variants={prefersReducedMotion ? undefined : staggerItem}
              className="border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken/60"
            >
              <td className="py-2.5 pr-3 font-semibold text-mx-ink">{p.name}</td>
              <td className="hidden py-2.5 pr-3 text-mx-ink-muted sm:table-cell">{p.uid}</td>
              <td className="py-2.5 pr-3 text-mx-ink-soft">{p.complaint}</td>
              <td className="py-2.5 pr-3">
                <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
              </td>
              <td className="hidden py-2.5 pr-3 text-xs text-mx-ink-muted md:table-cell">{p.lastSeen}</td>
              <td className="py-2.5 pl-3 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/patient-details/basic-profile`)}
                >
                  View
                </Button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}