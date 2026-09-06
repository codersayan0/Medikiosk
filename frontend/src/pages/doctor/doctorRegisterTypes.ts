/**
 * Step 1 (Personal Information + Contact Information + Account Security)
 * form state for Doctor Registration. Mirrors RegisterFormState from the
 * patient flow (see pages/patient/PatientRegisterPage) in shape/spirit —
 * kept as its own type since the doctor flow has different fields (no
 * ABDM identifier, a real Email Address field, no combined
 * email-or-ABDM identifier).
 */
export interface DoctorRegisterFormState {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
  /** Local-preview-only object URL from the file input — no backend upload in this phase. */
  photoUrl: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  alternatePhone: string;
  country: string;
  state: string;
  district: string;
  zip: string;
  password: string;
  confirmPassword: string;
}

export const DOCTOR_GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const DOCTOR_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const day = String(i + 1);
  return { value: day, label: day };
});

export const DOCTOR_MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((label, i) => ({ value: String(i + 1), label }));

const CURRENT_YEAR = new Date().getFullYear();
export const DOCTOR_YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => {
  const year = String(CURRENT_YEAR - i);
  return { value: year, label: year };
});

/**
 * Step 3 — Professional Information. Kept separate from
 * DoctorRegisterFormState since it's collected on its own step.
 */
export interface DoctorProfessionalInfoState {
  registrationNumber: string;
  registrationAuthority: string;
  yearOfRegistration: string;
  specialization: string;
  qualification: string;
  yearsOfExperience: string;
  hospitalName: string;
  designation: string;
  consultationType: "in-person" | "online" | "both" | "";
}

export const INITIAL_DOCTOR_PROFESSIONAL_INFO: DoctorProfessionalInfoState = {
  registrationNumber: "",
  registrationAuthority: "",
  yearOfRegistration: "",
  specialization: "",
  qualification: "",
  yearsOfExperience: "",
  hospitalName: "",
  designation: "",
  consultationType: "",
};

/** A single required professional document slot for Step 4. */
export interface DoctorDocumentSlot {
  id: "registrationCertificate" | "degreeCertificate" | "identityProof" | "clinicId";
  label: string;
  hint: string;
  required: boolean;
  file: File | null;
}

export const INITIAL_DOCTOR_DOCUMENT_SLOTS: DoctorDocumentSlot[] = [
  {
    id: "registrationCertificate",
    label: "Medical Registration Certificate",
    hint: "PDF, JPG or PNG, up to 5 MB.",
    required: true,
    file: null,
  },
  {
    id: "degreeCertificate",
    label: "Medical Degree / Qualification Certificate",
    hint: "PDF, JPG or PNG, up to 5 MB.",
    required: true,
    file: null,
  },
  {
    id: "identityProof",
    label: "Identity Proof",
    hint: "Government-issued ID — PDF, JPG or PNG, up to 5 MB.",
    required: true,
    file: null,
  },
  {
    id: "clinicId",
    label: "Hospital / Clinic ID",
    hint: "Optional — PDF, JPG or PNG, up to 5 MB.",
    required: false,
    file: null,
  },
];
