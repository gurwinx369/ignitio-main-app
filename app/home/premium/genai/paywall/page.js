"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    Home,
    Lock,
    RotateCw,
    Sparkles,
} from "lucide-react";

import Loader from "@/layout/Loader";
import { useAuth } from "@/features/context/AuthContext";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";

import {
    loadRazorpay,
    openRazorpayCheckout,
} from "@/features/onboarding/paywall/hooks/useRazorpayCheckout";
import { createSubscription } from "@/features/onboarding/paywall/services/createSubscription";
import { verifyPayment } from "@/features/onboarding/paywall/services/verifyPayment";
import PaymentStatus from "@/features/onboarding/paywall/components/PaymentStatus";
import PremiumPlanCard from "@/features/onboarding/paywall/components/PremiumPlanCard";
import {
    DEFAULT_SUBSCRIPTION_PLAN,
    getClientSubscriptionPlan,
} from "@/features/onboarding/paywall/constants/plans";

export default function GenAiPaywallPage() {
    const router = useRouter();
    const { user } = useAuth();

    const {
        status,
        retry,
    } = usePremiumAccess();

    const [
        isPremiumLoading,
        setIsPremiumLoading,
    ] = useState(false);

    const [
        statusVariant,
        setStatusVariant,
    ] = useState("idle");

    const [
        statusMessage,
        setStatusMessage,
    ] = useState(null);

    const [
        selectedPlan,
        setSelectedPlan,
    ] = useState(
        DEFAULT_SUBSCRIPTION_PLAN,
    );

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (status === "premium") {
            router.replace(
                "/home/premium/genai",
            );
        }
    }, [status, router]);

    const confirmPremiumAccess =
        async () => {
            const accessState = await retry();

            if (!isMounted.current) {
                return false;
            }

            if (
                accessState?.status ===
                "premium" &&
                accessState.hasGenAiAccess ===
                true
            ) {
                /*
                 * Redirect remains owned by the
                 * status-driven effect.
                 */
                return true;
            }

            setIsPremiumLoading(false);

            if (
                accessState?.status ===
                "foundation"
            ) {
                setStatusVariant("error");
                setStatusMessage(
                    "Your subscription is active, but Premium access has not synchronized yet. Please try again shortly.",
                );

                return false;
            }

            if (
                accessState?.status === "error"
            ) {
                /*
                 * The hook's full-page error
                 * state will be rendered.
                 */
                return false;
            }

            setStatusVariant("error");
            setStatusMessage(
                "Premium access could not be confirmed. Please try again.",
            );

            return false;
        };

    const handlePremium = async () => {
        if (isPremiumLoading || !user) {
            return;
        }

        setIsPremiumLoading(true);
        setStatusVariant("idle");
        setStatusMessage(null);

        try {
            const idToken =
                await user.getIdToken();

            /*
             * Create/reconcile the subscription
             * before loading Checkout.
             *
             * Active and pending subscriptions
             * do not need the Razorpay script.
             */
            const createResult =
                await createSubscription({
                    idToken,
                    plan: selectedPlan,
                });

            if (
                !createResult
                    .razorpaySubscriptionId
            ) {
                if (
                    createResult.existingStatus ===
                    "active"
                ) {
                    setStatusVariant("success");
                    setStatusMessage(
                        "Active subscription found. Confirming Premium access…",
                    );

                    await confirmPremiumAccess();
                    return;
                }

                if (
                    createResult.existingStatus ===
                    "payment_pending"
                ) {
                    setStatusVariant("error");
                    setStatusMessage(
                        "A subscription payment is already pending. Complete the existing payment or try again after its status updates.",
                    );
                    setIsPremiumLoading(false);
                    return;
                }

                setStatusVariant("error");
                setStatusMessage(
                    createResult.message ??
                    "Could not start checkout. Please try again.",
                );
                setIsPremiumLoading(false);
                return;
            }

            await loadRazorpay();

            if (!isMounted.current) {
                return;
            }

            const {
                razorpaySubscriptionId,
                keyId,
            } = createResult;

            const selectedPlanConfig =
                getClientSubscriptionPlan(
                    selectedPlan,
                );

            openRazorpayCheckout({
                keyId,
                subscriptionId:
                    razorpaySubscriptionId,
                name: "Ignitio",
                description:
                    selectedPlanConfig
                        ?.checkoutDescription ??
                    "Ignitio Premium",

                onSuccess: async ({
                    razorpayPaymentId,
                    razorpaySubscriptionId:
                    completedSubscriptionId,
                    razorpaySignature,
                }) => {
                    try {
                        const freshToken =
                            await user.getIdToken();

                        const verificationResult =
                            await verifyPayment(
                                {
                                    razorpayPaymentId,
                                    razorpaySubscriptionId:
                                        completedSubscriptionId,
                                    razorpaySignature,
                                },
                                freshToken,
                            );

                        if (!isMounted.current) {
                            return;
                        }

                        if (
                            !verificationResult.success
                        ) {
                            setStatusVariant("error");
                            setStatusMessage(
                                verificationResult.message ??
                                "Payment verification failed. Please contact support if your account was charged.",
                            );
                            setIsPremiumLoading(false);
                            return;
                        }

                        setStatusVariant("success");
                        setStatusMessage(
                            "Payment confirmed. Confirming Premium access…",
                        );

                        /*
                         * Do not redirect from the
                         * Razorpay callback alone.
                         */
                        await confirmPremiumAccess();
                    } catch (error) {
                        console.error(
                            "[PostOnboardingPaywall] Payment verification error:",
                            error,
                        );

                        if (!isMounted.current) {
                            return;
                        }

                        setStatusVariant("error");
                        setStatusMessage(
                            "Payment verification could not be completed. Please contact support if your account was charged.",
                        );
                        setIsPremiumLoading(false);
                    }
                },

                onDismiss: () => {
                    if (!isMounted.current) {
                        return;
                    }

                    setStatusVariant("dismissed");
                    setStatusMessage(
                        "Checkout closed. No changes were made to your account.",
                    );
                    setIsPremiumLoading(false);
                },
            });
        } catch (error) {
            console.error(
                "[PostOnboardingPaywall] Checkout error:",
                error,
            );

            if (!isMounted.current) {
                return;
            }

            const isScriptError =
                error instanceof Error &&
                error.message
                    .toLowerCase()
                    .includes("script");

            setStatusVariant("error");
            setStatusMessage(
                isScriptError
                    ? "Could not load the payment provider. Please check your connection and try again."
                    : "Something went wrong while starting checkout. Please try again.",
            );
            setIsPremiumLoading(false);
        }
    };

    if (
        status === "loading" ||
        status === "premium"
    ) {
        return <Loader />;
    }

    if (status === "error") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf3] p-4 text-center">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-2xl font-bold text-slate-900">
                        Unable to Verify Access
                    </h2>

                    <p className="mb-6 text-slate-600">
                        We could not verify your
                        Premium access at this time.
                        Please try again.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={retry}
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
                            onClick={() =>
                                router.push("/home")
                            }
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

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf3] p-4 lg:p-12">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm lg:p-12">
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <div className="rounded-full border border-slate-100 bg-slate-50 p-5">
                            <Sparkles
                                className="h-12 w-12 text-slate-400"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-purple-100 p-2 text-purple-600">
                            <Lock
                                className="h-6 w-6"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>

                <h1 className="mb-2 text-3xl font-bold text-slate-900">
                    Unlock GenAI Internship
                </h1>

                <p className="mx-auto mb-8 max-w-lg text-lg text-slate-600">
                    This is a Premium World.
                    Upgrade your account to access
                    advanced GenAI content,
                    interactive agents, and
                    premium projects.
                </p>

                <div className="mb-8 text-left">
                    <PremiumPlanCard
                        selectedPlan={selectedPlan}
                        onSelectPlan={
                            setSelectedPlan
                        }
                        disabled={
                            isPremiumLoading
                        }
                        showOnboardingNote={
                            false
                        }
                    />
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={handlePremium}
                        disabled={
                            isPremiumLoading || !user
                        }
                        className={`w-full rounded-xl bg-purple-600 px-8 py-3.5 font-bold text-white transition-colors sm:w-auto ${isPremiumLoading || !user
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-purple-700"
                            }`}
                    >
                        {isPremiumLoading
                            ? "Loading…"
                            : "Upgrade Now"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/home")
                        }
                        disabled={isPremiumLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        <Home
                            size={18}
                            aria-hidden="true"
                        />
                        Return to Home
                    </button>
                </div>

                <div className="mx-auto mt-8 max-w-lg text-left">
                    <PaymentStatus
                        variant={statusVariant}
                        message={statusMessage}
                    />
                </div>
            </div>
        </div>
    );
}