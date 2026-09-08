import { motion } from "framer-motion";
import { Award, Building2, HeartHandshake, Sofa, Stethoscope, Users } from "lucide-react";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { photos } from "../../data/images";

const benefits = [
  { icon: Award, text: "Experienced Medical Professionals" },
  { icon: HeartHandshake, text: "Personalized Treatment" },
  { icon: Building2, text: "Modern Facilities" },
  { icon: Stethoscope, text: "Complete Pregnancy Care" },
  { icon: Sofa, text: "Comfortable Environment" },
  { icon: Users, text: "Trusted by Families" },
];

export function WhyChooseUs() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative order-2 lg:order-1">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-sage-100 via-cream-dark to-rose-100 clip-blob" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft ring-1 ring-plum/5">
            <Img
              slug={photos.whyChooseUs}
              alt="Mother lovingly holding her newborn baby by the window"
              width={800}
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
            Why Families Choose Us
          </span>
          <h2 className="text-balance text-3xl font-medium leading-[1.15] text-plum sm:text-4xl lg:text-[2.75rem]">
            Care That Feels as Good as It Heals
          </h2>
          <p className="mt-5 max-w-lg text-balance text-base leading-relaxed text-ink/70 sm:text-lg">
            We built Aura around one simple idea — that exceptional healthcare and
            genuine warmth shouldn't be a trade-off. Here's what that looks like in practice.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-[0_4px_20px_-8px_rgba(69,38,46,0.1)] ring-1 ring-plum/5"
                >
                  <motion.span
                    whileHover={{ rotate: -8, scale: 1.08 }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                  >
                    <Icon size={19} />
                  </motion.span>
                  <span className="text-sm font-medium text-plum">{benefit.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
