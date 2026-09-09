import connectDB from "./dbConfig/dbConnection.js";

import {
    UserProfile,
} from "./models/v2/user.profile.model.js";

import {
    PREMIUM_FEATURE_BACKFILL_FILTER,
    PREMIUM_FEATURE_BACKFILL_UPDATE,
} from "./lib/premium/premium-entitlement-reconciliation.js";

const applyChanges =
    process.argv.includes("--apply");

await connectDB();

console.log(
    "\n=== Premium feature entitlement reconciliation ===\n",
);

console.log(
    "Target:",
    "existing users with GenAI Premium access but without Behaviour Quiz entitlement",
);

const candidatesBefore =
    await UserProfile.countDocuments(
        PREMIUM_FEATURE_BACKFILL_FILTER,
    );

console.log(
    "\nEligible users:",
    candidatesBefore,
);

if (!applyChanges) {
    console.log(
        "\nDRY RUN ONLY — no UserProfile documents were modified.",
    );

    console.log(
        "Run with --apply only after reviewing this candidate count.",
    );

    console.log(
        "\n=== Dry run complete ===\n",
    );

    process.exit(0);
}

console.log(
    "\n--apply detected. Applying entitlement reconciliation...",
);

const result =
    await UserProfile.updateMany(
        PREMIUM_FEATURE_BACKFILL_FILTER,
        PREMIUM_FEATURE_BACKFILL_UPDATE,
    );

console.log(
    "Matched users:",
    result.matchedCount,
);

console.log(
    "Modified users:",
    result.modifiedCount,
);

const candidatesAfter =
    await UserProfile.countDocuments(
        PREMIUM_FEATURE_BACKFILL_FILTER,
    );

console.log(
    "Eligible users remaining:",
    candidatesAfter,
);

if (candidatesAfter !== 0) {
    throw new Error(
        `Premium entitlement reconciliation incomplete: ${candidatesAfter} eligible users remain`,
    );
}

console.log(
    "\n✅ Premium feature entitlement reconciliation verified",
);

console.log(
    "Only entitlements.features.behaviouralQuiz was backfilled.",
);

console.log(
    "\n=== Migration complete ===\n",
);

process.exit(0);