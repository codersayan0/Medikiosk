import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileStack } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../../context/PatientContext";
import { PATIENT_DASHBOARD_NAV, PATIENT_DASHBOARD_ROOT } from "../../../../data/patientDashboardNav";
import type { PatientNavGroup } from "../../../../data/patientDashboardNav";
import { ErrorState } from "../../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../../components/ui/Skeleton";
import { useSimulatedLoad } from "../../../../hooks/useSimulatedLoad";
import { fadeInUp, staggerContainer, staggerItem } from "../../../../utils/motion";

/** Short descriptive line per record category, keyed by its nav path. */
const CATEGORY_BLURB: Record<string, string> = {
  "records/ai-summary": "AI-generated overview of your health, drawn from your interviews and documents.",
  "records/history": "A running log of past conditions, treatments, and diagnoses.",
  "records/medicines": "Every medicine you've been prescribed, past and current.",
  "records/allergies": "Known drug, food, and environmental allergies on your record.",
  "records/lab-reports": "All your lab test results, from blood work to imaging.",
  "records/prescriptions": "Every prescription issued by your doctors, in one place.",
  "records/documents": "Uploaded reports, scans, and discharge summaries.",
};


export default function MedicalRecordsHubPage() {
  const patient = usePatientRecord();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const goTo = (path: string) => navigate(`${PATIENT_DASHBOARD_ROOT}/${path}`);

  const recordsGroup = PATIENT_DASHBOARD_NAV.find(
    (item): item is PatientNavGroup => item.type === "group" && item.label === "Medical Records"
  );

  const COUNTS: Record<string, number> = {
    "records/lab-reports": patient.labReports.length,
    "records/prescriptions": patient.prescriptions.length,
    "records/documents": patient.documents.length,
  };

  const { loading, failed, retry } = useSimulatedLoad();
  if (loading) return <ListPageSkeleton />;
  if (failed) {
    return (
      <ErrorState
        title="Unable to load this page."
        description="We couldn't fetch this data. Please try again."
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Medical Records</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Everything about your health history, organized in one place.</p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : staggerContainer()}
      >
        {recordsGroup?.children.map((item) => {
          const count = COUNTS[item.path];
          return (
            <motion.div key={item.path} variants={prefersReducedMotion ? undefined : staggerItem}>
              <Card
                interactive
                className="flex h-full flex-col gap-3"
                onClick={() => goTo(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goTo(item.path);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <MedicalIcon icon={item.icon} tone={item.isBuilt ? "green" : "neutral"} />
                  {item.isBuilt ? (
                    <Badge tone="green">{count !== undefined ? `${count} on file` : "Available"}</Badge>
                  ) : (
                    <Badge tone="purple">Coming soon</Badge>
                  )}
                </div>
                <div>
                  <p className="font-display text-base font-bold text-mx-ink">{item.label}</p>
                  <p className="mt-1 text-sm text-mx-ink-muted">{CATEGORY_BLURB[item.path]}</p>
                </div>
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-mx-green-strong">
                  {item.isBuilt ? "View" : "Learn more"}
                  <ArrowRight size={13} aria-hidden="true" />
                </span>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <MedicalIcon icon={FileStack} tone="blue" size={22} className="h-12 w-12" />
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-mx-ink">Want the full chronological picture?</p>
            <p className="text-sm text-mx-ink-muted">
              The Medical Timeline stitches every visit, report, and prescription into one timeline.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goTo("timeline")}
            className="shrink-0 whitespace-nowrap text-sm font-semibold text-mx-green-strong underline underline-offset-2"
          >
            View Medical Timeline
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
