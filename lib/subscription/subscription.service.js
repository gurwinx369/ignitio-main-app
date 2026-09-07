// lib/subscription/subscription.service.js
//
// Subscription lifecycle service.
// No HTTP logic here — called by route handlers after auth + validation.
//
// Responsibilities:
//   createSubscription     — create Razorpay subscription + local record
//   verifyPayment          — verify signature, run DB transaction
//   getSubscriptionStatus  — read MongoDB, compute derived fields
//   getAccessStatus        — fast entitlement check (no billing data)
//   cancelSubscription     — call Razorpay cancel, set cancelAtPeriodEnd
//   handleWebhookEvent     — idempotent webhook dispatch
//   expireStaleSubscriptions — cron: expire confirmed-dead subscriptions
//
// Security contract:
//   • Never trust client-supplied user IDs — always resolve from firebaseUID.
//   • Never trust webhook payload data — always re-fetch from Razorpay.
//   • Never expose internal errors — callers log and surface generic messages.

import crypto from "crypto";
import mongoose from "mongoose";

import connectToDB from "@/dbConfig/dbConnection";
import getRazorpay from "@/lib/razorpay/razorpay";
import { getPlan, getPlanByRazorpayId } from "@/lib/subscription/constants";
import {
  PREMIUM_ENTITLEMENTS,
  REVOKED_PREMIUM_ENTITLEMENTS,
} from "@/lib/premium/premium-entitlements";
import { UserProfile } from "@/models/v2/user.profile.model";
import {
  Subscription,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PLAN,
  PAYMENT_PROVIDER,
} from "@/models/v2/subscription.model";
import {
  Payment,
  PAYMENT_STATUS,
  PAYMENT_PROVIDER as PAYMENT_PAYMENT_PROVIDER,
} from "@/models/v2/payment.model";
import {
  hasAnyPremiumRoadmapEntitlement,
} from "@/lib/premium/premium-roadmap-access-policy";
import {
  redeemCoupon,
  validateCoupon,
} from "@/lib/coupon/coupon.service";

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Resolve the entitlement bundle for a persisted subscription plan.
 *
 * New purchasable plans resolve through the subscription plan registry.
 * The legacy ignitio_premium slug remains supported for existing records.
 *
 * Unknown/corrupt plan values fail closed by returning null.
 *
 * @param {string} plan
 * @param {object} [options]
 * @param {boolean} [options.revoke=false]
 * @returns {object|null}
 */
function resolveSubscriptionEntitlements(
  plan,
  { revoke = false } = {},
) {
  if (
    plan === SUBSCRIPTION_PLAN.IGNITIO_PREMIUM
  ) {
    return revoke
      ? REVOKED_PREMIUM_ENTITLEMENTS
      : PREMIUM_ENTITLEMENTS;
  }

  let planConfig;

  try {
    planConfig = getPlan(plan);
  } catch {
    return null;
  }

  return revoke
    ? planConfig.revokedEntitlements
    : planConfig.entitlements;
}

/**
 * Resolve a UserProfile by firebaseUID.
 * Returns the Mongoose document (not lean) so callers can use _id.
 *
 * @param {string} firebaseUID
 * @returns {Promise<{user}|{error, status}>}
 */
async function resolveUser(firebaseUID) {
  const user = await UserProfile.findOne({ firebaseUID });
  if (!user) {
    return { error: "User profile not found", status: 404 };
  }
  return { user };
}

/**
 * Shared server-only helper: advance onboardingState.step from "paywall" to
 * "role_selection". Preserves "role_selection" and "completed" (no backward
 * moves). Never grants or revokes Premium entitlements.
 *
 * Returns the canonical next step AFTER the update, so callers can return
 * accurate nextStep values to clients.
 *
 * @param {object} params
 * @param {object} params.userId       — Mongoose ObjectId from UserProfile
 * @param {object} [params.session]    — Optional Mongoose session (for transactions)
 * @returns {Promise<string>}          — The canonical step ("role_selection" | "completed" | ...)
 */
async function advancePaywallToRoleSelection({ userId, session }) {
  const opts = session ? { session } : {};

  // Atomic conditional: only moves "paywall" → "role_selection".
  // role_selection and completed are left unchanged by the filter.
  await UserProfile.updateOne(
    { _id: userId, "onboardingState.step": "paywall" },
    { $set: { "onboardingState.step": "role_selection" } },
    opts,
  );

  // Re-read the canonical step so we return the actual persisted state
  // (handles the case where the user was already at role_selection or completed).
  const profile = await UserProfile.findById(userId, { "onboardingState.step": 1 }, opts).lean();
  return profile?.onboardingState?.step ?? "role_selection";
}

/**
 * Convert a Unix timestamp (seconds) to a UTC Date.
 * Razorpay returns all timestamps as Unix seconds.
 *
 * @param {number|null} unixSeconds
 * @returns {Date|null}
 */
function fromUnix(unixSeconds) {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000);
}

/**
 * Compute days remaining until a period end date.
 * Returns 0 if the date is in the past.
 *
 * @param {Date|null} periodEnd
 * @returns {number}
 */
