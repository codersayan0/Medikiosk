import { ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import type { MedicalRecordStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { RECORD_STATUS_LABEL, RECORD_STATUS_TONE } from "../../utils/medicalRecords";

const STATUS_ICON: Record<MedicalRecordStatus, typeof ShieldCheck> = {
  verified: ShieldCheck,
  pending_review: Clock,
  flagged: AlertTriangle,
};

interface MedicalRecordStatusBadgeProps {
  status: MedicalRecordStatus;
  className?: string;
}

/** Professional status pill for a medical record or attached document — icon + label, never color alone. */
export function MedicalRecordStatusBadge({ status, className }: MedicalRecordStatusBadgeProps) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={RECORD_STATUS_TONE[status]} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {RECORD_STATUS_LABEL[status]}
    </Badge>
  );
}