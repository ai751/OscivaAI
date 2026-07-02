import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import HighlightsSection from "@/components/landing/HighlightsSection";
import AgentsCarousel from "@/components/landing/AgentsCarousel";
import HomeHowItWorks from "@/components/landing/HomeHowItWorks";
import HomeFeatures from "@/components/landing/HomeFeatures";
import PillarsSection from "@/components/landing/PillarsSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import HomePricing from "@/components/landing/HomePricing";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";

export default function Landing() {
  return (
    <div className="mkt-x min-h-screen" style={{ background: "var(--mx-card)" }}>
      <LandingNavbar />
      <HeroSection />
      <HighlightsSection />
      <HomeHowItWorks />
      <AgentsCarousel />
      <HomeFeatures />
      <PillarsSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <HomePricing />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
