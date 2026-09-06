import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Search, Eye, ShieldCheck, Ban, CalendarClock, CalendarX2 } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs, type SegmentedTab } from "../../../components/ui/SegmentedTabs";
import { ListPageSkeleton } from "../../../components/ui/Skeleton";
import { Pagination } from "../../../components/ui/Pagination";
import { AppointmentStatusBadge } from "../../../components/admin/AppointmentStatusBadge";
import { AppointmentDetailsDrawer } from "../../../components/admin/AppointmentDetailsDrawer";
import { RescheduleAppointmentModal } from "../../../components/admin/RescheduleAppointmentModal";
import { MOCK_APPOINTMENTS } from "../../../data/mockAppointments";
import { useSimulatedLoad } from "../../../hooks/useSimulatedLoad";
import { useToast } from "../../../context/ToastContext";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import {
  CONSULTATION_TYPE_LABEL,
  appointmentMatchesQuery,
  countAppointmentsByStatus,
  getAvailableActions,
} from "../../../utils/appointments";
import type { Appointment, AppointmentStatus } from "../../../types";

type FilterTab = "all" | AppointmentStatus;
const PAGE_SIZE = 8;

/**
 * Admin Appointments management page (replaces the "coming soon"
 * placeholder). Same search + segmented-tab-filter + table pattern as
 * Patients/Doctor Applications, plus date/doctor/patient filters and
 * row-level Confirm / Cancel / Reschedule actions that also drive the
 * status shown throughout the row and the details drawer.
 *
 * TODO(real-backend): swap MOCK_APPOINTMENTS for a real
 * `GET /admin/appointments` response (see data/mockAppointments.ts), and
 * replace the local `setAppointments` mutations below with the matching
 * `PATCH /admin/appointments/:id` calls — every handler here
 * (handleConfirm/handleCancel/handleReschedule) is already isolated to a
 * single spot, so this is a drop-in swap.
 */
