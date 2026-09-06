import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  ApplicationDocument,
  DocumentVerificationStatus,
  DoctorApplication,
  DoctorApplicationStatus,
} from "../types";
import { MOCK_DOCTOR_APPLICATIONS } from "../data/mockDoctorApplications";
import { MOCK_ORGANIZATION } from "../data/mockOrganization";
import type { AdminOrganizationFormState } from "../pages/admin/adminRegisterTypes";
import { createAuditEvent, generateDoctorId, isReadyForApproval } from "../utils/doctorApplications";

interface AdminContextValue {
  applications: DoctorApplication[];
  getApplication: (id: string) => DoctorApplication | undefined;
  organization: AdminOrganizationFormState;
  updateOrganization: (updates: Partial<AdminOrganizationFormState>) => void;
  setDocumentStatus: (applicationId: string, documentId: string, status: DocumentVerificationStatus, note?: string) => void;
  requestDocumentReupload: (applicationId: string, documentId: string, reason: string) => void;
  toggleChecklistItem: (
    applicationId: string,
    key: "personalInfoVerified" | "identityVerified" | "degreeVerified" | "registrationVerified" | "experienceVerified" | "organizationVerified",
    value: boolean
  ) => void;
  addVerificationNote: (applicationId: string, text: string, author?: string) => void;
  setApplicationStatus: (applicationId: string, status: DoctorApplicationStatus) => void;
  approveApplication: (applicationId: string, adminName?: string) => void;
  rejectApplication: (applicationId: string, reason: string, adminName?: string) => void;
  requestCorrection: (applicationId: string, reason: string, adminName?: string) => void;
  suspendDoctor: (applicationId: string, reason: string, adminName?: string) => void;
  activateDoctor: (applicationId: string, adminName?: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// ---------------------------------------------------------------------------
// TODO(real-backend): frontend-only persistence stand-in, identical pattern
// to context/PatientContext.tsx's PERSISTENCE_KEY. Mirrors the applications
// list into localStorage so verification progress survives a refresh.
// Delete this block and hydrate `applications` from a real
// GET /admin/doctor-applications call once that API exists — every page
// keeps reading/updating through the same hooks below with no other
// changes required.
// ---------------------------------------------------------------------------
const PERSISTENCE_KEY = "medikiosk:adminDoctorApplications";
// Bumped when the DoctorApplication shape changes (new required fields like
// auditHistory) so a stale localStorage snapshot from an older build never
// gets loaded into a UI that expects the new shape.
const PERSISTENCE_VERSION = 2;
const VERSIONED_KEY = `${PERSISTENCE_KEY}:v${PERSISTENCE_VERSION}`;

function loadPersistedApplications(): DoctorApplication[] | null {
  try {
    const raw = window.localStorage.getItem(VERSIONED_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as DoctorApplication[];
    return null;
  } catch {
    return null;
  }
}

function persistApplications(applications: DoctorApplication[]): void {
  try {
    window.localStorage.setItem(VERSIONED_KEY, JSON.stringify(applications));
  } catch {
    // Ignore — private browsing, quota exceeded, etc.
  }
}

const DEFAULT_ADMIN_NAME = "Ravi Kumar (Administrator)";

// ---------------------------------------------------------------------------
// TODO(real-backend): same frontend-only persistence stand-in as the
// applications list above, for the hospital/organization profile shown on
// the Organization Profile page. Swap for GET/PATCH /admin/organization
// once that API exists — AdminOrganizationProfilePage keeps reading/updating
// through organization/updateOrganization below with no other changes.
// ---------------------------------------------------------------------------
const ORG_PERSISTENCE_KEY = "medikiosk:adminOrganization:v1";

function loadPersistedOrganization(): AdminOrganizationFormState | null {
  try {
    const raw = window.localStorage.getItem(ORG_PERSISTENCE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AdminOrganizationFormState) : null;
  } catch {
    return null;
  }
}

function persistOrganization(organization: AdminOrganizationFormState): void {
  try {
    window.localStorage.setItem(ORG_PERSISTENCE_KEY, JSON.stringify(organization));
  } catch {
    // Ignore — private browsing, quota exceeded, etc.
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<DoctorApplication[]>(
    () => loadPersistedApplications() ?? MOCK_DOCTOR_APPLICATIONS
  );
  const [organization, setOrganization] = useState<AdminOrganizationFormState>(
    () => loadPersistedOrganization() ?? MOCK_ORGANIZATION
  );

  useEffect(() => {
    persistApplications(applications);
  }, [applications]);

  useEffect(() => {
    persistOrganization(organization);
  }, [organization]);

  const updateOrganization = useCallback((updates: Partial<AdminOrganizationFormState>) => {
    setOrganization((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateApplication = useCallback((id: string, updater: (app: DoctorApplication) => DoctorApplication) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? updater(app) : app)));
  }, []);

  const getApplication = useCallback((id: string) => applications.find((a) => a.id === id), [applications]);

  const setDocumentStatus = useCallback(
    (applicationId: string, documentId: string, status: DocumentVerificationStatus, note?: string) => {
      updateApplication(applicationId, (app) => {
        const doc = app.documents.find((d) => d.id === documentId);
        if (!doc) return app;

        const auditType = status === "verified" ? "document_verified" : status === "rejected" ? "document_rejected" : undefined;

        // A document moving into review naturally lifts a still-Pending
        // application into Under Review — the admin has started working it.
        const nextStatus: DoctorApplicationStatus = app.status === "pending" ? "under_review" : app.status;

        return {
          ...app,
          status: nextStatus,
          documents: app.documents.map((d): ApplicationDocument =>
            d.id === documentId ? { ...d, verificationStatus: status, note: note ?? d.note } : d
          ),
          auditHistory: auditType
            ? [...app.auditHistory, createAuditEvent(auditType, `${doc.name} ${status === "verified" ? "verified" : "rejected"}`, DEFAULT_ADMIN_NAME, note)]
            : app.auditHistory,
        };
      });
    },
    [updateApplication]
  );

  const requestDocumentReupload = useCallback(
    (applicationId: string, documentId: string, reason: string) => {
      updateApplication(applicationId, (app) => {
        const doc = app.documents.find((d) => d.id === documentId);
        if (!doc) return app;
        return {
          ...app,
          status: "verification_required",
          documents: app.documents.map((d): ApplicationDocument =>
            d.id === documentId ? { ...d, verificationStatus: "reupload_requested", note: reason } : d
          ),
          auditHistory: [
            ...app.auditHistory,
            createAuditEvent("document_reupload_requested", `Re-upload requested — ${doc.name}`, DEFAULT_ADMIN_NAME, reason),
          ],
        };
      });
    },
    [updateApplication]
  );

  const toggleChecklistItem: AdminContextValue["toggleChecklistItem"] = useCallback(
    (applicationId, key, value) => {
      updateApplication(applicationId, (app) => ({
        ...app,
        verification: { ...app.verification, [key]: value },
        auditHistory: value
          ? [...app.auditHistory, createAuditEvent("checklist_item_verified", CHECKLIST_LABELS[key], DEFAULT_ADMIN_NAME)]
          : app.auditHistory,
      }));
    },
    [updateApplication]
  );

  const addVerificationNote = useCallback(
    (applicationId: string, text: string, author = DEFAULT_ADMIN_NAME) => {
      if (!text.trim()) return;
      updateApplication(applicationId, (app) => ({
        ...app,
        verification: {
          ...app.verification,
          notes: [
            ...app.verification.notes,
            {
              id: crypto.randomUUID(),
              author,
              text: text.trim(),
              timestamp: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }),
            },
          ],
        },
      }));
    },
    [updateApplication]
  );

  const setApplicationStatus = useCallback(
    (applicationId: string, status: DoctorApplicationStatus) => {
      updateApplication(applicationId, (app) => ({ ...app, status }));
    },
    [updateApplication]
  );

  const approveApplication = useCallback(
    (applicationId: string, adminName = DEFAULT_ADMIN_NAME) => {
      updateApplication(applicationId, (app) => {
        if (!isReadyForApproval(app)) return app;
        const verifiedAt = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
        return {
          ...app,
          status: "verified",
          verifiedBy: adminName,
          verifiedAt,
          doctorId: app.doctorId ?? generateDoctorId(app),
          auditHistory: [
            ...app.auditHistory,
            createAuditEvent("application_approved", "Doctor application approved", adminName, `${app.personal.fullName} verified and added to ${app.organization.organizationName}.`),
          ],
        };
      });
    },
    [updateApplication]
  );

  const rejectApplication = useCallback(
    (applicationId: string, reason: string, adminName = DEFAULT_ADMIN_NAME) => {
      updateApplication(applicationId, (app) => ({
        ...app,
        status: "rejected",
        auditHistory: [...app.auditHistory, createAuditEvent("application_rejected", "Application rejected", adminName, reason)],
      }));
    },
    [updateApplication]
  );

  const requestCorrection = useCallback(
    (applicationId: string, reason: string, adminName = DEFAULT_ADMIN_NAME) => {
      updateApplication(applicationId, (app) => ({
        ...app,
        status: "verification_required",
        auditHistory: [...app.auditHistory, createAuditEvent("correction_requested", "Correction requested", adminName, reason)],
      }));
    },
    [updateApplication]
  );

  const suspendDoctor = useCallback(
    (applicationId: string, reason: string, adminName = DEFAULT_ADMIN_NAME) => {
      updateApplication(applicationId, (app) => {
        if (app.status !== "verified") return app;
        return {
          ...app,
          doctorStatus: "suspended",
          auditHistory: [
            ...app.auditHistory,
            createAuditEvent("doctor_suspended", "Doctor account suspended", adminName, reason),
          ],
        };
      });
    },
    [updateApplication]
  );

  const activateDoctor = useCallback(
    (applicationId: string, adminName = DEFAULT_ADMIN_NAME) => {
      updateApplication(applicationId, (app) => {
        if (app.status !== "verified") return app;
        return {
          ...app,
          doctorStatus: "active",
          auditHistory: [
            ...app.auditHistory,
            createAuditEvent("doctor_activated", "Doctor account reactivated", adminName),
          ],
        };
      });
    },
    [updateApplication]
  );

  const value = useMemo(
    () => ({
      applications,
      getApplication,
      organization,
      updateOrganization,
      setDocumentStatus,
      requestDocumentReupload,
      toggleChecklistItem,
      addVerificationNote,
      setApplicationStatus,
      approveApplication,
      rejectApplication,
      requestCorrection,
      suspendDoctor,
      activateDoctor,
    }),
    [applications, getApplication, organization, updateOrganization, setDocumentStatus, requestDocumentReupload, toggleChecklistItem, addVerificationNote, setApplicationStatus, approveApplication, rejectApplication, requestCorrection, suspendDoctor, activateDoctor]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

const CHECKLIST_LABELS: Record<string, string> = {
  personalInfoVerified: "Personal information verified",
  identityVerified: "Identity document verified",
  degreeVerified: "Medical degree verified",
  registrationVerified: "Medical registration verified",
  experienceVerified: "Experience verified",
  organizationVerified: "Organization information verified",
};

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
}