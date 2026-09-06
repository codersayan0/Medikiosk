import { motion, useReducedMotion } from "framer-motion";
import { Activity, ClipboardList, FileText, HeartPulse, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { SlideUp } from "../home/motion";
import { cn } from "../../../utils/cn";

const ENTRY_ICONS: LucideIcon[] = [HeartPulse, Activity, Stethoscope, FileText, ClipboardList];
const ENTRY_ACCENTS = ["text-mx-blue bg-mx-blue-soft", "text-mx-purple bg-mx-purple-soft", "text-mx-green bg-mx-green-soft"];
const EASE = [0.16, 1, 0.3, 1] as const;

const RiseIn = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/**
 * SECTION 5 — MEDICAL TIMELINE
 * A horizontal, scroll-driven timeline of health events, mirroring the
 * homepage's timeline motif with feature-page-specific content.
 */
export function FeaturesTimeline() {
  const { t } = useTranslation();
  const home = t.features.timeline;
  const prefersReducedMotion = useReducedMotion();
  const lastIndex = home.entries.length - 1;

  return (
    <section className="overflow-hidden bg-mx-bg/68 py-16 sm:py-24" aria-labelledby="timeline-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          id="timeline-heading"
          lines={[home.heading]}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
        />
        <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-4 max-w-lg text-base text-mx-ink-soft">
          {home.description}
        </ScrollReveal>
      </div>

      {/* Horizontal track — scrolls on small screens, fits on larger ones */}
      <div className="mt-14 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-16 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div className="relative mx-auto min-w-max px-6 sm:min-w-0 sm:max-w-4xl sm:px-6">
          <div className="pointer-events-none absolute top-1/2 right-6 left-6 h-px -translate-y-1/2 bg-mx-border" aria-hidden="true" />
          <motion.div
            className="pointer-events-none absolute top-1/2 right-6 left-6 h-px origin-left -translate-y-1/2 bg-gradient-to-r from-mx-blue via-mx-purple to-mx-green"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.3, ease: EASE }}
            aria-hidden="true"
          />

          <StaggerGroup as="ol" className="relative z-10 flex items-center gap-8 sm:justify-between sm:gap-4" stagger={0.13} amount={0.2}>
            {home.entries.map((entry, i) => {
              const Icon = ENTRY_ICONS[i % ENTRY_ICONS.length];
              const isLatest = i === lastIndex;
              const above = i % 2 === 0;
              const accent = ENTRY_ACCENTS[i % ENTRY_ACCENTS.length];
              const [accentText] = accent.split(" ");
              return (
                <StaggerItem
                  key={`${entry.year}-${entry.label}`}
                  as="li"
                  variant={RiseIn}
                  className={cn("group flex w-32 shrink-0 flex-col items-center sm:w-auto sm:flex-1", above ? "flex-col" : "flex-col-reverse")}
                >
                  <div className="relative z-10 flex cursor-default flex-col items-center gap-0.5 rounded-mx-md border border-mx-border bg-mx-surface-raised px-3.5 py-2.5 text-center shadow-mx-sm transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-mx-border-strong group-hover:shadow-mx-lg">
                    <span className={cn("font-mono text-[11px] font-bold", accentText)}>{entry.year}</span>
                    <span className="text-xs font-semibold whitespace-nowrap text-mx-ink sm:text-sm">{entry.label}</span>
                  </div>

                  <span className="h-3 w-px shrink-0 bg-mx-border-strong" aria-hidden="true" />

                  <span
                    className={cn(
                      "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mx-border bg-mx-surface-raised shadow-mx-sm transition-[transform,box-shadow] duration-200 ease-out group-hover:scale-110 group-hover:shadow-mx-lg sm:h-12 sm:w-12",
                      accentText
                    )}
                  >
                    {isLatest && !prefersReducedMotion && (
                      <motion.span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-mx-green/50"
                        animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.6, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <Icon size={17} className="relative" aria-hidden="true" />
                  </span>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}