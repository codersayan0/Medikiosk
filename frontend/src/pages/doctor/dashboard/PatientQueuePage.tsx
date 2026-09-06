import { useNavigate, useParams } from "react-router-dom";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Card } from "../../../components/ui/Card";
import { PatientQueueTable } from "../../../components/doctor/PatientQueueTable";
import { DOCTOR_DASHBOARD_ROOT } from "../../../data/doctorDashboardNav";
import type { QueueRiskTier } from "../../../data/mockDoctorDashboard";

const VALID_TIERS: QueueRiskTier[] = ["normal", "priority", "emergency"];

/**
 * Full Patient Queue page — routed at /doctor/dashboard/queue/:tab
 * (normal | priority | emergency), matching the sidebar's Normal Queue /
 * Priority Queue / Emergency Queue sub-items. Reuses PatientQueueTable,
 * the same component shown as a preview on the Overview page.
 */
export default function PatientQueuePage() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const activeTier: QueueRiskTier = VALID_TIERS.includes(tab as QueueRiskTier) ? (tab as QueueRiskTier) : "normal";

  return (
    <div>
      <SectionHeader
        eyebrow="Doctor Dashboard"
        title="Patient Queue"
        description="Live queue of today's patients across normal, priority, and emergency triage tiers"
      />
      <Card>
        <PatientQueueTable
          activeTier={activeTier}
          onTierChange={(tier) => navigate(`${DOCTOR_DASHBOARD_ROOT}/queue/${tier}`)}
        />
      </Card>
    </div>
  );
}