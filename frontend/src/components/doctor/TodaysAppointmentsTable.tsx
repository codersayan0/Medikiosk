import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Utensils, CalendarX2, CalendarPlus } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { AppointmentRowMenu } from "./AppointmentRowMenu";
import type { BadgeTone } from "../../types";
import { TODAYS_APPOINTMENTS, type AppointmentSlotStatus } from "../../data/mockDoctorDashboard";
import { DOCTOR_DASHBOARD_ROOT } from "../../data/doctorDashboardNav";
import { useSimulatedLoad } from "../../hooks/useSimulatedLoad";
import { staggerContainer, staggerItem } from "../../utils/motion";

const STATUS_TONE: Record<AppointmentSlotStatus, BadgeTone> = {
  confirmed: "green",
  waiting: "warning",
  scheduled: "blue",
  completed: "neutral",
  break: "neutral",
  available: "green",
};

const STATUS_LABEL: Record<AppointmentSlotStatus, string> = {
  confirmed: "Confirmed",
  waiting: "Waiting",
  scheduled: "Scheduled",
  completed: "Completed",
  break: "Break",
  available: "Available",
};

interface TodaysAppointmentsTableProps {
  limit?: number;
  /** Overrides the built-in simulated loading window — mainly for demo/storybook control. */
  loading?: boolean;
  /** Overrides the mock dataset — mainly so a page can demo the empty state with `rows={[]}`. */
  rows?: typeof TODAYS_APPOINTMENTS;
}

const SKELETON_ROW_COUNT = 5;

/** Shared today's-schedule table used by both the Overview preview and the full Appointments page. */
export function TodaysAppointmentsTable({ limit, loading: loadingProp, rows: rowsProp }: TodaysAppointmentsTableProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { loading: simulatedLoading } = useSimulatedLoad(500);
  const loading = loadingProp ?? simulatedLoading;

  const source = rowsProp ?? TODAYS_APPOINTMENTS;
  const rows = limit ? source.slice(0, limit) : source;

  if (loading) {
    return (
      <div className="overflow-x-auto" role="status" aria-label="Loading today's appointments">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-mx-border text-left text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
              <th className="py-2 pr-3 font-semibold">Time</th>
              <th className="py-2 pr-3 font-semibold">Patient</th>
              <th className="hidden py-2 pr-3 font-semibold md:table-cell">Type / Reason</th>
              <th className="hidden py-2 pr-3 font-semibold sm:table-cell">Duration</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pl-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(limit ?? SKELETON_ROW_COUNT, SKELETON_ROW_COUNT) }).map((_, i) => (
              <tr key={i} className="border-b border-mx-border last:border-b-0">
                <td className="py-3 pr-3">
                  <Skeleton className="h-3 w-14" />
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                </td>
                <td className="hidden py-3 pr-3 md:table-cell">
                  <Skeleton className="h-3 w-28" />
                </td>
                <td className="hidden py-3 pr-3 sm:table-cell">
                  <Skeleton className="h-3 w-12" />
                </td>
                <td className="py-3 pr-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-3 pl-3">
                  <Skeleton className="ml-auto h-8 w-16 rounded-mx-sm" />
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
        icon={<CalendarX2 size={22} aria-hidden="true" />}
        title="No appointments today"
        description="This day is wide open — book a new appointment to fill the schedule."
        action={
          <Button
            size="sm"
            variant="primary"
            icon={<CalendarPlus size={15} aria-hidden="true" />}
            onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/appointments`)}
          >
            New Appointment
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-mx-border text-left text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
            <th className="py-2 pr-3 font-semibold">Time</th>
            <th className="py-2 pr-3 font-semibold">Patient</th>
            <th className="hidden py-2 pr-3 font-semibold md:table-cell">Type / Reason</th>
            <th className="hidden py-2 pr-3 font-semibold sm:table-cell">Duration</th>
            <th className="py-2 pr-3 font-semibold">Status</th>
            <th className="py-2 pl-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <motion.tbody
          variants={prefersReducedMotion ? undefined : staggerContainer(0.05)}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "show"}
        >
          {rows.map((apt) => {
            if (apt.status === "break") {
              return (
                <motion.tr
                  key={apt.id}
                  variants={prefersReducedMotion ? undefined : staggerItem}
                  className="border-b border-mx-border last:border-b-0"
                >
                  <td className="py-2.5 pr-3 text-mx-ink-muted">
                    {apt.time} – {apt.endTime}
                  </td>
                  <td colSpan={5} className="py-2.5 pl-3">
                    <span className="inline-flex items-center gap-2 text-mx-ink-muted">
                      <Utensils size={14} aria-hidden="true" /> Lunch Break
                    </span>
                  </td>
                </motion.tr>
              );
            }

            const goToPatient = () => navigate(`${DOCTOR_DASHBOARD_ROOT}/patient-details/basic-profile`);

            return (
              <motion.tr
                key={apt.id}
                variants={prefersReducedMotion ? undefined : staggerItem}
                className="border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken/60"
              >
                <td className="py-2.5 pr-3 align-top text-mx-ink-muted">
                  {apt.time}
                  <br />
                  <span className="text-xs">– {apt.endTime}</span>
                </td>
                <td className="py-2.5 pr-3">
                  {apt.patientName ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={apt.patientName} size={30} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-mx-ink">{apt.patientName}</p>
                        <p className="text-xs text-mx-ink-muted">
                          {apt.uid} · {apt.age}/{apt.sex}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-mx-ink-muted">Available Slot</span>
                  )}
                </td>
                <td className="hidden py-2.5 pr-3 text-mx-ink-soft md:table-cell">
                  {apt.type && <p className="font-medium text-mx-ink">{apt.type}</p>}
                  {apt.reason && <p className="text-xs text-mx-ink-muted">{apt.reason}</p>}
                </td>
                <td className="hidden py-2.5 pr-3 text-mx-ink-soft sm:table-cell">{apt.durationMin} min</td>
                <td className="py-2.5 pr-3">
                  <Badge tone={STATUS_TONE[apt.status]}>{STATUS_LABEL[apt.status]}</Badge>
                </td>
                <td className="py-2.5 pl-3">
                  <div className="flex items-center justify-end gap-1">
                    {apt.status === "available" ? (
                      <Button size="sm" variant="primary" className="h-8 px-3 text-xs">
                        Book
                      </Button>
                    ) : apt.isCurrent ? (
                      <Button size="sm" variant="primary" className="h-8 whitespace-nowrap px-3 text-xs" onClick={goToPatient}>
                        Start Consultation
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={goToPatient}>
                        View
                      </Button>
                    )}
                    {apt.patientName && <AppointmentRowMenu patientName={apt.patientName} onView={goToPatient} />}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}