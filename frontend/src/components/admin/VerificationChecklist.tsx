import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { DoctorApplication } from "../../types";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { cn } from "../../utils/cn";
import { smallTransition } from "../../utils/motion";
import { countDocumentsVerified, getChecklistItems, isReadyForApproval } from "../../utils/doctorApplications";

interface VerificationChecklistProps {
  application: DoctorApplication;
  onToggle: (
    key: "personalInfoVerified" | "identityVerified" | "degreeVerified" | "registrationVerified" | "experienceVerified" | "organizationVerified",
    value: boolean
  ) => void;
}

const MANUAL_KEYS = new Set([
  "personalInfoVerified",
  "identityVerified",
  "degreeVerified",
  "registrationVerified",
  "experienceVerified",
  "organizationVerified",
]);

/**
 * The 7-point verification checklist ("Personal information verified" …
 * "All required documents verified"). The first six are toggled directly by
 * the admin; the last is always derived from the document cards (disabled
 * here — see DocumentVerificationCard). Only when every item is done does
 * isReadyForApproval() return true, which gates the "Approve & Verify
 * Doctor" button in ApproveDoctorModal's trigger.
 */
export function VerificationChecklist({ application, onToggle }: VerificationChecklistProps) {
  const items = getChecklistItems(application);
  const ready = isReadyForApproval(application);
  const prefersReducedMotion = useReducedMotion();
  const docCount = countDocumentsVerified(application);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification checklist</CardTitle>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            ready ? "bg-mx-green-soft text-mx-green-strong" : "bg-mx-surface-sunken text-mx-ink-soft"
          )}
        >
          {items.filter((i) => i.done).length}/{items.length} complete
        </span>
      </CardHeader>

      <ProgressBar
        value={docCount.verified}
        max={Math.max(docCount.total, 1)}
        label={`Documents verified — ${docCount.verified}/${docCount.total}`}
        className="mb-4"
      />

      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isManual = MANUAL_KEYS.has(item.key);
          return (
            <li key={item.key}>
              <button
                type="button"
                disabled={!isManual}
                onClick={() => {
                  if (isManual) {
                    onToggle(item.key as Parameters<typeof onToggle>[0], !item.done);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-mx-sm px-2.5 py-2 text-left text-sm transition-colors duration-150",
                  isManual ? "hover:bg-mx-surface-sunken" : "cursor-default",
                  item.done ? "text-mx-ink" : "text-mx-ink-soft"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                    item.done ? "border-mx-green bg-mx-green text-mx-ink-inverse" : "border-mx-border-strong bg-mx-surface"
                  )}
                >
                  {item.done && (
                    <motion.span
                      initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={smallTransition}
                    >
                      <Check size={12} aria-hidden="true" />
                    </motion.span>
                  )}
                </span>
                <span className={cn("flex-1 font-semibold", !isManual && "text-mx-ink-muted")}>{item.label}</span>
                {!isManual && <span className="text-[11px] font-semibold text-mx-ink-muted">auto</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}