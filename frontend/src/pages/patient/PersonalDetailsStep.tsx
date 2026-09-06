import { useEffect, useRef } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Eye,
  EyeOff,
  Globe2,
  Landmark,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { PatientAvatar } from "../../components/healthcare/PatientAvatar";
import { RegistrationProgressSidebar } from "../../components/patient/RegistrationProgressSidebar";
import { RegistrationSupportSidebar } from "../../components/patient/RegistrationSupportSidebar";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import { COUNTRY_OPTIONS } from "../../data/addressOptions";
import { PHONE_COUNTRY_CODE_OPTIONS } from "../../data/phoneCountryCodes";
import type { RegisterFormState } from "./PatientRegisterPage";

/** Exported so PatientRegisterPage (buildPatientSummary) reads the exact
 *  same day/month/year/gender option sets this step renders — one source
 *  of truth instead of a second, possibly-drifting copy. */
export const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const day = String(i + 1);
  return { value: day, label: day };
});

export const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((label, i) => ({ value: String(i + 1), label }));

const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => {
  const year = String(CURRENT_YEAR - i);
  return { value: year, label: year };
});

export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

interface PersonalDetailsStepProps {
  form: RegisterFormState;
  updateField<K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]): void;
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
 * Personal Information — Step 1 of registration. Previously rendered
 * inline inside PatientRegisterPage as a single centered auth-style card;
 * now its own component using the same own-header + 3-column
 * (RegistrationProgressSidebar / form / RegistrationSupportSidebar)
 * pattern already established by DocumentUploadStep and AiAnalysisStep,
 * so all full-page registration steps read as one consistent family.
 *
 * Field structure, validation, and RegisterFormState itself are owned by
 * the parent (PatientRegisterPage) exactly as before — this component is
 * presentation plus the handful of genuinely new fields (Phone Number,
 * Alternate Phone, Confirm Password, Profile Photo) whose local-only
 * concerns (e.g. the object URL for an unsaved photo) are simple enough
 * to live directly in updateField calls rather than a separate reducer.
 */
