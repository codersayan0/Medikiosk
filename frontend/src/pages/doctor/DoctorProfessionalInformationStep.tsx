import { useEffect } from "react";
import type { FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, Briefcase, Building2, GraduationCap, Hash, Stethoscope } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { DoctorRegistrationProgress } from "../../components/doctor/DoctorRegistrationProgress";
import { DoctorRegistrationSupportSidebar } from "../../components/doctor/DoctorRegistrationSupportSidebar";
import { useTheme } from "../../context/ThemeContext";
import type { DoctorProfessionalInfoState } from "./doctorRegisterTypes";
import { DOCTOR_YEAR_OPTIONS } from "./doctorRegisterTypes";

const CONSULTATION_TYPE_OPTIONS = [
  { value: "in-person", label: "In-person" },
  { value: "online", label: "Online" },
  { value: "both", label: "Both" },
];

interface DoctorProfessionalInformationStepProps {
  form: DoctorProfessionalInfoState;
  updateField<K extends keyof DoctorProfessionalInfoState>(field: K, value: DoctorProfessionalInfoState[K]): void;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

/**
 * Doctor Registration — Step 3 (Professional Information), shown after
 * OTP verification. Same own-header + 3-column layout as every other
 * full-page registration step. Collects the fields spec'd for this step:
 * Medical Registration Number, Registration Authority / Medical Council,
 * Year of Registration, Specialization, Qualification / Degree, Years of
 * Experience, Hospital / Clinic Name, Designation, Consultation Type.
 */
export function DoctorProfessionalInformationStep({
  form,
  updateField,
  error,
  isSubmitting,
  onSubmit,
  onBack,
}: DoctorProfessionalInformationStepProps) {
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
          <DoctorRegistrationProgress currentStepIndex={2} className="lg:order-1" />

          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">Professional Information</h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                Tell us about your medical practice and credentials.
              </p>
            </div>

            <Card>
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Medical Registration Number"
                      type="text"
                      placeholder="e.g. MCI-123456"
                      icon={<Hash size={17} aria-hidden="true" />}
                      value={form.registrationNumber}
                      onChange={(event) => updateField("registrationNumber", event.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Registration Authority / Medical Council"
                      type="text"
                      placeholder="e.g. National Medical Commission"
                      icon={<Award size={17} aria-hidden="true" />}
                      value={form.registrationAuthority}
                      onChange={(event) => updateField("registrationAuthority", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Select
                      label="Year of Registration"
                      placeholder="Select year"
                      options={DOCTOR_YEAR_OPTIONS}
                      value={form.yearOfRegistration}
                      onChange={(event) => updateField("yearOfRegistration", event.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Specialization"
                      type="text"
                      placeholder="e.g. Cardiology"
                      icon={<Stethoscope size={17} aria-hidden="true" />}
                      value={form.specialization}
                      onChange={(event) => updateField("specialization", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Qualification / Degree"
                      type="text"
                      placeholder="e.g. MBBS, MD"
                      icon={<GraduationCap size={17} aria-hidden="true" />}
                      value={form.qualification}
                      onChange={(event) => updateField("qualification", event.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Years of Experience"
                      type="number"
                      min={0}
                      max={70}
                      placeholder="e.g. 8"
                      icon={<Briefcase size={17} aria-hidden="true" />}
                      value={form.yearsOfExperience}
                      onChange={(event) => updateField("yearsOfExperience", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Hospital / Clinic Name"
                      type="text"
                      placeholder="e.g. City Care Hospital"
                      icon={<Building2 size={17} aria-hidden="true" />}
                      value={form.hospitalName}
                      onChange={(event) => updateField("hospitalName", event.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
                    <Input
                      label="Designation"
                      type="text"
                      placeholder="e.g. Consultant Physician"
                      icon={<Briefcase size={17} aria-hidden="true" />}
                      value={form.designation}
                      onChange={(event) => updateField("designation", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-mx-ink">
                    Consultation Type <span className="text-mx-danger">*</span>
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {CONSULTATION_TYPE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-mx-sm border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                          form.consultationType === opt.value
                            ? "border-mx-green bg-mx-green-soft text-mx-green-strong"
                            : "border-mx-border-strong bg-mx-surface text-mx-ink hover:bg-mx-surface-sunken"
                        }`}
                      >
                        <input
                          type="radio"
                          name="consultationType"
                          value={opt.value}
                          checked={form.consultationType === opt.value}
                          onChange={(event) =>
                            updateField("consultationType", event.target.value as DoctorProfessionalInfoState["consultationType"])
                          }
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <p role="alert" className="-mt-1 text-xs font-medium text-mx-danger">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-mx-border pt-4 sm:flex-row">
                  <Button type="button" variant="outline" size="md" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={onBack}>
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
                    Continue
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <DoctorRegistrationSupportSidebar className="lg:order-3" />
        </div>
      </motion.div>
    </div>
  );
}
