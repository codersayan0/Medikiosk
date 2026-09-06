import { MOCK_DOCTOR } from "./mockPatient";

/**
 * TODO(real-backend): frontend-only seed data for the Doctor Dashboard
 * (Overview, Patient Queue, Appointments, Triage Alerts, Recent Patients,
 * Notifications). Reuses the existing MOCK_DOCTOR identity from
 * data/mockPatient.ts rather than inventing a new doctor. Shaped to be a
 * drop-in replacement once real
 * GET /doctor/queue, /doctor/appointments, /doctor/triage-alerts,
 * /doctor/notifications endpoints exist — no unrelated data model is
 * introduced here that a real API couldn't return.
 */

export const DOCTOR_PROFILE = {
  name: MOCK_DOCTOR.name,
  specialty: "General Physician",
  qualification: MOCK_DOCTOR.qualification,
  regNo: MOCK_DOCTOR.regNo,
  email: "anirban.saha@medikiosk.in",
  phone: "98765 43210",
  organization: "City Care Hospital",
  organizationId: "ORG-CCH-0192",
  photoUrl: "",
};

// ---------------------------------------------------------------------------
// Settings — active sessions (Doctor Settings > Security)
// ---------------------------------------------------------------------------

export interface DoctorActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const MOCK_DOCTOR_SESSIONS: DoctorActiveSession[] = [
  { id: "sess-1", device: "Chrome on Windows", location: "Kolkata, IN", lastActive: "Active now", current: true },
  { id: "sess-2", device: "MediKiosk App on Android", location: "Kolkata, IN", lastActive: "2 hours ago", current: false },
  { id: "sess-3", device: "Safari on iPhone", location: "Howrah, IN", lastActive: "Yesterday", current: false },
];
// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

export interface DoctorSummaryStats {
  totalPatients: number;
  totalPatientsTrend: string;
  waitingPatients: number;
  priorityPatients: number;
  todaysConsultations: number;
  todaysConsultationsCompleted: number;
  avgConsultationMinutes: number;
}

export const DOCTOR_SUMMARY_STATS: DoctorSummaryStats = {
  totalPatients: 32,
  totalPatientsTrend: "↑ 8 from yesterday",
  waitingPatients: 12,
  priorityPatients: 3,
  todaysConsultations: 18,
  todaysConsultationsCompleted: 15,
  avgConsultationMinutes: 18,
};

// ---------------------------------------------------------------------------
// Patient Queue (Today) — Normal / Priority / Emergency
// ---------------------------------------------------------------------------

export type QueueRiskTier = "normal" | "priority" | "emergency";

export interface QueuePatient {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  complaint: string;
  waitingMinutes: number;
  tier: QueueRiskTier;
}

export const QUEUE_PATIENTS: QueuePatient[] = [
  { id: "PT-2026-1012", name: "Amit Verma", age: 35, sex: "M", complaint: "Fever & Body ache", waitingMinutes: 15, tier: "normal" },
  { id: "PT-2026-1013", name: "Priya Sharma", age: 28, sex: "F", complaint: "Headache", waitingMinutes: 22, tier: "normal" },
  { id: "PT-2026-1014", name: "Rohit Singh", age: 42, sex: "M", complaint: "Diabetes Follow-up", waitingMinutes: 28, tier: "normal" },
  { id: "PT-2026-1015", name: "Sneha Das", age: 24, sex: "F", complaint: "Breathing Difficulty", waitingMinutes: 35, tier: "normal" },
  { id: "PT-2026-1016", name: "Karan Patel", age: 50, sex: "M", complaint: "Joint Pain", waitingMinutes: 40, tier: "normal" },
  { id: "PT-2026-1007", name: "Raj Kumar", age: 21, sex: "M", complaint: "Chest pain with shortness of breath", waitingMinutes: 5, tier: "emergency" },
  { id: "PT-2026-1021", name: "Meena Iyer", age: 45, sex: "F", complaint: "Severe abdominal pain", waitingMinutes: 12, tier: "emergency" },
  { id: "PT-2026-1022", name: "Farhan Alam", age: 30, sex: "M", complaint: "High-grade fever with rash", waitingMinutes: 18, tier: "priority" },
  { id: "PT-2026-1023", name: "Ritu Bose", age: 55, sex: "F", complaint: "Uncontrolled blood pressure", waitingMinutes: 24, tier: "priority" },
];

