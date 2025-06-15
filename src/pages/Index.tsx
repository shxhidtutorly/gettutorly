
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Landing page components
import LandingNavbar from "@/components/Landing/LandingNavbar";
import Hero from "@/components/Landing/Hero";
import Features from "@/components/Landing/Features";
import StickyFeaturesSection from "@/components/Landing/StickyFeaturesSection";
import PricingSection from "@/components/Landing/PricingSection";
import FAQSection from "@/components/Landing/FAQSection";
import LandingFooter from "@/components/Landing/LandingFooter";

const Index = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0E0F1A] flex flex-col">
      {/* Sticky, full-width nav */}
      <div className="w-full">
        <LandingNavbar />
      </div>
      {/* Main hero/sections, allow full width */}
      <main className="flex-1 w-full">
        <Hero />
        <StickyFeaturesSection />
        <div id="features">
          <Features />
        </div>
        <PricingSection />
        <FAQSection />
      </main>
      {/* Footer full width */}
      <div className="w-full">
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
