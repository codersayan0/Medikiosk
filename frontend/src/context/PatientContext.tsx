import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import type { AiHealthSummaryRow, PatientIdentity, PatientRecord } from "../data/patientRecord";
import { MOCK_PATIENT_RECORD } from "../data/patientRecord";
import { buildClinicalSummary } from "../utils/clinicalSummary";
import { apiRequest } from "../services/api";
import { useAuth } from "./AuthContext";
import { getPatientProfile } from "../services/patientApi";

const DATA_MODE =
  (import.meta.env.VITE_DATA_MODE || "live").toLowerCase() === "demo"
    ? "demo"
    : "live";

const EMPTY_PATIENT_RECORD: PatientRecord = {
  identity: {
    name: "", age: 0, gender: "", uid: "", verified: false,
    dob: "", mobile: "", email: "", address: "", emergencyContact: "",
  },
  stats: { healthRecords: 0, recentVisits: 0, prescriptions: 0, pendingActions: 0 },
  aiHealthSummary: [],
  aiSummaryMeta: { generatedOn: "", lastUpdated: "", patientModified: false },
  aiHealthSummaryFull: [],
  recentLabReport: { title: "", date: "", rows: [] },
  visits: [],
  latestPrescription: { date: "", doctorName: "", medicines: [] },
  notifications: [],
  labReports: [],
  prescriptions: [],
  documents: [],
  timeline: [],
  medicalHistory: {
    pastIllnesses: [], chronicConditions: [], surgeries: [], hospitalizations: [],
    currentConditions: [], familyHistory: [], lifestyle: [],
  },
  medicines: { active: [], previous: [] },
  allergies: { medicine: [], food: [], other: [] },
  ayush: { assessmentDate: "", dashavidha: [], aharaVihara: "", otherParams: [] },
};

interface PatientContextValue {
  patient: PatientRecord;
  mode: "demo" | "live";
  loading: boolean;
  error: string | null;
  updateIdentity: (patch: Partial<PatientIdentity>) => Promise<void>;
  updateAiHealthSummary: (rows: AiHealthSummaryRow[]) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshPatient: () => Promise<void>;
}

const PatientContext = createContext<PatientContextValue | null>(null);

function buildProfilePatch(patch: Partial<PatientIdentity>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.dob !== undefined) payload.dob = patch.dob;
  if (patch.gender !== undefined) payload.gender = patch.gender;
  if (patch.mobile !== undefined) payload.mobile = patch.mobile;
  if (patch.address !== undefined) payload.address = patch.address;
  if (patch.emergencyContact !== undefined) payload.emergency_contact = patch.emergencyContact;
  return payload;
}

function buildAiSummaryPatch(rows: AiHealthSummaryRow[]): Record<string, unknown> {
  const getValue = (label: string) =>
    rows.find((row) => row.label.toLowerCase() === label.toLowerCase())?.value ?? "";

  const splitList = (label: string): string[] =>
    getValue(label)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    ai_health_summary: rows,
    ai_summary: getValue("Overall Summary"),
    ai_key_findings: splitList("Key Findings"),
    ai_abnormal_values: splitList("Abnormal Values"),
    ai_possible_concerns: splitList("Possible Concerns"),
    ai_recommendations: splitList("Recommendations"),
  };
}

