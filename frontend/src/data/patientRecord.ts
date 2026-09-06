/**
 * The single shared "current patient" data model for the Patient Dashboard.
 *
 * Every patient dashboard page (Phase 1A, 1B, 2) reads this same shape via
 * `usePatientRecord()` (see src/context/PatientContext.tsx) instead of
 * hardcoding or regenerating patient data per page. Sections that later
 * phases will build out (medicalHistory detail, full lab report list, full
 * document list, etc.) are already modeled here — Phase 1A only populates
 * enough of each to power the Overview page and Health ID, but the shape is
 * deliberately future-proof so Phase 1B/2 can extend the mock data without
 * restructuring anything that already consumes it.
 */

export interface PatientIdentity {
  name: string;
  age: number;
  gender: string;
  /** Patient UID shown throughout the dashboard (e.g. header, Health ID) — the single patient identifier. */
  uid: string;
  verified: boolean;
  photoUrl?: string;
  /** Phase 2B — My Profile page fields. Editing these updates this same shared record everywhere it's read. */
  dob: string;
  mobile: string;
  email: string;
  address: string;
  emergencyContact: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
}

export interface AiHealthSummaryRow {
  label: string;
  value: string;
}

export interface LabResultRow {
  test: string;
  result: string;
  referenceRange: string;
  status: "Low" | "High" | "Normal" | "Borderline";
}

export interface LabReportSummary {
  title: string;
  date: string;
  rows: LabResultRow[];
}

export type VisitStatus = "Completed" | "Confirmed" | "Pending";

export interface VisitSummary {
  id: string;
  date: string;
  reason: string;
  doctorName: string;
  department?: string;
  time: string;
  status: VisitStatus;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface PrescriptionSummary {
  date: string;
  doctorName: string;
  medicines: PrescriptionMedicine[];
}

/** Overall clinical read on a lab report, used for the status badge on Lab Reports list/detail. */
export type LabReportStatus = "Normal" | "Attention" | "Critical";

export type LabReportCategory = "Blood" | "Imaging" | "Urine" | "Other";

/**
 * A single lab report in the patient's full history (Phase 1B — Lab Reports
 * page). `recentLabReport` above stays as the condensed Overview preview;
 * this is the full record `recentLabReport` is drawn from (see
 * MOCK_PATIENT_RECORD.labReports[0]).
 */
export interface LabReportRecord {
  id: string;
  title: string;
  date: string;
  labName: string;
  orderedBy: string;
  category: LabReportCategory;
  status: LabReportStatus;
  rows: LabResultRow[];
  notes?: string;
}

/**
 * A single prescription in the patient's full history (Phase 1B —
 * Prescriptions page). `latestPrescription` above stays as the condensed
 * Overview preview; this is the full record it's drawn from (see
 * MOCK_PATIENT_RECORD.prescriptions[0]).
 */
export interface PrescriptionRecord {
  id: string;
  date: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  notes?: string;
  /** Links back to the visit this prescription was issued during, if any. */
  visitId?: string;
}

export type DocumentCategory = "Prescription" | "Lab Report" | "Discharge Summary" | "X-Ray" | "Others";

/** A single uploaded/stored document shown on the Documents page. */
export interface DocumentRecord {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedDate: string;
  uploadedBy: string;
  fileType: "PDF" | "Image";
  fileSize: string;
  /** Links back to the visit this document belongs to, if any. */
  visitId?: string;
}

export type TimelineEventKind =
  | "registration"
  | "ai"
  | "triage"
  | "consultation"
  | "prescription"
  | "lab"
  | "document"
  | "visit";

/** A single dated entry on the Medical Timeline page — the patient's full chronological history. */
export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  kind: TimelineEventKind;
}

/** Vitals captured at a visit, shown on the Previous Visit Details page. */
export interface VisitVitals {
  bp: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: string;
}

/**
 * Full detail behind a single visit, used by the Previous Visit Details
 * page. Extends VisitSummary (which already powers the Overview and My
 * Visits list) so every place currently reading `PatientRecord.visits` as
 * VisitSummary[] keeps working untouched.
 */
