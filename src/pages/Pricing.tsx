import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle as PaddleType } from '@paddle/paddle-js';
import { Check, Star, Zap } from "lucide-react";
import { Footer } from "@/components/footer"; // Your existing Footer component
import { useLocation, useNavigate } from 'react-router-dom';

// Import your actual hooks
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";

// CONFIG: Your LIVE client token (untouched)
const CLIENT_TOKEN = "live_6a94977317431ccad01df272b4a";

// Your LIVE Paddle price IDs, updated to the new structure
const PRICES = {
  WEEKLY: "pri_01jxq0pfrjcd0gkj08cmqv6rb1",    // Tutorly Pro
  MONTHLY: "pri_01jxq0wydxwg59kmha33h213ab",   // Tutorly Premium
  ANNUALLY: "pri_01k22ty36jptak5rjj74axhvxg",  // Tutorly Max
};

// All features are now unified and unlimited for all plans
const allFeatures = [
  "Unlimited Math Solver",
  "Unlimited AI Notes",
  "Unlimited AI Flashcards",
  "Unlimited AI Quiz",
  "Unlimited Doubt Chain",
  "Unlimited AI Summary",
  "Unlimited Audio Recap",
  "Unlimited AI Content Processor",
  "Unlimited Humanizer Text",
  "Priority Support",
  "Advanced Analytics",
  "Export Options",
  "And much more..."
];

// New pricing plan structure with all your requirements
const pricingPlans = [
  {
    name: "Tutorly Pro",
    planKey: "PRO",
    cycle: "Weekly",
    priceId: PRICES.WEEKLY,
    price: "$8.99",
    scratchedPrice: null,
    billingInfo: "Per week",
    desc: "Perfect for a short-term boost.",
    features: allFeatures,
  },
  {
    name: "Tutorly Premium",
    planKey: "PREMIUM",
    cycle: "Monthly",
    priceId: PRICES.MONTHLY,
    price: "$14.99",
    scratchedPrice: "$35.96", // Based on 4x weekly price for comparison
    billingInfo: "Per month",
    desc: "The ideal balance of flexibility and value.",
    popular: true,
    features: allFeatures,
  },
  {
    name: "Tutorly Max",
    planKey: "MAX",
    cycle: "Annually",
    priceId: PRICES.ANNUALLY,
    price: "$9.92", // Calculated from $119 / 12 months
    scratchedPrice: "$14.99", // The standard monthly price to show savings
    billingInfo: "Per month, billed at $119.00 per year",
    desc: "Best value for long-term success.",
    discount: "SAVE 34%",
    features: allFeatures,
  },
];

// Data for other sections (kept from your original code)
const testimonials = [
    { name: "Alice Chen", role: "CS @ MIT", quote: "Feels like a real tutor 24/7. The AI Notes feature is a lifesaver for my lectures.", avatarUrl: "https://placehold.co/100x100/7c3aed/ffffff?text=AC&font=mono" },
    { name: "Bob Martinez", role: "Engineering @ Stanford", quote: "AI summaries saved me hours of reading. I can focus on the core concepts now.", avatarUrl: "https://placehold.co/100x100/2563eb/ffffff?text=BM&font=mono" },
    { name: "Charlie Kim", role: "Pre-Med @ Yale", quote: "The adaptive flashcards are incredible. They helped me retain so much more for my bio exams.", avatarUrl: "https://placehold.co/100x100/16a34a/ffffff?text=CK&font=mono" },
    { name: "Diana Patel", role: "Business @ Penn", quote: "Turns my rambling voice notes from lectures into perfectly structured text. It's magic.", avatarUrl: "https://placehold.co/100x100/f97316/ffffff?text=DP&font=mono" },
];

