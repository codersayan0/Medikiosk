import { Ban, Clock, ShieldCheck } from "lucide-react";
import type { DoctorApplication } from "../../types";
import { Badge } from "../ui/Badge";

export type DoctorDisplayStatus = "verified" | "pending" | "suspended";

/**
 * Collapses an application's real lifecycle status into the 3 states the
 * Doctors page cares about: not-yet-a-doctor (pending/under_review/
 * verification_required), active doctor (verified + not suspended), or
 * suspended. Rejected applications never reach the Doctors page at all.
 */
export function getDoctorDisplayStatus(app: DoctorApplication): DoctorDisplayStatus {
  if (app.status === "verified") return app.doctorStatus === "suspended" ? "suspended" : "verified";
  return "pending";
}

const STATUS_META: Record<DoctorDisplayStatus, { label: string; tone: "green" | "warning" | "danger"; icon: typeof Clock }> = {
  verified: { label: "Verified", tone: "green", icon: ShieldCheck },
  pending: { label: "Pending", tone: "warning", icon: Clock },
  suspended: { label: "Suspended", tone: "danger", icon: Ban },
};

interface DoctorStatusBadgeProps {
  application: DoctorApplication;
  className?: string;
}

/** Status pill for the Doctors directory — distinct from ApplicationStatusBadge, which tracks the application lifecycle instead. */
export function DoctorStatusBadge({ application, className }: DoctorStatusBadgeProps) {
  const status = getDoctorDisplayStatus(application);
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {meta.label}
    </Badge>
  );
}