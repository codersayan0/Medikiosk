import { Sun, Moon, Leaf } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";
import type { ThemeName } from "../../types";

const THEME_ICON: Record<ThemeName, typeof Sun> = { light: Sun, dark: Moon, warm: Leaf };

/** Compact three-way theme toggle, reflects the reference image's three themes. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const options: ThemeName[] = ["light", "dark", "warm"];

  return (
    <div
      className={cn("flex items-center gap-0.5 rounded-mx-sm border border-mx-border-strong bg-mx-surface p-0.5", className)}
      role="group"
      aria-label={t.a11y.switchTheme}
    >
      {options.map((name) => {
        const Icon = THEME_ICON[name];
        const active = theme === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => setTheme(name)}
            aria-pressed={active}
            aria-label={`${t.a11y.switchTheme}: ${name}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[6px] text-mx-ink-muted",
              active && "bg-mx-green text-mx-ink-inverse"
            )}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
