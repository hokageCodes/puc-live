import AboutSection from "@/components/sections/AboutSection";
import HeroSection from "@/components/sections/HeroSection";
import PracticeAreasSection from "@/components/sections/OurPracticeAreas";
import TeamSection from "@/components/sections/TeamSection";
import ValuesSection from "@/components/sections/ValueSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ValuesSection />
      <PracticeAreasSection />
      <TeamSection />
    </>
  );
}
