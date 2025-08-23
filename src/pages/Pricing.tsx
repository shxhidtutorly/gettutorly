import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle as PaddleType } from '@paddle/paddle-js';
import { Check, Star, X, ArrowLeft, Zap, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";

// CONFIG: Live client token
const CLIENT_TOKEN = "live_6a94977317431ccad01df272b4a";

// Updated LIVE Paddle price IDs
const PRICES = {
  PRO: "pri_01jxq0pfrjcd0gkj08cmqv6rb1", // Weekly $8.99
  PREMIUM: "pri_01jxq0wydxwg59kmha33h213ab", // Monthly $14.99
  MAX: "pri_01k22ty36jptak5rjj74axhvxg", // Annually $119.00
};

const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
const brutalistTransition = "transition-all duration-300 ease-in-out";
const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";
const brutalistHoverUp = "hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1";

const pricingPlans = [
  {
    name: "Tutorly Pro",
    desc: "Perfect for weekly learners",
    price: "$8.99",
    period: "week",
    planKey: "PRO",
    icon: <Zap className="w-8 h-8" />,
    trialDays: 4,
    features: [
      "Unlimited Everything",
      "Unlimited AI Chat", 
      "Unlimited AI Notes",
      "Unlimited AI Flashcards",
      "Unlimited AI Quiz",
      "Unlimited Math Solver",
      "Unlimited Doubt Chain",
      "Unlimited AI Summary",
      "Unlimited Audio Recap",
      "Unlimited AI Content Processor",
      "Unlimited Humanizer Text",
      "Priority Support",
      "Advanced Analytics",
      "Export Options"
    ],
    color: "bg-sky-400",
    buttonClass: "bg-black text-white hover:bg-gray-800",
    cta: "Try Now for $0",
  },
  {
    name: "Tutorly Premium",
    desc: "Most popular monthly plan",
    price: "$14.99",
    originalPrice: "$35.97", // Weekly price × 4 weeks
    period: "month",
    planKey: "PREMIUM",
    icon: <Calendar className="w-8 h-8" />,
    trialDays: 4,
    popular: true,
    features: [
      "Unlimited Everything",
      "Unlimited AI Chat", 
      "Unlimited AI Notes",
      "Unlimited AI Flashcards",
      "Unlimited AI Quiz",
      "Unlimited Math Solver",
      "Unlimited Doubt Chain",
      "Unlimited AI Summary",
      "Unlimited Audio Recap",
      "Unlimited AI Content Processor",
      "Unlimited Humanizer Text",
      "Priority Support",
      "Advanced Analytics",
      "Export Options"
    ],
    color: "bg-fuchsia-400",
    buttonClass: "bg-black text-white hover:bg-gray-800",
    cta: "Try Now for $0",
  },
  {
    name: "Tutorly Max",
    desc: "Best value - save 72%",
    price: "$119.00",
    originalPrice: "$779.48", // Monthly price × 12 months
    monthlyEquivalent: "$9.92",
    period: "year",
    planKey: "MAX",
    icon: <Clock className="w-8 h-8" />,
    trialDays: 4,
    discount: "SAVE 72%",
    features: [
      "Unlimited Everything",
      "Unlimited AI Chat", 
      "Unlimited AI Notes",
      "Unlimited AI Flashcards",
      "Unlimited AI Quiz",
      "Unlimited Math Solver",
      "Unlimited Doubt Chain",
      "Unlimited AI Summary",
      "Unlimited Audio Recap",
      "Unlimited AI Content Processor",
      "Unlimited Humanizer Text",
      "Priority Support",
      "Advanced Analytics",
      "Export Options"
    ],
    color: "bg-amber-400",
    buttonClass: "bg-black text-white hover:bg-gray-800",
    cta: "Try Now for $0",
  },
];

const testimonials = [
  { name: "Alice Chen", role: "CS @ MIT", quote: "Feels like a real tutor 24/7. The unlimited AI features are a lifesaver for my studies.", avatarUrl: "https://placehold.co/100x100/7c3aed/ffffff?text=AC&font=mono" },
  { name: "Bob Martinez", role: "Engineering @ Stanford", quote: "Unlimited AI summaries saved me hours of reading. I can focus on the core concepts now.", avatarUrl: "https://placehold.co/100x100/2563eb/ffffff?text=BM&font=mono" },
  { name: "Charlie Kim", role: "Pre-Med @ Yale", quote: "The unlimited flashcards are incredible. They helped me retain so much more for my bio exams.", avatarUrl: "https://placehold.co/100x100/16a34a/ffffff?text=CK&font=mono" },
  { name: "Diana Patel", role: "Business @ Penn", quote: "Unlimited voice notes processing turns my lectures into perfectly structured text. It's magic.", avatarUrl: "https://placehold.co/100x100/f97316/ffffff?text=DP&font=mono" },
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
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
    style={{ animation: `float 6s ease-in-out infinite`, animationDelay }}
  />
);

const PulseEffect = ({ className }: { className: string }) => (
  <div className={`absolute inset-0 rounded-full ${className} animate-pulse opacity-30`} />
);

export default function Pricing(): JSX.Element {
  const { user, loading: authLoading } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [paddle, setPaddle] = useState<PaddleType | undefined>(undefined);
  const [paddleReady, setPaddleReady] = useState(false);
  const [priceTexts, setPriceTexts] = useState({ PRO: '$8.99', PREMIUM: '$14.99', MAX: '$119.00' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Redirect to dashboard if the user is already subscribed
  useEffect(() => {
    if (!authLoading && !subLoading && user && hasActiveSubscription && location.state?.fromSignup !== true) {
      navigate("/dashboard");
    }
  }, [authLoading, subLoading, user, hasActiveSubscription, navigate, location.state]);
  
  useEffect(() => {
    let mounted = true;
    setErrorMessage(null);

    // Initialise Paddle for the live production environment
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
        void previewPrices(pInstance);
      })
      .catch((err) => {
        console.error("initializePaddle error:", err);
        setErrorMessage("Payment initialization error. Check console.");
      });

    return () => { mounted = false; };
  }, []);

  async function previewPrices(pInstance: PaddleType | undefined = paddle) {
    if (!pInstance || typeof pInstance.PricePreview !== "function") {
      setPriceTexts({
        PRO: "$8.99",
        PREMIUM: "$14.99",
        MAX: "$119.00"
      });
      return;
    }

    try {
      const req = {
        items: [
          { quantity: 1, priceId: PRICES.PRO },
          { quantity: 1, priceId: PRICES.PREMIUM },
          { quantity: 1, priceId: PRICES.MAX },
        ],
      };
      const result = await pInstance.PricePreview(req);
      const items = result?.data?.details?.lineItems ?? [];
      const newPrices = { ...priceTexts };
      for (const it of items) {
        const id = it?.price?.id;
        const formatted = it?.formattedTotals?.subtotal ?? it?.formattedTotals?.total ?? "";
        if (id === PRICES.PRO) newPrices.PRO = formatted;
        if (id === PRICES.PREMIUM) newPrices.PREMIUM = formatted;
        if (id === PRICES.MAX) newPrices.MAX = formatted;
      }
      setPriceTexts(newPrices);
    } catch (err) {
      console.error("PricePreview error:", err);
      setPriceTexts({
        PRO: "$8.99",
        PREMIUM: "$14.99",
        MAX: "$119.00"
      });
    }
  }

  const handlePurchase = (planKey: "PRO" | "PREMIUM" | "MAX") => {
    const isNewSignup = location.state?.fromSignup === true;
    if (!isNewSignup && (authLoading || subLoading)) {
      setErrorMessage("Please wait while we check your authentication status.");
      return;
    }

    if (!user) {
      navigate("/signup");
      return;
    }
    
    if (!paddle) {
      console.error("Payments not ready.");
      setErrorMessage("Payments not ready. Please try again shortly.");
      return;
    }

    const priceId = PRICES[planKey];
    if (!priceId) {
      console.error("Missing priceId:", planKey);
      setErrorMessage("Plan misconfigured. Contact support.");
      return;
    }

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { id: user.id },
        customData: { 
          plan: planKey,
          firebaseUid: user.id
        },
        settings: { 
          displayMode: "overlay", 
          theme: "light",
          successUrl: `${window.location.origin}/dashboard?purchase=success`
        },
        successCallback: (data: any) => {
          console.log("Checkout success:", data);

          import("firebase/firestore").then(({ getFirestore, doc, setDoc, serverTimestamp }) => {
            const db = getFirestore();
            setDoc(doc(db, "users", user.id), {
              plan: planKey,
              subscriptionStatus: "active",
              updatedAt: serverTimestamp()
            }, { merge: true }).catch(err => console.error("Firestore update error:", err));
          });

          navigate("/dashboard?purchase=success");
        },
        closeCallback: () => console.log("Checkout closed"),
      });
    } catch (err) {
      console.error("Checkout.open error:", err);
      setErrorMessage("Could not open checkout. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -40px) rotate(5deg); }
          50% { transform: translate(-20px, -60px) rotate(-3deg); }
          75% { transform: translate(40px, -30px) rotate(7deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -30px, 0); }
          70% { transform: translate3d(0, -15px, 0); }
          90% { transform: translate3d(0, -4px, 0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          50% { transform: translateX(5px) rotate(1deg); }
          75% { transform: translateX(-5px) rotate(-1deg); }
          100% { transform: translateX(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.4); }
        }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-black border-b-4 border-black relative overflow-hidden min-h-screen flex items-center">
        <FloatingShape className="w-96 h-96 bg-fuchsia-300" animationDelay="0s" />
        <FloatingShape className="w-72 h-72 bg-amber-300" animationDelay="2s" />
        <FloatingShape className="w-80 h-80 bg-sky-300" animationDelay="4s" />
        <FloatingShape className="w-64 h-64 bg-green-300" animationDelay="1s" />
        <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative z-10">
          <div className="animate-bounce-slow mb-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none text-white mb-8"
                style={{ textShadow: '6px 6px 0 #000, 12px 12px 0 #4f46e5, 18px 18px 0 #ec4899' }}>
              CHOOSE YOUR
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none text-white"
                style={{ textShadow: '6px 6px 0 #000, 12px 12px 0 #f59e0b' }}>
              SUPERPOWER
            </h1>
          </div>
          <div className={`max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-6 border-4 border-black ${brutalistShadow} animate-shake`}>
            <p className="text-xl md:text-2xl font-bold text-stone-900">
              🚀 Start learning smarter today with our flexible pricing options designed for every student's needs.
              <br />
              <span className="text-fuchsia-600">✨ All plans include UNLIMITED EVERYTHING + 4-day FREE trial!</span>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gradient-to-b from-stone-50 to-stone-100 py-20 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-fuchsia-400 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase animate-glow">
              UNLIMITED POWER
            </h2>
            <div className="w-48 h-3 bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 mx-auto mb-6 border-2 border-black"></div>
            <p className="text-2xl font-bold text-stone-700 max-w-3xl mx-auto">
              Every plan includes ALL features with UNLIMITED usage. Choose your billing period!
            </p>
          </div>

          {errorMessage && (
            <div className="mb-8 p-6 bg-red-100 border-4 border-red-500 text-red-800 font-bold text-center animate-shake">
              <strong>⚠️ Error:</strong> {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan, index) => (
              <div 
                key={plan.name} 
                className={`relative h-full flex flex-col p-8 text-black bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHoverUp} ${hoveredCard === plan.name ? 'scale-105 z-20' : ''}`}
                onMouseEnter={() => setHoveredCard(plan.name)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-fuchsia-500 text-white font-black px-8 py-3 border-4 border-black text-lg animate-bounce">
                      ⭐ MOST POPULAR ⭐
                    </Badge>
                  </div>
                )}
                
                {plan.discount && (
                  <div className="absolute -top-4 -right-4 z-10">
                    <Badge className="bg-red-500 text-white font-black px-4 py-2 border-4 border-black text-sm rotate-12 animate-bounce">
                      {plan.discount}
                    </Badge>
                  </div>
                )}

                <div className={`w-full h-6 ${plan.color} absolute top-0 left-0 border-b-4 border-black`}></div>
                
                <div className="text-center mb-8 pt-8">
                  <div className={`inline-block p-4 ${plan.color} border-4 border-black rounded-full mb-4`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-4xl font-black mb-3 uppercase">{plan.name}</h3>
                  <p className="font-bold mb-6 text-lg text-stone-600">{plan.desc}</p>
                  
                  <div className="mb-2">
                    <Badge className="bg-green-500 text-white font-black px-4 py-2 border-2 border-black text-sm mb-4">
                      FREE TRIAL ({plan.trialDays} days)
                    </Badge>
                  </div>
                  
                  <div className="pricing-display">
                    {plan.originalPrice && (
                      <div className="text-3xl font-black text-gray-400 line-through mb-2">
                        {plan.originalPrice}
                      </div>
                    )}
                    <div className="text-7xl font-black text-black mb-2">
                      {priceTexts[plan.planKey as keyof typeof priceTexts]}
                    </div>
                    <div className="text-lg font-bold text-stone-600 mb-2">
                      Per {plan.period}
                    </div>
                    {plan.monthlyEquivalent && (
                      <div className="text-2xl font-bold text-green-600 border-2 border-green-600 bg-green-100 px-4 py-2">
                        ${plan.monthlyEquivalent}/month
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="text-center mb-6">
                    <Badge className="bg-amber-400 text-black font-black px-6 py-3 border-2 border-black text-lg">
                      🚀 UNLIMITED EVERYTHING 🚀
                    </Badge>
                  </div>
                  
                  {plan.features.slice(0, 8).map((feature, idx) => (
                    <div key={feature} className={`flex items-center p-2 rounded ${idx % 2 === 0 ? 'bg-stone-50' : ''}`}>
                      <Check className="w-6 h-6 mr-3 flex-shrink-0 text-green-500" />
                      <span className="font-bold text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <p className="font-black text-lg text-fuchsia-600">+ Much More!</p>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(plan.planKey as "PRO" | "PREMIUM" | "MAX")}
                  disabled={!paddleReady}
                  className={`mt-auto w-full font-black py-6 text-xl border-4 border-black ${plan.buttonClass} ${brutalistShadow} ${brutalistTransition} hover:scale-105 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-amber-500`}
                >
                  {paddleReady ? plan.cta : "Loading..."}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl font-bold text-stone-600 bg-white border-4 border-black p-4 inline-block">
              🔥 All plans include: Unlimited AI Chat, Notes, Flashcards, Quiz, Math Solver, Doubt Chain, Audio Recap & More!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 py-20 border-y-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fuchsia-400 to-amber-400 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">
              STUDENT SUCCESS STORIES
            </h2>
            <div className="w-48 h-3 bg-gradient-to-r from-green-400 to-blue-400 mx-auto border-2 border-black"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, index) => (
              <div key={t.name} className={`p-8 bg-white text-black ${brutalistShadow} ${brutalistTransition} ${brutalistHoverUp} animate-glow`} style={{animationDelay: `${index * 0.3}s`}}>
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <img src={t.avatarUrl} alt={t.name} className={`w-20 h-20 rounded-full border-4 border-black ${brutalistShadow}`} />
                    <PulseEffect className="bg-fuchsia-400" />
                  </div>
                  <div className="ml-6">
                    <div className="font-black text-2xl">{t.name}</div>
                    <div className="font-bold text-lg text-stone-600">{t.role}</div>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="font-bold text-xl leading-tight">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Universities Section */}
      <section className="bg-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase">
              TRUSTED BY TOP UNIVERSITIES
            </h2>
            <div className="w-48 h-3 bg-gradient-to-r from-sky-400 to-fuchsia-400 mx-auto border-2 border-black"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {universities.map((u, index) => (
              <div key={u.name} className={`p-6 bg-stone-50 flex justify-center items-center h-40 ${brutalistShadow} ${brutalistTransition} ${brutalistHoverUp} hover:bg-gradient-to-br hover:from-sky-100 hover:to-fuchsia-100`} style={{animationDelay: `${index * 0.1}s`}}>
                <img src={u.logo} alt={u.name} className="max-h-16 w-auto object-contain transition-all duration-300 hover:scale-110" onError={e => { (e.target as any).src = 'https://placehold.co/150x60/e5e5e5/000000?text=Logo&font=mono'; }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-amber-400 via-fuchsia-400 to-sky-400 text-black py-20 border-y-4 border-black relative overflow-hidden">
        <FloatingShape className="w-96 h-96 bg-white/20" animationDelay="0s" />
        <FloatingShape className="w-72 h-72 bg-black/10" animationDelay="2s" />
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-black mb-8 uppercase animate-bounce-slow">
            READY TO EXCEL?
          </h2>
          <p className="text-3xl font-bold mb-12 bg-white/80 backdrop-blur-sm p-6 border-4 border-black">
            🎓 Join 500K+ students who are already learning smarter with Tutorly AI.
            <br />
            <span className="text-fuchsia-600">🚀 Start your 4-day FREE trial today!</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a href="/signup" className={`block bg-black text-white font-black text-2xl px-12 py-6 w-full sm:w-auto ${brutalistShadow} ${brutalistTransition} ${brutalistHoverUp} hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-amber-600 animate-glow`}>
              🚀 START FOR FREE 🚀
            </a>
            <a href="/contact" className={`block bg-white text-black font-black text-2xl px-12 py-6 w-full sm:w-auto ${brutalistShadow} ${brutalistTransition} ${brutalistHoverUp} hover:bg-gradient-to-r hover:from-sky-200 hover:to-fuchsia-200`}>
              💬 CONTACT US
            </a>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className={`p-6 bg-white/90 backdrop-blur-sm border-4 border-black ${brutalistShadow} ${brutalistTransition} hover:scale-105`}>
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="font-black text-xl mb-2">INSTANT ACCESS</h3>
              <p className="font-bold">Start using all features immediately after signup</p>
            </div>
            <div className={`p-6 bg-white/90 backdrop-blur-sm border-4 border-black ${brutalistShadow} ${brutalistTransition} hover:scale-105`}>
              <div className="text-4xl mb-2">🔄</div>
              <h3 className="font-black text-xl mb-2">CANCEL ANYTIME</h3>
              <p className="font-bold">No long-term commitments. Cancel with one click</p>
            </div>
            <div className={`p-6 bg-white/90 backdrop-blur-sm border-4 border-black ${brutalistShadow} ${brutalistTransition} hover:scale-105`}>
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="font-black text-xl mb-2">MONEY BACK</h3>
              <p className="font-bold">30-day money-back guarantee if not satisfied</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">
              UNLIMITED FEATURES
            </h2>
            <div className="w-48 h-3 bg-gradient-to-r from-green-400 to-blue-400 mx-auto border-2 border-black"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🤖", title: "AI CHAT", desc: "Unlimited conversations with our smart AI tutor" },
              { icon: "📝", title: "AI NOTES", desc: "Transform any content into organized study notes" },
              { icon: "🎯", title: "AI FLASHCARDS", desc: "Auto-generated flashcards from your materials" },
              { icon: "❓", title: "AI QUIZ", desc: "Practice tests created from your study content" },
              { icon: "📊", title: "MATH SOLVER", desc: "Step-by-step solutions to complex problems" },
              { icon: "🔗", title: "DOUBT CHAIN", desc: "Connect related concepts seamlessly" },
              { icon: "🎵", title: "AUDIO RECAP", desc: "Listen to your notes and summaries" },
              { icon: "✨", title: "HUMANIZER", desc: "Make AI text sound natural and engaging" }
            ].map((feature, index) => (
              <div key={feature.title} className={`p-6 bg-white border-4 border-black ${brutalistShadow} ${brutalistTransition} hover:scale-105 hover:rotate-1 text-center`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-black text-xl mb-3 uppercase">{feature.title}</h3>
                <p className="font-bold text-sm text-stone-600">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className={`inline-block p-8 bg-gradient-to-r from-fuchsia-400 to-amber-400 border-4 border-black ${brutalistShadow} ${brutalistTransition} hover:scale-105`}>
              <h3 className="text-3xl font-black mb-4 uppercase">ALL FEATURES. ALL UNLIMITED. ALL PLANS.</h3>
              <p className="text-xl font-bold">No restrictions, no limits, no compromises.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
