import type { ReactNode } from "react";
import { Mail, Phone, MapPin, Droplet, CalendarClock, AlertTriangle, FileText, CalendarDays } from "lucide-react";
import type { Patient } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Drawer } from "../ui/Drawer";
import { PatientStatusBadge } from "./PatientStatusBadge";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

interface PatientDetailsDrawerProps {
  patient: Patient | null;
  onClose: () => void;
}

/**
 * Full patient profile drawer opened from the Patients directory (row click
 * or "View Patient"). Surfaces contact info, the medical summary preview,
 * and recent appointments/records — read-only, matching the spec's
 * "Patient details drawer/modal" requirement.
 */
export function PatientDetailsDrawer({ patient, onClose }: PatientDetailsDrawerProps) {
  return (
    <Drawer isOpen={Boolean(patient)} onClose={onClose} title={patient?.fullName ?? ""} description={patient ? `Patient UID: ${patient.patientUID}` : undefined}>
      {patient && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5 rounded-mx-lg border border-mx-border bg-mx-surface-sunken/60 p-4">
            <Avatar name={patient.fullName} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold text-mx-ink">{patient.fullName}</p>
              <p className="text-xs text-mx-ink-muted">
                {patient.age} yrs · {patient.gender}
              </p>
            </div>
            <PatientStatusBadge status={patient.status} />
          </div>

          {/* Contact & identity */}
          <Section title="Patient Information">
            <InfoRow icon={Phone} label="Phone" value={patient.phone} />
            <InfoRow icon={Mail} label="Email" value={patient.email} />
            <InfoRow icon={MapPin} label="Address" value={patient.address} />
            <InfoRow icon={Droplet} label="Blood Group" value={patient.bloodGroup} />
            <InfoRow icon={CalendarClock} label="Registered On" value={patient.registeredOn} />
            <InfoRow icon={CalendarDays} label="Last Visit" value={patient.lastVisit} />
          </Section>

          {/* Medical summary preview */}
          <Section title="Medical Summary">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {patient.medicalSummary.map((item) => (
                <div key={item.label} className="rounded-mx-sm border border-mx-border bg-mx-surface p-3">
                  <p className="text-xs font-semibold text-mx-ink-muted">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-mx-ink">{item.value}</p>
                </div>
              ))}
            </div>
            {patient.allergies.length > 0 && patient.allergies[0] !== "None recorded" && (
              <div className="mt-2.5 flex items-start gap-2 rounded-mx-sm bg-mx-warning-soft p-3 text-xs font-semibold text-mx-warning">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                Allergic to: {patient.allergies.join(", ")}
              </div>
            )}
          </Section>

          {/* Recent appointments */}
          <Section title="Recent Appointments">
            {patient.recentAppointments.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No appointments recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {patient.recentAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between gap-3 rounded-mx-sm border border-mx-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-mx-ink">{appt.doctorName}</p>
                      <p className="text-xs text-mx-ink-muted">
                        {appt.specialization} · {appt.date}, {appt.time}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Recent medical records */}
          <Section title="Recent Medical Records">
            {patient.recentRecords.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No medical records uploaded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {patient.recentRecords.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-3 rounded-mx-sm border border-mx-border p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-mx-sm bg-mx-purple-soft text-mx-purple">
                      <FileText size={14} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-mx-ink">{rec.title}</p>
                      <p className="text-xs text-mx-ink-muted">{rec.date}</p>
                    </div>
                    <Badge tone="neutral">{rec.category}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-mx-ink-muted">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
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
