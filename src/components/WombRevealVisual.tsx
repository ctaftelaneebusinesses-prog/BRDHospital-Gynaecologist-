import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { X } from "lucide-react";
import motherDefault from "../assets/backgorundremovedmom.png";
import wombIllustration from "../assets/wombIllustration.webp";
import babyLaughSound from "../assets/BabyLau.mp3";
import { playExclusiveSound } from "../lib/sound";

/**
 * Coordinates measured directly on the untouched mother photo
 * (backgorundremovedmom.png, 1024x1536) — the belly circle sits
 * naturally between her two hands.
 */
const BELLY = { cxPct: 36, cyPct: 70.5, leftPct: 14, topPct: 55.5, sizePct: 44 };

const KICK_MESSAGES = ["Your little one just moved! 💕", "Did you feel that? 💕"];

export function WombRevealVisual({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [kickToast, setKickToast] = useState<string | null>(null);
  const zoom = useAnimation();
  const kick = useAnimation();
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function handleReveal() {
    setRevealed(true);
    zoom.start({ scale: 1.07, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } });
  }

  function handleClose() {
    setRevealed(false);
    setKickToast(null);
    zoom.start({ scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } });
  }

  function handleKick() {
    playExclusiveSound(babyLaughSound, 0.6);
    kick.start({
      rotate: [0, -3.2, 2.6, -1.6, 0.8, 0],
      scale: [1, 1.05, 0.97, 1.03, 0.99, 1],
      transition: { duration: 0.7, ease: "easeInOut" },
    });
    const msg = KICK_MESSAGES[Math.floor(Math.random() * KICK_MESSAGES.length)];
    setKickToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setKickToast(null), 2200);
  }

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={zoom}
        style={{ transformOrigin: `${BELLY.cxPct}% ${BELLY.cyPct}%` }}
        className="relative aspect-[3/4] w-full overflow-hidden"
      >
        {/* The uploaded mother photo — always present, never replaced. */}
        <img
          src={motherDefault}
          alt="Expectant mother gently cradling her belly"
          className="absolute inset-0 h-full w-full object-contain object-bottom"
          loading="eager"
        />

        {/* Subtle non-button glow hotspot, default state only */}
        <AnimatePresence>
          {!revealed && (
            <motion.button
              key="hotspot"
              type="button"
              onClick={handleReveal}
              aria-label="Meet your little one"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute cursor-pointer rounded-full bg-transparent"
              style={{
                left: `${BELLY.leftPct}%`,
                top: `${BELLY.topPct}%`,
                width: `${BELLY.sizePct}%`,
                aspectRatio: "1 / 1",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-rose-200/40 blur-md"
              />
              <motion.span
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full ring-1 ring-rose-300/70"
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Separate transparent layer: the womb/baby illustration, precisely over the belly */}
        <AnimatePresence>
          {revealed && (
            <motion.button
              key="womb"
              type="button"
              onClick={handleKick}
              aria-label="Tap the baby"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82, transition: { duration: 0.35 } }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute cursor-pointer"
              style={{
                left: `${BELLY.leftPct}%`,
                top: `${BELLY.topPct}%`,
                width: `${BELLY.sizePct}%`,
                aspectRatio: "1 / 1",
              }}
            >
              <motion.span animate={kick} className="absolute inset-0 block">
                <img
                  src={wombIllustration}
                  alt="Illustrated view of the baby inside the womb, with umbilical cord and placenta"
                  className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(184,103,122,0.35)]"
                  loading="eager"
                />
              </motion.span>

              {kickToast && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.6, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full ring-2 ring-rose-300"
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Close / back button */}
      <AnimatePresence>
        {revealed && (
          <motion.button
            key="close"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClose}
            aria-label="Close and return to the original view"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-cream/95 text-plum shadow-soft sm:right-4 sm:top-4"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Kick reaction toast */}
      <AnimatePresence>
        {kickToast && (
          <motion.div
            key="kick-toast"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-plum/90 px-4 py-2 text-xs font-medium text-cream shadow-soft"
          >
            {kickToast}
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed ? (
        <p className="mt-3 text-center text-xs font-medium text-ink/45">Meet your little one</p>
      ) : (
        <p className="mt-3 text-center text-sm text-ink/60">
          <span className="font-serif text-base font-medium text-rose-600">24 Weeks</span> — Your
          baby is growing beautifully.
        </p>
      )}
    </div>
  );
}
