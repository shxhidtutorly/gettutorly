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
  const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // <- your sandbox client token
  const SCRIPT_ID = "paddle-js-sdk-correct";

  async function waitFor(fn: () => boolean, attempts = 30, delay = 150) {
    for (let i = 0; i < attempts; i++) {
      if (fn()) return true;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  }

  // If a Paddle script already exists and provides Initialize, use it.
  const existing = document.getElementById(SCRIPT_ID);
  if (!existing) {
    // Remove any other paddle script tags you may have added elsewhere to avoid conflicts.
    // Create the correct paddle.js script (the one that supports Initialize/PricePreview).
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://cdn.paddle.com/paddle/paddle.js"; // <- use this (not /v2) for the Initialize API
    s.async = true;
    s.onload = async () => {
      // wait briefly for the API to be attached
      const ok = await waitFor(() => !!(window as any).Paddle && typeof (window as any).Paddle.Initialize === "function", 20, 100);
      if (!ok) {
        console.error("Paddle loaded but Initialize() not found. Possible version mismatch.");
        return;
      }

      try {
        // set sandbox environment then initialize with client token
        (window as any).Paddle.Environment?.set?.("sandbox");
        (window as any).Paddle.Initialize({
          token: CLIENT_TOKEN,
          eventCallback: (ev: any) => {
            // optional: inspect events
            // console.log("Paddle event:", ev);
          },
        });
        setPaddleReady(true);

        // If you have a previewPrices or price-loading function, call it now:
        // await previewPrices();
      } catch (err) {
        console.error("Paddle init error:", err);
      }
    };
    s.onerror = (e) => {
      console.error("Failed to load Paddle script", e);
    };
    document.body.appendChild(s);
  } else {
    // if already present, ensure the API is ready
    (async () => {
      const ok = await waitFor(() => !!(window as any).Paddle && typeof (window as any).Paddle.Initialize === "function", 20, 100);
      if (!ok) {
        console.error("Existing Paddle script present but Initialize() not available.");
        return;
      }
      try {
        (window as any).Paddle.Environment?.set?.("sandbox");
        (window as any).Paddle.Initialize({
          token: CLIENT_TOKEN,
          eventCallback: (ev: any) => {},
        });
        setPaddleReady(true);
        // await previewPrices();
      } catch (err) {
        console.error("Paddle init error (existing):", err);
      }
    })();
  }
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
