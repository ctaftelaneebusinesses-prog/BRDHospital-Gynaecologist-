import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { photos } from "../../data/images";
import { useLanguage } from "../../context/LanguageContext";

export function EmotionalCollage() {
  const { t } = useLanguage();

  return (
    <section id="about" className="relative pb-24 pt-8 sm:pb-32 sm:pt-10">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal
          className="grid h-[520px] grid-cols-6 grid-rows-6 gap-3 sm:h-[600px] sm:gap-4 lg:h-[640px]"
          y={40}
        >
          <div className="relative col-span-4 row-span-4 overflow-hidden rounded-[2rem] shadow-card">
            <Img
              slug={photos.collageFamilySofa}
              alt="Peaceful newborn baby swaddled after birth"
              width={700}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative col-span-2 row-span-3 overflow-hidden rounded-[2rem] shadow-card">
            <Img
              slug={photos.collageBellyHands}
              alt="Expectant mother smiling gently at her belly in golden evening light"
              width={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative col-span-2 row-span-3 overflow-hidden rounded-[2rem] shadow-card">
            <Img
              slug={photos.collageFatherNewborn}
              alt="Parents tenderly cradling their newborn baby's tiny feet"
              width={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative col-span-4 row-span-2 overflow-hidden rounded-[2rem] shadow-card">
            <Img
              slug={photos.collageMotherBabySepia}
              alt="Mother smiling joyfully while holding her newborn baby"
              width={700}
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sage-600">
            {t("emotionalCollage.eyebrow")}
          </span>
          <h2 className="text-balance text-3xl font-medium leading-[1.15] text-plum sm:text-4xl lg:text-[2.75rem]">
            {t("emotionalCollage.title")}
          </h2>
          <p className="mt-6 text-balance text-base leading-relaxed text-ink/70 sm:text-lg">
            {t("emotionalCollage.paragraph1")}
          </p>
          <p className="mt-4 text-balance text-base leading-relaxed text-ink/70 sm:text-lg">
            {t("emotionalCollage.paragraph2")}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