function computeDaysRemaining(periodEnd) {
  if (!periodEnd) return 0;
  const msRemaining = new Date(periodEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}

// ─── createSubscription ──────────────────────────────────────────────────────

/**
 * Create a new Razorpay subscription and store the local record.
 *
 * @param {object} params
 * @param {string} params.firebaseUID — from verified Firebase token
 * @param {string} params.plan — purchasable Ignitio plan slug (e.g. "ignitio_monthly")
 * @returns {Promise<{razorpaySubscriptionId, amount, currency, keyId}|{error, status}>}
 */
export async function createSubscription({ firebaseUID, plan, couponCode }) {
  await connectToDB();

  // ── Validate plan ────────────────────────────────────────────────────────
  let planConfig;
  try {
    planConfig = getPlan(plan);
  } catch {
    return { error: "Invalid subscription plan", status: 400 };
  }

  if (!planConfig.razorpayPlanId) {
    console.error(`[createSubscription] Razorpay plan ID is not configured for plan: ${plan}`);
    return { error: "Subscription plan is not configured", status: 503 };
  }

  // ── Resolve user ─────────────────────────────────────────────────────────
  const { user, error: userError, status: userStatus } = await resolveUser(firebaseUID);
  if (userError) return { error: userError, status: userStatus };

  const razorpay = getRazorpay();

  // ── Idempotency guard ────────────────────────────────────────────────────
  // Reject if the user already has an ACTIVE or PAYMENT_PENDING subscription.
  // CREATED is allowed to be retried (e.g. checkout was abandoned).
  const existing = await Subscription.findOne({ userId: user._id });

  if (existing) {
    const blockingStatuses = [
      SUBSCRIPTION_STATUS.ACTIVE,
      SUBSCRIPTION_STATUS.PAYMENT_PENDING,
    ];
    if (blockingStatuses.includes(existing.status)) {
      return {
        error: "Subscription already exists",
        status: 409,
        existingStatus: existing.status,
      };
    }
    // CANCELLED / EXPIRED — allow a new subscription by removing the old one.
    // This ensures the one-per-user constraint remains valid.
    if (
      existing.status === SUBSCRIPTION_STATUS.CANCELLED ||
      existing.status === SUBSCRIPTION_STATUS.EXPIRED
    ) {
      await Subscription.deleteOne({ _id: existing._id });
    }
    // CREATED — fall through to re-create (abandoned checkout retry)
    if (existing.status === SUBSCRIPTION_STATUS.CREATED) {
      await Subscription.deleteOne({ _id: existing._id });
    }
  }

  // ── Validate coupon ────────────────────────────────────────────────────
  let coupon = null;

  if (couponCode) {
    const couponResult = await validateCoupon({
      firebaseUID,
      couponCode,
      plan,
    });

    if (!couponResult.valid) {
      return {
        error: couponResult.error,
        status: couponResult.status,
      };
    }

    coupon = couponResult.coupon;
  }

  // ── Create Razorpay subscription ─────────────────────────────────────────
  let rzpSubscription;
  try {
    const razorpaySubscriptionPayload = {
      plan_id: planConfig.razorpayPlanId,
      total_count: planConfig.totalCount,
      quantity: 1,
    };

    if (coupon) {
      razorpaySubscriptionPayload.offer_id = coupon.razorpayOfferId;
    }

    rzpSubscription = await razorpay.subscriptions.create(
      razorpaySubscriptionPayload,
    );
  } catch (err) {
    console.error("[createSubscription] Razorpay API error:", err.error ?? err.message);
    return {
      error: "Failed to create subscription with payment provider",
      status: 502,
    };
  }

  // ── Persist local Subscription document ─────────────────────────────────
  try {
    await Subscription.create({
      userId: user._id,
      firebaseUID,
      provider: PAYMENT_PROVIDER.RAZORPAY,
      plan: planConfig.slug,
      status: SUBSCRIPTION_STATUS.CREATED,
      razorpaySubscriptionId: rzpSubscription.id,
      razorpayPlanId: planConfig.razorpayPlanId,
      razorpayCustomerId: rzpSubscription.customer_id ?? null,
      couponId: coupon?._id ?? null,
      couponCode: coupon?.code ?? null,
      razorpayOfferId: coupon?.razorpayOfferId ?? null,
    });
  } catch (err) {
    // The unique userId index protects against concurrent subscription
    // creation requests. If this request loses that race, compensate for
    // the already-created Razorpay subscription.
    if (err?.code === 11000) {
      try {
        await razorpay.subscriptions.cancel(rzpSubscription.id);
      } catch (cancelErr) {
        console.error(
          "[createSubscription] Failed to cancel orphaned Razorpay subscription:",
          cancelErr.error ?? cancelErr.message,
        );
      }

      return {
        error: "Subscription already exists",
        status: 409,
      };
    }

    throw err;
  }

  return {
    razorpaySubscriptionId: rzpSubscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
}

// ─── verifyPayment ───────────────────────────────────────────────────────────

/**
 * Verify a completed payment and activate the subscription.
 *
 * Security:
 *   • Verifies Razorpay HMAC-SHA256 signature before any DB writes.
 *   • Uses a MongoDB transaction — all writes commit or all roll back.
 *   • Idempotent — safe to call multiple times for the same payment.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySubscriptionId
 * @param {string} params.razorpaySignature
 * @returns {Promise<{success, subscription}|{error, status}>}
 */
export async function verifyPayment({
  firebaseUID,
  razorpayPaymentId,
  razorpaySubscriptionId,
  razorpaySignature,
}) {
  await connectToDB();

  // ── Resolve user ─────────────────────────────────────────────────────────
  const { user, error: userError, status: userStatus } = await resolveUser(firebaseUID);
  if (userError) return { error: userError, status: userStatus };

  // ── Idempotency check ────────────────────────────────────────────────────
  // If this payment has already been recorded and processed, return success.
  // Do NOT create duplicate writes.
  const existingPayment = await Payment.findOne({ razorpayPaymentId }).lean();
  if (existingPayment && existingPayment.status === PAYMENT_STATUS.CAPTURED) {
    const sub = await Subscription.findOne({ userId: user._id }).lean();
    return {
      success: true,
      alreadyProcessed: true,
      subscription: {
        status: sub?.status ?? SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      },
    };
  }

  // ── Verify Razorpay HMAC signature ───────────────────────────────────────
  // Signature = HMAC-SHA256(paymentId + "|" + subscriptionId, key_secret)
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    console.warn("[verifyPayment] Signature mismatch for payment:", razorpayPaymentId);
    return { error: "Invalid payment signature", status: 400 };
  }

  // ── Load local subscription and verify ownership ─────────────────────────
  const localSub = await Subscription.findOne({
    userId: user._id,
    razorpaySubscriptionId,
  });

  if (!localSub) {
    return { error: "Subscription not found", status: 404 };
  }

  const grantedEntitlements =
    resolveSubscriptionEntitlements(localSub.plan);

  if (!grantedEntitlements) {
    console.error(
      `[verifyPayment] Unknown subscription plan: ${localSub.plan}`,
    );

    return {
      error: "Invalid subscription configuration",
      status: 500,
    };
  }

  // ── Fetch authoritative data from Razorpay ───────────────────────────────
  // Never trust client-submitted data. The Razorpay API is the source of truth.
  const razorpay = getRazorpay();
  let rzpPayment;
  let rzpSubscription;
  try {
    [rzpPayment, rzpSubscription] = await Promise.all([
      razorpay.payments.fetch(razorpayPaymentId),
      razorpay.subscriptions.fetch(razorpaySubscriptionId),
    ]);
  } catch (err) {
    console.error("[verifyPayment] Razorpay fetch error:", err.error ?? err.message);
    return { error: "Failed to verify payment with provider", status: 502 };
  }

  // The payment must be in a captured/authorized state.
  const paymentCaptured =
    rzpPayment.status === "captured";

  const paymentAuthorized =
    rzpPayment.status === "authorized";

  if (!paymentCaptured && !paymentAuthorized) {
    return {
      error: "Payment has not been captured",
      status: 400,
      providerStatus: rzpPayment.status,
    };
  }

  // ── Resolve billing period from Razorpay subscription ────────────────────
  // charge_at = next billing timestamp; current_start = period start.
  const currentPeriodStart = fromUnix(rzpSubscription.current_start);
  const currentPeriodEnd = fromUnix(rzpSubscription.current_end ?? rzpSubscription.charge_at);
  const nextBillingAt = fromUnix(rzpSubscription.charge_at);

  // ── MongoDB transaction ───────────────────────────────────────────────────
  // All three writes (Payment, Subscription, UserProfile) succeed or all fail.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const now = new Date();

      // 1. Atomically reconcile Payment document.
      // Webhooks may have already created the same payment before /payment/verify
      // reaches this transaction. Upsert by the unique razorpayPaymentId prevents
      // the verify flow from doing a check-then-create race.
      const paymentWriteResult = await Payment.updateOne(
        {
          razorpayPaymentId:
            rzpPayment.id,
        },
        {
          $setOnInsert: {
            userId:
              user._id,
            subscriptionId:
              localSub._id,
            firebaseUID,
            provider:
              PAYMENT_PAYMENT_PROVIDER.RAZORPAY,
            amount:
              rzpPayment.amount,
            currency:
              rzpPayment.currency ??
              "INR",
            razorpayPaymentId:
              rzpPayment.id,
          },

          $set: {
            status:
              PAYMENT_STATUS.CAPTURED,

            razorpayOrderId:
              rzpPayment.order_id ??
              null,

            razorpayInvoiceId:
              rzpPayment.invoice_id ??
              null,

            razorpaySignature,

            billingPeriodStart:
              currentPeriodStart,

            billingPeriodEnd:
              currentPeriodEnd,

            lastWebhookEvent:
              "payment.verify",
          },
        },
        {
          upsert: true,
          session,
        },
      );

      // Preserve the first successful-payment timestamp.
      // If a webhook inserted the payment first, paidAt may already exist.
      // If payment.authorized inserted a stub first, this fills it now.
      await Payment.updateOne(
        {
          razorpayPaymentId:
            rzpPayment.id,
          $or: [
            {
              paidAt: null,
            },
            {
              paidAt: {
                $exists: false,
              },
            },
          ],
        },
        {
          $set: {
            paidAt: now,
          },
        },
        {
          session,
        },
      );

      // Load the canonical Payment document from inside the same transaction.
      // This gives coupon redemption the persisted payment _id.
      const localPayment = await Payment.findOne(
        {
          razorpayPaymentId: rzpPayment.id,
        },
        null,
        { session },
      );

      if (!localPayment) {
        throw new Error(
          "Payment record could not be loaded after reconciliation",
        );
      }

      // 2. Activate subscription
      await Subscription.updateOne(
        { _id: localSub._id },
        {
          $set: {
            status: SUBSCRIPTION_STATUS.ACTIVE,
            currentPeriodStart,
            currentPeriodEnd,
            nextBillingAt,
            lastPaymentAt: now,
          },
        },
        { session },
      );

      // 3. Record coupon redemption only after the payment has been
      // successfully reconciled and the subscription has been activated.
      //
      // This runs inside the same MongoDB transaction, so a failed
      // redemption rolls back the payment/subscription activation too.
      if (paymentCaptured) {
        const redemptionResult = await redeemCoupon({
          subscription: localSub,
          payment: localPayment,
          session,
        });

        if (redemptionResult.error) {
          throw new Error(redemptionResult.error);
        }
      }

      // 4. Grant entitlements and conditionally advance onboarding state.
      // Both are written in a single profile update to avoid competing writes
      // inside the same transaction. The step is only advanced if still at
      // "paywall" — later states (role_selection, completed) are preserved.
      const currentStep = user.onboardingState?.step;
      const profileSet = {
        ...grantedEntitlements,
      };
      if (currentStep === "paywall") {
        profileSet["onboardingState.step"] = "role_selection";
      }
      await UserProfile.updateOne(
        { _id: user._id },
        { $set: profileSet },
        { session },
      );
    });
  } catch (err) {
    console.error("[verifyPayment] Transaction failed:", err.message);
    return { error: "Failed to record payment", status: 500 };
  } finally {
    await session.endSession();
  }

  // Determine canonical nextStep from the actual persisted state.
  // Re-reading avoids returning "role_selection" for a user already at "completed".
  const updatedProfile = await UserProfile.findById(user._id, { "onboardingState.step": 1 }).lean();
  const canonicalStep = updatedProfile?.onboardingState?.step ?? "role_selection";

  return {
    success: true,
    alreadyProcessed: false,
    nextStep: canonicalStep,
    subscription: {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      currentPeriodStart,
      currentPeriodEnd,
      nextBillingAt,
    },
  };
}

