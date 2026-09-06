import type { Appointment, AppointmentStatus, BadgeTone, ConsultationType } from "../types";

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const APPOINTMENT_STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "blue",
  completed: "green",
  cancelled: "danger",
};

export const CONSULTATION_TYPE_LABEL: Record<ConsultationType, string> = {
  in_person: "In-Person",
  video: "Video Call",
  phone: "Phone Call",
};

/** Case-insensitive match across the fields a search box should cover. */
export function appointmentMatchesQuery(appointment: Appointment, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    appointment.patientName.toLowerCase().includes(q) ||
    appointment.patientUID.toLowerCase().includes(q) ||
    appointment.doctorName.toLowerCase().includes(q) ||
    appointment.id.toLowerCase().includes(q)
  );
}

export function countAppointmentsByStatus(appointments: Appointment[]) {
  return {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };
}

/** Which row-level actions make sense for a given appointment status. */
export function getAvailableActions(status: AppointmentStatus) {
  return {
    canConfirm: status === "pending",
    canCancel: status === "pending" || status === "confirmed",
    canReschedule: status === "pending" || status === "confirmed",
  };
}
