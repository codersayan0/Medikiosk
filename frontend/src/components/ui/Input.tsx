import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  /** Keep the label for screen readers but visually hide it — for compact filter bars where an icon/placeholder already conveys purpose. Default false preserves the always-visible label everywhere else. */
  hideLabel?: boolean;
}

/**
 * Text input with an always-visible label by default (never placeholder-only),
 * an optional hint, and an accessible error message wired via aria-describedby.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, hideLabel = false, id, required, className, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={hideLabel ? "sr-only" : "text-sm font-semibold text-mx-ink"}>
        {label} {required && <span className="text-mx-danger">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full rounded-mx-sm border bg-mx-surface px-3.5 text-sm text-mx-ink placeholder:text-mx-ink-muted",
            "border-mx-border-strong focus:border-mx-blue",
            icon && "pl-10",
            error && "border-mx-danger",
            className
          )}
          {...rest}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-mx-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-xs font-medium text-mx-danger">
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});
