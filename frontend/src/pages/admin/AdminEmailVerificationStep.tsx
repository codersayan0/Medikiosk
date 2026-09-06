import { useEffect, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { cn } from "../../utils/cn";
import { sendLegacyOtp, verifyLegacyOtp } from "../../services/authApi";
import { sendOtpEmail } from "../../services/emailservice";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

interface AdminEmailVerificationStepProps {
  /** Step 1's "Official Email" field value — shown in full (not masked), since this is the organization's own inbox, not a personal one. */
  officialEmail: string;
  /** Mongo `_id` of the just-registered (pending) admin user — needed to call send/verify OTP. */
  userId: string;
  onBack: () => void;
  onVerified: () => void;
}

/** mm:ss, e.g. 45 -> "00:45", 125 -> "02:05". */
function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Admin Registration — Email Verification step (Step 2). A dedicated
 * component rather than a reuse of PatientRegisterOtpStep: the Admin flow
 * verifies the organization's official email address, so the copy shows
 * the full address in-line (an official inbox isn't personally
 * identifying the way a patient's or doctor's own email is) instead of
 * masking it, and swaps the icon/microcopy/expiry note accordingly.
 */
export function AdminEmailVerificationStep({ officialEmail, userId, onBack, onVerified }: AdminEmailVerificationStepProps) {
  const prefersReducedMotion = useReducedMotion();

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  function focusInput(index: number) {
    const el = inputRefs.current[index];
    el?.focus();
    el?.select();
  }

  function handleChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "");
    setError(null);

    if (!value) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const incoming = value.split("");
    setDigits((prev) => {
      const next = [...prev];
      let cursor = index;
      for (const char of incoming) {
        if (cursor >= OTP_LENGTH) break;
        next[cursor] = char;
        cursor++;
      }
      window.setTimeout(() => focusInput(Math.min(cursor, OTP_LENGTH - 1)), 0);
      return next;
    });
  }

  function handleKeyDown(index: number, event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setError(null);
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) {
        next[i] = pasted[i] ?? next[i];
      }
      return next;
    });
    window.setTimeout(() => focusInput(Math.min(pasted.length, OTP_LENGTH - 1)), 0);
  }

  const code = digits.join("");

  // Send the first OTP the moment this step is reached.
  useEffect(() => {
    sendLegacyOtp(userId)
      .then(({ otp }) => sendOtpEmail(officialEmail, otp))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not send OTP."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    verifyLegacyOtp(userId, code)
      .then(() => {
        onVerified();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        focusInput(0);
      })
      .finally(() => setIsVerifying(false));
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    sendLegacyOtp(userId)
      .then(({ otp }) => sendOtpEmail(officialEmail, otp))
      .then(() => {
        setSecondsLeft(RESEND_SECONDS);
        setDigits(Array(OTP_LENGTH).fill(""));
        setError(null);
        focusInput(0);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not resend OTP."));
  }

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="relative flex min-h-full flex-col items-center overflow-y-auto bg-mx-bg px-6 py-10 sm:px-10 lg:h-full lg:py-12">
      {/* Logo icon only — no wordmark on this step. */}
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <Logo size={32} withWordmark={false} />
      </div>

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeSwitcher />
      </div>

      <motion.div
        {...fade}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="my-auto mx-auto w-full max-w-md pt-16 sm:pt-14"
      >
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-5 shadow-mx-md sm:p-7"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
              <Mail size={24} aria-hidden="true" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-mx-green text-mx-ink-inverse ring-2 ring-mx-surface-raised">
                <Lock size={11} aria-hidden="true" />
              </span>
            </span>
            <h1 className="font-display mt-1 text-xl font-bold text-mx-ink sm:text-[1.4rem]">
              Verify your official email
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-mx-ink-muted">
              We have sent a 6-digit OTP to your official email address
            </p>
            <p className="font-display text-base font-bold text-mx-green-strong">{officialEmail}</p>
            <p className="max-w-sm text-sm leading-relaxed text-mx-ink-muted">
              Please enter the OTP below to verify your email address.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  aria-label={`OTP digit ${index + 1} of ${OTP_LENGTH}`}
                  aria-invalid={Boolean(error)}
                  className={cn(
                    "h-12 w-10 rounded-mx-sm border bg-mx-surface text-center text-lg font-semibold text-mx-ink transition-shadow duration-150 sm:h-14 sm:w-12",
                    "border-mx-border-strong outline-none focus:border-mx-blue focus:shadow-[0_0_0_4px_var(--mx-green-soft)]",
                    error && "border-mx-danger"
                  )}
                />
              ))}
            </div>

            {error && (
              <p role="alert" className="text-center text-xs font-medium text-mx-danger">
                {error}
              </p>
            )}

            <p className="text-center text-xs text-mx-ink-muted">
              Didn't receive the email?{" "}
              {secondsLeft > 0 ? (
                <span className="font-semibold text-mx-green-strong">
                  Resend OTP ({formatCountdown(secondsLeft)})
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-mx-green-strong transition-colors duration-150 hover:text-mx-blue"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={<ArrowLeft size={16} aria-hidden="true" />}
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<ArrowRight size={16} aria-hidden="true" />}
              iconPosition="right"
              isLoading={isVerifying}
              onClick={handleSubmit}
              className="flex-[1.4] shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
            >
              Continue →
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-mx-ink-muted"
        >
          <ShieldCheck size={15} className="shrink-0 text-mx-green" aria-hidden="true" />
          <span>For your security, this OTP will expire in 10 minutes.</span>
        </motion.div>
      </motion.div>
    </div>
  );
}