export function PersonalDetailsStep({
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
}: PersonalDetailsStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t, language, setLanguage } = useTranslation();
  const pd = t.personalDetailsStep;
  const { setHasPageHeader } = useTheme();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Same pattern as every other full-page registration step: this page
  // renders its own header, so hide AuthLayout's floating stand-in
  // ThemeSwitcher while mounted — this is what prevents the duplicate/
  // overlapping LanguageSelector this step used to have.
  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // Frontend-only preview — no backend upload call. See RegisterFormState.
    updateField("photoUrl", URL.createObjectURL(file));
  }

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
          {/* Left: Registration Progress sidebar (also carries the
              privacy note and Need Help card, mirroring the Doctor
              Registration flow's left column — see
              RegistrationProgressSidebar) */}
          <RegistrationProgressSidebar currentStepIndex={0} className="lg:order-1" />

          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">Create Your MediKiosk Account</h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                Start your secure health journey.
              </p>
            </div>

            <Card>
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                {/* 1. Personal Information */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-mx-green-strong" aria-hidden="true" />
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{pd.sectionPersonalTitle}</h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <PatientAvatar gender={form.gender} imageUrl={form.photoUrl || undefined} size={64} />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-mx-ink">{pd.profilePhotoLabel}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Camera size={14} aria-hidden="true" />}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        {pd.profilePhotoUploadButton}
                      </Button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <p className="text-xs text-mx-ink-muted">{pd.profilePhotoHint}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        autoComplete="given-name"
                        placeholder="First name"
                        icon={<User size={17} aria-hidden="true" />}
                        value={form.firstName}
                        onChange={(event) => updateField("firstName", event.target.value)}
                        required
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="Last Name"
                        type="text"
                        name="lastName"
                        autoComplete="family-name"
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={(event) => updateField("lastName", event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-mx-ink">
                      Date of Birth <span className="text-mx-danger">*</span>
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Select
                          label="Day"
                          placeholder="Day"
                          options={DAY_OPTIONS}
                          value={form.day}
                          onChange={(event) => updateField("day", event.target.value)}
                          required
                        />
                      </div>
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Select
                          label="Month"
                          placeholder="Month"
                          options={MONTH_OPTIONS}
                          value={form.month}
                          onChange={(event) => updateField("month", event.target.value)}
                          required
                        />
                      </div>
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Select
                          label="Year"
                          placeholder="Year"
                          options={YEAR_OPTIONS}
                          value={form.year}
                          onChange={(event) => updateField("year", event.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Select
                      label="Gender"
                      placeholder="Select your gender"
                      options={GENDER_OPTIONS}
                      value={form.gender}
                      onChange={(event) => updateField("gender", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-mx-border" />

                {/* 2. Contact Information */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-mx-green-strong" aria-hidden="true" />
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{pd.sectionContactTitle}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="Email Address or ABDM ID"
                        type="text"
                        name="identifier"
                        autoComplete="username"
                        placeholder="Email Address or ABDM ID"
                        icon={<Mail size={17} aria-hidden="true" />}
                        value={form.identifier}
                        onChange={(event) => updateField("identifier", event.target.value)}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="patient-register-phone" className="text-sm font-semibold text-mx-ink">
                        {pd.phoneLabel} <span className="text-mx-danger">*</span>
                      </label>
                      <div className="flex h-11 items-stretch overflow-hidden rounded-mx-sm border border-mx-border-strong bg-mx-surface focus-within:border-mx-blue">
                        <div className="relative border-r border-mx-border-strong">
                          <select
                            aria-label="Phone country code"
                            value={form.phoneCountryCode}
                            onChange={(event) => updateField("phoneCountryCode", event.target.value)}
                            className="h-full w-[4.75rem] appearance-none bg-transparent pl-2.5 pr-5 text-sm text-mx-ink"
                          >
                            {PHONE_COUNTRY_CODE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.flag} {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          id="patient-register-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          placeholder={pd.phonePlaceholder}
                          value={form.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                          required
                          className="h-full w-full bg-transparent px-3 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label={pd.alternatePhoneLabel}
                      type="tel"
                      name="alternatePhone"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={pd.alternatePhonePlaceholder}
                      icon={<Smartphone size={17} aria-hidden="true" />}
                      value={form.alternatePhone}
                      onChange={(event) => updateField("alternatePhone", event.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Select
                        label={t.patientRegisterAddress.countryLabel}
                        placeholder={t.patientRegisterAddress.countryPlaceholder}
                        icon={<Globe2 size={16} aria-hidden="true" />}
                        options={COUNTRY_OPTIONS}
                        value={form.country}
                        onChange={(event) => updateCountry(event.target.value)}
                        required
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Select
                        label={t.patientRegisterAddress.stateLabel}
                        placeholder={t.patientRegisterAddress.statePlaceholder}
                        icon={<Landmark size={16} aria-hidden="true" />}
                        options={stateOptions}
                        value={form.state}
                        onChange={(event) => updateField("state", event.target.value)}
                        disabled={!form.country}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label={t.patientRegisterAddress.districtLabel}
                        type="text"
                        name="district"
                        autoComplete="address-level2"
                        placeholder={t.patientRegisterAddress.districtPlaceholder}
                        icon={<Building2 size={16} aria-hidden="true" />}
                        value={form.district}
                        onChange={(event) => updateField("district", event.target.value)}
                        required
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label={t.patientRegisterAddress.zipLabel}
                        type="text"
                        name="zip"
                        inputMode="text"
                        autoComplete="postal-code"
                        placeholder={t.patientRegisterAddress.zipPlaceholder}
                        icon={<MapPin size={16} aria-hidden="true" />}
                        maxLength={12}
                        value={form.zip}
                        onChange={(event) => updateField("zip", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-mx-border" />

                {/* 3. Account Security */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-mx-green-strong" aria-hidden="true" />
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{pd.sectionSecurityTitle}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="patient-register-password" className="text-sm font-semibold text-mx-ink">
                          Password <span className="text-mx-danger">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                            <Lock size={17} aria-hidden="true" />
                          </span>
                          <input
                            id="patient-register-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={(event) => updateField("password", event.target.value)}
                            required
                            minLength={8}
                            className="h-11 w-full rounded-mx-sm border border-mx-border-strong bg-mx-surface pl-10 pr-11 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:border-mx-blue"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-mx-sm p-1 text-mx-ink-muted transition-colors hover:text-mx-ink-soft"
                          >
                            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                          </button>
                        </div>
                        <p className="text-xs text-mx-ink-muted">Use at least 8 characters.</p>
                      </div>
                    </div>

                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="patient-register-confirm-password" className="text-sm font-semibold text-mx-ink">
                          {pd.confirmPasswordLabel} <span className="text-mx-danger">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                            <Lock size={17} aria-hidden="true" />
                          </span>
                          <input
                            id="patient-register-confirm-password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={pd.confirmPasswordPlaceholder}
                            value={form.confirmPassword}
                            onChange={(event) => updateField("confirmPassword", event.target.value)}
                            required
                            minLength={8}
                            className="h-11 w-full rounded-mx-sm border border-mx-border-strong bg-mx-surface pl-10 pr-11 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:border-mx-blue"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            aria-pressed={showConfirmPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-mx-sm p-1 text-mx-ink-muted transition-colors hover:text-mx-ink-soft"
                          >
                            {showConfirmPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-start gap-2.5 text-sm text-mx-ink">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(event) => {
                          setConsentAccepted(event.target.checked);
                          if (event.target.checked) setConsentError(null);
                        }}
                        aria-invalid={Boolean(consentError)}
                        aria-describedby={consentError ? "patient-register-consent-error" : undefined}
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border bg-mx-surface text-mx-green accent-mx-green focus:outline-none focus:ring-2 focus:ring-mx-green-soft",
                          consentError ? "border-mx-danger" : "border-mx-border-strong"
                        )}
                      />
                      <span>
                        {t.patientRegisterConsent.prefix}{" "}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-mx-blue underline-offset-2 transition-colors hover:text-mx-green-strong hover:underline"
                        >
                          {t.patientRegisterConsent.privacyPolicyLabel}
                        </a>{" "}
                        {t.patientRegisterConsent.connector}{" "}
                        <a
                          href="/consent-terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-mx-blue underline-offset-2 transition-colors hover:text-mx-green-strong hover:underline"
                        >
                          {t.patientRegisterConsent.consentTermsLabel}
                        </a>
                      </span>
                    </label>
                    {consentError && (
                      <p id="patient-register-consent-error" role="alert" className="text-xs font-medium text-mx-danger">
                        {consentError}
                      </p>
                    )}
                  </div>
                </div>

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

          {/* Right: Why Choose / Privacy / Tips sidebar */}
          <RegistrationSupportSidebar className="lg:order-3" />
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

          {/* Opens the standalone Privacy Policy page in a NEW tab so this
              registration tab stays open and in place — a real link
              (not a JS-only handler) so it works with middle-click,
              "open in new tab", and without relying on JS timing. */}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-mx-ink-muted underline-offset-2 transition-colors hover:text-mx-ink-soft hover:underline"
          >
            {t.patientRegister.privacyPolicyLink}
          </a>

          <div className="flex items-center gap-2.5 text-xs" role="group" aria-label={t.a11y.switchLanguage}>
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
