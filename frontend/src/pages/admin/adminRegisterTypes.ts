/**
 * Admin Registration — Step 1 (Admin & Organization / Hospital Details)
 * form state, option lists, and constants. Mirrors the shape/spirit of
 * pages/doctor/doctorRegisterTypes.ts and pages/patient/PatientRegisterPage's
 * RegisterFormState — kept as its own type since the Admin flow collects a
 * hospital/organization profile rather than personal medical details.
 */

export interface AdminOrganizationFormState {
  // 1. Admin Information
  adminFullName: string;
  adminPhone: string;
  adminPhoneCountryCode: string;
  password: string;
  confirmPassword: string;

  // 2. Hospital / Organization Information
  organizationName: string;
  organizationType: string;
  /** Local-preview-only object URL from the file input — no backend upload in this phase. */
  organizationImageUrl: string;
  officialEmail: string;
  officialPhone: string;
  officialPhoneCountryCode: string;

  // 3. Location / Address
  fullAddress: string;
  city: string;
  district: string;
  state: string;
  zip: string;

  // 4. Facilities & Services (chip multi-select, values from FACILITY_OPTIONS)
  facilities: string[];

  // 5. Consultation & Appointment
  consultationTypes: string[];
  appointmentContactNumber: string;
  appointmentContactCountryCode: string;

  // 6. Hospital Timing
  opdOpeningTime: string;
  opdClosingTime: string;
  emergencyService: string;
  weeklyClosedDay: string;

  // 7. Patient Accessibility
  accessibility: string[];

  // 8. Languages Supported
  languages: string[];
  otherLanguage: string;

  // 9. Specializations / Departments
  specializations: string[];
  otherSpecialization: string;
}

export const INITIAL_ADMIN_ORGANIZATION_FORM: AdminOrganizationFormState = {
  adminFullName: "",
  adminPhone: "",
  adminPhoneCountryCode: "IN",
  password: "",
  confirmPassword: "",

  organizationName: "",
  organizationType: "",
  organizationImageUrl: "",
  officialEmail: "",
  officialPhone: "",
  officialPhoneCountryCode: "IN",

  fullAddress: "",
  city: "",
  district: "",
  state: "",
  zip: "",

  facilities: [],

  consultationTypes: [],
  appointmentContactNumber: "",
  appointmentContactCountryCode: "IN",

  opdOpeningTime: "",
  opdClosingTime: "",
  emergencyService: "",
  weeklyClosedDay: "",

  accessibility: [],

  languages: [],
  otherLanguage: "",

  specializations: [],
  otherSpecialization: "",
};

export const ORGANIZATION_TYPE_OPTIONS = [
  { value: "hospital", label: "Hospital" },
  { value: "multi-specialty-hospital", label: "Multi-Specialty Hospital" },
  { value: "super-specialty-hospital", label: "Super-Specialty Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostic-center", label: "Diagnostic Center" },
  { value: "nursing-home", label: "Nursing Home" },
  { value: "primary-health-center", label: "Primary Health Center" },
  { value: "other", label: "Other" },
];

export const EMERGENCY_SERVICE_OPTIONS = [
  { value: "24x7", label: "24×7 Available" },
  { value: "scheduled-hours", label: "During Scheduled Hours Only" },
  { value: "not-available", label: "Not Available" },
];

export const WEEKLY_CLOSED_DAY_OPTIONS = [
  { value: "none", label: "None — Open All Days" },
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

/** A chip option used across Facilities, Consultation, and Accessibility. */
export interface ChipOption {
  value: string;
  label: string;
}

export const FACILITY_OPTIONS: ChipOption[] = [
  { value: "emergency-services", label: "Emergency Services" },
  { value: "24x7-emergency", label: "24×7 Emergency" },
  { value: "ambulance-service", label: "Ambulance Service" },
  { value: "icu", label: "ICU Available" },
  { value: "nicu", label: "NICU Available" },
  { value: "operation-theatre", label: "Operation Theatre" },
  { value: "pharmacy", label: "Pharmacy Available" },
  { value: "laboratory", label: "Laboratory Available" },
  { value: "blood-bank", label: "Blood Bank Available" },
  { value: "radiology-imaging", label: "Radiology / Imaging" },
  { value: "dialysis", label: "Dialysis Available" },
  { value: "physiotherapy-facility", label: "Physiotherapy Available" },
];

export const CONSULTATION_TYPE_OPTIONS: ChipOption[] = [
  { value: "in-person", label: "In-person Consultation" },
  { value: "online", label: "Online Consultation" },
  { value: "both", label: "Both (In-person & Online)" },
  { value: "appointment-required", label: "Appointment Required" },
  { value: "walk-in", label: "Walk-in Available" },
  { value: "telemedicine", label: "Telemedicine Available" },
];

export const ACCESSIBILITY_OPTIONS: ChipOption[] = [
  { value: "wheelchair-accessible", label: "Wheelchair Accessible" },
  { value: "lift-available", label: "Lift Available" },
  { value: "parking-available", label: "Parking Available" },
  { value: "wheelchair-facility", label: "Wheelchair Facility" },
  { value: "accessible-washroom", label: "Accessible Washroom" },
  { value: "ramps-available", label: "Ramps Available" },
];

export const LANGUAGE_CHIP_OPTIONS: ChipOption[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "bengali", label: "Bengali" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "marathi", label: "Marathi" },
  { value: "kannada", label: "Kannada" },
  { value: "malayalam", label: "Malayalam" },
  { value: "other", label: "Other" },
];

export const SPECIALIZATION_OPTIONS: ChipOption[] = [
  { value: "general-medicine", label: "General Medicine" },
  { value: "cardiology", label: "Cardiology" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "gynecology", label: "Gynecology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "ent", label: "ENT" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "general-surgery", label: "General Surgery" },
  { value: "radiology", label: "Radiology" },
  { value: "pathology", label: "Pathology" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "nephrology", label: "Nephrology" },
  { value: "urology", label: "Urology" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "oncology", label: "Oncology" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "dental", label: "Dental" },
  { value: "other", label: "Other" },
];