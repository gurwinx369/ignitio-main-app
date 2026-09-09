// lib/razorpay/razorpay.js
//
// Razorpay SDK — lazy singleton.
//
// The Razorpay constructor throws synchronously if key_id is empty.
// To avoid crashing at Next.js build time (when env vars may not be set),
// we create the instance lazily on first use instead of at module load.
//
// Pattern: export a getter that initialises once and caches the result.

import Razorpay from "razorpay";

let _instance = null;

/**
 * Returns the shared Razorpay SDK instance.
 * Throws a clear error if the env vars are missing.
 *
 * @returns {Razorpay}
 */
function getRazorpay() {
  if (_instance) return _instance;

  const keyId     = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "[Razorpay] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set " +
        "before calling any subscription endpoint.",
    );
  }

  _instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _instance;
}

export default getRazorpay;
