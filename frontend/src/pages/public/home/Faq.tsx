import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";
import { cn } from "../../../utils/cn";

/**
 * SECTION 25 — FAQ
 * A full-bleed, numbered question index (no card chrome) so the list reads
 * like a reference document rather than a boxed widget. Each row is a real
 * <button> with aria-expanded / aria-controls; height animates open with a
 * plus-to-cross rotation. Hover nudges the question text and tints the
 * index number, so scanning the list itself feels responsive before anyone
 * opens a row.
 */
export function Faq() {
  const { t } = useTranslation();
  const home = t.home.phase3.faq;
  const prefersReducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const [firstWord, ...restWords] = home.headline[0].split(" ");
  const restOfHeadline = restWords.join(" ");
  const count = String(home.items.length).padStart(2, "0");

  return (
    <section className="bg-mx-bg-canvas py-20 sm:py-28" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <ScrollReveal
          variant={SlideUp}
          className="flex flex-wrap items-end justify-between gap-4 border-b border-mx-border pb-8"
        >
          <h2 id="faq-heading" className="font-display text-4xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-5xl">
            {firstWord} <span className="text-mx-green-strong">{restOfHeadline}</span>
          </h2>
          <p className="font-mono text-xs font-bold tracking-widest text-mx-ink-muted uppercase">
            {count} questions
          </p>
        </ScrollReveal>

        <ScrollReveal variant={SlideUp} amount={0.05} delay={0.1}>
          <ul>
            {home.items.map((item, i) => {
              const isOpen = openIndex === i;
              const panelId = `faq-panel-${i}`;
              const triggerId = `faq-trigger-${i}`;
              return (
                <li key={item.q} className="group border-b border-mx-border">
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center gap-5 py-6 text-left transition-colors duration-300 hover:bg-mx-surface/70 sm:gap-7 sm:py-7"
                    >
                      <span
                        className={cn(
                          "w-7 shrink-0 font-mono text-xs font-bold tracking-wide transition-colors duration-300 sm:w-8",
                          isOpen ? "text-mx-green-strong" : "text-mx-ink-muted/70 group-hover:text-mx-green-strong"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-base font-bold transition-all duration-300 group-hover:translate-x-1.5 sm:text-xl",
                          isOpen ? "text-mx-green-strong" : "text-mx-ink"
                        )}
                      >
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 sm:h-9 sm:w-9",
                          isOpen
                            ? "border-mx-green bg-mx-green text-mx-ink-inverse"
                            : "border-mx-border-strong text-mx-ink-muted group-hover:border-mx-green-strong group-hover:text-mx-green-strong"
                        )}
                      >
                        <Plus size={16} aria-hidden="true" />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pr-14 pb-7 pl-12 text-sm leading-relaxed text-mx-ink-soft sm:pl-15 sm:text-base">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
