import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { CircleUserRound, Clock, FileText, Hand, Mic, QrCode, ShieldCheck } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { Waveform } from "./Waveform";

const EASE = [0.16, 1, 0.3, 1] as const;

const row = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/**
 * Cinematic hero product preview — a single premium panel that quietly
 * assembles itself: the AI Assistant greets, listens, then a patient's
 * profile, timeline, report, doctor verification and Health ID arrive one
 * at a time, echoing the real MediKiosk product surface without being a
 * generic SaaS dashboard mockup.
 *
 * Sequence: preview enters → assistant appears → waveform activates →
 * patient info → timeline → report → doctor verification → health ID.
 * The sequence then rests, briefly showing the mode toggle (Voice / Touch)
 * before looping — but the loop is slow and reduced-motion safe.
 */
export function HeroProductVisual() {
  const { t } = useTranslation();
  const v = t.home.hero.visual;
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(prefersReducedMotion ? 6 : 0);
  const [mode, setMode] = useState<"voice" | "touch">("voice");

  // Step choreography — each stage appears a beat after the previous one,
  // then the sequence rests before gently looping the mode indicator only
  // (never the whole card), so it stays "alive" without being distracting.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const stages = [0, 1, 2, 3, 4, 5, 6];
    let i = 0;
    const timeouts: number[] = [];
    stages.forEach((s, idx) => {
      const t0 = window.setTimeout(() => setStep(s), 500 + idx * 650);
      timeouts.push(t0);
    });
    i = stages.length;
    const loop = window.setInterval(() => {
      setMode((m) => (m === "voice" ? "touch" : "voice"));
    }, 4200);
    return () => {
      timeouts.forEach(window.clearTimeout);
      window.clearInterval(loop);
      void i;
    };
  }, [prefersReducedMotion]);

  const show = (n: number) => prefersReducedMotion || step >= n;

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="relative overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-5 shadow-mx-lg sm:p-6">
        {/* Header — AI Health Assistant + live status dot */}
        <motion.div
          initial="hidden"
          animate={show(0) ? "show" : "hidden"}
          variants={row}
          className="mb-5 flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
            <Mic size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display truncate text-sm font-bold text-mx-ink">{v.assistant}</p>
            <p className="text-xs text-mx-ink-muted">{v.assistantStatus}</p>
          </div>
          <span className="ml-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-mx-green" aria-hidden="true" />
        </motion.div>

        {/* Waveform — activates right after the assistant appears */}
        <motion.div initial="hidden" animate={show(1) ? "show" : "hidden"} variants={row}>
          <Waveform active={show(1)} className="flex h-14 items-end justify-center gap-1" />
        </motion.div>

        {/* Patient profile */}
        <motion.div
          initial="hidden"
          animate={show(2) ? "show" : "hidden"}
          variants={row}
          className="mt-5 flex items-center gap-3 rounded-mx-md border border-mx-border bg-mx-surface px-3.5 py-3 transition-colors hover:border-mx-border-strong"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-purple-soft text-mx-purple">
            <CircleUserRound size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wide text-mx-ink-muted uppercase">{v.patientProfile}</p>
            <p className="truncate text-xs font-semibold text-mx-ink">{v.patientProfileValue}</p>
          </div>
        </motion.div>

        {/* Timeline + Reports — side by side */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <motion.div
            initial="hidden"
            animate={show(3) ? "show" : "hidden"}
            variants={row}
            className="rounded-mx-md border border-mx-border bg-mx-surface px-3 py-2.5 transition-colors hover:border-mx-border-strong"
          >
            <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
              <Clock size={13} aria-hidden="true" />
            </span>
            <p className="text-[9px] font-bold tracking-wide text-mx-ink-muted uppercase">{v.timeline}</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-mx-ink">{v.timelineValue}</p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={show(4) ? "show" : "hidden"}
            variants={row}
            className="rounded-mx-md border border-mx-border bg-mx-surface px-3 py-2.5 transition-colors hover:border-mx-border-strong"
          >
            <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
              <FileText size={13} aria-hidden="true" />
            </span>
            <p className="text-[9px] font-bold tracking-wide text-mx-ink-muted uppercase">{v.reports}</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-mx-ink">{v.reportsValue}</p>
          </motion.div>
        </div>

        {/* Doctor verification */}
        <motion.div
          initial="hidden"
          animate={show(5) ? "show" : "hidden"}
          variants={row}
          className="mt-3 flex items-center gap-3 rounded-mx-md border border-mx-green/30 bg-mx-green-soft/40 px-3.5 py-2.5"
        >
          <ShieldCheck size={16} className="shrink-0 text-mx-green-strong" aria-hidden="true" />
          <p className="truncate text-xs font-semibold text-mx-ink">{v.doctorVerificationValue}</p>
        </motion.div>

        {/* Mode toggle — Voice / Touch, gently alternating */}
        <motion.div
          initial="hidden"
          animate={show(6) ? "show" : "hidden"}
          variants={row}
          className="mt-5 flex items-center gap-2 border-t border-mx-border pt-4"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mode}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="inline-flex items-center gap-1.5 rounded-full bg-mx-surface-sunken px-3 py-1.5 text-xs font-semibold text-mx-ink-soft"
            >
              {mode === "voice" ? (
                <Mic size={13} aria-hidden="true" />
              ) : (
                <Hand size={13} aria-hidden="true" />
              )}
              {mode === "voice" ? v.voiceMode : v.touchMode}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Health ID card — tucked behind the main panel, arrives last */}
      <motion.div
        initial="hidden"
        animate={show(6) ? "show" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 16, scale: 0.96 },
          show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
        }}
        className="absolute -bottom-6 -left-6 hidden w-48 rounded-mx-lg border border-mx-border bg-mx-surface p-3.5 shadow-mx-md transition-transform hover:-translate-y-0.5 sm:block"
      >
        <div className="flex items-center gap-2">
          <QrCode size={16} className="shrink-0 text-mx-purple" aria-hidden="true" />
          <p className="text-[10px] font-bold tracking-wide text-mx-purple uppercase">{v.healthId}</p>
        </div>
        <p className="mt-1.5 truncate text-xs font-semibold text-mx-ink">{v.healthIdValue}</p>
      </motion.div>
    </div>
  );
}
