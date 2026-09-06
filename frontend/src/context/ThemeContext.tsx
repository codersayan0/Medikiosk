import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ThemeName } from "../types";

const STORAGE_KEY = "medikiosk-theme";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
  /** True while a page renders its own full header (Logo + LanguageSelector +
   *  ThemeSwitcher) — e.g. Document Upload, AI Health Interview, Review
   *  Summary, Account Created. AuthLayout's floating top-right ThemeSwitcher
   *  is only meant as a stand-in for auth screens that have no header of
   *  their own (Login, Register, OTP); without this flag it would render a
   *  second, overlapping ThemeSwitcher on top of a page's own one. */
  hasPageHeader: boolean;
  setHasPageHeader: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_ORDER: ThemeName[] = ["light", "dark", "warm"];

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  if (stored && THEME_ORDER.includes(stored)) return stored;
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme);
  const [hasPageHeader, setHasPageHeader] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (next: ThemeName) => setThemeState(next);
  const cycleTheme = () =>
    setThemeState((current) => {
      const idx = THEME_ORDER.indexOf(current);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });

  const value = useMemo(
    () => ({ theme, setTheme, cycleTheme, hasPageHeader, setHasPageHeader }),
    [theme, hasPageHeader]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}