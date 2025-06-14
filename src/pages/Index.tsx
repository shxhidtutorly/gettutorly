
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Landing page components
import LandingNavbar from "@/components/Landing/LandingNavbar";
import Hero from "@/components/Landing/Hero";
import Features from "@/components/Landing/Features";
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
    <div className="min-h-screen">
      <LandingNavbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </div>
  );
};

export default Index;
