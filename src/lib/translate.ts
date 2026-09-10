import type { LanguageCode } from "../i18n/translations";

const TARGET_LANGS: LanguageCode[] = ["hi", "te", "ta", "kn"];

/**
 * Auto-translates a short English phrase into every supported language using
 * MyMemory's free translation API (no key required). Used so admin-entered
 * content (e.g. a new "reason for visit" option) doesn't stay English-only.
 * Any language that fails to translate falls back to the original English
 * text rather than blocking the action that triggered it.
 */
export async function translateToAllLanguages(text: string): Promise<Partial<Record<LanguageCode, string>>> {
  const result: Partial<Record<LanguageCode, string>> = { en: text };
  await Promise.all(
    TARGET_LANGS.map(async (lang) => {
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`,
        );
        const data = await res.json();
        const translated = data?.responseData?.translatedText;
        result[lang] = typeof translated === "string" && translated.trim() ? translated.trim() : text;
      } catch {
        result[lang] = text;
      }
    }),
  );
  return result;
}
