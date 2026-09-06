import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, required, className, rows = 4, ...rest },
  ref
) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-semibold text-mx-ink">
        {label} {required && <span className="text-mx-danger">*</span>}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full resize-y rounded-mx-sm border bg-mx-surface px-3.5 py-2.5 text-sm text-mx-ink placeholder:text-mx-ink-muted",
          "border-mx-border-strong focus:border-mx-blue",
          error && "border-mx-danger",
          className
        )}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-mx-ink-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-mx-danger">{error}</p>}
    </div>
  );
});
