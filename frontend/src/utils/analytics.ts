import type { Appointment, AppointmentStatus, DoctorApplication, DoctorApplicationStatus, MedicalRecord, Patient, VerificationAuditEventType } from "../types";

/**
 * TODO(real-backend): this is the frontend analytics aggregation layer for
 * the admin Reports & Analytics page. It derives every chart/summary value
 * from the SAME data sources already powering Patients, Appointments,
 * Medical Records, and Doctor Applications (MOCK_PATIENTS,
 * MOCK_APPOINTMENTS, MOCK_MEDICAL_RECORDS, AdminContext's `applications`) —
 * no unrelated/fake data model is introduced. Once dedicated analytics
 * endpoints exist (e.g. GET /admin/analytics/summary,
 * GET /admin/analytics/trends), swap the call sites in ReportsPage for real
 * responses; the shapes below (SummaryMetrics, TrendPoint[], DistributionSlice[])
 * are kept intentionally close to what those endpoints would plausibly return.
 */

// ---------------------------------------------------------------------------
// Date range filter
// ---------------------------------------------------------------------------

export type ReportDateRangeId = "today" | "7d" | "30d" | "3m" | "custom";

export interface ReportDateRange {
  id: ReportDateRangeId;
  start: Date;
  end: Date;
  label: string;
}

/** Parses the "DD Mon YYYY" display-date format used across mock data (e.g. "24 Aug 2026"). */
export function parseDisplayDate(value: string): Date {
  // Also tolerates ISO ("YYYY-MM-DD") strings used by Appointment/MedicalRecord.
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(NaN);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** Resolves a filter id (+ optional custom bounds) into a concrete start/end Date range. */
export function resolveDateRange(id: ReportDateRangeId, customStart?: string, customEnd?: string): ReportDateRange {
  const now = new Date();
  const today = startOfDay(now);

  switch (id) {
    case "today":
      return { id, start: today, end: endOfDay(now), label: "Today" };
    case "7d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { id, start, end: endOfDay(now), label: "Last 7 Days" };
    }
    case "30d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { id, start, end: endOfDay(now), label: "Last 30 Days" };
    }
    case "3m": {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 3);
      return { id, start, end: endOfDay(now), label: "Last 3 Months" };
    }
    case "custom": {
      const start = customStart ? startOfDay(parseDisplayDate(customStart)) : today;
      const end = customEnd ? endOfDay(parseDisplayDate(customEnd)) : endOfDay(now);
      return { id, start, end, label: "Custom Range" };
    }
  }
}

function isWithinRange(date: Date, range: ReportDateRange): boolean {
  if (Number.isNaN(date.getTime())) return false;
  return date >= range.start && date <= range.end;
}

// ---------------------------------------------------------------------------
// Filtering data sources by range
// ---------------------------------------------------------------------------

export function filterPatientsByRange(patients: Patient[], range: ReportDateRange): Patient[] {
  return patients.filter((p) => isWithinRange(parseDisplayDate(p.registeredOn), range));
}

export function filterAppointmentsByRange(appointments: Appointment[], range: ReportDateRange): Appointment[] {
  return appointments.filter((a) => isWithinRange(parseDisplayDate(a.date), range));
}

export function filterRecordsByRange(records: MedicalRecord[], range: ReportDateRange): MedicalRecord[] {
  return records.filter((r) => isWithinRange(parseDisplayDate(r.date), range));
}

export function filterApplicationsByRange(applications: DoctorApplication[], range: ReportDateRange): DoctorApplication[] {
  return applications.filter((a) => isWithinRange(parseDisplayDate(a.applicationDate), range));
}

// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

export interface SummaryMetrics {
  totalPatients: number;
  activeDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  medicalRecords: number;
  doctorApplications: number;
  verifiedDoctors: number;
}

