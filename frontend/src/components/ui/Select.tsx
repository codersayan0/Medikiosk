import { forwardRef, useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: ReactNode;
  /** Keep the label for screen readers but visually hide it — for compact filter bars. Default false preserves the always-visible label everywhere else. */
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, icon, hideLabel = false, id, required, className, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className={hideLabel ? "sr-only" : "text-sm font-semibold text-mx-ink"}>
        {label} {required && <span className="text-mx-danger">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
            {icon}
          </span>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full appearance-none rounded-mx-sm border bg-mx-surface px-3.5 pr-10 text-sm text-mx-ink",
            "border-mx-border-strong focus:border-mx-blue",
            icon && "pl-10",
            error && "border-mx-danger",
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted"
          aria-hidden="true"
        />
      </div>
      {hint && !error && <p className="text-xs text-mx-ink-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-mx-danger">{error}</p>}
    </div>
  );
});
