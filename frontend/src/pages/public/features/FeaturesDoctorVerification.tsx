import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bot, CheckCircle2, ShieldCheck, Stethoscope, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { ProductTransition, SlideUp } from "../home/motion";
import { cn } from "../../../utils/cn";

const FLOW_ICONS: LucideIcon[] = [User, Bot, Stethoscope, ShieldCheck];

/**
 * SECTION 10 — DOCTOR VERIFICATION
 * The trust workflow made visible: patient information becomes an AI
 * structured summary, which a doctor reviews and verifies. AI assists;
 * the doctor remains responsible for the final record.
 */
export function FeaturesDoctorVerification() {
  const { t } = useTranslation();
  const home = t.features.doctorVerification;
  const lastIndex = home.flow.length - 1;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-mx-surface/70 py-16 sm:py-24" aria-labelledby="doctorverification-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="doctorverification-heading"
            lines={[home.heading]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-4 max-w-lg text-base text-mx-ink-soft">
            {home.description}
          </ScrollReveal>
        </div>

        {/* Flow strip: patient -> AI summary -> doctor review -> verified */}
        <StaggerGroup as="ol" className="relative mt-14 grid gap-6 sm:grid-cols-4 sm:gap-3" stagger={0.12} amount={0.2}>
          <div
            className="pointer-events-none absolute top-9 right-[8%] left-[8%] hidden h-px bg-gradient-to-r from-mx-blue via-mx-purple to-mx-green sm:block"
            aria-hidden="true"
          />
          {home.flow.map((label, i) => {
            const Icon = FLOW_ICONS[i];
            const isFinal = i === lastIndex;
            return (
              <StaggerItem key={label} as="li" variant={ProductTransition} className="relative flex flex-col items-center text-center">
                <span
                  className={cn(
                    "relative z-10 flex h-14 w-14 items-center justify-center rounded-full border shadow-mx-sm",
                    isFinal ? "border-mx-green bg-mx-green-soft text-mx-green-strong" : "border-mx-border bg-mx-surface-raised text-mx-ink-soft"
                  )}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
                <p className="mt-3 max-w-[8rem] text-xs leading-tight font-semibold text-mx-ink sm:text-sm">{label}</p>
                {i < lastIndex && <ArrowRight size={15} className="mt-2 text-mx-ink-muted sm:hidden" aria-hidden="true" />}
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Doctor review panel mock */}
        <ScrollReveal variant={SlideUp} amount={0.3} className="mx-auto mt-14 max-w-md">
          <div className="rounded-mx-xl border border-mx-border bg-mx-surface-raised p-5 shadow-mx-lg sm:p-6">
            <div className="mb-4 flex items-center gap-2.5 border-b border-mx-border pb-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                <Stethoscope size={15} aria-hidden="true" />
              </span>
              <p className="text-sm font-bold text-mx-ink">{home.reviewPanelTitle}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-mx-md border border-mx-green/30 bg-mx-green-soft px-4 py-3">
              <span className="min-w-0 text-sm font-semibold text-mx-ink">{home.reviewLabel}</span>
              <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-mx-green px-2.5 py-1 text-xs font-bold whitespace-nowrap text-mx-ink-inverse">
                {!prefersReducedMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-mx-green/60"
                    animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.25, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <CheckCircle2 size={13} className="relative" aria-hidden="true" />
                <span className="relative">{home.verifiedLabel}</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal as="p" variant={SlideUp} amount={0.4} className="mx-auto mt-6 max-w-lg text-center text-sm font-semibold text-mx-green-strong">
          {home.note}
        </ScrollReveal>
      </div>
    </section>
  );
}