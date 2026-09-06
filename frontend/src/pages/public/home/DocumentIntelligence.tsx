import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronDown, Droplet, FileSearch, FileText, LayoutGrid, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { SlideUp } from "./motion";

const STAGE_ICONS: LucideIcon[] = [FileText, ScanLine, FileSearch, LayoutGrid];
const EASE = [0.16, 1, 0.3, 1] as const;
const SCAN_DURATION = 1.9; // seconds — matches the scan-line sweep below

/** All eight blood groups. Illustrative only — none is pre-selected or highlighted by
 * default. "B+" gets a distinctive animated glow, but strictly on hover; nothing here
 * is auto-applied or permanent. */
const BLOOD_GROUPS = ["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−"] as const;
const HOVER_GLOW_GROUP: (typeof BLOOD_GROUPS)[number] = "B+";

/**
 * A single blood-group chip. Neutral, unselected by default — no group is
 * ever pre-highlighted. Every chip gets a plain, professional hover lift;
 * "B+" additionally gets a soft animated glow, but only while the pointer is
 * actually over it (whileHover), so it can never flash, auto-trigger, or
 * stay permanently active.
 */
function BloodGroupChip({ group, glow, reduceMotion }: { group: string; glow: boolean; reduceMotion: boolean }) {
  return (
    <motion.span
      whileHover={
        reduceMotion
          ? undefined
          : glow
            ? {
                scale: 1.1,
                y: -2,
                boxShadow: "0 0 0 1px rgba(211,69,59,0.55), 0 0 18px 4px rgba(211,69,59,0.4)",
              }
            : { scale: 1.06, y: -2 }
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={
        "relative flex items-center justify-center rounded-full border border-mx-border bg-mx-surface-raised py-1.5 text-xs font-bold text-mx-ink-muted transition-colors duration-200 ease-out " +
        (glow ? "hover:border-mx-danger hover:text-mx-danger" : "hover:border-mx-border-strong hover:text-mx-ink")
      }
    >
      {group}
    </motion.span>
  );
}

/**
 * SECTION 13 — DOCUMENT INTELLIGENCE
 * A document visibly scans top-to-bottom, a live progress readout ticks up,
 * and once the scan completes the raw page cross-fades into its structured,
 * extracted values. All figures are explicitly labeled as illustrative demo
 * data, never presented as real lab results.
 */
export function DocumentIntelligence() {
  const { t } = useTranslation();
  const home = t.home.phase2.documentIntel;
  const prefersReducedMotion = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.4 });
  const [resolved, setResolved] = useState(false);
  const [progress, setProgress] = useState(0);
  // Closed by default, and only ever toggled by an explicit click — never by
  // scrolling/inView — so the section can't auto-expand or shift the page.
  const [showBloodGroup, setShowBloodGroup] = useState(false);

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

  return (
    <section className="overflow-hidden bg-mx-bg-canvas py-14 sm:py-20" aria-labelledby="docintel-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
            <RevealHeading
              as="h2"
              id="docintel-heading"
              lines={[home.headline]}
              className="font-display max-w-md text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
            />
            <ScrollReveal as="p" variant={SlideUp} className="mt-4 max-w-md text-base text-mx-ink-soft">
              {home.subtext}
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
              className="relative overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-6 shadow-mx-lg transition-shadow duration-300 ease-out hover:shadow-mx-xl"
            >
              <div className="mb-5 flex items-center gap-2.5 border-b border-mx-border pb-4">
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
                  <FileText size={15} aria-hidden="true" />
                </span>

                {/* Blood-drop mark — pulses like a heartbeat while the scan is live */}
                <span className="relative -ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                  {!showResolved && !prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-mx-danger/35"
                      animate={{ scale: [1, 1.9, 1], opacity: [0.55, 0, 0.55] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-mx-danger-soft text-mx-danger">
                    <Droplet size={12} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </span>

                <p className="text-sm font-bold text-mx-ink">{home.sampleDoc}</p>

                <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-mx-ink-muted">
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
                    <motion.div
                      key="skeleton"
                      className="space-y-2.5"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      {[0.85, 0.65, 0.9, 0.5, 0.75].map((w, i) => (
                        <div key={i} className="h-2.5 rounded-full bg-mx-surface-sunken" style={{ width: `${w * 100}%` }} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="values"
                      className="grid grid-cols-3 gap-2.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      {home.values.map((v, i) => (
                        <motion.div
                          key={v.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
                          className="flex flex-col items-center gap-0.5 rounded-mx-md border border-mx-border bg-mx-surface-raised p-3 text-center"
                        >
                          <p className="text-[10px] font-bold tracking-wide text-mx-blue uppercase">{v.label}</p>
                          <p className="text-xs font-semibold text-mx-ink">{v.value}</p>
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-mx-green" aria-hidden="true" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Drifting blood-cell particles — reinforce the "blood scan" read while it's live */}
                {!showResolved && !prefersReducedMotion && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    {[...Array(7)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute rounded-full bg-mx-danger/30"
                        style={{
                          width: 5 + (i % 3) * 2,
                          height: 5 + (i % 3) * 2,
                          left: `${(i * 13 + 6) % 92}%`,
                        }}
                        animate={{ top: ["-10%", "110%"], opacity: [0, 0.7, 0] }}
                        transition={{
                          duration: 2.4 + (i % 4) * 0.4,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.28,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* traveling scan line — glowing, realistic laser sweep */}
                {!showResolved && !prefersReducedMotion && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 h-10"
                    style={{
                      background: "linear-gradient(to bottom, transparent, rgba(211,69,59,0.22) 45%, rgba(211,69,59,0.55) 50%, rgba(211,69,59,0.22) 55%, transparent)",
                      boxShadow: "0 0 12px rgba(211,69,59,0.35)",
                    }}
                    animate={{ top: ["-10%", "100%"] }}
                    transition={{ duration: SCAN_DURATION, ease: "linear" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Blood group panel — closed by default. It only appears once the scan has
                  resolved, and even then stays collapsed until the visitor clicks to open
                  it; nothing here reacts to scrolling/inView, so the page never jumps and
                  no group is ever pre-selected. */}
              {showResolved && (
                <div className="mt-4 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface">
                  <button
                    type="button"
                    onClick={() => setShowBloodGroup((v) => !v)}
                    aria-expanded={showBloodGroup}
                    className="flex w-full items-center gap-1.5 px-3.5 py-3 text-left text-[10px] font-bold tracking-wide text-mx-danger uppercase transition-colors duration-200 ease-out hover:bg-mx-surface-sunken"
                  >
                    <Droplet size={11} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                    Blood Group
                    <ChevronDown
                      size={13}
                      aria-hidden="true"
                      className={
                        "ml-auto text-mx-ink-muted transition-transform duration-300 ease-out " +
                        (showBloodGroup ? "rotate-180" : "")
                      }
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {showBloodGroup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-4 gap-1.5 px-3.5 pb-3.5">
                          {BLOOD_GROUPS.map((group) => (
                            <BloodGroupChip
                              key={group}
                              group={group}
                              glow={group === HOVER_GLOW_GROUP}
                              reduceMotion={!!prefersReducedMotion}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <p className="mt-4 text-center text-[11px] text-mx-ink-muted">{home.demoNote}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}