// src/lib/paddle.ts
import { initializePaddle, Paddle as PaddleType } from "@paddle/paddle-js";

let paddlePromise: Promise<PaddleType | undefined> | null = null;

export function getPaddle(environment: "sandbox" | "production" = (import.meta.env.VITE_PADDLE_ENV === "production" ? "production" : "sandbox")) {
  if (!paddlePromise) {
    const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || import.meta.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";
    paddlePromise = initializePaddle({ token, environment })
      .then((p) => p)
      .catch((e) => {
        console.error("[Paddle] initialize error", e);
        return undefined;
      });
  }
  return paddlePromise;
}

export async function previewPrices(items: { priceId: string; quantity?: number }[], env?: "sandbox" | "production") {
  const paddle = await getPaddle(env);
  if (!paddle || typeof paddle.PricePreview !== "function") return undefined;
  try {
    const result = await paddle.PricePreview({ items });
    return result;
  } catch (e) {
    console.error("[Paddle] PricePreview error", e);
    return undefined;
  }
}

export type CheckoutPassthrough = Record<string, any>;

export async function openCheckout(opts: {
  priceId: string;
  quantity?: number;
  passthrough?: CheckoutPassthrough; // stored as customData in v2
  customer?: { email?: string };
  settings?: any;
  success?: (data: any) => void;
  close?: () => void;
  env?: "sandbox" | "production";
}) {
  const paddle = await getPaddle(opts.env);
  if (!paddle) throw new Error("Paddle not ready");
  const { priceId, quantity = 1, passthrough, customer, settings, success, close } = opts;
  return paddle.Checkout.open({
    items: [{ priceId, quantity }],
    customer,
    // Paddle v2 uses customData instead of passthrough; keep both for compatibility in typings
    // @ts-ignore - not all type versions include customData
    customData: passthrough ? JSON.stringify(passthrough) : undefined,
    settings: settings || { displayMode: "overlay", theme: "light" },
    successCallback: success,
    closeCallback: close,
  } as any);
}
