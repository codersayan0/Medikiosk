import type { BadgeTone, Patient, PatientDirectoryStatus } from "../types";

/** Display label for each patient directory status. */
export const PATIENT_STATUS_LABEL: Record<PatientDirectoryStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  critical: "Critical",
};

/** Badge color for each patient directory status. */
export const PATIENT_STATUS_TONE: Record<PatientDirectoryStatus, BadgeTone> = {
  active: "green",
  inactive: "neutral",
  critical: "danger",
};

/** Case-insensitive match across the fields a search box should cover. */
export function patientMatchesQuery(patient: Patient, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    patient.fullName.toLowerCase().includes(q) ||
    patient.patientUID.toLowerCase().includes(q) ||
    patient.phone.toLowerCase().includes(q) ||
    patient.email.toLowerCase().includes(q)
  );
}

export function countPatientsByStatus(patients: Patient[]) {
  return {
    all: patients.length,
    active: patients.filter((p) => p.status === "active").length,
    inactive: patients.filter((p) => p.status === "inactive").length,
    critical: patients.filter((p) => p.status === "critical").length,
  };
}
