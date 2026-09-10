import { AnimatePresence, motion } from "framer-motion";
import { X, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { languageOptions } from "../i18n/translations";

const GREETINGS = ["Select your language", "अपनी भाषा चुनें", "మీ భాషను ఎంచుకోండి", "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்", "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"];

export function LanguageWelcomeModal() {
  const { hasChosenLanguage, confirmLanguage } = useLanguage();

  return (
    <AnimatePresence>
      {!hasChosenLanguage && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-plum/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-[1.75rem] bg-cream p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => confirmLanguage("en")}
              aria-label="Close and use English"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-plum/50 transition-colors hover:bg-plum/5 hover:text-plum"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Globe size={22} />
            </div>

            <div className="mt-4 space-y-1 text-center">
              {GREETINGS.map((line) => (
                <p key={line} className="font-serif text-base font-medium text-plum sm:text-lg">
                  {line}
                </p>
              ))}
            </div>

            <div className="mt-6 space-y-2.5">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => confirmLanguage(option.code)}
                  className="block w-full rounded-2xl border border-plum/12 bg-white px-4 py-3.5 text-center text-sm font-semibold text-plum transition-colors hover:border-rose-300 hover:bg-rose-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
