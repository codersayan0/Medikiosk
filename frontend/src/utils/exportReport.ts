import type { DistributionSlice, ReportDateRange, SummaryMetrics, TrendPoint } from "./analytics";

/**
 * TODO(real-backend): small, reusable browser-side export utility — the
 * project has no existing export implementation to reuse, so this is kept
 * generic (not embedded in ReportsPage) so any future admin page can call
 * `downloadTextFile` directly. Once a backend report-generation endpoint
 * exists (e.g. GET /admin/analytics/export.pdf), swap `buildReportText` +
 * `downloadTextFile` in ReportsPage for a fetch of that endpoint's file —
 * the trigger/download plumbing here can be reused as-is for the response
 * blob.
 */

export interface ReportExportInput {
  organizationName: string;
  generatedAt: string;
  range: ReportDateRange;
  summary: SummaryMetrics;
  appointmentStatus: DistributionSlice[];
  doctorVerification: DistributionSlice[];
  ageDistribution: DistributionSlice[];
  genderDistribution: DistributionSlice[];
  patientTrend: TrendPoint[];
  appointmentTrend: TrendPoint[];
  applicationsTrend: TrendPoint[];
  recordsTrend: TrendPoint[];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function section(title: string): string {
  return `\n${title}\n${"-".repeat(title.length)}\n`;
}

function trendLines(points: TrendPoint[]): string {
  if (points.length === 0) return "  No data available for this range.\n";
  return points.map((p) => `  ${p.label.padEnd(10)} ${p.value}`).join("\n") + "\n";
}

function distributionLines(slices: DistributionSlice[]): string {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return "  No data available for this range.\n";
  return (
    slices
      .map((s) => `  ${s.label.padEnd(22)} ${s.value} (${Math.round((s.value / total) * 100)}%)`)
      .join("\n") + "\n"
  );
}

/** Builds the full plain-text report body. Deliberately excludes any revenue/billing figures. */
export function buildReportText(input: ReportExportInput): string {
  const { organizationName, generatedAt, range, summary } = input;

  let out = "";
  out += "MEDIKIOSK — HOSPITAL OPERATIONS REPORT\n";
  out += "=".repeat(40) + "\n";
  out += `Organization: ${organizationName}\n`;
  out += `Report Period: ${range.label} (${formatDate(range.start)} – ${formatDate(range.end)})\n`;
  out += `Generated On: ${generatedAt}\n`;

  out += section("SUMMARY METRICS");
  out += `  Total Patients            ${summary.totalPatients}\n`;
  out += `  Active Doctors            ${summary.activeDoctors}\n`;
  out += `  Total Appointments        ${summary.totalAppointments}\n`;
  out += `  Completed Appointments    ${summary.completedAppointments}\n`;
  out += `  Pending Appointments      ${summary.pendingAppointments}\n`;
  out += `  Medical Records           ${summary.medicalRecords}\n`;
  out += `  Doctor Applications       ${summary.doctorApplications}\n`;
  out += `  Verified Doctors          ${summary.verifiedDoctors}\n`;

  out += section("PATIENT REGISTRATION TREND");
  out += trendLines(input.patientTrend);

  out += section("APPOINTMENT TREND");
  out += trendLines(input.appointmentTrend);

  out += section("APPOINTMENT STATUS DISTRIBUTION");
  out += distributionLines(input.appointmentStatus);

  out += section("DOCTOR APPLICATIONS TREND");
  out += trendLines(input.applicationsTrend);

  out += section("DOCTOR VERIFICATION STATISTICS");
  out += distributionLines(input.doctorVerification);

  out += section("MEDICAL RECORDS ACTIVITY");
  out += trendLines(input.recordsTrend);

  out += section("PATIENT DEMOGRAPHICS — AGE GROUPS");
  out += distributionLines(input.ageDistribution);

  out += section("PATIENT DEMOGRAPHICS — GENDER");
  out += distributionLines(input.genderDistribution);

  out += "\n" + "=".repeat(40) + "\n";
  out += "This report contains operational statistics only. No financial or billing data is included.\n";

  return out;
}

/** Triggers a browser download of `content` as a text file named `filename`. */
export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}