// src/pages/pricing.tsx
import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* global Paddle typing for TS */
declare global { interface Window { Paddle?: any; } }

/* CONFIG - replace with your sandbox client token & price IDs */
const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // your sandbox client token
const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};

/* Replace with your real auth hook */
function useAuthStub() {
  return { user: { uid: "N4E8T7giMCWDy7OtWR56uHXQ1kx1", email: "shahidafrid97419@gmail.com" }, loading: false };
}

export default function PricingPage(): JSX.Element {
  const { user, loading } = useAuthStub();
  const [paddleReady, setPaddleReady] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [proPriceText, setProPriceText] = useState("—");
  const [premiumPriceText, setPremiumPriceText] = useState("—");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // util: poll a condition
  async function waitFor(fn: () => boolean, attempts = 40, delay = 100) {
    for (let i = 0; i < attempts; i++) {
      if (fn()) return true;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  }

  //useEffect(() => {
  const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // <--- your sandbox client token
  const DESIRED_SRC = "https://cdn.paddle.com/paddle/paddle.js";
  const INJECT_ID = "paddle-billing-inject";



  // 1) remove any existing Paddle scripts that could be conflicting
  const removeConflictingScripts = () => {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
    scripts.forEach((s) => {
      if (s.src.includes("cdn.paddle.com/paddle/v2") || s.src.includes("cdn.paddle.com/paddle/paddle.js") || s.src.match(/paddle\/paddle/)) {
        // remove all paddle scripts (we'll inject the correct one)
        s.remove();
      }
    });
    // remove the global if present
    try { delete (window as any).Paddle; } catch (e) { (window as any).Paddle = undefined; }
    console.log("[Paddle] removed conflicting scripts and cleared window.Paddle");
  };

  // 2) inject desired script and initialize Billing API
  const injectAndInit = async () => {
    // if already injected with id, skip creating a second tag
    if (!document.getElementById(INJECT_ID)) {
      const s = document.createElement("script");
      s.id = INJECT_ID;
      s.src = DESIRED_SRC;
      s.async = true;
      s.onload = async () => {
        console.log("[Paddle] script loaded, probing API...");
        // wait until Paddle object exists
        const okWindow = await waitFor(() => !!(window as any).Paddle, 30, 100);
        console.log("[Paddle] window.Paddle present?", okWindow, "keys:", Object.keys((window as any).Paddle || {}));
        // Prefer Initialize (Billing)
        const hasInitialize = !!(window as any).Paddle && typeof (window as any).Paddle.Initialize === "function";
        if (!hasInitialize) {
          console.error("[Paddle] Billing API (Initialize) not found. Wrong bundle or still conflicting scripts.");
          return;
        }
        try {
          (window as any).Paddle.Environment?.set?.("sandbox");
          (window as any).Paddle.Initialize({ token: CLIENT_TOKEN });
          console.log("[Paddle] Initialize() called (sandbox). Billing API ready.");
          // now call your previewPrices() or set paddleReady state
          // e.g. setPaddleReady(true); previewPrices();
        } catch (err) {
          console.error("[Paddle] Initialize() error:", err);
        }
      };
      s.onerror = (e) => console.error("[Paddle] failed to load script", e);
      document.body.appendChild(s);
    } else {
      // if present, attempt to initialize directly
      const hasInitialize = !!(window as any).Paddle && typeof (window as any).Paddle.Initialize === "function";
      if (hasInitialize) {
        try {
          (window as any).Paddle.Environment?.set?.("sandbox");
          (window as any).Paddle.Initialize({ token: CLIENT_TOKEN });
          console.log("[Paddle] Initialized existing script (sandbox).");
          // set state / preview
        } catch (err) {
          console.error("[Paddle] init existing error:", err);
        }
      } else {
        console.error("[Paddle] existing script present but Initialize() not available.");
      }
    }
  };

  // run removal & inject
  removeConflictingScripts();
  void injectAndInit();

  // PricePreview (only available on Billing-compatible paddle.js)
  const previewPrices = async () => {
    if (!window.Paddle || typeof window.Paddle.PricePreview !== "function") {
      // fallback: show static text or leave dashes
      console.info("PricePreview not available; using fallback prices.");
      setProPriceText(billingCycle === "monthly" ? "$5.99" : "$36");
      setPremiumPriceText(billingCycle === "monthly" ? "$9.99" : "$65");
      return;
    }

    try {
      const request = {
        items: [
          { quantity: 1, priceId: PRICES.PRO[billingCycle] },
          { quantity: 1, priceId: PRICES.PREMIUM[billingCycle] },
        ],
      };
      const res = await window.Paddle.PricePreview(request);
      const items = res?.data?.details?.lineItems ?? [];
      for (const it of items) {
        const pid = it?.price?.id;
        const formatted = it?.formattedTotals?.subtotal ?? it?.formattedTotals?.total ?? "";
        if (pid === PRICES.PRO[billingCycle]) setProPriceText(formatted);
        if (pid === PRICES.PREMIUM[billingCycle]) setPremiumPriceText(formatted);
      }
    } catch (err) {
      console.error("PricePreview error:", err);
      // fallback
      setProPriceText(billingCycle === "monthly" ? "$5.99" : "$36");
      setPremiumPriceText(billingCycle === "monthly" ? "$9.99" : "$65");
    }
  };

  // Handle purchase using Billing flow (items.priceId). No 'product' usage anywhere.
  const handlePurchase = (planKey: "PRO" | "PREMIUM") => {
    if (loading) return;
    if (!user) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }
    if (!window.Paddle) {
      alert("Payment system not loaded. Try again shortly.");
      return;
    }

    const priceId = PRICES[planKey][billingCycle];
    if (!priceId) {
      alert("Plan misconfigured. Contact support.");
      console.error("Missing priceId for", planKey, billingCycle);
      return;
    }

    // If paddleReady false but window.Paddle exists, still try (best-effort)
    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        passthrough: JSON.stringify({ firebaseUid: user.uid, email: user.email, plan: planKey }),
        settings: { displayMode: "overlay", theme: "light" },
        successCallback: (d: any) => {
          console.log("Checkout success", d);
          window.location.href = "/dashboard?purchase=success";
        },
        closeCallback: () => { console.log("Checkout closed"); },
      });
    } catch (err) {
      console.error("Checkout.open error:", err);
      setErrorMessage("Something went wrong while opening checkout. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono">
      <Navbar />
      <section className="bg-sky-200 text-black border-b-4 border-black py-20 text-center">
        <h1 className="text-5xl font-black">CHOOSE YOUR PLAN</h1>
      </section>

      <section className="py-12 max-w-6xl mx-auto">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800">
            <strong>Payment error:</strong> {errorMessage}
            <div className="text-sm mt-2">Open console and run <code>console.log(Object.keys(window.Paddle || {}))</code> and paste the output if you need help.</div>
          </div>
        )}

        <div className="flex justify-center items-center mb-8">
          <button onClick={() => { setBillingCycle("monthly"); void previewPrices(); }} className={billingCycle === "monthly" ? "font-bold mr-4" : "mr-4"}>Monthly</button>
          <button onClick={() => { setBillingCycle("annually"); void previewPrices(); }} className={billingCycle === "annually" ? "font-bold" : ""}>Annually</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border">
            <Badge className="bg-black text-white mb-2">PRO</Badge>
            <div className="text-3xl font-black my-2">{proPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" /> Basic AI Chat</li>
              <li><Check className="inline-block mr-2" /> 100+ Notes/Month</li>
            </ul>
            <Button onClick={() => handlePurchase("PRO")} disabled={!window.Paddle && !paddleReady} className="w-full">Get PRO</Button>
          </div>

          <div className="p-6 bg-white border">
            <Badge className="bg-fuchsia-400 text-white mb-2">PREMIUM</Badge>
            <div className="text-3xl font-black my-2">{premiumPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" /> Unlimited Everything</li>
              <li><Check className="inline-block mr-2" /> Priority Support</li>
            </ul>
            <Button onClick={() => handlePurchase("PREMIUM")} disabled={!window.Paddle && !paddleReady} className="w-full">Get PREMIUM</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
