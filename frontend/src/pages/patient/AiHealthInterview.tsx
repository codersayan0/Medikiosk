import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Lightbulb,
  Lock,
  Mic,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { RegistrationProgressSidebar } from "../../components/patient/RegistrationProgressSidebar";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import type { LanguageCode } from "../../types";
import { cn } from "../../utils/cn";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";

import {
  runRegistrationInterview,
  type InterviewAnswer,
} from "../../services/aiApi";

const TOTAL_QUESTIONS = 5;


// ============================================================
// TYPES
// ============================================================

interface QuestionRound {
  questionIndex: number;

  /**
   * Actual Gemini-generated question.
   *
   * This replaces the old mock `ai.questions[...]` lookup.
   */
  questionText: string;

  answerText: string;

  /**
   * Optional voice language used for this answer.
   */
  voiceLanguage?: LanguageCode;

  /**
   * Gemini's acknowledgement after the patient answered.
   */
  acknowledgement: string;

  timestamp: string;
}

interface AiHealthInterviewProps {
  /**
   * Called only after the patient finishes all 5 questions
   * and clicks "Continue to Next Step" on the completion screen.
   */
  onComplete: (
    answers: InterviewAnswer[],
  ) => void;

  /**
   * Called when the patient skips the interview.
   */
  onSkip: () => void;
}


// ============================================================
// HELPERS
// ============================================================

function timeNow(): string {
  return new Date().toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionLike)
  | null {
  const browserWindow =
    window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };

  return (
    browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null
  );
}


// Minimal browser SpeechRecognition shape.
// Keeps TypeScript independent from browser-specific
// vendor typings.
interface SpeechRecognitionLike {
  lang: string;

  interimResults: boolean;

  continuous: boolean;

  onstart: (() => void) | null;

  onresult:
    | ((event: SpeechRecognitionResultEventLike) => void)
    | null;

  onerror:
    | ((event: SpeechRecognitionErrorEventLike) => void)
    | null;

  onend: (() => void) | null;

  start: () => void;

  stop: () => void;

  abort: () => void;
}


interface SpeechRecognitionResultEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript?: string;
      };
    };
  };
}


interface SpeechRecognitionErrorEventLike {
  error?: string;
}


// ============================================================
// COMPONENT
// ============================================================

