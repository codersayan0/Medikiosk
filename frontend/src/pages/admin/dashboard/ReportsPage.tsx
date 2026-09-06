import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Stethoscope,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderHeart,
  UserPlus,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ErrorState } from "../../../components/ui/ErrorState";
import { DashboardSkeleton } from "../../../components/ui/Skeleton";
import { ReportDateFilterBar } from "../../../components/admin/ReportDateFilterBar";
import { TrendChart } from "../../../components/admin/charts/TrendChart";
import { DonutChart } from "../../../components/admin/charts/DonutChart";
import { DistributionBarList } from "../../../components/admin/charts/DistributionBarList";
import { useAdmin } from "../../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import { useSimulatedLoad } from "../../../hooks/useSimulatedLoad";
import { useCountUp } from "../../../hooks/useCountUp";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import { MOCK_PATIENTS } from "../../../data/mockPatients";
import { MOCK_APPOINTMENTS } from "../../../data/mockAppointments";
import { MOCK_MEDICAL_RECORDS } from "../../../data/mockMedicalRecords";
import { downloadTextFile, buildReportText } from "../../../utils/exportReport";
import {
  resolveDateRange,
  filterPatientsByRange,
  filterAppointmentsByRange,
  filterRecordsByRange,
  filterApplicationsByRange,
  buildSummaryMetrics,
  buildTrendSeries,
  buildAppointmentStatusDistribution,
  buildDoctorVerificationDistribution,
  buildDoctorVerificationTrend,
  buildAgeDistribution,
  buildGenderDistribution,
  parseDisplayDate,
  type ReportDateRangeId,
} from "../../../utils/analytics";
import type { BadgeTone } from "../../../types";

// Mirrors the same frontend-only baseline used by AdminOverviewPage.tsx
// (doctors who are part of the organization outside the Doctor Applications
// pipeline) — see the TODO(real-backend) note there. Not date-filtered,
// since these doctors aren't tied to an application event.
const BASELINE_VERIFIED_DOCTORS = 28;

interface StatTileProps {
  icon: typeof Users;
  tone: BadgeTone;
  title: string;
  value: number;
}

