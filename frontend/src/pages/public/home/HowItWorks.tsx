import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Cpu,
  FileCheck2,
  IdCard,
  Mic,
  Sparkles,
  Stethoscope,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { StaggerGroup, StaggerItem } from "./Reveal";
import { cn } from "../../../utils/cn";

const STEP_ICONS: LucideIcon[] = [UserPlus, Mic, UploadCloud, Cpu, Sparkles, Stethoscope, FileCheck2, IdCard];
const EASE = [0.16, 1, 0.3, 1] as const;

/** Tiny mock "screen" content per step — deliberately simple shapes, not literal UI, so the panel reads as illustration rather than a real product screenshot. Each has its own small, looping animation so the panel always feels alive, not just cross-faded. */
function StepVisual({ index, reduced }: { index: number; reduced: boolean }) {
  switch (index) {
    case 0: // Register
      return (
        <div className="space-y-3">
          <div className="h-2.5 w-2/3 rounded-full bg-mx-surface-sunken" />
          <div className="h-9 rounded-mx-sm border border-mx-border bg-mx-surface" />
          <div className="h-9 rounded-mx-sm border border-mx-border bg-mx-surface" />
          <motion.div
            className="mt-4 inline-flex items-center gap-2 rounded-mx-sm bg-mx-green-soft px-3 py-1.5 text-[11px] font-bold text-mx-green-strong"
            animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
            transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <IdCard size={12} aria-hidden="true" /> MED-26-001245
          </motion.div>
        </div>
      );
    case 1: // Tell your story
      return (
        <div className="space-y-2.5">
          <div className="flex h-10 items-end justify-center gap-[3px]" aria-hidden="true">
            {[0.4, 0.7, 1, 0.5, 0.85, 0.35, 0.65, 0.55, 0.8, 0.45].map((h, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-mx-green"
                style={{ height: `${h * 2.5}rem` }}
                animate={reduced ? undefined : { scaleY: [0.5, 1, 0.6, 0.9, 0.5] }}
                transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }}
              />
            ))}
          </div>
          <div className="mx-auto max-w-[85%] rounded-mx-lg rounded-tl-sm bg-mx-surface-sunken px-3.5 py-2 text-xs text-mx-ink-soft">
            "Tell me what brought you here today."
          </div>
        </div>
      );
    case 2: // Add documents — the scanning step
      return (
        <div className="space-y-2">
          <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-mx-md border-2 border-dashed border-mx-border-strong text-mx-ink-muted">
            <UploadCloud size={22} aria-hidden="true" />
            {!reduced && (
              <motion.div
                className="pointer-events-none absolute inset-x-0 h-8"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(42,111,224,0.25) 45%, rgba(42,111,224,0.55) 50%, rgba(42,111,224,0.25) 55%, transparent)",
                }}
                animate={{ top: ["-20%", "100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex gap-2">
            <motion.div
              className="h-8 flex-1 rounded-mx-sm bg-mx-surface-sunken"
              animate={reduced ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-8 flex-1 rounded-mx-sm bg-mx-surface-sunken"
              animate={reduced ? undefined : { opacity: [1, 0.5, 1] }}
              transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      );
    case 3: // Structures it
      return (
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-10 rounded-mx-sm border border-mx-border bg-mx-surface"
              initial={{ opacity: 0.3, scale: 0.92 }}
              animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], scale: [0.92, 1, 0.92] }}
              transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          ))}
        </div>
      );
    case 4: // AI summary
      return (
        <div className="space-y-2">
          {[0.9, 0.7, 0.8, 0.5].map((w, i) => (
            <motion.div
              key={i}
              className="h-2.5 origin-left rounded-full bg-mx-purple-soft"
              style={{ width: `${w * 100}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
            />
          ))}
        </div>
      );
    case 5: // Doctor review
      return (
        <div className="flex items-center gap-3">
          <motion.span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue"
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Stethoscope size={17} aria-hidden="true" />
          </motion.span>
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-3/4 rounded-full bg-mx-surface-sunken" />
            <div className="h-2.5 w-1/2 rounded-full bg-mx-surface-sunken" />
          </div>
        </div>
      );
    case 6: // Final report
      return (
        <div className="space-y-2 rounded-mx-md border border-mx-border bg-mx-surface p-3">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-1/3 rounded-full bg-mx-surface-sunken" />
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
            >
              <FileCheck2 size={15} className="text-mx-green-strong" aria-hidden="true" />
            </motion.span>
          </div>
          <div className="h-2 w-full rounded-full bg-mx-surface-sunken" />
          <div className="h-2 w-4/5 rounded-full bg-mx-surface-sunken" />
        </div>
      );
    default: // Save & access — real, scannable QR code
      return (
        <div className="relative mx-auto flex max-w-[10rem] flex-col items-center gap-2 rounded-mx-md border border-mx-border bg-mx-surface p-4">
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-mx-md bg-mx-green/15 blur-md"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <div className="relative rounded-mx-sm bg-white p-1.5">
            <QRCodeSVG value="MEDIKIOSK:MED-26-001245" size={56} bgColor="transparent" fgColor="#0B1220" level="M" />
          </div>
          <p className="font-mono relative text-[10px] font-bold text-mx-ink-muted">MED-26-001245</p>
        </div>
      );
  }
}

/**
 * SECTION 10 — HOW IT WORKS
 * The cinematic centerpiece: on desktop, a pinned product panel steps
 * through eight screens as the step list scrolls past on the left, each
 * with its own small looping animation. On touch devices, the same eight
 * steps render as an animated vertical timeline instead.
 */
export function HowItWorks() {
  const { t } = useTranslation();
  const home = t.home.phase2.workflow;
  const prefersReducedMotion = useReducedMotion();
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const stepCount = home.steps.length;

  const { scrollYProgress } = useScroll({
    target: scrollWrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!Number.isFinite(v)) return;
    const idx = Math.min(stepCount - 1, Math.max(0, Math.floor(v * stepCount)));
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  const ActiveIcon = STEP_ICONS[activeIndex];

  return (
    <section id="how-it-works" className="relative scroll-mt-28 bg-mx-bg-canvas py-14 sm:py-20" aria-labelledby="workflow-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-purple uppercase">{home.eyebrow}</p>
        <RevealHeading
          as="h2"
          id="workflow-heading"
          lines={[home.headline]}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
        />
        <p className="mt-4 text-base text-mx-ink-soft">{home.subtext}</p>
      </div>

      {/* Desktop: pinned scroll-driven journey */}
      <div ref={scrollWrapperRef} className="relative mt-14 hidden lg:block" style={{ height: `${stepCount * 62}vh` }}>
        <div className="sticky top-20 mx-auto grid max-w-6xl grid-cols-2 gap-14 px-6" style={{ height: "calc(100vh - 7rem)" }}>
          {/* Left: numbered step list, current step highlighted */}
          <div className="flex flex-col justify-center">
            <ol className="space-y-1">
              {home.steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                const active = i === activeIndex;
                return (
                  <li key={step.title} className="flex items-start gap-4 rounded-mx-md px-3 py-3 transition-opacity duration-300" style={{ opacity: active ? 1 : 0.4 }}>
                    <motion.span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        active ? "bg-mx-purple text-mx-ink-inverse" : "bg-mx-surface-sunken text-mx-ink-muted",
                      )}
                      animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </motion.span>
                    <div>
                      <p className="text-[11px] font-bold tracking-wide text-mx-ink-muted uppercase">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="font-display text-base font-bold text-mx-ink">{step.title}</p>
                      <p className="text-sm text-mx-ink-soft">{step.subtitle}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right: sticky product visualization, swaps per active step */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-mx-xl border border-mx-border bg-mx-surface-raised p-6 shadow-mx-lg">
              <div className="mb-5 flex items-center gap-2.5 border-b border-mx-border pb-4">
                <motion.span
                  key={`icon-${activeIndex}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-purple-soft text-mx-purple"
                  initial={{ scale: 0.7, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <ActiveIcon size={15} aria-hidden="true" />
                </motion.span>
                <p className="text-sm font-bold text-mx-ink">{home.steps[activeIndex].screenLabel}</p>
                <span className="ml-auto text-[11px] font-bold text-mx-ink-muted">
                  {String(activeIndex + 1).padStart(2, "0")}/{String(stepCount).padStart(2, "0")}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="min-h-[9rem]"
                >
                  <StepVisual index={activeIndex} reduced={!!prefersReducedMotion} />
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex gap-1.5" aria-hidden="true">
                {home.steps.map((step, i) => (
                  <span
                    key={step.title}
                    className={cn("h-1 flex-1 rounded-full transition-colors duration-300", i <= activeIndex ? "bg-mx-purple" : "bg-mx-border")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: animated vertical timeline */}
      <div className="relative mt-12 px-4 sm:px-6 lg:hidden">
        <div className="pointer-events-none absolute top-2 bottom-2 left-[2.55rem] w-px bg-mx-border" aria-hidden="true" />
        <motion.div
          className="pointer-events-none absolute top-2 bottom-2 left-[2.55rem] w-px origin-top bg-gradient-to-b from-mx-purple via-mx-blue to-mx-green"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.4, ease: EASE }}
          aria-hidden="true"
        />

        <StaggerGroup as="ol" className="relative space-y-4" stagger={0.1} amount={0.15}>
          {home.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <StaggerItem
                key={step.title}
                as="li"
                variant={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}
              >
                <div className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-5 shadow-mx-sm">
                  <div className="flex items-center gap-3">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-purple-soft text-mx-purple">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold tracking-wide text-mx-ink-muted uppercase">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="font-display text-base font-bold text-mx-ink">{step.title}</p>
                      <p className="text-sm text-mx-ink-soft">{step.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-mx-md bg-mx-surface-sunken/60 p-3.5">
                    <StepVisual index={i} reduced={!!prefersReducedMotion} />
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}