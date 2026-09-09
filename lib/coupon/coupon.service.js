// lib/coupon/coupon.service.js
//
// Coupon validation service.
// Server-only business logic for Ignitio promotional coupons.
//
// Responsibilities:
//   validateCoupon â€” validate a coupon for a user + subscription plan.
//
// Security:
//   â€¢ Never trust client-supplied user IDs.
//   â€¢ Coupon eligibility is determined server-side.
//   â€¢ Razorpay offer_id comes from the trusted Coupon document.
//   â€¢ A redemption is NOT created during validation.
//

import mongoose from "mongoose";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import Coupon from "@/models/v2/coupon.model";
import CouponRedemption from "@/models/v2/couponRedemption.model";

/**
 * Normalize a coupon code before querying MongoDB.
 *
 * @param {unknown} code
 * @returns {string}
 */
function normalizeCouponCode(code) {
    return typeof code === "string"
        ? code.trim().toUpperCase()
        : "";
}

/**
 * Validate whether a user can use a coupon for a particular plan.
 *
 * This function ONLY validates eligibility.
 * It does not create a redemption.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @param {string} params.couponCode
 * @param {string} params.plan
 *
 * @returns {Promise<
 *   | {
 *       valid: true,
 *       coupon: object
 *     }
 *   | {
 *       valid: false,
 *       error: string,
 *       status: number
 *     }
 * >}
 */
export async function validateCoupon({
    firebaseUID,
    couponCode,
    plan,
}) {
    await connectToDB();

    const normalizedCode = normalizeCouponCode(couponCode);

    if (!normalizedCode) {
        return {
            valid: false,
            error: "Coupon code is required",
            status: 400,
        };
    }

    if (!firebaseUID) {
        return {
            valid: false,
            error: "Invalid user",
            status: 401,
        };
    }

    if (!plan) {
        return {
            valid: false,
            error: "Subscription plan is required",
            status: 400,
        };
    }

    // â”€â”€ Resolve authenticated user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const user = await UserProfile.findOne({ firebaseUID }).select("_id").lean();

    if (!user) {
        return {
            valid: false,
            error: "User profile not found",
            status: 404,
        };
    }

    // â”€â”€ Find coupon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const coupon = await Coupon.findOne({
        code: normalizedCode,
    }).lean();

    if (!coupon) {
        return {
            valid: false,
            error: "Invalid coupon code",
            status: 404,
        };
    }

    // â”€â”€ Active check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!coupon.active) {
        return {
            valid: false,
            error: "This coupon is no longer active",
            status: 400,
        };
    }

    // â”€â”€ Expiration check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) {
        return {
            valid: false,
            error: "This coupon has expired",
            status: 400,
        };
    }

    // â”€â”€ Plan applicability check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!coupon.applicablePlans.includes(plan)) {
        return {
            valid: false,
            error: "This coupon is not valid for the selected plan",
            status: 400,
        };
    }

    // â”€â”€ User redemption check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // A successful coupon redemption is permanent promotional history.
    // Cancelling a subscription must not allow the same coupon to be reused.
    const existingRedemption = await CouponRedemption.exists({
        userId: user._id,
    });

    if (existingRedemption) {
        return {
            valid: false,
            error: "You have already used this coupon",
            status: 409,
        };
    }

    // â”€â”€ Maximum redemption check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (coupon.maxRedemptions !== null) {
        const redemptionCount = await CouponRedemption.countDocuments({
            couponId: coupon._id,
        });

        if (redemptionCount >= coupon.maxRedemptions) {
            return {
                valid: false,
                error: "This coupon has reached its usage limit",
                status: 400,
            };
        }
    }

    // â”€â”€ Valid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return {
        valid: true,
        coupon: {
            _id: coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            razorpayOfferId: coupon.razorpayOfferId,
            applicablePlans: coupon.applicablePlans,
        },
    };
}

/**
 * Record a successful coupon redemption.
 *
 * This function is intentionally separate from coupon validation.
 * A coupon is redeemed only after a successful payment has been
 * verified/reconciled.
 *
 * The operation is idempotent:
 * - duplicate processing of the same subscription/payment does not
 *   create another redemption.
 * - the database unique indexes are the final duplicate protection.
 *
 * @param {object} params
 * @param {object} params.subscription - Local Subscription document.
 * @param {object} params.payment - Local Payment document.
 * @param {object|null} params.session - Optional MongoDB transaction session.
 *
 * @returns {Promise<{
 *   redeemed: boolean,
 *   alreadyRedeemed?: boolean,
 *   skipped?: boolean,
 *   error?: string
 * }>}
 */