/** Same visual language as AdminOverviewPage's local StatCard, kept page-scoped here for the same reason that one is. */
function StatTile({ icon: Icon, tone, title, value }: StatTileProps) {
  const display = useCountUp(value);
  const TONE_BG: Record<BadgeTone, string> = {
    neutral: "bg-mx-surface-sunken text-mx-ink-soft",
    green: "bg-mx-green-soft text-mx-green-strong",
    purple: "bg-mx-purple-soft text-mx-purple",
    blue: "bg-mx-blue-soft text-mx-blue",
    danger: "bg-mx-danger-soft text-mx-danger",
    warning: "bg-mx-warning-soft text-mx-warning",
  };

  return (
    <motion.div variants={staggerItem}>
      <Card className="flex flex-col gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-mx-md ${TONE_BG[tone]}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold text-mx-ink-muted">{title}</p>
          <p className="font-display mt-0.5 text-lg font-bold text-mx-ink">{display}</p>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Admin Reports & Analytics page (replaces the "coming soon" placeholder —
 * see routes/index.tsx). Every figure here is derived from the SAME data
 * already powering Patients, Appointments, Medical Records, and Doctor
 * Applications (see utils/analytics.ts) — deliberately no revenue/billing
 * metrics, matching the operational-not-financial framing used throughout
 * the admin dashboard (see AdminOverviewPage.tsx's own note on this).
 *
 * TODO(real-backend): swap MOCK_PATIENTS / MOCK_APPOINTMENTS /
 * MOCK_MEDICAL_RECORDS for real GET /admin/patients, /admin/appointments,
 * /admin/medical-records responses (see their respective mock files);
 * `applications` already comes live from AdminContext. Once dedicated
 * analytics endpoints exist, the aggregation in utils/analytics.ts can be
 * replaced by direct API responses with no change to this page's JSX.
 */
export default function ReportsPage() {
  const { applications, organization } = useAdmin();
  const { showToast } = useToast();
  const { loading, failed, retry } = useSimulatedLoad();

  const [rangeId, setRangeId] = useState<ReportDateRangeId>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedCustomStart, setAppliedCustomStart] = useState("");
  const [appliedCustomEnd, setAppliedCustomEnd] = useState("");
  const [computeError, setComputeError] = useState<string | null>(null);

  const range = useMemo(
    () => resolveDateRange(rangeId, appliedCustomStart, appliedCustomEnd),
    [rangeId, appliedCustomStart, appliedCustomEnd]
  );

  const analytics = useMemo(() => {
    try {
      setComputeError(null);
      const patients = filterPatientsByRange(MOCK_PATIENTS, range);
      const appointments = filterAppointmentsByRange(MOCK_APPOINTMENTS, range);
      const records = filterRecordsByRange(MOCK_MEDICAL_RECORDS, range);
      const rangeApplications = filterApplicationsByRange(applications, range);

      const summary = buildSummaryMetrics({
        patients,
        appointments,
        records,
        applications: rangeApplications,
        baselineVerifiedDoctors: BASELINE_VERIFIED_DOCTORS,
      });

      return {
        summary,
        patients,
        appointments,
        records,
        rangeApplications,
        patientTrend: buildTrendSeries(patients.map((p) => parseDisplayDate(p.registeredOn)), range),
        appointmentTrend: buildTrendSeries(appointments.map((a) => parseDisplayDate(a.date)), range),
        recordsTrend: buildTrendSeries(records.map((r) => parseDisplayDate(r.date)), range),
        applicationsTrend: buildTrendSeries(rangeApplications.map((a) => parseDisplayDate(a.applicationDate)), range),
        appointmentStatus: buildAppointmentStatusDistribution(appointments),
        doctorVerification: buildDoctorVerificationDistribution(rangeApplications),
        doctorVerificationTrend: buildDoctorVerificationTrend(applications, range),
        ageDistribution: buildAgeDistribution(patients),
        genderDistribution: buildGenderDistribution(patients),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setComputeError(err?.message ?? "Something went wrong while building your analytics.");
      return null;
    }
  }, [applications, range]);

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    setAppliedCustomStart(customStart);
    setAppliedCustomEnd(customEnd);
  };

  const handleResetCustom = () => {
    setCustomStart("");
    setCustomEnd("");
    setAppliedCustomStart("");
    setAppliedCustomEnd("");
    setRangeId("30d");
  };

  const handleSelectRange = (id: ReportDateRangeId) => {
    setRangeId(id);
    if (id !== "custom") {
      setAppliedCustomStart("");
      setAppliedCustomEnd("");
    }
  };

  const handleExport = () => {
    if (!analytics) return;
    const text = buildReportText({
      organizationName: organization.organizationName || "MediKiosk Organization",
      generatedAt: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }),
      range,
      summary: analytics.summary,
      appointmentStatus: analytics.appointmentStatus,
      doctorVerification: analytics.doctorVerification,
      ageDistribution: analytics.ageDistribution,
      genderDistribution: analytics.genderDistribution,
      patientTrend: analytics.patientTrend,
      appointmentTrend: analytics.appointmentTrend,
      applicationsTrend: analytics.applicationsTrend,
      recordsTrend: analytics.recordsTrend,
    });
    const filename = `medikiosk-report-${range.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTextFile(filename, text);
    showToast({ tone: "success", title: "Report exported", description: `${filename} has started downloading.` });
  };

  if (loading) return <DashboardSkeleton />;

  if (failed || computeError || !analytics) {
    return (
      <div>
        <h1 className="font-display mb-5 text-xl font-bold text-mx-ink">Reports &amp; Analytics</h1>
        <ErrorState
          title="Unable to load analytics"
          description={computeError ?? "Something went wrong while fetching this data. Please try again."}
          onRetry={retry}
        />
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-mx-ink">Reports &amp; Analytics</h1>
          <p className="mt-1 text-sm text-mx-ink-muted">Operational insights across patients, doctors, appointments, and records.</p>
        </div>
        <Button variant="primary" icon={<Download size={16} aria-hidden="true" />} onClick={handleExport}>
          Export Report
        </Button>
      </div>

      <Card className="mb-5">
        <ReportDateFilterBar
          activeId={rangeId}
          onSelect={handleSelectRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onApplyCustom={handleApplyCustom}
          onResetCustom={handleResetCustom}
        />
      </Card>

      <motion.div
        variants={staggerContainer(0.04)}
        initial="hidden"
        animate="show"
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        <StatTile icon={Users} tone="purple" title="Total Patients" value={summary.totalPatients} />
        <StatTile icon={Stethoscope} tone="blue" title="Active Doctors" value={summary.activeDoctors} />
        <StatTile icon={CalendarClock} tone="blue" title="Total Appointments" value={summary.totalAppointments} />
        <StatTile icon={CheckCircle2} tone="green" title="Completed Appointments" value={summary.completedAppointments} />
        <StatTile icon={Clock} tone="warning" title="Pending Appointments" value={summary.pendingAppointments} />
        <StatTile icon={FolderHeart} tone="purple" title="Medical Records" value={summary.medicalRecords} />
        <StatTile icon={UserPlus} tone="warning" title="Doctor Applications" value={summary.doctorApplications} />
        <StatTile icon={ShieldCheck} tone="green" title="Verified Doctors" value={summary.verifiedDoctors} />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Registration Trend</CardTitle>
          </CardHeader>
          <TrendChart
            ariaLabel="Patient registrations over the selected period"
            series={[{ name: "Registrations", colorVar: "var(--mx-purple)", points: analytics.patientTrend }]}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Trend</CardTitle>
          </CardHeader>
          <TrendChart
            ariaLabel="Appointments booked over the selected period"
            series={[{ name: "Appointments", colorVar: "var(--mx-blue)", points: analytics.appointmentTrend }]}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
          </CardHeader>
          <DonutChart ariaLabel="Breakdown of appointments by status" slices={analytics.appointmentStatus} centerLabel="Appointments" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Applications Trend</CardTitle>
          </CardHeader>
          <TrendChart
            ariaLabel="Doctor applications submitted over the selected period"
            series={[{ name: "Applications", colorVar: "var(--mx-green)", points: analytics.applicationsTrend }]}
          />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doctor Verification Trend</CardTitle>
          </CardHeader>
          <TrendChart ariaLabel="Doctor verification pipeline activity over the selected period" series={analytics.doctorVerificationTrend} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Verification Statistics</CardTitle>
          </CardHeader>
          <DonutChart ariaLabel="Breakdown of doctor applications by verification status" slices={analytics.doctorVerification} centerLabel="Applications" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Records Activity</CardTitle>
          </CardHeader>
          <TrendChart
            ariaLabel="Medical records created over the selected period"
            series={[{ name: "Records", colorVar: "var(--mx-warning)", points: analytics.recordsTrend }]}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics — Age Groups</CardTitle>
          </CardHeader>
          <DistributionBarList ariaLabel="Patients by age group" slices={analytics.ageDistribution} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics — Gender</CardTitle>
          </CardHeader>
          <DistributionBarList ariaLabel="Patients by gender" slices={analytics.genderDistribution} />
        </Card>
      </div>
    </div>
  );
}