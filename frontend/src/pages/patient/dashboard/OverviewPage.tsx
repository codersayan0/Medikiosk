import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FileStack,
  CalendarClock,
  ClipboardList,
  AlertCircle,
  Sparkles,
  FlaskConical,
  GanttChartSquare,
  QrCode,
  Download,
  ArrowRight,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  Bell,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ErrorState } from "../../../components/ui/ErrorState";
import {usePatientDataState,} from "../../../context/PatientContext";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { PatientAvatar } from "../../../components/healthcare/PatientAvatar";
import { useCountUp } from "../../../hooks/useCountUp";
import { usePatientRecord } from "../../../context/PatientContext";
import { PATIENT_DASHBOARD_ROOT } from "../../../data/patientDashboardNav";
import type { VisitStatus, LabResultRow, NotificationItem } from "../../../data/patientRecord";
import { cn } from "../../../utils/cn";
import { fadeInUp, staggerContainer, staggerItem } from "../../../utils/motion";


const STAT_TILES = [
  { key: "healthRecords" as const, label: "Health Records", icon: FileStack, tone: "green" as const },
  { key: "recentVisits" as const, label: "Recent Visits", icon: CalendarClock, tone: "blue" as const },
  { key: "prescriptions" as const, label: "Prescriptions", icon: ClipboardList, tone: "purple" as const },
  { key: "pendingActions" as const, label: "Pending Actions", icon: AlertCircle, tone: "warning" as const },
];

const QUICK_ACTIONS = [
  { label: "View Medical Records", path: "records", icon: FileStack },
  { label: "View Lab Reports", path: "records/lab-reports", icon: FlaskConical },
  { label: "View Prescriptions", path: "records/prescriptions", icon: ClipboardList },
  { label: "Medical Timeline", path: "timeline", icon: GanttChartSquare },
  { label: "Health Summary", path: "records/ai-summary", icon: Sparkles },
  { label: "My Health ID", path: "health-id", icon: QrCode },
];

const VISIT_STATUS_TONE: Record<VisitStatus, "green" | "blue" | "warning"> = {
  Completed: "green",
  Confirmed: "blue",
  Pending: "warning",
};

const LAB_STATUS_TONE: Record<LabResultRow["status"], "green" | "warning" | "neutral"> = {
  Normal: "green",
  Low: "warning",
  High: "warning",
  Borderline: "neutral",
};

const NOTIF_ICON: Record<NotificationItem["kind"], typeof FlaskConical> = {
  lab: FlaskConical,
  prescription: ClipboardCheck,
  document: FileText,
  visit: CalendarClock,
  record: Bell,
  system: Bell,
};

/** Stat tile value: counts up from 0 on first mount only (see useCountUp). */
function StatValue({ value }: { value: number }) {
  const display = useCountUp(value);
  return <p className="font-display text-xl font-bold text-mx-ink">{display}</p>;
}

