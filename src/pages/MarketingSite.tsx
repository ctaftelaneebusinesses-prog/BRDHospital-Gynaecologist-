import { BookingProvider } from "../context/BookingContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookingWizard } from "../components/booking/BookingWizard";
import { Hero } from "../components/sections/Hero";
import { TrustStrip } from "../components/sections/TrustStrip";
import { EmotionalCollage } from "../components/sections/EmotionalCollage";
import { PregnancyJourney } from "../components/sections/PregnancyJourney";
import { DoctorSpotlight } from "../components/sections/DoctorSpotlight";
import { MotherBabyStory } from "../components/sections/MotherBabyStory";
import { BabyEmotions } from "../components/sections/BabyEmotions";
import { Stats } from "../components/sections/Stats";
import { FinalCta } from "../components/sections/FinalCta";

export function MarketingSite() {
  return (
    <BookingProvider>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <EmotionalCollage />
        <PregnancyJourney />
        <DoctorSpotlight />
        <MotherBabyStory />
        <BabyEmotions />
        <Stats />
        <FinalCta />
      </main>
      <Footer />
      <BookingWizard />
    </BookingProvider>
  );
}
