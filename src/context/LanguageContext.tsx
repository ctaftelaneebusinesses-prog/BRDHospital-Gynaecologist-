import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { translations, type LanguageCode } from "../i18n/translations";

type Translations = typeof translations.en;

const STORAGE_KEY = "brd-hospital-language";

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && stored in translations) return stored as LanguageCode;
  return "en";
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tList: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value =
        (getByPath(translations[language] as Translations, key) as string | undefined) ??
        (getByPath(translations.en, key) as string | undefined) ??
        key;

      if (!vars) return value;
      return Object.entries(vars).reduce(
        (result, [varKey, varValue]) => result.replaceAll(`{${varKey}}`, String(varValue)),
        value,
      );
    },
    [language],
  );

  const tList = useCallback(
    (key: string) => {
      const value =
        (getByPath(translations[language] as Translations, key) as string[] | undefined) ??
        (getByPath(translations.en, key) as string[] | undefined) ??
        [];
      return value;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t, tList }), [language, setLanguage, t, tList]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
