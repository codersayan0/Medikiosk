/** Visual theme identifiers — matches [data-theme] values in index.css */
export type ThemeName = "light" | "dark" | "warm";

/** Supported interface languages */
export type LanguageCode = "en" | "bn" | "hi";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export type BadgeTone =
  | "neutral"
  | "green"
  | "purple"
  | "blue"
  | "danger"
  | "warning";

export type StatusTone = "stable" | "attention" | "critical" | "pending" | "verified";

export interface NavItem {
  labelKey: string;
  path: string;
  icon: string;
}

export interface ToastMessage {
  id: string;
  tone: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}

/** Mocked patient identity used to preview Health ID / QR components in Part A */
export interface MockHealthId {
  id: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
}

/**
 * The four document categories used throughout the registration flow's
 * Document Upload, Review Summary, and Account Created steps. Mirrors the
 * future backend enum (LAB_TEST | MEDICAL_REPORT | PRESCRIPTION |
 * IMAGING_SCAN) — see src/utils/documentCategories.ts for display data.
 */
export type DocumentCategoryId = "lab" | "medical" | "prescriptions" | "imaging";

/**
 * Frontend-only upload lifecycle. Maps to a future backend
 * UPLOADING | READY | PROCESSING | ERROR status once real upload/AI
 * processing exists.
 */
export type DocumentStatus = "uploading" | "uploaded";

/**
 * A single document uploaded during registration. Deliberately close to
 * the future backend document model (id, patientId, fileName, fileType,
 * fileSize, fileUrl, category, status, uploadedAt) so swapping local
 * state for API-backed data later doesn't require reshaping the UI.
 * `file`/`previewUrl` are frontend-only concerns (kept for the View
 * action) that a real backend response would replace with a `fileUrl`.
 */
export interface UploadedDocumentRecord {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategoryId;
  status: DocumentStatus;
  previewUrl: string | null;
  uploadedAt: string;

  /**
   * Text extracted by the backend document processor.
   * This is temporary frontend state and is not the original file.
   */
  extractedText?: string;

  /**
   * Backend-generated temporary processing ID.
   */
  processingId?: string;
}

/**
 * The patient-facing summary shown on Review Summary and Account Created.
 * Derived from the registration form state — never hard-coded — so it
 * stays accurate whatever the patient entered in Step 1.
 */
export interface PatientSummary {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  contact: string;
  location: string;
  registeredOn: string;
  /** Optional uploaded patient photo URL. Falls back to a gender-based illustrated avatar when absent. */
  profileImageUrl?: string;
}

/** Frontend-generated placeholder Health ID — a real backend will issue the permanent one later. */
export interface HealthIdRecord {
  id: string;
}

/** Overall verdict of the AI Document Analysis & Red-Flag Detection step. */
export type AnalysisStatus = "clear" | "attention" | "critical";

/** Clinical urgency of a single AI-detected finding. */
export type AnalysisFindingPriority = "low" | "medium" | "high" | "critical";

/**
 * A single AI-detected finding from the patient's uploaded documents.
 * Deliberately close to a future backend Finding model so a real
 * OCR/AI-analysis API response can replace the mock generator later
 * without reshaping the UI.
 */
export interface AnalysisFinding {
  id: string;
  title: string;
  description: string;
  priority: AnalysisFindingPriority;
  /** Optional link back to the UploadedDocumentRecord this finding came from. */
  sourceDocumentId?: string;
}

/**
 * Result of the AI Document Analysis & Red-Flag Detection step. `status`
 * drives which visual treatment (clear/attention/critical) is shown;
 * `potentialConcerns` is intentionally NOT stored here — it's always
 * derived from `findings` (see utils/mockAnalysis.ts) so the count can
 * never drift out of sync with the list it summarizes.
 */
export interface AnalysisResult {
  status: AnalysisStatus;
  documentsAnalyzed: number;
  dataPointsExtracted: number;
  confidenceScore: number;
  findings: AnalysisFinding[];
}

