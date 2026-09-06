import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Hash,
  Home,
  Info,
  Lock,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { DoctorRegistrationProgress } from "../../components/doctor/DoctorRegistrationProgress";
import { DoctorHospitalApplicationStatusSidebar } from "../../components/doctor/DoctorHospitalApplicationStatusSidebar";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import type { SelectedHospital } from "./doctorHospitalTypes";

interface DoctorHospitalApplicationSubmittedStepProps {
  hospital: SelectedHospital;
  applicationId: string;
  applicationDate: string;
  documentsUploadedCount: number;
  onBack: () => void;
  onGoHome: () => void;
  /** Demo-only hook: a real backend notifies the doctor and auto-advances
   *  this exact page the moment the hospital admin approves — see the
   *  "Simulate Admin Approval" affordance below and the module doc
   *  comment for the full notification story. */
  onSimulateAdminApproval: () => void;
}

const WHAT_HAPPENS_NEXT = [
  { title: "Hospital admin reviews the application", icon: ClipboardCheck },
  { title: "You receive a notification about the decision", icon: Bell },
  { title: "If approved, your MediKiosk account is created and you can log in", icon: ShieldCheck },
];

/**
 * Doctor Registration — Step 5 (Hospital Application), Phase 3: the
 * submitted / pending-review state shown immediately after the doctor
 * clicks "Send Your Application" on DoctorHospitalApplicationStep. No
 * "Track Application" button per spec — the doctor's only actions here
 * are Back and Go to Home. Reuses the exact `SelectedHospital` record
 * produced by the search step (see doctorHospitalTypes) so hospital
 * details never drift between the two screens.
 *
 * Live-approval story (frontend scope only — no real backend here):
 *   - While the doctor IS on this page when the hospital admin approves,
 *     a real deployment pushes the decision to this open page (e.g. via
 *     web sockets or polling) and it auto-advances to Step 6 "Account
 *     Created" without any doctor action. The demo-only "Simulate Admin
 *     Approval" button below stands in for that push and calls the same
 *     onSimulateAdminApproval() callback DoctorRegisterPage would wire a
 *     real push event to.
 *   - While the doctor is NOT on this page, a real deployment instead
 *     emails and SMS's them that the application was approved, with a
 *     secure link straight to Step 6 "Account Created" (or, after the
 *     doctor simply logs back in with their credentials, straight to
 *     the Doctor Dashboard — see DoctorAccountCreatedStep, which already
 *     covers both of those log-in paths).
 *   - Neither notification channel nor the secure link are implemented
 *     here since they require a real backend/mail/SMS provider; only
 *     the in-app state transition they'd ultimately trigger is.
 */
