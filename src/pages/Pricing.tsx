// src/pages/Pricing.tsx
import React, { useEffect, useState } from "react";
import { Check, Star, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global { interface Window { Paddle?: any; } }

type Plan = {
  name: string;
  desc: string;
  priceMonthly: string;
  priceAnnually: string;
  priceIdMonthly: string;
  priceIdAnnually: string;
  features: string[];
  notIncluded: string[];
  color: string;
  buttonClass: string;
  cta: string;
  popular?: boolean;
};

export default function Pricing(): JSX.Element {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const PADDLE_VENDOR_ID = 234931;
  const PADDLE_ENV = 'sandbox';

  useEffect(() => {
    if (!document.getElementById("paddle-js")) {
      const script = document.createElement("script");
      script.id = "paddle-js";
      script.src = "https://sandbox-checkout.paddle.com/paddle.js";
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          window.Paddle.Environment.set("sandbox"); // 🔹 Remove this line for live
          window.Paddle.Setup({ vendor: vendorId });
          setPaddleReady(true);
        }
      };
      document.body.appendChild(script);
    } else {
      setPaddleReady(true);
    }
  }, []);

  const pricingPlans: Plan[] = [
    {
      name: "PRO",
      desc: "Essential tools to get started",
      priceMonthly: "$5.99",
      priceAnnually: "$36",
      priceIdMonthly: "pri_01jxq0pfrjcd0gkj08cmqv6rb1",
      priceIdAnnually: "pri_01jxq11xb6dpkzgqr27fxkejc3",
      features: ["Basic AI Chat","100+ Notes/Month","Unlimited Flashcards"],
      notIncluded: ["Unlimited Usage","Priority Support"],
      color: "bg-sky-400",
      buttonClass: "bg-black text-white",
      cta: "GET STARTED"
    },
    {
      name: "PREMIUM",
      desc: "Full features + unlimited usage",
      priceMonthly: "$9.99",
      priceAnnually: "$65",
      priceIdMonthly: "pri_01jxq0wydxwg59kmha33h213ab",
      priceIdAnnually: "pri_01k22jjqh6dtn42e25bw0znrgy",
      features: ["Unlimited Everything","Priority Support","Advanced Analytics"],
      notIncluded: [],
      popular: true,
      color: "bg-fuchsia-400",
      buttonClass: "bg-black text-white",
      cta: "GO PRO"
    }
  ];

  const handlePurchase = (plan: Plan) => {
    if (!window.Paddle) { alert('Payment system not loaded.'); return; }
    const priceId = billingCycle === 'monthly' ? plan.priceIdMonthly : plan.priceIdAnnually;
    if (!priceId) { console.error('Price ID missing'); return; }

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        successCallback: () => { setTimeout(()=> window.location.href = '/dashboard?purchase=success', 300); },
        closeCallback: () => { console.log('Checkout closed'); }
      });
    } catch (err) {
      console.error('Paddle error', err);
      alert('Could not open checkout. Check console.');
    }
  };

  const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black">
      <style>{`
        @keyframes float { 0%{transform:translate(0,0)}50%{transform:translate(30px,-40px)}100%{transform:translate(0,0)} }
        .pricing-card:hover{ transform: translate(-6px,-6px) scale(1.01); }
      `}</style>

      <Navbar />

      <section className="bg-sky-200 text-black border-b-4 border-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-white my-8" style={{ textShadow: '4px 4px 0 #000' }}>
            CHOOSE YOUR PLAN
          </h1>
          <p className="text-xl md:text-2xl font-bold text-stone-900 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 border-4 border-black">
            Start learning smarter today.
          </p>
        </div>
      </section>

      <section className="bg-stone-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase">Plans</h2>
            <div className="w-32 h-2 bg-black mx-auto" />
          </div>

          <div className="flex justify-center items-center my-8">
            <span className={`font-bold mr-4 ${billingCycle === 'monthly' ? 'text-black' : 'text-stone-400'}`}>Monthly</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')} checked={billingCycle === 'annually'} />
              <div className="w-20 h-10 bg-stone-200 rounded-full border-4 border-black peer-checked:bg-fuchsia-400 after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[6px] after:bg-black after:rounded-full after:h-8 after:w-8" />
            </label>
            <span className={`font-bold ml-4 ${billingCycle === 'annually' ? 'text-black' : 'text-stone-400'}`}>Annually</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricingPlans.map(plan => (
              <div key={plan.name} className={`relative p-8 bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover} pricing-card`}>
                {plan.popular && <Badge className="bg-black text-white px-4 py-1">MOST POPULAR</Badge>}
                <div className={`w-full h-3 ${plan.color} mt-4 mb-4`} />
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className="font-bold text-stone-600">{plan.desc}</p>
                <div className="text-4xl font-black my-4">{billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually}</div>

                <div className="space-y-2 mb-6">
                  {plan.features.map(f => <div key={f} className="flex items-center"><Check className="w-5 h-5 mr-2 text-green-500" /> <span className="font-bold">{f}</span></div>)}
                  {plan.notIncluded.map(f => <div key={f} className="flex items-center opacity-60"><X className="w-5 h-5 mr-2 text-red-500" /> <span className="line-through font-bold">{f}</span></div>)}
                </div>

                <Button onClick={() => handlePurchase(plan)} className={`w-full py-3 font-black ${plan.buttonClass}`}>{plan.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-amber-400 text-black py-12 border-y-4 border-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-4">Ready to Excel?</h2>
          <a href="/signup" className="inline-block bg-black text-white px-8 py-3 font-black">START FOR FREE</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