export interface VisitDetail extends VisitSummary {
  complaint: string;
  diagnosis: string;
  vitals?: VisitVitals;
  prescriptionId?: string;
  labReportIds?: string[];
  documentIds?: string[];
  notes?: string;
}

/**
 * Phase 2A — health-data deep-dive pages (My Health, AI Health Summary,
 * Medical History, Medicines, Allergies, AYUSH Health). Every shape below
 * is read the same way as Phase 1A/1B: only through `usePatientRecord()`
 * (see src/context/PatientContext.tsx), never hardcoded per page.
 */

/** A single dated entry within a Medical History block (illness, surgery, family history row, etc). */
export interface MedicalHistoryEntry {
  label: string;
  detail: string;
  date?: string;
}

/** Full Medical History page — each key renders as its own labeled card; an empty array renders the shared EmptyState. */
export interface MedicalHistory {
  pastIllnesses: MedicalHistoryEntry[];
  chronicConditions: MedicalHistoryEntry[];
  surgeries: MedicalHistoryEntry[];
  hospitalizations: MedicalHistoryEntry[];
  currentConditions: MedicalHistoryEntry[];
  familyHistory: MedicalHistoryEntry[];
  lifestyle: MedicalHistoryEntry[];
}

/** A single medicine row on the Medicines page. Links back to its source prescription when known. */
export interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  /** General purpose/indication for this medicine (e.g. "Allergy relief"). Optional — older records without it fall back to `instructions` in the UI. */
  purpose?: string;
  prescribedBy: string;
  date: string;
  prescriptionId?: string;
}

/** Current Medicines, split into Active / Previous per the Phase 2A spec. */
export interface Medicines {
  active: MedicineEntry[];
  previous: MedicineEntry[];
}

export type AllergySeverity = "Mild" | "Moderate" | "Severe";

export interface AllergyEntry {
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  date: string;
  notes?: string;
}

/** Allergies grouped into the three categories the Allergies page shows. Empty category → shared EmptyState. */
export interface Allergies {
  medicine: AllergyEntry[];
  food: AllergyEntry[];
  other: AllergyEntry[];
}

/** A single labeled value tile — used for both Dashavidha and Other AYUSH Parameters. */
export interface AyushTile {
  label: string;
  value: string;
}

/** AYUSH Health page data — Dashavidha Pariksha, Ahara-Vihara notes, and other AYUSH parameters. */
export interface AyushHealth {
  assessmentDate: string;
  /** The 10 Dashavidha Pariksha parameters, in display order. */
  dashavidha: AyushTile[];
  aharaVihara: string;
  otherParams: AyushTile[];
}

export type NotificationKind = "lab" | "prescription" | "document" | "visit" | "record" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  kind: NotificationKind;
}

/**
 * The full patient record. Sections beyond `identity` and what Overview /
 * Health ID need are typed as optional arrays/records so Phase 1B and 2 can
 * fill them in without touching this interface's already-consumed fields.
 */
export interface PatientRecord {
  identity: PatientIdentity;
  stats: {
    healthRecords: number;
    recentVisits: number;
    prescriptions: number;
    pendingActions: number;
  };
  aiHealthSummary: AiHealthSummaryRow[];
  /** Generated/updated timestamps for the AI Health Summary (Phase 2A full page). `patientModified` flips to true the first time the patient edits the summary, so the UI can show a "Patient-modified" status alongside "AI-generated". */
  aiSummaryMeta: { generatedOn: string; lastUpdated: string; patientModified: boolean };
  /**
   * Full AI Health Summary (Phase 2A) — same values as `aiHealthSummary`
   * plus "Review of Systems", inserted where the full-page spec expects
   * it. Kept as a separate array so the Overview card above (which maps
   * `aiHealthSummary` directly) never has to filter anything out.
   */
  aiHealthSummaryFull: AiHealthSummaryRow[];
  recentLabReport: LabReportSummary;
  visits: VisitDetail[];
  latestPrescription: PrescriptionSummary;
  notifications: NotificationItem[];
  /** Full lab report history (Phase 1B — Lab Reports page). [0] backs `recentLabReport` above. */
  labReports: LabReportRecord[];
  /** Full prescription history (Phase 1B — Prescriptions page). [0] backs `latestPrescription` above. */
  prescriptions: PrescriptionRecord[];
  /** Full document library (Phase 1B — Documents page). */
  documents: DocumentRecord[];
  /** Full chronological history (Phase 1B — Medical Timeline page), newest first. */
  timeline: TimelineEvent[];
  /** Phase 2A — Medical History page. */
  medicalHistory: MedicalHistory;
  /** Phase 2A — Medicines page (Active / Previous). */
  medicines: Medicines;
  /** Phase 2A — Allergies page, grouped by category. */
  allergies: Allergies;
  /** Phase 2A — AYUSH Health page. */
  ayush: AyushHealth;
}