export function AiHealthInterview({
  onComplete,
  onSkip,
}: AiHealthInterviewProps) {
  const prefersReducedMotion = useReducedMotion();

  const {
    t,
    language,
  } = useTranslation();

  const ai = t.aiInterview;

  const {
    setHasPageHeader,
  } = useTheme();

  // This step renders its own header controls.
  useEffect(() => {
    setHasPageHeader(true);

    return () => {
      setHasPageHeader(false);
    };
  }, [setHasPageHeader]);


  // ==========================================================
  // INTERVIEW STATE
  // ==========================================================

  const [phase, setPhase] =
    useState<"intro" | "active">("intro");

  const [rounds, setRounds] =
    useState<QuestionRound[]>([]);

  const [answerText, setAnswerText] =
    useState("");

  const [answeredByVoice, setAnsweredByVoice] =
    useState<LanguageCode | null>(null);

  const [inlineError, setInlineError] =
    useState<string | null>(null);

  const [interviewError, setInterviewError] =
    useState<string | null>(null);

  const [isInterviewLoading, setIsInterviewLoading] =
    useState(false);


  // ==========================================================
  // VOICE STATE
  // ==========================================================

  const [isVoicePopoverOpen, setIsVoicePopoverOpen] =
    useState(false);

  const [voiceLanguage, setVoiceLanguage] =
    useState<LanguageCode>(language);

  const [isListening, setIsListening] =
    useState(false);

  const [speakingId, setSpeakingId] =
    useState<string | null>(null);


  // ==========================================================
  // REFS
  // ==========================================================

  const popoverRef =
    useRef<HTMLDivElement>(null);

  const speakingTimeout =
    useRef<number | null>(null);

  const transcriptEndRef =
    useRef<HTMLDivElement>(null);

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);


  useOnClickOutside(
    popoverRef,
    () => setIsVoicePopoverOpen(false),
  );


  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      if (speakingTimeout.current) {
        window.clearTimeout(
          speakingTimeout.current,
        );
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore browser cleanup errors.
        }
      }
    };
  }, []);


  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior:
        prefersReducedMotion
          ? "auto"
          : "smooth",
      block: "end",
    });
  }, [
    rounds.length,
    phase,
    isInterviewLoading,
    prefersReducedMotion,
  ]);


  // ==========================================================
  // DERIVED STATE
  // ==========================================================

  const currentQuestionIndex =
    rounds.length;

  const isCompleted =
    phase === "active" &&
    rounds.length >= TOTAL_QUESTIONS;

  const questionLabel =
    ai.questionCounter
      .replace(
        "{current}",
        String(
          Math.min(
            currentQuestionIndex + 1,
            TOTAL_QUESTIONS,
          ),
        ),
      )
      .replace(
        "{total}",
        String(TOTAL_QUESTIONS),
      );

  const currentQuestion =
    isCompleted
      ? ""
      : rounds.length === 0
        ? ""
        : "";


  // ==========================================================
  // ASSISTANT VOICE PLAYBACK
  // ==========================================================

  function toggleSpeaking(
    id: string,
    text?: string,
  ) {
    if (
      speakingTimeout.current
    ) {
      window.clearTimeout(
        speakingTimeout.current,
      );
    }

    // Stop an already-playing browser TTS.
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    if (
      speakingId === id
    ) {
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);

    // Browser TTS.
    // This is NOT mock assistant content.
    // It simply reads the real Gemini response aloud.
    if (
      text &&
      "speechSynthesis" in window
    ) {
      const utterance =
        new SpeechSynthesisUtterance(
          text,
        );

      if (language === "bn") {
        utterance.lang = "bn-IN";
      } else if (
        language === "hi"
      ) {
        utterance.lang = "hi-IN";
      } else {
        utterance.lang = "en-IN";
      }

      window.speechSynthesis.speak(
        utterance,
      );

      const stopCheck =
        window.setInterval(() => {
          if (
            !window.speechSynthesis.speaking
          ) {
            window.clearInterval(
              stopCheck,
            );
            setSpeakingId(null);
          }
        }, 250);

      speakingTimeout.current =
        window.setTimeout(() => {
          window.speechSynthesis.cancel();
          window.clearInterval(
            stopCheck,
          );
          setSpeakingId(null);
        }, 30000);

      return;
    }

    speakingTimeout.current =
      window.setTimeout(() => {
        setSpeakingId(null);
      }, 1600);
  }


  // ==========================================================
  // START INTERVIEW
  // ==========================================================

  async function handleStart() {
    if (isInterviewLoading) {
      return;
    }

    setInlineError(null);
    setInterviewError(null);
    setIsInterviewLoading(true);

    try {
      /**
       * First Gemini call:
       *
       * answers = []
       *
       * Gemini generates Question 1.
       */
      const response =
        await runRegistrationInterview(
          language,
          [],
        );

      if (
        !response.success ||
        response.completed ||
        !response.question.trim()
      ) {
        throw new Error(
          "Unable to start the AI health interview.",
        );
      }

      setPhase("active");

      setIsInterviewLoading(
        false,
      );

      // The first question is rendered
      // through this state.
      setCurrentQuestionText(
        response.question,
      );

      setCurrentQuestionIndexState(
        response.question_index,
      );

    } catch (error) {
  console.error("Registration AI interview start failed:", error);

  setInterviewError(
    error instanceof Error
      ? error.message
      : "AI health interview is temporarily unavailable. Please try again.",
  );

  setIsInterviewLoading(false);
}
  }


  // ==========================================================
  // DYNAMIC CURRENT QUESTION
  // ==========================================================

  const [
    currentQuestionText,
    setCurrentQuestionText,
  ] = useState("");

  const [
    currentQuestionIndexState,
    setCurrentQuestionIndexState,
  ] = useState(0);


  // ==========================================================
  // VOICE POPOVER
  // ==========================================================

  function openVoicePopover() {
    if (isInterviewLoading) {
      return;
    }

    setInlineError(null);
    setInterviewError(null);
    setIsVoicePopoverOpen(true);
  }


  // ==========================================================
  // VOICE INPUT
  // ==========================================================

  function chooseVoiceLanguage(
    code: LanguageCode,
  ) {
    setVoiceLanguage(code);
    setIsVoicePopoverOpen(false);
    setInlineError(null);
    setInterviewError(null);

    const SpeechRecognition =
      getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setInterviewError(
        "Voice input is not supported in this browser. Please type your answer.",
      );

      return;
    }

    // Stop an existing recognition session.
    if (
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore.
      }
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      code === "bn"
        ? "bn-IN"
        : code === "hi"
          ? "hi-IN"
          : "en-IN";

    recognition.interimResults =
      false;

    recognition.continuous =
      false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult =
      (event) => {
        const transcript =
          event.results?.[0]?.[0]
            ?.transcript
            ?.trim() ?? "";

        if (transcript) {
          setAnswerText(
            transcript,
          );

          setAnsweredByVoice(
            code,
          );

          setInlineError(
            null,
          );
        }
      };

    recognition.onerror =
      (event) => {
        setIsListening(false);

        if (
          event.error ===
          "not-allowed"
        ) {
          setInterviewError(
            "Microphone permission was denied. Please allow microphone access or type your answer.",
          );
        } else if (
          event.error ===
          "no-speech"
        ) {
          setInterviewError(
            "No speech was detected. Please try again.",
          );
        } else {
          setInterviewError(
            "Unable to capture your voice. Please try again or type your answer.",
          );
        }
      };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current =
        null;
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current =
        null;

      setInterviewError(
        "Unable to start microphone input. Please try again.",
      );
    }
  }


  function cancelListening() {
    if (
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore.
      }
    }

    recognitionRef.current =
      null;

    setIsListening(false);
  }


  // ==========================================================
  // ANSWER INPUT
  // ==========================================================

  function handleAnswerChange(
    value: string,
  ) {
    setAnswerText(value);
    setAnsweredByVoice(null);

    if (inlineError) {
      setInlineError(null);
    }

    if (interviewError) {
      setInterviewError(null);
    }
  }


  // ==========================================================
  // NEXT / SUBMIT ANSWER
  // ==========================================================

  async function handleNext() {
    const trimmedAnswer =
      answerText.trim();

    if (!trimmedAnswer) {
      setInlineError(
        ai.answerRequiredError,
      );

      return;
    }

    if (
      !currentQuestionText.trim()
    ) {
      setInterviewError(
        "The current AI question is unavailable. Please restart the interview.",
      );

      return;
    }

    if (isInterviewLoading) {
      return;
    }

    if (isListening) {
      cancelListening();
    }

    setInlineError(null);
    setInterviewError(null);
    setIsInterviewLoading(true);

    const nextAnswers: InterviewAnswer[] =
      rounds.map((round) => ({
        question_index:
          round.questionIndex,

        question:
          round.questionText,

        answer:
          round.answerText,
      }));

    nextAnswers.push({
      question_index:
        currentQuestionIndexState,

      question:
        currentQuestionText,

      answer:
        trimmedAnswer,
    });

    try {
      /**
       * Send all answers so far to Gemini.
       *
       * Gemini uses the conversation history
       * to generate the next adaptive question.
       */
      const response =
        await runRegistrationInterview(
          language,
          nextAnswers,
        );

      // Add this completed round only
      // after the backend successfully processes it.
      setRounds((previous) => [
        ...previous,
        {
          questionIndex:
            currentQuestionIndexState,

          questionText:
            currentQuestionText,

          answerText:
            trimmedAnswer,

          voiceLanguage:
            answeredByVoice ??
            undefined,

          acknowledgement:
            response.acknowledgement ||
            "",

          timestamp:
            timeNow(),
        },
      ]);

      setAnswerText("");
      setAnsweredByVoice(null);

      // Five answers completed.
      if (
        response.completed ||
        nextAnswers.length >= TOTAL_QUESTIONS
      ) {
        setCurrentQuestionText("");
        setCurrentQuestionIndexState(
          TOTAL_QUESTIONS - 1,
        );

        setIsInterviewLoading(false);

        return;
      }

      // Gemini-generated next question.
      setCurrentQuestionText(
        response.question,
      );

      setCurrentQuestionIndexState(
        response.question_index,
      );

    } catch (error) {
  console.error("Registration AI interview failed:", error);

  setInterviewError(
    error instanceof Error
      ? error.message
      : "AI health interview is temporarily unavailable. Please try again.",
  );
} finally {
      setIsInterviewLoading(
        false,
      );
    }
  }


  // ==========================================================
  // PREVIOUS QUESTION
  // ==========================================================

  function handlePrevious() {
    if (rounds.length === 0) {
      return;
    }

    const previousRound =
      rounds[rounds.length - 1];

    setAnswerText(
      previousRound.answerText,
    );

    setAnsweredByVoice(
      previousRound.voiceLanguage ??
      null,
    );

    setCurrentQuestionText(
      previousRound.questionText,
    );

    setCurrentQuestionIndexState(
      previousRound.questionIndex,
    );

    setRounds((previous) =>
      previous.slice(0, -1),
    );

    setInlineError(null);
    setInterviewError(null);
  }


  // ==========================================================
  // COMPLETE
  // ==========================================================

  function handleCompleteInterview() {
    if (
      rounds.length !== TOTAL_QUESTIONS
    ) {
      return;
    }

    const finalAnswers: InterviewAnswer[] =
      rounds.map((round) => ({
        question_index:
          round.questionIndex,

        question:
          round.questionText,

        answer:
          round.answerText,
      }));

    onComplete(
      finalAnswers,
    );
  }


  // ==========================================================
  // ANIMATION
  // ==========================================================

  const fade =
    prefersReducedMotion
      ? {}
      : {
          initial: {
            opacity: 0,
            y: 10,
          },

          animate: {
            opacity: 1,
            y: 0,
          },
        };

  const pd =
    t.personalDetailsStep;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-mx-border bg-mx-surface-raised px-4 py-2.5 sm:px-6">
        <Logo
          size={30}
          withWordmark
        />

        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </header>


      <motion.div
        {...fade}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 lg:py-5"
      >

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">

          {/* =================================================
              LEFT SIDEBAR
          ================================================== */}

          <RegistrationProgressSidebar
            currentStepIndex={2}
            className="lg:order-1"
          />


          {/* =================================================
              CENTER
          ================================================== */}

          <div className="flex flex-col gap-4 lg:order-2">

            <motion.div
              initial={
                prefersReducedMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 14,
                    }
              }
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                    }
              }
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.1,
              }}
              className="overflow-hidden rounded-mx-lg border border-mx-border bg-mx-surface-raised shadow-mx-md"
            >

              <AnimatePresence mode="wait">

                {/* =================================================
                    INTRO
                ================================================== */}

                {phase === "intro" && (
                  <motion.div
                    key="intro"
                    initial={
                      prefersReducedMotion
                        ? undefined
                        : {
                            opacity: 0,
                          }
                    }
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : {
                            opacity: 1,
                          }
                    }
                    exit={
                      prefersReducedMotion
                        ? undefined
                        : {
                            opacity: 0,
                          }
                    }
                    transition={{
                      duration: 0.25,
                    }}
                    className="flex flex-col items-center gap-5 p-6 text-center sm:p-9"
                  >

                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                      <Bot
                        size={28}
                        aria-hidden="true"
                      />
                    </span>

                    <div className="flex flex-col gap-2">
                      <h1 className="font-display text-xl font-bold text-mx-ink sm:text-2xl">
                        {ai.intro.greeting}
                      </h1>

                      <p className="mx-auto max-w-sm text-sm leading-relaxed text-mx-ink-muted">
                        {ai.intro.subtext}
                      </p>
                    </div>


                    <ul className="flex w-full max-w-sm flex-col gap-2 text-left">
                      {ai.intro.points.map(
                        (
                          point,
                          i,
                        ) => (
                          <li
                            key={i}
                            className="flex items-center gap-2.5 text-sm text-mx-ink-soft"
                          >
                            <Check
                              size={16}
                              className="shrink-0 text-mx-green"
                              aria-hidden="true"
                            />

                            <span>
                              {point}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>


                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        {
                          icon: Lock,
                          title:
                            ai.intro
                              .feature1Title,
                          desc:
                            ai.intro
                              .feature1Desc,
                        },

                        {
                          icon: Sparkles,
                          title:
                            ai.intro
                              .feature2Title,
                          desc:
                            ai.intro
                              .feature2Desc,
                        },

                        {
                          icon: Zap,
                          title:
                            ai.intro
                              .feature3Title,
                          desc:
                            ai.intro
                              .feature3Desc,
                        },
                      ].map(
                        ({
                          icon: Icon,
                          title,
                          desc,
                        }) => (
                          <div
                            key={title}
                            className="flex flex-col items-center gap-1.5 rounded-mx-md border border-mx-border bg-mx-surface-sunken p-3.5 text-center"
                          >
                            <Icon
                              size={18}
                              className="text-mx-green-strong"
                              aria-hidden="true"
                            />

                            <span className="text-xs font-semibold text-mx-ink">
                              {title}
                            </span>

                            <span className="text-[0.7rem] leading-snug text-mx-ink-muted">
                              {desc}
                            </span>
                          </div>
                        ),
                      )}
                    </div>


                    <div className="flex w-full max-w-sm flex-col gap-2.5 pt-1">

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon={
                          isInterviewLoading ? undefined : (
                            <ArrowRight
                              size={17}
                              aria-hidden="true"
                            />
                          )
                        }
                        iconPosition="right"
                        onClick={
                          handleStart
                        }
                        disabled={
                          isInterviewLoading
                        }
                        className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                      >
                        {isInterviewLoading
                          ? "Starting interview..."
                          : ai.intro
                              .startButton}
                      </Button>


                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        fullWidth
                        onClick={onSkip}
                        disabled={
                          isInterviewLoading
                        }
                      >
                        {ai.intro.skipButton}
                      </Button>
                    </div>


                    {interviewError && (
                      <p
                        role="alert"
                        className="max-w-sm text-xs font-medium text-mx-danger"
                      >
                        {interviewError}
                      </p>
                    )}


                    <div className="flex items-center gap-2 text-center text-xs text-mx-ink-muted">
                      <ShieldCheck
                        size={14}
                        className="shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <span>
                        {ai.medicalDisclaimer}
                      </span>
                    </div>

                  </motion.div>
                )}


                {/* =================================================
                    ACTIVE INTERVIEW
                ================================================== */}

                {phase === "active" &&
                  !isCompleted && (
                    <motion.div
                      key="active"
                      initial={
                        prefersReducedMotion
                          ? undefined
                          : {
                              opacity: 0,
                            }
                      }
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : {
                              opacity: 1,
                            }
                      }
                      exit={
                        prefersReducedMotion
                          ? undefined
                          : {
                              opacity: 0,
                            }
                      }
                      transition={{
                        duration: 0.25,
                      }}
                      className="flex max-h-[80vh] flex-col sm:max-h-[640px]"
                    >

                      {/* HEADER */}

                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mx-border px-5 pb-4 pt-5 sm:px-7">

                        <div className="min-w-0">

                          <h1 className="font-display text-base font-bold text-mx-ink sm:text-lg">
                            {ai.headerTitle}
                          </h1>

                          <p className="mt-0.5 text-xs text-mx-ink-muted sm:text-sm">
                            {ai.headerSubtitle}
                          </p>

                        </div>


                        <div className="flex shrink-0 flex-col items-end gap-0.5">

                          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-mx-ink-muted">
                            {ai.progressLabel}
                          </span>

                          <span className="rounded-full bg-mx-surface-sunken px-3 py-1 text-xs font-bold text-mx-green-strong">
                            {questionLabel}
                          </span>

                        </div>

                      </div>


                      {/* PROGRESS */}

                      <div className="flex gap-1.5 px-5 pt-3 sm:px-7">

                        {Array.from({
                          length:
                            TOTAL_QUESTIONS,
                        }).map(
                          (
                            _,
                            i,
                          ) => (
                            <div
                              key={i}
                              className="h-1.5 flex-1 overflow-hidden rounded-full bg-mx-surface-sunken"
                            >
                              <div
                                className={cn(
                                  "h-full rounded-full bg-mx-green transition-[width] duration-500 ease-out",

                                  i <
                                    currentQuestionIndex &&
                                    "w-full",

                                  i ===
                                    currentQuestionIndex &&
                                    "w-1/2",

                                  i >
                                    currentQuestionIndex &&
                                    "w-0",
                                )}
                              />
                            </div>
                          ),
                        )}

                      </div>


                      {/* TRANSCRIPT */}

                      <div className="mx-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7">

                        <div className="flex flex-col gap-5">

                          {rounds.map(
                            (
                              round,
                            ) => (
                              <div
                                key={
                                  round.questionIndex
                                }
                                className="flex flex-col gap-3"
                              >

                                {/* Actual Gemini question */}

                                <AssistantBubble
                                  text={
                                    round.questionText
                                  }
                                  timestamp={
                                    round.timestamp
                                  }
                                  messageId={`q-${round.questionIndex}`}
                                  speakingId={
                                    speakingId
                                  }
                                  onToggleSpeak={
                                    toggleSpeaking
                                  }
                                />


                                {/* Patient answer */}

                                <PatientBubble
                                  text={
                                    round.answerText
                                  }
                                  timestamp={
                                    round.timestamp
                                  }
                                />


                                {/* Gemini acknowledgement */}

                                {round.acknowledgement && (
                                  <AssistantBubble
                                    text={
                                      round.acknowledgement
                                    }
                                    timestamp={
                                      round.timestamp
                                    }
                                    messageId={`ack-${round.questionIndex}`}
                                    speakingId={
                                      speakingId
                                    }
                                    onToggleSpeak={
                                      toggleSpeaking
                                    }
                                    compact
                                  />
                                )}

                              </div>
                            ),
                          )}


                          {/* Current Gemini question */}

                          {currentQuestionText &&
                            !isInterviewLoading && (
                              <AssistantBubble
                                text={
                                  currentQuestionText
                                }
                                timestamp={
                                  timeNow()
                                }
                                messageId={`q-${currentQuestionIndexState}-active`}
                                speakingId={
                                  speakingId
                                }
                                onToggleSpeak={
                                  toggleSpeaking
                                }
                              />
                            )}


                          {/* Gemini loading */}

                          {isInterviewLoading && (
                            <div className="flex items-start gap-2.5">

                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                                <Bot
                                  size={15}
                                  aria-hidden="true"
                                />
                              </span>

                              <div className="flex max-w-[85%] flex-col gap-1">

                                <div className="rounded-mx-md rounded-tl-sm border border-mx-border bg-mx-surface-sunken px-3.5 py-2.5 text-sm text-mx-ink">

                                  <span className="inline-flex items-center gap-1.5">
                                    <span>
                                      {language ===
                                      "bn"
                                        ? "প্রশ্ন তৈরি হচ্ছে"
                                        : language ===
                                            "hi"
                                          ? "प्रश्न तैयार हो रहा है"
                                          : "Preparing your next question"}
                                    </span>

                                    <span className="flex gap-0.5">
                                      <span className="h-1 w-1 animate-bounce rounded-full bg-mx-green" />
                                      <span className="h-1 w-1 animate-bounce rounded-full bg-mx-green [animation-delay:120ms]" />
                                      <span className="h-1 w-1 animate-bounce rounded-full bg-mx-green [animation-delay:240ms]" />
                                    </span>
                                  </span>

                                </div>

                                <span className="pl-1 text-[0.65rem] text-mx-ink-muted">
                                  {timeNow()}
                                </span>

                              </div>
                            </div>
                          )}


                          {interviewError && (
                            <p
                              role="alert"
                              className="rounded-mx-sm border border-mx-danger/30 bg-mx-danger/5 px-3 py-2 text-xs font-medium text-mx-danger"
                            >
                              {interviewError}
                            </p>
                          )}


                          <div
                            ref={
                              transcriptEndRef
                            }
                          />

                        </div>
                      </div>


                      {/* ANSWER AREA */}

                      <div className="border-t border-mx-border bg-mx-surface-sunken/40 px-5 py-4 sm:px-7">

                        <div className="rounded-mx-lg border border-mx-border bg-mx-surface p-3.5 shadow-mx-sm sm:p-4">

                          {isListening ? (
                            <ListeningPanel
                              ai={ai}
                              onCancel={
                                cancelListening
                              }
                            />
                          ) : (
                            <div className="relative">

                              <textarea
                                value={
                                  answerText
                                }
                                onChange={(e) =>
                                  handleAnswerChange(
                                    e.target
                                      .value,
                                  )
                                }
                                placeholder={
                                  ai.answerPlaceholder
                                }
                                maxLength={1000}
                                rows={3}
                                aria-label={
                                  ai.answerPlaceholder
                                }
                                aria-invalid={Boolean(
                                  inlineError,
                                )}
                                disabled={
                                  isInterviewLoading
                                }
                                className={cn(
                                  "w-full resize-none rounded-mx-md border bg-mx-surface px-3.5 py-2.5 pr-3 text-sm text-mx-ink placeholder:text-mx-ink-muted",

                                  "border-mx-border-strong focus:border-mx-blue",

                                  inlineError &&
                                    "border-mx-danger",

                                  isInterviewLoading &&
                                    "cursor-not-allowed opacity-60",
                                )}
                              />


                              <span className="pointer-events-none absolute bottom-2 right-3 text-[0.65rem] text-mx-ink-muted">
                                {
                                  answerText.length
                                }
                                /1000
                              </span>

                            </div>
                          )}


                          {inlineError && (
                            <p
                              role="alert"
                              className="mt-1.5 text-xs font-medium text-mx-danger"
                            >
                              {inlineError}
                            </p>
                          )}


                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

                            <div
                              className="relative"
                              ref={
                                popoverRef
                              }
                            >

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                icon={
                                  <Mic
                                    size={15}
                                    aria-hidden="true"
                                  />
                                }
                                onClick={
                                  openVoicePopover
                                }
                                disabled={
                                  isListening ||
                                  isInterviewLoading
                                }
                                aria-haspopup="true"
                                aria-expanded={
                                  isVoicePopoverOpen
                                }
                              >
                                {
                                  ai.voiceInputButton
                                }
                              </Button>


                              <AnimatePresence>

                                {isVoicePopoverOpen && (
                                  <motion.div
                                    initial={
                                      prefersReducedMotion
                                        ? undefined
                                        : {
                                            opacity: 0,
                                            y: 6,
                                            scale: 0.97,
                                          }
                                    }
                                    animate={
                                      prefersReducedMotion
                                        ? undefined
                                        : {
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                          }
                                    }
                                    exit={
                                      prefersReducedMotion
                                        ? undefined
                                        : {
                                            opacity: 0,
                                            y: 6,
                                            scale: 0.97,
                                          }
                                    }
                                    transition={{
                                      duration: 0.15,
                                    }}
                                    role="listbox"
                                    aria-label={
                                      ai.voicePopoverTitle
                                    }
                                    className="absolute bottom-full left-0 z-30 mb-2 w-64 rounded-mx-md border border-mx-border bg-mx-surface-raised p-3 shadow-mx-lg"
                                  >

                                    <p className="mb-2 text-xs font-semibold text-mx-ink">
                                      {
                                        ai.voicePopoverTitle
                                      }
                                    </p>


                                    <div className="flex flex-col gap-0.5">

                                      {LANGUAGE_OPTIONS.map(
                                        (
                                          opt,
                                        ) => {
                                          const active =
                                            opt.code ===
                                            voiceLanguage;

                                          return (
                                            <button
                                              key={
                                                opt.code
                                              }
                                              type="button"
                                              role="option"
                                              aria-selected={
                                                active
                                              }
                                              onClick={() =>
                                                chooseVoiceLanguage(
                                                  opt.code,
                                                )
                                              }
                                              className="flex items-center justify-between gap-2 rounded-mx-sm px-2.5 py-2 text-left text-sm text-mx-ink hover:bg-mx-surface-sunken"
                                            >

                                              <span>
                                                {
                                                  opt.nativeLabel
                                                }

                                                {opt.code !==
                                                  "en" && (
                                                  <span className="ml-1.5 text-xs text-mx-ink-muted">
                                                    {
                                                      opt.label
                                                    }
                                                  </span>
                                                )}
                                              </span>


                                              <span
                                                className={cn(
                                                  "flex h-4 w-4 items-center justify-center rounded-full border",

                                                  active
                                                    ? "border-mx-green bg-mx-green"
                                                    : "border-mx-border-strong",
                                                )}
                                              >
                                                {active && (
                                                  <Check
                                                    size={
                                                      11
                                                    }
                                                    className="text-mx-ink-inverse"
                                                    aria-hidden="true"
                                                  />
                                                )}
                                              </span>

                                            </button>
                                          );
                                        },
                                      )}

                                    </div>


                                    <p className="mt-2 border-t border-mx-border pt-2 text-[0.7rem] leading-snug text-mx-ink-muted">
                                      {
                                        ai.voicePopoverHint
                                      }
                                    </p>

                                  </motion.div>
                                )}

                              </AnimatePresence>

                            </div>


                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              icon={
                                <ArrowRight
                                  size={15}
                                  aria-hidden="true"
                                />
                              }
                              iconPosition="right"
                              onClick={
                                handleNext
                              }
                              disabled={
                                isListening ||
                                isInterviewLoading
                              }
                            >
                              {isInterviewLoading
                                ? language ===
                                  "bn"
                                  ? "অপেক্ষা করুন..."
                                  : language ===
                                      "hi"
                                    ? "कृपया प्रतीक्षा करें..."
                                    : "Please wait..."
                                : ai.nextButton}
                            </Button>

                          </div>


                          <div className="mt-3 flex items-center justify-between gap-3">

                            <button
                              type="button"
                              onClick={
                                handlePrevious
                              }
                              disabled={
                                rounds.length ===
                                  0 ||
                                isInterviewLoading
                              }
                              className={cn(
                                "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors",

                                rounds.length ===
                                  0 ||
                                  isInterviewLoading
                                  ? "cursor-not-allowed text-mx-ink-muted opacity-50"
                                  : "text-mx-ink-soft hover:text-mx-ink",
                              )}
                            >
                              <ArrowLeft
                                size={13}
                                aria-hidden="true"
                              />

                              {
                                ai.previousButton
                              }
                            </button>


                            <button
                              type="button"
                              onClick={
                                onSkip
                              }
                              disabled={
                                isInterviewLoading
                              }
                              className="text-xs font-semibold text-mx-blue transition-colors hover:text-mx-green-strong disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {
                                ai.skipInterview
                              }
                            </button>

                          </div>

                        </div>
                      </div>

                    </motion.div>
                  )}


                {/* =================================================
                    COMPLETED
                ================================================== */}

                {isCompleted && (
                  <motion.div
                    key="completed"
                    initial={
                      prefersReducedMotion
                        ? undefined
                        : {
                            opacity: 0,
                            scale: 0.98,
                          }
                    }
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : {
                            opacity: 1,
                            scale: 1,
                          }
                    }
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    className="flex flex-col items-center gap-4 p-8 text-center sm:p-10"
                  >

                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                      <CheckCircle2
                        size={30}
                        aria-hidden="true"
                      />
                    </span>


                    <h1 className="font-display text-xl font-bold text-mx-ink sm:text-2xl">
                      {ai.completedTitle}{" "}
                      <span className="text-mx-green-strong">
                        {
                          ai.completedHighlight
                        }
                      </span>
                    </h1>


                    <p className="max-w-sm text-sm leading-relaxed text-mx-ink-muted">
                      {ai.completedMessage}{" "}
                      {ai.completedSubMessage}
                    </p>


                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      icon={
                        <ArrowRight
                          size={17}
                          aria-hidden="true"
                        />
                      }
                      iconPosition="right"
                      onClick={
                        handleCompleteInterview
                      }
                      className="mt-1 w-full max-w-sm shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                    >
                      {
                        ai.continueButton
                      }
                    </Button>


                    <button
                      type="button"
                      onClick={onSkip}
                      className="text-sm font-semibold text-mx-blue transition-colors hover:text-mx-green-strong"
                    >
                      {
                        ai.skipForNow
                      }
                    </button>


                    <div className="mt-2 flex w-full items-start gap-2 rounded-mx-sm border border-mx-border bg-mx-surface-sunken px-3.5 py-3 text-left text-xs text-mx-ink-muted">

                      <ShieldCheck
                        size={15}
                        className="mt-0.5 shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <span>
                        {
                          ai.medicalDisclaimer
                        }
                      </span>

                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

            </motion.div>

          </div>


          {/* =====================================================
              RIGHT SIDEBAR
          ====================================================== */}

          <div className="flex flex-col gap-4 lg:order-3">

            <Card>
              <div className="flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                  <ShieldCheck
                    size={15}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="font-display text-sm font-bold text-mx-ink">
                  {
                    pd.whyChooseTitle
                  }
                </h3>

              </div>


              <ul className="mt-2.5 flex flex-col gap-1.5">

                {pd.whyChoose.map(
                  (
                    line,
                    i,
                  ) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft"
                    >
                      <Check
                        size={13}
                        className="mt-0.5 shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <span>
                        {line}
                      </span>
                    </li>
                  ),
                )}

              </ul>

            </Card>


            <Card>

              <div className="flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">
                  <Lightbulb
                    size={15}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="font-display text-sm font-bold text-mx-ink">
                  {
                    ai.interviewTipsTitle
                  }
                </h3>

              </div>


              <ul className="mt-2.5 flex flex-col gap-1.5">

                {ai.interviewTips.map(
                  (
                    tip,
                    i,
                  ) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft"
                    >
                      <Check
                        size={13}
                        className="mt-0.5 shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <span>
                        {tip}
                      </span>
                    </li>
                  ),
                )}

              </ul>

            </Card>

          </div>

        </div>

      </motion.div>

    </div>
  );
}


