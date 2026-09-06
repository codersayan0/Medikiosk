import { Bell, Clock, FileCheck2, Lightbulb, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";
import type { SelectedHospital } from "../../pages/doctor/doctorHospitalTypes";

interface DoctorHospitalApplicationStatusSidebarProps {
  hospital: SelectedHospital;
  applicationId: string;
  applicationDate: string;
  className?: string;
}

const PENDING_REVIEW_TIPS = [
  { icon: FileCheck2, text: "Your documents are safely stored and under review" },
  { icon: ShieldCheck, text: "You can apply to only one hospital at a time" },
  { icon: Bell, text: "You will be notified via email and SMS" },
  { icon: Clock, text: "Response time may take 1–3 working days" },
];

/**
 * Right-column stack shown only on Step 5's submitted/pending-review
 * state (DoctorHospitalApplicationSubmittedStep) — an "Application
 * Status" card (mirrors the pre-send "Ready to Send" version but now
 * reflects "Pending Review", the chosen hospital, ID, and date) plus
 * updated Application Tips for someone waiting on a decision. The
 * "Can't find your hospital?" card from the search step is intentionally
 * dropped here — a hospital has already been chosen and applied to, so
 * that prompt no longer applies — and "Need Help?" already lives on the
 * left column (DoctorRegistrationProgress), so it isn't repeated here.
 */
export function DoctorHospitalApplicationStatusSidebar({
  hospital,
  applicationId,
  applicationDate,
  className,
}: DoctorHospitalApplicationStatusSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
            <FileCheck2 size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-ink">Application Status</h3>
        </div>

        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mx-warning-soft px-2.5 py-1 text-xs font-semibold text-mx-warning">
          <Clock size={12} aria-hidden="true" />
          Pending Review
        </span>

        <p className="mt-2.5 text-xs leading-relaxed text-mx-ink-muted">
          Your application is being reviewed by the hospital admin. You'll be notified as soon as there's an
          update.
        </p>

        <div className="mt-3 flex flex-col gap-2 border-t border-mx-border pt-3 text-xs">
          <div>
            <p className="text-mx-ink-muted">Selected Hospital</p>
            <p className="mt-0.5 font-semibold text-mx-ink">{hospital.name}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-mx-ink-muted">Application ID</span>
            <span className="font-semibold text-mx-ink">{applicationId}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-mx-ink-muted">Application Date</span>
            <span className="font-semibold text-mx-ink">{applicationDate}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-mx-ink-muted">Status</span>
            <span className="font-semibold text-mx-warning">Pending Review</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
            <Lightbulb size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-ink">Application Tips</h3>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {PENDING_REVIEW_TIPS.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-mx-ink-soft">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mx-blue-soft text-mx-blue">
                <item.icon size={13} aria-hidden="true" />
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
