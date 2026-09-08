import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { WombRevealVisual } from "../WombRevealVisual";
import { useBooking } from "../../context/BookingContext";

const trustIndicators = ["Experienced Gynecologists", "Personalized Care", "Modern Facilities"];

export function Hero() {
  const { openBooking } = useBooking();

  function scrollToServices() {
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="home" className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.35]" />
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sage-200/40 blur-3xl" />

      <Container className="relative grid items-start gap-16 lg:grid-cols-2 lg:gap-10">
        <div className="lg:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-rose-600"
          >
            <Sparkles size={14} />
            Compassionate Care for Every Stage of Womanhood
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-4xl font-medium leading-[1.1] text-plum sm:text-5xl lg:text-6xl"
          >
            Your Health. <br className="hidden sm:block" />
            Your Journey. <span className="text-rose-500">Our Care.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-balance text-base leading-relaxed text-ink/70 sm:text-lg"
          >
            We provide personalized gynecological, pregnancy, maternity and women's
            wellness care — guided by experienced doctors who take the time to listen,
            explain and support you through every stage of womanhood.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button size="lg" icon={<ArrowRight size={18} />} onClick={() => openBooking()}>
              Book an Appointment
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToServices}>
              Explore Our Services
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
          >
            {trustIndicators.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-ink/75">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  <Check size={12} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-rose-100/70 via-cream-dark/40 to-sage-100/60 blur-2xl" />

          <WombRevealVisual />

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 top-2 rounded-2xl bg-cream/95 px-5 py-4 shadow-soft ring-1 ring-plum/5 backdrop-blur sm:-left-6"
          >
            <p className="font-serif text-2xl font-medium text-rose-600">10+ Years</p>
            <p className="text-xs font-medium text-ink/60">of Compassionate Care</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-2 bottom-16 rounded-2xl bg-cream/95 px-5 py-4 shadow-soft ring-1 ring-plum/5 backdrop-blur sm:-right-6"
          >
            <p className="font-serif text-2xl font-medium text-sage-600">5000+</p>
            <p className="text-xs font-medium text-ink/60">Happy Families</p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
