import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowRight, Clock3, MessageCircle, Stethoscope } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { ProductTransition, SlideUp } from "./motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * SECTION 12 — WHAT MEDIKIOSK UNDERSTANDS
 * A single spoken sentence transforms into three structured fields. The
 * disclaimer is treated as first-class copy, not fine print — this is
 * information structuring, explicitly not a diagnosis.
 */
export function Understanding() {
  const { t } = useTranslation();
  const home = t.home.phase2.understand;
  const prefersReducedMotion = useReducedMotion();

  const extracted = [
    { label: home.chiefComplaint, value: home.chiefComplaintValue },
    { label: home.duration, value: home.durationValue },
    { label: home.pattern, value: home.patternValue },
  ];

  return (
    <section className="bg-mx-bg py-14 sm:py-20" aria-labelledby="understand-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="understand-heading"
            lines={[home.headline]}
            className="font-display mx-auto max-w-xl text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
        </div>

        <ScrollReveal variant={SlideUp} amount={0.3} className="mx-auto mt-8 max-w-md">
          <div className="flex items-start gap-2.5">
            <motion.span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-surface-sunken text-mx-ink-soft"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={prefersReducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageCircle size={14} aria-hidden="true" />
            </motion.span>
            <div className="max-w-[90%] rounded-mx-lg rounded-tl-sm bg-mx-surface-sunken px-4 py-2.5 text-sm text-mx-ink">
              {home.conversation}
            </div>
          </div>
        </ScrollReveal>

        <div className="my-5 flex justify-center text-mx-ink-muted" aria-hidden="true">
          <motion.div
            animate={prefersReducedMotion ? undefined : { x: [0, 6, 0] }}
            transition={prefersReducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="hidden sm:block" size={20} />
            <Clock3 className="sm:hidden" size={20} />
          </motion.div>
        </div>

        <StaggerGroup className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3" stagger={0.12} amount={0.25}>
          {extracted.map((field) => (
            <StaggerItem key={field.label} variant={ProductTransition}>
              <motion.div
                className="h-full rounded-mx-lg border border-mx-purple/30 bg-mx-purple-soft p-4 text-center"
                whileHover={prefersReducedMotion ? undefined : { y: -3, transition: { duration: 0.2, ease: EASE } }}
              >
                <p className="text-[10px] font-bold tracking-wide text-mx-purple uppercase">{field.label}</p>
                <p className="font-display mt-1.5 text-base font-bold text-mx-ink">{field.value}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <ScrollReveal variant={SlideUp} amount={0.3} className="mx-auto mt-6 max-w-2xl">
          <p className="text-center text-[11px] font-bold tracking-wide text-mx-ink-muted uppercase">{home.alsoConsidered}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {home.alsoConsideredItems.map((item) => (
              <span key={item} className="rounded-full border border-mx-border bg-mx-surface px-3.5 py-1.5 text-xs font-semibold text-mx-ink-soft">
                {item}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant={SlideUp} amount={0.4} className="mx-auto mt-7 flex max-w-lg items-start gap-2.5 rounded-mx-md border border-mx-border-strong bg-mx-surface-raised px-4 py-3.5">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-mx-warning" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-mx-ink-soft">{home.disclaimer}</p>
          <Stethoscope size={16} className="mt-0.5 ml-auto hidden shrink-0 text-mx-ink-muted sm:block" aria-hidden="true" />
        </ScrollReveal>
      </div>
    </section>
  );
}