import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Img } from "../ui/Img";
import { photos } from "../../data/images";

const storyCards = [
  {
    id: "beginning",
    label: "Chapter One",
    title: "The Beginning",
    description: "Pregnancy & prenatal care",
    image: photos.storyBeginning,
  },
  {
    id: "moment",
    label: "Chapter Two",
    title: "The Moment",
    description: "Delivery & maternity care",
    image: photos.storyMoment,
  },
  {
    id: "journey",
    label: "Chapter Three",
    title: "The Journey Continues",
    description: "Postnatal & women's wellness",
    image: photos.storyJourneyContinues,
  },
];

export function MotherBabyStory() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Every Story Is Different"
          title="Because Every Mother Has a Story"
          description="Some stories begin with nervous excitement. Others with quiet strength. Whatever yours looks like, we're honored to be part of it."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {storyCards.map((card, index) => (
            <Reveal key={card.id} delay={index * 0.1}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-card">
                <Img
                  slug={card.image}
                  alt={card.title}
                  width={600}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-200">{card.label}</p>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-cream">{card.title}</h3>
                  <p className="mt-1.5 text-sm text-cream/75">{card.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
