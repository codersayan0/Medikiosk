import { NavLink, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { cn } from "../../utils/cn";
import { EASE_OUT } from "../../utils/motion";
import { ADMIN_DASHBOARD_NAV, ADMIN_DASHBOARD_ROOT, type AdminNavItem } from "../../data/adminDashboardNav";
import { useAdmin } from "../../context/AdminContext";
import { countByStatus } from "../../utils/doctorApplications";

interface AdminDashboardSidebarProps {
  onNavigate?: () => void;
}

const ACTIVE_PILL_LAYOUT_ID = "admin-sidebar-active-pill";

const linkClasses = (isActive: boolean) =>
  cn(
    "relative flex items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold transition-colors duration-150",
    isActive ? "text-mx-green-strong" : "text-mx-ink-soft hover:bg-mx-surface-sunken"
  );

/** Same shared-`layoutId` active-route pill used by the patient sidebar, kept visually consistent. */
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
 * Admin dashboard sidebar: Overview, Doctor Applications (pending-count
 * badge), Doctors, Patients, Appointments, Medical Records, Organization
 * Profile, Reports & Analytics, Notifications, Settings, Privacy &
 * Security, Logout — see data/adminDashboardNav.ts. Mirrors
 * PatientDashboardSidebar's structure/motion so the whole app reads as one
 * connected product rather than a bolted-on admin panel.
 */
export function AdminDashboardSidebar({ onNavigate }: AdminDashboardSidebarProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { applications } = useAdmin();
  const pendingCount = countByStatus(applications).pending;

  const handleLogout = () => {
    onNavigate?.();
    navigate("/admin/login");
  };

  const mainItems = ADMIN_DASHBOARD_NAV.filter((item): item is Extract<AdminNavItem, { type: "link" }> => item.type === "link");
  const actionItems = ADMIN_DASHBOARD_NAV.filter((item) => item.type === "action");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-mx-border bg-mx-surface">
      <div className="flex h-16 items-center border-b border-mx-border px-5">
        <Logo size={28} />
      </div>

      <nav className="mx-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin Dashboard">
        {mainItems.map((item) => {
          const to = item.path ? `${ADMIN_DASHBOARD_ROOT}/${item.path}` : ADMIN_DASHBOARD_ROOT;
          const Icon = item.icon;
          const badge = item.path === "doctor-applications" ? pendingCount : undefined;
          return (
            <NavLink key={item.path || "overview"} to={to} end={!item.path} onClick={onNavigate} className={({ isActive }) => linkClasses(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && <ActivePill prefersReducedMotion={prefersReducedMotion} />}
                  <Icon size={18} aria-hidden="true" className="relative" />
                  <span className="relative flex-1">{item.label}</span>
                  {!!badge && (
                    <span className="relative shrink-0 rounded-full bg-mx-warning-soft px-1.5 py-0.5 text-[11px] font-bold text-mx-warning">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-mx-border p-3">
        <div className="flex items-center gap-2 rounded-mx-sm bg-mx-green-soft px-3 py-2.5 text-xs font-semibold text-mx-green-strong">
          <ShieldCheck size={15} aria-hidden="true" />
          Secure environment
        </div>
        {actionItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={`${item.type}-${i}`}
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold text-mx-ink-soft transition-colors duration-150 hover:bg-mx-surface-sunken"
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}