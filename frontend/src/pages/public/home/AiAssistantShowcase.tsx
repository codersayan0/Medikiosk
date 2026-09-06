import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Hand,
  Mic,
  MessageCircle,
  RotateCcw,
  SkipForward,
  Square,
  Undo2,
} from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { FadeIn, SlideUp } from "./motion";
import { Waveform } from "./Waveform";
import { cn } from "../../../utils/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
type Tab = "conversation" | "voice" | "touch";

/**
 * SECTION — AI HEALTH ASSISTANT SHOWCASE (Phase 2)
 * A homepage product preview (not the live patient assistant) explaining how
 * MediKiosk's guided intake works. Three switchable demos share one frame:
 * a step-by-step conversation with a live progress bar, a calm voice-mode
 * state machine, and a touch-mode mood-card flow — all converging on the
 * same idea: however you answer, MediKiosk turns it into one structured
 * health history a doctor can trust.
 */
export function AiAssistantShowcase() {
  const { t } = useTranslation();
  const home = t.home.aiShowcase;
  const prefersReducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("conversation");

  const TABS: { id: Tab; label: string; Icon: typeof MessageCircle }[] = [
    { id: "conversation", label: home.tabs.conversation, Icon: MessageCircle },
    { id: "voice", label: home.tabs.voice, Icon: Mic },
    { id: "touch", label: home.tabs.touch, Icon: Hand },
  ];

  return (
    <section className="relative overflow-hidden bg-mx-bg-canvas py-20 sm:py-28" aria-labelledby="ai-showcase-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-purple uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="ai-showcase-heading"
            lines={home.headline}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} amount={0.5} className="mx-auto mt-5 max-w-xl text-base text-mx-ink-soft">
            {home.subtext}
          </ScrollReveal>
        </div>

        {/* Voice / Touch → Understands → Structured — the connecting idea for all three tabs */}
        <ScrollReveal variant={FadeIn} amount={0.4} className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2.5 text-xs font-bold tracking-wide text-mx-ink-muted uppercase sm:text-sm">
          <span className="rounded-full border border-mx-border bg-mx-surface px-3.5 py-1.5">{home.flow.voice}</span>
          <span className="normal-case">{home.flow.or}</span>
          <span className="rounded-full border border-mx-border bg-mx-surface px-3.5 py-1.5">{home.flow.touch}</span>
          <ArrowRight size={14} className="text-mx-ink-muted" aria-hidden="true" />
          <span className="rounded-full bg-mx-purple-soft px-3.5 py-1.5 text-mx-purple">{home.flow.understands}</span>
          <ArrowRight size={14} className="text-mx-ink-muted" aria-hidden="true" />
          <span className="rounded-full bg-mx-green-soft px-3.5 py-1.5 text-mx-green-strong">{home.flow.structured}</span>
        </ScrollReveal>

        {/* Tab switcher */}
        <ScrollReveal
          variant={SlideUp}
          amount={0.3}
          delay={0.1}
          className="mx-auto mt-10 inline-flex w-full max-w-md flex-wrap justify-center gap-1 rounded-full border border-mx-border-strong bg-mx-surface p-1 sm:w-auto"
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                tab === id ? "text-mx-ink-inverse" : "text-mx-ink-soft hover:bg-mx-surface-sunken"
              )}
            >
              {tab === id && (
                <motion.span
                  layoutId="ai-showcase-tab-pill"
                  className="absolute inset-0 rounded-full bg-mx-purple"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <Icon size={15} className="relative" aria-hidden="true" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </ScrollReveal>

        {/* Description that changes with the active tab */}
        <div className="mx-auto mt-4 min-h-[1.5rem] max-w-lg text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tab}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="text-sm text-mx-ink-muted"
            >
              {home.tabDescriptions[tab]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Interactive panel */}
        <ScrollReveal variant={SlideUp} amount={0.15} delay={0.15} className="mx-auto mt-8 max-w-2xl">
          <div className="relative overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised p-5 shadow-mx-lg sm:p-7">
            <AnimatePresence mode="wait" initial={false}>
              {tab === "conversation" && <ConversationDemo key="conversation" />}
              {tab === "voice" && <VoiceDemo key="voice" />}
              {tab === "touch" && <TouchDemo key="touch" />}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="p"
          variant={FadeIn}
          amount={0.5}
          className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-mx-ink-muted"
        >
          {home.disclaimer}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared panel transition                                            */
/* ------------------------------------------------------------------ */
function PanelShell({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. AI CONVERSATION — guided, branching, progress-tracked            */
/* ------------------------------------------------------------------ */

type ConvStage = "symptom" | "duration" | "severity" | "breathing" | "summary";
const TOTAL_STEPS = 12;
const STAGE_STEP: Record<ConvStage, number> = { symptom: 1, duration: 2, severity: 3, breathing: 4, summary: 5 };

function ConversationDemo() {
  const { t } = useTranslation();
  const home = t.home.aiShowcase.conversation;
  const prefersReducedMotion = useReducedMotion();

  const [stage, setStage] = useState<ConvStage>("symptom");
  const [duration, setDuration] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [breathing, setBreathing] = useState<boolean | null>(null);

  const step = STAGE_STEP[stage];
  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const stepLabel = home.stepLabel.replace("{step}", String(step)).replace("{total}", String(TOTAL_STEPS));

  const restart = () => {
    setStage("symptom");
    setDuration(null);
    setSeverity(null);
    setBreathing(null);
  };

  const goBack = () => {
    if (stage === "duration") setStage("symptom");
    else if (stage === "severity") setStage("duration");
    else if (stage === "breathing") setStage("severity");
    else if (stage === "summary") setStage("breathing");
  };

  const skip = () => {
    if (stage === "symptom") setStage("duration");
    else if (stage === "duration") {
      setDuration((d) => d ?? home.durationOptions[0]);
      setStage("severity");
    } else if (stage === "severity") {
      setSeverity((s) => s ?? home.severityOptions[0]);
      setStage("breathing");
    } else if (stage === "breathing") {
      setBreathing((b) => b ?? false);
      setStage("summary");
    }
  };

  return (
    <PanelShell>
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-mx-ink-muted">
          <span>{stepLabel}</span>
          <span>
            {home.progressLabel} · {progress}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-mx-surface-sunken">
          <motion.div
            className="h-full rounded-full bg-mx-purple"
            animate={{ width: `${progress}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === "symptom" && (
          <QuestionStep key="symptom" question={home.mainQuestion}>
            <OptionGrid>
              <OptionButton label={home.options.fever} onClick={() => setStage("duration")} />
              <OptionButton label={home.options.pain} onClick={() => setStage("duration")} highlight />
              <OptionButton label={home.options.cough} onClick={() => setStage("duration")} />
              <OptionButton label={home.options.weakness} onClick={() => setStage("duration")} />
              <OptionButton label={home.options.breathing} onClick={() => setStage("duration")} />
              <OptionButton label={home.options.other} onClick={() => setStage("duration")} />
            </OptionGrid>
          </QuestionStep>
        )}

        {stage === "duration" && (
          <QuestionStep key="duration" question={home.durationQuestion}>
            <OptionGrid>
              {home.durationOptions.map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={duration === opt}
                  onClick={() => {
                    setDuration(opt);
                    setStage("severity");
                  }}
                />
              ))}
            </OptionGrid>
          </QuestionStep>
        )}

        {stage === "severity" && (
          <QuestionStep key="severity" question={home.severityQuestion}>
            <OptionGrid cols={3}>
              {home.severityOptions.map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={severity === opt}
                  onClick={() => {
                    setSeverity(opt);
                    setStage("breathing");
                  }}
                />
              ))}
            </OptionGrid>
          </QuestionStep>
        )}

        {stage === "breathing" && (
          <QuestionStep key="breathing" question={home.breathingQuestion}>
            <OptionGrid cols={2}>
              <OptionButton
                label={home.yes}
                selected={breathing === true}
                onClick={() => {
                  setBreathing(true);
                  setStage("summary");
                }}
              />
              <OptionButton
                label={home.no}
                selected={breathing === false}
                onClick={() => {
                  setBreathing(false);
                  setStage("summary");
                }}
              />
            </OptionGrid>
          </QuestionStep>
        )}

        {stage === "summary" && (
          <motion.div
            key="summary"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {breathing && (
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="mb-4 flex items-start gap-2.5 rounded-mx-md border border-mx-warning/40 bg-mx-warning-soft px-4 py-3"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-mx-warning" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-mx-ink">{home.redFlagTitle}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-mx-ink-soft">{home.redFlagBody}</p>
                </div>
              </motion.div>
            )}

            <p className="mb-3 text-center text-[11px] font-bold tracking-wide text-mx-ink-muted uppercase">
              {home.summaryTitle}
            </p>
            <StaggerGroup className="grid grid-cols-2 gap-2.5" stagger={0.09}>
              <StaggerItem variant={SlideUp}>
                <SummaryField label={home.fields.symptom} value={home.options.pain} />
              </StaggerItem>
              <StaggerItem variant={SlideUp}>
                <SummaryField label={home.fields.duration} value={duration ?? "—"} />
              </StaggerItem>
              <StaggerItem variant={SlideUp}>
                <SummaryField label={home.fields.severity} value={severity ?? "—"} />
              </StaggerItem>
              <StaggerItem variant={SlideUp}>
                <SummaryField label={home.fields.associated} value={breathing ? home.associatedYes : home.associatedNo} />
              </StaggerItem>
            </StaggerGroup>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-mx-border pt-5">
        <ControlButton icon={Undo2} label={home.goBack} onClick={goBack} disabled={stage === "symptom"} />
        <ControlButton icon={SkipForward} label={home.skip} onClick={skip} disabled={stage === "summary"} />
        <ControlButton icon={RotateCcw} label={home.restart} onClick={restart} />
      </div>
    </PanelShell>
  );
}

function QuestionStep({ question, children }: { question: string; children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <p className="font-display mb-4 text-center text-lg font-bold text-mx-ink sm:text-xl">{question}</p>
      {children}
    </motion.div>
  );
}

function OptionGrid({ cols = 2, children }: { cols?: 2 | 3; children: React.ReactNode }) {
  return <div className={cn("grid gap-2.5", cols === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")}>{children}</div>;
}

function OptionButton({
  label,
  onClick,
  selected,
  highlight,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  highlight?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={!!selected}
      whileHover={prefersReducedMotion ? undefined : { y: -2, borderColor: "var(--mx-purple)" }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "rounded-mx-md border px-3 py-3 text-center text-sm font-semibold transition-colors duration-200",
        selected
          ? "border-mx-purple bg-mx-purple text-mx-ink-inverse"
          : highlight
            ? "border-mx-purple/40 bg-mx-purple-soft text-mx-purple"
            : "border-mx-border bg-mx-surface text-mx-ink-soft hover:bg-mx-surface-sunken"
      )}
    >
      {label}
    </motion.button>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-mx-md border border-mx-border bg-mx-surface p-3 text-center transition-shadow duration-300 hover:shadow-mx-sm">
      <p className="text-[10px] font-bold tracking-wide text-mx-purple uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-mx-ink">{value}</p>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Undo2;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-mx-border-strong px-3.5 py-1.5 text-xs font-semibold text-mx-ink-soft transition-colors duration-200 hover:bg-mx-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 2. VOICE MODE — idle → listening → processing → speaking → done     */
/* ------------------------------------------------------------------ */

type VoiceState = "idle" | "listening" | "processing" | "speaking" | "completed";
const VOICE_SEQUENCE: { state: VoiceState; ms: number }[] = [
  { state: "listening", ms: 1800 },
  { state: "processing", ms: 1400 },
  { state: "speaking", ms: 1400 },
  { state: "completed", ms: 0 },
];

function VoiceDemo() {
  const { t } = useTranslation();
  const home = t.home.aiShowcase.voice;
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<VoiceState>("idle");

  useEffect(() => {
    if (state === "idle" || state === "completed") return;
    const current = VOICE_SEQUENCE.find((s) => s.state === state);
    if (!current || current.ms === 0) return;
    const idx = VOICE_SEQUENCE.findIndex((s) => s.state === state);
    const next = VOICE_SEQUENCE[idx + 1];
    if (!next) return;
    const id = window.setTimeout(() => setState(next.state), prefersReducedMotion ? 0 : current.ms);
    return () => window.clearTimeout(id);
  }, [state, prefersReducedMotion]);

  const start = () => setState("listening");
  const reset = () => setState("idle");

  const isActive = state === "listening" || state === "processing";
  const waveformSpeedLabel = state === "processing" ? "slow" : "normal";

  return (
    <PanelShell>
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <motion.button
          type="button"
          onClick={state === "idle" ? start : state === "completed" ? reset : undefined}
          whileHover={prefersReducedMotion ? undefined : { y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong shadow-mx-sm transition-shadow duration-300 hover:shadow-mx-md"
          aria-label={state === "idle" ? home.startSpeaking : home.states[state]}
        >
          {isActive && !prefersReducedMotion && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-mx-green"
              animate={{ opacity: [0.6, 0], scale: [1, 1.5] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <motion.span animate={state === "listening" && !prefersReducedMotion ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}>
            <Mic size={30} aria-hidden="true" />
          </motion.span>
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.p
            key={state}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="font-display text-lg font-semibold text-mx-ink"
          >
            {home.states[state]}
          </motion.p>
        </AnimatePresence>

        <Waveform
          active={state === "listening" || state === "speaking" || state === "processing"}
          className={cn("flex h-12 items-end justify-center gap-1.5", waveformSpeedLabel === "slow" && "opacity-70")}
        />

        {state === "completed" && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center gap-2 text-mx-green-strong"
          >
            <CheckCircle2 size={18} aria-hidden="true" />
          </motion.div>
        )}

        {state === "idle" ? (
          <motion.button
            type="button"
            onClick={start}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-2 rounded-mx-md bg-mx-green px-5 py-2.5 text-sm font-semibold text-mx-ink-inverse transition-colors duration-200 hover:bg-mx-green-strong"
          >
            <Mic size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5" />
            {home.startSpeaking}
          </motion.button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ControlButton icon={Square} label={home.stop} onClick={reset} />
            <ControlButton icon={RotateCcw} label={home.repeat} onClick={() => setState("listening")} disabled={state !== "completed"} />
            <ControlButton icon={Undo2} label={home.goBack} onClick={reset} />
            <ControlButton icon={SkipForward} label={home.skip} onClick={() => setState("completed")} disabled={state === "completed"} />
          </div>
        )}
      </div>
    </PanelShell>
  );
}

/* ------------------------------------------------------------------ */
/* 3. TOUCH MODE — one mood question at a time                         */
/* ------------------------------------------------------------------ */

const MOOD_EMOJI = ["😊", "😐", "😟", "😣"] as const;

function TouchDemo() {
  const { t } = useTranslation();
  const home = t.home.aiShowcase.touch;
  const prefersReducedMotion = useReducedMotion();
  const [qIndex, setQIndex] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>([null, null]);

  const moods = useMemo(
    () => [home.moods.good, home.moods.okay, home.moods.notWell, home.moods.severe],
    [home.moods]
  );

  const done = qIndex >= home.questions.length;

  const select = (moodIndex: number) => {
    setSelections((prev) => {
      const next = [...prev];
      next[qIndex] = moodIndex;
      return next;
    });
    window.setTimeout(() => setQIndex((q) => q + 1), prefersReducedMotion ? 0 : 450);
  };

  const restart = () => {
    setQIndex(0);
    setSelections([null, null]);
  };

  const progress = Math.round((Math.min(qIndex, home.questions.length) / home.questions.length) * 100);

  return (
    <PanelShell>
      <p className="font-display mb-1 text-center text-lg font-bold text-mx-ink sm:text-xl">{home.heading}</p>

      <div className="mx-auto mt-5 mb-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-mx-surface-sunken">
        <motion.div
          className="h-full rounded-full bg-mx-blue"
          animate={{ width: `${progress}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: EASE }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={qIndex}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="mb-5 text-center text-sm font-semibold text-mx-ink-soft">{home.questions[qIndex]}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {moods.map((label, i) => {
                const selected = selections[qIndex] === i;
                return (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={selected}
                    whileHover={prefersReducedMotion ? undefined : { y: -3, borderColor: "var(--mx-blue)" }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-mx-lg border px-3 py-5 transition-colors duration-200",
                      selected ? "border-mx-blue bg-mx-blue-soft" : "border-mx-border bg-mx-surface hover:bg-mx-surface-sunken"
                    )}
                  >
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-mx-blue text-mx-ink-inverse"
                      >
                        <CheckCircle2 size={13} aria-hidden="true" />
                      </motion.span>
                    )}
                    <motion.span
                      className="text-3xl"
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.15 }}
                      aria-hidden="true"
                    >
                      {MOOD_EMOJI[i]}
                    </motion.span>
                    <span className="text-xs font-semibold text-mx-ink-soft">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="touch-done"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <CheckCircle2 size={28} className="text-mx-green-strong" aria-hidden="true" />
            <p className="font-display text-base font-semibold text-mx-ink">{home.completed}</p>
            <ControlButton icon={RotateCcw} label={t.home.aiShowcase.conversation.restart} onClick={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </PanelShell>
  );
}
