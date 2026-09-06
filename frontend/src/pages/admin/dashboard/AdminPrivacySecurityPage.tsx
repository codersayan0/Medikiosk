import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ShieldCheck,
  KeyRound,
  History,
  Database,
  Users,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { useAdmin } from "../../../context/AdminContext";
import type { BadgeTone } from "../../../types";
import { cn } from "../../../utils/cn";

interface SecuritySection {
  id: string;
  label: string;
  icon: typeof ShieldCheck;
  tone: BadgeTone;
  summary: string;
  detail: ReactNode;
}

export default function AdminPrivacySecurityPage() {
  const { applications, organization } = useAdmin();
  const [openId, setOpenId] = useState<string | null>("account-security");

  const verifiedDoctorCount = useMemo(
    () => applications.filter((a) => a.status === "verified").length,
    [applications]
  );

  const sections: SecuritySection[] = [
    {
      id: "account-security",
      label: "Account Security",
      icon: ShieldCheck,
      tone: "green",
      summary: "Two-factor login, device checks, and account status.",
      detail: (
        <div className="space-y-2 text-sm text-mx-ink-soft">
          <p>Your admin account is protected with mobile OTP verification at every login.</p>
          <Badge tone="green" icon={<ShieldCheck size={12} aria-hidden="true" />}>
            Account secure
          </Badge>
        </div>
      ),
    },
    {
      id: "password",
      label: "Password",
      icon: KeyRound,
      tone: "warning",
      summary: "Update your login password.",
      detail: (
        <div className="space-y-2 text-sm text-mx-ink-soft">
          <p>Use a strong, unique password and update it periodically to keep your admin account secure.</p>
        </div>
      ),
    },
    {
      id: "login-activity",
      label: "Login Activity",
      icon: History,
      tone: "blue",
      summary: "Recent sign-ins to your MediKiosk admin account.",
      detail: (
        <ul className="space-y-2 text-sm text-mx-ink-soft">
          <li className="flex items-center justify-between gap-2 rounded-mx-md bg-mx-surface-sunken px-3 py-2">
            <span>Admin console — {organization.city || "Kolkata"}</span>
            <span className="text-xs text-mx-ink-muted">Today, 09:12 AM</span>
          </li>
          <li className="flex items-center justify-between gap-2 rounded-mx-md bg-mx-surface-sunken px-3 py-2">
            <span>Admin console — {organization.city || "Kolkata"}</span>
            <span className="text-xs text-mx-ink-muted">24 Aug 2026, 10:40 AM</span>
          </li>
        </ul>
      ),
    },
    {
      id: "data-access",
      label: "Data Access",
      icon: Database,
      tone: "purple",
      summary: "What your admin role can view and manage.",
      detail: (
        <p className="text-sm text-mx-ink-soft">
          As an administrator for {organization.organizationName || "your organization"}, you can review doctor
          applications, verify documents, and manage patients, appointments, and medical records on file. Patient
          health data stays visible only to authorized doctors during an in-person visit.
        </p>
      ),
    },
    {
      id: "authorized-staff",
      label: "Authorized Doctors",
      icon: Users,
      tone: "blue",
      summary: "Doctors currently verified and active under your organization.",
      detail: (
        <p className="text-sm text-mx-ink-soft">
          {verifiedDoctorCount} doctor{verifiedDoctorCount === 1 ? " is" : "s are"} currently verified under{" "}
          {organization.organizationName || "your organization"}. Manage individual doctor access from the Doctors
          section.
        </p>
      ),
    },
    {
      id: "privacy-preferences",
      label: "Privacy Preferences",
      icon: SlidersHorizontal,
      tone: "neutral",
      summary: "Control what's visible to your organization's staff.",
      detail: (
        <p className="text-sm text-mx-ink-soft">
          By default, verified doctors at {organization.organizationName || "your organization"} can access patient
          records during an in-person visit. Document and application data is only visible to admins reviewing that
          application.
        </p>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Privacy & Security</h1>
        <p className="mt-2 text-base font-semibold text-mx-green-strong">
          Your organization's data is private and secure.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const open = openId === section.id;
          return (
            <Card key={section.id} padded={false} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : section.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-mx-surface-sunken"
              >
                <MedicalIcon icon={Icon} tone={section.tone} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-mx-ink">{section.label}</p>
                  <p className="mt-0.5 text-xs text-mx-ink-muted">{section.summary}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={cn("shrink-0 text-mx-ink-muted transition-transform", open && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              {open && <div className="border-t border-mx-border p-4">{section.detail}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
