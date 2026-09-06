import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  Users,
  CalendarClock,
  FolderHeart,
  Building2,
  ClipboardList,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from "lucide-react";

/**
 * Admin Dashboard navigation config — single source of truth for the
 * sidebar (AdminDashboardSidebar) and global search (AdminDashboardHeader).
 * Every route under /admin/dashboard/* (see routes/index.tsx) has a
 * corresponding entry here and routes to a real page — `isBuilt: true`
 * throughout, same convention as PATIENT_DASHBOARD_NAV in
 * data/patientDashboardNav.ts.
 */
export const ADMIN_DASHBOARD_ROOT = "/admin/dashboard";

/** A clickable nav link. `path` is omitted for the index route (Overview). */
export interface AdminNavLeaf {
  type: "link";
  path?: string;
  label: string;
  icon: LucideIcon;
  isBuilt: boolean;
}

/** A non-navigational action item (e.g. Log Out). */
export interface AdminNavAction {
  type: "action";
  label: string;
  icon: LucideIcon;
}

export type AdminNavItem = AdminNavLeaf | AdminNavAction;

export const ADMIN_DASHBOARD_NAV: AdminNavItem[] = [
  { type: "link", label: "Overview", icon: LayoutDashboard, isBuilt: true },
  { type: "link", path: "doctor-applications", label: "Doctor Applications", icon: UserPlus, isBuilt: true },
  { type: "link", path: "doctors", label: "Doctors", icon: Stethoscope, isBuilt: true },
  { type: "link", path: "patients", label: "Patients", icon: Users, isBuilt: true },
  { type: "link", path: "appointments", label: "Appointments", icon: CalendarClock, isBuilt: true },
  { type: "link", path: "medical-records", label: "Medical Records", icon: FolderHeart, isBuilt: true },
  { type: "link", path: "organization", label: "Organization Profile", icon: Building2, isBuilt: true },
  { type: "link", path: "reports", label: "Reports & Analytics", icon: ClipboardList, isBuilt: true },
  { type: "link", path: "notifications", label: "Notifications", icon: Bell, isBuilt: true },
  { type: "link", path: "settings", label: "Settings", icon: Settings, isBuilt: true },
  { type: "link", path: "privacy", label: "Privacy & Security", icon: ShieldCheck, isBuilt: true },
  { type: "action", label: "Log Out", icon: LogOut },
];