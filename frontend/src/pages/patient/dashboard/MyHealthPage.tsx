import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, IdCard, History, Pill, ShieldAlert, Users, Activity, Leaf, Sparkles } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../context/PatientContext";
import { PATIENT_DASHBOARD_ROOT } from "../../../data/patientDashboardNav";
import type { BadgeTone } from "../../../types";
import { staggerContainer, staggerItem } from "../../../utils/motion";

interface HealthTile {
  label: string;
  blurb: string;
  path: string;
  icon: typeof IdCard;
  tone: BadgeTone;
  countLabel?: string;
}

export default function MyHealthPage() {
  const patient = usePatientRecord();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const goTo = (path: string) => navigate(`${PATIENT_DASHBOARD_ROOT}/${path}`);

  const tiles: HealthTile[] = [
    {
      label: "Basic Health Information",
      blurb: "Your identity, Patient UID, and Health ID at a glance.",
      path: "health-id",
      icon: IdCard,
      tone: "blue",
    },
    {
      label: "Medical History",
      blurb: "Past illnesses, chronic conditions, surgeries, and family history.",
      path: "records/history",
      icon: History,
      tone: "green",
      countLabel: `${patient.medicalHistory.pastIllnesses.length} illness${patient.medicalHistory.pastIllnesses.length === 1 ? "" : "es"} on file`,
    },
    {
      label: "Current Medicines",
      blurb: "Medicines you're currently on, plus your medicine history.",
      path: "records/medicines",
      icon: Pill,
      tone: "purple",
      countLabel: `${patient.medicines.active.length} active`,
    },
    {
      label: "Allergies",
      blurb: "Known drug, food, and environmental allergies.",
      path: "records/allergies",
      icon: ShieldAlert,
      tone: "warning",
      countLabel: `${patient.allergies.medicine.length + patient.allergies.food.length + patient.allergies.other.length} on record`,
    },
    {
      label: "Family History",
      blurb: "Conditions that run in your family, as recorded in your Medical History.",
      path: "records/history",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Lifestyle",
      blurb: "Diet, exercise, sleep, and habits, as recorded in your Medical History.",
      path: "records/history",
      icon: Activity,
      tone: "green",
    },
    {
      label: "AYUSH Health",
      blurb: "Your Dashavidha Pariksha constitutional assessment and lifestyle notes.",
      path: "ayush",
      icon: Leaf,
      tone: "green",
    },
    {
      label: "AI Health Summary",
      blurb: "An AI-generated, informational overview of your overall health.",
      path: "records/ai-summary",
      icon: Sparkles,
      tone: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">My Health</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">A single hub for your medical history, medicines, allergies, and more.</p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : staggerContainer()}
      >
        {tiles.map((tile) => (
          <motion.div key={tile.label} variants={prefersReducedMotion ? undefined : staggerItem}>
            <Card
              interactive
              className="flex h-full flex-col gap-3"
              onClick={() => goTo(tile.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goTo(tile.path);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <MedicalIcon icon={tile.icon} tone={tile.tone} />
                {tile.countLabel && <Badge tone={tile.tone}>{tile.countLabel}</Badge>}
              </div>
              <div>
                <p className="font-display text-base font-bold text-mx-ink">{tile.label}</p>
                <p className="mt-1 text-sm text-mx-ink-muted">{tile.blurb}</p>
              </div>
              <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-mx-green-strong">
                View
                <ArrowRight size={13} aria-hidden="true" />
              </span>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
