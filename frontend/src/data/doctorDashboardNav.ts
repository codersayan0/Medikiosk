import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  AlertTriangle,
  UserRound,
  FileStack,
  Leaf,
  FolderOpen,
  GanttChartSquare,
  ShieldAlert,
  ListChecks,
  Sparkles,
  History,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

/**
 * Doctor Dashboard navigation config — single source of truth for
 * DoctorDashboardSidebar and DoctorDashboardHeader search. Mirrors the
 * shape of ADMIN_DASHBOARD_NAV (data/adminDashboardNav.ts) and
 * PATIENT_DASHBOARD_NAV (data/patientDashboardNav.ts): `type: "link"` for a
 * direct route, `type: "group"` for an expandable section with children,
 * `type: "action"` for Logout. Every entry routes to a real page —
 * `isBuilt: true` where a full page exists, `false` still routes to
 * DoctorComingSoonPage so the sidebar is fully clickable from day one.
 */
export const DOCTOR_DASHBOARD_ROOT = "/doctor/dashboard";

export interface DoctorNavLeaf {
  type: "link";
  /** Path relative to DOCTOR_DASHBOARD_ROOT. "" means the root/index route. */
  path: string;
  label: string;
  icon: LucideIcon;
  isBuilt: boolean;
}

export interface DoctorNavGroup {
  type: "group";
  label: string;
  icon: LucideIcon;
  /** Optional path (relative to root) for the group's own landing page — the label itself links here. */
  path?: string;
  children: DoctorNavLeaf[];
}

export interface DoctorNavAction {
  type: "action";
  label: string;
  icon: LucideIcon;
  action: "logout";
}

export type DoctorNavItem = DoctorNavLeaf | DoctorNavGroup | DoctorNavAction;

export const DOCTOR_DASHBOARD_NAV: DoctorNavItem[] = [
  { type: "link", path: "", label: "Overview", icon: LayoutDashboard, isBuilt: true },
  {
    type: "group",
    label: "Patient Queue",
    icon: ClipboardList,
    path: "queue",
    children: [
      { type: "link", path: "queue/normal", label: "Normal Queue", icon: ClipboardList, isBuilt: true },
      { type: "link", path: "queue/priority", label: "Priority Queue", icon: AlertTriangle, isBuilt: true },
      { type: "link", path: "queue/emergency", label: "Emergency Queue", icon: ShieldAlert, isBuilt: true },
    ],
  },
  { type: "link", path: "appointments", label: "Appointments", icon: CalendarClock, isBuilt: true },
  { type: "link", path: "triage-alerts", label: "Triage Alerts", icon: AlertTriangle, isBuilt: true },
  {
    type: "group",
    label: "Patient Details",
    icon: UserRound,
    path: "patient-details",
    children: [
      { type: "link", path: "patient-details/basic-profile", label: "Basic Profile", icon: UserRound, isBuilt: true },
      { type: "link", path: "patient-details/ai-summary", label: "AI Clinical Summary", icon: Sparkles, isBuilt: false },
      { type: "link", path: "patient-details/ayush-history", label: "AYUSH History", icon: Leaf, isBuilt: false },
      { type: "link", path: "patient-details/documents", label: "Documents", icon: FolderOpen, isBuilt: false },
      { type: "link", path: "patient-details/timeline", label: "Medical Timeline", icon: GanttChartSquare, isBuilt: false },
      { type: "link", path: "patient-details/safety-flags", label: "Safety Flags", icon: ShieldAlert, isBuilt: false },
      { type: "link", path: "patient-details/interview-answers", label: "Full Interview Answers", icon: FileStack, isBuilt: false },
    ],
  },
  { type: "link", path: "review-summary", label: "Review Summary", icon: ListChecks, isBuilt: true },
  { type: "link", path: "previous-visits", label: "Previous Visits", icon: History, isBuilt: true },
  { type: "link", path: "settings", label: "Settings", icon: Settings, isBuilt: true },
  { type: "action", label: "Logout", icon: LogOut, action: "logout" },
];

/** Flat index of every searchable leaf link, used by the header's global search. */
export function getSearchableDoctorNavLeaves(): DoctorNavLeaf[] {
  const leaves: DoctorNavLeaf[] = [];
  for (const item of DOCTOR_DASHBOARD_NAV) {
    if (item.type === "link") leaves.push(item);
    else if (item.type === "group") leaves.push(...item.children);
  }
  return leaves;
}