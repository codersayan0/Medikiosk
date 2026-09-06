import { motion, useReducedMotion } from "framer-motion";
import { ShieldAlert, Pill, Salad, Sprout } from "lucide-react";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { useAllergies } from "../../../../context/PatientContext";
import type { AllergyEntry, AllergySeverity } from "../../../../data/patientRecord";
import { staggerContainer, staggerItem } from "../../../../utils/motion";

const SEVERITY_TONE: Record<AllergySeverity, "green" | "warning" | "danger"> = {
  Mild: "green",
  Moderate: "warning",
  Severe: "danger",
};

function AllergyCategory({
  icon: Icon,
  title,
  entries,
}: {
  icon: typeof ShieldAlert;
  title: string;
  entries: AllergyEntry[];
}) {
  return (
    <Card className="h-full">
      <div className="mb-3 flex items-center gap-2">
        <MedicalIcon icon={Icon} tone="blue" size={16} className="h-9 w-9" />
        <CardTitle>{title}</CardTitle>
      </div>
      {entries.length === 0 ? (
        <EmptyState
          compact
          icon={<Icon size={20} aria-hidden="true" />}
          title="No known allergies reported."
          description={`Nothing on record for ${title.toLowerCase()}.`}
        />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.allergen} className="rounded-mx-md bg-mx-surface-sunken p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-mx-ink">{entry.allergen}</p>
                <Badge tone={SEVERITY_TONE[entry.severity]}>{entry.severity}</Badge>
              </div>
              <p className="mt-1 text-sm text-mx-ink-soft">{entry.reaction}</p>
              <p className="mt-1 text-xs text-mx-ink-muted">{entry.date}</p>
              {entry.notes && <p className="mt-1 text-xs text-mx-ink-muted">{entry.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function AllergiesPage() {
  const allergies = useAllergies();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Allergies</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Known drug, food, and environmental allergies on your record.</p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : staggerContainer()}
      >
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <AllergyCategory icon={Pill} title="Medicine Allergies" entries={allergies.medicine} />
        </motion.div>
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <AllergyCategory icon={Salad} title="Food Allergies" entries={allergies.food} />
        </motion.div>
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <AllergyCategory icon={Sprout} title="Other Allergies" entries={allergies.other} />
        </motion.div>
      </motion.div>
    </div>
  );
}
