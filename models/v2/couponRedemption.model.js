import mongoose from "mongoose";

const couponRedemptionSchema = new mongoose.Schema(
    {
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
            index: true,
        },

        // Store the code at redemption time so the audit record
        // remains understandable even if coupon configuration changes.
        couponCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserProfile",
            required: true,
        },

        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true,
        },

        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true,
        },

        redeemedAt: {
            type: Date,
            default: Date.now,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * A user can receive only one promotional coupon benefit
 * across all coupons for their lifetime.
 */
couponRedemptionSchema.index(
    { userId: 1 },
    { unique: true }
);

/**
 * A subscription can only produce one coupon redemption.
 */
couponRedemptionSchema.index(
    { subscriptionId: 1 },
    { unique: true }
);

/**
 * A payment can only be associated with one coupon redemption.
 */
couponRedemptionSchema.index(
    { paymentId: 1 },
    { unique: true }
);

export default mongoose.models.CouponRedemption ||
    mongoose.model("CouponRedemption", couponRedemptionSchema);
