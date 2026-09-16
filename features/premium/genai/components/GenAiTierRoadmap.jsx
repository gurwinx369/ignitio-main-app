"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Home,
    RotateCw,
} from "lucide-react";

import Loader from "@/layout/Loader";
import { useAuth } from "@/features/context/AuthContext";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import { useCalibrationStatus } from "@/features/premium/calibration/useCalibrationStatus";
import { usePremiumUpgrade } from "@/features/premium/upgrade/usePremiumUpgrade";
import RoadmapTemplate from "@/components/roadmap/RoadmapTemplate";
import { filterGenAiWeeks } from "@/features/premium/genai/lib/genAiWeekHelper";

function VerificationError({
    message,
    onRetry,
    onHome,
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf3] p-4 text-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">
                    Unable to Verify Access
                </h2>

                <p className="mb-6 text-slate-600">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                        <RotateCw
                            size={18}
                            aria-hidden="true"
                        />
                        Retry Connection
                    </button>

                    <button
                        type="button"
                        onClick={onHome}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <Home
                            size={18}
                            aria-hidden="true"
                        />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

function GenAiRouteLoader() {
    return (
        <div
            className={[
                /*
                 * This overlay belongs to the GenAI route only.
                 *
                 * KylePet is mounted globally by /home/layout,
                 * so simply returning <Loader /> cannot unmount
                 * or hide Kyle.
                 *
                 * z-[5000] intentionally sits above normal
                 * dashboard/Kyle UI while still leaving room
                 * for critical global modal layers.
                 */
                "fixed inset-0 z-[5000]",
                "flex min-h-screen",
                "items-center justify-center",
                "overflow-hidden",
                "bg-[#FFF8EF]",
            ].join(" ")}
            role="status"
            aria-live="polite"
            aria-label="Preparing GenAI roadmap"
        >
            <Loader />
        </div>
    );
}

export default function GenAiTierRoadmap({
    tierKey,
    minWeek,
    maxWeek
}) {
    const router = useRouter();
    const { user } = useAuth();
    const [runtimeData, setRuntimeData] = useState(null);
    const [runtimeError, setRuntimeError] = useState(false);
    const [scheduleState, setScheduleState] =
        useState({
            status: "idle",
            checkedUid: null,
            error: null,
        });

    const [
        scheduleRetryKey,
        setScheduleRetryKey,
    ] = useState(0);

    // ponytail: one-shot auto-retry for race-condition conflicts on first load
    const conflictRetried = useRef(false);

    const {
        status,
        hasGenAiAccess,
        retry,
    } = usePremiumAccess();

    const calibrationEnabled =
        status === "premium" &&
        hasGenAiAccess === true;

    const calibration =
        useCalibrationStatus({
            enabled: calibrationEnabled,
        });

    const scheduleReady =
        scheduleState.status === "ready" &&
        scheduleState.checkedUid ===
        user?.uid;

    const upgradeEnabled =
        calibrationEnabled &&
        calibration.status === "ready" &&
        scheduleReady;

    const upgrade =
        usePremiumUpgrade({
            enabled: upgradeEnabled,
        });

    useEffect(() => {
        if (status === "foundation") {
            router.replace(
                "/home/premium/genai/paywall",
            );
        }
    }, [status, router]);

    useEffect(() => {
        if (
            status === "premium" &&
            hasGenAiAccess === true &&
            calibration.status ===
            "required"
        ) {
            router.replace(
                "/home/premium/genai/calibration",
            );
        }
    }, [
        status,
        hasGenAiAccess,
        calibration.status,
        router,
    ]);

    useEffect(() => {
        if (
            status !== "premium" ||
            hasGenAiAccess !== true ||
            calibration.status !== "ready" ||
            !user
        ) {
            return;
        }

        const controller = new AbortController();
        let isActive = true;

        const checkSchedule = async () => {
            if (isActive) {
                setScheduleState({
                    status: "loading",
                    checkedUid: user.uid,
                    error: null,
                });
            }

            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/v2/user", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error("Failed to verify schedule");
                }

                const data = await res.json();
                const windows = data?.user?.schedulePreference?.windows;
                const hasRealSchedule = Array.isArray(windows) && windows.length > 0;

                if (isActive) {
                    setScheduleState({
                        status: hasRealSchedule
                            ? "ready"
                            : "required",
                        checkedUid: user.uid,
                        error: null,
                    });
                }
            } catch (err) {
                if (err?.name === "AbortError") {
                    return;
                }
                if (isActive) {
                    setScheduleState({
                        status: "error",
                        checkedUid: user.uid,
                        error: err,
                    });
                }
            }
        };

        void checkSchedule();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [
        status,
        hasGenAiAccess,
        calibration.status,
        user,
        scheduleRetryKey,
    ]);

    useEffect(() => {
        if (
            scheduleState.status ===
            "required" &&
            scheduleState.checkedUid ===
            user?.uid
        ) {
            router.replace(
                "/home/premium/genai/schedule",
            );
        }
    }, [
        scheduleState.status,
        scheduleState.checkedUid,
        user?.uid,
        router,
    ]);
    useEffect(() => {
        if (
            upgrade.status === "error" &&
            upgrade.upgradeStatus ===
            "calibration_required"
        ) {
            router.replace(
                "/home/premium/genai/calibration",
            );
        }
    }, [
        upgrade.status,
        upgrade.upgradeStatus,
        router,
    ]);

    // Auto-retry once on conflict — typically a race between activation and first load.
    useEffect(() => {
        if (
            upgrade.status === "error" &&
            upgrade.upgradeStatus === "conflict" &&
            !conflictRetried.current
        ) {
            conflictRetried.current = true;
            upgrade.retry();
        }
    }, [upgrade.status, upgrade.upgradeStatus, upgrade.retry]);

    useEffect(() => {
        if (
            upgrade.status !== "ready" ||
            !user ||
            runtimeData ||
            runtimeError
        ) {
            return;
        }

        const controller = new AbortController();
        let isActive = true;

        const loadRuntime = async () => {
            try {
                const token = await user.getIdToken();

                const res = await fetch(
                    "/api/v2/premium/genai/runtime",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                if (!res.ok) {
                    let payload = null;

                    try {
                        payload = await res.json();
                    } catch {
                        // Keep generic error below.
                    }

                    throw new Error(
                        payload?.error ||
                        payload?.message ||
                        `Failed to load Premium GenAI runtime: ${res.status}`,
                    );
                }

                const data = await res.json();

                if (isActive) {
                    // Filter semantically using pure helper
                    const filteredDays = filterGenAiWeeks(data.days || [], minWeek, maxWeek);

                    const filteredTotalLevels = filteredDays.reduce(
                        (sum, day) => sum + (Array.isArray(day.levels) ? day.levels.length : 0),
                        0
                    );

                    const filteredRuntimeData = {
                        ...data,
                        days: filteredDays,
                        totalLevels: filteredTotalLevels,
                    };

                    setRuntimeData(filteredRuntimeData);
                }
            } catch (err) {
                if (err?.name === "AbortError") {
                    return;
                }

                console.error(
                    `[Premium GenAI ${tierKey}] Runtime load failed:`,
                    err,
                );

                if (isActive) {
                    setRuntimeError(true);
                }
            }
        };

        void loadRuntime();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [
        upgrade.status,
        user,
        runtimeData,
        runtimeError,
        tierKey,
        minWeek,
        maxWeek
    ]);

    /*
     * Access errors must be handled before
     * calibration's disabled idle state.
     */
    if (status === "error") {
        return (
            <VerificationError
                message="We could not verify your Premium access at this time. Please try again."
                onRetry={retry}
                onHome={() =>
                    router.push("/home")
                }
            />
        );
    }

    if (
        status === "loading" ||
        status === "foundation"
    ) {
        return <GenAiRouteLoader />;
    }

    if (
        status === "premium" &&
        hasGenAiAccess === true
    ) {
        if (
            calibration.status === "error"
        ) {
            return (
                <VerificationError
                    message="We could not verify your GenAI calibration status at this time. Please try again."
                    onRetry={calibration.retry}
                    onHome={() =>
                        router.push("/home")
                    }
                />
            );
        }

        if (
            calibration.status === "idle" ||
            calibration.status ===
            "loading" ||
            calibration.status ===
            "required"
        ) {
            return <GenAiRouteLoader />;
        }

        if (
            calibration.status === "ready"
        ) {
            if (scheduleState.status === "error") {
                return (
                    <VerificationError
                        message="We could not verify your learning schedule at this time. Please try again."
                        onRetry={() => {
                            setScheduleRetryKey(
                                (current) => current + 1,
                            );
                        }}
                        onHome={() => router.push("/home")}
                    />
                );
            }

            if (
                scheduleState.status === "idle" ||
                scheduleState.status === "loading" ||
                scheduleState.status === "required"
            ) {
                return <GenAiRouteLoader />;
            }

            if (
                upgrade.status === "idle" ||
                upgrade.status === "loading"
            ) {
                return <GenAiRouteLoader />;
            }

            if (
                upgrade.status === "error"
            ) {
                /*
                 * Server says calibration is no longer
                 * reusable. The redirect effect above
                 * owns navigation back to calibration.
                 */
                if (
                    upgrade.upgradeStatus ===
                    "calibration_required"
                ) {
                    return <GenAiRouteLoader />;
                }

                const retryUpgrade =
                    async () => {
                        /*
                         * Entitlement may have changed
                         * between the access check and
                         * the upgrade POST.
                         *
                         * Re-check trusted access first.
                         */
                        if (
                            upgrade.upgradeStatus ===
                            "not_entitled"
                        ) {
                            const accessState =
                                await retry();

                            if (
                                accessState?.status !==
                                "premium" ||
                                accessState
                                    ?.hasGenAiAccess !==
                                true
                            ) {
                                return;
                            }
                        }

                        await upgrade.retry();
                    };

                let message =
                    "We could not prepare your Premium GenAI roadmap. Your existing progress has not been changed. Please try again.";

                if (
                    upgrade.upgradeStatus ===
                    "not_entitled"
                ) {
                    message =
                        "We could not confirm your Premium GenAI access. Please verify your access and try again.";
                } else if (
                    upgrade.upgradeStatus ===
                    "conflict"
                ) {
                    message =
                        "Your Premium roadmap changed while we were preparing it. Please retry so we can use the latest version safely.";
                }

                return (
                    <VerificationError
                        message={message}
                        onRetry={retryUpgrade}
                        onHome={() =>
                            router.push("/home")
                        }
                    />
                );
            }

            if (
                upgrade.status === "ready"
            ) {
                if (runtimeError) {
                    return (
                        <VerificationError
                            message="We could not load your Premium GenAI roadmap at this time. Please try again."
                            onRetry={() => {
                                setRuntimeError(false);
                                setRuntimeData(null);
                            }}
                            onHome={() => router.push("/home")}
                        />
                    );
                }

                if (!runtimeData) {
                    return <GenAiRouteLoader />;
                }

                return <RoadmapTemplate roadmapData={runtimeData} backHref="/home/premium/genai" />;
            }
        }
    }

    return <GenAiRouteLoader />;
}