// ─── getSubscriptionStatus ───────────────────────────────────────────────────

/**
 * Return the full subscription status for the authenticated user.
 * Reads MongoDB only — never contacts Razorpay.
 * The frontend must not compute or cache premium state locally.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @returns {Promise<{status, plan, ...}|{error, status}>}
 */
export async function getSubscriptionStatus({ firebaseUID }) {
  await connectToDB();

  const { user, error: userError, status: userStatus } = await resolveUser(firebaseUID);
  if (userError) return { error: userError, status: userStatus };

  const sub = await Subscription.findOne({ userId: user._id }).lean();

  if (!sub) {
    return {
      status: null,
      plan: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      daysRemaining: 0,
      entitled:
        hasAnyPremiumRoadmapEntitlement(user),
    };
  }

  return {
    status: sub.status,
    plan: sub.plan,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    nextBillingAt: sub.nextBillingAt,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    daysRemaining: computeDaysRemaining(sub.currentPeriodEnd),
    entitled:
      hasAnyPremiumRoadmapEntitlement(user),
  };
}

// ─── getAccessStatus ─────────────────────────────────────────────────────────

/**
 * Fast server-side entitlement check — no billing data returned.
 * Used for frequent access checks that do not need billing details.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @returns {Promise<{premium, genAi}|{error, status}>}
 */
