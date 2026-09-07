import "dotenv/config";
import connectDB from "../dbConfig/dbConnection.js";
import Coupon from "../models/v2/coupon.model.js";

/**
 * seed-coupon.mjs
 *
 * Reusable MongoDB coupon upsert script.
 *
 * Edit COUPON below for the coupon you want to create/update, then run:
 *   node scripts/seed-coupon.mjs
 *
 * Notes:
 * - maxRedemptions: null means no Ignitio-side redemption cap.
 * - Razorpay remains authoritative for the actual discount.
 * - Running this script again with the same code updates the existing coupon.
 */

const COUPON = {
    code: "HARRY20",
    discountType: "percentage",
    discountValue: 20,
    razorpayOfferId: "offer_TZEaHYIod3cvP5",
    applicablePlans: [
        "ignitio_weekly",
        "ignitio_monthly",
        "ignitio_three_monthly",
    ],
    active: true,
    expiresAt: new Date("2026-09-08T18:29:59.999Z"),
    maxRedemptions: null,
};

function validateConfig() {
    if (!COUPON.code?.trim()) {
        throw new Error("Coupon code is required.");
    }

    if (!COUPON.razorpayOfferId?.trim()) {
        throw new Error("Razorpay offer ID is required.");
    }

    if (
        !Array.isArray(COUPON.applicablePlans) ||
        COUPON.applicablePlans.length === 0
    ) {
        throw new Error("At least one applicable plan is required.");
    }

    if (
        !(COUPON.expiresAt instanceof Date) ||
        Number.isNaN(COUPON.expiresAt.getTime())
    ) {
        throw new Error("expiresAt must be a valid Date.");
    }

    if (
        COUPON.maxRedemptions !== null &&
        COUPON.maxRedemptions < 1
    ) {
        throw new Error(
            "maxRedemptions must be null or a positive number."
        );
    }
}

async function main() {
    validateConfig();

    await connectDB();

    const code = COUPON.code.trim().toUpperCase();

    const coupon = await Coupon.findOneAndUpdate(
        { code },
        {
            $set: {
                ...COUPON,
                code,
            },
            $setOnInsert: {
                redemptionCount: 0,
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    ).lean();

    console.log("=".repeat(60));
    console.log("Ignitio - Coupon Seed");
    console.log("=".repeat(60));
    console.dir(coupon, { depth: null });
    console.log("=".repeat(60));
    console.log("Coupon seeded successfully.");
}

try {
    await main();
} catch (error) {
    console.error("Coupon seed failed:", error.message);
    process.exitCode = 1;
}
