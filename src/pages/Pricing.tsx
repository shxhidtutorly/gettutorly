// src/pages/pricing.tsx
import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPaddle, previewPrices, openCheckout } from "@/lib/paddle";
import { useUser } from "@/hooks/useUser";


  useEffect(() => {
    let mounted = true;
    setErrorMessage(null);

    // initialize Paddle once
    getPaddle()
      .then((pInstance) => {
        if (!mounted) return;
        if (!pInstance) {
          setErrorMessage("Failed to load Paddle instance.");
          console.error("initializePaddle returned undefined");
          return;
        }
        setPaddleReady(true);
        // preview prices
        void previewPrices([
          { priceId: PRICES.PRO[billingCycle], quantity: 1 },
          { priceId: PRICES.PREMIUM[billingCycle], quantity: 1 },
        ]).then((result) => {
          const items = result?.data?.details?.lineItems ?? [];
          for (const it of items) {
            const id = it?.price?.id;
            const formatted = it?.formattedTotals?.subtotal ?? it?.formattedTotals?.total ?? "";
            if (id === PRICES.PRO[billingCycle]) setProPriceText(formatted);
            if (id === PRICES.PREMIUM[billingCycle]) setPremiumPriceText(formatted);
          }
        });
      })
      .catch((err) => {
        console.error("initializePaddle error:", err);
        setErrorMessage("Payment initialization error. Check console.");
      });

    return () => { mounted = false; };
  }, []); // run once


  // preview localized prices (best-effort)
  async function refreshPrices(cycle = billingCycle) {
    try {
      const result = await previewPrices([
        { priceId: PRICES.PRO[cycle] },
        { priceId: PRICES.PREMIUM[cycle] },
      ]);
      if (!result) {
        setProPriceText(cycle === "monthly" ? "$5.99" : "$36");
        setPremiumPriceText(cycle === "monthly" ? "$9.99" : "$65");
        return;
      }
      const items = result?.data?.details?.lineItems ?? [];
      for (const it of items) {
        const id = it?.price?.id;
        const formatted = it?.formattedTotals?.subtotal ?? it?.formattedTotals?.total ?? "";
        if (id === PRICES.PRO[cycle]) setProPriceText(formatted);
        if (id === PRICES.PREMIUM[cycle]) setPremiumPriceText(formatted);
      }
    } catch (err) {
      console.error("PricePreview error:", err);
      // fallback
      setProPriceText(cycle === "monthly" ? "$5.99" : "$36");
      setPremiumPriceText(cycle === "monthly" ? "$9.99" : "$65");
    }
  }

  // update preview when billing cycle changes
  useEffect(() => {
    void refreshPrices(billingCycle);
  }, [billingCycle]);


  // handle checkout
  const handlePurchase = (planKey: "PRO" | "PREMIUM") => {
    if (loading) return;
    if (!user) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }

    const priceId = PRICES[planKey][billingCycle];
    if (!priceId) {
      console.error("Missing priceId:", planKey, billingCycle);
      alert("Plan misconfigured. Contact support.");
      return;
    }

    try {
      openCheckout({
        priceId,
        quantity: 1,
        customer: { email: user.email },
        passthrough: { firebaseUid: user.uid || user.id, email: user.email, plan: planKey, cycle: billingCycle },
        settings: { displayMode: "overlay", theme: "light" },
        success: (data: any) => {
          console.log("Checkout success:", data);
          window.location.href = "/dashboard?purchase=success";
        },
        close: () => console.log("Checkout closed"),
      });
    } catch (err) {
      console.error("Checkout.open error:", err);
      setErrorMessage("Could not open checkout. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono">
      <Navbar />
      <section className="bg-sky-200 text-black border-b-4 border-black py-20 text-center">
        <h1 className="text-5xl font-black">CHOOSE YOUR PLAN</h1>
      </section>
      <section id="plans" className="py-12 max-w-6xl mx-auto">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800">
            <strong>Payment error:</strong> {errorMessage}
          </div>
        )}

        <div className="flex justify-center items-center mb-8">
          <button onClick={() => setBillingCycle("monthly")} className={billingCycle === "monthly" ? "font-bold mr-4" : "mr-4"}>Monthly</button>
          <button onClick={() => setBillingCycle("annually")} className={billingCycle === "annually" ? "font-bold" : ""}>Annually</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border">
            <Badge className="bg-black text-white mb-2">PRO</Badge>
            <div className="text-3xl font-black my-2">{proPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" />Basic AI Chat</li>
              <li><Check className="inline-block mr-2" />100+ Notes/Month</li>
            </ul>
            <Button onClick={() => handlePurchase("PRO")} disabled={!paddleReady} className="w-full">Get PRO</Button>
          </div>

          <div className="p-6 bg-white border">
            <Badge className="bg-fuchsia-400 text-white mb-2">PREMIUM</Badge>
            <div className="text-3xl font-black my-2">{premiumPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" />Unlimited Everything</li>
              <li><Check className="inline-block mr-2" />Priority Support</li>
            </ul>
            <Button onClick={() => handlePurchase("PREMIUM")} disabled={!paddleReady} className="w-full">Get PREMIUM</Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
