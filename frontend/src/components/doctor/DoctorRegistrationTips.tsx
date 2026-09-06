import { Check, Lightbulb } from "lucide-react";
import { Card } from "../ui/Card";

const REGISTRATION_TIPS = [
  "Keep your professional documents ready",
  "Use a valid professional email",
  "Ensure all details are accurate",
  "Complete verification for trust",
  "You can save & continue anytime",
];

/** "Registration Tips" card — right sidebar, Doctor Registration flow. */
export function DoctorRegistrationTips() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">
          <Lightbulb size={15} aria-hidden="true" />
        </span>
        <h3 className="font-display text-sm font-bold text-mx-ink">Registration Tips</h3>
      </div>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {REGISTRATION_TIPS.map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft">
            <Check size={13} className="mt-0.5 shrink-0 text-mx-green" aria-hidden="true" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
