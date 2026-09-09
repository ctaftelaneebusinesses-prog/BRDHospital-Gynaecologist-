import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Languages, RotateCw, ScanEye, Star, Stethoscope } from "lucide-react";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { Button } from "../ui/Button";
import { doctors } from "../../data/doctors";
import { photos } from "../../data/images";
import { useBooking } from "../../context/BookingContext";

function DoctorFlipCard({ doctor }: { doctor: (typeof doctors)[number] }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-sage-100/70 via-cream-dark/40 to-rose-100/60 blur-2xl" />

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label="Click to see another photo of Dr. Haritha"
        className="relative mx-auto block aspect-square w-full max-w-[360px] cursor-pointer"
        style={{ perspective: 1400 }}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-full shadow-soft ring-8 ring-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Img
              slug={doctor.image}
              alt={doctor.name}
              width={720}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-full shadow-soft ring-8 ring-white"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <Img
              slug={photos.doctorFlipBack}
              alt={`${doctor.name} — professional portrait`}
              width={720}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </button>

      <motion.span
        animate={{ rotate: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-plum shadow-soft sm:right-5 sm:top-5"
      >
        <RotateCw size={15} />
      </motion.span>

      <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded-2xl bg-cream/95 px-4 py-3 shadow-soft ring-1 ring-plum/5 backdrop-blur sm:-right-6 sm:flex">
        <GraduationCap size={18} className="shrink-0 text-sage-600" />
        <div>
          <p className="text-xs font-semibold leading-tight text-plum">Guntur Medical College</p>
          <p className="text-[11px] text-ink/50">MBBS, MS (OBG)</p>
        </div>
      </div>

      <div className="absolute -left-2 bottom-8 flex items-center gap-2 rounded-2xl bg-cream/95 px-4 py-3 shadow-soft ring-1 ring-plum/5 backdrop-blur sm:-left-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Star size={14} className="fill-current" />
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight text-plum">{doctor.experienceYears}+ Years</p>
          <p className="text-[11px] text-ink/50">Clinical Experience</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs font-medium text-ink/40">Tap the photo for another look ✨</p>
    </div>
  );
}

export function DoctorSpotlight() {
  const doctor = doctors[0];
  const { openBooking } = useBooking();

  return (
    <section id="doctor" className="relative overflow-hidden pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/60 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-sage-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />

      <Container className="grid items-center gap-16 lg:grid-cols-[440px_1fr] lg:gap-20">
        <Reveal>
          <DoctorFlipCard doctor={doctor} />
        </Reveal>

        <div>
          <Reveal>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
              Meet Your Doctor
            </span>
            <h2 className="text-balance font-serif text-3xl font-medium leading-[1.15] text-plum sm:text-4xl lg:text-[2.75rem]">
              {doctor.name}
            </h2>
            <p className="mt-2 text-base font-medium text-rose-600 sm:text-lg">{doctor.title}</p>
            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-ink/70 sm:text-lg">
              {doctor.bio}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-[0_4px_20px_-8px_rgba(69,38,46,0.1)] ring-1 ring-plum/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-600">
                <Stethoscope size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Specializations</p>
                <p className="mt-1 text-sm text-plum">{doctor.specializations.join(" · ")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-[0_4px_20px_-8px_rgba(69,38,46,0.1)] ring-1 ring-plum/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ScanEye size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">In-house Sonologist</p>
                <p className="mt-1 text-sm text-plum">Personally performs &amp; reads every ultrasound</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-[0_4px_20px_-8px_rgba(69,38,46,0.1)] ring-1 ring-plum/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-300/30 text-[#8a6a1f]">
                <GraduationCap size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Qualifications</p>
                <p className="mt-1 text-sm text-plum">{doctor.qualifications.join(", ")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-[0_4px_20px_-8px_rgba(69,38,46,0.1)] ring-1 ring-plum/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum/8 text-plum">
                <Languages size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Languages</p>
                <p className="mt-1 text-sm text-plum">{doctor.languages.join(", ")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-9">
            <Button size="lg" onClick={() => openBooking()}>
              Book a Consultation
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
