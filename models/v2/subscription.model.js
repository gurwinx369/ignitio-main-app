/**
 * Stores the user's current premium subscription state.
 *
 * Exactly one subscription document exists per user.
 * Payment history is stored separately in PaymentModel.
 *
 * Used for:
 * - Billing lifecycle
 * - Razorpay subscription management
 * - Renewals
 * - Cancellation
 * - Expiration
 *
 * Feature entitlements are stored on UserProfile.
 */

import mongoose, { Schema } from "mongoose";

export const SUBSCRIPTION_STATUS = {
  CREATED: "created",
  PAYMENT_PENDING: "payment_pending",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

export const SUBSCRIPTION_PLAN = {
  IGNITIO_PREMIUM: "ignitio_premium",
};

export const PAYMENT_PROVIDER = {
  RAZORPAY: "razorpay",
};

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      unique: true,
      index: true,
    },

    firebaseUID: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDER),
      required: true,
    },

    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLAN),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.CREATED,
      index: true,
    },

    // Razorpay identifiers

    razorpaySubscriptionId: {
      type: String,
      default: null,
      trim: true,
    },

    razorpayCustomerId: {
      type: String,
      default: null,
      trim: true,
    },

    razorpayPlanId: {
      type: String,
      default: null,
      trim: true,
    },

    // Billing lifecycle

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
      index: true,
    },

    nextBillingAt: {
      type: Date,
      default: null,
    },

    trialEndsAt: {
      type: Date,
      default: null,
    },

    lastPaymentAt: {
      type: Date,
      default: null,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

SubscriptionSchema.index({
  status: 1,
  currentPeriodEnd: 1,
});

SubscriptionSchema.index({
  provider: 1,
  razorpaySubscriptionId: 1,
});

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);