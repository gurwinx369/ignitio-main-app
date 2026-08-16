/**
 * Immutable payment ledger.
 *
 * One document is created for every payment attempt.
 * Payment records are append-only and serve as the source of truth
 * for billing history and reconciliation.
 *
 * Used for:
 * - Payment history
 * - Webhook reconciliation
 * - Duplicate payment protection
 * - Refund tracking
 * - Billing analytics
 */

import mongoose, { Schema } from "mongoose";

export const PAYMENT_STATUS = {
  CREATED: "created",
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_PROVIDER = {
  RAZORPAY: "razorpay",
};

const PaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },

    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
      required: true,
      index: true,
    },

    // Razorpay identifiers

    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
      unique: true,
      sparse: true,
    },

    razorpayInvoiceId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    // Billing period covered by this payment

    billingPeriodStart: {
      type: Date,
      default: null,
    },

    billingPeriodEnd: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    failureReason: {
      type: String,
      default: null,
      trim: true,
    },

    // Last webhook event that updated this payment

    lastWebhookEvent: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

PaymentSchema.index({
  subscriptionId: 1,
  createdAt: -1,
});

PaymentSchema.index({
  provider: 1,
  razorpayOrderId: 1,
});

PaymentSchema.index({
  provider: 1,
  razorpayPaymentId: 1,
});

export const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);