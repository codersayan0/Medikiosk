import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarClock, ChevronRight } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs } from "../../../components/ui/SegmentedTabs";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../context/PatientContext";
import { PATIENT_DASHBOARD_ROOT } from "../../../data/patientDashboardNav";
import type { VisitStatus } from "../../../data/patientRecord";
import { ErrorState } from "../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../components/ui/Skeleton";
import { useSimulatedLoad } from "../../../hooks/useSimulatedLoad";
import { staggerContainer, staggerItem } from "../../../utils/motion";

const VISIT_STATUS_TONE: Record<VisitStatus, "green" | "blue" | "warning"> = {
  Completed: "green",
  Confirmed: "blue",
  Pending: "warning",
};

type StatusFilter = "All" | VisitStatus;


export default function VisitsPage() {
  const patient = usePatientRecord();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<StatusFilter>("All");

  const filtered = filter === "All" ? patient.visits : patient.visits.filter((v) => v.status === filter);

  const { loading, failed, retry } = useSimulatedLoad();
  if (loading) return <ListPageSkeleton />;
  if (failed) {
    return (
      <ErrorState
        title="Unable to load this page."
        description="We couldn't fetch this data. Please try again."
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">My Visits</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Every consultation — past, confirmed, and pending — in one list.</p>
      </div>

      <SegmentedTabs
        tabs={[
          { id: "All", label: "All", count: patient.visits.length },
          { id: "Completed", label: "Completed", count: patient.visits.filter((v) => v.status === "Completed").length },
          { id: "Confirmed", label: "Confirmed", count: patient.visits.filter((v) => v.status === "Confirmed").length },
          { id: "Pending", label: "Pending", count: patient.visits.filter((v) => v.status === "Pending").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<CalendarClock size={22} aria-hidden="true" />} title="No visits here" description="No visits match this filter yet." />
      ) : (
        <motion.div
          key={filter}
          className="space-y-3"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="show"
          variants={prefersReducedMotion ? undefined : staggerContainer()}
        >
          {filtered.map((visit) => (
            <motion.div key={visit.id} variants={prefersReducedMotion ? undefined : staggerItem}>
              <Card
                interactive
                className="flex items-center gap-3"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`${PATIENT_DASHBOARD_ROOT}/visits/${visit.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`${PATIENT_DASHBOARD_ROOT}/visits/${visit.id}`);
                }}
              >
                <MedicalIcon icon={CalendarClock} tone={VISIT_STATUS_TONE[visit.status]} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold text-mx-ink">{visit.reason}</p>
                    <Badge tone={VISIT_STATUS_TONE[visit.status]}>{visit.status}</Badge>
                  </div>
                  <p className="text-xs text-mx-ink-muted">
                    {visit.date} · {visit.time}
                  </p>
                  <p className="text-xs text-mx-ink-muted">
                    {visit.doctorName}
                    {visit.department ? ` · ${visit.department}` : ""}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
