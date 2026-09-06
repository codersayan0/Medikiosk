import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../../services/authApi";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Plus,
  MoveVertical,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";
import doctorMascot from "../../assets/illustrations/doctor-mascot.png";

/**
 * Doctor sign-in screen, built to sit exactly inside the viewport below
 * the Navbar (no Footer, no page scroll on desktop — see AuthLayout).
 * Mirrors PatientLoginPage 1:1: hero/mascot panel on the left,
 * credential form on the right. Auth wiring is out of scope here —
 * submission is simulated so the full flow and states can be reviewed
 * end-to-end.
 */
export default function DoctorLoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useTranslation();
  const { showToast } = useToast();
  const { setSession } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!identifier.trim() || !password.trim()) {
    setError(
      "Enter your Doctor ID or email, and your password, to continue."
    );
    return;
  }

  setError(null);
  setIsSubmitting(true);

  try {

    const result = await login({
      identifier: identifier.trim(),
      password,
    });

    if (result.user.role !== "doctor") {
      throw new Error("This account is not registered as a doctor.");
    }

    setSession(result.access_token, result.user);

    showToast({
      tone: "success",
      title: "Sign-in successful",
      description: `Welcome back, ${result.user.full_name}.`,
    });

    navigate("/doctor/dashboard");

  } catch (error) {

    setError(
      error instanceof Error
        ? error.message
        : "Unable to sign in. Please try again."
    );

  } finally {

    setIsSubmitting(false);

  }
}

  return (
    <div className="flex min-h-full flex-col overflow-y-auto lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden">
      {/* ============================== Hero / illustration panel ============================== */}
      <div className="relative flex w-full shrink-0 flex-col overflow-hidden bg-gradient-to-br from-mx-green-soft via-mx-bg to-mx-blue-soft px-6 py-6 sm:px-10 sm:py-8 lg:h-full lg:w-1/2 lg:px-12 lg:py-8 xl:px-16">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-16 top-1/3 h-56 w-56 rounded-full bg-mx-green/10 blur-2xl" />
          <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-mx-blue/10 blur-2xl" />

          {/* Dotted grid, top-left */}
          <svg className="absolute left-[6%] top-[24%] hidden h-14 w-14 opacity-40 sm:block" viewBox="0 0 56 56">
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 4 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={6 + col * 15} cy={6 + row * 15} r="2" fill="var(--mx-green)" />
              ))
            )}
          </svg>
          {/* Dotted grid, top-right */}
          <svg className="absolute right-[10%] top-[10%] hidden h-14 w-14 opacity-30 sm:block" viewBox="0 0 56 56">
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 4 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={6 + col * 15} cy={6 + row * 15} r="2" fill="var(--mx-blue)" />
              ))
            )}
          </svg>

          <Plus className="absolute left-[16%] top-[46%] hidden h-7 w-7 text-mx-green/30 sm:block" strokeWidth={3} />
          <Plus className="absolute left-[24%] top-[58%] hidden h-4 w-4 text-mx-blue/25 sm:block" strokeWidth={3} />
          <MoveVertical
            className="absolute right-[10%] top-[42%] hidden h-6 w-6 text-mx-ink-muted/40 lg:block"
            strokeWidth={2.5}
          />

          <svg
            className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 opacity-[0.4] sm:block"
            height="70"
            viewBox="0 0 500 70"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 35 H160 L182 10 L206 60 L230 24 L250 35 H500"
              stroke="var(--mx-green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 shrink-0"
        >
          <Logo size={32} withWordmark />
          <p className="mt-0.5 pl-[42px] text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
            AI Health Assistant
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-2"
        >
          <motion.img
            src={doctorMascot}
            alt="Friendly MediKiosk doctor illustration, waving hello"
            className="h-full max-h-[46vh] w-auto object-contain drop-shadow-xl sm:max-h-[50vh] lg:max-h-full motion-reduce:animate-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
          className="relative z-10 shrink-0"
        >
          <h2 className="font-display text-2xl font-extrabold leading-[1.15] text-mx-ink sm:text-3xl">
            Empowering Your <br />
            <span className="text-[var(--mx-green-strong)]">Clinical Practice</span> <br />
            With Smarter Care.
          </h2>
        </motion.div>

        {/* Quick language row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative z-10 mt-4 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-mx-border/70 pt-3 text-xs"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              aria-pressed={opt.code === language}
              className={cn(
                "font-medium transition-colors",
                opt.code === language ? "text-mx-green-strong font-semibold" : "text-mx-ink-muted hover:text-mx-ink-soft"
              )}
            >
              {opt.nativeLabel}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              showToast({ tone: "info", title: "More languages", description: "Additional languages are on the way." })
            }
            className="font-medium text-mx-ink-muted hover:text-mx-ink-soft"
          >
            More languages…
          </button>
        </motion.div>
      </div>

      {/* ============================== Form panel ============================== */}
      <div className="flex w-full flex-1 flex-col justify-center px-6 py-6 sm:px-10 sm:py-8 lg:h-full lg:w-1/2 lg:overflow-y-auto lg:px-16 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className="mx-auto w-full max-w-sm py-2"
        >
          <div className="mb-1 hidden lg:block">
            <Logo size={28} withWordmark />
          </div>

          <h1 className="font-display mt-3 text-2xl font-bold text-mx-ink sm:text-[1.75rem]">Welcome Back, Doctor</h1>
          <p className="mt-1 text-sm text-mx-ink-muted">Sign in to access your MediKiosk clinical workspace.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
              <Input
                label="Doctor ID or Email Address"
                type="text"
                name="identifier"
                autoComplete="username"
                placeholder="Doctor ID or Email Address"
                icon={<User size={17} aria-hidden="true" />}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>

            <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="doctor-password" className="text-sm font-semibold text-mx-ink">
                  Password <span className="text-mx-danger">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                    <Lock size={17} aria-hidden="true" />
                  </span>
                  <input
                    id="doctor-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 w-full rounded-mx-sm border border-mx-border-strong bg-mx-surface pl-10 pr-11 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:border-mx-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-mx-sm p-1 text-mx-ink-muted transition-colors hover:text-mx-ink-soft"
                  >
                    {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p role="alert" className="-mt-2 text-xs font-medium text-mx-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              icon={<ArrowRight size={17} aria-hidden="true" />}
              iconPosition="right"
              className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
            >
              {isSubmitting ? "Signing In…" : "Log In"}
            </Button>

            <button
              type="button"
              onClick={() =>
                showToast({
                  tone: "info",
                  title: "Password reset coming soon",
                  description: "This will be wired up alongside doctor authentication.",
                })
              }
              className="-mt-1 text-center text-sm font-semibold text-mx-blue transition-colors hover:text-mx-green-strong"
            >
              Forgot Password?
            </button>

            <div className="flex items-center gap-3" role="separator">
              <span className="h-px flex-1 bg-mx-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-mx-ink-muted">or</span>
              <span className="h-px flex-1 bg-mx-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              icon={<UserPlus size={17} aria-hidden="true" />}
              onClick={() => navigate("/doctor/register")}
              className="transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              Create Doctor Account
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-mx-ink-muted">
            <ShieldCheck size={15} className="shrink-0 text-mx-green" aria-hidden="true" />
            <span>Patient information is handled securely and is accessible according to your authorized access.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
