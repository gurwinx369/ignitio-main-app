// Singleton-safe Razorpay Checkout script loader.
//
// Guarantees:
//   • Resolves immediately if window.Razorpay is already present.
//   • Reuses an in-flight promise — no duplicate <script> tags.
//   • Rejects cleanly with a user-safe error on load failure.
//   • Browser-only — never executes during SSR.
//   • Never exposes the Razorpay key secret (only the public keyId is passed to Checkout).

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayLoaderPromise = null;

/**
 * Load the Razorpay Checkout script.
 * Safe to call multiple times — returns the same promise.
 *
 * @returns {Promise<boolean>} Resolves true when Razorpay is available.
 */
export function loadRazorpay() {
  // Resolve immediately if already loaded.
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(true);
  }

  // Reuse in-flight load.
  if (razorpayLoaderPromise) {
    return razorpayLoaderPromise;
  }

  razorpayLoaderPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay Checkout is not available in server-side context."));
      return;
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      // Script tag exists but may still be loading.
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => {
        razorpayLoaderPromise = null; // Allow retry.
        reject(new Error("Razorpay script failed to load."));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => {
      razorpayLoaderPromise = null; // Allow retry.
      document.body.removeChild(script);
      reject(new Error("Razorpay script failed to load. Please check your connection."));
    });

    document.body.appendChild(script);
  });

  return razorpayLoaderPromise;
}

/**
 * Open Razorpay Checkout.
 *
 * @param {object} params
 * @param {string} params.keyId                 — Public Razorpay key (from server response)
 * @param {string} params.subscriptionId        — razorpaySubscriptionId from /subscription/create
 * @param {string} params.name                  — Merchant name shown in the modal
 * @param {string} params.description           — Plan description
 * @param {function} params.onSuccess           — Called with { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature }
 * @param {function} params.onDismiss           — Called when user closes modal without paying
 */
export function openRazorpayCheckout({ keyId, subscriptionId, name, description, onSuccess, onDismiss }) {
  const options = {
    key: keyId,
    subscription_id: subscriptionId,
    name,
    description,
    handler: (response) => {
      onSuccess({
        razorpayPaymentId:      response.razorpay_payment_id,
        razorpaySubscriptionId: response.razorpay_subscription_id,
        razorpaySignature:      response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => {
        onDismiss();
      },
      escape: true,
      animation: true,
    },
    theme: {
      // Razorpay theme.color only accepts hex — CSS variables are not supported here.
      // #19183b = var(--color-secondary-900) from the Ignitio design system.
      color: "#19183b",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", () => {
    // Razorpay itself shows the failure UI. We just dismiss.
    onDismiss();
  });
  rzp.open();
}
