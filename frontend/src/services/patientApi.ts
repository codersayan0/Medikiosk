import { apiRequest } from "./api";

import type {
  PatientRecord,
  PatientIdentity,
} from "../data/patientRecord";

export async function getPatientProfile(): Promise<PatientRecord> {
  return apiRequest<PatientRecord>(
    "/api/patient/profile",
    {
      method: "GET",
    }
  );
}


export async function updatePatientProfile(
  patch: Partial<PatientIdentity>
): Promise<PatientRecord> {

  const payload: Record<string, unknown> = {};

  if (patch.name !== undefined) {
    payload.name = patch.name;
  }

  if (patch.dob !== undefined) {
    payload.dob = patch.dob;
  }

  if (patch.gender !== undefined) {
    payload.gender = patch.gender;
  }

  if (patch.mobile !== undefined) {
    payload.mobile = patch.mobile;
  }

  if (patch.address !== undefined) {
    payload.address = patch.address;
  }

  if (patch.emergencyContact !== undefined) {
    payload.emergency_contact =
      patch.emergencyContact;
  }

  return apiRequest<PatientRecord>(
    "/api/patient/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}