export async function getAccessStatus({ firebaseUID }) {
  await connectToDB();

  const { user, error: userError, status: userStatus } = await resolveUser(firebaseUID);
  if (userError) return { error: userError, status: userStatus };

  const genAi =
    user.entitlements?.roadmaps?.genAi === true;

  return {
    premium:
      hasAnyPremiumRoadmapEntitlement(
        user,
      ),
    genAi,
  };
}

// ─── cancelSubscription ──────────────────────────────────────────────────────

/**
 * Cancel a subscription at period end.
 *
 * Does NOT immediately revoke access. Premium remains active until
 * currentPeriodEnd. Entitlements are revoked by the expiration cron.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @returns {Promise<{success, cancelAtPeriodEnd, currentPeriodEnd}|{error, status}>}
 */
export async function cancelSubscription({ firebaseUID }) {
  await connectToDB();

  const { user, error: userError, status: userStatus } = await resolveUser(firebaseUID);
  if (userError) return { error: userError, status: userStatus };

  const sub = await Subscription.findOne({ userId: user._id });
  if (!sub) {
    return { error: "No subscription found", status: 404 };
  }

  if (sub.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    return {
      error: `Subscription cannot be cancelled in status: ${sub.status}`,
      status: 409,
    };
  }

  if (sub.cancelAtPeriodEnd) {
    // Already scheduled for cancellation — idempotent response.
    return {
      success: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }

  // ── Call Razorpay cancel API ─────────────────────────────────────────────
  // cancel_at_cycle_end: 1 = cancel at end of billing cycle (not immediately)
  const razorpay = getRazorpay();
  try {
    await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, {
      cancel_at_cycle_end: 1,
    });
  } catch (err) {
    console.error("[cancelSubscription] Razorpay API error:", err.error ?? err.message);
    return { error: "Failed to cancel subscription with provider", status: 502 };
  }

  // ── Update local record ──────────────────────────────────────────────────
  await Subscription.updateOne(
    { _id: sub._id },
    {
      $set: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    },
  );

  return {
    success: true,
    cancelAtPeriodEnd: true,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

// ─── handleWebhookEvent ──────────────────────────────────────────────────────

/**
 * Idempotent handler for Razorpay webhook events.
 *
 * Contract:
 *   • Signature is verified BEFORE this function is called (in the route handler).
 *   • Never trust payload data — always re-fetch from Razorpay.
 *   • Unknown events are silently ignored (return { ok: true }).
 *   • Duplicate events must not cause duplicate writes or state changes.
 *
 * @param {object} params
 * @param {string} params.event   — Razorpay event name
 * @param {object} params.payload — Razorpay webhook payload body
 * @returns {Promise<{ok: true}>}
 */
export async function handleWebhookEvent({ event, payload }) {
  await connectToDB();

  const SUPPORTED_EVENTS = new Set([
    "subscription.activated",
    "subscription.charged",
    "subscription.cancelled",
    "subscription.completed",
    "payment.authorized",
    "payment.captured",
    "payment.failed",
    "payment.refunded",
  ]);

  if (!SUPPORTED_EVENTS.has(event)) {
    // Unknown events are ignored — never fail because Razorpay adds new types.
    console.log(`[webhook] Ignoring unsupported event: ${event}`);
    return { ok: true };
  }

  const razorpay = getRazorpay();
  try {
    switch (event) {
      case "subscription.activated":
      case "subscription.charged":
        await handleSubscriptionCharged(payload, event);
        break;

      case "subscription.cancelled":
      case "subscription.completed":
        await handleSubscriptionCancelled(payload, event);
        break;

      case "payment.authorized":
      case "payment.captured":
        await handlePaymentCaptured(payload, event);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload, event);
        break;

      case "payment.refunded":
        await handlePaymentRefunded(payload, event);
        break;
    }
  } catch (err) {
    // Log and swallow — the route handler always returns 200 to Razorpay.
    // Failing here would cause Razorpay to retry, which we don't want for
    // processing errors (vs. network errors).
    console.error(`[webhook] Error processing event "${event}":`, err.message);
  }

  return { ok: true };
}

// ─── Webhook sub-handlers ────────────────────────────────────────────────────

/**
 * subscription.activated and subscription.charged:
 * Re-fetch the subscription from Razorpay, update local record, create Payment.
 */
async function handleSubscriptionCharged(payload, event) {
  const razorpay = getRazorpay();
  const rzpSubId =
    payload?.payload?.subscription?.entity?.id ??
    payload?.payload?.payment?.entity?.subscription_id;

  if (!rzpSubId) {
    console.warn(`[webhook:${event}] No subscription ID in payload`);
    return;
  }

  // Re-fetch from Razorpay — payload data is not trusted.
  const [rzpSubscription, rzpPayment] =
    await Promise.all([
      razorpay.subscriptions.fetch(
        rzpSubId,
      ),
      payload?.payload?.payment?.entity?.id
        ? razorpay.payments.fetch(
          payload.payload.payment.entity.id,
        )
        : Promise.resolve(null),
    ]);

  let rzpInvoice = null;

  if (rzpPayment?.invoice_id) {
    try {
      rzpInvoice =
        await razorpay.invoices.fetch(
          rzpPayment.invoice_id,
        );
    } catch (err) {
      console.error(
        `[webhook:${event}] Failed to fetch invoice ${rzpPayment.invoice_id}:`,
        err.error ?? err.message,
      );

      // Do not fail the entire webhook.
      // Subscription data remains the safe provider fallback.
    }
  }

  const localSub = await Subscription.findOne({ razorpaySubscriptionId: rzpSubId });
  if (!localSub) {
    console.warn(`[webhook:${event}] No local subscription found for: ${rzpSubId}`);
    return;
  }

  const grantedEntitlements =
    resolveSubscriptionEntitlements(localSub.plan);

  if (!grantedEntitlements) {
    console.error(
      `[webhook:${event}] Unknown subscription plan: ${localSub.plan}`,
    );
    return;
  }

  const providerPeriodStart =
    fromUnix(
      rzpSubscription.current_start,
    );

  const providerPeriodEnd =
    fromUnix(
      rzpSubscription.current_end ??
      rzpSubscription.charge_at,
    );

  const providerNextBillingAt =
    fromUnix(
      rzpSubscription.charge_at,
    );

  const invoiceBelongsToSubscription =
    rzpInvoice?.subscription_id ===
    rzpSubId;

  const invoicePeriodStart =
    invoiceBelongsToSubscription
      ? fromUnix(
        rzpInvoice.billing_start,
      )
      : null;

  const invoicePeriodEnd =
    invoiceBelongsToSubscription
      ? fromUnix(
        rzpInvoice.billing_end,
      )
      : null;

  // A charged payment belongs to the exact invoice period.
  // subscription.activated and invoice-less cases retain
  // the authoritative subscription-state fallback.
  const currentPeriodStart =
    event === "subscription.charged" &&
      invoicePeriodStart
      ? invoicePeriodStart
      : providerPeriodStart;

  const currentPeriodEnd =
    event === "subscription.charged" &&
      invoicePeriodEnd
      ? invoicePeriodEnd
      : providerPeriodEnd;

  const nextBillingAt =
    event === "subscription.charged" &&
      invoicePeriodEnd
      ? invoicePeriodEnd
      : providerNextBillingAt;

  const now = new Date();

  // ── Atomically reconcile Payment record ──────────────────────────────────────
  // Multiple Razorpay events for the same payment can arrive concurrently.
  // The unique razorpayPaymentId index + atomic upsert guarantees one ledger row.
  if (rzpPayment?.id) {
    const paymentSet = {
      status:
        rzpPayment.status === "captured"
          ? PAYMENT_STATUS.CAPTURED
          : PAYMENT_STATUS.AUTHORIZED,
      lastWebhookEvent: event,
    };

    if (rzpPayment.invoice_id) {
      paymentSet.razorpayInvoiceId =
        rzpPayment.invoice_id;
    }

    // subscription.charged has the exact paid invoice period.
    // subscription.activated falls back to provider subscription dates.
    if (currentPeriodStart) {
      paymentSet.billingPeriodStart =
        currentPeriodStart;
    }

    if (currentPeriodEnd) {
      paymentSet.billingPeriodEnd =
        currentPeriodEnd;
    }

    await Payment.updateOne(
      {
        razorpayPaymentId:
          rzpPayment.id,
      },
      {
        $setOnInsert: {
          userId:
            localSub.userId,
          subscriptionId:
            localSub._id,
          firebaseUID:
            localSub.firebaseUID,
          provider:
            PAYMENT_PAYMENT_PROVIDER.RAZORPAY,
          amount:
            rzpPayment.amount,
          currency:
            rzpPayment.currency ??
            "INR",
          razorpayPaymentId:
            rzpPayment.id,
        },
        $set: paymentSet,
      },
      {
        upsert: true,
      },
    );

    // Preserve the first captured timestamp.
    // Covers the case where payment.authorized created the row first.
    if (
      rzpPayment.status ===
      "captured"
    ) {
      await Payment.updateOne(
        {
          razorpayPaymentId:
            rzpPayment.id,
          $or: [
            { paidAt: null },
            {
              paidAt: {
                $exists: false,
              },
            },
          ],
        },
        {
          $set: {
            paidAt: now,
          },
        },
      );
    }

    // Coupon redemption is only allowed after a captured payment.
    // subscription.activated must never consume a coupon.
    if (
      event === "subscription.charged" &&
      rzpPayment.status === "captured" &&
      localSub.couponId
    ) {
      const localPayment = await Payment.findOne({
        razorpayPaymentId: rzpPayment.id,
      });

      if (!localPayment) {
        throw new Error(
          "Payment record could not be loaded for coupon redemption",
        );
      }

      const redemptionResult = await redeemCoupon({
        subscription: localSub,
        payment: localPayment,
      });

      if (redemptionResult.error) {
        throw new Error(redemptionResult.error);
      }
    }
  }
  // ── Update Subscription record ───────────────────────────────────────────
  await Subscription.updateOne(
    { _id: localSub._id },
    {
      $set: {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        nextBillingAt,
        lastPaymentAt: now,
      },
    },
  );

  // ── Ensure entitlement is set and advance onboarding state if applicable.
  // This is NOT inside a transaction — the webhook handler is idempotent but
  // not transactional. Each write is conditional and safe to apply independently.
  //
  // Reconciliation: if the user is stuck at "paywall" but is now entitled
  // (e.g. webhook fired before client verification completed), advance to
  // "role_selection". Uses advancePaywallToRoleSelection which is a no-op for
  // users already at role_selection or completed.
  const localUser = await UserProfile.findById(localSub.userId, {
    "onboardingState.step": 1,
  }).lean();

  const profileSet = {
    ...grantedEntitlements,
  };
  const currentStep = localUser?.onboardingState?.step;
  if (currentStep === "paywall") {
    profileSet["onboardingState.step"] = "role_selection";
  }

  await UserProfile.updateOne(
    { _id: localSub.userId },
    { $set: profileSet },
  );
  // Note: webhook reconciliation is sequential but idempotent — not transactional.
}

/**
 * subscription.cancelled and subscription.completed:
 * Re-fetch from Razorpay. Mark subscription as CANCELLED if confirmed.
 * Do NOT immediately revoke entitlements — keep access until period end.
 */
async function handleSubscriptionCancelled(payload, event) {
  const razorpay = getRazorpay();
  const rzpSubId = payload?.payload?.subscription?.entity?.id;
  if (!rzpSubId) {
    console.warn(`[webhook:${event}] No subscription ID in payload`);
    return;
  }

  // Re-fetch from Razorpay to confirm state.
  const rzpSubscription = await razorpay.subscriptions.fetch(rzpSubId);
  const confirmedCancelled =
    rzpSubscription.status === "cancelled" ||
    rzpSubscription.status === "completed";

  if (!confirmedCancelled) {
    console.log(`[webhook:${event}] Razorpay reports status: ${rzpSubscription.status} — skipping`);
    return;
  }

  const localSub = await Subscription.findOne({ razorpaySubscriptionId: rzpSubId });
  if (!localSub) return;

  // Already cancelled — idempotent.
  if (localSub.status === SUBSCRIPTION_STATUS.CANCELLED) return;

  await Subscription.updateOne(
    { _id: localSub._id },
    {
      $set: {
        status: SUBSCRIPTION_STATUS.CANCELLED,
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    },
  );
  // Access continues until currentPeriodEnd.
  // The expiration cron removes entitlements when the period expires.
}

/**
 * payment.authorized and payment.captured:
 * Update the existing Payment record if it exists; otherwise create it.
 * This handles cases where the webhook fires before the verify endpoint is called.
 */
async function handlePaymentCaptured(payload, event) {
  const razorpay = getRazorpay();
  const rzpPaymentId = payload?.payload?.payment?.entity?.id;
  if (!rzpPaymentId) return;

  // Re-fetch from Razorpay.
  const rzpPayment = await razorpay.payments.fetch(rzpPaymentId);

  const rzpSubId =
    rzpPayment.subscription_id;

  if (!rzpSubId) return;

  const localSub =
    await Subscription.findOne({
      razorpaySubscriptionId:
        rzpSubId,
    });

  if (!localSub) return;

  const newStatus =
    rzpPayment.status === "captured"
      ? PAYMENT_STATUS.CAPTURED
      : PAYMENT_STATUS.AUTHORIZED;

  const now = new Date();

  const paymentSet = {
    status: newStatus,
    lastWebhookEvent: event,
  };

  if (rzpPayment.invoice_id) {
    paymentSet.razorpayInvoiceId =
      rzpPayment.invoice_id;
  }

  // Atomic upsert prevents payment.authorized/payment.captured from racing
  // with subscription.activated/subscription.charged.
  await Payment.updateOne(
    {
      razorpayPaymentId:
        rzpPayment.id,
    },
    {
      $setOnInsert: {
        userId:
          localSub.userId,
        subscriptionId:
          localSub._id,
        firebaseUID:
          localSub.firebaseUID,
        provider:
          PAYMENT_PAYMENT_PROVIDER.RAZORPAY,
        amount:
          rzpPayment.amount,
        currency:
          rzpPayment.currency ??
          "INR",
        razorpayPaymentId:
          rzpPayment.id,
      },
      $set: paymentSet,
    },
    {
      upsert: true,
    },
  );

  if (
    newStatus ===
    PAYMENT_STATUS.CAPTURED
  ) {
    await Payment.updateOne(
      {
        razorpayPaymentId:
          rzpPayment.id,
        $or: [
          { paidAt: null },
          {
            paidAt: {
              $exists: false,
            },
          },
        ],
      },
      {
        $set: {
          paidAt: now,
        },
      },
    );
  }

  // Coupon redemption is only allowed after a captured payment.
  // redeemCoupon is idempotent, so this safely handles either
  // payment.captured or subscription.charged arriving first.
  if (
    newStatus === PAYMENT_STATUS.CAPTURED &&
    localSub.couponId
  ) {
    const localPayment = await Payment.findOne({
      razorpayPaymentId: rzpPayment.id,
    });

    if (!localPayment) {
      throw new Error(
        "Payment record could not be loaded for coupon redemption",
      );
    }

    const redemptionResult = await redeemCoupon({
      subscription: localSub,
      payment: localPayment,
    });

    if (redemptionResult.error) {
      throw new Error(redemptionResult.error);
    }
  }
}

/**
 * payment.failed:
 * Record or update the failed payment. Do not remove entitlements.
 * Access continues until period end; the cron handles expiration.
 */
async function handlePaymentFailed(payload, event) {
  const razorpay = getRazorpay();

  const rzpPaymentId =
    payload?.payload?.payment?.entity?.id;

  if (!rzpPaymentId) return;

  // Re-fetch from Razorpay — never trust webhook payload values.
  const rzpPayment =
    await razorpay.payments.fetch(
      rzpPaymentId,
    );

  const rzpSubId =
    rzpPayment.subscription_id;

  if (!rzpSubId) return;

  const localSub =
    await Subscription.findOne({
      razorpaySubscriptionId:
        rzpSubId,
    });

  if (!localSub) return;

  const failureReason =
    rzpPayment.error_description ??
    "Payment failed";

  // Atomically ensure exactly one Payment ledger row exists.
  // This may race with payment.authorized/payment.captured or
  // subscription.charged, so never use findOne -> create here.
  await Payment.updateOne(
    {
      razorpayPaymentId:
        rzpPayment.id,
    },
    {
      $setOnInsert: {
        userId:
          localSub.userId,

        subscriptionId:
          localSub._id,

        firebaseUID:
          localSub.firebaseUID,

        provider:
          PAYMENT_PAYMENT_PROVIDER.RAZORPAY,

        amount:
          rzpPayment.amount ??
          0,

        currency:
          rzpPayment.currency ??
          "INR",

        status:
          PAYMENT_STATUS.FAILED,

        razorpayPaymentId:
          rzpPayment.id,

        razorpayOrderId:
          rzpPayment.order_id ??
          null,

        razorpayInvoiceId:
          rzpPayment.invoice_id ??
          null,

        failureReason,

        lastWebhookEvent:
          event,
      },
    },
    {
      upsert: true,
    },
  );

  // Update failure state only while the payment has not already reached
  // a successful terminal state. An out-of-order failure webhook must
  // never downgrade CAPTURED or REFUNDED.
  await Payment.updateOne(
    {
      razorpayPaymentId:
        rzpPayment.id,

      status: {
        $nin: [
          PAYMENT_STATUS.CAPTURED,
          PAYMENT_STATUS.REFUNDED,
        ],
      },
    },
    {
      $set: {
        status:
          PAYMENT_STATUS.FAILED,

        failureReason,

        lastWebhookEvent:
          event,
      },
    },
  );
}

/**
 * payment.refunded:
 * Update the existing Payment record with refund data.
 */
async function handlePaymentRefunded(payload, event) {
  const razorpay = getRazorpay();
  const rzpPaymentId = payload?.payload?.payment?.entity?.id;
  if (!rzpPaymentId) return;

  const rzpPayment = await razorpay.payments.fetch(rzpPaymentId);

  const existing = await Payment.findOne({ razorpayPaymentId: rzpPaymentId });
  if (!existing) {
    console.warn(`[webhook:${event}] Received refund for unknown payment: ${rzpPaymentId}`);
    return;
  }

  await Payment.updateOne(
    { _id: existing._id },
    {
      $set: {
        status: PAYMENT_STATUS.REFUNDED,
        refundAmount: rzpPayment.amount_refunded ?? 0,
        refundedAt: new Date(),
        lastWebhookEvent: event,
      },
    },
  );
}

// ─── expireStaleSubscriptions ────────────────────────────────────────────────

/**
 * Cron job: find ACTIVE subscriptions past their period end and
 * confirm with Razorpay before expiring them locally.
 *
 * Never expires based on local date alone — always verify with Razorpay first.
 * This protects against delayed webhooks and clock drift.
 *
 * @returns {Promise<{checked, expired, skipped, errors}>}
 */
export async function expireStaleSubscriptions() {
  await connectToDB();

  const now = new Date();

  // Find ACTIVE subscriptions whose period end has passed.
  const candidates = await Subscription.find({
    status: SUBSCRIPTION_STATUS.ACTIVE,
    currentPeriodEnd: { $lt: now },
  }).lean();

  let expired = 0;
  let skipped = 0;
  let errors = 0;

  const razorpay = getRazorpay();
  for (const sub of candidates) {
    try {
      // ── Verify with Razorpay before expiring ─────────────────────────────
      const rzpSubscription = await razorpay.subscriptions.fetch(
        sub.razorpaySubscriptionId,
      );

      // If Razorpay still says active, skip — webhook may be delayed.
      if (rzpSubscription.status === "active") {
        console.log(
          `[expireCron] Skipping sub ${sub._id} — Razorpay still active`,
        );
        skipped++;
        continue;
      }

      const revokedEntitlements =
        resolveSubscriptionEntitlements(
          sub.plan,
          { revoke: true },
        );

      if (!revokedEntitlements) {
        console.error(
          `[expireCron] Unknown subscription plan: ${sub.plan}`,
        );
        errors++;
        continue;
      }

      // ── Expire locally ────────────────────────────────────────────────────
      await Subscription.updateOne(
        { _id: sub._id },
        { $set: { status: SUBSCRIPTION_STATUS.EXPIRED } },
      );

      // ── Revoke entitlements ────────────────────────────────────────────────
      await UserProfile.updateOne(
        { _id: sub.userId },
        {
          $set: revokedEntitlements,
        },
      );

      console.log(`[expireCron] Expired subscription: ${sub._id} (user: ${sub.firebaseUID})`);
      expired++;
    } catch (err) {
      console.error(
        `[expireCron] Failed to process sub ${sub._id}:`,
        err.message,
      );
      errors++;
    }
  }

  return {
    checked: candidates.length,
    expired,
    skipped,
    errors,
  };
}
