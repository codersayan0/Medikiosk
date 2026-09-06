import type { ReactNode } from "react";
import { Phone, User, Stethoscope, CalendarDays, Clock, Video, PhoneCall, Building2, ShieldCheck, Ban, CalendarClock, StickyNote } from "lucide-react";
import type { Appointment } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { CONSULTATION_TYPE_LABEL, getAvailableActions } from "../../utils/appointments";

interface AppointmentDetailsDrawerProps {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
}

const CONSULTATION_ICON = { in_person: Building2, video: Video, phone: PhoneCall } as const;

/**
 * Full appointment detail drawer opened from the Appointments table (row
 * click or "View"). Shows patient info, doctor info, appointment info,
 * notes, and status, plus the same Confirm / Cancel / Reschedule actions
 * available inline in the table — kept in sync via the shared handlers
 * passed down from AppointmentsPage.
 */
export function AppointmentDetailsDrawer({ appointment, onClose, onConfirm, onCancel, onReschedule }: AppointmentDetailsDrawerProps) {
  const actions = appointment ? getAvailableActions(appointment.status) : null;
  const ConsultationIcon = appointment ? CONSULTATION_ICON[appointment.consultationType] : Building2;

  return (
    <Drawer
      isOpen={Boolean(appointment)}
      onClose={onClose}
      title={appointment?.id ?? ""}
      description={appointment ? `${appointment.dateLabel} · ${appointment.time}` : undefined}
      headerExtra={appointment ? <AppointmentStatusBadge status={appointment.status} /> : undefined}
      footer={
        appointment && actions ? (
          <>
            {actions.canReschedule && (
              <Button variant="outline" size="sm" icon={<CalendarClock size={14} aria-hidden="true" />} onClick={() => onReschedule(appointment)}>
                Reschedule
              </Button>
            )}
            {actions.canCancel && (
              <Button variant="danger" size="sm" icon={<Ban size={14} aria-hidden="true" />} onClick={() => onCancel(appointment)}>
                Cancel
              </Button>
            )}
            {actions.canConfirm && (
              <Button variant="primary" size="sm" icon={<ShieldCheck size={14} aria-hidden="true" />} onClick={() => onConfirm(appointment)}>
                Confirm
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      {appointment && (
        <div className="flex flex-col gap-5">
          <Section title="Patient Information">
            <div className="flex items-center gap-3.5 rounded-mx-lg border border-mx-border bg-mx-surface-sunken/60 p-3.5">
              <Avatar name={appointment.patientName} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-mx-ink">{appointment.patientName}</p>
                <p className="text-xs text-mx-ink-muted">
                  {appointment.patientAge} yrs · {appointment.patientGender} · UID {appointment.patientUID}
                </p>
              </div>
            </div>
            <InfoRow icon={Phone} label="Phone" value={appointment.patientPhone} />
          </Section>

          <Section title="Doctor Information">
            <InfoRow icon={User} label="Doctor" value={appointment.doctorName} />
            <InfoRow icon={Stethoscope} label="Specialization" value={appointment.doctorSpecialization} />
          </Section>

          <Section title="Appointment Information">
            <InfoRow icon={CalendarDays} label="Date" value={appointment.dateLabel} />
            <InfoRow icon={Clock} label="Time" value={appointment.time} />
            <InfoRow icon={ConsultationIcon} label="Consultation Type" value={CONSULTATION_TYPE_LABEL[appointment.consultationType]} />
            <InfoRow icon={StickyNote} label="Reason for Visit" value={appointment.reason} />
          </Section>

          {appointment.notes && (
            <Section title="Notes">
              <p className="rounded-mx-sm border border-mx-border bg-mx-surface p-3 text-sm text-mx-ink-soft">{appointment.notes}</p>
            </Section>
          )}

          <p className="text-xs text-mx-ink-muted">Booked on {appointment.createdOn}</p>
        </div>
      )}
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-mx-ink-muted">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-mx-sm bg-mx-surface-sunken text-mx-ink-muted">
        <Icon size={13} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-mx-ink-muted">{label}</p>
        <p className="text-sm font-semibold text-mx-ink">{value}</p>
      </div>
    </div>
  );
}
