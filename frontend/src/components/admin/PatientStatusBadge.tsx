import { CheckCircle2, AlertOctagon, MinusCircle } from "lucide-react";
import type { PatientDirectoryStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { PATIENT_STATUS_LABEL, PATIENT_STATUS_TONE } from "../../utils/patients";

const STATUS_ICON: Record<PatientDirectoryStatus, typeof CheckCircle2> = {
  active: CheckCircle2,
  inactive: MinusCircle,
  critical: AlertOctagon,
};

interface PatientStatusBadgeProps {
  status: PatientDirectoryStatus;
  className?: string;
}

/** Professional status pill for a patient record — icon + label, never color alone. */
export function PatientStatusBadge({ status, className }: PatientStatusBadgeProps) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={PATIENT_STATUS_TONE[status]} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {PATIENT_STATUS_LABEL[status]}
    </Badge>
  );
}
