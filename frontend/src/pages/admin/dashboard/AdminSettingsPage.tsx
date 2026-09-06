import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Bell,
  Lock,
  KeyRound,
  Languages,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Card, CardTitle } from "../../../components/ui/Card";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";
import { Avatar } from "../../../components/ui/Avatar";
import { useToast } from "../../../context/ToastContext";
import { useAdmin } from "../../../context/AdminContext";
import { ADMIN_DASHBOARD_ROOT } from "../../../data/adminDashboardNav";
import type { BadgeTone } from "../../../types";

interface SettingsLink {
  label: string;
  description: string;
  icon: typeof UserRound;
  tone: BadgeTone;
  path?: string;
}

const LINKS: SettingsLink[] = [
  { label: "Organization Profile", description: "Hospital details, facilities, and timings.", icon: UserRound, tone: "blue", path: "organization" },
  { label: "Notifications", description: "See and manage your notifications.", icon: Bell, tone: "green", path: "notifications" },
  { label: "Privacy & Security", description: "Account security, login activity, and data access.", icon: Lock, tone: "purple", path: "privacy" },
];

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { organization } = useAdmin();
  const [notifPrefs, setNotifPrefs] = useState({
    newApplications: true,
    documentVerification: true,
    doctorStatus: true,
    system: false,
  });

  const goTo = (path: string) => navigate(`${ADMIN_DASHBOARD_ROOT}/${path}`);

  const toggleNotifPref = (key: keyof typeof notifPrefs) =>
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    showToast({ tone: "info", title: "Logged out", description: "You have been signed out of MediKiosk." });
    navigate("/admin/login");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Manage your account, notifications, and privacy preferences.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={organization.adminFullName || "Administrator"} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-mx-ink">{organization.adminFullName || "Administrator"}</p>
            <p className="truncate text-xs text-mx-ink-muted">
              Administrator · {organization.organizationName || "Your organization"}
            </p>
          </div>
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              type="button"
              onClick={() => link.path && goTo(link.path)}
              className="flex w-full items-center gap-3 border-b border-mx-border p-4 text-left last:border-b-0 hover:bg-mx-surface-sunken"
            >
              <MedicalIcon icon={Icon} tone={link.tone} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-mx-ink">{link.label}</p>
                <p className="mt-0.5 text-xs text-mx-ink-muted">{link.description}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
            </button>
          );
        })}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <MedicalIcon icon={Languages} tone="blue" size={16} className="h-9 w-9" />
          <CardTitle>Language</CardTitle>
        </div>
        <p className="mb-3 text-sm text-mx-ink-muted">Choose the language your dashboard is shown in.</p>
        <LanguageSelector />
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <MedicalIcon icon={SlidersHorizontal} tone="green" size={16} className="h-9 w-9" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <ul className="divide-y divide-mx-border">
          <PrefToggle
            label="New doctor applications"
            checked={notifPrefs.newApplications}
            onChange={() => toggleNotifPref("newApplications")}
          />
          <PrefToggle
            label="Document verification updates"
            checked={notifPrefs.documentVerification}
            onChange={() => toggleNotifPref("documentVerification")}
          />
          <PrefToggle
            label="Doctor status changes"
            checked={notifPrefs.doctorStatus}
            onChange={() => toggleNotifPref("doctorStatus")}
          />
          <PrefToggle
            label="System announcements"
            checked={notifPrefs.system}
            onChange={() => toggleNotifPref("system")}
          />
        </ul>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <MedicalIcon icon={KeyRound} tone="warning" size={16} className="h-9 w-9" />
          <CardTitle>Password</CardTitle>
        </div>
        <p className="mb-3 text-sm text-mx-ink-muted">Last changed a while ago. Update it periodically to keep your account secure.</p>
        <button
          type="button"
          onClick={() =>
            showToast({ tone: "info", title: "Password reset", description: "A password reset link would be sent to your registered email." })
          }
          className="text-sm font-semibold text-mx-green-strong hover:underline"
        >
          Change Password
        </button>
      </Card>

      <Card>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-mx-sm py-2 text-sm font-semibold text-mx-danger hover:bg-mx-danger-soft"
        >
          <LogOut size={16} aria-hidden="true" />
          Logout
        </button>
      </Card>
    </div>
  );
}

function PrefToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-mx-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      >
        <span
          className={
            "absolute inset-0 rounded-full transition-colors " + (checked ? "bg-mx-green" : "bg-mx-border-strong")
          }
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
        <span
          className={
            "relative inline-block h-4.5 w-4.5 transform rounded-full bg-mx-surface-raised shadow transition-transform " +
            (checked ? "translate-x-6" : "translate-x-1")
          }
        />
      </button>
    </li>
  );
}
