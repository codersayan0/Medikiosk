import { Clock, Eye, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import type { DoctorApplicationStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_TONE } from "../../utils/doctorApplications";

const STATUS_ICON: Record<DoctorApplicationStatus, typeof Clock> = {
  pending: Clock,
  under_review: Eye,
  verification_required: RotateCcw,
  verified: ShieldCheck,
  rejected: XCircle,
};

interface ApplicationStatusBadgeProps {
  status: DoctorApplicationStatus;
  className?: string;
}

/** Professional status pill for a doctor application — icon + label, never color alone. */
export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={APPLICATION_STATUS_TONE[status]} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {APPLICATION_STATUS_LABEL[status]}
    </Badge>
  );
}