export function buildSummaryMetrics(params: {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  applications: DoctorApplication[];
  baselineVerifiedDoctors: number;
}): SummaryMetrics {
  const { patients, appointments, records, applications, baselineVerifiedDoctors } = params;
  const verifiedFromApplications = applications.filter((a) => a.status === "verified").length;
  const activeVerified = applications.filter((a) => a.status === "verified" && (a.doctorStatus ?? "active") === "active").length;

  return {
    totalPatients: patients.length,
    activeDoctors: baselineVerifiedDoctors + activeVerified,
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter((a) => a.status === "completed").length,
    pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    medicalRecords: records.length,
    doctorApplications: applications.length,
    verifiedDoctors: baselineVerifiedDoctors + verifiedFromApplications,
  };
}

// ---------------------------------------------------------------------------
// Trend series (time-bucketed counts)
// ---------------------------------------------------------------------------

export interface TrendPoint {
  label: string;
  value: number;
}

type BucketGranularity = "day" | "week" | "month";

function pickGranularity(range: ReportDateRange): BucketGranularity {
  const spanDays = Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000);
  if (spanDays <= 31) return "day";
  if (spanDays <= 120) return "week";
  return "month";
}

function bucketKey(date: Date, granularity: BucketGranularity): string {
  if (granularity === "day") return date.toISOString().slice(0, 10);
  if (granularity === "month") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  // Week bucket: ISO-ish — year + week-of-year approximation.
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - firstDayOfYear.getTime()) / 86_400_000 + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

function bucketLabel(key: string, granularity: BucketGranularity): string {
  if (granularity === "day") {
    const d = new Date(key);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }
  if (granularity === "month") {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  return key.replace(/^\d{4}-/, "");
}

/** Builds an ordered, gap-filled trend series across the full range for the given event dates. */
export function buildTrendSeries(dates: Date[], range: ReportDateRange): TrendPoint[] {
  const granularity = pickGranularity(range);
  const counts = new Map<string, number>();
  for (const d of dates) {
    if (!isWithinRange(d, range)) continue;
    const key = bucketKey(d, granularity);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Walk every bucket in the range so the chart never silently skips empty periods.
  const points: TrendPoint[] = [];
  const cursor = new Date(range.start);
  const seen = new Set<string>();
  const step = () => {
    if (granularity === "day") cursor.setDate(cursor.getDate() + 1);
    else if (granularity === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setMonth(cursor.getMonth() + 1);
  };

  let guard = 0;
  while (cursor <= range.end && guard < 400) {
    const key = bucketKey(cursor, granularity);
    if (!seen.has(key)) {
      seen.add(key);
      points.push({ label: bucketLabel(key, granularity), value: counts.get(key) ?? 0 });
    }
    step();
    guard += 1;
  }
  return points;
}

// ---------------------------------------------------------------------------
// Distributions
// ---------------------------------------------------------------------------

export interface DistributionSlice {
  label: string;
  value: number;
  colorVar: string;
}

const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = ["completed", "confirmed", "pending", "cancelled"];
const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  completed: "Completed",
  confirmed: "Scheduled",
  pending: "Pending",
  cancelled: "Cancelled",
};
const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  completed: "var(--mx-green)",
  confirmed: "var(--mx-blue)",
  pending: "var(--mx-warning)",
  cancelled: "var(--mx-danger)",
};

export function buildAppointmentStatusDistribution(appointments: Appointment[]): DistributionSlice[] {
  return APPOINTMENT_STATUS_ORDER.map((status) => ({
    label: APPOINTMENT_STATUS_LABELS[status],
    value: appointments.filter((a) => a.status === status).length,
    colorVar: APPOINTMENT_STATUS_COLORS[status],
  }));
}

/**
 * Doctor verification distribution, restricted to states the existing
 * Doctor Application implementation actually supports (see
 * DoctorApplicationStatus in types/index.ts): pending + under_review are
 * combined into "Pending", verification_required maps to "More Information
 * Requested", verified/rejected map 1:1.
 */
export function buildDoctorVerificationDistribution(applications: DoctorApplication[]): DistributionSlice[] {
  const pending = applications.filter((a): a is DoctorApplication & { status: DoctorApplicationStatus } => a.status === "pending" || a.status === "under_review").length;
  const moreInfo = applications.filter((a) => a.status === "verification_required").length;
  const verified = applications.filter((a) => a.status === "verified").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  return [
    { label: "Verified", value: verified, colorVar: "var(--mx-green)" },
    { label: "Pending", value: pending, colorVar: "var(--mx-warning)" },
    { label: "More Info Requested", value: moreInfo, colorVar: "var(--mx-purple)" },
    { label: "Rejected", value: rejected, colorVar: "var(--mx-danger)" },
  ];
}

// ---------------------------------------------------------------------------
// Demographics — derived only from fields that already exist on Patient
// ---------------------------------------------------------------------------

const AGE_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "0–17", min: 0, max: 17 },
  { label: "18–34", min: 18, max: 34 },
  { label: "35–50", min: 35, max: 50 },
  { label: "51–65", min: 51, max: 65 },
  { label: "66+", min: 66, max: 200 },
];

