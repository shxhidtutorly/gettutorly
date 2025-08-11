// src/lib/paddle.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
type PaddleWindow = any;

const SCRIPT_ID = "paddle-js-sdk-classic";
const CDN_SRC = "https://cdn.paddle.com/paddle/paddle.js";

/** Replace with process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in prod */
const CLIENT_TOKEN = typeof window !== "undefined" && (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "")
  ? process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  : "test_26966f1f8c51d54baaba0224e16";

/** Example PRICES export so UI shares them */
export const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};

/** Small helper wait */
async function waitFor(fn: () => boolean, ms = 100, attempts = 40): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    if (fn()) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, ms));
  }
  return false;
}

/** Loads Paddle classic script only once, returns window.Paddle when initialized */
export async function initializePaddle(opts?: { token?: string; environment?: "sandbox" | "production" }) {
  const token = opts?.token ?? CLIENT_TOKEN;
  const environment = opts?.environment ?? "sandbox";

  // If Paddle already present on window and Initialize exists, just ensure environment/token present
  if (typeof window !== "undefined" && (window as PaddleWindow).Paddle && typeof (window as PaddleWindow).Paddle.Initialize === "function") {
    try {
      (window as PaddleWindow).Paddle.Environment?.set?.(environment);
      (window as PaddleWindow).Paddle.Initialize({ token });
      return (window as PaddleWindow).Paddle;
    } catch (err) {
      console.error("Paddle re-init error:", err);
      throw err;
    }
  }

  // If a script exists but doesn't provide Initialize, remove it to avoid conflicts
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing && !(window as PaddleWindow).Paddle) {
    existing.remove();
  }

  // Insert script
  if (!document.getElementById(SCRIPT_ID)) {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = CDN_SRC;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  }

  // Wait for window.Paddle to exist and for Initialize function to be attached
  const ok = await waitFor(
    () => !!(window as PaddleWindow).Paddle && typeof (window as PaddleWindow).Paddle.Initialize === "function",
    150,
    40
  );

  if (!ok) {
    // If Paddle object exists but Initialize missing, log keys for debugging
    if ((window as PaddleWindow).Paddle) {
      console.error("Paddle loaded but Initialize() not found. Keys:", Object.keys((window as PaddleWindow).Paddle || {}));
    } else {
      console.error("Paddle did not load within timeout.");
    }
    throw new Error("Paddle initialization failed (Initialize not found). Ensure only classic billing bundle is loaded.");
  }

  // Call Initialize
  try {
    (window as PaddleWindow).Paddle.Environment?.set?.(environment);
    (window as PaddleWindow).Paddle.Initialize({ token, eventCallback: (ev: any) => {/* optional debug */} });
    return (window as PaddleWindow).Paddle;
  } catch (err) {
    console.error("Paddle Initialize() threw:", err);
    throw err;
  }
}

/**
 * previewPrices
 * - priceIds: array of priceId strings or object mapping
 * - returns object { [priceId]: formattedString }
 */
export async function previewPrices(priceIds: string[]): Promise<Record<string, string>> {
  if (typeof window === "undefined" || !(window as PaddleWindow).Paddle) {
    throw new Error("Paddle not loaded");
  }
  const paddle = (window as PaddleWindow).Paddle;
  if (typeof paddle.PricePreview !== "function") {
    throw new Error("PricePreview not available on Paddle instance");
  }

  const req = {
    items: priceIds.map((id) => ({ quantity: 1, priceId: id })),
    address: {}, // optionally add country: { countryCode: 'US' }
  };

  try {
    const res = await paddle.PricePreview(req);
    const items = res?.data?.details?.lineItems ?? [];
    const out: Record<string, string> = {};
    items.forEach((it: any) => {
      const id = it?.price?.id;
      const formatted = it?.formattedTotals?.subtotal ?? it?.formattedTotals?.total ?? "";
      if (id) out[id] = formatted;
    });
    return out;
  } catch (err) {
    console.error("PricePreview failed:", err);
    throw err;
  }
}

/** openCheckout - opens overlay and returns a promise resolved on success */
export function openCheckout(args: {
  priceId: string;
  passthrough?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  onSuccess?: (payload: any) => void;
  onClose?: () => void;
}) {
  const { priceId, passthrough = {}, settings = {}, onSuccess, onClose } = args;

  if (typeof window === "undefined" || !(window as PaddleWindow).Paddle) {
    throw new Error("Paddle not initialized");
  }

  const paddle = (window as PaddleWindow).Paddle;

  return new Promise<void>((resolve, reject) => {
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        passthrough: JSON.stringify(passthrough),
        settings: {
          displayMode: "overlay",
          theme: "light",
          variant: "one-page",
          ...settings,
        },
        successCallback: (data: any) => {
          try {
            if (typeof onSuccess === "function") {
              onSuccess(data);
            } else {
              // default redirect to dashboard
              const checkoutId = data?.checkout?.id ?? data?.checkout_id ?? "";
              window.location.href = "/dashboard?purchase=success" + (checkoutId ? `&checkout_id=${checkoutId}` : "");
            }
            resolve();
          } catch (cbErr) {
            console.error("onSuccess handler error:", cbErr);
            resolve(); // still resolve; webhook is source of truth
          }
        },
        closeCallback: () => {
          if (typeof onClose === "function") onClose();
          resolve();
        },
      });
    } catch (err) {
      console.error("Checkout.open error:", err);
      reject(err);
    }
  });
}

/** debug helper */
export function getPaddleKeys(): string[] {
  if (typeof window === "undefined" || !(window as PaddleWindow).Paddle) return [];
  return Object.keys((window as any).Paddle || {});
}
