import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { CheckCircle2, FileSearch, FileText, LayoutGrid, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { SlideUp } from "../home/motion";

const STAGE_ICONS: LucideIcon[] = [FileText, ScanLine, FileSearch, LayoutGrid];
const EASE = [0.16, 1, 0.3, 1] as const;
const SCAN_DURATION = 1.9;

/**
 * SECTION 6 — MEDICAL DOCUMENT INTELLIGENCE
 * A document visibly scans, a progress readout ticks up, and once resolved
 * the raw page cross-fades into structured, extracted fields. All values
 * are explicitly illustrative demo data — no real OCR or backend calls.
 */
export function FeaturesDocumentIntel() {
  const { t } = useTranslation();
  const home = t.features.documentIntel;
  const prefersReducedMotion = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.4 });
  const [resolved, setResolved] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / (SCAN_DURATION * 1000)) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setResolved(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, prefersReducedMotion]);

  const showResolved = resolved || !!prefersReducedMotion;
  const displayProgress = prefersReducedMotion ? 100 : progress;

  const values = [
    { label: home.fields.diagnosis, value: home.fieldValues.diagnosis },
    { label: home.fields.testResults, value: home.fieldValues.testResults },
    { label: home.fields.medicines, value: home.fieldValues.medicines },
    { label: home.fields.findings, value: home.fieldValues.findings },
  ];

  return (
    <section className="overflow-hidden bg-mx-bg-canvas/68 py-16 sm:py-24" aria-labelledby="docintel-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
            <RevealHeading
              as="h2"
              id="docintel-heading"
              lines={[home.heading]}
              className="font-display max-w-md text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
            />
            <ScrollReveal as="p" variant={SlideUp} className="mt-4 max-w-md text-base text-mx-ink-soft">
              {home.description}
            </ScrollReveal>

            <StaggerGroup as="ol" className="mt-8 flex flex-wrap gap-3" stagger={0.12}>
              {home.stages.map((stage, i) => {
                const Icon = STAGE_ICONS[i];
                return (
                  <StaggerItem key={stage} as="li" variant={SlideUp}>
                    <span
                      className={
                        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-500 " +
                        (showResolved || i === 0
                          ? "border-mx-blue/40 bg-mx-blue-soft text-mx-blue"
                          : "border-mx-border bg-mx-surface text-mx-ink-soft")
                      }
                    >
                      <Icon size={13} aria-hidden="true" />
                      {stage}
                    </span>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>

          {/* Scanning → resolved document mock */}
          <ScrollReveal variant={SlideUp} amount={0.2}>
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-6 shadow-mx-lg"
            >
              <div className="mb-5 flex items-center gap-2.5 border-b border-mx-border pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                  <FileText size={15} aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-bold text-mx-ink">{home.sampleDoc}</p>

                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-mx-ink-muted">
                  <AnimatePresence mode="wait" initial={false}>
                    {showResolved ? (
                      <motion.span
                        key="done"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 text-mx-green-strong"
                      >
                        <CheckCircle2 size={13} aria-hidden="true" /> 100%
                      </motion.span>
                    ) : (
                      <motion.span key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {displayProgress}%
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </div>

              <div className="relative min-h-[8.5rem] overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface p-4">
                <AnimatePresence mode="wait">
                  {!showResolved ? (
                    <motion.div key="skeleton" className="space-y-2.5" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                      {[0.85, 0.65, 0.9, 0.5, 0.75].map((w, i) => (
                        <div key={i} className="h-2.5 rounded-full bg-mx-surface-sunken" style={{ width: `${w * 100}%` }} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="values"
                      className="grid grid-cols-2 gap-2.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      {values.map((v, i) => (
                        <motion.div
                          key={v.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
                          className="flex flex-col items-start gap-0.5 rounded-mx-md border border-mx-border bg-mx-surface-raised p-3"
                        >
                          <p className="text-[10px] font-bold tracking-wide text-mx-blue uppercase">{v.label}</p>
                          <p className="truncate text-xs font-semibold text-mx-ink">{v.value}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* traveling scan line */}
                {!showResolved && !prefersReducedMotion && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 h-10"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, rgba(42,111,224,0.18) 45%, rgba(42,111,224,0.45) 50%, rgba(42,111,224,0.18) 55%, transparent)",
                      boxShadow: "0 0 12px rgba(42,111,224,0.3)",
                    }}
                    animate={{ top: ["-10%", "100%"] }}
                    transition={{ duration: SCAN_DURATION, ease: "linear" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <p className="mt-4 text-center text-[11px] text-mx-ink-muted">{home.demoNote}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}