/**
 * Tab badge counts shown next to Normal/Priority/Emergency (matches the
 * "Waiting Patients" stat card total). These reflect the doctor's full
 * live queue; QUEUE_PATIENTS above only holds the sample rows rendered in
 * the table, which is why "View All Patients in Queue" exists as a
 * next step to the full list.
 */
export const QUEUE_COUNTS: Record<QueueRiskTier, number> = {
  normal: 12,
  priority: 3,
  emergency: 2,
};

// ---------------------------------------------------------------------------
// Triage Alerts
// ---------------------------------------------------------------------------

export type TriageRisk = "high" | "medium" | "low";

export interface TriageAlert {
  id: string;
  risk: TriageRisk;
  patientName: string;
  age: number;
  sex: "M" | "F";
  reason: string;
  minutesAgo: number;
  acknowledged: boolean;
}

export const TRIAGE_ALERTS: TriageAlert[] = [
  { id: "TRI-1", risk: "high", patientName: "Raj Kumar", age: 21, sex: "M", reason: "Chest pain with shortness of breath", minutesAgo: 5, acknowledged: false },
  { id: "TRI-2", risk: "medium", patientName: "Priya Sharma", age: 28, sex: "F", reason: "Severe headache", minutesAgo: 15, acknowledged: false },
  { id: "TRI-3", risk: "low", patientName: "Amit Verma", age: 35, sex: "M", reason: "Fever with mild body ache", minutesAgo: 20, acknowledged: false },
  { id: "TRI-4", risk: "high", patientName: "Meena Iyer", age: 45, sex: "F", reason: "Severe abdominal pain, guarding on exam", minutesAgo: 12, acknowledged: false },
  { id: "TRI-5", risk: "medium", patientName: "Ritu Bose", age: 55, sex: "F", reason: "BP 178/108, symptomatic", minutesAgo: 24, acknowledged: false },
];

// ---------------------------------------------------------------------------
// Today's Appointments
// ---------------------------------------------------------------------------

export type AppointmentSlotStatus = "confirmed" | "waiting" | "scheduled" | "completed" | "break" | "available";

export interface TodaysAppointment {
  id: string;
  time: string;
  endTime: string;
  patientName?: string;
  uid?: string;
  age?: number;
  sex?: "M" | "F";
  type?: string;
  reason?: string;
  durationMin: number;
  status: AppointmentSlotStatus;
  /** True for the single slot that is the doctor's current/next-up consultation — gets the emphasized "Start Consultation" action instead of "View". */
  isCurrent?: boolean;
}

export const TODAYS_APPOINTMENTS: TodaysAppointment[] = [
  { id: "APT-D-01", time: "08:30 AM", endTime: "09:00 AM", patientName: "Raj Kumar", uid: "UHID-2026-1007", age: 21, sex: "M", type: "Follow-up Consultation", reason: "Chest pain", durationMin: 30, status: "confirmed" },
  { id: "APT-D-02", time: "09:00 AM", endTime: "09:30 AM", patientName: "Priya Sharma", uid: "UHID-2026-1013", age: 28, sex: "F", type: "General Consultation", reason: "Headache", durationMin: 30, status: "waiting" },
  { id: "APT-D-03", time: "10:00 AM", endTime: "10:30 AM", patientName: "Amit Verma", uid: "UHID-2026-1012", age: 35, sex: "M", type: "Fever & Body ache", reason: "Fever & Body ache", durationMin: 30, status: "confirmed", isCurrent: true },
  { id: "APT-D-04", time: "11:30 AM", endTime: "12:00 PM", patientName: "Sneha Das", uid: "UHID-2026-1015", age: 24, sex: "F", type: "Breathing Difficulty", reason: "Breathing problem", durationMin: 30, status: "scheduled" },
  { id: "APT-D-05", time: "12:00 PM", endTime: "01:00 PM", durationMin: 60, status: "break" },
  { id: "APT-D-06", time: "02:00 PM", endTime: "02:30 PM", patientName: "Rohit Singh", uid: "UHID-2026-1014", age: 42, sex: "M", type: "Diabetes Follow-up", reason: "Sugar check", durationMin: 30, status: "scheduled" },
  { id: "APT-D-07", time: "03:30 PM", endTime: "04:00 PM", patientName: "Karan Patel", uid: "UHID-2026-1016", age: 50, sex: "M", type: "Joint Pain", reason: "Knee pain", durationMin: 30, status: "scheduled" },
  { id: "APT-D-08", time: "04:30 PM", endTime: "05:00 PM", durationMin: 30, status: "available" },
];

