import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Initialize Paddle globally once
(function initPaddle() {
  if (typeof window === 'undefined') return;
  if ((window as any).Paddle || document.getElementById('paddle-js-sdk')) return;

  const env = import.meta.env.VITE_PADDLE_ENV === 'production' ? 'production' : 'sandbox';
  const src = 'https://cdn.paddle.com/paddle/paddle.js';

  const script = document.createElement('script');
  script.id = 'paddle-js-sdk';
  script.src = src;
  script.async = true;
  script.onload = () => {
    const Paddle = (window as any).Paddle;
    if (!Paddle) return;
    try { Paddle.Environment?.set?.(env); } catch {}
    const vendor = import.meta.env.VITE_PADDLE_VENDOR_ID;
    if (vendor) {
      try {
        Paddle.Setup({ vendor });
        console.info('[Paddle] Initialized');
      } catch (e) {
        console.warn('[Paddle] Setup failed', e);
      }
    } else {
      console.warn('[Paddle] Missing VITE_PADDLE_VENDOR_ID');
    }
  };
  document.body.appendChild(script);
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
