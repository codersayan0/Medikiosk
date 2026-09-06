import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  FileStack,
  HeartPulse,
  Activity,
  Thermometer,
  Wind,
  Weight,
  Download,
} from "lucide-react";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../context/PatientContext";
import { useToast } from "../../../context/ToastContext";
import { PATIENT_DASHBOARD_ROOT } from "../../../data/patientDashboardNav";
import type { VisitStatus } from "../../../data/patientRecord";
import { fadeInUp, staggerContainer, staggerItem } from "../../../utils/motion";

/** Linked items (prescription / lab report / document rows) that navigate
 * elsewhere get a subtle hover to signal they're clickable through — no
 * lift, just a border/shadow nudge consistent with the rest of the app. */
const LINKED_ROW_CLASSES =
  "flex items-center justify-between gap-3 rounded-mx-sm border border-transparent bg-mx-surface-sunken px-3 py-2.5 transition-[border-color,box-shadow] duration-150 ease-out hover:border-mx-border-strong hover:shadow-mx-sm";

const VISIT_STATUS_TONE: Record<VisitStatus, "green" | "blue" | "warning"> = {
  Completed: "green",
  Confirmed: "blue",
  Pending: "warning",
};

const VITAL_TILES = [
  { key: "bp" as const, label: "Blood Pressure", icon: HeartPulse },
  { key: "pulse" as const, label: "Pulse", icon: Activity },
  { key: "temperature" as const, label: "Temperature", icon: Thermometer },
  { key: "spo2" as const, label: "SpO2", icon: Wind },
  { key: "weight" as const, label: "Weight", icon: Weight },
];

export default function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const patient = usePatientRecord();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  const visit = patient.visits.find((v) => v.id === visitId);
  const goToVisits = () => navigate(`${PATIENT_DASHBOARD_ROOT}/visits`);

  if (!visit) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={goToVisits}>
          Back to My Visits
        </Button>
        <EmptyState icon={<CalendarClock size={22} aria-hidden="true" />} title="Visit not found" description="This visit may have been removed or the link is out of date." />
      </div>
    );
  }

  const prescription = visit.prescriptionId ? patient.prescriptions.find((p) => p.id === visit.prescriptionId) : undefined;
  const labReports = (visit.labReportIds ?? []).map((id) => patient.labReports.find((r) => r.id === id)).filter((r) => !!r);
  const documents = (visit.documentIds ?? []).map((id) => patient.documents.find((d) => d.id === id)).filter((d) => !!d);

  const download = (name: string) => showToast({ tone: "success", title: "Downloading", description: `${name} is being saved to your device.` });

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={goToVisits}>
        Back to My Visits
      </Button>

      {/* Visit header */}
      <motion.div initial={prefersReducedMotion ? false : "hidden"} animate="show" variants={prefersReducedMotion ? undefined : fadeInUp}>
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <MedicalIcon icon={Stethoscope} tone={VISIT_STATUS_TONE[visit.status]} size={22} className="h-12 w-12" />
            <div>
              <h1 className="font-display text-xl font-bold text-mx-ink sm:text-2xl">{visit.reason}</h1>
              <p className="mt-0.5 text-sm text-mx-ink-muted">
                {visit.date} · {visit.time}
              </p>
              <p className="text-sm text-mx-ink-muted">
                {visit.doctorName}
                {visit.department ? ` · ${visit.department}` : ""}
              </p>
            </div>
          </div>
          <Badge tone={VISIT_STATUS_TONE[visit.status]} className="shrink-0">
            {visit.status}
          </Badge>
        </Card>
      </motion.div>

      {/* Complaint & diagnosis */}
      <motion.div
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : staggerContainer()}
      >
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Card>
            <CardTitle className="mb-2">Chief Complaint</CardTitle>
            <p className="text-sm text-mx-ink-soft">{visit.complaint}</p>
          </Card>
        </motion.div>
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Card>
            <CardTitle className="mb-2">Diagnosis</CardTitle>
            <p className="text-sm text-mx-ink-soft">{visit.diagnosis}</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Vitals */}
      {visit.vitals && (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={prefersReducedMotion ? undefined : fadeInUp}
        >
          <Card>
            <CardTitle className="mb-3">Vitals</CardTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {VITAL_TILES.map((tile) => (
                <div key={tile.key} className="flex flex-col items-center gap-1.5 rounded-mx-md bg-mx-surface-sunken p-3 text-center">
                  <MedicalIcon icon={tile.icon} tone="blue" size={16} className="h-9 w-9" />
                  <p className="text-sm font-bold text-mx-ink">{visit.vitals![tile.key]}</p>
                  <p className="text-[11px] text-mx-ink-muted">{tile.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Prescription */}
      {prescription && (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={prefersReducedMotion ? undefined : fadeInUp}
        >
          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MedicalIcon icon={ClipboardList} tone="purple" size={16} className="h-9 w-9" />
                <CardTitle>Prescription Issued</CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                icon={<Download size={14} aria-hidden="true" />}
                onClick={() => download(`Prescription — ${prescription.date}`)}
              >
                Download
              </Button>
            </div>
            <ul className="space-y-2">
              {prescription.medicines.map((med) => (
                <li key={med.name} className="flex items-center justify-between gap-2 rounded-mx-sm bg-mx-surface-sunken px-3 py-2 text-sm">
                  <span className="font-semibold text-mx-ink">{med.name}</span>
                  <span className="text-xs text-mx-ink-muted">
                    {med.dosage} · {med.duration}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => navigate(`${PATIENT_DASHBOARD_ROOT}/records/prescriptions`)}
            >
              View in Prescriptions
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Lab reports */}
      {labReports.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={prefersReducedMotion ? undefined : fadeInUp}
        >
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <MedicalIcon icon={FlaskConical} tone="blue" size={16} className="h-9 w-9" />
              <CardTitle>Lab Reports from this Visit</CardTitle>
            </div>
            <ul className="space-y-2">
              {labReports.map((report) => (
                <li key={report!.id} className={LINKED_ROW_CLASSES}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-mx-ink">{report!.title}</p>
                    <p className="text-xs text-mx-ink-muted">{report!.labName}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`${PATIENT_DASHBOARD_ROOT}/records/lab-reports`)}>
                    View
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={prefersReducedMotion ? undefined : fadeInUp}
        >
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <MedicalIcon icon={FileStack} tone="green" size={16} className="h-9 w-9" />
              <CardTitle>Documents from this Visit</CardTitle>
            </div>
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc!.id} className={LINKED_ROW_CLASSES}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-mx-ink">{doc!.name}</p>
                    <p className="text-xs text-mx-ink-muted">{doc!.category}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`${PATIENT_DASHBOARD_ROOT}/records/documents`)}>
                    View
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* Doctor's notes */}
      {visit.notes && (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          variants={prefersReducedMotion ? undefined : fadeInUp}
        >
          <Card>
            <CardTitle className="mb-2">Doctor's Notes</CardTitle>
            <p className="text-sm text-mx-ink-soft">{visit.notes}</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
