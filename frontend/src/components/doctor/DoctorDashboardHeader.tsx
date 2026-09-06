import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut, Settings, UserRound, FileQuestion, AlertTriangle, FileText, UserPlus, ClipboardList } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Avatar } from "../ui/Avatar";
import { LanguageSelector } from "../ui/LanguageSelector";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { DOCTOR_DASHBOARD_ROOT, type DoctorNavLeaf, getSearchableDoctorNavLeaves } from "../../data/doctorDashboardNav";
import { DOCTOR_PROFILE, QUEUE_PATIENTS, type DoctorNotificationKind } from "../../data/mockDoctorDashboard";
import { useDoctorNotifications } from "../../context/DoctorNotificationsContext";
import { cn } from "../../utils/cn";
import { dropdownVariants } from "../../utils/motion";

interface DoctorDashboardHeaderProps {
  onOpenDrawer: () => void;
}

const SEARCHABLE = getSearchableDoctorNavLeaves();

function matchLeaves(query: string): DoctorNavLeaf[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCHABLE.filter((leaf) => leaf.label.toLowerCase().includes(q));
}

function matchPatients(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return QUEUE_PATIENTS.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)).slice(0, 5);
}

const NOTIF_ICON: Record<DoctorNotificationKind, typeof AlertTriangle> = {
  alert: AlertTriangle,
  document: FileText,
  patient: UserPlus,
  prescription: ClipboardList,
};

