import { Check, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { DoctorSupportCard } from "./DoctorSupportCard";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

type StepStatus = "completed" | "current" | "pending";

export interface DoctorProgressStep {
  label: string;
  /** Optional sub-label shown under the status text — used for "By Admin" on Review & Verification. */
  meta?: string;
}

export const DOCTOR_PROGRESS_STEPS: DoctorProgressStep[] = [
  { label: "Personal Information" },
  { label: "Verification (OTP)" },
  { label: "Professional Information" },
  { label: "Documents / License Upload" },
  { label: "Hospital Application" },
  { label: "Account Created" },
];

interface DoctorRegistrationProgressProps {
  /** Zero-based index of the current step within DOCTOR_PROGRESS_STEPS. */
  currentStepIndex: number;
  className?: string;
  /**
   * Zero-based index of a step to render as "completed" but with a
   * highlighted row background instead of the usual ring-highlighted
   * "current" treatment. Used for pages that revisit an already-completed
   * step — e.g. the post-submission Hospital Application state, where
   * Hospital Application itself is done (checkmark) but the page the
   * doctor is looking at is still that step, and the next step (Account
   * Created) hasn't started yet and must read "Pending", not "Current
   * Step". When set, this takes over status calculation entirely:
   * every step up to and including this index is "completed", every step
   * after it is "pending" — currentStepIndex is ignored.
   */
  highlightIndex?: number;
}

/**
 * The left "Registration Progress" sidebar for the Doctor Registration
 * flow. Deliberately mirrors components/patient/RegistrationProgressSidebar
 * 1:1 in visual language (numbered circles, connecting line, green
 * completed/current states, muted pending state, privacy card) — only the
 * step list and copy differ, per spec ("must remain on the LEFT exactly
 * like the patient registration flow"). Step 5 is "Hospital Application"
 * (doctor searches for and applies to a hospital) — not "Review &
 * Verification"; that label must never reappear here.
 *
 * Unlike the patient flow, the Doctor Registration left column also carries
 * a compact "Need Help?" card directly beneath the privacy card (per the
 * Doctor Registration sidebar spec). This is in addition to — not a
 * replacement for — the full Why Join / Registration Tips / Need Help
 * stack that stays on the right (DoctorRegistrationSupportSidebar), so the
 * right column is left untouched.
 */
export function DoctorRegistrationProgress({ currentStepIndex, className, highlightIndex }: DoctorRegistrationProgressProps) {
  const { showToast } = useToast();

  return (
        <div className={cn("flex flex-col gap-4 lg:self-start", className)}>
      <Card>
        <h2 className="font-display text-sm font-bold text-mx-ink">Registration Progress</h2>
        <ol className="mt-3 flex flex-col">
          {DOCTOR_PROGRESS_STEPS.map((step, index) => {
            const status: StepStatus =
              highlightIndex !== undefined
                ? index <= highlightIndex
                  ? "completed"
                  : "pending"
                : index < currentStepIndex
                  ? "completed"
                  : index === currentStepIndex
                    ? "current"
                    : "pending";
            const isHighlighted = highlightIndex !== undefined && index === highlightIndex;
            const isLast = index === DOCTOR_PROGRESS_STEPS.length - 1;
            return (
              <li
                key={step.label}
                className={cn(
                  "flex gap-3 rounded-mx-md",
                  isHighlighted && "-mx-2.5 bg-mx-green-soft px-2.5 py-1.5 sm:-mx-3 sm:px-3"
                )}
              >
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      status === "completed" && !isHighlighted && "bg-mx-green text-mx-ink-inverse",
                      status === "completed" &&
                        isHighlighted &&
                        "bg-mx-surface-raised text-mx-green-strong ring-2 ring-mx-green",
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
                    {step.label}
                  </p>
                  {step.meta && <p className="text-xs text-mx-ink-muted">{step.meta}</p>}
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
        <div className="flex items-start gap-2.5 rounded-mx-lg border border-mx-green/20 bg-mx-green-soft px-3.5 py-3 text-xs leading-relaxed text-mx-green-strong">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Your privacy is our priority</p>
            <p className="mt-0.5 font-medium">
              All your information is encrypted and securely stored. Only authorized personnel can access your
              information with your permission.
            </p>
          </div>
        </div>

        <DoctorSupportCard
          onContactSupport={() =>
            showToast({
              tone: "info",
              title: "Support request received",
              description: "Our team will reach out to help with your registration shortly.",
            })
          }
        />
      </div>
    </div>
  );
}
