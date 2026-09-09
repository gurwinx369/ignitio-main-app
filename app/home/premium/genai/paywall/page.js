"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Check,
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
import { validateCoupon } from "@/features/onboarding/paywall/services/validateCoupon";

/* =========================================================
   ROUTE LOADER

   Kyle is mounted globally in /home/layout.
   This opaque route overlay prevents Kyle appearing on top
   while Premium access is being resolved.
========================================================= */

function PaywallRouteLoader() {
    return (
        <div
            className="
                fixed
                inset-0
                z-[5000]
                flex
                min-h-screen
                items-center
                justify-center
                bg-[#FCF5EE]
            "
            role="status"
            aria-live="polite"
            aria-label="Checking Premium access"
        >
            <Loader />
        </div>
    );
}

/* =========================================================
   PAYWALL PAGE
========================================================= */

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

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(null);

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
                accessState?.status ===
                "error"
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

    const handleApplyCoupon = async () => {
        if (
            couponLoading ||
            isPremiumLoading ||
            !user
        ) {
            return;
        }

        const normalizedCode = couponCode.trim();

        if (!normalizedCode) {
            setCouponError("Enter a coupon code.");
            setAppliedCoupon(null);
            return;
        }

        setCouponLoading(true);
        setCouponError(null);
        setAppliedCoupon(null);

        try {
            const idToken = await user.getIdToken();

            const result = await validateCoupon({
                idToken,
                couponCode: normalizedCode,
                plan: selectedPlan,
            });

            if (!isMounted.current) return;

            if (!result.valid) {
                setCouponError(
                    result.message ?? "This coupon is not valid.",
                );
                return;
            }

            setCouponCode(normalizedCode.toUpperCase());
            setAppliedCoupon(result.coupon);
        } catch (error) {
            console.error(
                "[GenAiPaywall] Coupon validation error:",
                error,
            );

            if (isMounted.current) {
                setCouponError(
                    "Could not validate the coupon. Please try again.",
                );
            }
        } finally {
            if (isMounted.current) {
                setCouponLoading(false);
            }
        }
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
            const createResult = await createSubscription({
                idToken,
                plan: selectedPlan,
                couponCode: appliedCoupon
                    ? couponCode
                    : undefined,
            });

            if (
                !createResult
                    .razorpaySubscriptionId
            ) {
                if (
                    createResult.existingStatus ===
                    "active"
                ) {
                    setStatusVariant(
                        "success",
                    );

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
                    setStatusVariant(
                        "error",
                    );

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

                        if (
                            !isMounted.current
                        ) {
                            return;
                        }

                        if (
                            !verificationResult.success
                        ) {
                            setStatusVariant(
                                "error",
                            );

                            setStatusMessage(
                                verificationResult.message ??
                                "Payment verification failed. Please contact support if your account was charged.",
                            );

                            setIsPremiumLoading(
                                false,
                            );

                            return;
                        }

                        setStatusVariant(
                            "success",
                        );

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

                        if (
                            !isMounted.current
                        ) {
                            return;
                        }

                        setStatusVariant(
                            "error",
                        );

                        setStatusMessage(
                            "Payment verification could not be completed. Please contact support if your account was charged.",
                        );

                        setIsPremiumLoading(
                            false,
                        );
                    }
                },

                onDismiss: () => {
                    if (
                        !isMounted.current
                    ) {
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

    /* =====================================================
       LOADING
    ===================================================== */

    if (
        status === "loading" ||
        status === "premium"
    ) {
        return <PaywallRouteLoader />;
    }

    /* =====================================================
       ACCESS ERROR
    ===================================================== */

    if (status === "error") {
        return (
            <main
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    bg-[#FCF5EE]
                    p-4
                "
            >
                <div
                    className="
                        w-full
                        max-w-md
                        rounded-[28px]
                        border
                        border-[#E4B78E]
                        bg-[#FFFDF9]
                        p-7
                        text-center
                        shadow-[0_16px_40px_rgba(25,24,59,0.10)]
                    "
                >
                    <div
                        className="
                            mx-auto
                            mb-5
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#F2E0D0]
                            text-[#19183B]
                        "
                    >
                        <Lock size={22} />
                    </div>

                    <h2
                        className="
                            mb-2
                            text-2xl
                            font-black
                            text-[#19183B]
                        "
                    >
                        Unable to verify access
                    </h2>

                    <p
                        className="
                            mb-6
                            text-sm
                            font-medium
                            leading-relaxed
                            text-[#19183B]/60
                        "
                    >
                        We couldn&apos;t confirm your
                        Premium status right now.
                        Your account hasn&apos;t been
                        changed.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={retry}
                            className="
                                flex
                                min-h-[48px]
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-[#00A9FF]
                                px-5
                                font-bold
                                text-[#19183B]

                                shadow-[0_4px_0_#0085C7]

                                transition-[transform,box-shadow]
                                duration-150

                                hover:-translate-y-px

                                active:translate-y-[2px]
                                active:scale-[0.99]
                                active:shadow-[0_1px_0_#0085C7]
                            "
                        >
                            <RotateCw
                                size={17}
                            />

                            Retry
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/home",
                                )
                            }
                            className="
                                flex
                                min-h-[48px]
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                border
                                border-[#DFAE82]
                                bg-[#F2E0D0]
                                px-5
                                font-bold
                                text-[#19183B]

                                transition-transform
                                duration-150

                                hover:-translate-y-px

                                active:translate-y-[2px]
                                active:scale-[0.99]
                            "
                        >
                            <Home size={17} />

                            Back to Home
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    /* =====================================================
       PAYWALL
    ===================================================== */

    return (
        <main
            className="
                min-h-screen
                bg-[#FCF5EE]
                px-4
                py-5

                sm:px-6
                sm:py-7

                lg:px-10
                lg:py-9
            "
        >
            <div className="mx-auto w-full max-w-[1180px]">
                {/* Back */}
                <button
                    type="button"
                    onClick={() =>
                        router.push("/home")
                    }
                    disabled={
                        isPremiumLoading
                    }
                    className="
                        mb-5
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#E3B58C]
                        bg-[#FFFDF9]
                        px-4
                        py-2.5

                        text-sm
                        font-bold
                        text-[#19183B]

                        shadow-[0_3px_0_#D9A87D]

                        transition-[transform,box-shadow]
                        duration-150

                        hover:-translate-y-px

                        active:translate-y-[2px]
                        active:scale-[0.98]
                        active:shadow-[0_1px_0_#D9A87D]

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <ArrowLeft size={17} />

                    Back
                </button>

                <div className="mb-6 text-center">
                    <h1
                        className="
                            mb-2
                            text-[34px]
                            font-black
                            leading-[1.04]
                            tracking-[-0.035em]
                            text-[#19183B]

                            sm:text-[42px]

                            lg:text-[48px]
                        "
                    >
                        Unlock the full GenAI Internship
                    </h1>
                    <p
                        className="
                            mx-auto
                            max-w-[500px]
                            text-[15px]
                            font-medium
                            leading-[1.65]
                            text-[#19183B]/65
                        "
                    >
                        Move from prompting into production RAG, APIs, structured outputs and agentic systems — inside one guided learning world.
                    </p>
                </div>

                <PremiumPlanCard
                    selectedPlan={selectedPlan}
                    onSelectPlan={(plan) => {
                        setSelectedPlan(plan);
                        setAppliedCoupon(null);
                        setCouponError(null);
                    }}
                    disabled={isPremiumLoading}
                    showOnboardingNote={false}
                    onContinue={handlePremium}
                    couponCode={couponCode}
                    onCouponChange={setCouponCode}
                    onApplyCoupon={handleApplyCoupon}
                    couponLoading={couponLoading}
                    appliedCoupon={appliedCoupon}
                    couponError={couponError}
                />

                {/* Payment status */}
                {(statusVariant !== 'idle' || statusMessage) && (
                    <div className="mt-6 mx-auto max-w-[520px] rounded-2xl bg-[#FFFDF9]/65 p-3">
                        <PaymentStatus
                            variant={statusVariant}
                            message={statusMessage}
                        />
                    </div>
                )}

                <p
                    className="
                        mx-auto
                        mt-4
                        max-w-[680px]
                        text-center
                        text-[11px]
                        font-medium
                        leading-relaxed
                        text-[#19183B]/40
                    "
                >
                    Checkout uses the existing
                    secure payment flow. Premium
                    access is confirmed before you
                    enter the GenAI world.
                </p>
            </div>
        </main>
    );
}