export function buildAgeDistribution(patients: Patient[]): DistributionSlice[] {
  return AGE_BUCKETS.map((bucket, i) => ({
    label: bucket.label,
    value: patients.filter((p) => p.age >= bucket.min && p.age <= bucket.max).length,
    colorVar: ["var(--mx-green)", "var(--mx-blue)", "var(--mx-purple)", "var(--mx-warning)", "var(--mx-danger)"][i % 5],
  }));
}

export function buildGenderDistribution(patients: Patient[]): DistributionSlice[] {
  const unique = Array.from(new Set(patients.map((p) => p.gender)));
  const palette = ["var(--mx-blue)", "var(--mx-purple)", "var(--mx-green)", "var(--mx-warning)"];
  return unique.map((gender, i) => ({
    label: gender,
    value: patients.filter((p) => p.gender === gender).length,
    colorVar: palette[i % palette.length],
  }));
}

// ---------------------------------------------------------------------------
// Doctor verification trend — derived from each application's own
// auditHistory (application_submitted / application_approved /
// application_rejected / correction_requested), the same append-only trail
// already used by VerificationAuditHistory.tsx. No new event types or data
// are introduced — only states the existing implementation logs.
// ---------------------------------------------------------------------------

function extractAuditEventDates(applications: DoctorApplication[], eventType: VerificationAuditEventType): Date[] {
  const dates: Date[] = [];
  for (const app of applications) {
    for (const event of app.auditHistory) {
      if (event.type === eventType) dates.push(parseDisplayDate(event.timestamp));
    }
  }
  return dates;
}

export interface NamedTrendSeries {
  name: string;
  colorVar: string;
  points: TrendPoint[];
}

/**
 * All applications (not just those in the current date-range filter) are
 * scanned for audit events, since a doctor's verification event may have
 * happened before the application's own `applicationDate` cutoff used
 * elsewhere — the range filter is applied to the audit-event dates
 * themselves, matching how a real "events in this period" endpoint would
 * behave.
 */
export function buildDoctorVerificationTrend(allApplications: DoctorApplication[], range: ReportDateRange): NamedTrendSeries[] {
  return [
    { name: "Submitted", colorVar: "var(--mx-blue)", points: buildTrendSeries(extractAuditEventDates(allApplications, "application_submitted"), range) },
    { name: "Verified", colorVar: "var(--mx-green)", points: buildTrendSeries(extractAuditEventDates(allApplications, "application_approved"), range) },
    { name: "More Info Requested", colorVar: "var(--mx-purple)", points: buildTrendSeries(extractAuditEventDates(allApplications, "correction_requested"), range) },
    { name: "Rejected", colorVar: "var(--mx-danger)", points: buildTrendSeries(extractAuditEventDates(allApplications, "application_rejected"), range) },
  ];
}

export const REPORT_RANGE_OPTIONS: Array<{ id: ReportDateRangeId; label: string }> = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "3m", label: "Last 3 Months" },
  { id: "custom", label: "Custom Range" },
];