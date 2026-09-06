import { ArrowRight, Bell, CircleHelp, FileCheck2, Lightbulb, Search, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface DoctorHospitalApplicationSidebarProps {
  onLearnMore?: () => void;
  className?: string;
}

const WHAT_HAPPENS_NEXT = [
  { icon: Search, text: "Select a hospital and send your application." },
  { icon: FileCheck2, text: "The hospital admin will review your details and documents." },
  { icon: Bell, text: "You will be notified via email and SMS about the status." },
  { icon: ShieldCheck, text: "Once approved, your account will be created and you can access your dashboard." },
];

const APPLICATION_TIPS = [
  { icon: Search, text: "Search using correct Hospital ID or Name" },
  { icon: FileCheck2, text: "Ensure your details are accurate" },
  { icon: ShieldCheck, text: "You can only apply to one hospital at a time" },
  { icon: Bell, text: "You will be notified about the status" },
];

/**
 * Right-column stack shown only on Step 5 (Hospital Application) of the
 * Doctor Registration flow. Deliberately its own component rather than a
 * reuse of DoctorRegistrationSupportSidebar (Why Join / Registration
 * Tips) — this step needs process-specific guidance ("What happens
 * next?", search tips, "Can't find your hospital?") instead of the
 * generic why-join pitch shown on every other step.
 */
export function DoctorHospitalApplicationSidebar({ onLearnMore, className }: DoctorHospitalApplicationSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
            <ArrowRight size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-ink">What happens next?</h3>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {WHAT_HAPPENS_NEXT.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-mx-ink-soft">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mx-blue-soft text-mx-blue">
                <item.icon size={13} aria-hidden="true" />
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
            <Lightbulb size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-ink">Application Tips</h3>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {APPLICATION_TIPS.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-mx-ink-soft">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mx-blue-soft text-mx-blue">
                <item.icon size={13} aria-hidden="true" />
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col gap-2.5 rounded-mx-lg border border-mx-warning/25 bg-mx-warning-soft p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-surface text-mx-warning">
            <CircleHelp size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-warning">Can't find your hospital?</h3>
        </div>
        <p className="text-xs leading-relaxed text-mx-ink-soft">
          Ask your hospital admin to share the Hospital ID with you or invite you.
        </p>
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={onLearnMore}>
          Learn More
        </Button>
      </div>
    </div>
  );
}
