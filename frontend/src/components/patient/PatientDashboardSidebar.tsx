import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { cn } from "../../utils/cn";
import { EASE_OUT } from "../../utils/motion";
import {
  PATIENT_DASHBOARD_NAV,
  PATIENT_DASHBOARD_ROOT,
  type PatientNavItem,
} from "../../data/patientDashboardNav";

interface PatientDashboardSidebarProps {
  onNavigate?: () => void;
}

const ACTIVE_PILL_LAYOUT_ID = "patient-sidebar-active-pill";

const linkClasses = (isActive: boolean) =>
  cn(
    "relative flex items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold transition-colors duration-150",
    isActive ? "text-mx-green-strong" : "text-mx-ink-soft hover:bg-mx-surface-sunken"
  );

/** Renders the shared active-route highlight. A single `layoutId` pill so
 *  framer-motion animates it sliding between nav items on route change
 *  instead of snapping. Falls back to a plain static span for
 *  prefers-reduced-motion users. */
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

/**
 * Full patient sidebar: Overview, My Health, expandable Medical Records,
 * Medical Timeline, AYUSH Health, My Visits, QR / Patient ID, Settings,
 * Logout. Every item routes somewhere real (built page or "Coming soon"
 * placeholder) from the moment this renders — see patientDashboardNav.ts.
 *
 * Motion: the active-route highlight is a single shared `layoutId` pill
 * that slides/fades into position when switching routes rather than
 * snapping; hover backgrounds transition smoothly. Both are skipped for
 * `prefers-reduced-motion` users (instant background swap only).
 */
export function PatientDashboardSidebar({ onNavigate }: PatientDashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const isRecordsPath = location.pathname.includes(`${PATIENT_DASHBOARD_ROOT}/records`);
  const [recordsOpen, setRecordsOpen] = useState(isRecordsPath);

  const handleLogout = () => {
    onNavigate?.();
    navigate("/patient/login");
  };

  const renderItem = (item: PatientNavItem, key: string) => {
    if (item.type === "link") {
      const to = item.path ? `${PATIENT_DASHBOARD_ROOT}/${item.path}` : PATIENT_DASHBOARD_ROOT;
      const Icon = item.icon;
      return (
        <NavLink key={key} to={to} end={!item.path} onClick={onNavigate} className={({ isActive }) => linkClasses(isActive)}>
          {({ isActive }) => (
            <>
              {isActive && <ActivePill prefersReducedMotion={prefersReducedMotion} />}
              <Icon size={18} aria-hidden="true" className="relative" />
              <span className="relative">{item.label}</span>
            </>
          )}
        </NavLink>
      );
    }

    if (item.type === "group") {
      const GroupIcon = item.icon;
      const hubTo = item.path ? `${PATIENT_DASHBOARD_ROOT}/${item.path}` : undefined;
      return (
        <div key={key}>
          <div
            className={cn(
              "flex w-full items-center gap-1 rounded-mx-sm text-sm font-semibold text-mx-ink-soft transition-colors duration-150",
              isRecordsPath && "text-mx-green-strong"
            )}
          >
            {hubTo ? (
              <NavLink
                to={hubTo}
                end
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-1 items-center gap-3 rounded-mx-sm px-3 py-2.5 transition-colors duration-150",
                    isActive ? "text-mx-green-strong" : "hover:bg-mx-surface-sunken"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <ActivePill prefersReducedMotion={prefersReducedMotion} />}
                    <GroupIcon size={18} aria-hidden="true" className="relative" />
                    <span className="relative text-left">{item.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <span className="flex flex-1 items-center gap-3 px-3 py-2.5">
                <GroupIcon size={18} aria-hidden="true" />
                {item.label}
              </span>
            )}
            <button
              type="button"
              onClick={() => setRecordsOpen((v) => !v)}
              aria-expanded={recordsOpen}
              aria-label={`${recordsOpen ? "Collapse" : "Expand"} ${item.label}`}
              className="shrink-0 rounded-mx-sm p-2.5 transition-colors duration-150 hover:bg-mx-surface-sunken"
            >
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={cn("shrink-0 transition-transform duration-200 ease-out", recordsOpen && "rotate-180")}
              />
            </button>
          </div>
          <motion.div
            initial={false}
            animate={{ height: recordsOpen ? "auto" : 0, opacity: recordsOpen ? 1 : 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l border-mx-border pl-3">
              {item.children.map((child) => {
                const to = `${PATIENT_DASHBOARD_ROOT}/${child.path}`;
                const ChildIcon = child.icon;
                return (
                  <NavLink key={child.path} to={to} onClick={onNavigate} className={({ isActive }) => linkClasses(isActive)}>
                    {({ isActive }) => (
                      <>
                        {isActive && <ActivePill prefersReducedMotion={prefersReducedMotion} />}
                        <ChildIcon size={16} aria-hidden="true" className="relative" />
                        <span className="relative">{child.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        </div>
      );
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

  const mainItems = PATIENT_DASHBOARD_NAV.filter((item) => item.type !== "action");
  const actionItems = PATIENT_DASHBOARD_NAV.filter((item) => item.type === "action");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-mx-border bg-mx-surface">
      <div className="flex h-16 items-center border-b border-mx-border px-5">
        <Logo size={28} />
      </div>

      <nav className="mx-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Patient Dashboard">
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