export function DoctorDashboardHeader({ onOpenDrawer }: DoctorDashboardHeaderProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(searchRef, () => setSearchOpen(false));
  useOnClickOutside(notifRef, () => setNotifOpen(false));
  useOnClickOutside(profileRef, () => setProfileOpen(false));

  const navResults = useMemo(() => matchLeaves(query), [query]);
  const patientResults = useMemo(() => matchPatients(query), [query]);
  const { notifications, unreadCount, markAsRead } = useDoctorNotifications();

  const goTo = (leaf: DoctorNavLeaf) => {
    const to = leaf.path ? `${DOCTOR_DASHBOARD_ROOT}/${leaf.path}` : DOCTOR_DASHBOARD_ROOT;
    navigate(to);
    setQuery("");
    setSearchOpen(false);
  };

  const goToPatient = () => {
    navigate(`${DOCTOR_DASHBOARD_ROOT}/patient-details/basic-profile`);
    setQuery("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    navigate("/doctor/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-mx-border bg-mx-surface px-4 sm:px-6">
      <button
        type="button"
        className="rounded-mx-sm p-2 text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken lg:hidden"
        onClick={onOpenDrawer}
        aria-label="Open menu"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="relative mx-auto w-full max-w-md flex-1" ref={searchRef}>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mx-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search patient by name, UID, or mobile..."
          aria-label="Search patients or dashboard sections"
          className="h-10 w-full rounded-mx-md border border-mx-border-strong bg-mx-surface-sunken pl-9 pr-3 text-sm text-mx-ink placeholder:text-mx-ink-muted transition-colors duration-150 focus:border-mx-green focus:outline-none"
        />
        <AnimatePresence>
          {searchOpen && query.trim() && (
            <motion.div
              key="search-results"
              initial={prefersReducedMotion ? false : "hidden"}
              animate="show"
              exit={prefersReducedMotion ? undefined : "exit"}
              variants={prefersReducedMotion ? undefined : dropdownVariants}
              className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-96 overflow-y-auto rounded-mx-md border border-mx-border bg-mx-surface-raised shadow-mx-md"
            >
              {patientResults.length > 0 && (
                <ul role="listbox" className="border-b border-mx-border py-1">
                  <li className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-mx-ink-muted">Patients</li>
                  {patientResults.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={goToPatient}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken"
                      >
                        <UserRound size={16} className="text-mx-ink-muted" aria-hidden="true" />
                        <span className="flex-1">
                          {p.name} <span className="text-xs text-mx-ink-muted">· {p.age}/{p.sex} · {p.id}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {navResults.length > 0 ? (
                <ul role="listbox" className="py-1">
                  {patientResults.length > 0 && (
                    <li className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-mx-ink-muted">Sections</li>
                  )}
                  {navResults.map((leaf) => {
                    const Icon = leaf.icon;
                    return (
                      <li key={leaf.path}>
                        <button
                          type="button"
                          onClick={() => goTo(leaf)}
                          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken"
                        >
                          <Icon size={16} className="text-mx-ink-muted" aria-hidden="true" />
                          <span className="flex-1">{leaf.label}</span>
                          {!leaf.isBuilt && <span className="text-[11px] font-semibold text-mx-ink-muted">Coming soon</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                patientResults.length === 0 && (
                  <div className="flex items-center gap-2 px-3.5 py-3 text-sm text-mx-ink-muted">
                    <FileQuestion size={16} aria-hidden="true" />
                    No matches for "{query}"
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Same language + three-way theme controls used by the Patient Dashboard. */}
        <div className="hidden sm:block">
          <LanguageSelector compact />
        </div>
        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative rounded-mx-sm p-2 text-mx-ink-soft transition-colors duration-150 hover:bg-mx-surface-sunken"
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mx-danger px-1 text-[10px] font-bold text-mx-ink-inverse">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                key="notif-dropdown"
                initial={prefersReducedMotion ? false : "hidden"}
                animate="show"
                exit={prefersReducedMotion ? undefined : "exit"}
                variants={prefersReducedMotion ? undefined : dropdownVariants}
                className="absolute right-0 top-full z-30 mt-1.5 w-80 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface-raised shadow-mx-md"
              >
                <div className="flex items-center justify-between gap-2 border-b border-mx-border px-3.5 py-2.5">
                  <span className="text-sm font-bold text-mx-ink">Recent Notifications</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(DOCTOR_DASHBOARD_ROOT);
                    }}
                    className="text-xs font-semibold text-mx-green-strong hover:underline"
                  >
                    View All
                  </button>
                </div>
                <ul className="mx-scrollbar max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = NOTIF_ICON[n.kind];
                    return (
                      <li key={n.id} className="border-b border-mx-border last:border-b-0">
                        <button
                          type="button"
                          onClick={() => {
                            markAsRead(n.id);
                            setNotifOpen(false);
                          }}
                          className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-mx-surface-sunken"
                        >
                          <Icon size={15} className="mt-0.5 shrink-0 text-mx-ink-muted" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-sm", n.unread ? "font-bold text-mx-ink" : "font-semibold text-mx-ink-soft")}>{n.title}</p>
                            <p className="mt-0.5 truncate text-xs text-mx-ink-muted">{n.patientName}</p>
                            <p className="mt-0.5 text-[11px] text-mx-ink-muted">{n.time}</p>
                          </div>
                          {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mx-blue" aria-hidden="true" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Help"
          title="Help & support"
          className="hidden rounded-mx-sm p-2 text-mx-ink-soft transition-colors duration-150 hover:bg-mx-surface-sunken sm:inline-flex"
        >
          <HelpCircle size={18} aria-hidden="true" />
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-mx-sm py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-mx-surface-sunken"
          >
            <Avatar name={DOCTOR_PROFILE.name} size={32} />
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-mx-ink">{DOCTOR_PROFILE.name}</span>
              <span className="block text-[11px] text-mx-ink-muted">{DOCTOR_PROFILE.specialty}</span>
            </span>
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn("hidden text-mx-ink-muted transition-transform duration-200 ease-out sm:block", profileOpen && "rotate-180")}
            />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                key="profile-dropdown"
                initial={prefersReducedMotion ? false : "hidden"}
                animate="show"
                exit={prefersReducedMotion ? undefined : "exit"}
                variants={prefersReducedMotion ? undefined : dropdownVariants}
                className="absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface-raised shadow-mx-md"
              >
                <div className="border-b border-mx-border px-3.5 py-3">
                  <p className="text-sm font-semibold text-mx-ink">{DOCTOR_PROFILE.name}</p>
                  <p className="text-xs text-mx-ink-muted">{DOCTOR_PROFILE.specialty} · Reg. No. {DOCTOR_PROFILE.regNo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`${DOCTOR_DASHBOARD_ROOT}/patient-details/basic-profile`);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <UserRound size={15} aria-hidden="true" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`${DOCTOR_DASHBOARD_ROOT}/settings`);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <Settings size={15} aria-hidden="true" />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 border-t border-mx-border px-3.5 py-2.5 text-left text-sm font-semibold text-mx-danger transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}