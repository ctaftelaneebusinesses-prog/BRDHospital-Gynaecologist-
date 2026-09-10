import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Sun, HeartPulse, Baby, HeartHandshake, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { Button } from "../ui/Button";
import { journeyStages } from "../../data/journey";
import { useBooking } from "../../context/BookingContext";
import { useLanguage } from "../../context/LanguageContext";

const STAGE_TEXT_KEYS: Record<string, string> = {
  "first-trimester": "firstTrimester",
  "second-trimester": "secondTrimester",
  "third-trimester": "thirdTrimester",
  delivery: "delivery",
  postnatal: "postnatal",
};

const STAGE_ICONS: Record<string, typeof Sparkles> = {
  "first-trimester": Sparkles,
  "second-trimester": Sun,
  "third-trimester": HeartPulse,
  delivery: Baby,
  postnatal: HeartHandshake,
};

const HEART_CONFIG = [
  { x: -90, size: 30, delay: 0.0 },
  { x: 60, size: 42, delay: 0.6 },
  { x: -30, size: 26, delay: 1.2 },
  { x: 100, size: 34, delay: 1.9 },
  { x: -110, size: 38, delay: 2.6 },
  { x: 10, size: 46, delay: 3.4 },
  { x: 80, size: 28, delay: 4.3 },
  { x: -60, size: 36, delay: 5.3 },
  { x: 40, size: 30, delay: 6.4 },
  { x: -20, size: 40, delay: 7.6 },
];
const HEART_BURST_MS = 10000;

function HeartBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {HEART_CONFIG.map(({ x, size, delay }, i) => (
        <motion.span
          key={i}
          className="absolute text-rose-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
          initial={{ opacity: 0, scale: 0.3, x, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.15, 1, 0.9], y: -140 }}
          transition={{ duration: 2.2, ease: "easeOut", delay, times: [0, 0.15, 0.7, 1] }}
        >
          <Heart size={size} fill="currentColor" />
        </motion.span>
      ))}
    </div>
  );
}

export function PregnancyJourney() {
  const { openBooking } = useBooking();
  const { t, tList } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [bursting, setBursting] = useState(false);

  const stages = journeyStages.map((stage) => {
    const key = STAGE_TEXT_KEYS[stage.id];
    return {
      ...stage,
      weeks: t(`journey.${key}Weeks`),
      title: t(`journey.${key}Title`),
      description: t(`journey.${key}Description`),
      careInfo: tList(`journey.${key}Care`),
    };
  });

  const active = stages[activeIndex];
  const ActiveIcon = STAGE_ICONS[active.id] ?? Sparkles;

  function triggerBurst() {
    setBursting(true);
    window.setTimeout(() => setBursting(false), HEART_BURST_MS);
  }

  return (
    <section id="pregnancy-journey" className="relative overflow-hidden bg-cream-dark/60 py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/60 to-transparent" />

      <Container>
        <SectionHeading
          eyebrow={t("journey.eyebrow")}
          title={t("journey.title")}
          description={t("journey.description")}
        />

        {/* Stage picker — click a stage to load its content below, no added page height */}
        <div className="mt-12 flex justify-center gap-4 overflow-x-auto px-1 pb-2 sm:gap-6">
          {stages.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.id] ?? Sparkles;
            const isActive = index === activeIndex;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={stage.title}
                aria-pressed={isActive}
                className="group flex shrink-0 flex-col items-center gap-2"
              >
                <span
                  className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-4 transition-all duration-300 sm:h-20 sm:w-20 ${
                    isActive ? "ring-rose-400 shadow-lg" : "ring-cream group-hover:ring-rose-200"
                  }`}
                >
                  <Img
                    slug={stage.image}
                    alt={stage.title}
                    width={160}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${isActive ? "" : "opacity-60 group-hover:opacity-90"}`}
                  />
                  <span
                    className={`absolute inset-0 flex items-center justify-center bg-plum/40 text-cream transition-opacity duration-300 ${
                      isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isActive ? "bg-rose-600 text-cream" : "bg-plum/8 text-ink/40"
                  }`}
                >
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active stage content — same footprint regardless of which stage is selected */}
        <div className="relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-plum/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-0 sm:grid-cols-2"
            >
              <button
                type="button"
                onClick={triggerBurst}
                aria-label={`Celebrate ${active.title}`}
                className="group relative block aspect-[4/3] w-full cursor-pointer sm:aspect-auto"
              >
                <Img
                  slug={active.image}
                  alt={active.title}
                  width={640}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <AnimatePresence>{bursting && <HeartBurst />}</AnimatePresence>
                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-cream bg-white text-rose-500 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <ActiveIcon size={17} strokeWidth={2.25} />
                </span>
              </button>

              <div className="p-7 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-500">{active.weeks}</p>
                <h3 className="mt-1.5 font-serif text-2xl font-medium text-plum">{active.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{active.description}</p>
                <ul className="mt-4 space-y-2">
                  {active.careInfo.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-ink/60">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sage-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Button
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => openBooking()}
          >
            {t("journey.ctaButton")}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
