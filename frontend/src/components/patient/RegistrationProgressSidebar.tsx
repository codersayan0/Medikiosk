import { Check, Headset, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useTranslation } from "../../i18n";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

type StepStatus = "completed" | "current" | "pending";

interface RegistrationProgressSidebarProps {
  /** Zero-based index of the current step within du.progressSteps (0 = Personal Information … 5 = Account Created). */
  currentStepIndex: number;
  className?: string;
}

/**
 * The left "Registration Progress" sidebar shown on every full-page step
 * of the registration flow (Personal Information, Document Upload, AI
 * Health Interview, AI Analysis, Review Summary, Account Created). Pulled
 * out into a shared component so every step renders an identical,
 * single source-of-truth progress indicator instead of duplicating the
 * step list and status logic.
 *
 * Also carries the "Your privacy is our priority" note and the "Need
 * Help?" card directly beneath the progress list — mirrored 1:1 from the
 * Doctor Registration flow's left sidebar (see
 * components/doctor/DoctorRegistrationProgress and DoctorSupportCard) so
 * both registration flows share the same structural layout: Registration
 * Progress, then privacy, then Need Help, all on the LEFT. The right-hand
 * sidebar on each step keeps only its page-specific supporting content
 * (Why Choose MediKiosk?, Registration Tips, AI info, Health ID, etc.) —
 * Need Help / privacy must not be duplicated there.
 */
export function RegistrationProgressSidebar({ currentStepIndex, className }: RegistrationProgressSidebarProps) {
  const { t } = useTranslation();
  const du = t.documentUpload;
  const { showToast } = useToast();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card>
        <h2 className="font-display text-sm font-bold text-mx-ink">{du.registrationProgressTitle}</h2>
        <ol className="mt-3 flex flex-col">
          {du.progressSteps.map((label, index) => {
            const status: StepStatus =
              index < currentStepIndex ? "completed" : index === currentStepIndex ? "current" : "pending";
            const isLast = index === du.progressSteps.length - 1;
            return (
              <li key={label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      status === "completed" && "bg-mx-green text-mx-ink-inverse",
                      status === "current" && "bg-mx-green-soft text-mx-green-strong ring-2 ring-mx-green",
                      status === "pending" && "bg-mx-surface-sunken text-mx-ink-muted"
                    )}
                  >
                    {status === "completed" ? <Check size={13} aria-hidden="true" /> : index + 1}
                  </span>
                  {!isLast && (
                    <span
                      className={cn("w-0.5 flex-1", status === "completed" ? "bg-mx-green" : "bg-mx-border-strong")}
                      style={{ minHeight: "1.1rem" }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className={cn("min-w-0 pb-3.5", isLast && "pb-0")}>
                  <p className={cn("text-sm font-semibold", status === "pending" ? "text-mx-ink-muted" : "text-mx-ink")}>
                    {label}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      status === "completed" && "text-mx-green-strong",
                      status === "current" && "font-medium text-mx-green-strong",
                      status === "pending" && "text-mx-ink-muted"
                    )}
                  >
                    {status === "completed" && du.progressStatusCompleted}
                    {status === "current" && du.progressStatusCurrent}
                    {status === "pending" && du.progressStatusPending}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="hidden flex-1 lg:block" />

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 rounded-mx-lg border border-mx-green/20 bg-mx-green-soft px-3.5 py-3 text-xs leading-relaxed text-mx-green-strong">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{du.privacyTitle}</p>
            <p className="mt-0.5 font-medium">{du.privacyNote}</p>
          </div>
        </div>

        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
              <Headset size={15} aria-hidden="true" />
            </span>
            <h3 className="font-display text-sm font-bold text-mx-ink">{du.needHelpTitle}</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mx-ink-muted">{du.needHelpDescription}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() =>
              showToast({
                tone: "info",
                title: "Support request received",
                description: "Our team will reach out to help with your registration shortly.",
              })
            }
          >
            {du.contactSupportButton}
          </Button>
        </Card>
      </div>
    </div>
  );
}
