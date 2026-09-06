/**
 * Shared hospital directory types/data for Doctor Registration Step 5
 * (Hospital Application) and its post-submission state
 * (DoctorHospitalApplicationSubmittedStep). Pulled into its own module so
 * both steps reference the exact same hospital record instead of two
 * slightly different shapes.
 */
export interface SelectedHospital {
  id: string;
  name: string;
  city: string;
  state: string;
  /** e.g. "Multi-speciality Hospital" */
  type: string;
  /** e.g. "Private" / "Government" */
  ownership: string;
  establishedYear: string;
  /** e.g. "250+" */
  beds: string;
  specialties: string[];
  opdServices: boolean;
  emergencyAvailable: boolean;
  verified: boolean;
}

/** Demo-only lookup — a real backend resolves this via a hospital directory API. */
export const MOCK_HOSPITALS: SelectedHospital[] = [
  {
    id: "HSP-10245",
    name: "City Care Hospital",
    city: "Kolkata",
    state: "West Bengal",
    type: "Multi-speciality Hospital",
    ownership: "Private",
    establishedYear: "2015",
    beds: "250+",
    specialties: ["Cardiology", "Neurology", "Orthopedics", "General Medicine"],
    opdServices: true,
    emergencyAvailable: true,
    verified: true,
  },
  {
    id: "HSP-10389",
    name: "Apollo Multi-Speciality Hospital",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Multi-speciality Hospital",
    ownership: "Private",
    establishedYear: "1998",
    beds: "400+",
    specialties: ["Oncology", "Cardiology", "Nephrology"],
    opdServices: true,
    emergencyAvailable: true,
    verified: true,
  },
  {
    id: "HSP-10502",
    name: "Manipal Hospital",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Multi-speciality Hospital",
    ownership: "Private",
    establishedYear: "1991",
    beds: "600+",
    specialties: ["Orthopedics", "Pediatrics", "General Medicine"],
    opdServices: true,
    emergencyAvailable: true,
    verified: true,
  },
];

export function findHospital(mode: "id" | "name", query: string): SelectedHospital | undefined {
  const trimmed = query.trim().toLowerCase();
  return MOCK_HOSPITALS.find((hospital) =>
    mode === "id" ? hospital.id.toLowerCase() === trimmed : hospital.name.toLowerCase().includes(trimmed)
  );
}

/** Demo-only Application ID generator — a real backend assigns this on submission. */
export function generateApplicationId(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APP-${new Date().getFullYear()}-${random}`;
}

export function formatApplicationDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
