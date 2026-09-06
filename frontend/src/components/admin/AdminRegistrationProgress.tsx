import { Check, Headset, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

type StepStatus = "completed" | "current" | "pending";

export const ADMIN_PROGRESS_STEPS = [
  "Admin & Organization Details",
  "Email Verification",
  "Account Created",
];

interface AdminRegistrationProgressProps {
  /** Zero-based index of the current step within ADMIN_PROGRESS_STEPS. */
  currentStepIndex: number;
  className?: string;
}

/**
 * The left "Registration Progress" sidebar for the Admin/Hospital
 * Registration flow. Deliberately mirrors
 * components/doctor/DoctorRegistrationProgress and
 * components/patient/RegistrationProgressSidebar 1:1 in visual language
 * (numbered circles, connecting line, green completed/current states,
 * muted pending state, privacy card, Need Help / Contact Support card) —
 * only the step list and copy differ, per spec ("Also keep: Need Help?,
 * Contact Support, Your privacy is our priority").
 */
export function AdminRegistrationProgress({ currentStepIndex, className }: AdminRegistrationProgressProps) {
  const { showToast } = useToast();

  return (
    <div className={cn("flex flex-col gap-4 lg:sticky lg:top-16 lg:self-start", className)}>
      <Card>
        <h2 className="font-display text-sm font-bold text-mx-ink">Registration Progress</h2>
        <ol className="mt-3 flex flex-col">
          {ADMIN_PROGRESS_STEPS.map((label, index) => {
            const status: StepStatus =
              index < currentStepIndex ? "completed" : index === currentStepIndex ? "current" : "pending";
            const isLast = index === ADMIN_PROGRESS_STEPS.length - 1;
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
                    {status === "completed" && "Completed"}
                    {status === "current" && "Current Step"}
                    {status === "pending" && "Pending"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="hidden flex-1 lg:block" />

      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
              <Headset size={15} aria-hidden="true" />
            </span>
            <h3 className="font-display text-sm font-bold text-mx-ink">Need Help?</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mx-ink-muted">
            Our support team is here to help you at any step of the registration.
          </p>
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
            Contact Support
          </Button>
        </Card>

        <div className="flex items-start gap-2.5 rounded-mx-lg border border-mx-green/20 bg-mx-green-soft px-3.5 py-3 text-xs leading-relaxed text-mx-green-strong">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Your privacy is our priority</p>
            <p className="mt-0.5 font-medium">
              All information provided is encrypted and securely stored. Only authorized personnel can access your
              information with your permission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}