import type { LucideIcon } from "lucide-react";
import {
  Home,
  Stethoscope,
  History,
  FileText,
  Pill,
  CalendarDays,
  UserCircle,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarClock,
} from "lucide-react";

export interface SidebarNavItem {
  labelKey:
    | "home"
    | "startConsultation"
    | "myHistory"
    | "myReports"
    | "myMedicines"
    | "myAppointments"
    | "profile"
    | "settings"
    | "help"
    | "dashboard"
    | "patientQueue"
    | "patients"
    | "reports"
    | "calendar";
  path: string;
  icon: LucideIcon;
}

export const PATIENT_NAV: SidebarNavItem[] = [
  { labelKey: "home", path: "/patient/dashboard", icon: Home },
  { labelKey: "startConsultation", path: "/patient/dashboard", icon: Stethoscope },
  { labelKey: "myHistory", path: "/patient/dashboard", icon: History },
  { labelKey: "myReports", path: "/patient/dashboard", icon: FileText },
  { labelKey: "myMedicines", path: "/patient/dashboard", icon: Pill },
  { labelKey: "myAppointments", path: "/patient/dashboard", icon: CalendarDays },
  { labelKey: "profile", path: "/patient/dashboard", icon: UserCircle },
  { labelKey: "settings", path: "/patient/dashboard", icon: Settings },
  { labelKey: "help", path: "/patient/dashboard", icon: HelpCircle },
];

export const DOCTOR_NAV: SidebarNavItem[] = [
  { labelKey: "dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
  { labelKey: "patientQueue", path: "/doctor/dashboard", icon: ClipboardList },
  { labelKey: "patients", path: "/doctor/dashboard", icon: Users },
  { labelKey: "reports", path: "/doctor/dashboard", icon: FileText },
  { labelKey: "calendar", path: "/doctor/dashboard", icon: CalendarClock },
  { labelKey: "settings", path: "/doctor/dashboard", icon: Settings },
];

export const ADMIN_NAV: SidebarNavItem[] = [
  { labelKey: "dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { labelKey: "patients", path: "/admin/dashboard", icon: Users },
  { labelKey: "reports", path: "/admin/dashboard", icon: FileText },
  { labelKey: "settings", path: "/admin/dashboard", icon: Settings },
];
