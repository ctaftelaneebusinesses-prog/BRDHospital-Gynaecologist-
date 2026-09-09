import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { languageOptions } from "../i18n/translations";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = languageOptions.find((option) => option.code === language) ?? languageOptions[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-plum/5 hover:text-plum"
      >
        <Globe size={16} />
        {current.label}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-2xl border border-plum/10 bg-cream shadow-xl">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-rose-50 ${
                option.code === language ? "bg-rose-50 text-rose-600" : "text-ink/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
