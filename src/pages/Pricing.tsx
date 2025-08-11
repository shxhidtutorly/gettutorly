// src/pages/pricing.tsx
import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * IMPORTANT:
 * - Ensure NO other Paddle script is loaded elsewhere.
 * - Server-side calls that hit Paddle must use sandbox endpoints:
 *   e.g. https://sandbox-api.paddle.com/ or https://sandbox-checkout-service.paddle.com/...
 */

/* ---------- CONFIG - replace tokens/ids if needed ---------- */
const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // your sandbox client token
const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};
/* ----------------------------------------------------------- */

/* Stubbed user auth - replace this with your actual useAuth hook */
function useAuthStub() {
  return { user: { uid: "N4E8T7giMCWDy7OtWR56uHXQ1kx1", email: "shahidafrid97419@gmail.com" }, loading: false };
}

export default function PricingPage(): JSX.Element {
  const { user, loading } = useAuthStub(); // replace with real auth hook
  const [paddleReady, setPaddleReady] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [proPriceText, setProPriceText] = useState("—");
  const [premiumPriceText, setPremiumPriceText] = useState("—");

  // Load Paddle script and initialize for sandbox (IMPORTANT order)
  useEffect(() => {
    const id = "paddle-js-sdk";
    if (document.getElementById(id)) {
      // script already loaded — attempt init
      initPaddleIfAvailable();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://cdn.paddle.com/paddle/paddle.js"; // use the working SDK URL
    s.async = true;
    s.onload = () => initPaddleIfAvailable();
    document.body.appendChild(s);
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Paddle (must set environment before Initialize)
  const initPaddleIfAvailable = async () => {
    if (!window.Paddle) {
      console.error("Paddle script not available yet");
      return;
    }
    try {
      // force sandbox base for checkout endpoints
      window.Paddle.Environment?.set?.("sandbox");
      // Initialize with client token (Billing)
      window.Paddle.Initialize({
        token: CLIENT_TOKEN,
        eventCallback: (ev: any) => { console.log("Paddle event:", ev); }
      });
      setPaddleReady(true);
      // initial localized price preview
      await previewPrices();
      console.log("Paddle initialized (sandbox).");
    } catch (err) {
      console.error("Paddle init error:", err);
    }
  };

  // Price preview to display localized prices (uses PricePreview)
  const previewPrices = async () => {
    if (!window.Paddle || !paddleReady) return;
    try {
      const request = {
        items: [
          { quantity: 1, priceId: PRICES.PRO[billingCycle] },
          { quantity: 1, priceId: PRICES.PREMIUM[billingCycle] }
        ],
        address: { countryCode: "US" } // optional: derive from geolocation
      };
      const res = await window.Paddle.PricePreview(request);
      // map line items back to UI
      res.data.details.lineItems.forEach((li: any) => {
        const priceStr = li.formattedTotals?.subtotal ?? li.formattedTotals?.total;
        if (li.price?.id === PRICES.PRO[billingCycle]) setProPriceText(priceStr);
        if (li.price?.id === PRICES.PREMIUM[billingCycle]) setPremiumPriceText(priceStr);
      });
    } catch (err) {
      console.error("PricePreview failed:", err);
    }
  };

  useEffect(() => { previewPrices(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [billingCycle, paddleReady]);

  // Purchase handler — MUST use items.priceId (Billing). If undefined, we'll block it.
  const handlePurchase = (planKey: "PRO" | "PREMIUM") => {
    if (loading) return;
    if (!user) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }
    if (!paddleReady) {
      alert("Payments not ready — try again shortly.");
      return;
    }

    const priceId = PRICES[planKey][billingCycle];
    if (!priceId) {
      console.error("Missing priceId for", planKey, billingCycle);
      alert("This plan is currently unavailable. Contact support.");
      return;
    }

    try {
      console.log("Opening checkout with priceId:", priceId);
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        passthrough: JSON.stringify({ firebaseUid: user.uid, email: user.email, plan: planKey, cycle: billingCycle }),
        settings: { displayMode: "overlay", theme: "light" }
      });
    } catch (err) {
      console.error("Checkout.open error:", err);
      alert("Could not start checkout — check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono">
      <Navbar />
      <section className="bg-sky-200 text-black border-b-4 border-black py-20 text-center">
        <h1 className="text-5xl font-black">CHOOSE YOUR PLAN</h1>
      </section>

      <section className="py-12 max-w-6xl mx-auto">
        <div className="flex justify-center items-center mb-8">
          <button onClick={() => setBillingCycle("monthly")} className={billingCycle === "monthly" ? "font-bold mr-4" : "mr-4"}>Monthly</button>
          <button onClick={() => setBillingCycle("annually")} className={billingCycle === "annually" ? "font-bold" : ""}>Annually</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border">
            <Badge className="bg-black text-white mb-2">PRO</Badge>
            <div className="text-3xl font-black my-2">{billingCycle === "monthly" ? proPriceText : proPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" />Basic AI Chat</li>
              <li><Check className="inline-block mr-2" />100+ Notes/Month</li>
            </ul>
            <Button onClick={() => handlePurchase("PRO")} disabled={!paddleReady} className="w-full">Get PRO</Button>
          </div>

          <div className="p-6 bg-white border">
            <Badge className="bg-fuchsia-400 text-white mb-2">PREMIUM</Badge>
            <div className="text-3xl font-black my-2">{billingCycle === "monthly" ? premiumPriceText : premiumPriceText}</div>
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
