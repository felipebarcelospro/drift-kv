import { CTASection } from "./components/cta-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
