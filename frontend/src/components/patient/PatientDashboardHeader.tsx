import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut, Settings, QrCode, UserRound, FileQuestion } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LanguageSelector } from "../ui/LanguageSelector";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { PatientAvatar } from "../healthcare/PatientAvatar";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { usePatientRecord, useNotifications } from "../../context/PatientContext";
import {
  PATIENT_DASHBOARD_ROOT,
  getSearchableNavLeaves,
  type PatientNavLeaf,
} from "../../data/patientDashboardNav";
import { cn } from "../../utils/cn";
import { badgePulse, dropdownVariants } from "../../utils/motion";

interface PatientDashboardHeaderProps {
  onOpenDrawer: () => void;
}

const SEARCHABLE = getSearchableNavLeaves();

function matchLeaves(query: string): PatientNavLeaf[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCHABLE.filter((leaf) => leaf.label.toLowerCase().includes(q));
}

/**
 * Persists on every patient page: logo + subtitle, global search across the
 * patient's own records, language/theme switchers, notifications, help, and
 * the profile block. Search is wired now with simple label matching against
 * every sidebar destination (built or "Coming soon") so nothing breaks even
 * before Phase 1B/2 pages exist.
 *
 * Motion: the unread badge gets a brief scale pulse when the count changes
 * (not a shake), the profile chevron rotates smoothly on open/close, and
 * both dropdowns fade + slide down ~4px via the shared `dropdownVariants`.
 */
export function PatientDashboardHeader({ onOpenDrawer }: PatientDashboardHeaderProps) {
  const navigate = useNavigate();
  const patient = usePatientRecord();
  const { notifications, markNotificationRead } = useNotifications();
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

  const results = useMemo(() => matchLeaves(query), [query]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Pulse the badge only when the unread count actually changes, not on
  // every render — a brief scale-up, never a shake.
  const prevUnreadCount = useRef(unreadCount);
  const [badgeKey, setBadgeKey] = useState(0);
  useEffect(() => {
    if (prevUnreadCount.current !== unreadCount) {
      setBadgeKey((k) => k + 1);
      prevUnreadCount.current = unreadCount;
    }
  }, [unreadCount]);

  const goTo = (leaf: PatientNavLeaf) => {
    const to = leaf.path ? `${PATIENT_DASHBOARD_ROOT}/${leaf.path}` : PATIENT_DASHBOARD_ROOT;
    navigate(to);
    setQuery("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    navigate("/patient/login");
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

      <div className="hidden shrink-0 leading-tight sm:block">
        <p className="font-display text-base font-bold text-mx-ink">MediKiosk</p>
        <p className="text-[11px] font-semibold text-mx-ink-muted">Patient Dashboard</p>
      </div>

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
          placeholder="Search your health records..."
          aria-label="Search your health records"
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
              className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-mx-md border border-mx-border bg-mx-surface-raised shadow-mx-md"
            >
              {results.length > 0 ? (
                <ul role="listbox">
                  {results.map((leaf) => {
                    const Icon = leaf.icon;
                    return (
                      <li key={leaf.path || "overview"}>
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
                <div className="flex items-center gap-2 px-3.5 py-3 text-sm text-mx-ink-muted">
                  <FileQuestion size={16} aria-hidden="true" />
                  No matching page yet for "{query}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
              <motion.span
                key={badgeKey}
                initial="initial"
                animate={prefersReducedMotion ? "initial" : "pulse"}
                variants={badgePulse}
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mx-danger px-1 text-[10px] font-bold text-mx-ink-inverse"
              >
                {unreadCount}
              </motion.span>
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
                  <span className="text-sm font-bold text-mx-ink">Notifications</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(`${PATIENT_DASHBOARD_ROOT}/notifications`);
                    }}
                    className="text-xs font-semibold text-mx-green-strong hover:underline"
                  >
                    View All
                  </button>
                </div>
                <ul className="mx-scrollbar max-h-72 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <li key={n.id} className="border-b border-mx-border last:border-b-0">
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-mx-surface-sunken"
                      >
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mx-green" aria-hidden="true" />}
                        <div className={cn("min-w-0", n.read && "pl-3.5")}>
                          <p className="text-sm font-semibold text-mx-ink">{n.title}</p>
                          <p className="mt-0.5 text-xs text-mx-ink-muted">{n.description}</p>
                          <p className="mt-1 text-[11px] text-mx-ink-muted">{n.timestamp}</p>
                        </div>
                      </button>
                    </li>
                  ))}
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
            <PatientAvatar gender={patient.identity.gender} imageUrl={patient.identity.photoUrl} size={32} />
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-mx-ink">{patient.identity.name}</span>
              <span className="block text-[11px] text-mx-ink-muted">{patient.identity.uid}</span>
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
                  <p className="text-sm font-semibold text-mx-ink">{patient.identity.name}</p>
                  <p className="text-xs text-mx-ink-muted">{patient.identity.uid}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`${PATIENT_DASHBOARD_ROOT}/health-id`);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <QrCode size={15} aria-hidden="true" />
                  My Health ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`${PATIENT_DASHBOARD_ROOT}/profile`);
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
                    navigate(`${PATIENT_DASHBOARD_ROOT}/settings`);
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