import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Hand, Mic, Stethoscope, Thermometer, Wind, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { SlideUp } from "../home/motion";
import { Waveform } from "../home/Waveform";
import { cn } from "../../../utils/cn";

const CHIP_ICONS: LucideIcon[] = [Thermometer, Zap, Wind, Stethoscope];
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * SECTION 3 — AI HEALTH ASSISTANT
 * A guided clinical interview panel — deliberately not a chat bubble UI.
 * Progress is expressed as a clinical step + completion readout rather than
 * a conversational thread, so it reads as structured history-taking.
 */
export function FeaturesAiAssistant() {
  const { t } = useTranslation();
  const home = t.features.aiAssistant;
  const prefersReducedMotion = useReducedMotion();
  const [activeChip, setActiveChip] = useState<number | null>(null);

  const chips = [
    { key: "fever", label: home.options.fever },
    { key: "pain", label: home.options.pain },
    { key: "cough", label: home.options.cough },
    { key: "weakness", label: home.options.weakness },
  ];

  return (
    <section className="bg-mx-surface/70 py-16 sm:py-24" aria-labelledby="ai-assistant-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
            <RevealHeading
              as="h2"
              id="ai-assistant-heading"
              lines={[home.heading]}
              className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
            />
            <ScrollReveal as="p" variant={SlideUp} className="mt-5 max-w-md text-base leading-relaxed text-mx-ink-soft">
              {home.description}
            </ScrollReveal>
          </div>

          {/* Guided clinical interview mockup */}
          <ScrollReveal variant={SlideUp} amount={0.2}>
            <div className="relative overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-6 shadow-mx-lg sm:p-7">
              {/* Header: assistant identity + clinical step badge */}
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                  <Stethoscope size={18} aria-hidden="true" />
                </span>
                <p className="font-display min-w-0 flex-1 truncate text-sm font-bold text-mx-ink">{home.panelTitle}</p>
                <span className="shrink-0 rounded-full border border-mx-border-strong bg-mx-surface px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-mx-ink-soft">
                  {home.stepLabel}
                </span>
              </div>

              {/* Progress readout */}
              <div className="mb-6">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-mx-ink-muted">
                  <span>{home.progressLabel}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-mx-surface-sunken">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-mx-green to-mx-blue"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 0.42 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 1, ease: EASE }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </div>

              {/* The clinical question */}
              <p className="font-display mb-5 text-lg font-semibold text-mx-ink">{home.question}</p>

              {/* Voice option */}
              <div className="mb-5 flex items-center gap-4 rounded-mx-md border border-mx-border bg-mx-surface px-4 py-3.5">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                  {!prefersReducedMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-2 border-mx-green"
                      animate={{ opacity: [0.6, 0], scale: [1, 1.5] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <Mic size={15} aria-hidden="true" />
                </span>
                <Waveform className="flex h-8 flex-1 items-end justify-center gap-1" />
                <button
                  type="button"
                  className="shrink-0 rounded-mx-sm bg-mx-green px-3.5 py-2 text-xs font-bold whitespace-nowrap text-mx-ink-inverse shadow-mx-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-mx-green-strong hover:shadow-mx-md active:translate-y-0"
                >
                  {home.startSpeaking}
                </button>
              </div>

              {/* Touch option */}
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-mx-ink-muted uppercase">
                  <Hand size={12} aria-hidden="true" />
                  {home.answerByTouch}
                </p>
                <StaggerGroup className="grid grid-cols-2 gap-2.5" stagger={0.08} amount={0.4}>
                  {chips.map((chip, i) => {
                    const Icon = CHIP_ICONS[i];
                    const isActive = activeChip === i;
                    return (
                      <StaggerItem key={chip.key} variant={SlideUp}>
                        <button
                          type="button"
                          onClick={() => setActiveChip(i)}
                          aria-pressed={isActive}
                          className={cn(
                            "group flex w-full items-center gap-2 rounded-mx-md border px-3.5 py-2.5 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0",
                            isActive
                              ? "border-mx-blue bg-mx-blue-soft text-mx-blue shadow-mx-sm"
                              : "border-mx-border bg-mx-surface text-mx-ink-soft hover:border-mx-border-strong hover:shadow-mx-sm"
                          )}
                        >
                          <Icon size={14} aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:scale-110" />
                          {chip.label}
                        </button>
                      </StaggerItem>
                    );
                  })}
                </StaggerGroup>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}