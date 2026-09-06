import { History } from "lucide-react";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { DoctorComingSoonPage } from "../../../components/doctor/DoctorComingSoonPage";

/** Previous Visits — historical consultation log per patient. Placeholder until visit history is wired to real records. */
export default function PreviousVisitsPage() {
  return (
    <div>
      <SectionHeader eyebrow="Doctor Dashboard" title="Previous Visits" description="Past consultations across all your patients" />
      <DoctorComingSoonPage title="Previous Visits" icon={History} />
    </div>
  );
}