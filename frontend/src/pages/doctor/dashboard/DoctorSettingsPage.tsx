import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  User,
  Camera,
  Stethoscope,
  Hash,
  Mail,
  Phone,
  Building2,
  Languages,
  Palette,
  Clock,
  Bell,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldOff,
  Monitor,
  Smartphone,
  LogOut,
  Save,
  RotateCcw,
  X,
  CalendarClock,
  UserRound,
  AlertTriangle,
  FileStack,
  Pill,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Modal } from "../../../components/ui/Modal";
import { LanguageSelector } from "../../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../../components/ui/ThemeSwitcher";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { useToast } from "../../../context/ToastContext";
import { cn } from "../../../utils/cn";
import {
  DOCTOR_PROFILE,
  MOCK_DOCTOR_SESSIONS,
  type DoctorActiveSession,
} from "../../../data/mockDoctorDashboard";
import type { BadgeTone } from "../../../types";

// ---------------------------------------------------------------------------
// Local form types
// ---------------------------------------------------------------------------

interface ProfileFields {
  photoUrl: string;
  name: string;
  specialty: string;
  regNo: string;
  email: string;
  phone: string;
  organization: string;
  organizationId: string;
}

type ProfileErrorKey = keyof Omit<ProfileFields, "photoUrl">;

interface NotifyChannels {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface AlertTypes {
  appointmentAlerts: boolean;
  patientAlerts: boolean;
  triageAlerts: boolean;
  medicalRecordAlerts: boolean;
  prescriptionAlerts: boolean;
}

interface SettingsFormState {
  profile: ProfileFields;
  dateFormat: "DMY" | "MDY";
  timeFormat: "12h" | "24h";
  notifyChannels: NotifyChannels;
  alerts: AlertTypes;
  twoFactorEnabled: boolean;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "default" | "danger";
  onConfirm: () => void;
}

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------

const SPECIALTY_OPTIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "ENT Specialist",
  "Gastroenterologist",
  "Gynecologist",
  "Neurologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Urologist",
  "Other",
].map((s) => ({ value: s, label: s }));

const DATE_FORMAT_OPTIONS = [
  { value: "DMY", label: "DD/MM/YYYY" },
  { value: "MDY", label: "MM/DD/YYYY" },
];

const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "12-hour (2:30 PM)" },
  { value: "24h", label: "24-hour (14:30)" },
];

