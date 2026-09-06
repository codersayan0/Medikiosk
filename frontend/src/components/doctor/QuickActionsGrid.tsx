import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Stethoscope, FilePenLine, FileUp, Users, AlertTriangle } from "lucide-react";
import { Card } from "../ui/Card";
import { MedicalIcon } from "../healthcare/MedicalIcon";
import type { BadgeTone } from "../../types";
import { DOCTOR_DASHBOARD_ROOT } from "../../data/doctorDashboardNav";

interface QuickAction {
  label: string;
  icon: typeof UserPlus;
  tone: BadgeTone;
  /** Path relative to DOCTOR_DASHBOARD_ROOT — always an existing route from routes/index.tsx, never a new one. */
  path: string;
}

/**
 * The 6 actions from the reference screenshot, in the exact order shown
 * (Add Patient -> Start Consultation -> Write Prescription -> Upload Document ->
 * View All Patients -> Triage Alerts). Every path already exists in
 * routes/index.tsx - no new routes are introduced here.
 */
const ACTIONS: QuickAction[] = [
  { label: "Add Patient", icon: UserPlus, tone: "blue", path: "patient-details/basic-profile" },
  { label: "Start Consultation", icon: Stethoscope, tone: "green", path: "queue/normal" },
  { label: "Write Prescription", icon: FilePenLine, tone: "purple", path: "review-summary" },
  { label: "Upload Document", icon: FileUp, tone: "warning", path: "patient-details/documents" },
  { label: "View All Patients", icon: Users, tone: "blue", path: "queue/normal" },
  { label: "Triage Alerts", icon: AlertTriangle, tone: "danger", path: "triage-alerts" },
];

/**
 * Quick Actions grid for the Overview page - 2 rows x 3 columns of
 * navigable tiles (collapses to 2 columns on very narrow screens). Each
 * tile is an icon + label on an interactive Card, which already supplies
 * the hover-lift + tap-scale motion (see utils/motion.ts hoverLiftProps),
 * so this component only needs to add keyboard support and wire up
 * navigation to existing dashboard routes.
 */
export function QuickActionsGrid() {
  const navigate = useNavigate();

  const goTo = (path: string) => navigate(`${DOCTOR_DASHBOARD_ROOT}/${path}`);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, path: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goTo(path);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.label}
            interactive
            padded={false}
            role="button"
            tabIndex={0}
            aria-label={action.label}
            className="flex flex-col items-center gap-2 px-3 py-4 text-center outline-none focus-visible:ring-2 focus-visible:ring-mx-blue focus-visible:ring-offset-2 active:scale-[0.97]"
            onClick={() => goTo(action.path)}
            onKeyDown={(event) => handleKeyDown(event, action.path)}
          >
            <MedicalIcon icon={Icon} tone={action.tone} />
            <span className="text-xs font-semibold text-mx-ink">{action.label}</span>
          </Card>
        );
      })}
    </div>
  );
}