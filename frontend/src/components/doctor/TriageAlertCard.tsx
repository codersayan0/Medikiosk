import { AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { microTransition } from "../../utils/motion";
import type { TriageAlert, TriageRisk } from "../../data/mockDoctorDashboard";

const RISK_CONFIG: Record<TriageRisk, { label: string; icon: typeof AlertTriangle; text: string; bg: string; border: string; badge: string }> = {
  high: {
    label: "HIGH RISK",
    icon: AlertTriangle,
    text: "text-mx-danger",
    bg: "bg-mx-danger-soft",
    border: "border-mx-danger/30",
    badge: "bg-mx-danger text-mx-ink-inverse",
  },
  medium: {
    label: "MEDIUM RISK",
    icon: AlertCircle,
    text: "text-mx-warning",
    bg: "bg-mx-warning-soft",
    border: "border-mx-warning/30",
    badge: "bg-mx-warning text-mx-ink-inverse",
  },
  low: {
    label: "LOW RISK",
    icon: Info,
    text: "text-mx-green-strong",
    bg: "bg-mx-green-soft",
    border: "border-mx-green/30",
    badge: "bg-mx-green text-mx-ink-inverse",
  },
};

interface TriageAlertCardProps {
  alert: TriageAlert;
  acknowledged: boolean;
  onAcknowledge: () => void;
  onOpenPatient: () => void;
}

/**
 * A single risk-colored triage alert: icon, patient, reason, time, and an
 * Acknowledge action. Purely a dashboard notification UI over demo data —
 * it surfaces AI-flagged priority, it does not diagnose anything.
 * Clicking the card (outside the button) opens the patient's record;
 * clicking Acknowledge only updates this alert's visual state.
 */
export function TriageAlertCard({ alert, acknowledged, onAcknowledge, onOpenPatient }: TriageAlertCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = RISK_CONFIG[alert.risk];
  const Icon = config.icon;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpenPatient}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenPatient();
        }
      }}
      aria-label={`Open ${alert.patientName}'s patient details`}
      className={cn(
        "cursor-pointer rounded-mx-md border p-3 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-mx-green",
        config.bg,
        config.border,
        acknowledged && "opacity-70"
      )}
      {...(prefersReducedMotion ? {} : { whileHover: { y: -2, boxShadow: "var(--mx-shadow-md)" }, transition: microTransition })}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold", config.badge)}>
          <Icon size={12} aria-hidden="true" />
          {config.label}
        </span>
        <span className="shrink-0 text-[11px] text-mx-ink-muted">{alert.minutesAgo} min ago</span>
      </div>
      <p className={cn("mt-2 text-sm font-bold", config.text)}>
        {alert.patientName}{" "}
        <span className="font-normal text-mx-ink-soft">
          ({alert.age}/{alert.sex})
        </span>
      </p>
      <p className="mt-0.5 text-xs text-mx-ink-soft">{alert.reason}</p>
      <div className="mt-2.5 flex justify-end">
        {acknowledged ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-mx-green-strong">
            <Check size={13} aria-hidden="true" /> Acknowledged
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge();
            }}
          >
            Acknowledge
          </Button>
        )}
      </div>
    </motion.div>
  );
}