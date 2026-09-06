import { useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  MapPin,
  Mail,
  Landmark,
  Lock,
  ImagePlus,
  Check,
  Siren,
  Clock,
  Truck,
  BedDouble,
  Baby,
  Scissors,
  Pill,
  FlaskConical,
  Droplet,
  ScanLine,
  Waves,
  Activity,
  CalendarClock,
  Accessibility,
  Languages,
  Stethoscope,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { AdminRegistrationProgress } from "../../components/admin/AdminRegistrationProgress";
import { PHONE_COUNTRY_CODE_OPTIONS } from "../../data/phoneCountryCodes";
import { STATE_OPTIONS_BY_COUNTRY } from "../../data/addressOptions";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import type { AdminOrganizationFormState } from "./adminRegisterTypes";
import {
  ORGANIZATION_TYPE_OPTIONS,
  EMERGENCY_SERVICE_OPTIONS,
  WEEKLY_CLOSED_DAY_OPTIONS,
  FACILITY_OPTIONS,
  CONSULTATION_TYPE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  LANGUAGE_CHIP_OPTIONS,
  SPECIALIZATION_OPTIONS,
} from "./adminRegisterTypes";

const IN_STATE_OPTIONS = STATE_OPTIONS_BY_COUNTRY.IN ?? [];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

/** Icon shown per Facilities & Services chip — the only chip group with per-item icons in the reference design. */
const FACILITY_ICONS: Record<string, typeof Siren> = {
  "emergency-services": Siren,
  "24x7-emergency": Clock,
  "ambulance-service": Truck,
  icu: BedDouble,
  nicu: Baby,
  "operation-theatre": Scissors,
  pharmacy: Pill,
  laboratory: FlaskConical,
  "blood-bank": Droplet,
  "radiology-imaging": ScanLine,
  dialysis: Waves,
  "physiotherapy-facility": Activity,
};

type ArrayField = "facilities" | "consultationTypes" | "accessibility" | "languages" | "specializations";

interface AdminOrganizationDetailsStepProps {
  form: AdminOrganizationFormState;
  updateField<K extends keyof AdminOrganizationFormState>(field: K, value: AdminOrganizationFormState[K]): void;
  toggleArrayValue(field: ArrayField, value: string): void;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
}

/** Small numbered section heading used above each card, matching the reference image's "1  Admin Information" style. */
function SectionHeading({ index, title, icon: Icon }: { index: number; title: string; icon: typeof User }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mx-green text-xs font-bold text-mx-ink-inverse">
        {index}
      </span>
      <Icon size={16} className="text-mx-green-strong" aria-hidden="true" />
      <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{title}</h2>
    </div>
  );
}

/** Checkbox-style chip used for Facilities, Consultation, Accessibility, Languages, and Specializations. */
function Chip({
  label,
  selected,
  onToggle,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: typeof Siren;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-mx-sm border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
        selected
          ? "border-mx-green bg-mx-green-soft text-mx-green-strong"
          : "border-mx-border-strong bg-mx-surface text-mx-ink hover:bg-mx-surface-sunken"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
          selected ? "border-mx-green bg-mx-green text-mx-ink-inverse" : "border-mx-border-strong bg-mx-surface"
        )}
        aria-hidden="true"
      >
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
      {Icon && <Icon size={15} className="shrink-0" aria-hidden="true" />}
      <span className="truncate">{label}</span>
    </button>
  );
}

/** Phone number field with the same country-code + number two-part control used across the app (see DoctorContactInformation). */
function PhoneField({
  id,
  label,
  countryCode,
  onCountryCodeChange,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-mx-ink">
        {label} {required && <span className="text-mx-danger">*</span>}
      </label>
      <div className="flex h-11 items-stretch overflow-hidden rounded-mx-sm border border-mx-border-strong bg-mx-surface focus-within:border-mx-blue">
        <div className="relative border-r border-mx-border-strong">
          <select
            aria-label={`${label} country code`}
            value={countryCode}
            onChange={(event) => onCountryCodeChange(event.target.value)}
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
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Enter phone number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="h-full w-full bg-transparent px-3 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:outline-none"
        />
      </div>
    </div>
  );
}

/**
 * Admin Registration — Step 1 (Admin & Organization / Hospital Details).
 * Same own-header + left "Registration Progress" sidebar + main-column
 * card shell used by every other registration step in the app (see
 * DoctorDetailsStep / PersonalDetailsStep), reusing the existing Input,
 * Select, Card, Button, Logo, LanguageSelector, and ThemeSwitcher
 * components plus the shared phone-country-code and India state data
 * sources — no new design system, only new field content matching the
 * approved reference image.
 */
