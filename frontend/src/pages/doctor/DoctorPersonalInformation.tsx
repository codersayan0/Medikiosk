import { useRef } from "react";
import type { ChangeEvent } from "react";
import { Camera, User } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { PatientAvatar } from "../../components/healthcare/PatientAvatar";
import type { DoctorRegisterFormState } from "./doctorRegisterTypes";
import { DOCTOR_DAY_OPTIONS, DOCTOR_GENDER_OPTIONS, DOCTOR_MONTH_OPTIONS, DOCTOR_YEAR_OPTIONS } from "./doctorRegisterTypes";

interface DoctorPersonalInformationProps {
  form: DoctorRegisterFormState;
  updateField<K extends keyof DoctorRegisterFormState>(field: K, value: DoctorRegisterFormState[K]): void;
}

/**
 * "1. Personal Information" — first card of Doctor Registration Step 1.
 * Same field structure, spacing, and input styling as
 * pages/patient/PersonalDetailsStep's Personal Information section, so the
 * page reads as the same product with doctor-specific content only.
 */
export function DoctorPersonalInformation({ form, updateField }: DoctorPersonalInformationProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // Frontend-only preview — no backend upload call. See DoctorRegisterFormState.
    updateField("photoUrl", URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <User size={16} className="text-mx-green-strong" aria-hidden="true" />
        <div>
          <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">1. Personal Information</h2>
          <p className="text-xs text-mx-ink-muted">Tell us about yourself.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PatientAvatar gender={form.gender} imageUrl={form.photoUrl || undefined} size={64} />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-mx-ink">Profile Photo</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Camera size={14} aria-hidden="true" />}
            onClick={() => photoInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <p className="text-xs text-mx-ink-muted">JPG or PNG, up to 5 MB.</p>
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
              options={DOCTOR_DAY_OPTIONS}
              value={form.day}
              onChange={(event) => updateField("day", event.target.value)}
              required
            />
          </div>
          <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
            <Select
              label="Month"
              placeholder="Month"
              options={DOCTOR_MONTH_OPTIONS}
              value={form.month}
              onChange={(event) => updateField("month", event.target.value)}
              required
            />
          </div>
          <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
            <Select
              label="Year"
              placeholder="Year"
              options={DOCTOR_YEAR_OPTIONS}
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
          options={DOCTOR_GENDER_OPTIONS}
          value={form.gender}
          onChange={(event) => updateField("gender", event.target.value)}
          required
        />
      </div>
    </div>
  );
}
