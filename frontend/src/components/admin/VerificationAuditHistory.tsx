import { motion, useReducedMotion } from "framer-motion";
import {
  Ban,
  CheckCircle2,
  FileCheck2,
  FileClock,
  FileX2,
  RotateCcw,
  ShieldCheck,
  SendHorizontal,
  XCircle,
} from "lucide-react";
import type { VerificationAuditEvent, VerificationAuditEventType } from "../../types";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "../../utils/cn";
import { staggerContainer, staggerItem } from "../../utils/motion";

const EVENT_META: Record<VerificationAuditEventType, { icon: typeof CheckCircle2; tone: string }> = {
  application_submitted: { icon: SendHorizontal, tone: "bg-mx-blue-soft text-mx-blue" },
  document_verified: { icon: FileCheck2, tone: "bg-mx-green-soft text-mx-green-strong" },
  document_rejected: { icon: FileX2, tone: "bg-mx-danger-soft text-mx-danger" },
  document_reupload_requested: { icon: FileClock, tone: "bg-mx-purple-soft text-mx-purple" },
  checklist_item_verified: { icon: CheckCircle2, tone: "bg-mx-green-soft text-mx-green-strong" },
  correction_requested: { icon: RotateCcw, tone: "bg-mx-warning-soft text-mx-warning" },
  application_rejected: { icon: XCircle, tone: "bg-mx-danger-soft text-mx-danger" },
  application_approved: { icon: ShieldCheck, tone: "bg-mx-green-soft text-mx-green-strong" },
  doctor_suspended: { icon: Ban, tone: "bg-mx-danger-soft text-mx-danger" },
  doctor_activated: { icon: ShieldCheck, tone: "bg-mx-green-soft text-mx-green-strong" },
};

interface VerificationAuditHistoryProps {
  events: VerificationAuditEvent[];
}

/**
 * Timestamped, append-only Verification Audit History (spec §10). Every
 * state-changing verification action — a document verified/rejected, a
 * re-upload request, a checklist item completed, a correction request, the
 * final approval/rejection — is recorded automatically (see
 * context/AdminContext.tsx) and rendered here newest-first, distinct from
 * the free-text "Verification notes" an admin can add manually.
 */
export function VerificationAuditHistory({ events }: VerificationAuditHistoryProps) {
  const prefersReducedMotion = useReducedMotion();
  if (events.length === 0) return null;
  const ordered = [...events].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification audit history</CardTitle>
      </CardHeader>

      <motion.ol
        variants={staggerContainer(0.04)}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        className="relative flex flex-col gap-4 pl-1"
      >
        {ordered.map((event, i) => {
          const meta = EVENT_META[event.type];
          const Icon = meta.icon;
          const isLast = i === ordered.length - 1;
          return (
            <motion.li key={event.id} variants={staggerItem} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.tone)}>
                  <Icon size={14} aria-hidden="true" />
                </span>
                {!isLast && <span className="mt-1 w-px flex-1 bg-mx-border" aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <p className="text-sm font-semibold text-mx-ink">{event.label}</p>
                {event.detail && <p className="mt-0.5 text-xs text-mx-ink-soft">{event.detail}</p>}
                <p className="mt-0.5 text-xs text-mx-ink-muted">
                  {event.timestamp} · {event.actor}
                </p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </Card>
  );
}