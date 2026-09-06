import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  GanttChartSquare,
  UserPlus,
  Sparkles,
  ShieldAlert,
  Stethoscope,
  ClipboardCheck,
  FlaskConical,
  FileText,
  CalendarClock,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../context/PatientContext";
import type { BadgeTone } from "../../../types";
import type { TimelineEventKind } from "../../../data/patientRecord";
import { entranceTransition, microTransition, smallTransition, staggerContainer } from "../../../utils/motion";

/**
 * Timeline events: the connecting line here is a plain CSS border, not an
 * SVG path, so a true "line draw-in" isn't feasible without new markup —
 * per the fallback, each event fades/slides in top-to-bottom while its
 * dot gets a quick scale pop, in a tight sequence.
 */
const timelineRowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: smallTransition },
};

const timelineDotVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1, transition: entranceTransition },
};

/** Hover lift for each timeline row's content card — subtler than the page-level `hoverLiftProps`. */
const timelineHoverProps = {
  whileHover: { y: -2, boxShadow: "var(--mx-shadow-md)" },
  transition: microTransition,
};

const KIND_ICON: Record<TimelineEventKind, typeof UserPlus> = {
  registration: UserPlus,
  ai: Sparkles,
  triage: ShieldAlert,
  consultation: Stethoscope,
  prescription: ClipboardCheck,
  lab: FlaskConical,
  document: FileText,
  visit: CalendarClock,
};

const KIND_TONE: Record<TimelineEventKind, BadgeTone> = {
  registration: "blue",
  ai: "purple",
  triage: "warning",
  consultation: "green",
  prescription: "purple",
  lab: "blue",
  document: "neutral",
  visit: "green",
};

export default function MedicalTimelinePage() {
  const patient = usePatientRecord();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Medical Timeline</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Every visit, report, and prescription, stitched into one chronological history.</p>
      </div>

      {patient.timeline.length === 0 ? (
        <EmptyState icon={<GanttChartSquare size={22} aria-hidden="true" />} title="Nothing on your timeline yet" description="Your health history will show up here as it happens." />
      ) : (
        <Card>
          <motion.ol
            className="relative"
            initial={prefersReducedMotion ? false : "hidden"}
            animate="show"
            variants={prefersReducedMotion ? undefined : staggerContainer(0.06)}
          >
            {patient.timeline.map((event, index) => {
              const Icon = KIND_ICON[event.kind];
              const isLast = index === patient.timeline.length - 1;
              return (
                <motion.li
                  key={event.id}
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-4"
                  variants={prefersReducedMotion ? undefined : timelineRowVariants}
                >
                  {/* Connector column: icon + vertical rail. Fixed-width grid track,
                      so the icon can never overlap the content column next to it. */}
                  <div className="flex flex-col items-center">
                    <motion.span
                      className="relative z-10 shrink-0"
                      variants={prefersReducedMotion ? undefined : timelineDotVariants}
                    >
                      <MedicalIcon
                        icon={Icon}
                        tone={KIND_TONE[event.kind]}
                        size={14}
                        className="h-7 w-7 ring-4 ring-mx-surface-raised transition-transform duration-150 group-hover:scale-110"
                      />
                    </motion.span>
                    {!isLast && <span className="mt-1 w-px flex-1 bg-mx-border" aria-hidden="true" />}
                  </div>

                  {/* Content column: title, date/time, description. Never touches the
                      icon column — wraps and stacks entirely within its own track. */}
                  <motion.div
                    className={`min-w-0 rounded-mx-md border border-transparent px-3 py-2.5 transition-colors duration-150 group-hover:border-mx-border group-hover:bg-mx-surface-sunken/60 ${
                      isLast ? "" : "mb-2"
                    }`}
                    {...(prefersReducedMotion ? {} : timelineHoverProps)}
                  >
                    <div className="flex flex-col gap-y-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-3">
                      <p className="min-w-0 break-words font-display text-sm font-bold text-mx-ink">{event.title}</p>
                      <p className="shrink-0 whitespace-nowrap text-xs text-mx-ink-muted">
                        {event.date} · {event.time}
                      </p>
                    </div>
                    <p className="mt-1 min-w-0 break-words text-sm leading-relaxed text-mx-ink-muted">
                      {event.description}
                    </p>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ol>
        </Card>
      )}
    </div>
  );
}