// ============================================================
// ASSISTANT BUBBLE
// ============================================================

function AssistantBubble({
  text,
  timestamp,
  messageId,
  speakingId,
  onToggleSpeak,
  compact = false,
}: {
  text: string;

  timestamp: string;

  messageId: string;

  speakingId: string | null;

  onToggleSpeak: (
    id: string,
    text?: string,
  ) => void;

  compact?: boolean;
}) {
  const isSpeaking =
    speakingId === messageId;

  return (
    <div className="flex items-start gap-2.5">

      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
        <Bot
          size={15}
          aria-hidden="true"
        />
      </span>


      <div className="flex max-w-[85%] flex-col gap-1">

        <div
          className={cn(
            "flex items-start gap-2 rounded-mx-md rounded-tl-sm border border-mx-border bg-mx-surface-sunken px-3.5 py-2.5 text-sm leading-relaxed text-mx-ink",

            compact &&
              "text-mx-ink-soft",
          )}
        >

          <span className="flex-1 whitespace-pre-wrap">
            {text}
          </span>


          <button
            type="button"
            onClick={() =>
              onToggleSpeak(
                messageId,
                text,
              )
            }
            aria-label="Play assistant response"
            aria-pressed={
              isSpeaking
            }
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-mx-ink-muted transition-colors hover:text-mx-green-strong",

              isSpeaking &&
                "text-mx-green-strong",
            )}
          >
            <Volume2
              size={13}
              className={cn(
                isSpeaking &&
                  "animate-pulse",
              )}
              aria-hidden="true"
            />
          </button>

        </div>


        <span className="pl-1 text-[0.65rem] text-mx-ink-muted">
          {timestamp}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// PATIENT BUBBLE
