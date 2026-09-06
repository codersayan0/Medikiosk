import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut, Settings, UserRound, FileQuestion, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LanguageSelector } from "../ui/LanguageSelector";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { Avatar } from "../ui/Avatar";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { useAdmin } from "../../context/AdminContext";
import { ADMIN_DASHBOARD_NAV, ADMIN_DASHBOARD_ROOT, type AdminNavLeaf } from "../../data/adminDashboardNav";
import { cn } from "../../utils/cn";
import { dropdownVariants } from "../../utils/motion";

interface AdminDashboardHeaderProps {
  onOpenDrawer: () => void;
}

const ADMIN_NAME = "Ravi Kumar";
const ORG_NAME = "City Care Hospital";

const SEARCHABLE = ADMIN_DASHBOARD_NAV.filter((i): i is AdminNavLeaf => i.type === "link");

function matchLeaves(query: string): AdminNavLeaf[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCHABLE.filter((leaf) => leaf.label.toLowerCase().includes(q));
}

/**
 * Persistent top header for every `/admin/dashboard/*` page: welcome +
 * organization name, global search across admin sections, language/theme
 * switchers, notifications (latest doctor-application activity), help, and
 * the admin profile dropdown. Structure and motion mirror
 * PatientDashboardHeader so the app reads as one connected product.
 */
export function AdminDashboardHeader({ onOpenDrawer }: AdminDashboardHeaderProps) {
  const navigate = useNavigate();
  const { applications } = useAdmin();
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

  // Recent-activity feed for the bell dropdown: newest applications first.
  const recentActivity = useMemo(
    () =>
      [...applications]
        .sort((a, b) => (a.applicationDate < b.applicationDate ? 1 : -1))
        .slice(0, 5),
    [applications]
  );
  const unreadCount = applications.filter((a) => a.status === "pending").length;

  const goTo = (leaf: AdminNavLeaf) => {
    const to = leaf.path ? `${ADMIN_DASHBOARD_ROOT}/${leaf.path}` : ADMIN_DASHBOARD_ROOT;
    navigate(to);
    setQuery("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    navigate("/admin/login");
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
        <p className="text-[11px] font-semibold text-mx-ink-muted">Welcome back,</p>
        <p className="font-display flex items-center gap-1.5 text-base font-bold text-mx-ink">
          {ORG_NAME}
          <ShieldCheck size={15} className="text-mx-green-strong" aria-hidden="true" />
        </p>
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
          placeholder="Search patients, appointments, doctors..."
          aria-label="Search the admin dashboard"
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
                  No matching section for "{query}"
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
                  <span className="text-sm font-bold text-mx-ink">Doctor application activity</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications`);
                    }}
                    className="text-xs font-semibold text-mx-green-strong hover:underline"
                  >
                    View All
                  </button>
                </div>
                <ul className="mx-scrollbar max-h-72 overflow-y-auto">
                  {recentActivity.map((app) => (
                    <li key={app.id} className="border-b border-mx-border last:border-b-0">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${app.id}`);
                        }}
                        className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-mx-surface-sunken"
                      >
                        {app.status === "pending" && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mx-green" aria-hidden="true" />}
                        <div className={cn("min-w-0", app.status !== "pending" && "pl-3.5")}>
                          <p className="text-sm font-semibold text-mx-ink">{app.personal.fullName}</p>
                          <p className="mt-0.5 text-xs text-mx-ink-muted">{app.professional.specialization} · Applied {app.applicationDate}</p>
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
            <Avatar name={ADMIN_NAME} size={32} />
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-mx-ink">{ADMIN_NAME}</span>
              <span className="block text-[11px] text-mx-ink-muted">Administrator</span>
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
                  <p className="text-sm font-semibold text-mx-ink">{ADMIN_NAME}</p>
                  <p className="text-xs text-mx-ink-muted">Administrator · {ORG_NAME}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`${ADMIN_DASHBOARD_ROOT}/organization`);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-mx-ink transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <UserRound size={15} aria-hidden="true" />
                  Organization Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`${ADMIN_DASHBOARD_ROOT}/settings`);
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