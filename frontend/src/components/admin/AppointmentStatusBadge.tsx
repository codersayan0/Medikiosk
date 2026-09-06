import { Clock, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import type { AppointmentStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from "../../utils/appointments";

const STATUS_ICON: Record<AppointmentStatus, typeof Clock> = {
  pending: Clock,
  confirmed: ShieldCheck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

/** Professional status pill for an appointment — icon + label, never color alone. */
export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={APPOINTMENT_STATUS_TONE[status]} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {APPOINTMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
