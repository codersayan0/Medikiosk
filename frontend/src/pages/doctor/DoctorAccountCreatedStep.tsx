import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  KeyRound,
  Lightbulb,
  Lock,
  LayoutGrid,
  ShieldCheck,
  UserCircle2,
  UserCog,
  Share2,
  KeySquare,
  Search,
  Headset,
  Sparkles,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { DoctorRegistrationProgress } from "../../components/doctor/DoctorRegistrationProgress";
import { useTheme } from "../../context/ThemeContext";
import type { DoctorRegisterFormState } from "./doctorRegisterTypes";
import type { SelectedHospital } from "./doctorHospitalTypes";
import doctorIllustration from "../../assets/illustrations/doctor-account-created.png";

interface DoctorAccountCreatedStepProps {
  form: DoctorRegisterFormState;
  /** The hospital the doctor's application was approved for, if any (null when the doctor used "Skip This Step"). */
  hospital?: SelectedHospital | null;
  onGoToDashboard: () => void;
}

/**
 * Doctor Registration — Step 6 (Account Created), the final step. Reached
 * only after admin approval — in a real deployment via the "Complete
 * Registration / Activate Account" link in the approval email; here via
 * the demo affordance on DoctorHospitalApplicationSubmittedStep (see
 * DoctorRegisterPage). Three-column layout (Registration Progress /
 * account details / Account Information + Important Notes) mirrors the
 * MediKiosk "Account Created" reference exactly.
 */