// ---------------------------------------------------------------------------
// ADMIN — Doctor Applications & Verification
// Frontend-only shape for the Admin Dashboard's "Doctor Applications" flow.
// Kept close to a plausible future backend model (application, nested
// personal/professional/organization blocks, a documents array, and a
// verification record) so swapping the mock data source for a real API
// later doesn't require reshaping any of the admin UI. See
// src/data/mockDoctorApplications.ts for the mock generator and
// src/context/AdminContext.tsx for the state that mutates these.
// ---------------------------------------------------------------------------

/** Lifecycle stage of a doctor's application, shown as the primary status badge everywhere. */
export type DoctorApplicationStatus = "pending" | "under_review" | "verification_required" | "verified" | "rejected";
/** The document categories the doctor application flow asks for. */
export type ApplicationDocumentType =
  | "medical_registration_certificate"
  | "medical_degree_certificate"
  | "identity_proof"
  | "experience_certificate"
  | "profile_photo"
  | "other";

/** Per-document verification state, set individually by the admin. */
export type DocumentVerificationStatus = "pending" | "verified" | "rejected" | "reupload_requested";

/** A single uploaded document card shown in the Application Detail page. */
export interface ApplicationDocument {
  id: string;
  type: ApplicationDocumentType;
  name: string;
  /** Display file kind, e.g. "PDF", "JPG". Frontend-only until real uploads exist. */
  fileType: string;
  fileSizeLabel: string;
  uploadedAt: string;
  verificationStatus: DocumentVerificationStatus;
  /** Placeholder preview target for the in-app document viewer (see DocumentVerificationCard). */
  previewUrl: string;
  /** Admin-entered note, e.g. reason for rejection or a correction request. */
  note?: string;
}

/** A single verification note/comment left by an admin while reviewing an application. */
export interface VerificationNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

/**
 * The verification checklist state for one application. The six booleans
 * are set directly by the admin; `allDocumentsVerified` is intentionally
 * NOT stored — it's always derived from the application's `documents`
 * array (see utils/doctorApplications.ts) so it can never drift out of
 * sync with the documents it summarizes.
 */
export interface VerificationChecklistState {
  personalInfoVerified: boolean;
  identityVerified: boolean;
  degreeVerified: boolean;
  registrationVerified: boolean;
  experienceVerified: boolean;
  organizationVerified: boolean;
  notes: VerificationNote[];
}

export interface DoctorApplicationPersonal {
  fullName: string;
  photoUrl?: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
}

export interface DoctorApplicationProfessional {
  medicalDegree: string;
  institution: string;
  specialization: string;
  experienceYears: number;
  registrationNumber: string;
  registrationAuthority: string;
  registrationValidity: string;
  currentPosition: string;
}

export interface DoctorApplicationOrganization {
  organizationName: string;
  department: string;
  designation: string;
  joiningInfo: string;
}

/** Every state-changing verification action, recorded automatically as an append-only trail. */
export type VerificationAuditEventType =
  | "application_submitted"
  | "document_verified"
  | "document_rejected"
  | "document_reupload_requested"
  | "checklist_item_verified"
  | "correction_requested"
  | "application_rejected"
  | "application_approved"
  | "doctor_suspended"
  | "doctor_activated";

/** One entry in an application's Verification Audit History (see VerificationAuditHistory.tsx). */
export interface VerificationAuditEvent {
  id: string;
  type: VerificationAuditEventType;
  label: string;
  detail?: string;
  actor: string;
  timestamp: string;
}

/** Operational status of an already-verified doctor's account, independent of application status. */
export type DoctorStatus = "active" | "suspended";

/** One doctor's full onboarding application as reviewed by the admin. */
export interface DoctorApplication {
  id: string;
  applicationDate: string;
  status: DoctorApplicationStatus;
  personal: DoctorApplicationPersonal;
  professional: DoctorApplicationProfessional;
  organization: DoctorApplicationOrganization;
  documents: ApplicationDocument[];
  verification: VerificationChecklistState;
  verifiedBy?: string;
  verifiedAt?: string;
  doctorId?: string;
  /** Append-only verification trail — every status/document/checklist change. */
  auditHistory: VerificationAuditEvent[];
  /** Only meaningful once status === "verified". Defaults to "active" when absent. */
  doctorStatus?: DoctorStatus;
}

