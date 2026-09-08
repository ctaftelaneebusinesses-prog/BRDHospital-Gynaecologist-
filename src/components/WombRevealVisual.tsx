import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import motherWithBaby from "../assets/motherwithinsidebaby-optimized.webp";
import babyTalkSound from "../assets/freesound_community-baby-talk-76380.mp3";
import babyLaughSound from "../assets/freesound_community-baby-boy-laughing-70651 (1).mp3";
import babyCrySound from "../assets/dragon-studio-baby-crying-463213.mp3";

/**
 * Hotspot coordinates were measured directly from the source image
 * (1536x1024, transparent background) so the circles line up with the
 * illustrated womb window and the baby inside it.
 */
const WINDOW = { cxPct: 65.2, cyPct: 73, leftPct: 50.2, topPct: 50.5, sizePct: 30 };
const BABY = { leftPct: 56.6, topPct: 61.6, sizePct: 15.6 };

const KICK_REACTIONS = [
  "A little kick, just for you.",
  "Someone's excited today!",
  "Growing stronger every week.",
];

function playSound(url: string, volume = 0.6) {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {
    // Autoplay can still be blocked in some browsers — fail silently.
  });
}

export function WombRevealVisual({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [caption, setCaption] = useState<string | null>(null);
  const captionTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(captionTimer.current), []);

  function showCaption(text: string, ms = 2400) {
    setCaption(text);
    window.clearTimeout(captionTimer.current);
    captionTimer.current = window.setTimeout(() => setCaption(null), ms);
  }

  function handleReveal() {
    setRevealed(true);
    playSound(babyTalkSound, 0.45);
    showCaption("Hi there — I'm growing every day.");
  }

  function handleClose() {
    setRevealed(false);
    setKicks(0);
  }

  function handleKick() {
    const next = kicks + 1;
    if (next >= 4) {
      playSound(babyCrySound, 0.4);
      showCaption("Okay, okay — nap time for me!");
      setKicks(0);
    } else {
      playSound(babyLaughSound, 0.5);
      showCaption(KICK_REACTIONS[next - 1]);
      setKicks(next);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: `${WINDOW.cxPct}% ${WINDOW.cyPct}%` }}
          animate={{ scale: revealed ? 2.3 : 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={motherWithBaby}
            alt="Expectant mother gently cradling her belly, with a tasteful illustrated view of her baby inside the womb"
            className="absolute inset-0 h-full w-full object-contain"
            loading="eager"
          />

          {!revealed && (
            <button
              type="button"
              onClick={handleReveal}
              aria-label="Peek inside — reveal the baby"
              className="absolute flex items-center justify-center rounded-full"
              style={{
                left: `${WINDOW.leftPct}%`,
                top: `${WINDOW.topPct}%`,
                width: `${WINDOW.sizePct}%`,
                aspectRatio: "1 / 1",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.95, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full ring-4 ring-rose-300/70"
              />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-rose-600 shadow-soft sm:h-12 sm:w-12">
                <Sparkles size={18} />
              </span>
            </button>
          )}

          {revealed && (
            <button
              type="button"
              onClick={handleKick}
              aria-label="Tap to feel a little kick"
              className="absolute rounded-full"
              style={{
                left: `${BABY.leftPct}%`,
                top: `${BABY.topPct}%`,
                width: `${BABY.sizePct}%`,
                aspectRatio: "1 / 1",
              }}
            />
          )}
        </motion.div>

        <AnimatePresence>
          {revealed && (
            <motion.button
              key="close"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClose}
              aria-label="Zoom back out"
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-cream/95 text-plum shadow-soft sm:right-4 sm:top-4"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {caption && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-plum/90 px-4 py-2 text-xs font-medium text-cream shadow-soft"
          >
            {caption}
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && (
        <p className="mt-3 text-center text-xs font-medium text-ink/45">
          Tap the belly to meet the baby ✨
        </p>
      )}
    </div>
  );
}
