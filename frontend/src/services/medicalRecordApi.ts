import { apiRequest } from "./api";

export type MedicalRecordType =
  | "lab_report"
  | "prescription"
  | "diagnosis"
  | "visit"
  | "vitals"
  | "other";

export interface MedicalRecord {
  id: string;

  patient_id: string;
  doctor_id?: string | null;

  record_type: MedicalRecordType;

  title: string;
  summary: string;

  findings: string[];
  diagnosis: string[];

  vitals: Record<string, unknown>;

  prescription: Array<
    Record<string, unknown>
  >;

  record_date: string;

  created_at: string;
  updated_at: string;
}


export interface CreateMedicalRecordRequest {
  patient_id: string;

  record_type: MedicalRecordType;

  title: string;
  summary: string;

  findings?: string[];
  diagnosis?: string[];

  vitals?: Record<string, unknown>;

  prescription?: Array<
    Record<string, unknown>
  >;

  record_date: string;
}


export async function getMedicalRecords(): Promise<
  MedicalRecord[]
> {
  return apiRequest<MedicalRecord[]>(
    "/api/medical-records",
    {
      method: "GET",
    }
  );
}


export async function getMedicalRecord(
  id: string
): Promise<MedicalRecord> {
  return apiRequest<MedicalRecord>(
    `/api/medical-records/${id}`,
    {
      method: "GET",
    }
  );
}


export async function createMedicalRecord(
  data: CreateMedicalRecordRequest
): Promise<MedicalRecord> {

  const {
    patient_id,
    ...payload
  } = data;

  return apiRequest<MedicalRecord>(
    `/api/medical-records/doctor?patient_id=${encodeURIComponent(
      patient_id
    )}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}