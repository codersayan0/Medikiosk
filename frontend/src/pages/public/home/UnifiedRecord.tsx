import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  FileStack,
  FolderOpen,
  History,
  Pill,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { ScaleIn } from "./motion";

const NODE_ICONS = [User, History, FolderOpen, Pill, AlertTriangle, Stethoscope, FileStack, CalendarClock];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * SECTION 09 — MEDIKIOSK BRINGS IT TOGETHER
 * The mirror image of Section 08: the same kinds of health information,
 * this time arriving in order — as a compact ring of nodes converging
 * visually into a single unified record card at the center. Nodes lift and
 * tint on hover, and the hub keeps a slow ambient pulse so the "everything
 * flows into one place" idea reads as continuously true, not a one-off
 * entrance effect.
 */
export function UnifiedRecord() {
  const { t } = useTranslation();
  const home = t.home.phase2.unify;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-mx-surface py-14 sm:py-20" aria-labelledby="unify-heading">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          id="unify-heading"
          lines={home.headline}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
        />
      </div>

      <div className="relative mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-10">
          {/* Node grid, converging toward the hub */}
          <StaggerGroup
            className="grid w-full max-w-md grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:order-1 lg:w-auto lg:max-w-none"
            stagger={0.08}
            amount={0.2}
          >
            {home.nodes.map((node, i) => {
              const Icon = NODE_ICONS[i % NODE_ICONS.length];
              return (
                <StaggerItem key={node} variant={ScaleIn}>
                  <motion.div
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -4, scale: 1.03, borderColor: "var(--mx-green)" }
                    }
                    transition={{ duration: 0.25, ease: EASE }}
                    className="group flex h-full items-center gap-2.5 rounded-mx-md border border-mx-border bg-mx-surface-raised px-3.5 py-3 shadow-mx-sm transition-shadow duration-300 hover:shadow-mx-md"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-surface-sunken text-mx-ink-soft transition-colors duration-300 group-hover:bg-mx-green-soft group-hover:text-mx-green-strong">
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <p className="text-sm leading-tight font-semibold text-mx-ink">{node}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          {/* Connecting line — horizontal on desktop (grid → hub), vertical on mobile */}
          <div className="relative z-10 flex items-center justify-center lg:order-2" aria-hidden="true">
            <motion.div
              initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
              whileInView={prefersReducedMotion ? undefined : { scaleY: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="h-8 w-px origin-top bg-gradient-to-b from-mx-green via-mx-blue to-mx-purple lg:hidden"
            />
            <motion.div
              initial={prefersReducedMotion ? undefined : { scaleX: 0 }}
              whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="hidden h-px w-16 origin-left bg-gradient-to-r from-mx-green via-mx-blue to-mx-purple lg:block"
            />
          </div>

          {/* Unified record hub */}
          <ScrollReveal variant={ScaleIn} amount={0.4} className="relative z-10 lg:order-3">
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative flex w-full max-w-xs flex-col items-center gap-2 rounded-mx-xl border-2 border-mx-green bg-mx-green-soft px-6 py-6 text-center shadow-mx-md"
            >
              {!prefersReducedMotion && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-mx-xl border-2 border-mx-green"
                  animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <motion.span
                animate={prefersReducedMotion ? undefined : { rotate: [0, 8, 0, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-mx-green text-mx-ink-inverse"
              >
                <Sparkles size={19} aria-hidden="true" />
              </motion.span>
              <p className="font-display relative text-base font-extrabold tracking-tight text-mx-green-strong">{home.recordLabel}</p>
              <p className="relative text-xs text-mx-ink-soft">{home.recordCaption}</p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
