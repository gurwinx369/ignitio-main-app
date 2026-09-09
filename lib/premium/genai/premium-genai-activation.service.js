import { UserProfile } from "../../../models/v2/user.profile.model.js";
import { RoadmapTemplate } from "../../../models/v2/roadmap.templates.model.js";
import { RoadmapPersonalization } from "../../../models/v2/roadmap.personalized.model.js";
import { RoadmapProgress } from "../../../models/v2/roadmap.progress.model.js";

import {
    buildRouting,
    compileRoadmap,
} from "../../onboarding/roadmapCompiler.js";

import {
    reconstructDiagnostics,
    mapGoalToMotivation,
    mapScheduleWindows,
    serializeDiagnosticRawAnswer,
    validateSharedPrerequisites,
    buildStreakSet,
} from "../../onboarding/activation.shared.js";

function isGenAiActivationHealthy(
    user,
    activePersonalization,
    activeProgress,
) {
    if (
        !user.onboardingComplete ||
        user.onboardingState?.step !==
        "completed"
    ) {
        return false;
    }

    if (
        !activePersonalization ||
        !activeProgress
    ) {
        return false;
    }

    if (
        !user.roadmapPersonalizationRef
    ) {
        return false;
    }

    const refMatch =
        user.roadmapPersonalizationRef?.toString() ===
        activePersonalization?._id?.toString();

    if (!refMatch) {
        return false;
    }

    if (
        !user.streak?.timezone ||
        !user.streak
            ?.onboardingStartDate
    ) {
        return false;
    }

    return true;
}

export async function activateGenAiRoadmap(
    user,
    onboardingResponse,
    roadmapSlug,
) {
    const prereq =
        validateSharedPrerequisites(
            user,
        );

    if (!prereq.ok) {
        return {
            status: prereq.status,
            success: false,
            error: prereq.error,
        };
    }

    const schedulePref =
        user.schedulePreference;

    const goal =
        onboardingResponse
            .primaryGoalSnapshot;

    if (!goal) {
        return {
            status: 422,
            success: false,
            error:
                "Primary goal is required",
        };
    }

    const motivation =
        mapGoalToMotivation(goal);

    if (!motivation) {
        return {
            status: 422,
            success: false,
            error:
                "Invalid goal mapping",
        };
    }

    const template =
        await RoadmapTemplate.findBySlug(
            roadmapSlug,
        );

    if (!template) {
        return {
            status: 500,
            success: false,
            error:
                `Roadmap template '${roadmapSlug}' not found`,
        };
    }

    let diagnostics;

    try {
        diagnostics =
            reconstructDiagnostics(
                onboardingResponse.responses,
                onboardingResponse.entryPoint,
            );
    } catch (err) {
        return {
            status: 422,
            success: false,
            error: err.message,
        };
    }

    const routing =
        buildRouting(diagnostics);

    const compiled =
        compileRoadmap(
            template,
            routing,
        );

    const {
        includedDayIds,
        optionalDayIds,
        skippedDayIds,
        totalLevels,
    } = compiled;

    const now = new Date();

    const diagnosticsArray =
        Object.entries(
            diagnostics,
        ).map(([qId, d]) => ({
            questionId:
                qId.toUpperCase(),
            passed: d.passed,
            rawAnswer:
                serializeDiagnosticRawAnswer(
                    d.value,
                ),
            routedAction:
                qId === "q1" ||
                    d.notAssessed ||
                    d.skipped
                    ? "keep"
                    : d.passed
                        ? "skip_week"
                        : d.partial
                            ? "optional"
                            : "keep",
            answeredAt: now,
        }));

    const mappedWindows =
        mapScheduleWindows(
            schedulePref.windows,
        );

    let createdPersonalizationId =
        null;

    let createdProgressId =
        null;

    let finalPersonalizationId =
        null;

    let finalProgressId =
        null;

    try {
        const existingPersonalizations =
            await RoadmapPersonalization.find(
                {
                    firebaseUID:
                        user.firebaseUID,
                    roadmapSlug,
                    isActive: true,
                },
            );

        if (
            existingPersonalizations.length >
            1
        ) {
            const err =
                new Error(
                    "Multiple active personalizations found. Conflict.",
                );

            err.status = 422;

            throw err;
        }

        let personalizationDoc =
            existingPersonalizations[0];

        if (!personalizationDoc) {
            try {
                personalizationDoc =
                    await RoadmapPersonalization.create(
                        {
                            userId: user._id,
                            firebaseUID:
                                user.firebaseUID,
                            roadmapSlug,
                            includedDayIds,
                            optionalDayIds,
                            skippedDayIds,
                            totalLevels,
                            schedule: {
                                timezone:
                                    schedulePref.timezone,
                                freeWindows:
                                    mappedWindows,
                                isDefault: false,
                            },
                            motivation,
                            diagnostics:
                                diagnosticsArray,
                            templateSnapshotAt:
                                template.updatedAt ||
                                new Date(),
                            isActive: true,
                            version: 1,
                        },
                    );

                createdPersonalizationId =
                    personalizationDoc._id;
            } catch (err) {
                if (err.code === 11000) {
                    personalizationDoc =
                        await RoadmapPersonalization.findOne(
                            {
                                firebaseUID:
                                    user.firebaseUID,
                                roadmapSlug,
                                isActive: true,
                            },
                        );
                } else {
                    throw err;
                }
            }
        }

        finalPersonalizationId =
            personalizationDoc._id;

        const existingProgressDocs =
            await RoadmapProgress.find({
                firebaseUID:
                    user.firebaseUID,
                roadmapSlug,
            });

        if (
            existingProgressDocs.length >
            1
        ) {
            const err =
                new Error(
                    "Multiple roadmap progress documents found. Conflict.",
                );

            err.status = 422;

            throw err;
        }

        let progressDoc =
            existingProgressDocs[0];

        if (!progressDoc) {
            try {
                progressDoc =
                    await RoadmapProgress.create(
                        {
                            userId: user._id,
                            firebaseUID:
                                user.firebaseUID,
                            roadmapSlug,
                            roadmapTitle:
                                template.title,
                            role: user.role,
                            status:
                                "not_started",
                            completedLevels: [],
                            totalLevels,
                            completedDays: [],
                            passedAssignments: [],
                            startedAt: null,
                            completedAt: null,
                            lastLearningActiveAt:
                                null,
                        },
                    );

                createdProgressId =
                    progressDoc._id;
            } catch (err) {
                if (err.code === 11000) {
                    progressDoc =
                        await RoadmapProgress.findOne(
                            {
                                firebaseUID:
                                    user.firebaseUID,
                                roadmapSlug,
                            },
                        );
                } else {
                    throw err;
                }
            }
        }

        finalProgressId =
            progressDoc._id;

        if (
            !finalPersonalizationId ||
            !finalProgressId
        ) {
            throw new Error(
                "Failed to secure active personalization and progress documents.",
            );
        }

        const updatePayload = {
            $set: {
                roadmapPersonalizationRef:
                    finalPersonalizationId,
                roadmap_name:
                    template.title,
                onboardingComplete: true,
                "onboardingState.step":
                    "completed",
                completedAt: new Date(),
                ...buildStreakSet(
                    user,
                    schedulePref.timezone,
                ),
            },
        };

        const updateResult =
            await UserProfile.updateOne(
                {
                    _id: user._id,
                    "onboardingState.step": {
                        $in: [
                            "activation_pending",
                            "completed",
                        ],
                    },
                    "entitlements.roadmaps.genAi":
                        true,
                },
                updatePayload,
                {
                    timestamps: false,
                },
            );

        if (
            updateResult.modifiedCount ===
            0 &&
            updateResult.matchedCount ===
            0
        ) {
            const error =
                new Error(
                    "User entitlement or onboarding state changed during Premium activation",
                );

            error.status = 409;

            throw error;
        }

        return {
            status: 200,
            success: true,
            nextStep: "completed",
            alreadyActivated: false,
        };
    } catch (err) {
        console.error(
            "[activateGenAiRoadmap] Activation failed. Rolling back created artifacts...",
            err.message,
        );

        if (
            createdPersonalizationId
        ) {
            await RoadmapPersonalization.deleteOne(
                {
                    _id:
                        createdPersonalizationId,
                },
            ).catch((deleteError) =>
                console.error(
                    "Rollback failed for Personalization:",
                    deleteError.message,
                ),
            );
        }

        if (createdProgressId) {
            await RoadmapProgress.deleteOne(
                {
                    _id:
                        createdProgressId,
                },
            ).catch((deleteError) =>
                console.error(
                    "Rollback failed for Progress:",
                    deleteError.message,
                ),
            );
        }

        const isSafeClientError =
            err.status === 409 ||
            err.status === 422;

        return {
            status:
                err.status || 500,
            success: false,
            error: isSafeClientError
                ? err.message
                : "Activation failed safely",
        };
    }
}

