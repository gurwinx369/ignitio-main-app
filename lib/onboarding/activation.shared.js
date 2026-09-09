import {
    getLocalDateString,
    hasStreakHistory,
} from "../users/streak.service.js";

import {
    validateSchedulePreference,
} from "./activation.validation.js";

export function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

export function reconstructDiagnostics(
    responses,
    entryPoint,
) {
    const diagnostics = {};

    diagnostics.q1 = {
        value: entryPoint,
        passed: true,
        partial: false,
        skipped: false,
    };

    const mapByQId = new Map();

    for (const r of responses) {
        if (r.questionId) {
            mapByQId.set(
                String(r.questionId)
                    .trim()
                    .toLowerCase(),
                r,
            );
        }
    }

    const targetIds = [
        "q2",
        "q2b",
        "q3",
        "q3b",
        "q4",
        "q5",
        "q6",
        "q7",
        "q7b",
        "q8",
    ];

    for (const qId of targetIds) {
        const res = mapByQId.get(qId);

        if (!res) {
            throw new Error(
                `Missing required diagnostic result for: ${qId}`,
            );
        }

        diagnostics[qId] = {
            passed: res.passed ?? false,
            partial:
                res.gradingMeta?.partial ?? false,
            skipped: res.skipped ?? false,
            notAssessed:
                res.notAssessed ?? false,
            value: res.answerGiven,
        };
    }

    return diagnostics;
}

export function mapGoalToMotivation(goal) {
    const map = {
        internship_1_3_months:
            "land_internship",
        build_product: "build_product",
        curiosity_general: "curiosity",
    };

    return map[goal];
}

export function mapScheduleWindows(
    windows,
) {
    return windows.map((w) => ({
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startMinute: timeToMinutes(
            w.startTime,
        ),
        endMinute: timeToMinutes(
            w.endTime,
        ),
    }));
}

export function serializeDiagnosticRawAnswer(
    value,
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (
        Array.isArray(value) ||
        typeof value === "object"
    ) {
        return JSON.stringify(value);
    }

    return String(value);
}

export function validateSharedPrerequisites(
    user,
) {
    if (!user.role) {
        return {
            ok: false,
            status: 422,
            error: "User role is required",
        };
    }

    const schedulePref =
        user.schedulePreference;

    const scheduleValidation =
        validateSchedulePreference(
            schedulePref,
        );

    if (!scheduleValidation.valid) {
        return {
            ok: false,
            status: 422,
            error: scheduleValidation.error,
        };
    }

    return {
        ok: true,
    };
}

export function buildStreakSet(
    user,
    timezone,
) {
    const set = {};
    const streak =
        user.streak || {};

    const hasHistory =
        hasStreakHistory(streak);

    if (
        !streak.timezone ||
        !hasHistory
    ) {
        set["streak.timezone"] =
            timezone;
    }

    const effectiveStreakTimezone =
        hasHistory &&
            streak.timezone
            ? streak.timezone
            : timezone;

    if (
        !streak.onboardingStartDate ||
        !hasHistory
    ) {
        set[
            "streak.onboardingStartDate"
        ] = getLocalDateString(
            new Date(),
            effectiveStreakTimezone,
        );
    }

    return set;
}