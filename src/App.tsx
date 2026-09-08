import { BookingProvider } from "./context/BookingContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { BookingWizard } from "./components/booking/BookingWizard";
import { Hero } from "./components/sections/Hero";
import { EmotionalCollage } from "./components/sections/EmotionalCollage";
import { PregnancyJourney } from "./components/sections/PregnancyJourney";
import { WhyChooseUs } from "./components/sections/WhyChooseUs";
import { MotherBabyStory } from "./components/sections/MotherBabyStory";
import { Stats } from "./components/sections/Stats";
import { FinalCta } from "./components/sections/FinalCta";

function App() {
  return (
    <BookingProvider>
      <Navbar />
      <main>
        <Hero />
        <EmotionalCollage />
        <PregnancyJourney />
        <WhyChooseUs />
        <MotherBabyStory />
        <Stats />
        <FinalCta />
      </main>
      <Footer />
      <BookingWizard />
    </BookingProvider>
  );
}

export default App;
