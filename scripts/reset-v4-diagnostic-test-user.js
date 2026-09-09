import connectToDB from "../dbConfig/dbConnection.js";
import {
    UserProfile,
    ONBOARDING_VERSIONS,
} from "../models/v2/user.profile.model.js";

const firebaseUID =
    process.env.TEST_FIREBASE_UID;

if (!firebaseUID) {
    throw new Error(
        "TEST_FIREBASE_UID is required",
    );
}

async function resetTestUser() {
    await connectToDB();

    const result =
        await UserProfile.updateOne(
            {
                firebaseUID,
            },
            {
                $set: {
                    onboardingComplete: false,
                    onboardingVersion:
                        ONBOARDING_VERSIONS.V4,
                    onboardingState: {
                        step: "diagnostic",
                    },
                    role: "developer",
                    schedulePreference: {
                        timezone: "Asia/Kolkata",
                        windows: [
                            {
                                period: "MORNING",
                                startTime: "08:00",
                                endTime: "09:00",
                            },
                        ],
                        isDefault: false,
                    },
                },
                $unset: {
                    completedAt: "",
                    roadmapPersonalizationRef: "",
                    roadmap_name: "",
                },
            },
        );

    if (result.matchedCount === 0) {
        throw new Error(
            `No UserProfile found for ${firebaseUID}`,
        );
    }

    const profile =
        await UserProfile.findOne({
            firebaseUID,
        })
            .select(
                "firebaseUID onboardingComplete onboardingVersion onboardingState role schedulePreference",
            )
            .lean();

    console.log(
        "V4 diagnostic test profile prepared:",
        profile,
    );

    process.exit(0);
}

resetTestUser().catch((error) => {
    console.error(
        "Failed to reset test user:",
        error,
    );

    process.exit(1);
});