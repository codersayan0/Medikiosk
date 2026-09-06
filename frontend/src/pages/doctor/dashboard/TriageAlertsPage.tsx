import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Card } from "../../../components/ui/Card";
import { TriageAlertsList } from "../../../components/doctor/TriageAlertsList";

/** Full Triage Alerts page — every AI-flagged alert, highest risk first, reusing TriageAlertsList. */
export default function TriageAlertsPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Doctor Dashboard"
        title="Triage Alerts"
        description="AI-flagged patients that need clinical attention, sorted by risk"
      />
      <Card>
        <TriageAlertsList layout="grid" />
      </Card>
    </div>
  );
}