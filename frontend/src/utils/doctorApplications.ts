import type { BadgeTone, DoctorApplication, DoctorApplicationStatus, VerificationAuditEvent, VerificationAuditEventType } from "../types";

/**
 * Derived helpers for the Doctor Applications / Verification feature.
 * `allDocumentsVerified` and overall checklist completeness are always
 * computed from live state (never stored) so they can't drift out of sync
 * with the documents/checklist they summarize — same pattern used by
 * utils/mockAnalysis.ts for potentialConcerns.
 */

export const APPLICATION_STATUS_LABEL: Record<DoctorApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  verification_required: "Verification Required",
  verified: "Verified",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_TONE: Record<DoctorApplicationStatus, BadgeTone> = {
  pending: "warning",
  under_review: "blue",
  verification_required: "purple",
  verified: "green",
  rejected: "danger",
};

/** True once every uploaded document has been individually marked Verified. */
export function areAllDocumentsVerified(application: DoctorApplication): boolean {
  if (application.documents.length === 0) return false;
  return application.documents.every((doc) => doc.verificationStatus === "verified");
}

/** True if any uploaded document was rejected or has an outstanding re-upload request. */
export function hasProblemDocuments(application: DoctorApplication): boolean {
  return application.documents.some((doc) => doc.verificationStatus === "rejected" || doc.verificationStatus === "reupload_requested");
}

/** The 7 checklist conditions, in display order, each resolved to a boolean. */
export function getChecklistItems(application: DoctorApplication) {
  const v = application.verification;
  return [
    { key: "personalInfoVerified", label: "Personal information verified", done: v.personalInfoVerified },
    { key: "identityVerified", label: "Identity document verified", done: v.identityVerified },
    { key: "degreeVerified", label: "Medical degree verified", done: v.degreeVerified },
    { key: "registrationVerified", label: "Medical registration verified", done: v.registrationVerified },
    { key: "experienceVerified", label: "Experience verified", done: v.experienceVerified },
    { key: "organizationVerified", label: "Organization information verified", done: v.organizationVerified },
    { key: "allRequiredDocuments", label: "All required documents verified", done: areAllDocumentsVerified(application) },
  ] as const;
}

/** Whole-application readiness gate — drives whether "Approve & Verify Doctor" is enabled. */
export function isReadyForApproval(application: DoctorApplication): boolean {
  return getChecklistItems(application).every((item) => item.done);
}

/** Human-readable reason the "Approve & Verify Doctor" button is disabled, or null once ready. */
export function approvalBlockedReason(application: DoctorApplication): string | null {
  const items = getChecklistItems(application);
  const remaining = items.filter((i) => !i.done);
  if (remaining.length === 0) return null;
  const docCount = countDocumentsVerified(application);
  const docsRemaining = docCount.total - docCount.verified;
  if (docsRemaining > 0 && remaining.some((r) => r.key === "allRequiredDocuments")) {
    return `Verification incomplete — ${docsRemaining} required document${docsRemaining === 1 ? "" : "s"} still need${docsRemaining === 1 ? "s" : ""} verification.`;
  }
  return `Verification incomplete — ${remaining.length} required item${remaining.length === 1 ? "" : "s"} still need${remaining.length === 1 ? "s" : ""} verification.`;
}

export function countDocumentsVerified(application: DoctorApplication): { verified: number; total: number } {
  return {
    verified: application.documents.filter((d) => d.verificationStatus === "verified").length,
    total: application.documents.length,
  };
}

export function countByStatus(applications: DoctorApplication[]) {
  return {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    underReview: applications.filter((a) => a.status === "under_review").length,
    verificationRequired: applications.filter((a) => a.status === "verification_required").length,
    verified: applications.filter((a) => a.status === "verified").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };
}

/** Builds one audit-history entry. Pure/stateless — callers (AdminContext) append the result to `auditHistory`. */
export function createAuditEvent(
  type: VerificationAuditEventType,
  label: string,
  actor: string,
  detail?: string
): VerificationAuditEvent {
  return {
    id: crypto.randomUUID(),
    type,
    label,
    detail,
    actor,
    timestamp: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }),
  };
}

/** Generates a doctor ID assigned at the moment an application is approved. */
export function generateDoctorId(application: DoctorApplication): string {
  const suffix = application.id.replace(/\D/g, "").slice(-4) || "0000";
  return `DOC-${suffix}`;
}