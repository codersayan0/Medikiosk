import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, HeartHandshake, Leaf, Stethoscope, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";
import { cn } from "../../../utils/cn";

const ROLE_ICONS: LucideIcon[] = [User, Stethoscope, Building2, Users, HeartHandshake, Leaf];
const ROLE_ACCENTS = [
  "text-mx-blue bg-mx-blue-soft",
  "text-mx-green-strong bg-mx-green-soft",
  "text-mx-purple bg-mx-purple-soft",
  "text-mx-blue bg-mx-blue-soft",
  "text-mx-green-strong bg-mx-green-soft",
  "text-mx-purple bg-mx-purple-soft",
];

/**
 * SECTION 17 — WHO MEDIKIOSK IS FOR
 * A premium animated slider (not a basic carousel): the active role is a
 * large, scaled hero card that fades/slides/scales in as it changes, with
 * the surrounding roles shown as compact selectable tabs. On mobile the
 * tabs wrap and the interaction is tap-based rather than hover-based.
 */
export function ForWho() {
  const { t } = useTranslation();
  const home = t.home.phase3.forWho;
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion || !autoplay) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % home.roles.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, autoplay, home.roles.length]);

  const select = (i: number) => {
    setActive(i);
    setAutoplay(false);
  };

  const Icon = ROLE_ICONS[active];

  return (
    <section className="bg-mx-bg py-20 sm:py-28" aria-labelledby="forwho-heading">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="mb-3 text-xs font-bold tracking-wide text-mx-purple uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          id="forwho-heading"
          lines={home.headline}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-5xl"
        />
      </div>

      <div className="mx-auto mt-14 max-w-3xl px-4 sm:px-6">
        {/* Active role — large animated hero card */}
        <ScrollReveal variant={SlideUp} amount={0.4}>
          <div className="relative overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-8 shadow-mx-lg sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -14, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <span className={cn("flex h-16 w-16 items-center justify-center rounded-full shadow-mx-md", ROLE_ACCENTS[active])}>
                  <Icon size={28} aria-hidden="true" />
                </span>
                <h3 className="font-display text-2xl font-extrabold text-mx-ink sm:text-3xl">{home.roles[active].label}</h3>
                <p className="max-w-md text-base text-mx-ink-soft">{home.roles[active].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* Role selector — wraps on mobile, no hover dependency */}
        <div role="tablist" aria-label={home.eyebrow} className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {home.roles.map((role, i) => {
            const RoleIcon = ROLE_ICONS[i];
            const isActive = i === active;
            return (
              <button
                key={role.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => select(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-mx-purple bg-mx-purple text-mx-ink-inverse shadow-mx-sm"
                    : "border-mx-border bg-mx-surface text-mx-ink-soft hover:border-mx-purple/40 hover:text-mx-ink"
                )}
              >
                <RoleIcon size={15} aria-hidden="true" />
                {role.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