export async function reconcileCompletedGenAi(
    user,
    roadmapSlug,
) {
    const prereq =
        validateSharedPrerequisites(
            user,
        );

    if (!prereq.ok) {
        return {
            status: prereq.status,
            success: false,
            error: prereq.error,
        };
    }

    const personalizations =
        await RoadmapPersonalization.find(
            {
                firebaseUID:
                    user.firebaseUID,
                roadmapSlug,
                isActive: true,
            },
        );

    const progressDocs =
        await RoadmapProgress.find({
            firebaseUID:
                user.firebaseUID,
            roadmapSlug,
        });

    if (
        personalizations.length > 1
    ) {
        return {
            status: 422,
            success: false,
            error:
                "Multiple active personalizations found. Conflict.",
        };
    }

    if (
        progressDocs.length > 1
    ) {
        return {
            status: 422,
            success: false,
            error:
                "Multiple roadmap progress documents found. Conflict.",
        };
    }

    const activePersonalization =
        personalizations[0];

    const activeProgress =
        progressDocs[0];

    const refMatch =
        user.roadmapPersonalizationRef?.toString() ===
        activePersonalization?._id?.toString();

    if (
        activePersonalization &&
        user.roadmapPersonalizationRef &&
        !refMatch
    ) {
        return {
            status: 422,
            success: false,
            error:
                "Profile personalization ref conflicts with active personalization",
        };
    }

    if (
        isGenAiActivationHealthy(
            user,
            activePersonalization,
            activeProgress,
        )
    ) {
        return {
            status: 200,
            success: true,
            nextStep: "completed",
            alreadyActivated: true,
        };
    }

    return null;
}