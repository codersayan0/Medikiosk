import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Hand, Mic } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";
import { Waveform } from "./Waveform";
import { cn } from "../../../utils/cn";

type Mode = "voice" | "touch";

const TOUCH_CHIPS = ["Fever", "Cough", "Chest pain", "Breathlessness", "Something else"];
const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 1800;

export function VoiceTouch() {
  const { t } = useTranslation();
  const home = t.home.voiceTouch;
  const [mode, setMode] = useState<Mode>("voice");
  const [activeChip, setActiveChip] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Auto-demo: cycle a simulated tap across the guided chips while touch mode is showing,
  // so the panel reads as a live interaction rather than a static screenshot.
  useEffect(() => {
    if (mode !== "touch" || prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setActiveChip((c) => (c + 1) % TOUCH_CHIPS.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [mode, prefersReducedMotion]);

  const selectChip = (i: number) => setActiveChip(i);

  return (
    <section className="bg-mx-surface py-20 sm:py-28" aria-labelledby="voice-touch-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
            <RevealHeading
              as="h2"
              id="voice-touch-heading"
              lines={home.headline}
              className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
            />

            <ScrollReveal as="div" variant={SlideUp} delay={0.15} className="mt-8 inline-flex rounded-full border border-mx-border-strong bg-mx-surface p-1">
              <motion.button
                type="button"
                onClick={() => setMode("voice")}
                aria-pressed={mode === "voice"}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  mode === "voice" ? "bg-mx-green text-mx-ink-inverse" : "text-mx-ink-soft hover:bg-mx-surface-sunken"
                )}
              >
                <Mic size={15} aria-hidden="true" />
                {home.voiceLabel}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setMode("touch")}
                aria-pressed={mode === "touch"}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  mode === "touch" ? "bg-mx-blue text-mx-ink-inverse" : "text-mx-ink-soft hover:bg-mx-surface-sunken"
                )}
              >
                <Hand size={15} aria-hidden="true" />
                {home.touchLabel}
              </motion.button>
            </ScrollReveal>

            <p className="mt-5 max-w-sm text-sm text-mx-ink-muted">
              {mode === "voice" ? home.voiceHint : home.touchHint}
            </p>
          </div>

          <ScrollReveal variant={SlideUp} amount={0.2}>
            <div className="relative min-h-[19rem] overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-7 shadow-mx-lg">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "voice" ? (
                  <motion.div
                    key="voice"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center justify-center gap-6 py-8 text-center"
                  >
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                      {!prefersReducedMotion && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border-2 border-mx-green"
                          animate={{ opacity: [0.6, 0], scale: [1, 1.5] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <Mic size={26} aria-hidden="true" />
                    </span>
                    <Waveform className="flex h-14 items-end justify-center gap-1.5" />
                    <p className="font-display max-w-xs text-lg font-semibold text-mx-ink">{home.voiceText}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="touch"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center justify-center gap-6 py-8 text-center"
                  >
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                      <motion.span
                        animate={prefersReducedMotion ? undefined : { y: [0, -3, 0, 1, 0], rotate: [0, -6, 0, 3, 0] }}
                        transition={{ duration: AUTOPLAY_MS / 1000, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Hand size={26} aria-hidden="true" />
                      </motion.span>
                    </span>

                    <div className="flex flex-wrap justify-center gap-2">
                      {TOUCH_CHIPS.map((chip, i) => {
                        const isActive = i === activeChip;
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => selectChip(i)}
                            aria-pressed={isActive}
                            className="relative"
                          >
                            <motion.span
                              animate={{
                                scale: isActive ? [1, 1.1, 1] : 1,
                                backgroundColor: isActive ? "var(--mx-blue)" : "var(--mx-surface)",
                                color: isActive ? "var(--mx-ink-inverse)" : "var(--mx-ink-soft)",
                                borderColor: isActive ? "var(--mx-blue)" : "var(--mx-border-strong)",
                              }}
                              transition={{ duration: 0.45, ease: EASE }}
                              className="block rounded-full border px-3.5 py-1.5 text-xs font-semibold"
                            >
                              {chip}
                            </motion.span>
                            <AnimatePresence>
                              {isActive && !prefersReducedMotion && (
                                <motion.span
                                  aria-hidden="true"
                                  initial={{ opacity: 0.55, scale: 0.6 }}
                                  animate={{ opacity: 0, scale: 1.6 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.7, ease: "easeOut" }}
                                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-mx-blue"
                                />
                              )}
                            </AnimatePresence>
                          </button>
                        );
                      })}
                    </div>

                    <p className="font-display max-w-xs text-lg font-semibold text-mx-ink">{home.touchText}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
