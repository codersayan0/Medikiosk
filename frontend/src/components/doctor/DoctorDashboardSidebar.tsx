import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { cn } from "../../utils/cn";
import { EASE_OUT } from "../../utils/motion";
import {
  DOCTOR_DASHBOARD_NAV,
  DOCTOR_DASHBOARD_ROOT,
  type DoctorNavItem,
} from "../../data/doctorDashboardNav";
import { QUEUE_COUNTS, TRIAGE_ALERTS } from "../../data/mockDoctorDashboard";

interface DoctorDashboardSidebarProps {
  onNavigate?: () => void;
}

const ACTIVE_PILL_LAYOUT_ID = "doctor-sidebar-active-pill";

const linkClasses = (isActive: boolean) =>
  cn(
    "relative flex items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold transition-colors duration-150",
    isActive ? "text-mx-green-strong" : "text-mx-ink-soft hover:bg-mx-surface-sunken"
  );

/** Badge counts keyed by leaf path — see QUEUE_COUNTS / TRIAGE_ALERTS in mockDoctorDashboard.ts. */
const NAV_BADGES: Record<string, number> = {
  "queue/normal": QUEUE_COUNTS.normal,
  "queue/priority": QUEUE_COUNTS.priority,
  "queue/emergency": QUEUE_COUNTS.emergency,
  "triage-alerts": TRIAGE_ALERTS.filter((a) => !a.acknowledged).length,
};

/** Same shared-`layoutId` active-route pill used by the admin/patient sidebars, kept visually consistent. */
function ActivePill({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  if (prefersReducedMotion) {
    return <span className="absolute inset-0 -z-10 rounded-mx-sm bg-mx-green-soft" aria-hidden="true" />;
  }
  return (
    <motion.span
      layoutId={ACTIVE_PILL_LAYOUT_ID}
      className="absolute inset-0 -z-10 rounded-mx-sm bg-mx-green-soft"
      transition={{ duration: 0.22, ease: EASE_OUT }}
      aria-hidden="true"
    />
  );
}

function NavBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="relative shrink-0 rounded-full bg-mx-warning-soft px-1.5 py-0.5 text-[11px] font-bold text-mx-warning">
      {String(count).padStart(2, "0")}
    </span>
  );
}

/**
 * Full doctor sidebar: Overview, expandable Patient Queue (Normal / Priority
 * / Emergency, badged), Appointments, Triage Alerts (badged), expandable
 * Patient Details (Basic Profile, AI Clinical Summary, AYUSH History,
 * Documents, Medical Timeline, Safety Flags, Full Interview Answers),
 * Review Summary, Previous Visits, Settings, Logout — see
 * data/doctorDashboardNav.ts. Structure/motion mirrors
 * PatientDashboardSidebar / AdminDashboardSidebar so the whole app reads as
 * one connected product.
 */
