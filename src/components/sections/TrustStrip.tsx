import { motion } from "framer-motion";
import { Award, Building2, Clock, HeartHandshake } from "lucide-react";
import { Container } from "../ui/Container";

const highlights = [
  { icon: Award, text: "Experienced Specialists" },
  { icon: HeartHandshake, text: "Personalized Treatment" },
  { icon: Building2, text: "Modern Facilities" },
  { icon: Clock, text: "Open 24 Hours, Daily" },
];

export function TrustStrip() {
  return (
    <section className="relative py-10 sm:py-12">
      <Container>
        <div className="grid gap-6 border-y border-plum/10 py-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon size={19} />
                </span>
                <span className="text-sm font-medium text-plum">{item.text}</span>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
