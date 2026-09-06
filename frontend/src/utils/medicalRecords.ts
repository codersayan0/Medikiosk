import type { BadgeTone, MedicalRecord, MedicalRecordDocument, MedicalRecordStatus, MedicalRecordType } from "../types";

/** Display label for each record type — used in the table, filter dropdown, and drawer. */
export const RECORD_TYPE_LABEL: Record<MedicalRecordType, string> = {
  lab_report: "Lab Report",
  prescription: "Prescription",
  imaging_scan: "Imaging Scan",
  medical_report: "Medical Report",
  discharge_summary: "Discharge Summary",
  vaccination_record: "Vaccination Record",
};

/** Display label for each verification status — shared by records and their individual documents. */
export const RECORD_STATUS_LABEL: Record<MedicalRecordStatus, string> = {
  verified: "Verified",
  pending_review: "Pending Review",
  flagged: "Flagged",
};

/** Badge color for each verification status. */
export const RECORD_STATUS_TONE: Record<MedicalRecordStatus, BadgeTone> = {
  verified: "green",
  pending_review: "warning",
  flagged: "danger",
};

/** The document the table's "Document" column and the "Open Document" row action operate on. */
export function getPrimaryDocument(record: MedicalRecord): MedicalRecordDocument {
  return record.documents[0];
}

/** Case-insensitive match across the fields the search box should cover. */
export function medicalRecordMatchesQuery(record: MedicalRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    record.patientName.toLowerCase().includes(q) ||
    record.patientUID.toLowerCase().includes(q) ||
    record.doctorName.toLowerCase().includes(q) ||
    RECORD_TYPE_LABEL[record.recordType].toLowerCase().includes(q) ||
    record.documents.some((doc) => doc.fileName.toLowerCase().includes(q))
  );
}

export function countRecordsByStatus(records: MedicalRecord[]) {
  return {
    all: records.length,
    verified: records.filter((r) => r.status === "verified").length,
    pending_review: records.filter((r) => r.status === "pending_review").length,
    flagged: records.filter((r) => r.status === "flagged").length,
  };
}