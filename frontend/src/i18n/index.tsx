import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LanguageCode, LanguageOption } from "../types";
import en from "./en";
import bn from "./bn";
import hi from "./hi";
import type { TranslationSchema } from "./en";

/** Registry of every supported language. Add a new file + entry here to extend. */
const dictionaries: Record<LanguageCode, TranslationSchema> = { en, bn, hi };

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

const STORAGE_KEY = "medikiosk-language";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (stored && stored in dictionaries) return stored;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (code: LanguageCode) => setLanguageState(code);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Access the active translation dictionary + language switcher anywhere in the tree. */
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within a LanguageProvider");
  return ctx;
}

/**
 * Look up a dictionary by language code directly, bypassing the active
 * context language. Used sparingly — e.g. the AI Health Interview's Voice
 * Input, where the voice-interaction language is chosen independently of
 * the global interface language (see AiHealthInterview). This still reads
 * from the single existing i18n registry, just for a language other than
 * the one currently active.
 */
export function getDictionary(code: LanguageCode): TranslationSchema {
  return dictionaries[code];
}
