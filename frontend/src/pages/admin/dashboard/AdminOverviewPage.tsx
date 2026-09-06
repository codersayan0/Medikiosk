import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Stethoscope,
  ShieldCheck,
  UserPlus,
  Users,
  CalendarClock,
  Building2,
  FolderHeart,
  ClipboardCheck,
  ArrowRight,
  ClipboardList,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useCountUp } from "../../../hooks/useCountUp";
import { useAdmin } from "../../../context/AdminContext";
import { ADMIN_DASHBOARD_ROOT } from "../../../data/adminDashboardNav";
import { ApplicationStatusBadge } from "../../../components/admin/ApplicationStatusBadge";
import { countByStatus } from "../../../utils/doctorApplications";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import type { BadgeTone } from "../../../types";

interface StatCardProps {
  icon: typeof Stethoscope;
  tone: BadgeTone;
  title: string;
  value: number;
  suffix?: string;
}

/** Same visual language as HealthStatusCard, with a first-mount count-up. */
function StatCard({ icon: Icon, tone, title, value, suffix = "" }: StatCardProps) {
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
          <p className="font-display mt-0.5 text-lg font-bold text-mx-ink">
            {display}
            {suffix}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Admin Dashboard homepage. Per the spec, every stat tile here is
 * explicitly NOT "Total Revenue" — this is an operational/verification
 * dashboard, not a billing one. Doctor Applications gets first-class
 * placement (Doctor application activity + Verification statistics) per
 * "Doctor Applications must be a major feature".
 */
export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { applications } = useAdmin();
  const counts = countByStatus(applications);

  // TODO(real-backend): patients/appointments/departments/records/doctors
  // figures below are plausible static mock numbers — the same pattern
  // used elsewhere in this app (see PatientContext's TODO markers) —
  // until the corresponding admin sections (Doctors, Patients,
  // Appointments, Medical Records) are wired to real data. Doctor
  // Application figures ARE live, derived from AdminContext.
  const verifiedDoctors = 28;
  const totalDoctors = verifiedDoctors + counts.verified;
  const totalPatients = 1248;
  const appointmentsToday = 32;
  const activeDepartments = 12;
  const medicalRecordsCount = 3865;

  const recentApplications = [...applications]
    .sort((a, b) => (a.applicationDate < b.applicationDate ? 1 : -1))
    .slice(0, 5);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-mx-ink">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-mx-ink-muted">A snapshot of hospital operations and doctor onboarding.</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer(0.04)}
        initial="hidden"
        animate="show"
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        <StatCard icon={Stethoscope} tone="blue" title="Total Doctors" value={totalDoctors} />
        <StatCard icon={ShieldCheck} tone="green" title="Verified Doctors" value={verifiedDoctors} />
        <StatCard icon={UserPlus} tone="warning" title="Pending Doctor Applications" value={counts.pending} />
        <StatCard icon={Users} tone="purple" title="Total Patients" value={totalPatients} />
        <StatCard icon={CalendarClock} tone="blue" title="Appointments Today" value={appointmentsToday} />
        <StatCard icon={Building2} tone="green" title="Active Departments" value={activeDepartments} />
        <StatCard icon={FolderHeart} tone="purple" title="Medical Records" value={medicalRecordsCount} />
        <StatCard icon={ClipboardCheck} tone="warning" title="Pending Verification" value={counts.pending + counts.underReview} />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doctor application activity</CardTitle>
            <Button variant="ghost" size="sm" icon={<ArrowRight size={14} aria-hidden="true" />} iconPosition="right" onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications`)}>
              View All
            </Button>
          </CardHeader>

          <ul className="divide-y divide-mx-border">
            {recentApplications.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${app.id}`)}
                  className="flex w-full items-center gap-3 py-3 text-left transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mx-purple-soft font-display text-xs font-bold text-mx-purple">
                    {app.personal.fullName.split(" ").slice(-1)[0]?.[0] ?? "D"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-mx-ink">{app.personal.fullName}</p>
                    <p className="text-xs text-mx-ink-muted">{app.professional.specialization} · Applied {app.applicationDate}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification statistics</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4">
            {[
              { label: "Pending", value: counts.pending, tone: "bg-mx-warning" },
              { label: "Under Review", value: counts.underReview, tone: "bg-mx-blue" },
              { label: "Verification Required", value: counts.verificationRequired, tone: "bg-mx-purple" },
              { label: "Verified", value: counts.verified, tone: "bg-mx-green" },
              { label: "Rejected", value: counts.rejected, tone: "bg-mx-danger" },
            ].map((row) => {
              const percent = counts.total ? Math.round((row.value / counts.total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-mx-ink-soft">
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-mx-surface-sunken">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full ${row.tone}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Button variant="outline" icon={<UserPlus size={16} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications`)}>
            Review Doctor Applications
          </Button>
          <Button variant="outline" icon={<ClipboardList size={16} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/reports`)}>
            View Reports
          </Button>
          <Button variant="outline" icon={<Send size={16} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/notifications`)}>
            Send Notification
          </Button>
        </div>
      </Card>
    </div>
  );
}