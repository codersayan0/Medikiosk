import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  Briefcase,
  CalendarClock,
  FileText,
  History,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs, type SegmentedTab } from "../../../components/ui/SegmentedTabs";
import { ListPageSkeleton } from "../../../components/ui/Skeleton";
import { DoctorStatusBadge, getDoctorDisplayStatus, type DoctorDisplayStatus } from "../../../components/admin/DoctorStatusBadge";
import { DoctorActionsMenu } from "../../../components/admin/DoctorActionsMenu";
import { DoctorDocumentsModal } from "../../../components/admin/DoctorDocumentsModal";
import { SuspendDoctorModal } from "../../../components/admin/SuspendDoctorModal";
import { VerificationAuditHistory } from "../../../components/admin/VerificationAuditHistory";
import { useAdmin } from "../../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import { ADMIN_DASHBOARD_ROOT } from "../../../data/adminDashboardNav";
import { useSimulatedLoad } from "../../../hooks/useSimulatedLoad";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import type { DoctorApplication } from "../../../types";

type FilterTab = "all" | DoctorDisplayStatus;

/**
 * Admin Doctors directory (spec §1). Distinct from the Doctor Applications
 * review flow: this page is the org-facing "who is currently part of our
 * organization" view. It lists every application that isn't rejected —
 * verified doctors (active or suspended) plus applications still moving
 * through verification, shown here as "Pending" for quick visibility —
 * and lets the admin manage an existing doctor's account status.
 * Approving/rejecting/verifying documents itself always happens on the
 * Doctor Applications page; this page never duplicates that workflow.
 */
export default function DoctorsPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  return applicationId ? <DoctorProfile applicationId={applicationId} /> : <DoctorsList />;
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

