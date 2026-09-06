import { useRef, useState } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { cn } from "../../utils/cn";

interface LanguageSelectorProps {
  compact?: boolean;
}

/** Dropdown for switching interface language. Persists choice via LanguageProvider. */
export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const active = LANGUAGE_OPTIONS.find((opt) => opt.code === language);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.a11y.switchLanguage}
        className={cn(
          "flex items-center gap-1.5 rounded-mx-sm border border-mx-border-strong bg-mx-surface px-3 py-2 text-xs font-semibold text-mx-ink-soft hover:bg-mx-surface-sunken",
          compact && "px-2"
        )}
      >
        <Languages size={15} aria-hidden="true" />
        {!compact && <span>{active?.nativeLabel}</span>}
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t.a11y.switchLanguage}
          className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface-raised shadow-mx-md"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <li key={opt.code}>
              <button
                type="button"
                role="option"
                aria-selected={opt.code === language}
                onClick={() => {
                  setLanguage(opt.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm text-mx-ink hover:bg-mx-surface-sunken"
              >
                <span>
                  {opt.nativeLabel}
                  {opt.code !== "en" && <span className="ml-1.5 text-mx-ink-muted">{opt.label}</span>}
                </span>
                {opt.code === language && <Check size={15} className="text-mx-green" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
