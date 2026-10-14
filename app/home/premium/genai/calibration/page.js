"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Home,
    RotateCw,
} from "lucide-react";

import Loader from "@/layout/Loader";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import { useCalibrationStatus } from "@/features/premium/calibration/useCalibrationStatus";
import { submitCalibration } from "@/features/premium/calibration/calibrationApi";
import DiagnosticAssessment from "@/features/onboarding/v4-genai/diagnostic/DiagnosticAssessment";

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

export default function GenAiCalibrationPage() {
    const router = useRouter();

    const {
        status: accessStatus,
        hasGenAiAccess,
        retry: retryAccess,
    } = usePremiumAccess();

    const calibrationEnabled =
        accessStatus === "premium" &&
        hasGenAiAccess === true;

    const {
        status: calibrationStatus,
        retry: retryCalibration,
    } = useCalibrationStatus({
        enabled: calibrationEnabled,
    });

    useEffect(() => {
        if (
            accessStatus === "foundation"
        ) {
            router.replace(
                "/home/premium/genai/paywall",
            );
        }
    }, [accessStatus, router]);

    useEffect(() => {
        if (
            accessStatus === "premium" &&
            hasGenAiAccess === true &&
            calibrationStatus === "ready"
        ) {
            router.replace(
                "/home/premium/genai",
            );
        }
    }, [
        accessStatus,
        hasGenAiAccess,
        calibrationStatus,
        router,
    ]);

    const handleSuccess = async (
        result,
    ) => {
        if (
            result?.success !== true ||
            result.status !== "ready" ||
            result.calibrationRequired !==
            false
        ) {
            throw new Error(
                "Calibration completed, but readiness could not be confirmed. Please try again.",
            );
        }

        router.replace(
            "/home/premium/genai",
        );
    };

    /*
     * Access errors must be rendered before
     * calibration's disabled idle state.
     */
    if (accessStatus === "error") {
        return (
            <VerificationError
                message="We could not verify your Premium access at this time. Please try again."
                onRetry={retryAccess}
                onHome={() =>
                    router.push("/home")
                }
            />
        );
    }

    if (
        accessStatus === "loading" ||
        accessStatus === "foundation"
    ) {
        return <Loader />;
    }

    if (
        calibrationStatus === "error"
    ) {
        return (
            <VerificationError
                message="We could not verify your calibration status at this time. Please try again."
                onRetry={retryCalibration}
                onHome={() =>
                    router.push("/home")
                }
            />
        );
    }

    if (
        calibrationStatus === "idle" ||
        calibrationStatus === "loading" ||
        calibrationStatus === "ready"
    ) {
        return <Loader />;
    }

    if (
        calibrationStatus !== "required"
    ) {
        return <Loader />;
    }

    return (
        <DiagnosticAssessment
            mode="calibration"
            submitAssessment={
                submitCalibration
            }
            onSuccess={handleSuccess}
        />
    );
}