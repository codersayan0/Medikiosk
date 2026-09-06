import { ListChecks } from "lucide-react";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { DoctorComingSoonPage } from "../../../components/doctor/DoctorComingSoonPage";

/** Review Summary — AI-drafted case summaries awaiting doctor sign-off. Placeholder until the review workflow is built. */
export default function ReviewSummaryPage() {
  return (
    <div>
      <SectionHeader eyebrow="Doctor Dashboard" title="Review Summary" description="AI-drafted consultation summaries awaiting your review and sign-off" />
      <DoctorComingSoonPage title="Review Summary" icon={ListChecks} />
    </div>
  );
}