function DoctorsList() {
  const navigate = useNavigate();
  const { applications, suspendDoctor, activateDoctor } = useAdmin();
  const { showToast } = useToast();
  const { loading } = useSimulatedLoad();
  const [tab, setTab] = useState<FilterTab>("all");
  const [documentsFor, setDocumentsFor] = useState<DoctorApplication | null>(null);
  const [historyFor, setHistoryFor] = useState<DoctorApplication | null>(null);
  const [statusAction, setStatusAction] = useState<{ app: DoctorApplication; mode: "suspend" | "activate" } | null>(null);

  const doctors = useMemo(() => applications.filter((a) => a.status !== "rejected"), [applications]);

  const counts = useMemo(
    () => ({
      all: doctors.length,
      verified: doctors.filter((a) => getDoctorDisplayStatus(a) === "verified").length,
      pending: doctors.filter((a) => getDoctorDisplayStatus(a) === "pending").length,
      suspended: doctors.filter((a) => getDoctorDisplayStatus(a) === "suspended").length,
    }),
    [doctors]
  );

  const tabs: SegmentedTab<FilterTab>[] = [
    { id: "all", label: "All Doctors", count: counts.all },
    { id: "verified", label: "Verified", count: counts.verified },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "suspended", label: "Suspended", count: counts.suspended },
  ];

  const filtered = useMemo(
    () => (tab === "all" ? doctors : doctors.filter((a) => getDoctorDisplayStatus(a) === tab)),
    [doctors, tab]
  );

  const joinedLabel = (app: DoctorApplication) =>
    getDoctorDisplayStatus(app) === "pending" ? `Applied ${app.applicationDate}` : app.verifiedAt ?? app.applicationDate;

  const openProfile = (app: DoctorApplication) => {
    const status = getDoctorDisplayStatus(app);
    navigate(
      status === "pending"
        ? `${ADMIN_DASHBOARD_ROOT}/doctor-applications/${app.id}`
        : `${ADMIN_DASHBOARD_ROOT}/doctors/${app.id}`
    );
  };

  const handleSuspend = (reason: string) => {
    if (!statusAction) return;
    suspendDoctor(statusAction.app.id, reason);
    showToast({ tone: "warning", title: "Doctor suspended", description: `${statusAction.app.personal.fullName}'s account has been suspended.` });
    setStatusAction(null);
  };

  const handleActivate = () => {
    if (!statusAction) return;
    activateDoctor(statusAction.app.id);
    showToast({ tone: "success", title: "Doctor activated", description: `${statusAction.app.personal.fullName}'s account is active again.` });
    setStatusAction(null);
  };

  if (loading) return <ListPageSkeleton rows={6} />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-mx-ink">Doctors</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Manage every doctor currently onboarded — or onboarding — to your organization.</p>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <SegmentedTabs tabs={tabs} active={tab} onChange={setTab} layoutGroupId="doctors-tabs" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No doctors in this filter" description="Doctors matching this status will appear here." />
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="mx-scrollbar hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="border-y border-mx-border bg-mx-surface-sunken text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                    <th className="px-5 py-3 font-semibold">Doctor</th>
                    <th className="px-3 py-3 font-semibold">Specialization</th>
                    <th className="px-3 py-3 font-semibold">Department</th>
                    <th className="px-3 py-3 font-semibold">Registration No.</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer(0.035)} initial="hidden" animate="show">
                  {filtered.map((app) => (
                    <motion.tr
                      key={app.id}
                      variants={staggerItem}
                      onClick={() => openProfile(app)}
                      className="cursor-pointer border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={app.personal.fullName} size={34} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-mx-ink">{app.personal.fullName}</p>
                            <p className="text-xs text-mx-ink-muted">{app.professional.experienceYears} yrs experience</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-mx-ink-soft">{app.professional.specialization}</td>
                      <td className="px-3 py-3 text-mx-ink-soft">{app.organization.department}</td>
                      <td className="px-3 py-3 text-mx-ink-soft">{app.professional.registrationNumber}</td>
                      <td className="px-3 py-3">
                        <DoctorStatusBadge application={app} />
                      </td>
                      <td className="px-3 py-3 text-mx-ink-soft">{joinedLabel(app)}</td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <DoctorActionsMenu
                            application={app}
                            onViewDocuments={() => setDocumentsFor(app)}
                            onViewHistory={() => setHistoryFor(app)}
                            onSuspend={() => setStatusAction({ app, mode: "suspend" })}
                            onActivate={() => setStatusAction({ app, mode: "activate" })}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <motion.div variants={staggerContainer(0.035)} initial="hidden" animate="show" className="flex flex-col gap-3 p-4 sm:hidden">
              {filtered.map((app) => (
                <motion.div key={app.id} variants={staggerItem}>
                  <Card interactive onClick={() => openProfile(app)} className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.personal.fullName} size={36} />
                        <div>
                          <p className="font-semibold text-mx-ink">{app.personal.fullName}</p>
                          <p className="text-xs text-mx-ink-muted">{app.professional.specialization} · {app.organization.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <DoctorStatusBadge application={app} />
                        <DoctorActionsMenu
                          application={app}
                          onViewDocuments={() => setDocumentsFor(app)}
                          onViewHistory={() => setHistoryFor(app)}
                          onSuspend={() => setStatusAction({ app, mode: "suspend" })}
                          onActivate={() => setStatusAction({ app, mode: "activate" })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-mx-ink-muted">
                      <span>Reg. {app.professional.registrationNumber}</span>
                      <span>{joinedLabel(app)}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </Card>

      {documentsFor && (
        <DoctorDocumentsModal
          isOpen
          onClose={() => setDocumentsFor(null)}
          doctorName={documentsFor.personal.fullName}
          documents={documentsFor.documents}
        />
      )}

      {historyFor && (
        <Modal2 onClose={() => setHistoryFor(null)} doctorName={historyFor.personal.fullName} events={historyFor.auditHistory} />
      )}

      <SuspendDoctorModal
        application={statusAction?.app ?? null}
        mode={statusAction?.mode ?? null}
        onClose={() => setStatusAction(null)}
        onConfirmSuspend={handleSuspend}
        onConfirmActivate={handleActivate}
      />
    </div>
  );
}

/** Tiny wrapper so the "Verification History" row action opens the existing timeline component inside a modal without duplicating its markup. */
function Modal2({ onClose, doctorName, events }: { onClose: () => void; doctorName: string; events: DoctorApplication["auditHistory"] }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-mx-ink/40" aria-hidden="true" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-mx-xl border border-mx-border bg-mx-surface p-5 shadow-mx-lg sm:rounded-mx-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-mx-ink">Verification History</h2>
            <p className="mt-1 text-sm text-mx-ink-muted">{doctorName}'s full verification trail.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-full p-2 text-mx-ink-muted hover:bg-mx-surface-sunken">
            ✕
          </button>
        </div>
        <VerificationAuditHistory events={events} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single doctor profile
// ---------------------------------------------------------------------------

function DoctorProfile({ applicationId }: { applicationId: string }) {
  const navigate = useNavigate();
  const { applications, suspendDoctor, activateDoctor } = useAdmin();
  const { showToast } = useToast();
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"suspend" | "activate" | null>(null);

  const doctor = applications.find((a) => a.id === applicationId && a.status !== "rejected");

  if (!doctor) {
    return (
      <div>
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctors`)}>
          Back to Doctors
        </Button>
        <Card className="mt-4">
          <EmptyState title="Doctor not found" description="This doctor profile may not exist yet, or the application hasn't been verified." />
        </Card>
      </div>
    );
  }

  const displayStatus = getDoctorDisplayStatus(doctor);

  if (displayStatus === "pending") {
    return (
      <div>
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctors`)}>
          Back to Doctors
        </Button>
        <Card className="mt-4">
          <EmptyState
            title="Application still under review"
            description={`${doctor.personal.fullName}'s application hasn't been verified yet. Continue the review on the Doctor Applications page.`}
            action={
              <Button size="sm" onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${doctor.id}`)}>
                Review Application
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const handleSuspend = (reason: string) => {
    suspendDoctor(doctor.id, reason);
    showToast({ tone: "warning", title: "Doctor suspended", description: `${doctor.personal.fullName}'s account has been suspended.` });
    setStatusAction(null);
  };

  const handleActivate = () => {
    activateDoctor(doctor.id);
    showToast({ tone: "success", title: "Doctor activated", description: `${doctor.personal.fullName}'s account is active again.` });
    setStatusAction(null);
  };

  return (
    <div>
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctors`)} className="mb-4 -ml-2">
        Back to Doctors
      </Button>

      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <Avatar name={doctor.personal.fullName} size={56} />
              <div>
                <h1 className="font-display text-xl font-bold text-mx-ink">{doctor.personal.fullName}</h1>
                <p className="text-sm text-mx-ink-muted">
                  {doctor.professional.specialization} · {doctor.organization.organizationName}
                </p>
              </div>
            </div>
            <DoctorStatusBadge application={doctor} />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-mx-border pt-4 sm:grid-cols-2">
            <Row icon={ShieldCheck} label="Doctor ID" value={doctor.doctorId ?? "—"} />
            <Row icon={Stethoscope} label="Specialization" value={doctor.professional.specialization} />
            <Row icon={Briefcase} label="Designation" value={doctor.organization.designation} />
            <Row icon={CalendarClock} label="Experience" value={`${doctor.professional.experienceYears} years`} />
            <Row icon={Mail} label="Email" value={doctor.personal.email} />
            <Row icon={Phone} label="Phone" value={doctor.personal.phone} />
            <Row icon={ShieldCheck} label="Verified by" value={doctor.verifiedBy ?? "—"} />
            <Row icon={CalendarClock} label="Verified on" value={doctor.verifiedAt ?? "—"} />
          </div>

          <div className="flex flex-wrap gap-2.5 border-t border-mx-border pt-4">
            <Button variant="outline" icon={<FileText size={16} aria-hidden="true" />} onClick={() => setDocumentsOpen(true)}>
              View Documents
            </Button>
            <Button
              variant="outline"
              icon={<ArrowUpRight size={16} aria-hidden="true" />}
              onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${doctor.id}`)}
            >
              View Original Application
            </Button>
            {displayStatus === "suspended" ? (
              <Button variant="primary" icon={<ShieldCheck size={16} aria-hidden="true" />} onClick={() => setStatusAction("activate")}>
                Activate Doctor
              </Button>
            ) : (
              <Button variant="danger" icon={<Ban size={16} aria-hidden="true" />} onClick={() => setStatusAction("suspend")}>
                Suspend Doctor
              </Button>
            )}
          </div>
        </Card>

        <div className="flex items-center gap-2 text-xs font-semibold text-mx-ink-muted">
          <History size={13} aria-hidden="true" />
          Verification history
        </div>
        <VerificationAuditHistory events={doctor.auditHistory} />
      </div>

      <DoctorDocumentsModal isOpen={documentsOpen} onClose={() => setDocumentsOpen(false)} doctorName={doctor.personal.fullName} documents={doctor.documents} />

      <SuspendDoctorModal
        application={statusAction ? doctor : null}
        mode={statusAction}
        onClose={() => setStatusAction(null)}
        onConfirmSuspend={handleSuspend}
        onConfirmActivate={handleActivate}
      />
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-mx-sm bg-mx-surface-sunken text-mx-ink-muted">
        <Icon size={15} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-mx-ink-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-mx-ink">{value}</p>
      </div>
    </div>
  );
}