import { ArrowRight, CheckCircle2, FilePen, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { ProductTransition, SlideUp } from "./motion";

const STAGE_ICONS: LucideIcon[] = [Sparkles, Stethoscope, FilePen, ShieldCheck, CheckCircle2];

/**
 * SECTION 14 — DOCTOR REVIEW
 * MediKiosk's trust model, made visible: AI only ever prepares; a doctor
 * always reviews, edits, and verifies before anything becomes final.
 */
export function DoctorReview() {
  const { t } = useTranslation();
  const home = t.home.phase2.doctorReview;

  return (
    <section id="for-doctors" className="scroll-mt-28 bg-mx-surface py-20 sm:py-28" aria-labelledby="doctorreview-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="doctorreview-heading"
            lines={[home.headline]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
        </div>

        <StaggerGroup as="ol" className="relative mt-16 grid gap-6 sm:grid-cols-5 sm:gap-3" stagger={0.12} amount={0.2}>
          <div className="pointer-events-none absolute top-9 right-[8%] left-[8%] hidden h-px bg-gradient-to-r from-mx-purple via-mx-blue to-mx-green sm:block" aria-hidden="true" />

          {home.stages.map((stage, i) => {
            const Icon = STAGE_ICONS[i];
            const isDoctor = i === 1 || i === 4;
            return (
              <StaggerItem key={stage} as="li" variant={ProductTransition} className="relative flex flex-col items-center text-center">
                <span
                  className={
                    "relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border shadow-mx-sm " +
                    (isDoctor
                      ? "border-mx-green bg-mx-green-soft text-mx-green-strong"
                      : "border-mx-border bg-mx-surface-raised text-mx-ink-soft")
                  }
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-bold text-mx-ink">{stage}</p>
                {i < home.stages.length - 1 && (
                  <ArrowRight size={16} className="mt-3 text-mx-ink-muted sm:hidden" aria-hidden="true" />
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <ScrollReveal variant={SlideUp} amount={0.4} className="mx-auto mt-14 max-w-lg rounded-mx-md border border-mx-green/30 bg-mx-green-soft px-5 py-4 text-center">
          <p className="text-sm font-semibold text-mx-green-strong">{home.trustNote}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
