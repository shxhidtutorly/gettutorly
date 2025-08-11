// src/lib/paddle.ts
// Copy-paste this entire file. Works for both Paddle client-token (Initialize) and classic vendor (Setup).

export const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};

type InitOpts = {
  token?: string;                // client-side token (for Initialize)
  vendorId?: number | string;    // vendor id (for Setup)
  environment?: "sandbox" | "production";
  timeoutMs?: number;
};

const CLASSIC_SCRIPT = "https://cdn.paddle.com/paddle/paddle.js";
const SCRIPT_ID = "paddle-classic-sdk";

/** Remove other paddle scripts & conflicting window.Paddle (safe attempt) */
function clearConflicts() {
  Array.from(document.querySelectorAll('script[src*="paddle"]'))
    .forEach(s => { if (s.id !== SCRIPT_ID) s.remove(); });

  try {
    if ((window as any).Paddle && typeof (window as any).Paddle.Initialize !== "function" && typeof (window as any).Paddle.Setup !== "function") {
      // unknown conflicting object — remove
      // eslint-disable-next-line no-self-assign
      (window as any).Paddle = undefined;
    }
  } catch (e) {
    // ignore
  }
}

function loadScriptOnce(src = CLASSIC_SCRIPT, id = SCRIPT_ID) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(new Error("Failed to load Paddle script: " + src));
    document.body.appendChild(s);
  });
}

async function waitFor(predicate: () => boolean, timeoutMs = 7000, interval = 100) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, interval));
  }
  return false;
}

export async function initializePaddle(opts: InitOpts) {
  if (typeof window === "undefined") throw new Error("initializePaddle must run in browser");

  clearConflicts();
  await loadScriptOnce();

  const ok = await waitFor(() => !!(window as any).Paddle, opts?.timeoutMs ?? 7000, 100);
  if (!ok) throw new Error("Paddle script didn't attach to window.Paddle");

  const keys = Object.keys((window as any).Paddle || {});
  // Preferred: Initialize (client-token style). Fallback: Setup (vendor id / classic).
  if (typeof (window as any).Paddle.Initialize === "function" && opts?.token) {
    try {
      (window as any).Paddle.Environment?.set?.(opts.environment === "production" ? "production" : "sandbox");
      (window as any).Paddle.Initialize({ token: opts.token, eventCallback: (ev:any)=>{/* optional */} });
      console.info("[paddle] initialized via Initialize() (client token). Keys:", keys);
      return { paddle: (window as any).Paddle, mode: "initialize" as const, keys };
    } catch (err:any) {
      console.error("[paddle] Initialize() call failed:", err);
      // continue to attempt Setup fallback if vendorId provided
    }
  }

  // Fallback: Setup (classic)
  if (typeof (window as any).Paddle.Setup === "function" && opts?.vendorId) {
    try {
      (window as any).Paddle.Environment?.set?.(opts.environment === "production" ? "production" : "sandbox");
      (window as any).Paddle.Setup({ vendor: Number(opts.vendorId) });
      console.info("[paddle] initialized via Setup() (vendor id). Keys:", keys);
      return { paddle: (window as any).Paddle, mode: "setup" as const, keys };
    } catch (err:any) {
      console.error("[paddle] Setup() call failed:", err);
      throw new Error("Paddle Setup failed: " + (err?.message || err));
    }
  }

  // If we reached here, paddle exists but neither Initialize nor Setup path succeeded
  const printable = JSON.stringify(keys);
  throw new Error(`Paddle loaded but Initialize/Setup not available. Keys on window.Paddle: ${printable}`);
}

export async function previewPrices(priceIds: string[], countryCode?: string) {
  if (typeof window === "undefined") return {};
  const P = (window as any).Paddle;
  if (!P || typeof P.PricePreview !== "function") {
    throw new Error("PricePreview not available on Paddle instance");
  }
  const req:any = { items: priceIds.map(id => ({ priceId: id, quantity: 1 })) };
  if (countryCode) req.address = { countryCode };
  const res = await P.PricePreview(req);
  const out: Record<string,string> = {};
  const lineItems = res?.data?.details?.lineItems || [];
  for (const it of lineItems) {
    const id = it?.price?.id;
    const formatted = it?.formattedTotals?.subtotal || it?.formattedTotals?.total || "";
    if (id) out[id] = formatted;
  }
  return out;
}

export async function openCheckout(params: {
  priceId: string;
  passthrough?: Record<string,any>;
  onSuccess?: (data:any)=>void;
  onClose?: ()=>void;
  settings?: Record<string,any>;
}) {
  if (typeof window === "undefined") throw new Error("openCheckout must run in browser");
  const P = (window as any).Paddle;
  if (!P || typeof P.Checkout?.open !== "function") throw new Error("Paddle.Checkout.open not available");

  P.Checkout.open({
    items: [{ priceId: params.priceId, quantity: 1 }],
    passthrough: params.passthrough ? JSON.stringify(params.passthrough) : undefined,
    settings: { displayMode: "overlay", theme: "light", ...(params.settings || {}) },
    successCallback: (data:any) => { try { params.onSuccess?.(data); } catch{} },
    closeCallback: () => { try { params.onClose?.(); } catch{} },
  });
}
