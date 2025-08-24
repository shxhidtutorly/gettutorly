import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle as PaddleType } from '@paddle/paddle-js';
import { Check, Star, X, ArrowLeft } from "lucide-react";
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

const pricingPlans = [
  {
    name: "Tutorly Pro",
    desc: "Perfect for weekly learners",
    priceMonthly: "$8.99",
    priceAnnually: "$8.99",
    planKey: "PRO",
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
    notIncluded: [],
    color: "bg-sky-400",
    buttonClass: "bg-black text-white hover:bg-gray-800",
    cta: "Try Now for $0",
    period: "week",
    trialDays: 4,
  },
  {
    name: "Tutorly Premium",
    desc: "Most popular monthly plan",
    priceMonthly: "$14.99",
    priceAnnually: "$14.99",
    originalPrice: "$35.97",
    planKey: "PREMIUM",
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
    notIncluded: [],
    popular: true,
    color: "bg-fuchsia-400",
    buttonClass: "bg-black text-white hover:bg-gray-800",
    cta: "Try Now for $0",
    period: "month",
    trialDays: 4,
  },
  {
    name: "Tutorly Max",
    desc: "Best value - save 72%",
    priceMonthly: "$119.00",
    priceAnnually: "$119.00",
    originalPrice: "$779.48",
    monthlyEquivalent: "$9.92",
    planKey: "MAX",
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
    notIncluded: [],
    color: "bg-amber-400",
    buttonClass: "bg-black text-white hover:bg-gray-800",
    cta: "Try Now for $0",
    period: "year",
    trialDays: 4,
    discount: "SAVE 72%",
  },
];

const testimonials = [
  {
    text: "Tutorly's AI notes feature transformed my study sessions! It converts my messy lecture recordings into perfectly organized summaries in minutes.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Emily Johnson",
    role: "Computer Science Student",
  },
  {
    text: "The math chat is incredible! It breaks down complex calculus problems step-by-step, making everything so much clearer than my textbook.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Michael Chen",
    role: "Engineering Student",
  },
  {
    text: "I love how Tutorly creates flashcards automatically from my readings. It's like having a personal tutor that knows exactly what I need to study.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Sarah Williams",
    role: "Pre-Med Student",
  },
  {
    text: "The AI quiz feature helped me ace my finals! It generates practice tests from my notes and identifies my weak spots perfectly.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Rodriguez",
    role: "Business Student",
  },
  {
    text: "Audio recap is a game-changer! I can turn hour-long lectures into concise summaries while commuting. Tutorly saves me so much time.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Jessica Martinez",
    role: "Psychology Student",
  },
  {
    text: "The doubt solver feature is amazing! When I'm stuck on complex topics, Tutorly breaks them down into simple, digestible concepts.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Amanda Davis",
    role: "Biology Student",
  },
];

const firstColumn = testimonials.slice(0, 2);
const secondColumn = testimonials.slice(2, 4);
const thirdColumn = testimonials.slice(4, 6);

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

