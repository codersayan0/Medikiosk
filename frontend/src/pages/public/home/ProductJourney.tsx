import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardList, History, Sparkles, Stethoscope, User } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { ProductTransition, SlideUp, VIEWPORT } from "./motion";

const STEP_ICONS = [User, Sparkles, ClipboardList, History, Stethoscope];
const EASE = [0.16, 1, 0.3, 1] as const;

export function ProductJourney() {
  const { t } = useTranslation();
  const home = t.home.journey;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-mx-surface py-20 sm:py-28" aria-labelledby="journey-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-purple uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="journey-heading"
            lines={[home.headline]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} className="mt-4 text-base text-mx-ink-soft">
            {home.subtext}
          </ScrollReveal>
        </div>

        <StaggerGroup
          as="ol"
          className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4"
          stagger={0.14}
          amount={0.15}
        >
          {/* connecting line, desktop only — draws in left-to-right as the row scrolls into view */}
          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? undefined : { scaleX: 0 }}
            whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
            className="pointer-events-none absolute top-9 right-[10%] left-[10%] hidden h-px origin-left bg-gradient-to-r from-mx-green via-mx-blue to-mx-purple lg:block"
          />

          {home.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <StaggerItem key={step} as="li" variant={ProductTransition} className="group relative flex flex-col items-center text-center">
                <motion.span
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { y: -6, scale: 1.08, boxShadow: "0 12px 28px -10px color-mix(in srgb, var(--mx-purple) 45%, transparent)" }
                  }
                  transition={{ duration: 0.3, ease: EASE }}
                  className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-mx-border bg-mx-surface-raised text-mx-ink shadow-mx-sm transition-colors duration-300 group-hover:border-mx-purple group-hover:text-mx-purple"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-mx-purple opacity-0 transition-opacity duration-300 group-hover:opacity-[0.08]" />
                  <Icon size={24} aria-hidden="true" className="relative" />
                </motion.span>
                <p className="mt-4 text-sm font-bold text-mx-ink transition-colors duration-300 group-hover:text-mx-purple">{step}</p>
                {i < home.steps.length - 1 && (
                  <motion.span
                    animate={prefersReducedMotion ? undefined : { x: [0, 4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    className="mt-3 lg:hidden"
                  >
                    <ArrowRight size={16} className="text-mx-ink-muted" aria-hidden="true" />
                  </motion.span>
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