export function PatientProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isRegistrationRoute = location.pathname.startsWith("/patient/register");
  const { token, user } = useAuth();

  const [patient, setPatient] = useState<PatientRecord>(
    DATA_MODE === "demo" ? MOCK_PATIENT_RECORD : EMPTY_PATIENT_RECORD
  );
  const [loading, setLoading] = useState(
    DATA_MODE === "live" && Boolean(token && user?.role === "patient" && !isRegistrationRoute)
  );
  const [error, setError] = useState<string | null>(null);

  const refreshPatient = useCallback(async () => {
    if (DATA_MODE === "demo") {
      setPatient(MOCK_PATIENT_RECORD);
      setError(null);
      setLoading(false);
      return;
    }

    if (isRegistrationRoute) {
      setPatient(EMPTY_PATIENT_RECORD);
      setError(null);
      setLoading(false);
      return;
    }

    if (!token || !user) {
      setPatient(EMPTY_PATIENT_RECORD);
      setError(null);
      setLoading(false);
      return;
    }

    if (user.role !== "patient") {
      setPatient(EMPTY_PATIENT_RECORD);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const record = await getPatientProfile();
      setPatient(record);
    } catch (err) {
      setPatient(EMPTY_PATIENT_RECORD);
      setError(err instanceof Error ? err.message : "Unable to load patient data.");
    } finally {
      setLoading(false);
    }
  }, [token, user, isRegistrationRoute]);

  useEffect(() => {
    void refreshPatient();
  }, [refreshPatient]);

  const updateIdentity = useCallback(
    async (patch: Partial<PatientIdentity>) => {
      if (DATA_MODE === "demo") {
        setPatient((prev) => ({
          ...prev,
          identity: { ...prev.identity, ...patch },
        }));
        return;
      }

      if (!token || !user || user.role !== "patient") {
        setError("You must be logged in as a patient to update your profile.");
        return;
      }

      setPatient((prev) => ({
        ...prev,
        identity: { ...prev.identity, ...patch },
      }));

      try {
        const record = await apiRequest<PatientRecord>("/api/patient/profile", {
          method: "PATCH",
          body: JSON.stringify(buildProfilePatch(patch)),
        });
        setPatient(record);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save patient data.");
        await refreshPatient();
      }
    },
    [token, user, refreshPatient]
  );

  const updateAiHealthSummary = useCallback(
    async (rows: AiHealthSummaryRow[]) => {
      if (DATA_MODE === "demo") {
        setPatient((prev) => ({
          ...prev,
          aiHealthSummary: rows,
          aiHealthSummaryFull: rows,
          aiSummaryMeta: {
            ...prev.aiSummaryMeta,
            lastUpdated: new Date().toISOString(),
            patientModified: true,
          },
        }));
        return;
      }

      if (!token || !user || user.role !== "patient") {
        setError("You must be logged in as a patient to update your health summary.");
        return;
      }

      const updatedAt = new Date().toISOString();

      // Optimistic UI update.
      setPatient((prev) => ({
        ...prev,
        aiHealthSummary: rows,
        aiHealthSummaryFull: rows,
        aiSummaryMeta: {
          ...prev.aiSummaryMeta,
          lastUpdated: updatedAt,
          patientModified: true,
        },
      }));

      try {
        const record = await apiRequest<PatientRecord>("/api/patient/profile", {
          method: "PATCH",
          body: JSON.stringify({
            ...buildAiSummaryPatch(rows),
            ai_summary_updated_at: updatedAt,
          }),
        });

        setPatient(record);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to save AI health summary.";
        setError(message);
        await refreshPatient();
      }
    },
    [token, user, refreshPatient]
  );

  const markNotificationRead = useCallback((id: string) => {
    setPatient((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setPatient((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const value = useMemo<PatientContextValue>(() => ({
    patient,
    mode: DATA_MODE,
    loading,
    error,
    updateIdentity,
    updateAiHealthSummary,
    markNotificationRead,
    markAllNotificationsRead,
    refreshPatient,
  }), [
    patient,
    loading,
    error,
    updateIdentity,
    updateAiHealthSummary,
    markNotificationRead,
    markAllNotificationsRead,
    refreshPatient,
  ]);

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatientRecord(): PatientRecord {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatientRecord must be used within a PatientProvider");
  return ctx.patient;
}

export function usePatientProfile() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatientProfile must be used within a PatientProvider");
  return {
    identity: ctx.patient.identity,
    updateIdentity: ctx.updateIdentity,
    mode: ctx.mode,
    loading: ctx.loading,
    error: ctx.error,
  };
}

export function useNotifications() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("useNotifications must be used within a PatientProvider");
  return {
    notifications: ctx.patient.notifications,
    markNotificationRead: ctx.markNotificationRead,
    markAllNotificationsRead: ctx.markAllNotificationsRead,
  };
}

export function useMedicalHistory() { return usePatientRecord().medicalHistory; }
export function useMedicines() { return usePatientRecord().medicines; }
export function useAllergies() { return usePatientRecord().allergies; }
export function useAyushHealth() { return usePatientRecord().ayush; }

export function useAiHealthSummary() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("useAiHealthSummary must be used within a PatientProvider");
  return {
    rows: ctx.patient.aiHealthSummaryFull,
    meta: ctx.patient.aiSummaryMeta,
    updateSummary: ctx.updateAiHealthSummary,
  };
}

export function useClinicalSummary() {
  return buildClinicalSummary(usePatientRecord());
}

export function usePatientDataState() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatientDataState must be used within a PatientProvider");
  return {
    mode: ctx.mode,
    loading: ctx.loading,
    error: ctx.error,
    refreshPatient: ctx.refreshPatient,
  };
}
