import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        // Public coupon code entered by the user.
        // Always stored normalized/uppercase.
        code: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            uppercase: true,
        },

        // Used for displaying/calculating the expected discount in Ignitio UI.
        // Razorpay's offer remains the authoritative discount mechanism.
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        // Razorpay Subscription Offer associated with this coupon.
        razorpayOfferId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        // Plans on which this coupon can be used.
        applicablePlans: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            required: true,
            validate: {
                validator: (plans) => plans.length > 0,
                message: "At least one applicable plan is required",
            },
        },

        // Whether the coupon can currently be used.
        active: {
            type: Boolean,
            default: true,
            index: true,
        },

        // Optional expiration date.
        expiresAt: {
            type: Date,
            default: null,
            index: true,
        },

        // null = unlimited redemptions.
        maxRedemptions: {
            type: Number,
            default: null,
            min: 1,
        },

        // Number of successful redemptions recorded for this coupon.
        // Updated only when a successful payment is redeemed.
        redemptionCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

couponSchema.index({ active: 1, expiresAt: 1 });

export default mongoose.models.Coupon ||
    mongoose.model("Coupon", couponSchema);
