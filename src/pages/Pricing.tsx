// src/pages/Pricing.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initializePaddle, previewPrices, openCheckout } from "@/lib/paddle";

/**
 * NOTE:
 * - Ensure src/lib/paddle.ts exports: initializePaddle, previewPrices, openCheckout
 * - Replace useAuthStub with your real auth hook (Firebase).
 */

function useAuthStub() {
  // Replace with your real auth hook (Firebase Auth).
  return {
    user: { uid: "N4E8T7giMCWDy7OtWR56uHXQ1kx1", email: "shahidafrid97419@gmail.com" },
    loading: false,
  };
}

const LOCAL_PRICES = {
  // Ensure these map to real Paddle price IDs in your sandbox/live account
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};

export default function PricingPage(): JSX.Element {
  const { user, loading } = useAuthStub(); // replace with your useAuth()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [paddleReady, setPaddleReady] = useState(false);
  const [priceMap, setPriceMap] = useState<Record<string, string>>({});

  const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

  // Pricing plan definitions for UI
  const pricingPlans = [
    {
      key: "BASIC",
      name: "BASIC",
      desc: "Essential tools to get started",
      priceMonthly: "$9",
      priceAnnually: "$90",
      features: ["Basic AI Chat", "10 Notes/Month", "20 Flashcards"],
      cta: "GET STARTED",
      checkout: false,
      color: "bg-sky-400",
    },
    {
      key: "PRO",
      name: "PRO",
      desc: "Full features + unlimited usage",
      priceMonthly: "$19",
      priceAnnually: "$190",
      features: ["Unlimited Everything", "Priority Support", "Advanced Analytics"],
      cta: "GO PRO",
      checkout: true, // has Paddle price ids in LOCAL_PRICES.PRO
      color: "bg-fuchsia-400",
    },
    {
      key: "TEAM",
      name: "TEAM",
      desc: "For groups & institutions",
      priceMonthly: "$49",
      priceAnnually: "$490",
      features: ["Team Management", "Admin Dashboard", "Custom Branding"],
      cta: "CONTACT US",
      checkout: false,
      color: "bg-amber-400",
    },
  ];

  // init Paddle once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // initializePaddle should detect token vs vendor and initialize sandbox/production
        await initializePaddle({ token: "test_26966f1f8c51d54baaba0224e16", vendorId: 234931, environment: "sandbox" });
        if (!mounted) return;
        setPaddleReady(true);

        // preview localized prices for PRO and PREMIUM (best effort)
        try {
          const pids = [
            LOCAL_PRICES.PRO.monthly,
            LOCAL_PRICES.PRO.annually,
            LOCAL_PRICES.PREMIUM.monthly,
            LOCAL_PRICES.PREMIUM.annually,
          ];
          const map = await previewPrices(pids);
          setPriceMap(map || {});
        } catch (e) {
          // ignore preview errors — fallback to static labels
          console.warn("Price preview failed:", e);
        }
      } catch (err) {
        console.error("Paddle init failed:", err);
        setPaddleReady(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // helper: get display price (previewed or fallback)
  const displayPrice = (planKey: string) => {
    if (planKey === "PRO") {
      const pid = billingCycle === "monthly" ? LOCAL_PRICES.PRO.monthly : LOCAL_PRICES.PRO.annually;
      return priceMap[pid] ?? (billingCycle === "monthly" ? "$19" : "$190");
    }
    if (planKey === "PREMIUM") {
      const pid = billingCycle === "monthly" ? LOCAL_PRICES.PREMIUM.monthly : LOCAL_PRICES.PREMIUM.annually;
      return priceMap[pid] ?? (billingCycle === "monthly" ? "$29" : "$290");
    }
    // BASIC / TEAM fallback static
    const plan = pricingPlans.find(p => p.key === planKey);
    return plan ? (billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually) : "—";
  };

  // handle purchase - uses openCheckout wrapper (from src/lib/paddle.ts)
  const handlePurchase = async (planKey: string) => {
    if (loading) return;
    if (!user) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }
    if (!paddleReady) {
      alert("Payment system not ready. Please try again in a few seconds.");
      return;
    }

    // Only PRO has checkout in this sample
    if (planKey !== "PRO") {
      // For non-checkout plans (BASIC/TEAM) route to signup/contact or show modal
      if (planKey === "TEAM") {
        window.location.href = "/contact-sales";
      } else {
        window.location.href = "/signup?redirect=/pricing";
      }
      return;
    }

    const priceId = billingCycle === "monthly" ? LOCAL_PRICES.PRO.monthly : LOCAL_PRICES.PRO.annually;
    if (!priceId) {
      alert("Plan not configured correctly. Contact support.");
      return;
    }

    try {
      await openCheckout({
        priceId,
        passthrough: { firebaseUid: user?.uid, email: user?.email, plan: planKey, cycle: billingCycle },
        onSuccess: async (data: any) => {
          // data checkout object shape depends on Paddle.js bundle — log for debug
          console.log("Paddle checkout success", data);

          // Record to your backend to save subscription in Firestore
          // Implement /api/paddle-checkout-success to verify and store the details.
          try {
            await fetch("/api/paddle-checkout-success", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ passthrough: { firebaseUid: user.uid, email: user.email, plan: planKey, cycle: billingCycle }, paddleResponse: data }),
            });
          } catch (e) {
            console.warn("Could not POST checkout success:", e);
          }

          // Redirect to dashboard (attach checkout id if available)
          const checkoutId = data?.checkout?.id || data?.checkout_id || "";
          window.location.href = `/dashboard${checkoutId ? `?subId=${checkoutId}` : ""}`;
        },
        onClose: () => {
          console.log("User closed checkout");
        },
      });
    } catch (err) {
      console.error("openCheckout error:", err);
      alert("Could not open checkout. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black">
      <Navbar />

      {/* Hero */}
      <section className="bg-sky-200 text-black border-b-4 border-black py-20 text-center">
        <h1 className="text-5xl font-black">CHOOSE YOUR PLAN</h1>
      </section>

      {/* Toggle */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        <div className="flex justify-center items-center mb-8">
          <span className={`font-bold mr-4 ${billingCycle === "monthly" ? "text-black" : "text-stone-400"}`}>Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" onChange={() => setBillingCycle(prev => (prev === "monthly" ? "annually" : "monthly"))} />
            <div className="w-20 h-10 bg-stone-200 rounded-full border-4 border-black peer-checked:bg-fuchsia-400 relative">
              <span className={`absolute top-1/2 left-1 transform -translate-y-1/2 transition-all ${billingCycle === "annually" ? "translate-x-10" : "translate-x-0"} w-8 h-8 bg-black rounded-full`}></span>
            </div>
          </label>
          <span className={`font-bold ml-4 ${billingCycle === "annually" ? "text-black" : "text-stone-400"}`}>Annually</span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map(plan => (
            <div key={plan.key} className={`p-8 bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover} flex flex-col`}>
              {plan.key === "PRO" && <Badge className="bg-black text-white mb-4">MOST POPULAR</Badge>}
              <div className={`w-full h-4 ${plan.color} absolute top-0 left-0 border-b-4 border-black`}></div>

              <h3 className="text-2xl font-black mt-6">{plan.name}</h3>
              <p className="text-sm text-stone-600 mb-4">{plan.desc}</p>

              <div className="text-4xl font-black mb-4">{displayPrice(plan.key)}</div>
              <div className="text-sm text-stone-600 mb-6">/{billingCycle === "monthly" ? "month" : "year"}</div>

              <ul className="mb-6 space-y-2 flex-grow">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center">
                    <Check className="mr-2 text-green-500" /> <span className="font-bold">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePurchase(plan.key)}
                disabled={!paddleReady && plan.checkout}
                className={`mt-auto w-full font-black py-3 text-lg border-4 border-black ${plan.key === "PRO" ? "bg-black text-white" : "bg-white text-black"} ${brutalistShadow}`}
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