// ---------------------------------------------------------------------------
// Recent Patients
// ---------------------------------------------------------------------------

export type RecentPatientStatus = "In Consultation" | "Waiting" | "Completed";

export interface RecentPatientRow {
  id: string;
  name: string;
  uid: string;
  complaint: string;
  status: RecentPatientStatus;
  lastSeen: string;
}

export const RECENT_PATIENTS: RecentPatientRow[] = [
  { id: "RP-1", name: "Raj Kumar", uid: "UHID-2026-1007", complaint: "Chest pain", status: "In Consultation", lastSeen: "24 Aug 2026, 11:20 AM" },
  { id: "RP-2", name: "Priya Sharma", uid: "UHID-2026-1013", complaint: "Headache", status: "Waiting", lastSeen: "24 Aug 2026, 10:35 AM" },
  { id: "RP-3", name: "Amit Verma", uid: "UHID-2026-1012", complaint: "Fever", status: "Waiting", lastSeen: "24 Aug 2026, 10:15 AM" },
  { id: "RP-4", name: "Sneha Das", uid: "UHID-2026-1015", complaint: "Breathing Difficulty", status: "Completed", lastSeen: "24 Aug 2026, 09:45 AM" },
  { id: "RP-5", name: "Rohit Singh", uid: "UHID-2026-1014", complaint: "Diabetes Follow-up", status: "Completed", lastSeen: "24 Aug 2026, 09:20 AM" },
];

// ---------------------------------------------------------------------------
// Recent Notifications
// ---------------------------------------------------------------------------

export type DoctorNotificationKind = "alert" | "document" | "patient" | "prescription";

export interface DoctorNotification {
  id: string;
  kind: DoctorNotificationKind;
  title: string;
  patientName: string;
  time: string;
  unread: boolean;
  /** Only set for notifications that need to visually stand out (e.g. an abnormal lab value) — shown as a "High priority" pill. */
  priority?: "high";
}

export const DOCTOR_NOTIFICATIONS: DoctorNotification[] = [
  { id: "N-1", kind: "alert", title: "Abnormal lab value detected", patientName: "Raj Kumar (Hb: 10.2 g/dL)", time: "10 min ago", unread: true, priority: "high" },
  { id: "N-2", kind: "document", title: "Document uploaded", patientName: "By Priya Sharma", time: "30 min ago", unread: true },
  { id: "N-3", kind: "patient", title: "New patient added", patientName: "Amit Verma", time: "1 hour ago", unread: true },
  { id: "N-4", kind: "prescription", title: "Prescription pending", patientName: "Sneha Das", time: "2 hours ago", unread: true },
];


// ---------------------------------------------------------------------------
// Today's Summary — donut distribution (uses DistributionSlice shape from
// utils/analytics.ts so it can be rendered with the existing DonutChart
// component, same as the admin Reports page).
// ---------------------------------------------------------------------------

export const TODAYS_SUMMARY_SLICES = [
  { label: "Normal Patients", value: 22, percent: 69, colorVar: "var(--mx-blue)" },
  { label: "Priority Patients", value: 3, percent: 9, colorVar: "var(--mx-warning)" },
  { label: "Emergency Patients", value: 2, percent: 6, colorVar: "var(--mx-danger)" },
  { label: "Completed", value: 15, percent: 46, colorVar: "var(--mx-green)" },
];

export const TODAYS_SUMMARY_TOTAL = 32;