export function DoctorAccountCreatedStep({ form, hospital, onGoToDashboard }: DoctorAccountCreatedStepProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { setHasPageHeader } = useTheme();

  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
  const fullName = `Dr. ${form.firstName} ${form.lastName}`.trim() || "Doctor";

  // Demo-only identifiers — a real backend issues the permanent Doctor ID /
  // User ID on account activation; these stay stable for the lifetime of
  // this mount so they read consistently across the page and match what
  // the doctor will use to log in going forward.
  const { doctorId, userId, createdOn } = useMemo(() => {
    const year = new Date().getFullYear();
    const randomDigits = String(Math.floor(100000 + Math.random() * 900000));
    const shortCode = String(Math.floor(100 + Math.random() * 900));
    const firstNameClean = (form.firstName || "DR").replace(/[^a-zA-Z]/g, "").toUpperCase();
    return {
      doctorId: `DOC-${year}-${randomDigits.slice(0, 6)}`,
      userId: `DR.${firstNameClean}${shortCode}`,
      createdOn: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountFields: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: "Full Name", value: fullName },
    { label: "Email", value: form.email || "—" },
    { label: "Phone Number", value: form.phone ? `${form.phoneCountryCode} ${form.phone}` : "—" },
    { label: "Doctor ID", value: doctorId, highlight: true },
    { label: "User ID", value: userId },
    { label: "Account Type", value: "Medical Practitioner" },
    ...(hospital ? [{ label: "Approved Hospital", value: hospital.name }] : []),
  ];

  const whatsNext = [
    {
      icon: Lock,
      tone: "green" as const,
      title: "Secure Login",
      description: "Use your User ID and Password to securely log in to your account.",
    },
    {
      icon: LayoutGrid,
      tone: "blue" as const,
      title: "Access Dashboard",
      description: "Manage your profile, view applications and hospital details.",
    },
    {
      icon: UserCog,
      tone: "purple" as const,
      title: "Manage Profile",
      description: "Keep your profile and documents updated for smooth experience.",
    },
  ];

  const importantNotes = [
    { icon: ShieldCheck, text: "Keep your login credentials safe and secure." },
    { icon: Share2, text: "Do not share your account details with anyone." },
    { icon: Search, text: "You can reset your password anytime from login page." },
    { icon: Headset, text: "For any issue, contact our support team." },
  ];

  const TONE_ICON_BG: Record<"green" | "blue" | "purple", string> = {
    green: "bg-mx-green-soft text-mx-green-strong",
    blue: "bg-mx-blue-soft text-mx-blue",
    purple: "bg-mx-purple-soft text-mx-purple",
  };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-mx-border bg-mx-surface-raised px-4 py-2.5 sm:px-6">
        <Logo size={30} withWordmark />
        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </header>

      <motion.div
        {...fade}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 lg:py-5"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left: Registration Progress sidebar */}
          <DoctorRegistrationProgress currentStepIndex={5} className="lg:order-1" />

          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <Badge tone="green">Step 6 of 6</Badge>
              <h1 className="mt-2.5 font-display text-2xl font-bold text-mx-ink sm:text-[28px]">Account Created</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-mx-ink-soft">
                Congratulations! Your MediKiosk doctor account has been created successfully.
                <br />
                Your account is now active and ready to use.
              </p>
            </div>

            {/* Success card */}
            <div className="rounded-mx-lg border border-mx-green/20 bg-mx-green-soft/40 p-4 sm:p-5">
              <div className="flex flex-col items-center gap-1.5 py-2 text-center">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-mx-green text-mx-ink-inverse shadow-mx-sm">
                  <CheckCircle2 size={30} aria-hidden="true" />
                  <Sparkles size={14} className="absolute -left-6 -top-1 text-mx-purple" aria-hidden="true" />
                  <Sparkles size={12} className="absolute -right-7 top-2 text-mx-blue" aria-hidden="true" />
                </span>
                <h2 className="mt-2 font-display text-xl font-bold text-mx-green-strong">Registration Successful!</h2>
                <p className="text-sm text-mx-ink-muted">Your account is now active.</p>
              </div>

              {/* Account details card */}
              <Card className="mt-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <UserCircle2 size={18} className="text-mx-ink-soft" aria-hidden="true" />
                      <h3 className="font-display text-sm font-bold text-mx-ink sm:text-base">Your Account Details</h3>
                    </div>
                    <dl className="mt-3 flex flex-col gap-2">
                      {accountFields.map((row) => (
                        <div key={row.label} className="flex items-baseline justify-between gap-3 sm:justify-start">
                          <dt className="w-32 shrink-0 text-xs font-medium text-mx-ink-muted sm:text-sm">{row.label}</dt>
                          <dd
                            className={
                              "truncate text-xs font-semibold sm:text-sm " +
                              (row.highlight ? "text-mx-green-strong" : "text-mx-ink")
                            }
                          >
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="hidden shrink-0 self-stretch sm:block">
                    <img
                      src={doctorIllustration}
                      alt="Doctor account illustration"
                      className="h-full max-h-[180px] w-auto object-contain"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* What's Next */}
            <div>
              <h3 className="font-display text-sm font-bold text-mx-ink sm:text-base">What's Next?</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {whatsNext.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span
                      className={
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " + TONE_ICON_BG[item.tone]
                      }
                    >
                      <item.icon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-mx-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-mx-ink-muted">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation notice */}
            <div className="flex items-start gap-2.5 rounded-mx-md border border-mx-blue/20 bg-mx-blue-soft px-4 py-3 text-sm text-mx-ink-soft">
              <Info size={16} className="mt-0.5 shrink-0 text-mx-blue" aria-hidden="true" />
              <p>
                A confirmation email and SMS with your account details has been sent to your registered email and
                phone number.
              </p>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                icon={<ArrowLeft size={16} aria-hidden="true" />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={17} aria-hidden="true" />}
                iconPosition="right"
                onClick={onGoToDashboard}
                className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>

          {/* Right: Account Information / Important Notes / Need Help */}
          <div className="flex flex-col gap-4 lg:order-3">
            <Card>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                  <UserCircle2 size={16} aria-hidden="true" />
                </span>
                <h3 className="font-display text-sm font-bold text-mx-ink">Account Information</h3>
              </div>

              <Badge tone="green" className="mt-3">
                Account Created
              </Badge>
              <p className="mt-2 text-xs leading-relaxed text-mx-ink-muted">Your MediKiosk account is ready to use.</p>

              <div className="mt-3.5 flex flex-col gap-3 border-t border-mx-border pt-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-mx-sm bg-mx-blue-soft text-mx-blue">
                    <KeyRound size={13} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-mx-ink-muted">Account Created On</p>
                    <p className="text-sm font-semibold text-mx-ink">{createdOn}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-mx-sm bg-mx-blue-soft text-mx-blue">
                    <ShieldCheck size={13} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-mx-ink-muted">Account Status</p>
                    <p className="text-sm font-semibold text-mx-green-strong">Active</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-mx-sm bg-mx-blue-soft text-mx-blue">
                    <KeySquare size={13} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-mx-ink-muted">Login With</p>
                    <p className="text-sm font-semibold text-mx-ink">User ID & Password</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-mx-blue" aria-hidden="true" />
                <h3 className="font-display text-sm font-bold text-mx-blue">Important Notes</h3>
              </div>
              <ul className="mt-3 flex flex-col gap-2.5">
                {importantNotes.map((note) => (
                  <li key={note.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-mx-sm bg-mx-blue-soft text-mx-blue">
                      <note.icon size={12} aria-hidden="true" />
                    </span>
                    <span className="text-xs leading-relaxed text-mx-ink-soft">{note.text}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="rounded-mx-lg border border-mx-warning/25 bg-mx-warning-soft p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mx-warning/40 text-mx-warning">
                  <span className="text-sm font-bold">?</span>
                </span>
                <h3 className="font-display text-sm font-bold text-mx-warning">Need Help Getting Started?</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-mx-ink-soft">
                We've got a quick guide to help you understand your dashboard.
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-3 w-full">
                View User Guide
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
