import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { babyEmotions } from "../../data/babyEmotions";
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

export function BabyEmotions() {
  const { t } = useLanguage();
  const [playingId, setPlayingId] = useState<string | null>(null);

  function play(id: string, sound: string) {
    const audio = playExclusiveSound(sound, 0.7);
    setPlayingId(id);
    const clear = () => setPlayingId((cur) => (cur === id ? null : cur));
    audio.addEventListener("ended", clear);
    audio.addEventListener("pause", clear);
  }

  function stop() {
    stopCurrentSound();
    setPlayingId(null);
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
            const isPlaying = playingId === emotion.id;
            const label = t(LABEL_KEYS[emotion.id] ?? "") || emotion.label;
            const description = t(DESCRIPTION_KEYS[emotion.id] ?? "") || emotion.description;
            return (
              <Reveal key={emotion.id} delay={index * 0.1}>
                <div
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => play(emotion.id, emotion.sound)}
                  onMouseLeave={stop}
                  onFocus={() => play(emotion.id, emotion.sound)}
                  onBlur={stop}
                  onClick={() => play(emotion.id, emotion.sound)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") play(emotion.id, emotion.sound);
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
          })}
        </div>
      </Container>
    </section>
  );
}
