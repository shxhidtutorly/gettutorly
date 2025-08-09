// pages/pricing.tsx or src/pages/pricing.tsx
import React, { useState, useEffect } from "react";
import { Check, Star, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly"
  );
  const [paddleReady, setPaddleReady] = useState(false);

  const brutalistShadow =
    "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover =
    "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/paddle.js";
    script.async = true;
    script.onload = () => {
      // Vendor ID from Paddle Dashboard
      window.Paddle?.Setup({
        vendor: 234931,
        eventCallback: (data) => console.log("Paddle Event:", data),
      });
      setPaddleReady(true);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const pricingPlans = [
    {
      name: "PRO",
      desc: "Essential tools to get started",
      priceMonthly: "$5.99",
      priceAnnually: "$36",
      priceIdMonthly: "pri_01jxq0pfrjcd0gkj08cmqv6rb1",
      priceIdAnnually: "pri_01jxq11xb6dpkzgqr27fxkejc3",
      features: [
        "Basic AI Chat",
        "100+ Notes/Month",
        "Unlimited Flashcards",
        "All basic features",
      ],
      notIncluded: [
        "Unlimited Usage",
        "Priority Support",
        "Advanced Features",
      ],
      color: "bg-sky-400",
      cta: "GET STARTED",
    },
    {
      name: "PREMIUM",
      desc: "Full features + unlimited usage",
      priceMonthly: "$9.99",
      priceAnnually: "$65",
      priceIdMonthly: "pri_01jxq0wydxwg59kmha33h213ab",
      priceIdAnnually: "pri_01k22jjqh6dtn42e25bw0znrgy",
      features: [
        "Unlimited Everything",
        "Priority Support",
        "Advanced Analytics",
        "Export Options",
        "Audio Recap",
        "Math Solver",
      ],
      notIncluded: [],
      popular: true,
      color: "bg-fuchsia-400",
      cta: "GO PRO",
    },
  ];

  const handlePurchase = async (plan) => {
    if (!paddleReady) {
      alert("Payment system is not ready yet. Please try again shortly.");
      return;
    }
    const priceId =
      billingCycle === "monthly" ? plan.priceIdMonthly : plan.priceIdAnnually;

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com", // replace with logged-in user's email
          price_id: priceId,
          user_id: "firebase-uid-or-any-id",
        }),
      });

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        console.error("Checkout creation failed", data);
        alert("Something went wrong starting your checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting checkout.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono">
      <Navbar />
      <section className="bg-sky-200 text-black border-b-4 border-black py-20 text-center">
        <h1 className="text-5xl font-black">CHOOSE YOUR PLAN</h1>
      </section>

      <section className="py-20 max-w-6xl mx-auto">
        <div className="flex justify-center items-center mb-10">
          <span
            className={`font-bold mr-4 ${
              billingCycle === "monthly" ? "text-black" : "text-stone-400"
            }`}
          >
            Monthly
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              onChange={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "annually" : "monthly"
                )
              }
            />
            <div className="w-20 h-10 bg-stone-200 rounded-full border-4 border-black peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[4px] after:bg-black after:border after:border-black after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-fuchsia-400"></div>
          </label>
          <span
            className={`font-bold ml-4 ${
              billingCycle === "annually" ? "text-black" : "text-stone-400"
            }`}
          >
            Annually
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
            >
              {plan.popular && (
                <Badge className="bg-black text-white mb-4">MOST POPULAR</Badge>
              )}
              <h3 className="text-3xl font-black">{plan.name}</h3>
              <p>{plan.desc}</p>
              <div className="text-5xl font-black mt-4">
                {billingCycle === "monthly"
                  ? plan.priceMonthly
                  : plan.priceAnnually}
              </div>
              <div className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center">
                    <Check className="mr-2 text-green-500" /> {f}
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center opacity-50">
                    <X className="mr-2 text-red-500" /> {f}
                  </div>
                ))}
              </div>
              <Button
                onClick={() => handlePurchase(plan)}
                className={`mt-6 w-full font-black border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
