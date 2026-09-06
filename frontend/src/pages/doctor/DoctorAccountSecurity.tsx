import type { Dispatch, SetStateAction } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { cn } from "../../utils/cn";
import type { DoctorRegisterFormState } from "./doctorRegisterTypes";

interface DoctorAccountSecurityProps {
  form: DoctorRegisterFormState;
  updateField<K extends keyof DoctorRegisterFormState>(field: K, value: DoctorRegisterFormState[K]): void;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: Dispatch<SetStateAction<boolean>>;
  consentAccepted: boolean;
  setConsentAccepted: Dispatch<SetStateAction<boolean>>;
  consentError: string | null;
  setConsentError: Dispatch<SetStateAction<string | null>>;
}

/**
 * "3. Account Security" — third card of Doctor Registration Step 1.
 * Password + Confirm Password (with show/hide + min-length helper text)
 * and the consent checkbox, styled identically to the Patient
 * Registration Account Security section — only the consent copy differs
 * per spec ("I agree to the Privacy Policy and Consent Terms").
 */
export function DoctorAccountSecurity({
  form,
  updateField,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  consentAccepted,
  setConsentAccepted,
  consentError,
  setConsentError,
}: DoctorAccountSecurityProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-mx-green-strong" aria-hidden="true" />
        <div>
          <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">3. Account Security</h2>
          <p className="text-xs text-mx-ink-muted">Secure your MediKiosk account.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="doctor-register-password" className="text-sm font-semibold text-mx-ink">
              Password <span className="text-mx-danger">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                <Lock size={17} aria-hidden="true" />
              </span>
              <input
                id="doctor-register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
                minLength={8}
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
            <p className="text-xs text-mx-ink-muted">Use at least 8 characters.</p>
          </div>
        </div>

        <div className="rounded-mx-md transition-shadow duration-150 focus-within:shadow-[0_0_0_4px_var(--mx-green-soft)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="doctor-register-confirm-password" className="text-sm font-semibold text-mx-ink">
              Confirm Password <span className="text-mx-danger">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                <Lock size={17} aria-hidden="true" />
              </span>
              <input
                id="doctor-register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                required
                minLength={8}
                className="h-11 w-full rounded-mx-sm border border-mx-border-strong bg-mx-surface pl-10 pr-11 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:border-mx-blue"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                aria-pressed={showConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-mx-sm p-1 text-mx-ink-muted transition-colors hover:text-mx-ink-soft"
              >
                {showConfirmPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2.5 text-sm text-mx-ink">
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(event) => {
              setConsentAccepted(event.target.checked);
              if (event.target.checked) setConsentError(null);
            }}
            aria-invalid={Boolean(consentError)}
            aria-describedby={consentError ? "doctor-register-consent-error" : undefined}
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border bg-mx-surface text-mx-green accent-mx-green focus:outline-none focus:ring-2 focus:ring-mx-green-soft",
              consentError ? "border-mx-danger" : "border-mx-border-strong"
            )}
          />
          <span>
            I agree to the{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="font-medium text-mx-blue underline-offset-2 transition-colors hover:text-mx-green-strong hover:underline"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/consent-terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="font-medium text-mx-blue underline-offset-2 transition-colors hover:text-mx-green-strong hover:underline"
            >
              Consent Terms
            </a>
          </span>
        </label>
        {consentError && (
          <p id="doctor-register-consent-error" role="alert" className="text-xs font-medium text-mx-danger">
            {consentError}
          </p>
        )}
      </div>
    </div>
  );
}
