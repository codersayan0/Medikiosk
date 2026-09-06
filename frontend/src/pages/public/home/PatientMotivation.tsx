import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { StaggerGroup, StaggerItem } from "./Reveal";
import { SlideUp, VIEWPORT } from "./motion";

export function PatientMotivation() {
  const { t } = useTranslation();
  const home = t.home.motivation;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="for-patients"
      className="relative scroll-mt-28 overflow-hidden bg-mx-surface py-20 sm:py-28"
      aria-labelledby="motivation-heading"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div
          className="absolute top-1/3 right-[-10%] h-80 w-80 rounded-full bg-mx-blue-soft blur-3xl"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="mb-3 text-center text-xs font-bold tracking-wide text-mx-purple uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          lines={home.headline}
          className="font-display text-center text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl lg:text-5xl"
        />

        <StaggerGroup as="ul" className="mx-auto mt-14 max-w-2xl space-y-5" stagger={0.16} amount={0.2}>
          {home.statements.map((statement) => (
            <StaggerItem key={statement} as="li" variant={SlideUp} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mx-ink-muted/50" aria-hidden="true" />
              <p className="font-display text-lg text-mx-ink-soft italic sm:text-xl">&ldquo;{statement}&rdquo;</p>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={prefersReducedMotion ? undefined : SlideUp}
          className="mt-14 flex items-center justify-center gap-3 border-t border-mx-border pt-10"
        >
          <CheckCircle2 size={22} className="text-mx-green" aria-hidden="true" />
          <p className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">{home.resolution}</p>
        </motion.div>
      </div>
    </section>
  );
}
