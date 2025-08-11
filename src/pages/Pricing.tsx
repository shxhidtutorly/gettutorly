// src/pages/pricing.tsx
import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* global Paddle typing for TS */
declare global {
  interface Window {
    Paddle?: any;
  }
}

/* ---------- CONFIG - replace tokens/ids if needed ---------- */
const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // your sandbox client token
const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};
/* ----------------------------------------------------------- */

/* Stubbed auth - replace with your actual useAuth() hook */
function useAuthStub() {
  return { user: { uid: "N4E8T7giMCWDy7OtWR56uHXQ1kx1", email: "shahidafrid97419@gmail.com" }, loading: false };
}

export default function PricingPage(): JSX.Element {
  const { user, loading } = useAuthStub(); // replace with real useAuth()
  const [paddleReady, setPaddleReady] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [proPriceText, setProPriceText] = useState("—");
  const [premiumPriceText, setPremiumPriceText] = useState("—");

 const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // sandbox token (keep)
async function waitFor(fn: () => boolean, attempts = 30, delay = 100) {
  for (let i = 0; i < attempts; i++) {
    if (fn()) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}

useEffect(() => {
  const SCRIPT_ID = "paddle-js-sdk-flex";
  const PADDLE_SRC = "https://cdn.paddle.com/paddle/paddle.js"; // recommended (legacy API)

  // try initialize based on what API is present
  const tryInitFromWindow = async (): Promise<boolean> => {
    if (!window.Paddle) return false;

    console.log("Paddle keys on window:", Object.keys(window.Paddle || {}));

    // Preferred: legacy billing library that exposes Initialize & PricePreview
    if (typeof window.Paddle.Initialize === "function") {
      try {
        window.Paddle.Environment?.set?.("sandbox");
        window.Paddle.Initialize({ token: CLIENT_TOKEN });
        setPaddleReady(true);
        return true;
      } catch (err) {
        console.error("Error calling Paddle.Initialize:", err);
        return false;
      }
    }

    // Fallback: newer v2-like surface with Setup (uses token + environment)
    if (typeof window.Paddle.Setup === "function") {
      try {
        window.Paddle.Setup({ token: CLIENT_TOKEN, environment: "sandbox" });
        setPaddleReady(true);
        return true;
      } catch (err) {
        console.error("Error calling Paddle.Setup:", err);
        return false;
      }
    }

    // Unknown Paddle interface
    console.warn("Paddle present but neither Initialize nor Setup available.");
    return false;
  };

  const injectScriptAndInit = async () => {
    // if some paddle script already exists, avoid double-injecting (we still probe window.Paddle)
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = PADDLE_SRC;
      s.async = true;
      s.onload = async () => {
        // wait for the API to attach
        const ok = await waitFor(() => !!window.Paddle, 20, 100);
        if (!ok) {
          console.error("Paddle script loaded but window.Paddle never appeared.");
          return;
        }
        // attempt to initialize
        const initOk = await tryInitFromWindow();
        if (!initOk) {
          console.error("Paddle loaded but Initialize() not found. Wrong version or conflict.");
          // still mark ready to allow manual Checkout.open attempts (best-effort)
          setPaddleReady(true);
        } else {
          // if initialized, try preview
          void previewPrices();
        }
      };
      s.onerror = (e) => console.error("Failed to load Paddle script", e);
      document.body.appendChild(s);
    } else {
      // script already present; try to init directly
      const initOk = await tryInitFromWindow();
      if (!initOk) {
        console.error("Existing Paddle script present but init failed.");
        setPaddleReady(true); // enable buttons anyway so you can test manual open
      } else {
        void previewPrices();
      }
    }
  };

  void injectScriptAndInit();
  // do not remove other script tags here (avoid removing scripts used elsewhere)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Price preview with graceful fallback
const previewPrices = async () => {
  if (!window.Paddle) return;
  if (typeof window.Paddle.PricePreview !== "function") {
    console.info("PricePreview not available on this Paddle build — skipping localized preview.");
    // fallback: set simple defaults or leave as previously set from config
    setProPriceText("$9.99"); // optional fallback display
    setPremiumPriceText("$19.99");
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
    for (const item of items) {
      const id = item?.price?.id;
      const formatted = item?.formattedTotals?.subtotal ?? item?.formattedTotals?.total ?? "";
      if (id === PRICES.PRO[billingCycle]) setProPriceText(formatted);
      if (id === PRICES.PREMIUM[billingCycle]) setPremiumPriceText(formatted);
    }
  } catch (err) {
    console.error("PricePreview error:", err);
  }
};

// Purchase: keep using items.priceId — works with both Setup and Initialize initializations
const handlePurchase = (planKey: "PRO" | "PREMIUM") => {
  if (!user) { window.location.href = "/signup?redirect=/pricing"; return; }
  if (!window.Paddle) { alert("Payment system not loaded."); return; }
  const priceId = PRICES[planKey][billingCycle];
  if (!priceId) { alert("Plan not configured — contact support."); return; }

  try {
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      passthrough: JSON.stringify({ firebaseUid: user.uid, email: user.email, plan: planKey }),
      settings: { displayMode: "overlay", theme: "light" },
      successCallback: (d: any) => { console.log("checkout success", d); window.location.href = "/dashboard?purchase=success"; },
      closeCallback: () => console.log("checkout closed"),
    });
  } catch (err) {
    console.error("Checkout.open error:", err);
    alert("Could not open checkout; check console.");
  }
};
  const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

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
          <div className={`p-6 bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
            <Badge className="bg-black text-white mb-2">PRO</Badge>
            <div className="text-3xl font-black my-2">{proPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" />Basic AI Chat</li>
              <li><Check className="inline-block mr-2" />100+ Notes/Month</li>
            </ul>
            <Button onClick={() => handlePurchase("PRO")} disabled={!paddleReady} className="w-full">Get PRO</Button>
          </div>

          <div className={`p-6 bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
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
