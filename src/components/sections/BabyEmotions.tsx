import { useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { babyEmotions } from "../../data/babyEmotions";
import { playExclusiveSound, stopCurrentSound } from "../../lib/sound";

export function BabyEmotions() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  function toggle(id: string, sound: string) {
    if (playingId === id) {
      stopCurrentSound();
      setPlayingId(null);
      return;
    }

    const audio = playExclusiveSound(sound, 0.7);
    setPlayingId(id);
    audio.addEventListener("ended", () => setPlayingId((cur) => (cur === id ? null : cur)));
  }

  return (
    <section id="baby-emotions" className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Little Voices, Big Moments"
          title="The Sounds of Baby Emotions"
          description="Every coo, giggle and cry tells its own story. Tap a moment below to hear it come to life."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {babyEmotions.map((emotion, index) => {
            const isPlaying = playingId === emotion.id;
            return (
              <Reveal key={emotion.id} delay={index * 0.1}>
                <button
                  type="button"
                  onClick={() => toggle(emotion.id, emotion.sound)}
                  aria-pressed={isPlaying}
                  aria-label={`Play ${emotion.label} sound`}
                  className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[2rem] shadow-card outline-none ring-rose-300 transition-shadow focus-visible:ring-4"
                >
                  <Img
                    slug={emotion.image}
                    alt={emotion.label}
                    width={600}
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                      isPlaying ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/15 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    {isPlaying && (
                      <>
                        <span className="absolute h-20 w-20 animate-ping rounded-full bg-rose-400/40" />
                        <span className="absolute h-28 w-28 animate-ping rounded-full bg-rose-400/20 [animation-delay:200ms]" />
                      </>
                    )}
                    <span
                      className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                        isPlaying
                          ? "bg-rose-600 text-cream"
                          : "bg-cream/90 text-plum group-hover:bg-rose-600 group-hover:text-cream"
                      }`}
                    >
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-7 text-left">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-200">
                      <Volume2 size={13} />
                      {isPlaying ? "Now Playing" : "Tap to Listen"}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-medium text-cream">{emotion.label}</h3>
                    <p className="mt-1.5 text-sm text-cream/75">{emotion.description}</p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
