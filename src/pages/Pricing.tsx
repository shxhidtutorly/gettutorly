// pages/pricing.tsx
import React, { useState, useEffect } from "react";
import { Check, Star, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// IMPORTANT: Ensure no other Paddle script is loaded in your application.
// This component handles the entire Paddle initialization.

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

  // Final Paddle.js v2 initialization logic
  useEffect(() => {
    const script = document.createElement("script");
    // Correct URL for Paddle.js v2.
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        // This is the correct method and parameter for initializing Paddle.js v2.
        // It requires a 'token', which is your client-side token.
        // The 'environment' parameter is valid here.
        window.Paddle.Setup({
          token: "test_26966f1f8c51d54baaba0224e16", // <-- Correctly use 'token'
          environment: "sandbox", // This is a valid parameter for Paddle.js v2
        });
        setPaddleReady(true);
      }
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
      // Test price IDs from your configuration
      priceIdMonthly: "pri_01k274qrwsngnq4tre5y2qe3pp",
      priceIdAnnually: "pri_01gsz8z1q1n00f12qt82y31smh",
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
      // Test price IDs from your configuration
      priceIdMonthly: "pri_01k274r984nbbbrt9fvpbk9sda",
      priceIdAnnually: "pri_01gsz8s48pyr4mbhvv2xfggesg",
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
    // Check to ensure Paddle has loaded and been initialized
    if (!paddleReady) {
      alert("Payment script not ready. Please try again in a few seconds.");
      return;
    }

    const priceId = billingCycle === "monthly" ? plan.priceIdMonthly : plan.priceIdAnnually;

    try {
      // Use Paddle.Checkout.open for sandbox testing with priceId
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1,
          },
        ],
        settings: {
          theme: "light",
          displayMode: "overlay",
        },
      });
    } catch (err) {
      console.error("Error starting checkout:", err);
      // alert() is used for immediate feedback, but in a production app, a modal or toast notification is preferred.
      alert("An error occurred during checkout. Please check the console.");
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
