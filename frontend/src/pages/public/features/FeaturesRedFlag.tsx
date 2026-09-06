import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ClipboardCheck, HeartPulse, Stethoscope, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { ScaleIn, SlideUp } from "../home/motion";

const ITEM_ICONS: LucideIcon[] = [HeartPulse, Wind, Stethoscope];

/**
 * SECTION 7 — RED FLAG DETECTION
 * A clinical-review panel that surfaces symptoms worth a closer look. The
 * copy is deliberately careful: MediKiosk highlights information for a
 * doctor's review, it never diagnoses or claims certainty.
 */
export function FeaturesRedFlag() {
  const { t } = useTranslation();
  const home = t.features.redFlag;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-mx-surface/70 py-16 sm:py-24" aria-labelledby="redflag-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-warning uppercase">{home.eyebrow}</p>
            <RevealHeading
              as="h2"
              id="redflag-heading"
              lines={[home.heading]}
              className="font-display max-w-md text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
            />
            <ScrollReveal as="p" variant={SlideUp} className="mt-4 max-w-md text-base text-mx-ink-soft">
              {home.description}
            </ScrollReveal>

            <ScrollReveal
              variant={SlideUp}
              className="mt-6 flex max-w-md items-start gap-2.5 rounded-mx-md border border-mx-border bg-mx-surface-sunken px-4 py-3.5"
            >
              <ClipboardCheck size={16} className="mt-0.5 shrink-0 text-mx-ink-muted" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-mx-ink-muted">{home.disclaimer}</p>
            </ScrollReveal>
          </div>

          {/* Clinical review panel mock */}
          <ScrollReveal variant={SlideUp} amount={0.2}>
            <div className="rounded-mx-xl border border-mx-warning/25 bg-mx-surface-raised p-6 shadow-mx-lg sm:p-7">
              <div className="mb-5 flex items-center gap-2.5 border-b border-mx-border pb-4">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">
                  {!prefersReducedMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-mx-warning/40"
                      animate={{ opacity: [0.45, 0, 0.45], scale: [1, 1.35, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <AlertTriangle size={16} className="relative" aria-hidden="true" />
                </span>
                <p className="text-sm font-bold text-mx-ink">{home.panelTitle}</p>
              </div>

              <StaggerGroup as="ul" className="space-y-2.5" stagger={0.1} amount={0.3}>
                {home.items.map((item, i) => {
                  const Icon = ITEM_ICONS[i];
                  return (
                    <StaggerItem key={item} as="li" variant={ScaleIn}>
                      <div className="flex items-center gap-3 rounded-mx-md border border-mx-border bg-mx-surface px-4 py-3 shadow-mx-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">
                          <Icon size={14} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-mx-ink">{item}</span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>

              <div className="mt-5 flex items-center gap-2 rounded-mx-md border border-mx-warning/30 bg-mx-warning-soft px-4 py-2.5">
                <AlertTriangle size={13} className="shrink-0 text-mx-warning" aria-hidden="true" />
                <p className="text-xs font-bold text-mx-warning">{home.note}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}