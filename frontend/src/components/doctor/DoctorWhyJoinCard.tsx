import { Check, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";

const WHY_JOIN_ITEMS = [
  "Secure patient data management",
  "AI-powered clinical support",
  "Seamless OPD workflow",
  "Grow your practice online",
  "Trusted by healthcare professionals",
  "Support and assistance",
];

/** "Why Join MediKiosk?" card — right sidebar, Doctor Registration flow. */
export function DoctorWhyJoinCard() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
          <ShieldCheck size={15} aria-hidden="true" />
        </span>
        <h3 className="font-display text-sm font-bold text-mx-ink">Why Join MediKiosk?</h3>
      </div>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {WHY_JOIN_ITEMS.map((line) => (
          <li key={line} className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft">
            <Check size={13} className="mt-0.5 shrink-0 text-mx-green" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
