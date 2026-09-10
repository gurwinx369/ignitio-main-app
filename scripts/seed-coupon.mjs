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
 * - DNS is explicitly configured for this one-off operational seeder so that
 *   MongoDB Atlas SRV resolution does not depend on the local DNS resolver.
 */

import "dotenv/config";
import dns from "node:dns";
import Coupon from "../models/v2/coupon.model.js";

// -----------------------------------------------------------------------------
// DNS configuration
// -----------------------------------------------------------------------------
// Configure DNS before dynamically importing the DB connection module.
// This avoids Node's default DNS resolver path when resolving MongoDB SRV
// records on the local machine.

dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
]);

const { default: connectDB } =
    await import("../dbConfig/dbConnection.js");

// -----------------------------------------------------------------------------
// Coupon configuration
// -----------------------------------------------------------------------------

const COUPON = {
    code: "NEW100",
    discountType: "percentage",
    discountValue: 99,
    razorpayOfferId: "offer_TZtanaLOzQMDZz",
    applicablePlans: [
        "ignitio_weekly",
        "ignitio_monthly",
        "ignitio_three_monthly",
    ],
    active: true,
    expiresAt: new Date("2026-09-30T18:29:59.999Z"),
    maxRedemptions: null,
};

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

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
            "maxRedemptions must be null or a positive number.",
        );
    }

    if (
        COUPON.discountType === "percentage" &&
        (COUPON.discountValue <= 0 || COUPON.discountValue > 100)
    ) {
        throw new Error(
            "Percentage discountValue must be greater than 0 and at most 100.",
        );
    }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
    validateConfig();

    console.log("=".repeat(60));
    console.log("Ignitio - Coupon Seed");
    console.log("=".repeat(60));
    console.log(`Code              : ${COUPON.code}`);
    console.log(`Discount          : ${COUPON.discountValue}%`);
    console.log(`Razorpay Offer ID : ${COUPON.razorpayOfferId}`);
    console.log(
        `Expires           : ${COUPON.expiresAt.toISOString()}`,
    );
    console.log(
        `Max Redemptions   : ${COUPON.maxRedemptions ?? "Unlimited"}`,
    );
    console.log("=".repeat(60));

    // -------------------------------------------------------------------------
    // Verify MongoDB SRV DNS resolution using the explicitly configured DNS.
    // -------------------------------------------------------------------------

    console.log("\n[1/3] Resolving MongoDB Atlas SRV record...");

    try {
        const records = await dns.promises.resolveSrv(
            "_mongodb._tcp.ms1.8yg1qln.mongodb.net",
        );

        if (!records.length) {
            throw new Error("No MongoDB SRV records returned.");
        }

        console.log("      MongoDB SRV resolution successful.");
        console.dir(records, { depth: null });
    } catch (error) {
        throw new Error(
            `MongoDB SRV DNS resolution failed: ${error.message}`,
        );
    }

    // -------------------------------------------------------------------------
    // Connect to MongoDB.
    // -------------------------------------------------------------------------

    console.log("\n[2/3] Connecting to MongoDB...");

    await connectDB();

    console.log("      MongoDB connection successful.");

    // -------------------------------------------------------------------------
    // Upsert coupon.
    // -------------------------------------------------------------------------

    console.log("\n[3/3] Upserting coupon...");

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
        },
    ).lean();

    console.log("\n── Result ─────────────────────────────────────────────");
    console.dir(coupon, { depth: null });
    console.log("───────────────────────────────────────────────────────");

    console.log("\n✓ Coupon seeded successfully.");
    console.log("=".repeat(60));
}

// -----------------------------------------------------------------------------
// Execute
// -----------------------------------------------------------------------------

try {
    await main();
} catch (error) {
    console.error("\n✗ Coupon seed failed:");
    console.error(error.message);
    process.exitCode = 1;
}