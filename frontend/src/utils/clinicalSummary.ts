import type {
  AllergyEntry,
  DocumentRecord,
  LabReportRecord,
  LabResultRow,
  MedicalHistoryEntry,
  MedicineEntry,
  PatientRecord,
  TimelineEvent,
  VisitDetail,
} from "../data/patientRecord";

/**
 * Structured "AI Health Summary" document model.
 *
 * Deliberately NOT built inside AiHealthSummaryPage.tsx's JSX — this module
 * only derives plain data from the shared `PatientRecord`. That keeps the
 * summary reusable wherever it's needed next (see Phase 3 brief, Part 13):
 * today it powers the patient-facing full-page summary, and the same
 * `buildClinicalSummary()` output is what a future Doctor Dashboard would
 * read too, without needing its own copy of this logic.
 *
 * Nothing here invents clinical findings — every field is either read
 * directly from `PatientRecord` or a straightforward derived rollup
 * (e.g. counting abnormal lab rows) of data that's already there.
 */

export type FlagSeverity = "info" | "warning" | "critical";

export interface ClinicalFlag {
  id: string;
  label: string;
  detail: string;
  severity: FlagSeverity;
}

export interface AbnormalLabValue {
  reportTitle: string;
  reportDate: string;
  row: LabResultRow;
}
export interface ClinicalSummary {
  patientName: string;
  patientId: string;
  generatedOn: string;
  lastUpdated: string;

  overallSummary: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: MedicalHistoryEntry[];
  surgeryHistory: MedicalHistoryEntry[];
  currentMedications: MedicineEntry[];
  allergies: AllergyEntry[];
  familyHistory: MedicalHistoryEntry[];
  lifestyle: MedicalHistoryEntry[];
  reviewOfSystems: string;

  labReports: LabReportRecord[];
  abnormalLabValues: AbnormalLabValue[];

  documents: DocumentRecord[];
  timeline: TimelineEvent[];

  ayushSummary: {
    assessmentDate: string;
    dashavidha: { label: string; value: string }[];
    aharaVihara: string;
    otherParams: { label: string; value: string }[];

    
  };

  
  flags: ClinicalFlag[];

  recentVisits: VisitDetail[];
  previousVisits: VisitDetail[];
}

function findRow(patient: PatientRecord, label: string): string | undefined {
  return patient.aiHealthSummaryFull.find((r) => r.label === label)?.value;
}

function deriveAbnormalLabValues(labReports: LabReportRecord[]): AbnormalLabValue[] {
  return labReports.flatMap((report) =>
    report.rows
      .filter((row) => row.status !== "Normal")
      .map((row) => ({ reportTitle: report.title, reportDate: report.date, row }))
  );
}

function deriveFlags(patient: PatientRecord, abnormalLabValues: AbnormalLabValue[]): ClinicalFlag[] {
  const flags: ClinicalFlag[] = [];

  for (const { reportTitle, reportDate, row } of abnormalLabValues) {
    flags.push({
      id: `lab-${reportTitle}-${row.test}`,
      label: `${row.test} — ${row.status}`,
      detail: `${row.result} (reference ${row.referenceRange}), from ${reportTitle} on ${reportDate}.`,
      severity: row.status === "High" || row.status === "Low" ? "warning" : "info",
    });
  }

  const allAllergies = [...patient.allergies.medicine, ...patient.allergies.food, ...patient.allergies.other];
  for (const allergy of allAllergies) {
    flags.push({
      id: `allergy-${allergy.allergen}`,
      label: `Documented allergy: ${allergy.allergen}`,
      detail: `${allergy.reaction} (${allergy.severity} severity).`,
      severity: allergy.severity === "Severe" ? "critical" : allergy.severity === "Moderate" ? "warning" : "info",
    });
  }

  if (flags.length === 0) {
    flags.push({
      id: "none",
      label: "No active flags",
      detail: "No abnormal lab values or documented allergies are currently on record.",
      severity: "info",
    });
  }

  return flags;
}

/**
 * Builds the full structured clinical summary from a `PatientRecord`. Pure
 * function — no React, no side effects — so it can be called from any
 * consumer (patient page today, doctor page later) and unit-tested on its
 * own.
 */
export function buildClinicalSummary(patient: PatientRecord): ClinicalSummary {
  const abnormalLabValues = deriveAbnormalLabValues(patient.labReports);

  // Deliberately no date-string parsing here — the record's authored order
  // in MOCK_PATIENT_RECORD.visits already reflects "most relevant right
  // now" first. A real backend would instead sort by an actual date field.
  const recentVisits = patient.visits.slice(0, 3);
  const previousVisits = patient.visits.slice(3);

  return {
    patientName: patient.identity.name,
    patientId: patient.identity.uid,
    generatedOn: patient.aiSummaryMeta.generatedOn,
    lastUpdated: patient.aiSummaryMeta.lastUpdated,

    overallSummary:
      `${patient.identity.name} is a ${patient.identity.age}-year-old ${patient.identity.gender.toLowerCase()} with ` +
      `${patient.medicalHistory.pastIllnesses.length} recorded past illness${patient.medicalHistory.pastIllnesses.length === 1 ? "" : "es"}, ` +
      `${patient.medicines.active.length} active medication${patient.medicines.active.length === 1 ? "" : "s"}, and ` +
      `${abnormalLabValues.length} lab value${abnormalLabValues.length === 1 ? "" : "s"} currently outside the reference range. ` +
      `This summary is generated from information already stored in MediKiosk — interviews, visit notes, and uploaded documents — and is intended to support, not replace, clinical judgment.`,

    chiefComplaint: findRow(patient, "Chief Complaint") ?? "No chief complaint currently on record.",
    historyOfPresentIllness:
      findRow(patient, "History of Present Illness") ?? "No history of present illness currently on record.",
    pastMedicalHistory: patient.medicalHistory.pastIllnesses,
    surgeryHistory: patient.medicalHistory.surgeries,
    currentMedications: patient.medicines.active,
    allergies: [...patient.allergies.medicine, ...patient.allergies.food, ...patient.allergies.other],
        familyHistory: patient.medicalHistory.familyHistory,
    lifestyle: patient.medicalHistory.lifestyle,
    reviewOfSystems: findRow(patient, "Review of Systems") ?? "No review of systems currently on record.",

    labReports: patient.labReports,
    abnormalLabValues,

    documents: patient.documents,
    timeline: patient.timeline,

    ayushSummary: {
      assessmentDate: patient.ayush.assessmentDate,
      dashavidha: patient.ayush.dashavidha,
      aharaVihara: patient.ayush.aharaVihara,
      otherParams: patient.ayush.otherParams,
    },

    flags: deriveFlags(patient, abnormalLabValues),

    recentVisits,
    previousVisits,
  };
}