export async function redeemCoupon({
    subscription,
    payment,
    session = null,
}) {
    if (!subscription?.couponId) {
        return { redeemed: false, skipped: true };
    }

    if (!payment?._id) {
        return {
            redeemed: false,
            error: "Payment record is required for coupon redemption",
        };
    }

    if (!subscription?._id || !subscription?.userId) {
        return {
            redeemed: false,
            error: "Subscription record is required for coupon redemption",
        };
    }

    const redeem = async (activeSession) => {
        const options = activeSession
            ? { session: activeSession }
            : {};

        const coupon = await Coupon.findById(
            subscription.couponId,
            null,
            options,
        );

        if (!coupon) {
            return {
                redeemed: false,
                error: "Coupon record not found",
            };
        }

        // Lifetime promotional benefit:
        // the unique userId index on CouponRedemption is the final
        // concurrency-safe guard across all coupon codes.
        const existingRedemption =
            await CouponRedemption.findOne(
                {
                    userId: subscription.userId,
                },
                null,
                options,
            );

        if (existingRedemption) {
            if (
                existingRedemption.subscriptionId?.equals(
                    subscription._id,
                ) ||
                existingRedemption.paymentId?.equals(
                    payment._id,
                )
            ) {
                return {
                    redeemed: false,
                    alreadyRedeemed: true,
                };
            }

            return {
                redeemed: false,
                error:
                    "User has already received a promotional coupon benefit",
            };
        }

        // Atomically reserve one redemption slot.
        // When maxRedemptions is null, there is no upper limit.
        const couponFilter = {
            _id: coupon._id,
        };

        if (coupon.maxRedemptions !== null) {
            couponFilter.redemptionCount = {
                $lt: coupon.maxRedemptions,
            };
        }

        const updatedCoupon =
            await Coupon.findOneAndUpdate(
                couponFilter,
                {
                    $inc: {
                        redemptionCount: 1,
                    },
                },
                {
                    new: true,
                    ...options,
                },
            );

        if (!updatedCoupon) {
            return {
                redeemed: false,
                error:
                    "This coupon has reached its usage limit",
            };
        }

        try {
            const redemption =
                await CouponRedemption.create(
                    [
                        {
                            couponId: coupon._id,
                            couponCode:
                                subscription.couponCode,
                            userId:
                                subscription.userId,
                            subscriptionId:
                                subscription._id,
                            paymentId:
                                payment._id,
                            redeemedAt: new Date(),
                        },
                    ],
                    options,
                );

            return {
                redeemed: true,
                redemption: redemption[0],
            };
        } catch (err) {
            // Unique indexes make the redemption idempotent even when
            // multiple Razorpay events race for the same payment/user.
            if (err?.code === 11000) {
                throw err;
            }

            throw err;
        }
    };

    // verifyPayment() already supplies a transaction session.
    // Webhook redemption can create its own transaction so the coupon
    // counter and redemption audit record commit or roll back together.
    if (session) {
        return redeem(session);
    }

    const ownSession = await mongoose.startSession();

    try {
        let result;

        await ownSession.withTransaction(async () => {
            result = await redeem(ownSession);
        });

        return result;
    } catch (err) {
        if (err?.code === 11000) {
            const existingRedemption =
                await CouponRedemption.findOne({
                    userId: subscription.userId,
                });

            if (existingRedemption) {
                if (
                    existingRedemption.subscriptionId?.equals(
                        subscription._id,
                    ) ||
                    existingRedemption.paymentId?.equals(
                        payment._id,
                    )
                ) {
                    return {
                        redeemed: false,
                        alreadyRedeemed: true,
                    };
                }

                return {
                    redeemed: false,
                    error:
                        "User has already received a promotional coupon benefit",
                };
            }
        }

        console.error(
            "[redeemCoupon] Failed to record coupon redemption:",
            err.message,
        );

        return {
            redeemed: false,
            error: "Failed to record coupon redemption",
        };
    } finally {
        await ownSession.endSession();
    }
}
