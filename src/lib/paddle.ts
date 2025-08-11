// src/lib/paddle.ts
export const PRICES = {
  PRO: { monthly: "pri_01k274qrwsngnq4tre5y2qe3pp", annually: "pri_01k2cn84n03by5124kp507nfks" },
  PREMIUM: { monthly: "pri_01k274r984nbbbrt9fvpbk9sda", annually: "pri_01k2cn9c1thzxwf3nyd4bkzg78" },
};

type InitOptions = { token: string; environment?: "sandbox" | "production" };
type CheckoutParams = {
  priceId: string;
  passthrough?: Record<string, any>;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  settings?: Record<string, any>;
};

const CLASSIC_SCRIPT = "https://cdn.paddle.com/paddle/paddle.js";
const SCRIPT_ID = "paddle-classic-sdk";

function removeConflictingPaddleScripts() {
  // Remove any script tags that look like they're Paddle and clear window.Paddle
  const scripts = Array.from(document.querySelectorAll('script[src*="paddle"]')) as HTMLScriptElement[];
  scripts.forEach(s => {
    if (s.id !== SCRIPT_ID) s.remove();
  });

  // If a conflicting Paddle object exists without Initialize, remove it so we can load the correct bundle.
  if ((window as any).Paddle && typeof (window as any).Paddle.Initialize !== "function") {
    try { delete (window as any).Paddle; } catch { (window as any).Paddle = undefined; }
  }
}

function loadScript(src: string, id = SCRIPT_ID): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    // If script already exists and is loaded, resolve
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any).loaded) return resolve(existing);
      // else wait for onload
      existing.addEventListener("load", () => resolve(existing));
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => {
      (s as any).loaded = true;
      resolve(s);
    };
    s.onerror = (e) => reject(new Error("Failed to load Paddle script: " + src));
    document.body.appendChild(s);
  });
}

async function waitForInitialize(timeoutMs = 5000, interval = 100): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if ((window as any).Paddle && typeof (window as any).Paddle.Initialize === "function") return true;
    // small delay
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

/**
 * Initialize Paddle classic billing bundle.
 * - token: client-side token (sandbox or live token)
 * - environment: "sandbox" | "production"
 */
export async function initializePaddle(opts: InitOptions): Promise<any> {
  if (typeof window === "undefined") throw new Error("initializePaddle must run in browser");

  removeConflictingPaddleScripts();

  try {
    await loadScript(CLASSIC_SCRIPT, SCRIPT_ID);
  } catch (err) {
    throw new Error("Unable to load Paddle script: " + String(err));
  }

  const ok = await waitForInitialize(7000, 150);
  if (!ok) {
    // Diagnose what we got for easier debugging
    const keys = Object.keys((window as any).Paddle || {});
    throw new Error(
      `Paddle loaded but Initialize() not found. Keys on window.Paddle: ${JSON.stringify(keys)}. Make sure only ${CLASSIC_SCRIPT} is loaded.`
    );
  }

  try {
    // set environment then initialize with token
    (window as any).Paddle.Environment?.set?.(opts.environment === "production" ? "production" : "sandbox");
    (window as any).Paddle.Initialize({
      token: opts.token,
      // optional callback - logs events to console for debugging
      eventCallback: (ev: any) => {
        // console.debug("Paddle event:", ev);
      },
    });
    return (window as any).Paddle;
  } catch (err: any) {
    throw new Error("Paddle initialization failed: " + (err?.message || String(err)));
  }
}

/**
 * Price preview helper.
 * Accepts an array of priceIds and returns a map priceId -> formatted price string.
 */
export async function previewPrices(priceIds: string[], countryCode?: string): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const P = (window as any).Paddle;
  if (!P || typeof P.PricePreview !== "function") throw new Error("Paddle.PricePreview not available");

  const items = priceIds.map((p) => ({ priceId: p, quantity: 1 }));
  const req: any = { items };
  if (countryCode) req.address = { countryCode };

  const res = await P.PricePreview(req);
  const out: Record<string, string> = {};
  try {
    const lineItems = res?.data?.details?.lineItems || [];
    for (const it of lineItems) {
      const id = it.price?.id;
      const formatted = it?.formattedTotals?.subtotal || it?.formattedTotals?.total || "";
      if (id) out[id] = formatted;
    }
  } catch (e) {
    // noop fallback
  }
  return out;
}

/**
 * Open a Paddle overlay checkout (classic).
 * passthrough will be stringified and sent to Paddle (use for firebaseUid etc).
 */
export async function openCheckout(params: CheckoutParams): Promise<void> {
  const { priceId, passthrough, onSuccess, onClose, settings } = params;
  if (typeof window === "undefined") return;

  const P = (window as any).Paddle;
  if (!P || typeof P.Checkout?.open !== "function") {
    throw new Error("Paddle.Checkout.open not available. Ensure Paddle classic bundle is loaded.");
  }

  P.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    passthrough: passthrough ? JSON.stringify(passthrough) : undefined,
    settings: { displayMode: "overlay", theme: "light", ...(settings || {}) },
    successCallback: (data: any) => {
      try { onSuccess?.(data); } catch { /* swallow */ }
    },
    closeCallback: () => {
      try { onClose?.(); } catch { /* swallow */ }
    },
  });
}
