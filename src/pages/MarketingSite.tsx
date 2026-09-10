import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
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
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <DoctorSpotlight />
        <TrustStrip />
        <EmotionalCollage />
        <PregnancyJourney />
        <MotherBabyStory />
        <BabyEmotions />
        <Stats />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
