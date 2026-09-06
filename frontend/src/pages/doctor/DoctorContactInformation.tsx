import { Building2, Globe2, Landmark, Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { COUNTRY_OPTIONS } from "../../data/addressOptions";
import { PHONE_COUNTRY_CODE_OPTIONS } from "../../data/phoneCountryCodes";
import type { DoctorRegisterFormState } from "./doctorRegisterTypes";

interface DoctorContactInformationProps {
  form: DoctorRegisterFormState;
  updateField<K extends keyof DoctorRegisterFormState>(field: K, value: DoctorRegisterFormState[K]): void;
  updateCountry(value: string): void;
  stateOptions: { value: string; label: string }[];
}

/**
 * "2. Contact Information" — second card of Doctor Registration Step 1.
 * Same two-column grid, phone-with-country-code control, and address
 * fields as the Patient Registration Contact Information section (see
 * PersonalDetailsStep), reusing the same COUNTRY_OPTIONS /
 * PHONE_COUNTRY_CODE_OPTIONS / STATE_OPTIONS_BY_COUNTRY data sources.
 */
export function DoctorContactInformation({ form, updateField, updateCountry, stateOptions }: DoctorContactInformationProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Phone size={16} className="text-mx-green-strong" aria-hidden="true" />
        <div>
          <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">2. Contact Information</h2>
          <p className="text-xs text-mx-ink-muted">How can we reach you?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
          <Input
            label="Email Address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email Address"
            icon={<Mail size={17} aria-hidden="true" />}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="doctor-register-phone" className="text-sm font-semibold text-mx-ink">
            Phone Number <span className="text-mx-danger">*</span>
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
              id="doctor-register-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="Enter your phone number"
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
          label="Alternate Phone (Optional)"
          type="tel"
          name="alternatePhone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Enter alternate phone number"
          icon={<Smartphone size={17} aria-hidden="true" />}
          value={form.alternatePhone}
          onChange={(event) => updateField("alternatePhone", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
          <Select
            label="Country"
            placeholder="Select country"
            icon={<Globe2 size={16} aria-hidden="true" />}
            options={COUNTRY_OPTIONS}
            value={form.country}
            onChange={(event) => updateCountry(event.target.value)}
            required
          />
        </div>
        <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
          <Select
            label="State"
            placeholder="Select state"
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
            label="District"
            type="text"
            name="district"
            autoComplete="address-level2"
            placeholder="Enter district"
            icon={<Building2 size={16} aria-hidden="true" />}
            value={form.district}
            onChange={(event) => updateField("district", event.target.value)}
            required
          />
        </div>
        <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
          <Input
            label="ZIP / PIN Code"
            type="text"
            name="zip"
            inputMode="text"
            autoComplete="postal-code"
            placeholder="Enter ZIP / PIN code"
            icon={<MapPin size={16} aria-hidden="true" />}
            maxLength={12}
            value={form.zip}
            onChange={(event) => updateField("zip", event.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
