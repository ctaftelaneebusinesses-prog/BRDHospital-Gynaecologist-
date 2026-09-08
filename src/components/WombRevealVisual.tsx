import { useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import motherDefault from "../assets/backgorundremovedmom.png";
import motherWithBaby from "../assets/motherwithinsidebaby-optimized.webp";
import babyLaughSound from "../assets/freesound_community-baby-boy-laughing-70651 (1).mp3";
import { playExclusiveSound } from "../lib/sound";

/** Hotspot measured directly on the background-removed mother photo (1024x1536). */
const BELLY_HOTSPOT = { leftPct: 14, topPct: 55, sizePct: 46 };
/** Hotspot on the baby-reveal illustration (1536x1024). */
const BABY_HOTSPOT = { leftPct: 56.6, topPct: 61.6, sizePct: 15.6 };

export function WombRevealVisual({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const controls = useAnimation();

  function handleReveal() {
    setRevealed(true);
  }

  function handleKick() {
    playExclusiveSound(babyLaughSound, 0.65);
    controls.start({
      x: [0, -9, 7, -5, 3, 0],
      y: [0, 3, -4, 2, -1, 0],
      rotate: [0, -1.6, 1.4, -1, 0.5, 0],
      scale: [1, 1.025, 0.985, 1.015, 0.995, 1],
      transition: { duration: 0.55, ease: "easeInOut" },
    });
  }

  return (
    <div className={`relative ${className}`}>
      <motion.div animate={controls} className="relative aspect-[3/4] w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!revealed ? (
            <motion.img
              key="default"
              src={motherDefault}
              alt="Expectant mother gently cradling her belly"
              className="absolute inset-0 h-full w-full object-contain object-bottom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              loading="eager"
            />
          ) : (
            <motion.img
              key="revealed"
              src={motherWithBaby}
              alt="Expectant mother with a tasteful illustrated view of her baby inside the womb"
              className="absolute inset-0 h-full w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              loading="eager"
            />
          )}
        </AnimatePresence>

        {!revealed && (
          <button
            type="button"
            onClick={handleReveal}
            aria-label="Tap the belly to meet the baby"
            className="absolute flex items-center justify-center rounded-full"
            style={{
              left: `${BELLY_HOTSPOT.leftPct}%`,
              top: `${BELLY_HOTSPOT.topPct}%`,
              width: `${BELLY_HOTSPOT.sizePct}%`,
              aspectRatio: "1 / 1",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full ring-4 ring-rose-300/70"
            />
          </button>
        )}

        {revealed && (
          <button
            type="button"
            onClick={handleKick}
            aria-label="Tap the baby"
            className="absolute rounded-full"
            style={{
              left: `${BABY_HOTSPOT.leftPct}%`,
              top: `${BABY_HOTSPOT.topPct}%`,
              width: `${BABY_HOTSPOT.sizePct}%`,
              aspectRatio: "1 / 1",
            }}
          />
        )}
      </motion.div>

      {!revealed && (
        <p className="mt-3 text-center text-xs font-medium text-ink/45">
          Tap the belly to meet the baby ✨
        </p>
      )}
    </div>
  );
}
