// src/pages/pricing.tsx
import React, { useEffect, useState } from "react";
import { initializePaddle, Paddle as PaddleType } from "@paddle/paddle-js";
import { Check } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* CONFIG: replace with your sandbox client token & Paddle price IDs */
const CLIENT_TOKEN = "test_26966f1f8c51d54baaba0224e16"; // your sandbox client token
const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};

/* Replace this with your real auth hook */
function useAuthStub() {
  return { user: { uid: "N4E8T7giMCWDy7OtWR56uHXQ1kx1", email: "shahidafrid97419@gmail.com" }, loading: false };
}

export default function Pricing(): JSX.Element {
  const { user, loading } = useAuthStub(); // replace with real useAuth()
  const [paddle, setPaddle] = useState<PaddleType | undefined>(undefined);
  const [paddleReady, setPaddleReady] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [proPriceText, setProPriceText] = useState("—");
  const [premiumPriceText, setPremiumPriceText] = useState("—");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setErrorMessage(null);

    // initializePaddle downloads the correct Paddle.js and returns a Paddle instance
    initializePaddle({ token: CLIENT_TOKEN, environment: "sandbox" })
      .then((pInstance) => {
        if (!mounted) return;
        if (!pInstance) {
          setErrorMessage("Failed to load Paddle instance.");
          console.error("initializePaddle returned undefined");
          return;
        }
        console.log("Paddle instance keys:", Object.keys(pInstance || {}));
        setPaddle(pInstance);
        setPaddleReady(true);
        // preview prices if API available
        void previewPrices(pInstance, billingCycle);
      })
      .catch((err) => {
        console.error("initializePaddle error:", err);
        setErrorMessage("Payment initialization error. Check console.");
      });

    return () => { mounted = false; };
  }, []); // run once

  // preview localized prices (best-effort)
  async function previewPrices(pInstance: PaddleType | undefined = paddle, cycle = billingCycle) {
    if (!pInstance || typeof pInstance.PricePreview !== "function") {
      // fallback: show static text
      setProPriceText(cycle === "monthly" ? "$5.99" : "$36");
      setPremiumPriceText(cycle === "monthly" ? "$9.99" : "$65");
      return;
    }

    try {
      const req = {
        items: [
          { quantity: 1, priceId: PRICES.PRO[cycle] },
          { quantity: 1, priceId: PRICES.PREMIUM[cycle] },
        ],
      };
      const result = await pInstance.PricePreview(req);
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
    void previewPrices(undefined, billingCycle);
  }, [billingCycle, paddle]);

  // handle checkout
  const handlePurchase = (planKey: "PRO" | "PREMIUM") => {
    if (loading) return;
    if (!user) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }
    if (!paddle) {
      alert("Payments not ready. Try again shortly.");
      return;
    }

    const priceId = PRICES[planKey][billingCycle];
    if (!priceId) {
      console.error("Missing priceId:", planKey, billingCycle);
      alert("Plan misconfigured. Contact support.");
      return;
    }

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        passthrough: JSON.stringify({ firebaseUid: user.uid, email: user.email, plan: planKey, cycle: billingCycle }),
        settings: { displayMode: "overlay", theme: "light" },
        successCallback: (data: any) => {
          console.log("Checkout success:", data);
          window.location.href = "/dashboard?subId=" + data.checkout.id;
        },
        closeCallback: () => console.log("Checkout closed"),
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
      <section className="py-12 max-w-6xl mx-auto">
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
            <Button onClick={() => handlePurchase("PRO")} disabled={!paddleReady && !paddle} className="w-full">Get PRO</Button>
          </div>

          <div className="p-6 bg-white border">
            <Badge className="bg-fuchsia-400 text-white mb-2">PREMIUM</Badge>
            <div className="text-3xl font-black my-2">{premiumPriceText}</div>
            <ul className="mb-4">
              <li><Check className="inline-block mr-2" />Unlimited Everything</li>
              <li><Check className="inline-block mr-2" />Priority Support</li>
            </ul>
            <Button onClick={() => handlePurchase("PREMIUM")} disabled={!paddleReady && !paddle} className="w-full">Get PREMIUM</Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