export function DoctorHospitalApplicationSubmittedStep({
  hospital,
  applicationId,
  applicationDate,
  documentsUploadedCount,
  onBack,
  onGoHome,
  onSimulateAdminApproval,
}: DoctorHospitalApplicationSubmittedStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { setHasPageHeader } = useTheme();

  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <DoctorRegistrationProgress currentStepIndex={5} highlightIndex={4} className="lg:order-1" />

          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-mx-green-soft px-2.5 py-1 text-xs font-semibold text-mx-green-strong">
                Step 5 of 6
              </span>
              <h1 className="mt-2 font-display text-lg font-bold text-mx-ink sm:text-xl">Hospital Application</h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                Your application has been submitted. The hospital admin will review your details and documents.
              </p>
            </div>

            <div className="flex items-center gap-3.5 rounded-mx-lg border border-mx-green/30 bg-mx-green-soft px-4 py-3.5 sm:px-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mx-surface-raised text-mx-green-strong">
                <CheckCircle2 size={22} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-mx-ink">Application Sent Successfully!</p>
                <p className="mt-0.5 text-xs leading-snug text-mx-ink-soft sm:text-sm">
                  Your application has been submitted to <span className="font-semibold">{hospital.name}</span> for
                  review.
                </p>
              </div>
            </div>

            <Card>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-mx-ink-soft" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-mx-ink">Selected Hospital</h2>
              </div>

              <div className="mt-3 flex flex-col gap-4 rounded-mx-lg border border-mx-green/30 bg-mx-green-soft/40 p-4 sm:flex-row sm:items-stretch">
                <div className="flex flex-1 items-start gap-3.5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-mx-md bg-mx-green-soft text-mx-green-strong">
                    <Building2 size={28} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-bold text-mx-ink">{hospital.name}</p>
                      {hospital.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-mx-surface-raised px-2 py-0.5 text-[11px] font-semibold text-mx-green-strong">
                          <ShieldCheck size={11} aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </div>
                    <dl className="mt-2 flex flex-col gap-1 text-xs text-mx-ink-soft">
                      <div className="flex items-center gap-1.5">
                        <dt className="sr-only">Location</dt>
                        <dd>
                          {hospital.city}, {hospital.state}
                        </dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <dt className="sr-only">Hospital type</dt>
                        <dd>{hospital.type}</dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <dt className="sr-only">Established</dt>
                        <dd>Established: {hospital.establishedYear}</dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <dt className="sr-only">Beds</dt>
                        <dd>Beds: {hospital.beds}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex-1 rounded-mx-md bg-mx-surface-raised p-3.5 text-xs">
                  <p className="font-display text-sm font-bold text-mx-ink">Hospital Overview</p>
                  <dl className="mt-2 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mx-ink-muted">Hospital Type</dt>
                      <dd className="text-right font-medium text-mx-ink">{hospital.ownership}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mx-ink-muted">Specialties</dt>
                      <dd className="max-w-[60%] text-right font-medium text-mx-ink">
                        {hospital.specialties.join(", ")}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mx-ink-muted">OPD Services</dt>
                      <dd className="text-right font-medium text-mx-ink">{hospital.opdServices ? "Yes" : "No"}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mx-ink-muted">Emergency</dt>
                      <dd className="text-right font-medium text-mx-ink">
                        {hospital.emergencyAvailable ? "24x7 Available" : "Not available"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2">
                <ClipboardCheck size={16} className="text-mx-ink-soft" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-mx-ink">Application Details</h2>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                    <Hash size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-mx-ink-muted">Application ID</p>
                    <p className="text-sm font-semibold text-mx-ink">{applicationId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                    <Calendar size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-mx-ink-muted">Application Date</p>
                    <p className="text-sm font-semibold text-mx-ink">{applicationDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">
                    <ClipboardCheck size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-mx-ink-muted">Status</p>
                    <p className="text-sm font-semibold text-mx-warning">Pending Review</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                    <User size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-mx-ink-muted">Application For</p>
                    <p className="text-sm font-semibold text-mx-ink">Medical Practitioner</p>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex items-center gap-2.5 border-t border-mx-border pt-3.5 text-xs">
                <FileCheck2 size={15} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
                <span className="text-mx-ink-muted">Documents Uploaded:</span>
                <span className="font-semibold text-mx-ink">{documentsUploadedCount} Documents</span>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-mx-lg border border-mx-blue/20 bg-mx-blue-soft px-3.5 py-3 text-xs leading-relaxed text-mx-blue">
                <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  The hospital admin can review all of your submitted professional information and uploaded
                  documents — registration certificate, degree certificate, identity proof, and hospital/clinic ID —
                  before making a decision.
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-mx-ink-soft" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-mx-ink">What happens next?</h2>
              </div>
              <ol className="mt-3 flex flex-col">
                {WHAT_HAPPENS_NEXT.map((step, index) => {
                  const isLast = index === WHAT_HAPPENS_NEXT.length - 1;
                  return (
                    <li key={step.title} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                          <step.icon size={14} aria-hidden="true" />
                        </span>
                        {!isLast && (
                          <span className="w-0.5 flex-1 bg-mx-border-strong" style={{ minHeight: "1.1rem" }} aria-hidden="true" />
                        )}
                      </div>
                      <p className={cn("text-sm font-medium text-mx-ink", isLast ? "pb-0" : "pb-3.5")}>{step.title}</p>
                    </li>
                  );
                })}
              </ol>
            </Card>

            <div className="flex flex-col-reverse items-center justify-between gap-3 pt-1 sm:flex-row">
              <Button type="button" variant="outline" size="md" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={onBack}>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={<Home size={16} aria-hidden="true" />}
                iconPosition="right"
                onClick={onGoHome}
                className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
              >
                Go to Home
              </Button>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-mx-ink-muted">
              <Lock size={12} className="shrink-0" aria-hidden="true" />
              Your application is now with the hospital admin for review.
            </p>

            {/* Demo-only affordance — see onSimulateAdminApproval prop note. A
                real deployment removes this button; the hospital admin
                approves from their own dashboard, and that decision is what
                pushes this page straight to Step 6 or triggers the
                email/SMS notification, not a click here. */}
            <div className="flex items-center justify-between gap-3 rounded-mx-md border border-dashed border-mx-border-strong bg-mx-surface-sunken px-3.5 py-3">
              <p className="text-xs leading-relaxed text-mx-ink-muted">
                Demo only — a real deployment removes this. Hospital admin approval happens in the Admin dashboard.
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={onSimulateAdminApproval}>
                Simulate Admin Approval
              </Button>
            </div>
          </div>

          <DoctorHospitalApplicationStatusSidebar
            hospital={hospital}
            applicationId={applicationId}
            applicationDate={applicationDate}
            className="lg:order-3"
          />
        </div>
      </motion.div>
    </div>
  );
}
