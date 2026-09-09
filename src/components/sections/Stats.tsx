import { useInView } from "framer-motion";
import { useRef } from "react";
import { Container } from "../ui/Container";
import { stats } from "../../data/stats";
import { useCountUp } from "../../hooks/useCountUp";
import { useLanguage } from "../../context/LanguageContext";

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const count = useCountUp(value, isInView);

  return (
    <div ref={ref} className="text-center">
      <p className="font-serif text-4xl font-medium text-cream sm:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-cream/70">{label}</p>
    </div>
  );
}

export function Stats() {
  const { tList } = useLanguage();
  const labels = tList("stats.list");

  return (
    <section className="relative bg-plum py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} value={stat.value} suffix={stat.suffix} label={labels[index] ?? stat.label} />
          ))}
        </div>
      </Container>
    </section>
  );
}
