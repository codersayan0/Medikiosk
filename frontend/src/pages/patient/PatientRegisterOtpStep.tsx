import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import {
  sendOtp,
  verifyOtp,
} from "../../services/authApi";

import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";


// ======================================================
// PROPS
// ======================================================

interface PatientRegisterOtpStepProps {
  email: string;
  name?: string;
  onBack: () => void;
  onVerified: () => void;
}


// ======================================================
// CONSTANTS
// ======================================================

const OTP_LENGTH = 6;

const OTP_EXPIRY_SECONDS = 10 * 60;

const RESEND_SECONDS = 30;


// ======================================================
// COMPONENT
// ======================================================

export function PatientRegisterOtpStep({
  email,
  name,
  onBack,
  onVerified,
}: PatientRegisterOtpStepProps) {

  const { showToast } = useToast();


  // ====================================================
  // OTP STATE
  // ====================================================

  const [
    digits,
    setDigits,
  ] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );


  const [
    secondsLeft,
    setSecondsLeft,
  ] = useState(
    OTP_EXPIRY_SECONDS
  );


  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0);


  const [
    isSending,
    setIsSending,
  ] = useState(false);


  const [
    isVerifying,
    setIsVerifying,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  // ====================================================
  // INPUT REFS
  // ====================================================

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);


  // IMPORTANT:
  // Prevent duplicate initial OTP sends caused by
  // React StrictMode running effects twice in development.
  const initialOtpSentRef =
    useRef(false);


  // ====================================================
  // EMAIL NORMALIZATION
  // ====================================================

  const normalizedEmail =
    email.trim().toLowerCase();


  // ====================================================
  // FOCUS INPUT
  // ====================================================

  function focusInput(
    index: number
  ) {
    const input =
      inputRefs.current[index];

    input?.focus();
    input?.select();
  }


  // ====================================================
  // SEND OTP
  // ====================================================

  async function handleSendOtp() {

    if (!normalizedEmail) {
      setError(
        "Email address is required."
      );
      return;
    }


    setIsSending(true);
    setError(null);


    try {

      await sendOtp(
        normalizedEmail,
        name
      );


      // Reset OTP timer
      setSecondsLeft(
        OTP_EXPIRY_SECONDS
      );


      // Start resend cooldown
      setResendSeconds(
        RESEND_SECONDS
      );


      // Clear entered digits
      setDigits(
        Array(OTP_LENGTH).fill("")
      );


      showToast({
        tone: "success",
        title: "OTP sent",
        description:
          "A verification code has been sent to your email.",
      });


      window.setTimeout(() => {
        focusInput(0);
      }, 50);


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Could not send OTP. Please try again."
      );

    } finally {

      setIsSending(false);
    }
  }


  // ====================================================
  // INITIAL OTP
  // ====================================================

  useEffect(() => {

    // Prevent duplicate OTP in development StrictMode
    if (initialOtpSentRef.current) {
      return;
    }


    initialOtpSentRef.current = true;


    void handleSendOtp();


    // The component intentionally sends one OTP
    // when the OTP page is first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ====================================================
  // OTP EXPIRY COUNTDOWN
  // ====================================================

  useEffect(() => {

    if (secondsLeft <= 0) {
      return;
    }


    const timer =
      window.setInterval(() => {

        setSecondsLeft(
          (current) =>
            current > 0
              ? current - 1
              : 0
        );

      }, 1000);


    return () => {
      window.clearInterval(timer);
    };

  }, [secondsLeft]);


  // ====================================================
  // RESEND COUNTDOWN
  // ====================================================

  useEffect(() => {

    if (resendSeconds <= 0) {
      return;
    }


    const timer =
      window.setInterval(() => {

        setResendSeconds(
          (current) =>
            current > 0
              ? current - 1
              : 0
        );

      }, 1000);


    return () => {
      window.clearInterval(timer);
    };

  }, [resendSeconds]);


  // ====================================================
  // FORMAT TIME
  // ====================================================

  function formatTime(
    totalSeconds: number
  ) {

    const minutes =
      Math.floor(
        totalSeconds / 60
      );


    const seconds =
      totalSeconds % 60;


    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }


  // ====================================================
  // DIGIT CHANGE
  // ====================================================

  function handleDigitChange(
    index: number,
    value: string
  ) {

    const numericValue =
      value.replace(
        /\D/g,
        ""
      );


    // Empty input
    if (!numericValue) {

      const updated =
        [...digits];

      updated[index] = "";

      setDigits(updated);

      setError(null);

      return;
    }


    const updated =
      [...digits];


    // Only use last numeric character
    updated[index] =
      numericValue[
        numericValue.length - 1
      ];


    setDigits(updated);

    setError(null);


    // Move to next input
    if (
      index <
      OTP_LENGTH - 1
    ) {

      window.setTimeout(() => {
        focusInput(index + 1);
      }, 0);
    }
  }


  // ====================================================
  // KEYBOARD HANDLING
  // ====================================================

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {

    if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {

      event.preventDefault();

      focusInput(
        index - 1
      );

      return;
    }


    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {

      event.preventDefault();

      focusInput(
        index - 1
      );

      return;
    }


    if (
      event.key === "ArrowRight" &&
      index <
        OTP_LENGTH - 1
    ) {

      event.preventDefault();

      focusInput(
        index + 1
      );
    }
  }


  // ====================================================
  // PASTE OTP
  // ====================================================

  function handlePaste(
    event: React.ClipboardEvent<HTMLInputElement>
  ) {

    event.preventDefault();


    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);


    if (!pasted) {
      return;
    }


    const updated =
      Array(OTP_LENGTH).fill("");


    pasted
      .split("")
      .forEach(
        (
          digit,
          index
        ) => {
          updated[index] =
            digit;
        }
      );


    setDigits(updated);

    setError(null);


    const focusIndex =
      Math.min(
        pasted.length,
        OTP_LENGTH - 1
      );


    window.setTimeout(() => {
      focusInput(
        focusIndex
      );
    }, 0);
  }


  // ====================================================
  // VERIFY OTP
  // ====================================================

  async function handleVerify() {

    const code =
      digits.join("");


    if (
      code.length !==
      OTP_LENGTH
    ) {

      setError(
        "Please enter the complete 6-digit OTP."
      );

      return;
    }


    if (
      secondsLeft <= 0
    ) {

      setError(
        "OTP has expired. Please request a new OTP."
      );

      return;
    }


    setIsVerifying(true);
    setError(null);


    try {

      const verified =
        await verifyOtp(
          normalizedEmail,
          code
        );


      if (!verified) {
        throw new Error(
          "Unable to verify OTP."
        );
      }


      showToast({
        tone: "success",
        title: "Email verified",
        description:
          "Your email has been successfully verified.",
      });


      onVerified();


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Invalid OTP. Please try again."
      );


      setDigits(
        Array(OTP_LENGTH).fill("")
      );


      window.setTimeout(() => {
        focusInput(0);
      }, 50);


    } finally {

      setIsVerifying(false);
    }
  }


  // ====================================================
  // RESEND OTP
  // ====================================================

  async function handleResend() {

    if (
      resendSeconds > 0 ||
      isSending ||
      isVerifying
    ) {
      return;
    }


    await handleSendOtp();
  }


  // ====================================================
  // FORM SUBMIT
  // ====================================================

  function handleFormSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (
      !isVerifying
    ) {

      void handleVerify();
    }
  }


  // ====================================================
  // MASK EMAIL
  // ====================================================

  const maskedEmail =
    (() => {

      const parts =
        normalizedEmail.split(
          "@"
        );


      if (
        parts.length !== 2
      ) {
        return normalizedEmail;
      }


      const username =
        parts[0];

      const domain =
        parts[1];


      if (
        username.length <= 2
      ) {

        return `${
          username[0] ?? ""
        }***@${domain}`;
      }


      return `${username.slice(
        0,
        2
      )}***@${domain}`;

    })();


  // ====================================================
  // REDUCED MOTION
  // ====================================================

  const animationProps =
    {
      initial: {
        opacity: 0,
        y: 12,
      },

      animate: {
        opacity: 1,
        y: 0,
      },

      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    };


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="relative flex min-h-full flex-col items-center overflow-y-auto bg-mx-bg px-6 py-10 sm:px-10 lg:h-full lg:py-12">

      <motion.div
        {...animationProps}
        className="my-auto mx-auto w-full max-w-md pt-16 sm:pt-14"
      >

        {/* ==================================================
            OTP CARD
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            delay: 0.1,
          }}
          className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-5 shadow-mx-md sm:p-7"
        >

          {/* ================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col items-center gap-2 text-center">

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">

              <ShieldCheck
                size={20}
                aria-hidden="true"
              />

            </span>


            <h1 className="font-display mt-1 text-xl font-bold text-mx-ink sm:text-[1.4rem]">
              Verify Your Email
            </h1>


            <p className="max-w-sm text-sm leading-relaxed text-mx-ink-muted">
              We sent a 6-digit verification code to
            </p>


            <p className="break-all font-semibold text-mx-ink">
              {maskedEmail}
            </p>

          </div>


          {/* ================================================
              OTP FORM
          ================================================= */}

          <form
            onSubmit={handleFormSubmit}
            className="mt-6"
            noValidate
          >

            {/* ==============================================
                OTP INPUTS
            =============================================== */}

            <div
              className="mt-6 flex items-center justify-center gap-2 sm:gap-2.5"
              role="group"
              aria-label="Email verification code"
            >

              {digits.map(
                (
                  digit,
                  index
                ) => (

                  <input
                    key={index}

                    ref={(element) => {
                      inputRefs.current[
                        index
                      ] = element;
                    }}

                    type="text"

                    inputMode="numeric"

                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }

                    maxLength={1}

                    value={digit}

                    onChange={(event) =>
                      handleDigitChange(
                        index,
                        event.target.value
                      )
                    }

                    onKeyDown={(event) =>
                      handleKeyDown(
                        index,
                        event
                      )
                    }

                    onPaste={
                      index === 0
                        ? handlePaste
                        : undefined
                    }

                    disabled={
                      isSending ||
                      isVerifying
                    }

                    aria-label={`OTP digit ${
                      index + 1
                    } of ${
                      OTP_LENGTH
                    }`}

                    aria-invalid={
                      Boolean(error)
                    }

                    className={cnOtp(
                      Boolean(error)
                    )}
                  />

                )
              )}

            </div>


            {/* ==============================================
                EXPIRY TIMER
            =============================================== */}

            <div className="mt-5 text-center">

              {secondsLeft > 0 ? (

                <p className="text-xs text-mx-ink-muted">

                  OTP expires in{" "}

                  <span className="font-semibold text-mx-ink">

                    {formatTime(
                      secondsLeft
                    )}

                  </span>

                </p>

              ) : (

                <p className="text-xs font-semibold text-mx-danger">
                  OTP has expired.
                </p>

              )}

            </div>


            {/* ==============================================
                ERROR
            =============================================== */}

            {error && (

              <motion.p
                initial={{
                  opacity: 0,
                  y: -4,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                role="alert"

                className="mt-4 text-center text-xs font-medium text-mx-danger"
              >
                {error}
              </motion.p>

            )}


            {/* ==============================================
                VERIFY BUTTON
            =============================================== */}

            <Button
              type="submit"

              variant="primary"

              size="lg"

              fullWidth

              isLoading={
                isVerifying
              }

              disabled={
                isSending ||
                isVerifying ||
                secondsLeft <= 0 ||
                digits.join("").length !==
                  OTP_LENGTH
              }

              className="mt-6 shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
            >

              {isVerifying
                ? "Verifying…"
                : "Verify Email"}

            </Button>


            {/* ==============================================
                RESEND
            =============================================== */}

            <div className="mt-5 text-center">

              <p className="text-xs text-mx-ink-muted">
                Didn't receive the code?
              </p>


              <button
                type="button"

                onClick={
                  handleResend
                }

                disabled={
                  resendSeconds > 0 ||
                  isSending ||
                  isVerifying
                }

                className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-mx-blue transition-colors hover:text-mx-green-strong disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  size={14}
                  className={
                    isSending
                      ? "animate-spin"
                      : ""
                  }
                  aria-hidden="true"
                />

                {isSending
                  ? "Sending…"
                  : resendSeconds >
                    0
                  ? `Resend in ${resendSeconds}s`
                  : "Resend OTP"}

              </button>

            </div>


            {/* ==============================================
                BACK
            =============================================== */}

            <div className="mt-7">

              <button
                type="button"

                onClick={onBack}

                disabled={
                  isSending ||
                  isVerifying
                }

                className="inline-flex w-full items-center justify-center gap-2 rounded-mx-sm border border-mx-border-strong px-4 py-2.5 text-sm font-semibold text-mx-ink-soft transition-colors hover:bg-mx-bg disabled:cursor-not-allowed disabled:opacity-50"
              >

                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                />

                Back

              </button>

            </div>

          </form>


          {/* ================================================
              SECURITY MESSAGE
          ================================================= */}

          <div className="mt-7 flex items-start gap-2 rounded-mx-md border border-mx-border bg-mx-bg px-4 py-3 text-xs leading-5 text-mx-ink-muted">

            <ShieldCheck
              size={15}
              className="mt-0.5 shrink-0 text-mx-green"
              aria-hidden="true"
            />

            <span>
              Your verification code is valid
              for 10 minutes. Never share your OTP
              with anyone.
            </span>

          </div>

        </motion.div>

      </motion.div>

    </div>
  );
}


// ======================================================
// OTP INPUT CLASS HELPER
// ======================================================

function cnOtp(
  hasError: boolean
): string {

  return [
    "h-12 w-10 rounded-mx-sm border",
    "bg-mx-surface text-center text-lg font-semibold text-mx-ink",
    "outline-none transition-all duration-150",
    "border-mx-border-strong",
    "focus:border-mx-blue",
    "focus:shadow-[0_0_0_4px_var(--mx-green-soft)]",
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
    hasError
      ? "border-mx-danger"
      : "",
    "sm:h-14 sm:w-12",
  ]
    .filter(Boolean)
    .join(" ");
}