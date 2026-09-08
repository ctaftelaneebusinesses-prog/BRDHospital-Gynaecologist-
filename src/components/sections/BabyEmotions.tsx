import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { babyEmotions } from "../../data/babyEmotions";
import { playExclusiveSound, stopCurrentSound } from "../../lib/sound";

export function BabyEmotions() {
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
    <section id="baby-emotions" className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Little Voices, Big Moments"
          title="The Sounds of Baby Emotions"
          description="Every coo, giggle and cry tells its own story. Hover or tap a moment below to hear it come to life."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {babyEmotions.map((emotion, index) => {
            const isPlaying = playingId === emotion.id;
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
                  aria-label={`${emotion.label} — hover or tap to hear`}
                  className="group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[2rem] shadow-card outline-none ring-rose-300 transition-shadow focus-visible:ring-4"
                >
                  <Img
                    slug={emotion.image}
                    alt={emotion.label}
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
                      {isPlaying ? "Now Playing" : "Hover to Listen"}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-medium text-cream">{emotion.label}</h3>
                    <p className="mt-1.5 text-sm text-cream/75">{emotion.description}</p>
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
