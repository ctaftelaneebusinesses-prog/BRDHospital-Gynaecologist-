import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { babyEmotions, type BabyEmotion } from "../../data/babyEmotions";
import { playExclusiveSound, stopCurrentSound } from "../../lib/sound";
import { useLanguage } from "../../context/LanguageContext";

const LABEL_KEYS: Record<string, string> = {
  crying: "babyEmotions.cryingLabel",
  laughing: "babyEmotions.laughingLabel",
  talking: "babyEmotions.talkingLabel",
};

const DESCRIPTION_KEYS: Record<string, string> = {
  crying: "babyEmotions.cryingDescription",
  laughing: "babyEmotions.laughingDescription",
  talking: "babyEmotions.talkingDescription",
};

/** Below this width the grid is a single column — each card is its own full-screen "section" while scrolling. */
const MOBILE_BREAKPOINT = 768;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function BabyEmotions() {
  const { t } = useLanguage();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  function play(id: string, sound: string) {
    const audio = playExclusiveSound(sound, 0.7);
    setPlayingId(id);
    const clear = () => setPlayingId((cur) => (cur === id ? null : cur));
    audio.addEventListener("ended", clear);
    audio.addEventListener("pause", clear);
  }

  function stop(id: string) {
    setPlayingId((cur) => {
      if (cur !== id) return cur;
      stopCurrentSound();
      return null;
    });
  }

  return (
    <section id="baby-emotions" className="relative py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow={t("babyEmotions.eyebrow")}
          title={t("babyEmotions.title")}
          description={t("babyEmotions.description")}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {babyEmotions.map((emotion, index) => {
            const label = t(LABEL_KEYS[emotion.id] ?? "") || emotion.label;
            const description = t(DESCRIPTION_KEYS[emotion.id] ?? "") || emotion.description;
            return (
              <EmotionCard
                key={emotion.id}
                emotion={emotion}
                index={index}
                label={label}
                description={description}
                isPlaying={playingId === emotion.id}
                isMobile={isMobile}
                onPlay={() => play(emotion.id, emotion.sound)}
                onStop={() => stop(emotion.id)}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}

interface EmotionCardProps {
  emotion: BabyEmotion;
  index: number;
  label: string;
  description: string;
  isPlaying: boolean;
  isMobile: boolean;
  onPlay: () => void;
  onStop: () => void;
}

function EmotionCard({ emotion, index, label, description, isPlaying, isMobile, onPlay, onStop }: EmotionCardProps) {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  // Scrolled at least halfway into view counts as "this is the section the visitor is on".
  const inView = useInView(cardRef, { amount: 0.6, once: false });

  useEffect(() => {
    if (!isMobile) return;
    if (inView) onPlay();
    else onStop();
    // onPlay/onStop are re-created every render but always target this card's own id — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, isMobile]);

  return (
    <Reveal delay={index * 0.1}>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onMouseEnter={onPlay}
        onMouseLeave={onStop}
        onFocus={onPlay}
        onBlur={onStop}
        onClick={onPlay}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onPlay();
        }}
        aria-label={`${label} — hover or tap to hear`}
        className="group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[2rem] shadow-card outline-none ring-rose-300 transition-shadow focus-visible:ring-4"
      >
        <Img
          slug={emotion.image}
          alt={label}
          width={600}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/15 to-transparent" />

        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="absolute h-16 w-16 animate-ping rounded-full bg-rose-400/30" />
            <span className="absolute h-24 w-24 animate-ping rounded-full bg-rose-400/15 [animation-delay:200ms]" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-7 text-left">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-200">
            <Volume2 size={13} />
            {isPlaying ? t("babyEmotions.nowPlaying") : t("babyEmotions.hoverToListen")}
          </p>
          <h3 className="mt-2 font-serif text-2xl font-medium text-cream">{label}</h3>
          <p className="mt-1.5 text-sm text-cream/75">{description}</p>
        </div>
      </div>
    </Reveal>
  );
}