export default function Pricing(): JSX.Element {
  const { user, loading: authLoading } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [paddle, setPaddle] = useState<PaddleType | undefined>(undefined);
  const [paddleReady, setPaddleReady] = useState(false);
  const [priceTexts, setPriceTexts] = useState({ PRO: '$8.99', PREMIUM: '$14.99', MAX: '$119.00' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black">
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(30px, -40px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="bg-sky-200 text-black border-b-4 border-black relative overflow-hidden">
        <FloatingShape className="w-72 h-72 bg-fuchsia-300 top-40 -left-20" animationDelay="0s" />
        <FloatingShape className="w-72 h-72 bg-amber-300 bottom-40 -right-20" animationDelay="2s" />
        <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-white my-8"
              style={{ textShadow: '4px 4px 0 #000, 8px 8px 0 #4f46e5' }}>
            CHOOSE YOUR PLAN
          </h1>
          <p className="text-xl md:text-2xl font-bold text-stone-900 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 border-4 border-black">
            Start learning smarter today with our flexible pricing options designed for every student's needs.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase">Made Simple. Just Like It Should Be.</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 font-bold text-center">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
            {pricingPlans.map(plan => (
              <div key={plan.name} className={`relative h-full flex flex-col p-8 text-black bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-black text-white font-black px-6 py-2 border-2 border-black text-sm">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                {plan.discount && (
                  <div className="absolute -top-4 -right-4 z-10">
                    <Badge className="bg-red-500 text-white font-black px-4 py-2 border-4 border-black text-sm rotate-12">
                      {plan.discount}
                    </Badge>
                  </div>
                )}
                
                <div className={`w-full h-4 ${plan.color} absolute top-0 left-0 border-b-4 border-black`}></div>
                
                <div className="text-center mb-6 pt-8">
                  <h3 className="text-3xl font-black mb-2 uppercase">{plan.name}</h3>
                  <p className="font-bold mb-4 text-base text-stone-600">{plan.desc}</p>
                  
                  <div className="mb-2">
                    <Badge className="bg-green-500 text-white font-black px-4 py-2 border-2 border-black text-sm mb-4">
                      FREE TRIAL ({plan.trialDays} days)
                    </Badge>
                  </div>
                  
                  {plan.originalPrice && (
                    <div className="text-3xl font-black text-gray-400 line-through mb-2">
                      {plan.originalPrice}
                    </div>
                  )}
                  
                  <div className="text-6xl font-black">{priceTexts[plan.planKey as keyof typeof priceTexts]}</div>
                  <div className="text-base font-bold text-stone-600">/{plan.period}</div>
                  
                  {plan.monthlyEquivalent && (
                    <div className="text-lg font-bold text-green-600 mt-2">
                      (${plan.monthlyEquivalent}/month)
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-8 flex-grow">
                  {plan.features.map(feature => (
                    <div key={feature} className="flex items-center">
                      <Check className="w-6 h-6 mr-3 flex-shrink-0 text-green-500" />
                      <span className="font-bold text-md">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map(feature => (
                    <div key={feature} className="flex items-center opacity-60">
                      <X className="w-6 h-6 mr-3 flex-shrink-0 text-red-500" />
                      <span className="font-bold line-through text-md">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handlePurchase(plan.planKey as "PRO" | "PREMIUM" | "MAX")}
                  disabled={!paddleReady}
                  className={`mt-auto w-full font-black py-4 text-lg border-4 border-black ${plan.buttonClass} ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-stone-100 py-20 border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase">Trusted by Students Worldwide</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* First Column */}
            <div className="space-y-6">
              {firstColumn.map((testimonial, index) => (
                <div key={`col1-${index}`} className={`p-6 bg-white text-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className={`w-16 h-16 rounded-full border-4 border-black ${brutalistShadow}`} 
                    />
                    <div className="ml-4">
                      <div className="font-black text-xl">{testimonial.name}</div>
                      <div className="font-bold text-md text-stone-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="font-bold text-lg leading-tight">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
            
            {/* Second Column */}
            <div className="space-y-6">
              {secondColumn.map((testimonial, index) => (
                <div key={`col2-${index}`} className={`p-6 bg-white text-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className={`w-16 h-16 rounded-full border-4 border-black ${brutalistShadow}`} 
                    />
                    <div className="ml-4">
                      <div className="font-black text-xl">{testimonial.name}</div>
                      <div className="font-bold text-md text-stone-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="font-bold text-lg leading-tight">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
            
            {/* Third Column */}
            <div className="space-y-6 md:col-span-2 lg:col-span-1">
              {thirdColumn.map((testimonial, index) => (
                <div key={`col3-${index}`} className={`p-6 bg-white text-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className={`w-16 h-16 rounded-full border-4 border-black ${brutalistShadow}`} 
                    />
                    <div className="ml-4">
                      <div className="font-black text-xl">{testimonial.name}</div>
                      <div className="font-bold text-md text-stone-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="font-bold text-lg leading-tight">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Universities Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">Trusted By Top Universities</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {universities.map(u => (
              <div key={u.name} className={`p-6 bg-stone-100 flex justify-center items-center h-32 ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                <img src={u.logo} alt={u.name} className="max-h-12 w-auto object-contain transition-all duration-300" onError={e => { (e.target as any).src = 'https://placehold.co/150x60/e5e5e5/000000?text=Logo&font=mono'; }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unlimited Features Section */}
      <section className="bg-stone-100 py-20 border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase">UNLIMITED FEATURES</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
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
              <div key={feature.title} className={`p-6 bg-white border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover} text-center`}>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-black text-xl mb-3 uppercase">{feature.title}</h3>
                <p className="font-bold text-sm text-stone-600">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className={`inline-block p-8 bg-amber-400 border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
              <h3 className="text-3xl font-black mb-4 uppercase">ALL FEATURES. ALL UNLIMITED. ALL PLANS.</h3>
              <p className="text-xl font-bold">No restrictions, no limits, no compromises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-amber-400 text-black py-20 border-y-4 border-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">Ready to Excel?</h2>
          <p className="text-2xl font-bold mb-10">
            Join 500K+ students who are already learning smarter with Tutorly AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup" className={`block bg-black text-white font-black text-xl px-10 py-5 w-full sm:w-auto ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
              START FOR FREE
            </a>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className={`p-6 bg-white border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="font-black text-xl mb-2">INSTANT ACCESS</h3>
              <p className="font-bold">Start using all features immediately after signup</p>
            </div>
            <div className={`p-6 bg-white border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
              <div className="text-4xl mb-2">🔄</div>
              <h3 className="font-black text-xl mb-2">CANCEL ANYTIME</h3>
              <p className="font-bold">No long-term commitments. Cancel with one click</p>
            </div>
            <div className={`p-6 bg-white border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="font-black text-xl mb-2">MONEY BACK</h3>
              <p className="font-bold">30-day money-back guarantee if not satisfied</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