export default function OverviewPage() {
  const patient = usePatientRecord();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const goTo = (path: string) => navigate(path ? `${PATIENT_DASHBOARD_ROOT}/${path}` : PATIENT_DASHBOARD_ROOT);
  const firstName = patient.identity.name.split(" ")[0];
  // Phase 2B — loading/error states: Overview briefly shows its skeleton on
  // mount the way a real fetch would; `retry` re-runs it and doubles as the
  // "Try Again" handler if `simulateError` is ever triggered for QA.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Good Morning, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Here's your health overview.</p>
      </div>

      {/* Top summary cards — staggered fadeInUp on load, numbers count up once per session */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : staggerContainer()}
      >
        {STAT_TILES.map((tile) => (
          <motion.div key={tile.key} variants={prefersReducedMotion ? undefined : staggerItem}>
            <Card className="flex items-center gap-3">
              <MedicalIcon icon={tile.icon} tone={tile.tone} />
              <div>
                <StatValue value={patient.stats[tile.key]} />
                <p className="text-xs font-semibold text-mx-ink-muted">{tile.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 lg:grid-cols-3"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        {/* Patient Health ID card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Health ID</CardTitle>
            {patient.identity.verified && (
              <Badge tone="green" icon={<ShieldCheck size={12} aria-hidden="true" />}>
                Verified
              </Badge>
            )}
          </CardHeader>
          <div className="flex items-center gap-3">
            <PatientAvatar gender={patient.identity.gender} imageUrl={patient.identity.photoUrl} size={56} />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold text-mx-ink">{patient.identity.name}</p>
              <p className="text-xs text-mx-ink-muted">
                {patient.identity.age} Years · {patient.identity.gender}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-mx-ink-muted">Patient UID</dt>
              <dd className="font-mono font-semibold text-mx-ink">{patient.identity.uid}</dd>
            </div>
          </dl>
          <Button size="sm" variant="outline" fullWidth className="mt-4" onClick={() => goTo("health-id")}>
            View My Health ID
          </Button>
        </Card>

        {/* AI Health Summary card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>AI Health Summary</CardTitle>
              <Badge tone="purple" icon={<Sparkles size={11} aria-hidden="true" />}>
                AI-generated
              </Badge>
              {patient.aiSummaryMeta.patientModified && <Badge tone="blue">Patient-modified</Badge>}
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {patient.aiHealthSummary.map((row) => (
              <div key={row.label} className="border-b border-mx-border pb-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">{row.label}</p>
                <p className="truncate text-sm text-mx-ink" title={row.value}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-mx-ink-muted">
            This summary is AI-generated and informational only — it does not replace professional diagnosis.
          </p>
          <Button variant="ghost" size="sm" className="mt-2" icon={<ArrowRight size={14} aria-hidden="true" />} iconPosition="right" onClick={() => goTo("records/ai-summary")}>
            View Full AI Health Summary
          </Button>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        {/* Recent Lab Report card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {patient.recentLabReport.title} — {patient.recentLabReport.date}
            </CardTitle>
          </CardHeader>

          {/* Table on larger screens */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">
                  <th className="pb-2 pr-2">Test</th>
                  <th className="pb-2 pr-2">Result</th>
                  <th className="pb-2 pr-2">Reference Range</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {patient.recentLabReport.rows.map((row) => (
                  <tr key={row.test} className="border-t border-mx-border">
                    <td className="py-2 pr-2 font-semibold text-mx-ink">{row.test}</td>
                    <td className="py-2 pr-2 text-mx-ink">{row.result}</td>
                    <td className="py-2 pr-2 text-mx-ink-muted">{row.referenceRange}</td>
                    <td className="py-2">
                      <Badge tone={LAB_STATUS_TONE[row.status]}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked cards on mobile — tables don't fit narrow widths */}
          <div className="space-y-2 sm:hidden">
            {patient.recentLabReport.rows.map((row) => (
              <div key={row.test} className="rounded-mx-md border border-mx-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-mx-ink">{row.test}</p>
                  <Badge tone={LAB_STATUS_TONE[row.status]}>{row.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-mx-ink">{row.result}</p>
                <p className="text-xs text-mx-ink-muted">Ref: {row.referenceRange}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button size="sm" variant="outline" className="sm:flex-1" onClick={() => goTo("records/lab-reports")}>
              View Full Report
            </Button>
            <Button size="sm" variant="ghost" className="sm:flex-1" onClick={() => goTo("records/lab-reports")}>
              View All Lab Reports
            </Button>
          </div>
        </Card>

        {/* Recent/Upcoming Visits card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent &amp; Upcoming Visits</CardTitle>
          </CardHeader>
          <motion.ul
            className="space-y-3"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={prefersReducedMotion ? undefined : staggerContainer()}
          >
            {patient.visits.map((visit) => (
              <motion.li
                key={visit.id}
                variants={prefersReducedMotion ? undefined : staggerItem}
                className="flex items-start justify-between gap-3 rounded-mx-sm border-b border-mx-border px-1.5 pb-3 pt-1 transition-colors duration-150 last:border-b-0 last:pb-0 hover:bg-mx-surface-sunken"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-mx-ink">{visit.reason}</p>
                  <p className="text-xs text-mx-ink-muted">
                    {visit.date} · {visit.time}
                  </p>
                  <p className="text-xs text-mx-ink-muted">
                    {visit.doctorName}
                    {visit.department ? ` · ${visit.department}` : ""}
                  </p>
                </div>
                <Badge tone={VISIT_STATUS_TONE[visit.status]} className="shrink-0">
                  {visit.status}
                </Badge>
              </motion.li>
            ))}
          </motion.ul>
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => goTo("visits")}>
            View All Visits
          </Button>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        {/* Latest Prescription card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Latest Prescription — {patient.latestPrescription.date}
            </CardTitle>
          </CardHeader>
          <p className="mb-2 text-xs text-mx-ink-muted">{patient.latestPrescription.doctorName}</p>
          <motion.ul
            className="space-y-2"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={prefersReducedMotion ? undefined : staggerContainer()}
          >
            {patient.latestPrescription.medicines.map((med) => (
              <motion.li
                key={med.name}
                variants={prefersReducedMotion ? undefined : staggerItem}
                className="flex items-center justify-between gap-2 rounded-mx-sm bg-mx-surface-sunken px-3 py-2 text-sm transition-colors duration-150 hover:bg-mx-border-strong/40"
              >
                <span className="font-semibold text-mx-ink">{med.name}</span>
                <span className="text-xs text-mx-ink-muted">
                  {med.dosage} · {med.duration}
                </span>
              </motion.li>
            ))}
          </motion.ul>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button size="sm" variant="outline" className="sm:flex-1" onClick={() => goTo("records/prescriptions")}>
              View Prescription
            </Button>
            <Button size="sm" variant="ghost" icon={<Download size={14} aria-hidden="true" />} className="sm:flex-1" onClick={() => goTo("records/prescriptions")}>
              Download
            </Button>
          </div>
        </Card>

        {/* Recent Notifications card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <motion.ul
            className="space-y-3"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={prefersReducedMotion ? undefined : staggerContainer()}
          >
            {patient.notifications.slice(0, 5).map((n) => {
              const Icon = NOTIF_ICON[n.kind];
              return (
                <motion.li
                  key={n.id}
                  variants={prefersReducedMotion ? undefined : staggerItem}
                  className="flex items-start gap-3 rounded-mx-sm p-1.5 transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <MedicalIcon icon={Icon} tone="blue" size={16} className="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-mx-ink">{n.title}</p>
                    <p className="text-xs text-mx-ink-muted">{n.description}</p>
                    <p className="text-[11px] text-mx-ink-muted">{n.timestamp}</p>
                  </div>
                  <span
                    className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-mx-green")}
                    aria-hidden="true"
                  />
                </motion.li>
              );
            })}
          </motion.ul>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <h2 className="font-display mb-3 text-base font-bold text-mx-ink">Quick Actions</h2>
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={prefersReducedMotion ? undefined : staggerContainer()}
        >
          {QUICK_ACTIONS.map((action) => (
            <motion.div key={action.label} variants={prefersReducedMotion ? undefined : staggerItem}>
              <Card
                interactive
                className="group flex flex-col items-center gap-2 py-5 text-center"
                onClick={() => goTo(action.path)}
              >
                <MedicalIcon icon={action.icon} tone="green" className="transition-transform duration-150 ease-out group-hover:scale-110" />
                <span className="text-xs font-semibold text-mx-ink">{action.label}</span>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Privacy strip */}
      <motion.div
        className="flex flex-col items-center gap-2 rounded-mx-lg border border-mx-green/20 bg-mx-green-soft px-4 py-4 text-center sm:flex-row sm:justify-center sm:text-left"
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <ShieldCheck size={18} className="shrink-0 text-mx-green-strong" aria-hidden="true" />
        <p className="text-xs font-semibold text-mx-green-strong">
          Your health information is private and secure. Your data is encrypted and only accessible by authorized healthcare professionals.{" "}
          <button type="button" className="underline underline-offset-2">
            Learn More
          </button>
        </p>
      </motion.div>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-mx-ink-muted sm:hidden">
        <Upload size={12} aria-hidden="true" />
        Tip: tap Quick Actions to jump straight to a section.
      </div>
    </div>
  );
}