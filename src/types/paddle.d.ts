export interface PaddleWindow extends Window {
  Paddle: {
    Environment: {
      set: (env: 'sandbox' | 'production') => void;
    };
    Setup: (options: {
      vendor: string;
      eventCallback?: (data: any) => void;
    }) => void;
    Checkout: {
      open: (options: {
        items: Array<{ priceId: string; quantity: number }>;
        customerEmail?: string;
        customData?: Record<string, any>;
        successUrl?: string;
        cancelUrl?: string;
      }) => void;
    };
  };
}

declare global {
  interface Window {
    Paddle?: PaddleWindow['Paddle'];
  }
}