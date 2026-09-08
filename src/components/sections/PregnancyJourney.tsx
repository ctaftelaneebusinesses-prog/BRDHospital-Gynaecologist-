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

const STAGE_ICONS: Record<string, typeof Sparkles> = {
  "first-trimester": Sparkles,
  "second-trimester": Sun,
  "third-trimester": HeartPulse,
  delivery: Baby,
  postnatal: HeartHandshake,
};

function HeartBurst() {
  const hearts = [-26, -8, 10, 26];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {hearts.map((x, i) => (
        <motion.span
          key={i}
          className="absolute text-rose-500"
          initial={{ opacity: 1, scale: 0.4, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.1, x, y: -46 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.04 }}
        >
          <Heart size={16} fill="currentColor" />
        </motion.span>
      ))}
    </div>
  );
}

export function PregnancyJourney() {
  const { openBooking } = useBooking();
  const [burstId, setBurstId] = useState<string | null>(null);

  function triggerBurst(id: string) {
    setBurstId(id);
    window.setTimeout(() => setBurstId((current) => (current === id ? null : current)), 900);
  }

  return (
    <section id="pregnancy-journey" className="relative overflow-hidden bg-cream-dark/60 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/60 to-transparent" />

      <Container>
        <SectionHeading
          eyebrow="A Journey, Not Just Appointments"
          title="Your Pregnancy Journey"
          description="From the earliest signs to the fourth trimester, here's how our care evolves alongside you — one milestone at a time."
        />

        <div className="mt-16 hidden lg:block">
          <div className="relative">
            <motion.div
              className="absolute left-0 right-0 top-[7.5rem] h-px origin-left bg-gradient-to-r from-rose-300 via-plum/20 to-rose-300"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="grid grid-cols-5 gap-5">
              {journeyStages.map((stage, index) => {
                const StageIcon = STAGE_ICONS[stage.id] ?? Sparkles;
                return (
                  <Reveal key={stage.id} delay={index * 0.1}>
                    <div className="group flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-card ring-4 ring-cream transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:ring-rose-200">
                          <Img
                            slug={stage.image}
                            alt={stage.title}
                            width={320}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <AnimatePresence>{burstId === stage.id && <HeartBurst />}</AnimatePresence>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerBurst(stage.id)}
                          aria-label={`Celebrate ${stage.title}`}
                          className="absolute -right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream bg-white text-rose-500 shadow-md transition-transform duration-200 hover:scale-110 active:scale-95"
                        >
                          <StageIcon size={16} strokeWidth={2.25} />
                        </button>
                        <div className="relative z-10 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-cream-dark bg-rose-600 text-sm font-semibold text-cream transition-transform duration-300 group-hover:-translate-y-1.5">
                          {index + 1}
                        </div>
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-rose-500">
                        {stage.weeks}
                      </p>
                      <h3 className="mt-1 font-serif text-xl font-medium text-plum">{stage.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink/65">{stage.description}</p>
                      <ul className="mt-4 space-y-2 text-left">
                        {stage.careInfo.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-ink/60">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sage-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:hidden">
          {journeyStages.map((stage, index) => {
            const StageIcon = STAGE_ICONS[stage.id] ?? Sparkles;
            return (
              <div
                key={stage.id}
                className="w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-plum/5 sm:w-[340px]"
              >
                <div className="relative h-48">
                  <Img slug={stage.image} alt={stage.title} width={500} className="h-full w-full object-cover" />
                  <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-cream shadow-md">
                    {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerBurst(stage.id)}
                    aria-label={`Celebrate ${stage.title}`}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-md active:scale-95"
                  >
                    <StageIcon size={16} strokeWidth={2.25} />
                  </button>
                  <AnimatePresence>{burstId === stage.id && <HeartBurst />}</AnimatePresence>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-500">{stage.weeks}</p>
                  <h3 className="mt-1 font-serif text-xl font-medium text-plum">{stage.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{stage.description}</p>
                  <ul className="mt-4 space-y-2">
                    {stage.careInfo.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-ink/60">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sage-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <Reveal className="mt-16 flex justify-center">
          <Button
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => openBooking()}
          >
            Start Your Pregnancy Care Journey
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
