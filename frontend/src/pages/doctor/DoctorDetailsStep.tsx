import { useEffect } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { DoctorRegistrationProgress } from "../../components/doctor/DoctorRegistrationProgress";
import { DoctorRegistrationSupportSidebar } from "../../components/doctor/DoctorRegistrationSupportSidebar";
import { DoctorPersonalInformation } from "./DoctorPersonalInformation";
import { DoctorContactInformation } from "./DoctorContactInformation";
import { DoctorAccountSecurity } from "./DoctorAccountSecurity";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import type { DoctorRegisterFormState } from "./doctorRegisterTypes";

interface DoctorDetailsStepProps {
  form: DoctorRegisterFormState;
  updateField<K extends keyof DoctorRegisterFormState>(field: K, value: DoctorRegisterFormState[K]): void;
  updateCountry(value: string): void;
  stateOptions: { value: string; label: string }[];
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: Dispatch<SetStateAction<boolean>>;
  consentAccepted: boolean;
  setConsentAccepted: Dispatch<SetStateAction<boolean>>;
  consentError: string | null;
  setConsentError: Dispatch<SetStateAction<string | null>>;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
}

/**
 * Doctor Registration — Step 1 (Personal Information + Contact
 * Information + Account Security). Uses the exact same own-header +
 * 3-column (DoctorRegistrationProgress / form / DoctorRegistrationSupportSidebar)
 * layout pattern as pages/patient/PersonalDetailsStep so this reads as the
 * same product as the Patient Registration flow — only the field content
 * and copy differ. Field structure, validation, and DoctorRegisterFormState
 * itself are owned by the parent (DoctorRegisterPage); this component is
 * presentation only, composed from DoctorPersonalInformation /
 * DoctorContactInformation / DoctorAccountSecurity.
 */
export function DoctorDetailsStep({
  form,
  updateField,
  updateCountry,
  stateOptions,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  consentAccepted,
  setConsentAccepted,
  consentError,
  setConsentError,
  error,
  isSubmitting,
  onSubmit,
  onBackToLogin,
}: DoctorDetailsStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { language, setLanguage } = useTranslation();
  const { setHasPageHeader } = useTheme();

  // Same pattern as every other full-page registration step: this page
  // renders its own header, so hide AuthLayout's floating stand-in
  // ThemeSwitcher while mounted.
  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          {/* Left: Registration Progress + privacy card */}
          <DoctorRegistrationProgress currentStepIndex={0} className="lg:order-1" />

          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">Create Your Doctor Account</h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                Start your professional journey with MediKiosk.
              </p>
            </div>

            <Card>
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <DoctorPersonalInformation form={form} updateField={updateField} />

                <div className="border-t border-mx-border" />

                <DoctorContactInformation
                  form={form}
                  updateField={updateField}
                  updateCountry={updateCountry}
                  stateOptions={stateOptions}
                />

                <div className="border-t border-mx-border" />

                <DoctorAccountSecurity
                  form={form}
                  updateField={updateField}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  consentAccepted={consentAccepted}
                  setConsentAccepted={setConsentAccepted}
                  consentError={consentError}
                  setConsentError={setConsentError}
                />

                {error && (
                  <p role="alert" className="-mt-1 text-xs font-medium text-mx-danger">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-mx-border pt-4 sm:flex-row">
                  <Button type="button" variant="outline" size="md" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={onBackToLogin}>
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    icon={<ArrowRight size={16} aria-hidden="true" />}
                    iconPosition="right"
                    className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                  >
                    {isSubmitting ? "Creating Account…" : "Continue"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right: Why Join / Registration Tips / Need Help sidebar */}
          <DoctorRegistrationSupportSidebar className="lg:order-3" />
        </div>

        {/* Footer */}
        <div className="mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-center gap-4 px-4 pb-2 sm:px-6">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mx-blue transition-colors hover:text-mx-green-strong"
          >
            <LogIn size={15} aria-hidden="true" />
            Already have an account? Log In
          </button>

          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-mx-ink-muted underline-offset-2 transition-colors hover:text-mx-ink-soft hover:underline"
          >
            Privacy Policy
          </a>

          <div className="flex items-center gap-2.5 text-xs" role="group" aria-label="Switch language">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                aria-pressed={opt.code === language}
                className={cn(
                  "font-medium transition-colors",
                  opt.code === language
                    ? "text-mx-green-strong font-semibold"
                    : "text-mx-ink-muted hover:text-mx-ink-soft"
                )}
              >
                {opt.nativeLabel}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-mx-ink-muted">
            <ShieldCheck size={15} className="shrink-0 text-mx-green" aria-hidden="true" />
            <span>Your health data is secure with us. We follow highest security standards.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
