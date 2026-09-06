import { motion, useReducedMotion } from "framer-motion";
import { Eye, Fingerprint, KeyRound, Lock, ScrollText, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { ScaleIn, SlideUp } from "./motion";

const ITEM_ICONS: LucideIcon[] = [KeyRound, ShieldCheck, ScrollText, Fingerprint, Eye];

/**
 * SECTION 23 — SECURITY / PRIVACY
 * A calm, still section built around a single breathing lock glyph rather
 * than busy motion — security should feel quiet, not flashy. Deliberately
 * makes no claims about specific encryption or compliance certifications.
 */
export function Security() {
  const { t } = useTranslation();
  const home = t.home.phase3.security;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-mx-bg py-20 sm:py-28" aria-labelledby="security-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <ScrollReveal variant={ScaleIn} amount={0.5} className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong shadow-mx-md">
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Lock size={30} aria-hidden="true" />
          </motion.div>
        </ScrollReveal>

        <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          id="security-heading"
          lines={home.headline}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
        />
      </div>

      <StaggerGroup as="ul" className="mx-auto mt-14 grid max-w-4xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5" stagger={0.1} amount={0.2}>
        {home.items.map((item, i) => {
          const Icon = ITEM_ICONS[i];
          return (
            <StaggerItem key={item} as="li" variant={SlideUp} className="flex flex-col items-center gap-3 rounded-mx-md border border-mx-border bg-mx-surface px-4 py-6 text-center shadow-mx-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                <Icon size={17} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-mx-ink">{item}</p>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <ScrollReveal amount={0.3} className="mx-auto mt-10 max-w-lg px-4 text-center sm:px-6">
        <p className="text-xs text-mx-ink-muted">{home.note}</p>
      </ScrollReveal>
    </section>
  );
}