// ============================================================

function PatientBubble({
  text,
  timestamp,
}: {
  text: string;

  timestamp: string;
}) {
  return (
    <div className="flex flex-col items-end gap-1 self-end">

      <div className="max-w-[85%] rounded-mx-md rounded-tr-sm bg-mx-green px-3.5 py-2.5 text-sm leading-relaxed text-mx-ink-inverse shadow-mx-sm">
        {text}
      </div>

      <span className="pr-1 text-[0.65rem] text-mx-ink-muted">
        {timestamp}
      </span>

    </div>
  );
}


// ============================================================
// LISTENING PANEL
// ============================================================

function ListeningPanel({
  ai,
  onCancel,
}: {
  ai: ReturnType<
    typeof useTranslation
  >["t"]["aiInterview"];

  onCancel: () => void;
}) {
  const bars =
    Array.from({
      length: 22,
    });

  return (
    <div className="flex flex-col items-center gap-4 rounded-mx-md border border-mx-border bg-mx-surface-sunken px-5 py-6">

      <div
        className="flex h-10 items-center gap-[3px]"
        role="img"
        aria-label={
          ai.listeningTitle
        }
      >
        {bars.map(
          (
            _,
            i,
          ) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-mx-green"
              style={{
                height: `${
                  30 +
                  Math.abs(
                    Math.sin(
                      i * 1.3,
                    ),
                  ) *
                    70
                }%`,

                animation:
                  `mx-waveform 1.1s ease-in-out ${
                    i * 0.045
                  }s infinite`,
              }}
            />
          ),
        )}
      </div>


      <div className="flex flex-col items-center gap-1">

        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-mx-green text-mx-ink-inverse">

          <span className="absolute inset-0 animate-ping rounded-full bg-mx-green opacity-40" />

          <Mic
            size={18}
            className="relative"
            aria-hidden="true"
          />

        </span>


        <span className="mt-1 text-sm font-semibold text-mx-ink">
          {
            ai.listeningTitle
          }
        </span>

        <span className="text-xs text-mx-ink-muted">
          {
            ai.listeningSubtitle
          }
        </span>

      </div>


      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={
          <X
            size={14}
            aria-hidden="true"
          />
        }
        onClick={onCancel}
      >
        {ai.cancelButton}
      </Button>


      <style>{`
        @keyframes mx-waveform {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}