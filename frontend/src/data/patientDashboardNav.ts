import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  HeartPulse,
  FolderHeart,
  Sparkles,
  History,
  Pill,
  ShieldAlert,
  FlaskConical,
  ClipboardList,
  FileStack,
  GanttChartSquare,
  Leaf,
  CalendarClock,
  QrCode,
  UserRound,
  Bell,
  Settings,
  Lock,
  LogOut,
  BotMessageSquare,
} from "lucide-react";

export const PATIENT_DASHBOARD_ROOT = "/patient/dashboard";

/** A single leaf link in the patient sidebar. */
export interface PatientNavLeaf {
  type: "link";
  label: string;
  /** Path relative to PATIENT_DASHBOARD_ROOT. "" means the root/index route. */
  path: string;
  icon: LucideIcon;
  /** True once the destination is a real built page rather than a "Coming soon" placeholder. */
  isBuilt: boolean;
}

/** An expandable group (currently only "Medical Records"). */
export interface PatientNavGroup {
  type: "group";
  label: string;
  icon: LucideIcon;
  /** Optional path (relative to root) for the group's own hub/landing page — the label itself links here. */
  path?: string;
  children: PatientNavLeaf[];
}

/** The Logout action — not a route, so kept distinct from link/group items. */
export interface PatientNavAction {
  type: "action";
  label: string;
  icon: LucideIcon;
  action: "logout";
}

export type PatientNavItem = PatientNavLeaf | PatientNavGroup | PatientNavAction;

/**
 * Full sidebar structure. Every entry is clickable from the start:
 * `isBuilt: true` items route to a real page, everything else routes to the
 * shared "Coming soon" placeholder so later phases can swap the destination
 * in without ever touching the sidebar shape. As of Phase 2B every item
 * (My Profile, Notifications, Settings, Privacy & Security included) is
 * built — no placeholders remain.
 */
export const PATIENT_DASHBOARD_NAV: PatientNavItem[] = [
  { type: "link", label: "Overview", path: "", icon: LayoutGrid, isBuilt: true },
  { type: "link", label: "AI Health Assistant", path: "ai-assistant", icon: BotMessageSquare, isBuilt: true },
  { type: "link", label: "My Health", path: "my-health", icon: HeartPulse, isBuilt: true },
  {
    type: "group",
    label: "Medical Records",
    icon: FolderHeart,
    path: "records",
    children: [
      { type: "link", label: "AI Health Summary", path: "records/ai-summary", icon: Sparkles, isBuilt: true },
      { type: "link", label: "Medical History", path: "records/history", icon: History, isBuilt: true },
      { type: "link", label: "Medicines", path: "records/medicines", icon: Pill, isBuilt: true },
      { type: "link", label: "Allergies", path: "records/allergies", icon: ShieldAlert, isBuilt: true },
      { type: "link", label: "Lab Reports", path: "records/lab-reports", icon: FlaskConical, isBuilt: true },
      { type: "link", label: "Prescriptions", path: "records/prescriptions", icon: ClipboardList, isBuilt: true },
      { type: "link", label: "Documents", path: "records/documents", icon: FileStack, isBuilt: true },
    ],
  },
  { type: "link", label: "Medical Timeline", path: "timeline", icon: GanttChartSquare, isBuilt: true },
  { type: "link", label: "AYUSH Health", path: "ayush", icon: Leaf, isBuilt: true },
  { type: "link", label: "My Visits", path: "visits", icon: CalendarClock, isBuilt: true },
  { type: "link", label: "QR / Patient ID", path: "health-id", icon: QrCode, isBuilt: true },
  { type: "link", label: "My Profile", path: "profile", icon: UserRound, isBuilt: true },
  { type: "link", label: "Notifications", path: "notifications", icon: Bell, isBuilt: true },
  { type: "link", label: "Settings", path: "settings", icon: Settings, isBuilt: true },
  { type: "link", label: "Privacy & Security", path: "privacy", icon: Lock, isBuilt: true },
  { type: "action", label: "Logout", icon: LogOut, action: "logout" },
];

/** Flat index of every searchable leaf link, used by the global header search. */
export function getSearchableNavLeaves(): PatientNavLeaf[] {
  const leaves: PatientNavLeaf[] = [];
  for (const item of PATIENT_DASHBOARD_NAV) {
    if (item.type === "link") leaves.push(item);
    if (item.type === "group") leaves.push(...item.children);
  }
  return leaves;
}