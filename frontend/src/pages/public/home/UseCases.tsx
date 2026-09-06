import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ClipboardList,
  FileSearch,
  HeartPulse,
  Languages,
  Leaf,
  Repeat,
  ScanLine,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";
import { cn } from "../../../utils/cn";

const CASE_ICONS: LucideIcon[] = [Stethoscope, Repeat, HeartPulse, FileSearch, ClipboardList, Languages, Leaf, ScanLine];

/**
 * SECTION 19 — USE CASES
 * A large visual panel on the left with a numbered index on the right;
 * selecting (or auto-advancing through) an index item swaps the panel
 * content. On mobile the panel sits above a horizontally-scrollable,
 * tap-driven index so nothing depends on hover.
 */
export function UseCases() {
  const { t } = useTranslation();
  const home = t.home.phase3.useCases;
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion || !autoplay) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % home.items.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, autoplay, home.items.length]);

  const select = (i: number) => {
    setActive(i);
    setAutoplay(false);
  };

  const Icon = CASE_ICONS[active];

  return (
    <section className="bg-mx-surface py-20 sm:py-28" aria-labelledby="usecases-heading">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="mb-3 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          id="usecases-heading"
          lines={home.headline}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-5xl"
        />
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
        {/* Large visual panel */}
        <ScrollReveal variant={SlideUp} amount={0.4} className="order-2 lg:order-1">
          <div className="relative aspect-4/3 overflow-hidden rounded-mx-xl border border-mx-border bg-gradient-to-br from-mx-blue-soft via-mx-surface to-mx-purple-soft shadow-mx-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.03 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mx-surface text-mx-blue shadow-mx-md">
                  <Icon size={28} aria-hidden="true" />
                </span>
                <p className="font-mono text-xs font-bold tracking-widest text-mx-ink-muted">{home.items[active].number}</p>
                <p className="font-display text-xl font-extrabold text-mx-ink sm:text-2xl">{home.items[active].title}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* Numbered index — horizontally scrollable on mobile, tap to select */}
        <ScrollReveal variant={SlideUp} amount={0.4} delay={0.1} className="order-1 lg:order-2">
          <ul
            role="tablist"
            aria-label={home.eyebrow}
            className="mx-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {home.items.map((item, i) => {
              const isActive = i === active;
              return (
                <li key={item.number} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => select(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-mx-md border px-4 py-3 text-left transition-colors",
                      isActive
                        ? "border-mx-blue bg-mx-blue-soft"
                        : "border-transparent hover:bg-mx-surface-sunken"
                    )}
                  >
                    <span className={cn("font-mono text-xs font-bold", isActive ? "text-mx-blue" : "text-mx-ink-muted")}>
                      {item.number}
                    </span>
                    <span className={cn("text-sm font-semibold whitespace-nowrap lg:whitespace-normal", isActive ? "text-mx-ink" : "text-mx-ink-soft")}>
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
