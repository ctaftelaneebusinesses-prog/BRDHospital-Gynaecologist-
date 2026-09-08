import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className = "" }: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <Reveal
      className={`max-w-2xl ${isCenter ? "mx-auto text-center" : "text-left"} ${className}`}
    >
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-medium leading-[1.15] text-balance sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-balance text-base leading-relaxed text-ink/70 sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
