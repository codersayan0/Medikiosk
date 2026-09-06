import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { ClipboardList, FileText, History, Pill, ScrollText, Stethoscope, User } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";

const FRAGMENT_ICONS = [FileText, ScrollText, History, Stethoscope, Pill, ClipboardList, User];
const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade-to-transparent mask on both edges so the marquee loop reads as infinite, not clipped. */
const EDGE_MASK: CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
};

/**
 * SECTION 08 — THE PROBLEM
 * Fragments of a health story drift past in an endless marquee — literally
 * "everywhere" — then the section resolves into a single, quiet line of
 * tension: the doctor needs the whole picture, not the pieces.
 */
export function Problem() {
  const { t } = useTranslation();
  const home = t.home.phase2.problem;
  const prefersReducedMotion = useReducedMotion();

  const fragments = home.fragments.map((fragment, i) => ({
    fragment,
    Icon: FRAGMENT_ICONS[i % FRAGMENT_ICONS.length],
  }));
  // Duplicate the row so the marquee can loop seamlessly at -50%.
  const loopFragments = [...fragments, ...fragments];

  return (
    <section className="relative overflow-hidden bg-mx-bg-canvas py-14 sm:py-20" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-danger uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="problem-heading"
            lines={[home.headline]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
        </div>
      </div>

      {/* Infinite marquee of scattered fragments — single row, full-bleed, masked at the edges */}
      <div className="relative mt-10 sm:mt-12" style={EDGE_MASK}>
        <motion.div
          className="flex w-max items-center gap-3"
          animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={prefersReducedMotion ? undefined : { duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {loopFragments.map(({ fragment, Icon }, i) => (
            <motion.span
              key={`${fragment}-${i}`}
              className="inline-flex shrink-0 cursor-default items-center gap-2 rounded-mx-lg border border-mx-border bg-mx-surface px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-mx-ink-soft shadow-mx-sm"
              style={{ rotate: ((i % 5) - 2) * 2.4 }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: 0,
                      scale: 1.12,
                      y: -4,
                      color: "var(--mx-danger)",
                      borderColor: "var(--mx-danger)",
                      backgroundColor: "var(--mx-danger-soft)",
                      boxShadow: "var(--mx-shadow-lg)",
                      transition: { duration: 0.25, ease: EASE },
                    }
              }
            >
              <Icon size={15} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
              {fragment}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Convergence: the drifting rows resolve into a single line */}
        <div className="relative mt-10 flex justify-center sm:mt-12" aria-hidden="true">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: EASE }}
            className="h-px w-32 origin-center bg-gradient-to-r from-transparent via-mx-border-strong to-transparent"
          />
        </div>

        <ScrollReveal
          as="p"
          variant={SlideUp}
          amount={0.5}
          delay={prefersReducedMotion ? 0 : 0.15}
          className="font-display mt-6 text-center text-2xl font-bold text-mx-ink sm:text-3xl"
        >
          {home.resolution}
        </ScrollReveal>
      </div>
    </section>
  );
}