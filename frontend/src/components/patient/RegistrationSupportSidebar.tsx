import { Check, Lightbulb, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

interface RegistrationSupportSidebarProps {
  className?: string;
}

/**
 * The right-hand "Why Choose MediKiosk? / Registration Tips" sidebar
 * shown on Personal Information (Step 1) and ready to reuse on any other
 * full-page registration step that wants the same supporting content.
 * Pulled into its own component (mirroring RegistrationProgressSidebar on
 * the left) so the copy lives in one place instead of being duplicated
 * per step.
 *
 * "Your privacy is our priority" and "Need Help?" live ONLY on the left
 * (see RegistrationProgressSidebar), mirroring the Doctor Registration
 * flow's layout — they are intentionally not repeated here.
 */
export function RegistrationSupportSidebar({ className }: RegistrationSupportSidebarProps) {
  const { t } = useTranslation();
  const pd = t.personalDetailsStep;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
            <ShieldCheck size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-ink">{pd.whyChooseTitle}</h3>
        </div>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {pd.whyChoose.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft">
              <Check size={13} className="mt-0.5 shrink-0 text-mx-green" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">
            <Lightbulb size={15} aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold text-mx-ink">{pd.tipsTitle}</h3>
        </div>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {pd.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mx-ink-muted" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
