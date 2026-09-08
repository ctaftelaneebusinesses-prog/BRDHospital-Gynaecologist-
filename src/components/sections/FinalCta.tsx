import { ArrowRight } from "lucide-react";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { Img } from "../ui/Img";
import { photos } from "../../data/images";
import { useBooking } from "../../context/BookingContext";

export function FinalCta() {
  const { openBooking } = useBooking();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <Img
            slug={photos.finalCta}
            alt="Expectant mother tenderly cradling her belly"
            width={1600}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plum via-plum/70 to-plum/30" />

          <div className="relative flex flex-col items-center px-6 py-24 text-center sm:px-12 sm:py-32">
            <Reveal>
              <h2 className="text-balance font-serif text-3xl font-medium text-cream sm:text-4xl lg:text-5xl">
                Your Journey Deserves Exceptional Care.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-cream/80 sm:text-lg">
                From women's wellness to pregnancy and motherhood, we're here to care
                for you every step of the way.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <Button
                size="lg"
                variant="secondary"
                className="mt-9 !bg-cream !text-plum hover:!bg-rose-50"
                icon={<ArrowRight size={18} />}
                onClick={() => openBooking()}
              >
                Book Your Appointment
              </Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
