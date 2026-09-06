import { useNavigate } from "react-router-dom";
import { Pill, CalendarDays, Stethoscope } from "lucide-react";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { useMedicines } from "../../../../context/PatientContext";
import { PATIENT_DASHBOARD_ROOT } from "../../../../data/patientDashboardNav";
import type { MedicineEntry } from "../../../../data/patientRecord";

function MedicineCard({ medicine, onViewPrescription }: { medicine: MedicineEntry; onViewPrescription: () => void }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <MedicalIcon icon={Pill} tone="purple" />
          <div className="min-w-0">
            <CardTitle className="truncate">{medicine.name}</CardTitle>
            <p className="text-xs text-mx-ink-muted">{medicine.frequency} · {medicine.duration}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-mx-ink-soft">{medicine.instructions}</p>

      <dl className="space-y-1 text-xs text-mx-ink-muted">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} aria-hidden="true" />
          <span>{medicine.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Stethoscope size={13} aria-hidden="true" />
          <span>{medicine.prescribedBy}</span>
        </div>
      </dl>

      {medicine.prescriptionId && (
        <Button size="sm" variant="outline" className="mt-1" onClick={onViewPrescription}>
          View Prescription
        </Button>
      )}
    </Card>
  );
}

export default function MedicinesPage() {
  const medicines = useMedicines();
  const navigate = useNavigate();
  const goToPrescriptions = () => navigate(`${PATIENT_DASHBOARD_ROOT}/records/prescriptions`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Medicines</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Every medicine you've been prescribed, past and current.</p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-mx-ink">Active Medicines</h2>
          <Badge tone="green">{medicines.active.length} active</Badge>
        </div>
        {medicines.active.length === 0 ? (
          <EmptyState icon={<Pill size={22} aria-hidden="true" />} title="No active medicines" description="You have no medicines currently in progress." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {medicines.active.map((m) => (
              <MedicineCard key={m.id} medicine={m} onViewPrescription={goToPrescriptions} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-mx-ink">Previous Medicines</h2>
          <Badge tone="neutral">{medicines.previous.length} on record</Badge>
        </div>
        {medicines.previous.length === 0 ? (
          <EmptyState icon={<Pill size={22} aria-hidden="true" />} title="No previous medicines" description="Your completed medicine history will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {medicines.previous.map((m) => (
              <MedicineCard key={m.id} medicine={m} onViewPrescription={goToPrescriptions} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
