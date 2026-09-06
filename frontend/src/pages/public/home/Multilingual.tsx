import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Languages, MessageCircle } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";

const LANGUAGE_LABELS = ["English", "বাংলা", "हिन्दी"] as const;

export function Multilingual() {
  const { t } = useTranslation();
  const home = t.home.multilingual;
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LANGUAGE_LABELS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  const activeIndex = prefersReducedMotion ? 0 : index;

  return (
    <section className="bg-mx-bg py-20 sm:py-28" aria-labelledby="multilingual-heading">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          lines={[home.headline]}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
        />

        <ScrollReveal variant={SlideUp} delay={0.15} className="mt-12">
          <div className="mb-6 flex items-center justify-center gap-2 text-mx-ink-muted">
            <Languages size={16} aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIndex}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="font-display text-lg font-bold text-mx-ink"
              >
                {LANGUAGE_LABELS[activeIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="mx-auto max-w-md rounded-mx-xl border border-mx-border bg-mx-surface-raised p-6 shadow-mx-md">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                <MessageCircle size={14} aria-hidden="true" />
              </span>
              <div className="min-h-[3.25rem] text-left">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeIndex}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-mx-lg rounded-tl-sm bg-mx-surface-sunken px-4 py-2.5 text-sm text-mx-ink"
                    lang={activeIndex === 0 ? "en" : activeIndex === 1 ? "bn" : "hi"}
                  >
                    {home.sample[activeIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal as="p" variant={SlideUp} delay={0.25} className="font-display mt-10 text-xl font-bold text-mx-ink">
          {home.message}
        </ScrollReveal>

        <p className="mx-auto mt-4 max-w-md text-xs text-mx-ink-muted">{home.disclaimer}</p>
      </div>
    </section>
  );
}
