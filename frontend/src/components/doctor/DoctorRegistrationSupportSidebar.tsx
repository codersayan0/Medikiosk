import { cn } from "../../utils/cn";
import { DoctorWhyJoinCard } from "./DoctorWhyJoinCard";
import { DoctorRegistrationTips } from "./DoctorRegistrationTips";

interface DoctorRegistrationSupportSidebarProps {
  className?: string;
}

/**
 * Right-column stack for every full-page step of the Doctor Registration
 * flow: Why Join MediKiosk? / Registration Tips only — pure informational
 * cards. "Need Help? / Contact Support" intentionally lives ONLY on the
 * left column now (grouped with Registration Progress + the privacy card,
 * see DoctorRegistrationProgress) so it isn't duplicated on both sides.
 */
export function DoctorRegistrationSupportSidebar({ className }: DoctorRegistrationSupportSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <DoctorWhyJoinCard />
      <DoctorRegistrationTips />
    </div>
  );
}