export function DoctorDashboardSidebar({ onNavigate }: DoctorDashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const isQueuePath = location.pathname.includes(`${DOCTOR_DASHBOARD_ROOT}/queue`);
  const isDetailsPath = location.pathname.includes(`${DOCTOR_DASHBOARD_ROOT}/patient-details`);
  const [queueOpen, setQueueOpen] = useState(isQueuePath);
  const [detailsOpen, setDetailsOpen] = useState(isDetailsPath);

  const handleLogout = () => {
    onNavigate?.();
    navigate("/doctor/login");
  };

  const renderGroup = (
    item: Extract<DoctorNavItem, { type: "group" }>,
    key: string,
    isOpen: boolean,
    setOpen: (v: (prev: boolean) => boolean) => void,
    isGroupActive: boolean
  ) => {
    const GroupIcon = item.icon;
    const hubTo = item.path ? `${DOCTOR_DASHBOARD_ROOT}/${item.children[0].path}` : undefined;
    return (
      <div key={key}>
        <div
          className={cn(
            "flex w-full items-center gap-1 rounded-mx-sm text-sm font-semibold text-mx-ink-soft transition-colors duration-150",
            isGroupActive && "text-mx-green-strong"
          )}
        >
          {hubTo ? (
            <NavLink
              to={hubTo}
              onClick={onNavigate}
              className="relative flex flex-1 items-center gap-3 rounded-mx-sm px-3 py-2.5 transition-colors duration-150 hover:bg-mx-surface-sunken"
            >
              <GroupIcon size={18} aria-hidden="true" className="relative" />
              <span className="relative text-left">{item.label}</span>
            </NavLink>
          ) : (
            <span className="flex flex-1 items-center gap-3 px-3 py-2.5">
              <GroupIcon size={18} aria-hidden="true" />
              {item.label}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
            className="shrink-0 rounded-mx-sm p-2.5 transition-colors duration-150 hover:bg-mx-surface-sunken"
          >
            <ChevronDown
              size={15}
              aria-hidden="true"
              className={cn("shrink-0 transition-transform duration-200 ease-out", isOpen && "rotate-180")}
            />
          </button>
        </div>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }}
          className="overflow-hidden"
        >
          <div className="ml-4 mt-1 space-y-1 border-l border-mx-border pl-3">
            {item.children.map((child) => {
              const to = `${DOCTOR_DASHBOARD_ROOT}/${child.path}`;
              const ChildIcon = child.icon;
              const badge = NAV_BADGES[child.path];
              return (
                <NavLink key={child.path} to={to} onClick={onNavigate} className={({ isActive }) => linkClasses(isActive)}>
                  {({ isActive }) => (
                    <>
                      {isActive && <ActivePill prefersReducedMotion={prefersReducedMotion} />}
                      <ChildIcon size={16} aria-hidden="true" className="relative" />
                      <span className="relative flex-1">{child.label}</span>
                      <NavBadge count={badge} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderItem = (item: DoctorNavItem, key: string) => {
    if (item.type === "link") {
      const to = item.path ? `${DOCTOR_DASHBOARD_ROOT}/${item.path}` : DOCTOR_DASHBOARD_ROOT;
      const Icon = item.icon;
      const badge = NAV_BADGES[item.path];
      return (
        <NavLink key={key} to={to} end={!item.path} onClick={onNavigate} className={({ isActive }) => linkClasses(isActive)}>
          {({ isActive }) => (
            <>
              {isActive && <ActivePill prefersReducedMotion={prefersReducedMotion} />}
              <Icon size={18} aria-hidden="true" className="relative" />
              <span className="relative flex-1">{item.label}</span>
              <NavBadge count={badge} />
            </>
          )}
        </NavLink>
      );
    }

    if (item.type === "group") {
      if (item.label === "Patient Queue") return renderGroup(item, key, queueOpen, setQueueOpen, isQueuePath);
      return renderGroup(item, key, detailsOpen, setDetailsOpen, isDetailsPath);
    }

    const ActionIcon = item.icon;
    return (
      <button
        key={key}
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold text-mx-ink-soft transition-colors duration-150 hover:bg-mx-surface-sunken"
      >
        <ActionIcon size={18} aria-hidden="true" />
        {item.label}
      </button>
    );
  };

  const mainItems = DOCTOR_DASHBOARD_NAV.filter((item) => item.type !== "action");
  const actionItems = DOCTOR_DASHBOARD_NAV.filter((item) => item.type === "action");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-mx-border bg-mx-surface">
      <div className="flex h-16 flex-col justify-center border-b border-mx-border px-5">
        <Logo size={26} />
        <span className="mt-0.5 text-[11px] font-semibold text-mx-ink-muted">Doctor Dashboard</span>
      </div>

      <nav className="mx-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Doctor Dashboard">
        {mainItems.map((item, i) => renderItem(item, `${item.type}-${i}`))}
      </nav>

      <div className="space-y-3 border-t border-mx-border p-3">
        <div className="flex items-center gap-2 rounded-mx-sm bg-mx-green-soft px-3 py-2.5 text-xs font-semibold text-mx-green-strong">
          <ShieldCheck size={15} aria-hidden="true" />
          Secure environment
        </div>
        {actionItems.map((item, i) => renderItem(item, `${item.type}-${i}`))}
      </div>
    </aside>
  );
}