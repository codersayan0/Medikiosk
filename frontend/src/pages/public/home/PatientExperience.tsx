import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Hand, Mic, MessageCircle, Sparkles, Stethoscope, User } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";
import { cn } from "../../../utils/cn";

const STEP_ICONS = [User, MessageCircle, Hand, Sparkles, Stethoscope];
const EASE = [0.16, 1, 0.3, 1] as const;

/** Maps the running chat stage (0–6) to which of the five left-hand steps is "live". */
const ACTIVE_STEP_FOR_STAGE = [0, 1, 1, 2, 2, 3, 4];

const ASSISTANT_TYPE_SPEED = 26; // ms per character
const PATIENT_TYPE_SPEED = 15;

/** Reveals `text` one character at a time once `active` is true. */
function useTypewriter(text: string, active: boolean, speed: number, instant: boolean) {
  const [output, setOutput] = useState(instant && active ? text : "");

  useEffect(() => {
    if (!active) {
      setOutput("");
      return;
    }
    if (instant) {
      setOutput(text);
      return;
    }
    let i = 0;
    setOutput("");
    const id = window.setInterval(() => {
      i += 1;
      setOutput(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, active, speed, instant]);

  return output;
}

/** Three bouncing dots — the "someone is typing" affordance used before each bubble. */
function TypingDots({ tone }: { tone: "assistant" | "patient" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-mx-lg px-4 py-3",
        tone === "assistant" ? "rounded-tl-sm bg-mx-surface-sunken" : "rounded-tr-sm bg-mx-green/70"
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn("h-1.5 w-1.5 rounded-full", tone === "assistant" ? "bg-mx-ink-muted" : "bg-mx-ink-inverse/80")}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function PatientExperience() {
  const { t } = useTranslation();
  const home = t.home.experience;
  const prefersReducedMotion = useReducedMotion();

  const fieldEntries: { label: string; value: string }[] = [
    { label: home.fields.chiefComplaint, value: home.fieldValues.chiefComplaint },
    { label: home.fields.symptoms, value: home.fieldValues.symptoms },
    { label: home.fields.medicalHistory, value: home.fieldValues.medicalHistory },
    { label: home.fields.medicines, value: home.fieldValues.medicines },
    { label: home.fields.allergies, value: home.fieldValues.allergies },
  ];

  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { once: true, amount: 0.5 });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setStage(6);
      return;
    }

    const assistantTypeMs = home.assistantPrompt.length * ASSISTANT_TYPE_SPEED;
    const patientTypeMs = home.patientReply.length * PATIENT_TYPE_SPEED;

    const schedule = [
      { stage: 1, at: 500 }, // assistant is typing…
      { stage: 2, at: 500 + 850 }, // assistant message appears, typewriter starts
      { stage: 3, at: 500 + 850 + assistantTypeMs + 550 }, // patient is typing…
      { stage: 4, at: 500 + 850 + assistantTypeMs + 550 + 850 }, // patient message appears
      { stage: 5, at: 500 + 850 + assistantTypeMs + 550 + 850 + patientTypeMs + 550 }, // "structures the info" label
      { stage: 6, at: 500 + 850 + assistantTypeMs + 550 + 850 + patientTypeMs + 550 + 400 }, // fields land
    ];

    const timers = schedule.map(({ stage: s, at }) => window.setTimeout(() => setStage(s), at));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, prefersReducedMotion, home.assistantPrompt, home.patientReply]);

  const assistantText = useTypewriter(home.assistantPrompt, stage >= 2, ASSISTANT_TYPE_SPEED, !!prefersReducedMotion);
  const patientText = useTypewriter(home.patientReply, stage >= 4, PATIENT_TYPE_SPEED, !!prefersReducedMotion);
  const activeStepIndex = ACTIVE_STEP_FOR_STAGE[stage] ?? 4;

  return (
    <section id="patient-experience" className="scroll-mt-28 bg-mx-bg py-20 sm:py-28" aria-labelledby="experience-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
            <ScrollReveal as="h2" variant={SlideUp} className="font-display max-w-md text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl">
              {home.heading}
            </ScrollReveal>
            <ScrollReveal as="p" variant={SlideUp} className="mt-4 max-w-md text-base text-mx-ink-soft">
              {home.subtext}
            </ScrollReveal>

            {/* Steps stay static markup but light up live, in sync with the chat on the right */}
            <ol className="mt-10 space-y-2">
              {home.steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                const isActive = i === activeStepIndex;
                const isDone = i < activeStepIndex;
                return (
                  <li key={step} className="flex items-center gap-4 rounded-mx-md px-2 py-1.5 transition-colors duration-500">
                    <motion.span
                      animate={{
                        scale: isActive ? 1.08 : 1,
                        backgroundColor: isActive || isDone ? "var(--mx-green)" : "var(--mx-green-soft)",
                        color: isActive || isDone ? "var(--mx-ink-inverse)" : "var(--mx-green-strong)",
                      }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    >
                      {isActive && !prefersReducedMotion && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border-2 border-mx-green"
                          animate={{ opacity: [0.7, 0], scale: [1, 1.5] }}
                          transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <Icon size={17} aria-hidden="true" />
                    </motion.span>
                    <p className={cn("text-sm font-semibold transition-colors duration-500 sm:text-base", isActive ? "text-mx-ink" : "text-mx-ink-soft")}>
                      {step}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Live mock chat */}
          <div ref={panelRef} className="rounded-mx-xl border border-mx-border bg-mx-surface-raised p-5 shadow-mx-lg sm:p-7">
            <div className="mb-5 flex items-center gap-2 border-b border-mx-border pb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-mx-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-mx-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-mx-green/70" />
              <p className="ml-2 text-xs font-semibold text-mx-ink-muted">{home.eyebrow}</p>
            </div>

            <div className="min-h-[19rem] space-y-3">
              {/* Assistant message */}
              <AnimatePresence mode="wait">
                {stage === 1 && (
                  <motion.div
                    key="assistant-typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-start gap-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                      <Sparkles size={14} aria-hidden="true" />
                    </span>
                    <TypingDots tone="assistant" />
                  </motion.div>
                )}
                {stage >= 2 && (
                  <motion.div
                    key="assistant-message"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-start gap-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                      <Sparkles size={14} aria-hidden="true" />
                    </span>
                    <div className="max-w-[85%] rounded-mx-lg rounded-tl-sm bg-mx-surface-sunken px-4 py-2.5 text-sm text-mx-ink">
                      {assistantText}
                      {stage === 2 && assistantText.length < home.assistantPrompt.length && (
                        <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-mx-ink-muted" aria-hidden="true" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Patient message */}
              <AnimatePresence mode="wait">
                {stage === 3 && (
                  <motion.div
                    key="patient-typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-start justify-end gap-2.5"
                  >
                    <TypingDots tone="patient" />
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-surface-sunken text-mx-ink-soft">
                      {!prefersReducedMotion && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border-2 border-mx-green"
                          animate={{ opacity: [0.8, 0], scale: [1, 1.6] }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <Mic size={14} aria-hidden="true" />
                    </span>
                  </motion.div>
                )}
                {stage >= 4 && (
                  <motion.div
                    key="patient-message"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-start justify-end gap-2.5"
                  >
                    <div className="max-w-[85%] rounded-mx-lg rounded-tr-sm bg-mx-green px-4 py-2.5 text-sm text-mx-ink-inverse">
                      {patientText}
                      {stage === 4 && patientText.length < home.patientReply.length && (
                        <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-mx-ink-inverse/70" aria-hidden="true" />
                      )}
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-surface-sunken text-mx-ink-soft">
                      <Mic size={14} aria-hidden="true" />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Structured summary */}
              <AnimatePresence>
                {stage >= 5 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="my-4 flex items-center gap-3 text-[11px] font-bold tracking-wide text-mx-ink-muted uppercase"
                  >
                    <span className="h-px flex-1 bg-mx-border" />
                    {home.steps[3]}
                    <span className="h-px flex-1 bg-mx-border" />
                  </motion.div>
                )}
              </AnimatePresence>

              {stage >= 6 && (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {fieldEntries.map((field, i) => (
                    <motion.div
                      key={field.label}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: EASE, delay: i * 0.09 }}
                      className="rounded-mx-md border border-mx-border bg-mx-surface p-3 transition-shadow duration-300 hover:shadow-mx-sm"
                    >
                      <p className="text-[10px] font-bold tracking-wide text-mx-purple uppercase">{field.label}</p>
                      <p className="mt-1 text-xs font-semibold text-mx-ink">{field.value}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
