/**
 * Razorpay Standard Web Checkout (checkout.js modal).
 * KEY_ID is public; order creation + signature verify stay on the Express API.
 */

export interface CheckoutOrder {
  keyId: string;
  orderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    contact?: string;
    email?: string;
  };
}

export interface CheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class CheckoutCancelledError extends Error {
  constructor() {
    super('Payment cancelled');
    this.name = 'CheckoutCancelledError';
  }
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Checkout is only available in the browser'));
  }
  if (window.Razorpay) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay Standard Checkout modal for a server-created order.
 * Resolves with payment ids + signature for POST /bookings/:id/payment/verify.
 */
export async function openRazorpayCheckout(order: CheckoutOrder): Promise<CheckoutSuccess> {
  await loadCheckoutScript();
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout script failed to initialize');
  }

  const key = order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  if (!key) {
    throw new Error('Razorpay key is not configured (NEXT_PUBLIC_RAZORPAY_KEY_ID)');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key,
      amount: order.amountPaise,
      currency: order.currency || 'INR',
      name: order.name || 'Fasty24',
      description: order.description || 'Fasty24 payment',
      order_id: order.orderId,
      prefill: {
        name: order.prefill?.name || '',
        contact: order.prefill?.contact || '',
        email: order.prefill?.email || '',
      },
      theme: { color: '#FFC400' },
      handler(response: CheckoutSuccess) {
        if (
          !response?.razorpay_payment_id ||
          !response?.razorpay_order_id ||
          !response?.razorpay_signature
        ) {
          reject(new Error('Incomplete payment response from Razorpay'));
          return;
        }
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new CheckoutCancelledError());
        },
      },
    });

    rzp.on('payment.failed', (response: unknown) => {
      const desc =
        typeof response === 'object' &&
        response &&
        'error' in response &&
        typeof (response as { error?: { description?: string } }).error?.description === 'string'
          ? (response as { error: { description: string } }).error.description
          : 'Payment failed';
      reject(new Error(desc));
    });

    rzp.open();
  });
}
