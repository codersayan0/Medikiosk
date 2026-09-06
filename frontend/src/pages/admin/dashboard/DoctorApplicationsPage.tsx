import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Eye, RotateCcw, ShieldCheck, XCircle, ArrowUpRight, Mail, Phone } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs, type SegmentedTab } from "../../../components/ui/SegmentedTabs";
import { ApplicationStatusBadge } from "../../../components/admin/ApplicationStatusBadge";
import { useAdmin } from "../../../context/AdminContext";
import { ADMIN_DASHBOARD_ROOT } from "../../../data/adminDashboardNav";
import { countByStatus, countDocumentsVerified } from "../../../utils/doctorApplications";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import type { DoctorApplicationStatus } from "../../../types";

type FilterTab = "all" | DoctorApplicationStatus;

const STAT_TILES: Array<{ key: keyof ReturnType<typeof countByStatus>; label: string; icon: typeof Clock; tone: string }> = [
  { key: "pending", label: "Pending Applications", icon: Clock, tone: "bg-mx-warning-soft text-mx-warning" },
  { key: "underReview", label: "Under Review", icon: Eye, tone: "bg-mx-blue-soft text-mx-blue" },
  { key: "verificationRequired", label: "Verification Required", icon: RotateCcw, tone: "bg-mx-purple-soft text-mx-purple" },
  { key: "verified", label: "Verified", icon: ShieldCheck, tone: "bg-mx-green-soft text-mx-green-strong" },
  { key: "rejected", label: "Rejected", icon: XCircle, tone: "bg-mx-danger-soft text-mx-danger" },
  { key: "total", label: "Total Applications", icon: ClipboardList, tone: "bg-mx-purple-soft text-mx-purple" },
];

/**
 * Dedicated Doctor Applications page — per the spec, this is treated as a
 * major feature, not a buried sub-tab. Status tiles + filter tabs +
 * application table, each row opening the full Application Detail /
 * Verification page (DoctorApplicationDetailPage).
 */
export default function DoctorApplicationsPage() {
  const navigate = useNavigate();
  const { applications } = useAdmin();
  const [tab, setTab] = useState<FilterTab>("all");
  const counts = countByStatus(applications);

  const tabs: SegmentedTab<FilterTab>[] = [
    { id: "all", label: "All", count: counts.total },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "under_review", label: "Under Review", count: counts.underReview },
    { id: "verification_required", label: "Verification Required", count: counts.verificationRequired },
    { id: "verified", label: "Verified", count: counts.verified },
    { id: "rejected", label: "Rejected", count: counts.rejected },
  ];

  const filtered = useMemo(() => (tab === "all" ? applications : applications.filter((a) => a.status === tab)), [applications, tab]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-mx-ink">Doctor Applications</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Review, verify, and approve doctor onboarding applications.</p>
      </div>

      <motion.div variants={staggerContainer(0.04)} initial="hidden" animate="show" className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <motion.div key={tile.key} variants={staggerItem}>
              <Card className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-mx-md ${tile.tone}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-mx-ink">{counts[tile.key]}</p>
                  <p className="text-xs font-semibold text-mx-ink-muted">{tile.label}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <SegmentedTabs tabs={tabs} active={tab} onChange={setTab} layoutGroupId="doctor-applications-tabs" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No applications in this filter" description="Applications matching this status will appear here." />
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="mx-scrollbar hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-y border-mx-border bg-mx-surface-sunken text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                    <th className="px-5 py-3 font-semibold">Doctor</th>
                    <th className="px-3 py-3 font-semibold">License No.</th>
                    <th className="px-3 py-3 font-semibold">Specialization</th>
                    <th className="px-3 py-3 font-semibold">Contact</th>
                    <th className="px-3 py-3 font-semibold">Applied On</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Documents</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer(0.035)} initial="hidden" animate="show">
                  {filtered.map((app) => {
                    const docCount = countDocumentsVerified(app);
                    return (
                      <motion.tr
                        key={app.id}
                        variants={staggerItem}
                        className="border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken"
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
                        <td className="px-3 py-3 text-mx-ink-soft">{app.professional.registrationNumber}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{app.professional.specialization}</td>
                        <td className="px-3 py-3">
                          <p className="flex items-center gap-1.5 text-xs text-mx-ink-soft">
                            <Phone size={12} aria-hidden="true" /> {app.personal.phone}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mx-ink-muted">
                            <Mail size={12} aria-hidden="true" /> {app.personal.email}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-mx-ink-soft">{app.applicationDate}</td>
                        <td className="px-3 py-3">
                          <ApplicationStatusBadge status={app.status} />
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-mx-ink-soft">
                          {docCount.verified}/{docCount.total} verified
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<ArrowUpRight size={14} aria-hidden="true" />}
                            iconPosition="right"
                            onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${app.id}`)}
                          >
                            View Application
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <motion.div variants={staggerContainer(0.035)} initial="hidden" animate="show" className="flex flex-col gap-3 p-4 sm:hidden">
              {filtered.map((app) => {
                const docCount = countDocumentsVerified(app);
                return (
                  <motion.div key={app.id} variants={staggerItem}>
                    <Card interactive onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${app.id}`)} className="flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar name={app.personal.fullName} size={36} />
                          <div>
                            <p className="font-semibold text-mx-ink">{app.personal.fullName}</p>
                            <p className="text-xs text-mx-ink-muted">{app.professional.specialization}</p>
                          </div>
                        </div>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-mx-ink-muted">
                        <span>Applied {app.applicationDate}</span>
                        <span>{docCount.verified}/{docCount.total} docs verified</span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </Card>
    </div>
  );
}