import { History, Activity, Scissors, BedDouble, Stethoscope, Users, HeartPulse } from "lucide-react";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { useMedicalHistory } from "../../../../context/PatientContext";
import type { MedicalHistoryEntry } from "../../../../data/patientRecord";

interface HistoryBlockProps {
  icon: typeof History;
  title: string;
  entries: MedicalHistoryEntry[];
  emptyDescription: string;
}

function HistoryBlock({ icon: Icon, title, entries, emptyDescription }: HistoryBlockProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <MedicalIcon icon={Icon} tone="blue" size={16} className="h-9 w-9" />
        <CardTitle>{title}</CardTitle>
      </div>
      {entries.length === 0 ? (
        <EmptyState compact icon={<Icon size={20} aria-hidden="true" />} title="Nothing on record" description={emptyDescription} />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.label} className="rounded-mx-md bg-mx-surface-sunken px-3 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-mx-ink">{entry.label}</p>
                {entry.date && <p className="text-xs text-mx-ink-muted">{entry.date}</p>}
              </div>
              <p className="mt-0.5 text-sm text-mx-ink-soft">{entry.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function MedicalHistoryPage() {
  const history = useMedicalHistory();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Medical History</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">A running log of past conditions, treatments, and diagnoses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HistoryBlock
          icon={Stethoscope}
          title="Past Illnesses"
          entries={history.pastIllnesses}
          emptyDescription="No past illnesses reported."
        />
        <HistoryBlock
          icon={Activity}
          title="Chronic Conditions"
          entries={history.chronicConditions}
          emptyDescription="No chronic conditions reported."
        />
        <HistoryBlock
          icon={Scissors}
          title="Previous Surgeries"
          entries={history.surgeries}
          emptyDescription="No previous surgeries reported."
        />
        <HistoryBlock
          icon={BedDouble}
          title="Hospitalizations"
          entries={history.hospitalizations}
          emptyDescription="No hospitalizations reported."
        />
        <HistoryBlock
          icon={HeartPulse}
          title="Current Medical Conditions"
          entries={history.currentConditions}
          emptyDescription="No active medical conditions reported."
        />
        <HistoryBlock
          icon={Users}
          title="Family History"
          entries={history.familyHistory}
          emptyDescription="No family history reported."
        />
      </div>

      <Card id="lifestyle">
        <div className="mb-3 flex items-center gap-2">
          <MedicalIcon icon={Activity} tone="green" size={16} className="h-9 w-9" />
          <CardTitle>Lifestyle History</CardTitle>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {history.lifestyle.map((entry) => (
            <div key={entry.label} className="rounded-mx-md bg-mx-surface-sunken px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">{entry.label}</p>
              <p className="mt-0.5 text-sm text-mx-ink">{entry.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