const universities = [
    { name: "MIT", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/mit-logo.webp" },
    { name: "Stanford University", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/standford-logo%20(1).webp" },
    { name: "University of Pennsylvania", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/penn-uop-logo.webp" },
    { name: "Yale University", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/yu-logo.webp" },
    { name: "University of Cambridge (UOC)", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/uoc-logo.webp" },
    { name: "Tokyo University of Medicine", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tuom-logo.webp" },
    { name: "University of Toronto", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tos-uni-logo%20(1).svg" },
    { name: "Harvard University", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Harvard-University-Logo.png" },
];


const FloatingShape = ({ className, animationDelay }: { className: string, animationDelay: string }) => (
  <div
    className={`absolute rounded-full mix-blend-multiply filter blur-2xl opacity-50 ${className}`}
    style={{ animation: `float 8s ease-in-out infinite`, animationDelay }}
  />
);

export default function Pricing(): JSX.Element {
  const { user, loading: authLoading } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [paddle, setPaddle] = useState<PaddleType | undefined>(undefined);
  const [paddleReady, setPaddleReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !subLoading && user && hasActiveSubscription && location.state?.fromSignup !== true) {
      navigate("/dashboard");
    }
  }, [authLoading, subLoading, user, hasActiveSubscription, navigate, location.state]);

  useEffect(() => {
    let mounted = true;
    setErrorMessage(null);

    initializePaddle({ token: CLIENT_TOKEN, environment: "production" })
      .then((pInstance) => {
        if (!mounted) return;
        if (!pInstance) {
          setErrorMessage("Failed to load Paddle instance.");
          console.error("initializePaddle returned undefined");
          return;
        }
        setPaddle(pInstance);
        setPaddleReady(true);
      })
      .catch((err) => {
        console.error("initializePaddle error:", err);
        setErrorMessage("Payment initialization error. Please try again.");
      });

    return () => { mounted = false; };
  }, []);

  const handlePurchase = (plan: typeof pricingPlans[0]) => {
    if (!user) {
      navigate("/signup", { state: { from: 'pricing' } });
      return;
    }
    if (!paddle) {
      setErrorMessage("Payments are not ready. Please try again shortly.");
      return;
    }
    
    try {
      paddle.Checkout.open({
        items: [{ priceId: plan.priceId, quantity: 1 }],
        customer: { id: user.id },
        customData: {
          plan: plan.planKey,
          cycle: plan.cycle.toLowerCase(),
          firebaseUid: user.id,
        },
        settings: {
          displayMode: "overlay",
          theme: "light",
          allowLogout: false,
          trialDays: 4,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
        },
      });
    } catch (err) {
      console.error("Checkout.open error:", err);
      setErrorMessage("Could not open checkout. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-purple-200">
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes subtle-shine {
          0%, 100% { background-position: 200% 50%; }
          50% { background-position: -100% 50%; }
        }
        .shine-effect {
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.2), transparent 80%);
          background-size: 200% 100%;
          animation: subtle-shine 7s linear infinite;
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b-2 border-gray-200">
        <FloatingShape className="w-96 h-96 bg-purple-200 top-20 -left-40" animationDelay="0s" />
        <FloatingShape className="w-96 h-96 bg-cyan-200 bottom-0 -right-40" animationDelay="2s" />
        <div className="max-w-6xl mx-auto px-6 text-center py-28 md:py-36 relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-rose-500">
              Unlock Your Potential
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to revolutionize your study habits. All plans start with a 4-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Section (Completely Revamped as Requested) */}
      <section className="py-20 sm:py-28" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          {errorMessage && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-800 font-medium text-center rounded-lg">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map(plan => (
              <div
                key={plan.name}
                className={`relative h-full flex flex-col rounded-2xl border bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${plan.popular ? 'border-purple-500 border-2 shadow-purple-500/50' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center gap-2 bg-purple-500 text-white font-semibold px-4 py-1.5 rounded-full text-sm">
                      <Star className="w-4 h-4" /> MOST POPULAR
                    </div>
                  </div>
                )}
                 {plan.discount && (
                  <div className="absolute top-5 -right-4 z-10 transform -rotate-45">
                    <div className="bg-rose-500 text-white font-bold text-xs py-1 px-8">{plan.discount}</div>
                  </div>
                )}
                <div className="p-8 flex flex-col h-full">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-500 mb-6">{plan.desc}</p>
                    <p className="font-semibold text-gray-600 text-sm">Free Trial (4 days)</p>
                    <div className="flex items-baseline justify-center gap-2 mt-2">
                        {plan.scratchedPrice && (<span className="text-2xl text-gray-400 line-through">{plan.scratchedPrice}</span>)}
                        <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{plan.billingInfo}</p>
                  </div>
                  <div className="my-6 h-px bg-gray-200"></div>
                  <div className="space-y-4 mb-8 flex-grow">
                    <p className="font-semibold text-gray-800">Unlimited Everything:</p>
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-center">
                        <Check className="w-5 h-5 mr-3 flex-shrink-0 text-purple-500" />
                        <span className="text-md text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={!paddleReady}
                    className={`mt-auto w-full font-semibold py-3 text-lg rounded-lg transition-all duration-300 ease-in-out text-white disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-rose-500' : 'bg-gray-800 hover:bg-gray-900'}`}
                  >
                    <span className="absolute w-full h-full left-0 top-0 shine-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative z-10 flex items-center justify-center">Try Now for $0 <Zap className="w-4 h-4 ml-2"/></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (Included and Restyled) */}
      <section className="bg-white py-20 sm:py-28 border-t-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Trusted by Students Worldwide</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">See what learners from top universities are saying about us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map(t => (
              <div key={t.name} className="p-8 bg-gray-50 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-purple-200">
                <div className="flex items-center mb-4">
                  <img src={t.avatarUrl} alt={t.name} className="w-14 h-14 rounded-full border-2 border-gray-200" />
                  <div className="ml-4">
                    <div className="font-bold text-lg text-gray-900">{t.name}</div>
                    <div className="font-semibold text-md text-gray-500">{t.role}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="font-medium text-lg text-gray-700 leading-snug">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Universities Section (Included and Restyled) */}
      <section className="py-20 sm:py-28 bg-gray-50 border-t-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-2xl font-bold text-gray-500 mb-12">Proudly Used at Top Universities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-8 gap-y-10 items-center">
            {universities.map(u => (
              <div key={u.name} className="flex justify-center">
                <img src={u.logo} alt={u.name} className="max-h-10 w-auto object-contain grayscale opacity-60 transition duration-300 hover:opacity-100 hover:grayscale-0" onError={e => { (e.target as any).src = 'https://placehold.co/150x60/e5e5e5/000000?text=Logo&font=mono'; }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section (Included and Restyled) */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">Ready to Excel?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Join 500K+ students who are already learning smarter.
          </p>
          <a href="#pricing" className="inline-block bg-gradient-to-r from-purple-600 to-rose-500 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            Start Your Free Trial Now
          </a>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