const DEFAULT_SETTINGS: SettingsFormState = {
  profile: {
    photoUrl: DOCTOR_PROFILE.photoUrl ?? "",
    name: DOCTOR_PROFILE.name,
    specialty: DOCTOR_PROFILE.specialty,
    regNo: DOCTOR_PROFILE.regNo,
    email: DOCTOR_PROFILE.email ?? "",
    phone: DOCTOR_PROFILE.phone ?? "",
    organization: DOCTOR_PROFILE.organization ?? "",
    organizationId: DOCTOR_PROFILE.organizationId ?? "",
  },
  dateFormat: "DMY",
  timeFormat: "12h",
  notifyChannels: { email: true, sms: false, push: true, inApp: true },
  alerts: {
    appointmentAlerts: true,
    patientAlerts: true,
    triageAlerts: true,
    medicalRecordAlerts: true,
    prescriptionAlerts: false,
  },
  twoFactorEnabled: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[A-Za-z0-9/-]{4,24}$/;

/**
 * Doctor Settings — Profile, Preferences, Security, and Notifications.
 * Page-level Save/Cancel/Reset act on Profile + Preferences + Notifications;
 * password changes and session revocation are self-contained sensitive
 * actions with their own confirmation + toasts.
 */
export default function DoctorSettingsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedSettings, setSavedSettings] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [errors, setErrors] = useState<Partial<Record<ProfileErrorKey, string>>>({});

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordFormState, string>>>({});
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [sessions, setSessions] = useState<DoctorActiveSession[]>(MOCK_DOCTOR_SESSIONS);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedSettings);

  const updateProfile = <K extends keyof ProfileFields>(field: K, value: ProfileFields[K]) => {
    setForm((prev) => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    if (field !== "photoUrl") setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // -- Photo upload ----------------------------------------------------------

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast({ tone: "error", title: "Unsupported file", description: "Please choose an image file (JPG, PNG, or WEBP)." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast({ tone: "error", title: "Image too large", description: "Please choose a photo under 2 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateProfile("photoUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  // -- Profile validation ------------------------------------------------------

  const validateProfile = (): Partial<Record<ProfileErrorKey, string>> => {
    const p = form.profile;
    const next: Partial<Record<ProfileErrorKey, string>> = {};
    if (!p.name.trim() || p.name.trim().length < 3) next.name = "Enter your full name.";
    if (!p.specialty.trim()) next.specialty = "Select your specialty.";
    if (!p.regNo.trim() || !ID_RE.test(p.regNo.trim())) next.regNo = "Enter a valid registration number.";
    if (!p.email.trim() || !EMAIL_RE.test(p.email.trim())) next.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(p.phone.replace(/\s+/g, ""))) next.phone = "Enter a valid 10-digit phone number.";
    if (!p.organization.trim()) next.organization = "Organization is required.";
    if (!p.organizationId.trim() || !ID_RE.test(p.organizationId.trim())) next.organizationId = "Enter a valid organization ID.";
    return next;
  };

  // -- Page-level actions ------------------------------------------------------

  const handleSave = () => {
    const profileErrors = validateProfile();
    if (Object.keys(profileErrors).length > 0) {
      setErrors(profileErrors);
      showToast({ tone: "error", title: "Some details need your attention", description: "Fix the highlighted fields and try again." });
      return;
    }

    const commit = () => {
      setSavedSettings(form);
      setConfirmState(null);
      showToast({ tone: "success", title: "Settings saved", description: "Your changes have been applied." });
    };

    const identityChanged =
      form.profile.regNo !== savedSettings.profile.regNo ||
      form.profile.organizationId !== savedSettings.profile.organizationId;

    if (identityChanged) {
      setConfirmState({
        title: "Confirm identity changes",
        description:
          "You're changing your registration number or organization ID. These are used to verify your identity on MediKiosk and may require admin re-verification.",
        confirmLabel: "Save changes",
        tone: "default",
        onConfirm: commit,
      });
    } else {
      commit();
    }
  };

  const handleCancel = () => {
    if (!isDirty) return;
    setConfirmState({
      title: "Discard changes?",
      description: "Any unsaved edits to your profile, preferences, or notifications will be lost.",
      confirmLabel: "Discard",
      tone: "danger",
      onConfirm: () => {
        setForm(savedSettings);
        setErrors({});
        setConfirmState(null);
        showToast({ tone: "info", title: "Changes discarded", description: "Your settings were reverted." });
      },
    });
  };

  const handleReset = () => {
    setConfirmState({
      title: "Reset to default settings?",
      description: "This restores your profile, preferences, and notification settings to their defaults. You'll still need to Save Changes to apply it.",
      confirmLabel: "Reset",
      tone: "danger",
      onConfirm: () => {
        setForm(DEFAULT_SETTINGS);
        setErrors({});
        setConfirmState(null);
        showToast({ tone: "info", title: "Settings reset", description: "Fields were restored to their defaults." });
      },
    });
  };

  // -- Password change ------------------------------------------------------

  const validatePassword = (): Partial<Record<keyof PasswordFormState, string>> => {
    const next: Partial<Record<keyof PasswordFormState, string>> = {};
    if (!passwordForm.currentPassword) next.currentPassword = "Enter your current password.";
    if (passwordForm.newPassword.length < 8 || !/[A-Za-z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword)) {
      next.newPassword = "Use at least 8 characters, with letters and numbers.";
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) next.confirmPassword = "Passwords do not match.";
    return next;
  };

  const handlePasswordSubmit = () => {
    const nextErrors = validatePassword();
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      showToast({ tone: "error", title: "Couldn't update password", description: "Fix the highlighted fields and try again." });
      return;
    }
    setConfirmState({
      title: "Update your password?",
      description: "You'll be signed out of all other devices and asked to sign in again there.",
      confirmLabel: "Update password",
      tone: "default",
      onConfirm: () => {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordErrors({});
        setConfirmState(null);
        showToast({ tone: "success", title: "Password updated", description: "Your password has been changed successfully." });
      },
    });
  };

  // -- Two-factor authentication ------------------------------------------------------

  const handleToggle2FA = () => {
    if (form.twoFactorEnabled) {
      setConfirmState({
        title: "Turn off two-factor authentication?",
        description: "Your account will be less protected without a second verification step at sign-in.",
        confirmLabel: "Turn off",
        tone: "danger",
        onConfirm: () => {
          setForm((prev) => ({ ...prev, twoFactorEnabled: false }));
          setConfirmState(null);
          showToast({ tone: "warning", title: "Two-factor authentication disabled", description: "You can turn it back on anytime." });
        },
      });
    } else {
      setForm((prev) => ({ ...prev, twoFactorEnabled: true }));
      showToast({ tone: "success", title: "Two-factor authentication enabled", description: "Your account now requires a second verification step." });
    }
  };

  // -- Sessions ------------------------------------------------------

  const handleRevokeSession = (session: DoctorActiveSession) => {
    setConfirmState({
      title: "Log out this device?",
      description: `This will end the session on ${session.device}. You'll need to sign in again there.`,
      confirmLabel: "Log out device",
      tone: "danger",
      onConfirm: () => {
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
        setConfirmState(null);
        showToast({ tone: "success", title: "Session ended", description: `Signed out of ${session.device}.` });
      },
    });
  };

  const handleRevokeAllSessions = () => {
    setConfirmState({
      title: "Log out of all other sessions?",
      description: "Every device except this one will be signed out immediately.",
      confirmLabel: "Log out all",
      tone: "danger",
      onConfirm: () => {
        setSessions((prev) => prev.filter((s) => s.current));
        setConfirmState(null);
        showToast({ tone: "success", title: "Other sessions signed out", description: "Only this device remains signed in." });
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeader eyebrow="Doctor Dashboard" title="Settings" description="Manage your profile, preferences, security, and notifications" />

      {/* PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={16} aria-hidden="true" /> Profile
          </CardTitle>
        </CardHeader>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative">
            {form.profile.photoUrl ? (
              <img
                src={form.profile.photoUrl}
                alt={`${form.profile.name} photo`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <Avatar name={form.profile.name} size={64} />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change doctor photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-mx-surface-raised bg-mx-green text-mx-ink-inverse hover:bg-mx-green-strong"
            >
              <Camera size={13} aria-hidden="true" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="text-sm font-semibold text-mx-ink">Doctor photo</p>
            <p className="text-xs text-mx-ink-muted">JPG, PNG, or WEBP. Max 2 MB.</p>
            {form.profile.photoUrl && (
              <button
                type="button"
                onClick={() => updateProfile("photoUrl", "")}
                className="mt-1 text-xs font-semibold text-mx-danger hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Doctor name"
            icon={<User size={16} aria-hidden="true" />}
            value={form.profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
            error={errors.name}
            required
          />
          <Select
            label="Specialty"
            icon={<Stethoscope size={16} aria-hidden="true" />}
            options={SPECIALTY_OPTIONS}
            value={form.profile.specialty}
            onChange={(e) => updateProfile("specialty", e.target.value)}
            error={errors.specialty}
            required
          />
          <Input
            label="Registration number"
            icon={<Hash size={16} aria-hidden="true" />}
            value={form.profile.regNo}
            onChange={(e) => updateProfile("regNo", e.target.value)}
            error={errors.regNo}
            required
          />
          <Input
            label="Email"
            type="email"
            icon={<Mail size={16} aria-hidden="true" />}
            value={form.profile.email}
            onChange={(e) => updateProfile("email", e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Phone"
            type="tel"
            icon={<Phone size={16} aria-hidden="true" />}
            value={form.profile.phone}
            onChange={(e) => updateProfile("phone", e.target.value)}
            error={errors.phone}
            required
          />
          <Input
            label="Organization"
            icon={<Building2 size={16} aria-hidden="true" />}
            value={form.profile.organization}
            onChange={(e) => updateProfile("organization", e.target.value)}
            error={errors.organization}
            required
          />
          <Input
            label="Organization ID"
            icon={<Hash size={16} aria-hidden="true" />}
            value={form.profile.organizationId}
            onChange={(e) => updateProfile("organizationId", e.target.value)}
            error={errors.organizationId}
            hint="Changing this may require admin re-verification."
            required
          />
        </div>
      </Card>

      {/* PREFERENCES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={16} aria-hidden="true" /> Preferences
          </CardTitle>
        </CardHeader>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-mx-ink-soft">
            <Languages size={15} aria-hidden="true" /> Interface language
          </span>
          <LanguageSelector />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-mx-border pt-3">
          <span className="text-sm text-mx-ink-soft">Theme</span>
          <ThemeSwitcher />
        </div>

        <div className="mt-3 border-t border-mx-border pt-3">
          <span className="mb-2 flex items-center gap-2 text-sm text-mx-ink-soft">
            <Clock size={15} aria-hidden="true" /> Date/time preference
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Date format"
              hideLabel
              options={DATE_FORMAT_OPTIONS}
              value={form.dateFormat}
              onChange={(e) => setForm((prev) => ({ ...prev, dateFormat: e.target.value as SettingsFormState["dateFormat"] }))}
            />
            <Select
              label="Time format"
              hideLabel
              options={TIME_FORMAT_OPTIONS}
              value={form.timeFormat}
              onChange={(e) => setForm((prev) => ({ ...prev, timeFormat: e.target.value as SettingsFormState["timeFormat"] }))}
            />
          </div>
        </div>

        <div className="mt-3 border-t border-mx-border pt-3">
          <p className="mb-1 text-sm text-mx-ink-soft">Notification preferences</p>
          <p className="mb-2 text-xs text-mx-ink-muted">How you'd like to receive alerts.</p>
          <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
            {(
              [
                { key: "email", label: "Email" },
                { key: "sms", label: "SMS" },
                { key: "push", label: "Push" },
                { key: "inApp", label: "In-app" },
              ] as const
            ).map((ch) => (
              <ToggleRow
                key={ch.key}
                label={ch.label}
                checked={form.notifyChannels[ch.key]}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    notifyChannels: { ...prev.notifyChannels, [ch.key]: !prev.notifyChannels[ch.key] },
                  }))
                }
                compact
              />
            ))}
          </div>
        </div>
      </Card>

      {/* SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={16} aria-hidden="true" /> Security
          </CardTitle>
        </CardHeader>

        <div className="space-y-3">
          <PasswordInput
            id="doctor-settings-current-password"
            label="Current password"
            value={passwordForm.currentPassword}
            onChange={(v) => {
              setPasswordForm((prev) => ({ ...prev, currentPassword: v }));
              setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }}
            show={showCurrentPw}
            onToggleShow={() => setShowCurrentPw((v) => !v)}
            error={passwordErrors.currentPassword}
          />
          <PasswordInput
            id="doctor-settings-new-password"
            label="New password"
            value={passwordForm.newPassword}
            onChange={(v) => {
              setPasswordForm((prev) => ({ ...prev, newPassword: v }));
              setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            show={showNewPw}
            onToggleShow={() => setShowNewPw((v) => !v)}
            error={passwordErrors.newPassword}
            hint={!passwordErrors.newPassword ? "Use at least 8 characters, with letters and numbers." : undefined}
          />
          <PasswordInput
            id="doctor-settings-confirm-password"
            label="Password confirmation"
            value={passwordForm.confirmPassword}
            onChange={(v) => {
              setPasswordForm((prev) => ({ ...prev, confirmPassword: v }));
              setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            show={showConfirmPw}
            onToggleShow={() => setShowConfirmPw((v) => !v)}
            error={passwordErrors.confirmPassword}
          />
          <Button variant="secondary" size="sm" onClick={handlePasswordSubmit}>
            Change password
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-mx-border pt-4">
          <span className="flex items-center gap-3">
            <MedicalIcon icon={form.twoFactorEnabled ? ShieldCheck : ShieldOff} tone={form.twoFactorEnabled ? "green" : "neutral"} size={16} />
            <span>
              <span className="block text-sm font-semibold text-mx-ink">Two-factor authentication</span>
              <span className="block text-xs text-mx-ink-muted">
                {form.twoFactorEnabled ? "Enabled — an extra step is required at sign-in." : "Add an extra layer of protection to your account."}
              </span>
            </span>
          </span>
          <SwitchControl checked={form.twoFactorEnabled} onChange={handleToggle2FA} label="Two-factor authentication" />
        </div>

        <div className="mt-4 border-t border-mx-border pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-mx-ink">Active sessions</p>
            {sessions.some((s) => !s.current) && (
              <button type="button" onClick={handleRevokeAllSessions} className="text-xs font-semibold text-mx-danger hover:underline">
                Log out all others
              </button>
            )}
          </div>
          <ul className="divide-y divide-mx-border">
            {sessions.map((session) => {
              const DeviceIcon = /android|iphone|app/i.test(session.device) ? Smartphone : Monitor;
              return (
                <li key={session.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="flex items-center gap-3">
                    <MedicalIcon icon={DeviceIcon} tone="blue" size={16} />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-medium text-mx-ink">
                        {session.device}
                        {session.current && (
                          <span className="rounded-full bg-mx-green-soft px-2 py-0.5 text-[10px] font-bold text-mx-green-strong">This device</span>
                        )}
                      </span>
                      <span className="block text-xs text-mx-ink-muted">{session.location} · {session.lastActive}</span>
                    </span>
                  </span>
                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session)}
                      className="shrink-0 text-xs font-semibold text-mx-danger hover:underline"
                    >
                      Log out
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      {/* NOTIFICATIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={16} aria-hidden="true" /> Notifications
          </CardTitle>
        </CardHeader>
        <div className="space-y-1">
          {(
            [
              { key: "appointmentAlerts", label: "Appointment alerts", desc: "New bookings, reschedules, and cancellations", icon: CalendarClock, tone: "blue" as BadgeTone },
              { key: "patientAlerts", label: "Patient alerts", desc: "Updates on patients in your queue", icon: UserRound, tone: "purple" as BadgeTone },
              { key: "triageAlerts", label: "Triage alerts", desc: "AI-flagged high-risk patients", icon: AlertTriangle, tone: "danger" as BadgeTone },
              { key: "medicalRecordAlerts", label: "Medical record alerts", desc: "New or updated patient documents", icon: FileStack, tone: "green" as BadgeTone },
              { key: "prescriptionAlerts", label: "Prescription alerts", desc: "Prescription requests and renewals", icon: Pill, tone: "warning" as BadgeTone },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-mx-sm px-1.5 py-2.5 transition-colors duration-150 hover:bg-mx-surface-sunken"
            >
              <span className="flex items-center gap-3">
                <MedicalIcon icon={item.icon} tone={item.tone} size={16} />
                <span>
                  <span className="block text-sm font-semibold text-mx-ink">{item.label}</span>
                  <span className="block text-xs text-mx-ink-muted">{item.desc}</span>
                </span>
              </span>
              <SwitchControl
                checked={form.alerts[item.key]}
                onChange={() =>
                  setForm((prev) => ({ ...prev, alerts: { ...prev.alerts, [item.key]: !prev.alerts[item.key] } }))
                }
                label={item.label}
              />
            </label>
          ))}
        </div>
      </Card>

      {/* ACTIONS */}
      <Card className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="ghost" icon={<RotateCcw size={16} aria-hidden="true" />} onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outline" icon={<X size={16} aria-hidden="true" />} onClick={handleCancel} disabled={!isDirty}>
          Cancel
        </Button>
        <Button variant="primary" icon={<Save size={16} aria-hidden="true" />} onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </Card>

      {/* Confirmation modal — sensitive actions */}
      <Modal
        isOpen={confirmState !== null}
        onClose={() => setConfirmState(null)}
        title={confirmState?.title ?? ""}
        description={confirmState?.description}
        footer={
          confirmState && (
            <>
              <Button variant="ghost" onClick={() => setConfirmState(null)}>
                Cancel
              </Button>
              <Button variant={confirmState.tone === "danger" ? "danger" : "primary"} onClick={confirmState.onConfirm}>
                {confirmState.confirmLabel}
              </Button>
            </>
          )
        }
      >
        <p className="text-sm text-mx-ink-muted">This action requires confirmation before it takes effect.</p>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local helper components
// ---------------------------------------------------------------------------

function SwitchControl({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
    >
      <span className={cn("absolute inset-0 rounded-full transition-colors", checked ? "bg-mx-green" : "bg-mx-border-strong")} />
      <span className="sr-only">{checked ? "On" : "Off"}</span>
      <span
        className={cn(
          "relative inline-block h-4.5 w-4.5 transform rounded-full bg-mx-surface-raised shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  compact = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  compact?: boolean;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-2 py-1.5", compact && "pr-2")}>
      <span className="text-sm text-mx-ink">{label}</span>
      <SwitchControl checked={checked} onChange={onChange} label={label} />
    </label>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  error?: string;
  hint?: string;
}

function PasswordInput({ id, label, value, onChange, show, onToggleShow, error, hint }: PasswordInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-mx-ink">
        {label} <span className="text-mx-danger">*</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
          <Lock size={16} aria-hidden="true" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full rounded-mx-sm border bg-mx-surface pl-10 pr-11 text-sm text-mx-ink placeholder:text-mx-ink-muted",
            "border-mx-border-strong focus:border-mx-blue",
            error && "border-mx-danger"
          )}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-mx-sm p-1 text-mx-ink-muted hover:text-mx-ink-soft"
        >
          {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {hint && !error && <p className="text-xs text-mx-ink-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-mx-danger">{error}</p>}
    </div>
  );
}