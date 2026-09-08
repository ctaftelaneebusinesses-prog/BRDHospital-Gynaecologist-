import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { Button } from "../ui/Button";
import { journeyStages } from "../../data/journey";
import { useBooking } from "../../context/BookingContext";

export function PregnancyJourney() {
  const { openBooking } = useBooking();

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
            <div className="absolute left-0 right-0 top-[7.5rem] h-px bg-plum/10" />
            <div className="grid grid-cols-5 gap-5">
              {journeyStages.map((stage, index) => (
                <Reveal key={stage.id} delay={index * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-card ring-4 ring-cream">
                      <Img slug={stage.image} alt={stage.title} width={320} className="h-full w-full object-cover" />
                    </div>
                    <div className="relative z-10 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-cream-dark bg-rose-600 text-sm font-semibold text-cream">
                      {index + 1}
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
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:hidden">
          {journeyStages.map((stage, index) => (
            <div
              key={stage.id}
              className="w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-plum/5 sm:w-[340px]"
            >
              <div className="relative h-48">
                <Img slug={stage.image} alt={stage.title} width={500} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-cream shadow-md">
                  {index + 1}
                </div>
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
          ))}
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
