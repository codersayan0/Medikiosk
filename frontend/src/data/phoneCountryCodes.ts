export interface PhoneCountryCodeOption {
  value: string;
  /** Dial code shown in the select, e.g. "+91". */
  label: string;
  /** Short flag/country hint shown alongside the dial code. */
  flag: string;
}

/**
 * Frontend-only mock dial-code list for the Patient Registration Phone
 * Number field. Kept in its own file (rather than folded into
 * data/addressOptions.ts) since it's a distinct concept — dial code, not
 * postal geography — even though the country set intentionally matches
 * COUNTRY_OPTIONS there. Swap for a real geography/telecom API later
 * without touching the form markup.
 */
export const PHONE_COUNTRY_CODE_OPTIONS: PhoneCountryCodeOption[] = [
  { value: "IN", label: "+91", flag: "🇮🇳" },
  { value: "US", label: "+1", flag: "🇺🇸" },
  { value: "GB", label: "+44", flag: "🇬🇧" },
  { value: "BD", label: "+880", flag: "🇧🇩" },
  { value: "AE", label: "+971", flag: "🇦🇪" },
  { value: "AU", label: "+61", flag: "🇦🇺" },
  { value: "CA", label: "+1", flag: "🇨🇦" },
  { value: "SG", label: "+65", flag: "🇸🇬" },
];

export const DEFAULT_PHONE_COUNTRY_CODE = "IN";