export function AdminOrganizationDetailsStep({
  form,
  updateField,
  toggleArrayValue,
  error,
  isSubmitting,
  onSubmit,
  onBackToLogin,
}: AdminOrganizationDetailsStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { language, setLanguage } = useTranslation();
  const { setHasPageHeader } = useTheme();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) return;
    updateField("organizationImageUrl", URL.createObjectURL(file));
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left: Registration Progress + Need Help + privacy */}
          <AdminRegistrationProgress currentStepIndex={0} className="lg:order-1" />

          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">
                Admin & Organization / Hospital Details
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                Please provide admin information and your organization / hospital details.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              {/* 1 & 2: Admin Information + Hospital / Organization Information */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
                <Card>
                  <div className="flex flex-col gap-4">
                    <SectionHeading index={1} title="Admin Information" icon={User} />
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="Admin Full Name"
                        type="text"
                        name="adminFullName"
                        autoComplete="name"
                        placeholder="Enter full name"
                        icon={<User size={17} aria-hidden="true" />}
                        value={form.adminFullName}
                        onChange={(event) => updateField("adminFullName", event.target.value)}
                        required
                      />
                    </div>
                    <PhoneField
                      id="admin-register-admin-phone"
                      label="Admin Phone Number"
                      countryCode={form.adminPhoneCountryCode}
                      onCountryCodeChange={(value) => updateField("adminPhoneCountryCode", value)}
                      value={form.adminPhone}
                      onChange={(value) => updateField("adminPhone", value)}
                      required
                    />
                    <p className="-mt-2 text-xs text-mx-ink-muted">We will send important updates to this number</p>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="Password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        icon={<Lock size={17} aria-hidden="true" />}
                        value={form.password}
                        onChange={(event) => updateField("password", event.target.value)}
                        required
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        icon={<Lock size={17} aria-hidden="true" />}
                        value={form.confirmPassword}
                        onChange={(event) => updateField("confirmPassword", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col gap-4">
                    <SectionHeading index={2} title="Hospital / Organization Information" icon={Building2} />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]">
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Input
                          label="Hospital / Organization Name"
                          type="text"
                          name="organizationName"
                          autoComplete="organization"
                          placeholder="Enter hospital / organization name"
                          icon={<Building2 size={17} aria-hidden="true" />}
                          value={form.organizationName}
                          onChange={(event) => updateField("organizationName", event.target.value)}
                          required
                        />
                      </div>

                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Select
                          label="Organization Type"
                          placeholder="Select organization type"
                          options={ORGANIZATION_TYPE_OPTIONS}
                          value={form.organizationType}
                          onChange={(event) => updateField("organizationType", event.target.value)}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-mx-ink">
                          Organization Image <span className="text-mx-danger">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="flex h-[86px] w-full flex-col items-center justify-center gap-1 rounded-mx-md border-2 border-dashed border-mx-border-strong bg-mx-surface px-2 text-center transition-colors hover:border-mx-blue sm:w-36"
                        >
                          {form.organizationImageUrl ? (
                            <img
                              src={form.organizationImageUrl}
                              alt="Organization"
                              className="h-10 w-10 rounded-mx-sm object-cover"
                            />
                          ) : (
                            <ImagePlus size={20} className="text-mx-ink-muted" aria-hidden="true" />
                          )}
                          <span className="text-[11px] font-semibold text-mx-ink">
                            {form.organizationImageUrl ? "Change image" : "Click to upload image"}
                          </span>
                          <span className="text-[10px] leading-tight text-mx-ink-muted">
                            PNG, JPG or WEBP (Max 2MB)
                          </span>
                        </button>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Input
                          label="Official Email"
                          type="email"
                          name="officialEmail"
                          autoComplete="email"
                          placeholder="Enter official email"
                          icon={<Mail size={17} aria-hidden="true" />}
                          value={form.officialEmail}
                          onChange={(event) => updateField("officialEmail", event.target.value)}
                          hint="OTP will be sent to this email for verification"
                          required
                        />
                      </div>
                      <PhoneField
                        id="admin-register-official-phone"
                        label="Official Phone"
                        countryCode={form.officialPhoneCountryCode}
                        onCountryCodeChange={(value) => updateField("officialPhoneCountryCode", value)}
                        value={form.officialPhone}
                        onChange={(value) => updateField("officialPhone", value)}
                        required
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3: Location / Address */}
              <Card>
                <div className="flex flex-col gap-4">
                  <SectionHeading index={3} title="Location / Address" icon={MapPin} />

                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Full Address"
                      type="text"
                      name="fullAddress"
                      autoComplete="street-address"
                      placeholder="Enter full address"
                      icon={<MapPin size={17} aria-hidden="true" />}
                      value={form.fullAddress}
                      onChange={(event) => updateField("fullAddress", event.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="City"
                        type="text"
                        name="city"
                        autoComplete="address-level2"
                        placeholder="Enter city"
                        value={form.city}
                        onChange={(event) => updateField("city", event.target.value)}
                        required
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="District"
                        type="text"
                        name="district"
                        autoComplete="address-level2"
                        placeholder="Enter district"
                        value={form.district}
                        onChange={(event) => updateField("district", event.target.value)}
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Select
                        label="State"
                        placeholder="Select state"
                        icon={<Landmark size={16} aria-hidden="true" />}
                        options={IN_STATE_OPTIONS}
                        value={form.state}
                        onChange={(event) => updateField("state", event.target.value)}
                        required
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Input
                        label="PIN / ZIP Code"
                        type="text"
                        name="zip"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="Enter PIN / ZIP code"
                        icon={<MapPin size={16} aria-hidden="true" />}
                        maxLength={12}
                        value={form.zip}
                        onChange={(event) => updateField("zip", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* 4 & 5: Facilities & Services + Consultation & Appointment */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Card>
                  <div className="flex flex-col gap-3">
                    <SectionHeading index={4} title="Facilities & Services" icon={Activity} />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {FACILITY_OPTIONS.map((opt) => (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          icon={FACILITY_ICONS[opt.value]}
                          selected={form.facilities.includes(opt.value)}
                          onToggle={() => toggleArrayValue("facilities", opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col gap-3">
                    <SectionHeading index={5} title="Consultation & Appointment" icon={CalendarClock} />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {CONSULTATION_TYPE_OPTIONS.map((opt) => (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          selected={form.consultationTypes.includes(opt.value)}
                          onToggle={() => toggleArrayValue("consultationTypes", opt.value)}
                        />
                      ))}
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <PhoneField
                        id="admin-register-appointment-phone"
                        label="Appointment Contact Number"
                        countryCode={form.appointmentContactCountryCode}
                        onCountryCodeChange={(value) => updateField("appointmentContactCountryCode", value)}
                        value={form.appointmentContactNumber}
                        onChange={(value) => updateField("appointmentContactNumber", value)}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* 6, 7, 8: Hospital Timing + Patient Accessibility + Languages Supported */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                  <div className="flex flex-col gap-4">
                    <SectionHeading index={6} title="Hospital Timing" icon={Clock} />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Input
                          label="OPD Opening Time"
                          type="time"
                          name="opdOpeningTime"
                          value={form.opdOpeningTime}
                          onChange={(event) => updateField("opdOpeningTime", event.target.value)}
                          required
                        />
                      </div>
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Input
                          label="OPD Closing Time"
                          type="time"
                          name="opdClosingTime"
                          value={form.opdClosingTime}
                          onChange={(event) => updateField("opdClosingTime", event.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Select
                        label="Emergency Service"
                        placeholder="Select availability"
                        options={EMERGENCY_SERVICE_OPTIONS}
                        value={form.emergencyService}
                        onChange={(event) => updateField("emergencyService", event.target.value)}
                      />
                    </div>
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                      <Select
                        label="Weekly Closed Day"
                        placeholder="Select day"
                        options={WEEKLY_CLOSED_DAY_OPTIONS}
                        value={form.weeklyClosedDay}
                        onChange={(event) => updateField("weeklyClosedDay", event.target.value)}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col gap-3">
                    <SectionHeading index={7} title="Patient Accessibility" icon={Accessibility} />
                    <div className="grid grid-cols-1 gap-2">
                      {ACCESSIBILITY_OPTIONS.map((opt) => (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          selected={form.accessibility.includes(opt.value)}
                          onToggle={() => toggleArrayValue("accessibility", opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col gap-3">
                    <SectionHeading index={8} title="Languages Supported" icon={Languages} />
                    <div className="grid grid-cols-2 gap-2">
                      {LANGUAGE_CHIP_OPTIONS.map((opt) => (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          selected={form.languages.includes(opt.value)}
                          onToggle={() => toggleArrayValue("languages", opt.value)}
                        />
                      ))}
                    </div>
                    {form.languages.includes("other") && (
                      <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                        <Input
                          label="Other Language"
                          type="text"
                          name="otherLanguage"
                          placeholder="Enter other language"
                          value={form.otherLanguage}
                          onChange={(event) => updateField("otherLanguage", event.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* 9: Specializations / Departments */}
              <Card>
                <div className="flex flex-col gap-3">
                  <SectionHeading index={9} title="Specializations / Departments" icon={Stethoscope} />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {SPECIALIZATION_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        selected={form.specializations.includes(opt.value)}
                        onToggle={() => toggleArrayValue("specializations", opt.value)}
                      />
                    ))}
                  </div>
                  {form.specializations.includes("other") && (
                    <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)] sm:max-w-xs">
                      <Input
                        label="Other Specialization"
                        type="text"
                        name="otherSpecialization"
                        placeholder="Enter other specialization"
                        value={form.otherSpecialization}
                        onChange={(event) => updateField("otherSpecialization", event.target.value)}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {error && (
                <p role="alert" className="text-xs font-medium text-mx-danger">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-mx-border pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={<ArrowLeft size={16} aria-hidden="true" />}
                  onClick={onBackToLogin}
                >
                  Back
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
                  {isSubmitting ? "Saving…" : "Continue"}
                </Button>
              </div>
            </form>
          </div>
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

          <div className="flex items-center gap-2.5 text-xs" role="group" aria-label="Switch language">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                aria-pressed={opt.code === language}
                className={cn(
                  "font-medium transition-colors",
                  opt.code === language ? "text-mx-green-strong font-semibold" : "text-mx-ink-muted hover:text-mx-ink-soft"
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