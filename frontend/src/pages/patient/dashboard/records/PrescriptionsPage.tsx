import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, Download, Pill } from "lucide-react";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../../context/PatientContext";
import { useToast } from "../../../../context/ToastContext";
import type { PrescriptionRecord } from "../../../../data/patientRecord";
import { ErrorState } from "../../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../../components/ui/Skeleton";
import { useSimulatedLoad } from "../../../../hooks/useSimulatedLoad";
import { staggerContainer, staggerItem } from "../../../../utils/motion";


export default function PrescriptionsPage() {
  const patient = usePatientRecord();
  const { showToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<PrescriptionRecord | null>(null);

  const handleDownload = (rx: PrescriptionRecord) => {
    showToast({ tone: "success", title: "Prescription downloading", description: `Prescription from ${rx.date} is being saved to your device.` });
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
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Prescriptions</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Every prescription issued by your doctors, most recent first.</p>
      </div>

      {patient.prescriptions.length === 0 ? (
        <EmptyState icon={<ClipboardList size={22} aria-hidden="true" />} title="No prescriptions yet" description="Prescriptions issued during your visits will appear here." />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="show"
          variants={prefersReducedMotion ? undefined : staggerContainer()}
        >
          {patient.prescriptions.map((rx) => (
            <motion.div key={rx.id} variants={prefersReducedMotion ? undefined : staggerItem}>
              <Card className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <MedicalIcon icon={ClipboardList} tone="purple" />
                  <div className="min-w-0">
                    <CardTitle className="truncate">{rx.diagnosis}</CardTitle>
                    <p className="text-xs text-mx-ink-muted">
                      {rx.date} · {rx.doctorName}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {rx.medicines.slice(0, 3).map((med) => (
                    <li key={med.name} className="flex items-center justify-between gap-2 rounded-mx-sm bg-mx-surface-sunken px-3 py-2 text-sm">
                      <span className="min-w-0 truncate font-semibold text-mx-ink">{med.name}</span>
                      <span className="shrink-0 text-xs text-mx-ink-muted">
                        {med.dosage} · {med.duration}
                      </span>
                    </li>
                  ))}
                  {rx.medicines.length > 3 && (
                    <li className="text-xs font-semibold text-mx-ink-muted">+{rx.medicines.length - 3} more medicine(s)</li>
                  )}
                </ul>

                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                  <Button size="sm" variant="outline" className="sm:flex-1" onClick={() => setActive(rx)}>
                    View Prescription
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Download size={14} aria-hidden="true" />}
                    className="sm:flex-1"
                    onClick={() => handleDownload(rx)}
                  >
                    Download
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        isOpen={active !== null}
        onClose={() => setActive(null)}
        title={active ? active.diagnosis : ""}
        description={active ? `${active.date} · ${active.doctorName} · ${active.department}` : undefined}
        footer={
          active && (
            <>
              <Button variant="outline" size="sm" onClick={() => setActive(null)}>
                Close
              </Button>
              <Button size="sm" icon={<Download size={14} aria-hidden="true" />} onClick={() => handleDownload(active)}>
                Download
              </Button>
            </>
          )
        }
      >
        {active && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">Medicines</p>
              <motion.ul
                key={active.id}
                className="space-y-2"
                initial={prefersReducedMotion ? false : "hidden"}
                animate="show"
                variants={prefersReducedMotion ? undefined : staggerContainer(0.04)}
              >
                {active.medicines.map((med) => (
                  <motion.li
                    key={med.name}
                    variants={prefersReducedMotion ? undefined : staggerItem}
                    className="flex items-center gap-3 rounded-mx-sm bg-mx-surface-sunken px-3 py-2.5"
                  >
                    <MedicalIcon icon={Pill} tone="green" size={16} className="h-8 w-8 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-mx-ink">{med.name}</p>
                      <p className="text-xs text-mx-ink-muted">
                        Dosage {med.dosage} · {med.duration}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            {active.notes && (
              <p className="rounded-mx-md bg-mx-surface-sunken px-3 py-2.5 text-xs text-mx-ink-soft">
                <span className="font-semibold text-mx-ink">Doctor's Note: </span>
                {active.notes}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