export const MOCK_PATIENT_RECORD: PatientRecord = {
  identity: {
    name: "Sayan Nandi",
    age: 18,
    gender: "Male",
    uid: "PAT-2026-000123",
    verified: true,
    dob: "14 Mar 2008",
    mobile: "+91 98765 43210",
    email: "sayan.nandi@example.com",
    address: "14/2 Lake Gardens, Kolkata, West Bengal 700045",
    emergencyContact: "Ritu Nandi (Mother) — +91 90000 12345",
  },
  stats: {
    healthRecords: 28,
    recentVisits: 3,
    prescriptions: 5,
    pendingActions: 2,
  },
  aiHealthSummary: [
    { label: "Chief Complaint", value: "Mild fever and body ache for 3 days" },
    { label: "History of Present Illness", value: "Intermittent low-grade fever with associated fatigue" },
    { label: "Past Medical History", value: "No known chronic illness" },
    { label: "Surgery History", value: "No previous surgeries" },
    { label: "Current Medicines", value: "Paracetamol 650mg, Cetirizine 10mg, Vitamin C 500mg" },
    { label: "Allergies", value: "No known drug allergies" },
    { label: "Family History", value: "Father has history of hypertension" },
    { label: "Lifestyle", value: "Non-smoker, occasional exercise" },
    { label: "AYUSH Information", value: "No current AYUSH treatment on record" },
  ],
  aiSummaryMeta: { generatedOn: "24 Aug 2026, 10:50 AM", lastUpdated: "24 Aug 2026, 11:15 AM", patientModified: false },
  aiHealthSummaryFull: [
    { label: "Chief Complaint", value: "Mild fever and body ache for 3 days" },
    { label: "History of Present Illness", value: "Intermittent low-grade fever with associated fatigue, onset 21 Aug 2026. No chills, no rash. Improving gradually with rest and medication." },
    { label: "Past Medical History", value: "No known chronic illness" },
    { label: "Surgery History", value: "No previous surgeries" },
    { label: "Current Medicines", value: "Paracetamol 650mg, Cetirizine 10mg, Vitamin C 500mg" },
    { label: "Allergies", value: "No known drug allergies. Mild seasonal reaction to dust/pollen; mild peanut sensitivity." },
    { label: "Family History", value: "Father has history of hypertension" },
    { label: "Review of Systems", value: "No chest pain, no shortness of breath, no GI symptoms. Mild fatigue reported, otherwise unremarkable." },
    { label: "Lifestyle", value: "Non-smoker, occasional exercise, irregular meal timings, disturbed sleep pattern" },
    { label: "AYUSH Information", value: "No current AYUSH treatment on record; Dashavidha Pariksha assessment on file (see AYUSH Health)" },
  ],
  recentLabReport: {
    title: "CBC Report",
    date: "24 Aug 2026",
    rows: [
      { test: "Hemoglobin", result: "10.2 g/dL", referenceRange: "13–17 g/dL", status: "Low" },
      { test: "WBC Count", result: "6,200 /mm³", referenceRange: "4,000–11,000 /mm³", status: "Normal" },
      { test: "Platelet Count", result: "2.45 L/mm³", referenceRange: "1.50–4.50 L/mm³", status: "Normal" },
      { test: "RBC Count", result: "4.12 M/mm³", referenceRange: "4.50–5.90 M/mm³", status: "Low" },
    ],
  },
  visits: [
    {
      id: "visit-1",
      date: "27 Aug 2026",
      reason: "Follow-up Visit",
      doctorName: "Dr. Sayan Mandal",
      department: "General Physician",
      time: "10:30 AM",
      status: "Completed",
      complaint: "Persistent mild fever and body ache, follow-up after 3 days of rest.",
      diagnosis: "Viral fever — resolving. Mild anemia noted on CBC, advised iron-rich diet.",
      vitals: { bp: "118/76 mmHg", pulse: "84 bpm", temperature: "99.1 °F", spo2: "98%", weight: "65 kg" },
      prescriptionId: "rx-1",
      labReportIds: ["lab-1"],
      documentIds: ["doc-1", "doc-2"],
      notes: "Patient responding well to treatment. Advised follow-up CBC in 2 weeks to recheck hemoglobin.",
    },
    {
      id: "visit-2",
      date: "02 Sep 2026",
      reason: "Routine Checkup",
      doctorName: "Dr. Ananya Roy",
      department: "General Physician",
      time: "11:00 AM",
      status: "Confirmed",
      complaint: "Annual routine health checkup, no active complaints.",
      diagnosis: "Pending — visit not yet completed.",
      vitals: { bp: "—", pulse: "—", temperature: "—", spo2: "—", weight: "—" },
    },
    {
      id: "visit-3",
      date: "10 Sep 2026",
      reason: "Blood Test Follow-up",
      doctorName: "Dr. Sayan Mandal",
      time: "09:30 AM",
      status: "Pending",
      complaint: "Follow-up blood test to recheck hemoglobin and RBC levels.",
      diagnosis: "Pending — visit not yet completed.",
    },
    {
      id: "visit-4",
      date: "10 May 2026",
      reason: "Fever & Cold",
      doctorName: "Dr. Sayan Mandal",
      department: "General Physician",
      time: "05:15 PM",
      status: "Completed",
      complaint: "High-grade fever with chest discomfort and dry cough for 2 days.",
      diagnosis: "Acute viral bronchitis. Chest X-ray clear, no signs of pneumonia.",
      vitals: { bp: "122/80 mmHg", pulse: "92 bpm", temperature: "101.4 °F", spo2: "97%", weight: "64 kg" },
      prescriptionId: "rx-2",
      labReportIds: ["lab-2"],
      documentIds: ["doc-3"],
      notes: "Advised steam inhalation and adequate hydration. Review after 5 days if symptoms persist.",
    },
  ],
  latestPrescription: {
    date: "24 Aug 2026",
    doctorName: "Dr. Sayan Mandal",
    medicines: [
      { name: "Paracetamol 650mg", dosage: "1-1-1", duration: "3 Days" },
      { name: "Cetirizine 10mg", dosage: "0-0-1", duration: "5 Days" },
      { name: "Vitamin C 500mg", dosage: "1-0-1", duration: "10 Days" },
    ],
  },
  labReports: [
    {
      id: "lab-1",
      title: "CBC Report",
      date: "24 Aug 2026",
      labName: "MediKiosk Diagnostics Lab",
      orderedBy: "Dr. Sayan Mandal",
      category: "Blood",
      status: "Attention",
      rows: [
        { test: "Hemoglobin", result: "10.2 g/dL", referenceRange: "13–17 g/dL", status: "Low" },
        { test: "WBC Count", result: "6,200 /mm³", referenceRange: "4,000–11,000 /mm³", status: "Normal" },
        { test: "Platelet Count", result: "2.45 L/mm³", referenceRange: "1.50–4.50 L/mm³", status: "Normal" },
        { test: "RBC Count", result: "4.12 M/mm³", referenceRange: "4.50–5.90 M/mm³", status: "Low" },
      ],
      notes: "Mild anemia — advised iron-rich diet and repeat CBC in 2 weeks.",
    },
    {
      id: "lab-2",
      title: "Chest X-Ray Report",
      date: "10 May 2026",
      labName: "MediKiosk Imaging Center",
      orderedBy: "Dr. Sayan Mandal",
      category: "Imaging",
      status: "Normal",
      rows: [
        { test: "Lung Fields", result: "Clear", referenceRange: "Clear, no infiltrates", status: "Normal" },
        { test: "Heart Size", result: "Normal", referenceRange: "Normal cardiac silhouette", status: "Normal" },
        { test: "Costophrenic Angles", result: "Sharp", referenceRange: "Sharp, no effusion", status: "Normal" },
      ],
      notes: "No radiographic evidence of pneumonia.",
    },
    {
      id: "lab-3",
      title: "Routine Urine Analysis",
      date: "18 Feb 2026",
      labName: "MediKiosk Diagnostics Lab",
      orderedBy: "Dr. Ananya Roy",
      category: "Urine",
      status: "Normal",
      rows: [
        { test: "Color", result: "Pale Yellow", referenceRange: "Pale Yellow", status: "Normal" },
        { test: "Protein", result: "Nil", referenceRange: "Nil", status: "Normal" },
        { test: "Glucose", result: "Nil", referenceRange: "Nil", status: "Normal" },
        { test: "Pus Cells", result: "2–3 /hpf", referenceRange: "0–5 /hpf", status: "Normal" },
      ],
    },
    {
      id: "lab-4",
      title: "Lipid Profile",
      date: "05 Jan 2026",
      labName: "MediKiosk Diagnostics Lab",
      orderedBy: "Dr. Sayan Mandal",
      category: "Blood",
      status: "Attention",
      rows: [
        { test: "Total Cholesterol", result: "218 mg/dL", referenceRange: "<200 mg/dL", status: "High" },
        { test: "HDL Cholesterol", result: "42 mg/dL", referenceRange: "≥40 mg/dL", status: "Normal" },
        { test: "LDL Cholesterol", result: "142 mg/dL", referenceRange: "<130 mg/dL", status: "High" },
        { test: "Triglycerides", result: "156 mg/dL", referenceRange: "<150 mg/dL", status: "Borderline" },
      ],
      notes: "Mildly elevated cholesterol — advised dietary changes and follow-up in 3 months.",
    },
  ],
  prescriptions: [
    {
      id: "rx-1",
      date: "24 Aug 2026",
      doctorName: "Dr. Sayan Mandal",
      department: "General Physician",
      diagnosis: "Viral fever with mild anemia",
      visitId: "visit-1",
      medicines: [
        { name: "Paracetamol 650mg", dosage: "1-1-1", duration: "3 Days" },
        { name: "Cetirizine 10mg", dosage: "0-0-1", duration: "5 Days" },
        { name: "Vitamin C 500mg", dosage: "1-0-1", duration: "10 Days" },
      ],
      notes: "Take Paracetamol after meals. Increase fluid intake. Follow up if fever persists beyond 3 days.",
    },
    {
      id: "rx-2",
      date: "10 May 2026",
      doctorName: "Dr. Sayan Mandal",
      department: "General Physician",
      diagnosis: "Acute viral bronchitis",
      visitId: "visit-4",
      medicines: [
        { name: "Azithromycin 500mg", dosage: "1-0-0", duration: "3 Days" },
        { name: "Levocetirizine 5mg", dosage: "0-0-1", duration: "5 Days" },
        { name: "Ambroxol Syrup", dosage: "10ml — 1-1-1", duration: "5 Days" },
      ],
      notes: "Steam inhalation twice daily. Review if cough persists after 5 days.",
    },
    {
      id: "rx-3",
      date: "18 Feb 2026",
      doctorName: "Dr. Ananya Roy",
      department: "General Physician",
      diagnosis: "Routine checkup — no active illness",
      medicines: [{ name: "Multivitamin", dosage: "1-0-0", duration: "30 Days" }],
      notes: "General wellness supplement. No follow-up needed unless symptoms arise.",
    },
  ],
  documents: [
    {
      id: "doc-1",
      name: "Prescription — 24 Aug 2026",
      category: "Prescription",
      uploadedDate: "24 Aug 2026, 11:00 AM",
      uploadedBy: "Dr. Sayan Mandal",
      fileType: "PDF",
      fileSize: "182 KB",
      visitId: "visit-1",
    },
    {
      id: "doc-2",
      name: "CBC Report",
      category: "Lab Report",
      uploadedDate: "24 Aug 2026, 10:35 AM",
      uploadedBy: "Lab Technician",
      fileType: "PDF",
      fileSize: "410 KB",
      visitId: "visit-1",
    },
    {
      id: "doc-3",
      name: "Chest X-Ray",
      category: "X-Ray",
      uploadedDate: "10 May 2026, 05:40 PM",
      uploadedBy: "Radiology Dept.",
      fileType: "Image",
      fileSize: "1.8 MB",
      visitId: "visit-4",
    },
    {
      id: "doc-4",
      name: "Discharge Summary — Feb 2026",
      category: "Discharge Summary",
      uploadedDate: "18 Feb 2026, 12:15 PM",
      uploadedBy: "Dr. Ananya Roy",
      fileType: "PDF",
      fileSize: "265 KB",
    },
    {
      id: "doc-5",
      name: "Lipid Profile Report",
      category: "Lab Report",
      uploadedDate: "05 Jan 2026, 09:20 AM",
      uploadedBy: "Lab Technician",
      fileType: "PDF",
      fileSize: "198 KB",
    },
    {
      id: "doc-6",
      name: "Vaccination Certificate",
      category: "Others",
      uploadedDate: "12 Dec 2025, 03:05 PM",
      uploadedBy: "Sayan Nandi",
      fileType: "PDF",
      fileSize: "144 KB",
    },
  ],
  timeline: [
    {
      id: "tl-1",
      date: "27 Aug 2026",
      time: "10:30 AM",
      title: "Follow-up Visit Scheduled",
      description: "Follow-up visit with Dr. Sayan Mandal confirmed for 27 Aug 2026.",
      kind: "visit",
    },
    {
      id: "tl-2",
      date: "24 Aug 2026",
      time: "11:15 AM",
      title: "Prescription Created",
      description: "Dr. Sayan Mandal prescribed Paracetamol, Cetirizine, and Vitamin C.",
      kind: "prescription",
    },
    {
      id: "tl-3",
      date: "24 Aug 2026",
      time: "11:00 AM",
      title: "Consultation Started",
      description: "Consultation started with Dr. Sayan Mandal for viral fever follow-up.",
      kind: "consultation",
    },
    {
      id: "tl-4",
      date: "24 Aug 2026",
      time: "10:50 AM",
      title: "AI Summary Generated",
      description: "AI clinical summary generated from your health interview and uploaded documents.",
      kind: "ai",
    },
    {
      id: "tl-5",
      date: "24 Aug 2026",
      time: "10:35 AM",
      title: "CBC Report Uploaded",
      description: "Lab technician uploaded your Complete Blood Count report.",
      kind: "lab",
    },
    {
      id: "tl-6",
      date: "24 Aug 2026",
      time: "10:45 AM",
      title: "Registered for Visit",
      description: "Checked in for a follow-up consultation at MediKiosk.",
      kind: "registration",
    },
    {
      id: "tl-7",
      date: "10 May 2026",
      time: "05:40 PM",
      title: "Chest X-Ray Uploaded",
      description: "Radiology department uploaded your chest X-ray report.",
      kind: "document",
    },
    {
      id: "tl-8",
      date: "10 May 2026",
      time: "05:15 PM",
      title: "Consultation — Fever & Cold",
      description: "Consulted Dr. Sayan Mandal for fever, cough, and chest discomfort.",
      kind: "consultation",
    },
    {
      id: "tl-9",
      date: "18 Feb 2026",
      time: "12:00 PM",
      title: "Routine Checkup Completed",
      description: "Annual routine checkup completed with Dr. Ananya Roy. No active concerns found.",
      kind: "visit",
    },
    {
      id: "tl-10",
      date: "05 Jan 2026",
      time: "09:20 AM",
      title: "Lipid Profile Report Uploaded",
      description: "Lab technician uploaded your lipid profile report — mildly elevated cholesterol flagged.",
      kind: "lab",
    },
    {
      id: "tl-11",
      date: "12 Dec 2025",
      time: "03:05 PM",
      title: "Vaccination Certificate Added",
      description: "Vaccination certificate uploaded to your document library.",
      kind: "document",
    },
    {
      id: "tl-12",
      date: "02 Nov 2025",
      time: "09:00 AM",
      title: "MediKiosk Account Created",
      description: "Your patient record and Health ID were created.",
      kind: "registration",
    },
  ],
  notifications: [
    {
      id: "notif-1",
      title: "New lab report available",
      description: "CBC Report has been uploaded to your records.",
      timestamp: "24 Aug 2026, 11:20 AM",
      read: false,
      kind: "lab",
    },
    {
      id: "notif-2",
      title: "Prescription uploaded",
      description: "Dr. Sayan Mandal added a new prescription.",
      timestamp: "24 Aug 2026, 10:35 AM",
      read: false,
      kind: "prescription",
    },
    {
      id: "notif-3",
      title: "New document uploaded",
      description: "X-Ray Chest was added to your documents.",
      timestamp: "24 Aug 2026, 10:15 AM",
      read: true,
      kind: "document",
    },
    {
      id: "notif-4",
      title: "Visit completed",
      description: "Your follow-up visit with Dr. Sayan Mandal is complete.",
      timestamp: "24 Aug 2026, 09:45 AM",
      read: true,
      kind: "visit",
    },
    {
      id: "notif-5",
      title: "Health record updated",
      description: "Your medical history was refreshed with the latest visit notes.",
      timestamp: "23 Aug 2026, 08:20 PM",
      read: true,
      kind: "record",
    },
    {
      id: "notif-6",
      title: "Profile details confirmed",
      description: "Your contact details were verified during your last kiosk check-in.",
      timestamp: "22 Aug 2026, 06:10 PM",
      read: true,
      kind: "record",
    },
    {
      id: "notif-7",
      title: "Scheduled maintenance completed",
      description: "MediKiosk system maintenance finished with no impact to your records.",
      timestamp: "21 Aug 2026, 02:00 AM",
      read: true,
      kind: "system",
    },
    {
      id: "notif-8",
      title: "New login to your account",
      description: "Your account was accessed from a new device at a MediKiosk terminal.",
      timestamp: "20 Aug 2026, 09:12 AM",
      read: false,
      kind: "system",
    },
  ],
  medicalHistory: {
    pastIllnesses: [
      { label: "Viral Fever", detail: "Mild fever and body ache, treated with rest and medication. Resolving.", date: "24 Aug 2026" },
      { label: "Acute Viral Bronchitis", detail: "Fever, cough, and chest discomfort. Treated with antibiotics and cough suppressant.", date: "10 May 2026" },
    ],
    chronicConditions: [],
    surgeries: [],
    hospitalizations: [],
    currentConditions: [],
    familyHistory: [
      { label: "Father", detail: "History of hypertension, on regular medication." },
    ],
    lifestyle: [
      { label: "Smoking", detail: "Non-smoker" },
      { label: "Exercise", detail: "Occasional, light activity" },
      { label: "Diet", detail: "Irregular meal timings, frequent spicy food intake" },
      { label: "Sleep", detail: "Disturbed pattern, average 5–6 hours a night" },
    ],
  },
  medicines: {
    active: [
            {
        id: "med-1",
        name: "Cetirizine 10mg",
        dosage: "1 tablet",
        frequency: "0-0-1",
        duration: "5 Days",
        instructions: "Take after dinner. May cause mild drowsiness.",
        purpose: "Allergy relief",
        prescribedBy: "Dr. Sayan Mandal",
        date: "24 Aug 2026",
        prescriptionId: "rx-1",
      },
      {
        id: "med-2",
        name: "Vitamin C 500mg",
        dosage: "1 tablet",
        frequency: "1-0-1",
        duration: "10 Days",
        instructions: "Take with meals.",
        purpose: "Immune support",
        prescribedBy: "Dr. Sayan Mandal",
        date: "24 Aug 2026",
        prescriptionId: "rx-1",
      },
    ],
    previous: [
      {
        id: "med-3",
        name: "Paracetamol 650mg",
        dosage: "1 tablet",
        frequency: "1-1-1",
        duration: "3 Days",
        instructions: "Take after meals. Course completed.",
        prescribedBy: "Dr. Sayan Mandal",
        date: "24 Aug 2026",
        prescriptionId: "rx-1",
      },
      {
        id: "med-4",
        name: "Azithromycin 500mg",
        dosage: "1 tablet",
        frequency: "1-0-0",
        duration: "3 Days",
        instructions: "Take on an empty stomach. Course completed.",
        prescribedBy: "Dr. Sayan Mandal",
        date: "10 May 2026",
        prescriptionId: "rx-2",
      },
      {
        id: "med-5",
        name: "Levocetirizine 5mg",
        dosage: "1 tablet",
        frequency: "0-0-1",
        duration: "5 Days",
        instructions: "Take at bedtime. Course completed.",
        prescribedBy: "Dr. Sayan Mandal",
        date: "10 May 2026",
        prescriptionId: "rx-2",
      },
      {
        id: "med-6",
        name: "Ambroxol Syrup",
        dosage: "10 ml",
        frequency: "1-1-1",
        duration: "5 Days",
        instructions: "Take after meals with warm water.",
        prescribedBy: "Dr. Sayan Mandal",
        date: "10 May 2026",
        prescriptionId: "rx-2",
      },
      {
        id: "med-7",
        name: "Multivitamin",
        dosage: "1 tablet",
        frequency: "1-0-0",
        duration: "30 Days",
        instructions: "General wellness supplement.",
        prescribedBy: "Dr. Ananya Roy",
        date: "18 Feb 2026",
        prescriptionId: "rx-3",
      },
    ],
  },
  allergies: {
    medicine: [],
    food: [
      {
        allergen: "Peanuts",
        reaction: "Mild tingling in mouth, occasional hives",
        severity: "Mild",
        date: "Reported 14 Mar 2025",
        notes: "Avoids peanuts and peanut-based snacks. No epinephrine required historically.",
      },
    ],
    other: [
      {
        allergen: "Dust & Pollen",
        reaction: "Sneezing, watery eyes, seasonal nasal congestion",
        severity: "Moderate",
        date: "Reported 02 Nov 2025",
        notes: "Worse during winter months. Managed with antihistamines as needed.",
      },
    ],
  },
  ayush: {
    assessmentDate: "24 Aug 2026, 10:40 AM",
    dashavidha: [
      { label: "Prakriti", value: "Vata-Pitta" },
      { label: "Vikriti", value: "Pitta" },
      { label: "Sara", value: "Madhyama" },
      { label: "Samhanana", value: "Madhyama" },
      { label: "Pramana", value: "Madhyama" },
      { label: "Satmya", value: "Madhyama" },
      { label: "Satva", value: "Madhyama" },
      { label: "Ahara Shakti", value: "Madhyama" },
      { label: "Vyayama Shakti", value: "Avara" },
      { label: "Vaya", value: "Yuva" },
    ],
    aharaVihara: "Irregular meal timings with frequent spicy food intake. Minimal structured exercise. Disturbed sleep pattern, averaging 5–6 hours a night.",
    otherParams: [
 { label: "Agni", value: "Vishama" },
  { label: "Koshta", value: "Madhyama" },
  { label: "Mana", value: "Madhyama" },
  { label: "Bala", value: "Avara" },
    ],
  },
};