// ---------------------------------------------------------------------------
// ADMIN — Patients directory
// Frontend-only shape for the Admin Dashboard's "Patients" section. Kept
// close to a plausible future backend model so swapping the mock data
// source (src/data/mockPatients.ts) for a real
// `GET /admin/patients` API later doesn't require reshaping the UI.
// `patientUID` is the single, canonical patient identifier used everywhere
// in this feature — no duplicate/secondary ID is introduced.
// ---------------------------------------------------------------------------

/** Overall standing of a patient record in the organization. */
export type PatientDirectoryStatus = "active" | "inactive" | "critical";

/** One line of the "Medical Summary" preview shown in the patient drawer. */
export interface PatientMedicalSummaryItem {
  label: string;
  value: string;
}

/** A compact appointment reference shown inside a patient's detail drawer. */
export interface PatientAppointmentPreview {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

/** A compact medical record reference shown inside a patient's detail drawer. */
export interface PatientRecordPreview {
  id: string;
  title: string;
  category: string;
  date: string;
}

/** One patient in the admin Patients directory. */
export interface Patient {
  id: string;
  /** Canonical, human-facing patient identifier (e.g. "PT-48213"). */
  patientUID: string;
  fullName: string;
  photoUrl?: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  registeredOn: string;
  lastVisit: string;
  status: PatientDirectoryStatus;
  primaryCondition?: string;
  allergies: string[];
  medicalSummary: PatientMedicalSummaryItem[];
  recentAppointments: PatientAppointmentPreview[];
  recentRecords: PatientRecordPreview[];
}

// ---------------------------------------------------------------------------
// ADMIN — Appointments management
// Frontend-only shape for the Admin Dashboard's "Appointments" section.
// References a patient only via `patientUID` (the same canonical identifier
// used in the Patients directory) rather than duplicating a second ID.
// ---------------------------------------------------------------------------

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type ConsultationType = "in_person" | "video" | "phone";

export interface Appointment {
  id: string;
  patientUID: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  /** ISO date (YYYY-MM-DD) — used for the date filter and sorting. */
  date: string;
  /** Display label for `date`, e.g. "02 Sep 2026". */
  dateLabel: string;
  time: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdOn: string;
}

// ---------------------------------------------------------------------------
// ADMIN — Medical Records
// Frontend-only shape for the Admin Dashboard's "Medical Records" section.
// References a patient only via `patientUID` (the same canonical identifier
// used in the Patients and Appointments sections) — no second/secondary
// patient ID is introduced. Kept close to a plausible future backend model
// (record + a nested documents array) so swapping the mock data source
// (src/data/mockMedicalRecords.ts) for a real `GET /admin/medical-records`
// API later doesn't require reshaping the UI.
// ---------------------------------------------------------------------------

/** The kind of clinical record, shown as the "Record Type" column/filter. */
export type MedicalRecordType =
  | "lab_report"
  | "prescription"
  | "imaging_scan"
  | "medical_report"
  | "discharge_summary"
  | "vaccination_record";

/** Verification state of a record (and, individually, of each attached document). */
export type MedicalRecordStatus = "verified" | "pending_review" | "flagged";

/**
 * A single file attached to a medical record. Deliberately close to
 * ApplicationDocument's shape (fileType/fileSizeLabel/uploadedAt/status)
 * so the same document-preview UI pattern used for doctor verification
 * documents applies here too.
 */
export interface MedicalRecordDocument {
  id: string;
  fileName: string;
  /** Display file kind, e.g. "PDF", "JPG". */
  fileType: string;
  fileSizeLabel: string;
  uploadedAt: string;
  verificationStatus: MedicalRecordStatus;
}

/** One medical record in the admin Medical Records directory. */
export interface MedicalRecord {
  id: string;
  patientName: string;
  /** Canonical, human-facing patient identifier — the single identifier used everywhere (see Patient["patientUID"]). */
  patientUID: string;
  patientPhotoUrl?: string;
  recordType: MedicalRecordType;
  doctorName: string;
  department: string;
  /** ISO date (YYYY-MM-DD) — used for the date filter and sorting. */
  date: string;
  /** Display label for `date`, e.g. "24 Aug 2026". */
  dateLabel: string;
  notes: string;
  status: MedicalRecordStatus;
  /** At least one document is always present — the table's "Document" column shows the first. */
  documents: MedicalRecordDocument[];
}