export default function AppointmentsPage() {
  const { loading } = useSimulatedLoad();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");
  const [tab, setTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);

  const counts = useMemo(() => countAppointmentsByStatus(appointments), [appointments]);

  const tabs: SegmentedTab<FilterTab>[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "confirmed", label: "Confirmed", count: counts.confirmed },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  const doctorOptions = useMemo(() => {
    const unique = Array.from(new Set(appointments.map((a) => a.doctorName)));
    return [{ value: "all", label: "All Doctors" }, ...unique.map((d) => ({ value: d, label: d }))];
  }, [appointments]);

  const patientOptions = useMemo(() => {
    const unique = Array.from(new Set(appointments.map((a) => a.patientName)));
    return [{ value: "all", label: "All Patients" }, ...unique.map((p) => ({ value: p, label: p }))];
  }, [appointments]);

  const filtered = useMemo(() => {
    return appointments.filter(
      (a) =>
        (tab === "all" || a.status === tab) &&
        (doctorFilter === "all" || a.doctorName === doctorFilter) &&
        (patientFilter === "all" || a.patientName === patientFilter) &&
        (!dateFilter || a.date === dateFilter) &&
        appointmentMatchesQuery(a, query)
    );
  }, [appointments, tab, doctorFilter, patientFilter, dateFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const updateAppointment = (id: string, updater: (a: Appointment) => Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? updater(a) : a)));
  };

  const handleConfirm = (appointment: Appointment) => {
    updateAppointment(appointment.id, (a) => ({ ...a, status: "confirmed" }));
    setSelected((s) => (s?.id === appointment.id ? { ...s, status: "confirmed" } : s));
    showToast({ tone: "success", title: "Appointment confirmed", description: `${appointment.patientName}'s appointment has been confirmed.` });
  };

  const handleCancel = (appointment: Appointment) => {
    updateAppointment(appointment.id, (a) => ({ ...a, status: "cancelled" }));
    setSelected((s) => (s?.id === appointment.id ? { ...s, status: "cancelled" } : s));
    showToast({ tone: "warning", title: "Appointment cancelled", description: `${appointment.patientName}'s appointment has been cancelled.` });
  };

  const handleRescheduleConfirm = (appointment: Appointment, date: string, time: string) => {
    const dateLabel = formatDateLabel(date);
    updateAppointment(appointment.id, (a) => ({ ...a, date, dateLabel, time, status: "confirmed" }));
    setSelected((s) => (s?.id === appointment.id ? { ...s, date, dateLabel, time, status: "confirmed" } : s));
    setRescheduling(null);
    showToast({ tone: "success", title: "Appointment rescheduled", description: `${appointment.patientName}'s appointment moved to ${dateLabel}, ${time}.` });
  };

  if (loading) return <ListPageSkeleton rows={6} />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-mx-ink">Appointments</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Manage every appointment scheduled across your organization.</p>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-mx-border p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Search appointments"
              hideLabel
              placeholder="Search patient, UID, or doctor"
              icon={<Search size={16} aria-hidden="true" />}
              value={query}
              onChange={(e) => updateFilter(() => setQuery(e.target.value))}
            />
            <Input label="Filter by date" hideLabel type="date" value={dateFilter} onChange={(e) => updateFilter(() => setDateFilter(e.target.value))} />
            <Select label="Filter by doctor" hideLabel options={doctorOptions} value={doctorFilter} onChange={(e) => updateFilter(() => setDoctorFilter(e.target.value))} />
            <Select label="Filter by patient" hideLabel options={patientOptions} value={patientFilter} onChange={(e) => updateFilter(() => setPatientFilter(e.target.value))} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedTabs tabs={tabs} active={tab} onChange={(id) => updateFilter(() => setTab(id))} layoutGroupId="appointments-tabs" />
            {dateFilter && (
              <Button variant="ghost" size="sm" icon={<CalendarX2 size={14} aria-hidden="true" />} onClick={() => updateFilter(() => setDateFilter(""))}>
                Clear date
              </Button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<CalendarClock size={22} aria-hidden="true" />} title="No appointments found" description="Try adjusting your search or filters." />
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="mx-scrollbar hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead>
                  <tr className="border-y border-mx-border bg-mx-surface-sunken text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-3 py-3 font-semibold">Patient UID</th>
                    <th className="px-3 py-3 font-semibold">Doctor</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Time</th>
                    <th className="px-3 py-3 font-semibold">Type</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <motion.tbody key={`${tab}-${doctorFilter}-${patientFilter}-${dateFilter}-${query}-${currentPage}`} variants={staggerContainer(0.035)} initial="hidden" animate="show">
                  {paged.map((appt) => {
                    const actions = getAvailableActions(appt.status);
                    return (
                      <motion.tr
                        key={appt.id}
                        variants={staggerItem}
                        onClick={() => setSelected(appt)}
                        className="cursor-pointer border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={appt.patientName} size={32} />
                            <p className="truncate font-semibold text-mx-ink">{appt.patientName}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-mx-ink-soft">{appt.patientUID}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{appt.doctorName}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{appt.dateLabel}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{appt.time}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{CONSULTATION_TYPE_LABEL[appt.consultationType]}</td>
                        <td className="px-3 py-3">
                          <AppointmentStatusBadge status={appt.status} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <IconAction label="View" onClick={() => setSelected(appt)}>
                              <Eye size={14} aria-hidden="true" />
                            </IconAction>
                            {actions.canConfirm && (
                              <IconAction label="Confirm" tone="green" onClick={() => handleConfirm(appt)}>
                                <ShieldCheck size={14} aria-hidden="true" />
                              </IconAction>
                            )}
                            {actions.canReschedule && (
                              <IconAction label="Reschedule" onClick={() => setRescheduling(appt)}>
                                <CalendarClock size={14} aria-hidden="true" />
                              </IconAction>
                            )}
                            {actions.canCancel && (
                              <IconAction label="Cancel" tone="danger" onClick={() => handleCancel(appt)}>
                                <Ban size={14} aria-hidden="true" />
                              </IconAction>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <motion.div
              key={`m-${tab}-${doctorFilter}-${patientFilter}-${dateFilter}-${query}-${currentPage}`}
              variants={staggerContainer(0.035)}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3 p-4 sm:hidden"
            >
              {paged.map((appt) => {
                const actions = getAvailableActions(appt.status);
                return (
                  <motion.div key={appt.id} variants={staggerItem}>
                    <Card interactive onClick={() => setSelected(appt)} className="flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar name={appt.patientName} size={36} />
                          <div>
                            <p className="font-semibold text-mx-ink">{appt.patientName}</p>
                            <p className="text-xs text-mx-ink-muted">{appt.doctorName}</p>
                          </div>
                        </div>
                        <AppointmentStatusBadge status={appt.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-mx-ink-muted">
                        <span>
                          {appt.dateLabel}, {appt.time}
                        </span>
                        <span>{CONSULTATION_TYPE_LABEL[appt.consultationType]}</span>
                      </div>
                      {(actions.canConfirm || actions.canCancel || actions.canReschedule) && (
                        <div className="flex flex-wrap gap-2 border-t border-mx-border pt-2.5" onClick={(e) => e.stopPropagation()}>
                          {actions.canConfirm && (
                            <Button variant="outline" size="sm" onClick={() => handleConfirm(appt)}>
                              Confirm
                            </Button>
                          )}
                          {actions.canReschedule && (
                            <Button variant="outline" size="sm" onClick={() => setRescheduling(appt)}>
                              Reschedule
                            </Button>
                          )}
                          {actions.canCancel && (
                            <Button variant="outline" size="sm" onClick={() => handleCancel(appt)}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPage}
              summary={`Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} appointments`}
            />
          </>
        )}
      </Card>

      <AppointmentDetailsDrawer
        appointment={selected}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onReschedule={(appt) => setRescheduling(appt)}
      />

      <RescheduleAppointmentModal appointment={rescheduling} onClose={() => setRescheduling(null)} onConfirm={handleRescheduleConfirm} />
    </div>
  );
}

function IconAction({
  children,
  label,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "green" | "danger";
}) {
  const toneClass =
    tone === "danger" ? "text-mx-danger hover:bg-mx-danger-soft" : tone === "green" ? "text-mx-green-strong hover:bg-mx-green-soft" : "text-mx-ink-soft hover:bg-mx-surface-sunken";
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`flex h-8 w-8 items-center justify-center rounded-mx-sm transition-colors duration-150 ${toneClass}`}>
      {children}
    </button>
  );
}

function formatDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
