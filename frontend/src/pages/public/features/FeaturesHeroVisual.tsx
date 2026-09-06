import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, CircleUserRound, Clock, FileText, Mic, QrCode, ShieldCheck } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { Waveform } from "../home/Waveform";

const EASE = [0.16, 1, 0.3, 1] as const;

const row = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function FeaturesHeroVisual() {
  const { t } = useTranslation();
  const v = t.home.hero.visual;
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(prefersReducedMotion ? 4 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const stages = [0, 1, 2, 3, 4];
    const timeouts: number[] = [];
    stages.forEach((s, idx) => {
      const t0 = window.setTimeout(() => setStep(s), 500 + idx * 650);
      timeouts.push(t0);
    });
    return () => timeouts.forEach(window.clearTimeout);
  }, [prefersReducedMotion]);

  const show = (n: number) => prefersReducedMotion || step >= n;

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="relative overflow-hidden rounded-mx-xl border border-mx-border-strong bg-mx-surface-raised/95 p-5 shadow-mx-lg backdrop-blur-md sm:p-6">
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
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-mx-green/30 bg-mx-green-soft px-2.5 py-1 text-[10px] font-bold text-mx-green-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-mx-green" aria-hidden="true" />
            Active
          </span>
        </motion.div>

        <motion.div initial="hidden" animate={show(1) ? "show" : "hidden"} variants={row}>
          <Waveform active={show(1)} className="flex h-14 items-end justify-center gap-1" />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={show(2) ? "show" : "hidden"}
          variants={row}
          className="mt-5 grid grid-cols-3 gap-2.5"
        >
          <div className="flex items-center gap-2 rounded-mx-md border border-mx-border-strong bg-mx-surface/95 px-2.5 py-2.5 backdrop-blur-md transition-colors hover:border-mx-green/40">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mx-purple-soft text-mx-purple">
              <CircleUserRound size={14} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8px] font-bold tracking-wide text-mx-ink-muted uppercase">
                {v.patientProfile}
              </p>
              <p className="truncate text-[10px] font-semibold text-mx-ink">{v.patientProfileValue}</p>
            </div>
            <ChevronRight size={12} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2 rounded-mx-md border border-mx-border-strong bg-mx-surface/95 px-2.5 py-2.5 backdrop-blur-md transition-colors hover:border-mx-green/40">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
              <Clock size={14} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8px] font-bold tracking-wide text-mx-ink-muted uppercase">{v.timeline}</p>
              <p className="truncate text-[10px] font-semibold text-mx-ink">{v.timelineValue}</p>
            </div>
            <ChevronRight size={12} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2 rounded-mx-md border border-mx-border-strong bg-mx-surface/95 px-2.5 py-2.5 backdrop-blur-md transition-colors hover:border-mx-green/40">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
              <FileText size={14} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8px] font-bold tracking-wide text-mx-ink-muted uppercase">{v.reports}</p>
              <p className="truncate text-[10px] font-semibold text-mx-ink">{v.reportsValue}</p>
            </div>
            <ChevronRight size={12} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={show(3) ? "show" : "hidden"}
          variants={row}
          className="mt-3 flex items-center justify-between gap-3 rounded-mx-md border border-mx-green/30 bg-mx-green-soft/40 px-3.5 py-3"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <ShieldCheck size={16} className="shrink-0 text-mx-green-strong" aria-hidden="true" />
            <p className="truncate text-xs font-semibold text-mx-ink">{v.doctorVerificationValue}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mx-green px-2.5 py-1 text-[10px] font-bold text-mx-ink-inverse">
            Verified
          </span>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate={show(4) ? "show" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 16, scale: 0.96 },
          show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
        }}
        className="absolute -bottom-6 -left-6 hidden w-56 items-center gap-3 rounded-mx-lg border border-mx-border-strong bg-mx-surface/95 p-3.5 shadow-mx-md backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:flex"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-mx-sm bg-mx-purple-soft text-mx-purple">
          <QrCode size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold tracking-wide text-mx-purple uppercase">{v.healthId}</p>
          <p className="truncate text-xs font-semibold text-mx-ink">{v.healthIdValue}</p>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mx-border text-mx-ink-soft">
          <QrCode size={12} aria-hidden="true" />
        </span>
      </motion.div>
    </div>
  );
}