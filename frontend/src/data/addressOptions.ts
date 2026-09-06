export interface AddressOption {
  value: string;
  label: string;
}

/**
 * Frontend-only mock geography data for the Patient Registration Address
 * section. Country drives which State options are shown, so State options
 * are keyed by country code. This is intentionally a small sample list —
 * swap it for a real geography dataset/API when the backend is connected.
 * The shape (flat Country list + Record<countryCode, State[]>) is kept
 * simple on purpose so that swap won't require touching the form
 * component itself, only this file.
 */
export const COUNTRY_OPTIONS: AddressOption[] = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "BD", label: "Bangladesh" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "SG", label: "Singapore" },
];

export const STATE_OPTIONS_BY_COUNTRY: Record<string, AddressOption[]> = {
  IN: [
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "DL", label: "Delhi" },
    { value: "GJ", label: "Gujarat" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "MH", label: "Maharashtra" },
    { value: "PB", label: "Punjab" },
    { value: "RJ", label: "Rajasthan" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TG", label: "Telangana" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "WB", label: "West Bengal" },
  ],
  US: [
    { value: "CA", label: "California" },
    { value: "FL", label: "Florida" },
    { value: "IL", label: "Illinois" },
    { value: "NY", label: "New York" },
    { value: "TX", label: "Texas" },
    { value: "WA", label: "Washington" },
  ],
  GB: [
    { value: "ENG", label: "England" },
    { value: "NIR", label: "Northern Ireland" },
    { value: "SCT", label: "Scotland" },
    { value: "WLS", label: "Wales" },
  ],
  BD: [
    { value: "DHK", label: "Dhaka" },
    { value: "CTG", label: "Chattogram" },
    { value: "KHL", label: "Khulna" },
    { value: "RAJ", label: "Rajshahi" },
    { value: "SYL", label: "Sylhet" },
  ],
  AE: [
    { value: "DXB", label: "Dubai" },
    { value: "AUH", label: "Abu Dhabi" },
    { value: "SHJ", label: "Sharjah" },
  ],
  AU: [
    { value: "NSW", label: "New South Wales" },
    { value: "QLD", label: "Queensland" },
    { value: "VIC", label: "Victoria" },
  ],
  CA: [
    { value: "BC", label: "British Columbia" },
    { value: "ON", label: "Ontario" },
    { value: "QC", label: "Quebec" },
  ],
  SG: [{ value: "SG", label: "Singapore" }],
};
