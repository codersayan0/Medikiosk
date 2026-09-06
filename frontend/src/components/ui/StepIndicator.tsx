import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

/** Horizontal step tracker for onboarding and consultation flows. */
export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <li key={step.label} className="flex flex-1 flex-col items-center gap-2 last:flex-none">
            <div className="flex w-full items-center">
              <div
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                  isComplete && "border-mx-green bg-mx-green text-mx-ink-inverse",
                  isCurrent && "border-mx-green text-mx-green-strong",
                  !isComplete && !isCurrent && "border-mx-border-strong text-mx-ink-muted"
                )}
              >
                {isComplete ? <Check size={16} aria-hidden="true" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn("mx-1 h-0.5 flex-1", isComplete ? "bg-mx-green" : "bg-mx-border-strong")}
                />
              )}
            </div>
            <span
              className={cn(
                "text-center text-[11px] font-medium leading-tight",
                isCurrent ? "text-mx-ink" : "text-mx-ink-muted"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
