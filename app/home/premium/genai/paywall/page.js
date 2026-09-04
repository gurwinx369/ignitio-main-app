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
   PREMIUM WORLD VISUAL
========================================================= */

function PremiumWorldVisual() {
    return (
        <div
            className="
                relative
                h-[280px]
                w-full
                overflow-hidden
                rounded-[26px]
                bg-[#FFFDF9]

                sm:h-[320px]
                lg:h-[420px]
            "
            aria-hidden="true"
        >
            <style>{`
                @keyframes paywall-flow {
                    0% {
                        left: 8%;
                        opacity: 0;
                    }

                    8% {
                        opacity: 1;
                    }

                    92% {
                        opacity: 1;
                    }

                    100% {
                        left: 88%;
                        opacity: 0;
                    }
                }

                @keyframes paywall-node {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }

                    50% {
                        transform: translateY(-4px) scale(1.035);
                    }
                }

                @keyframes paywall-agent {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow:
                            0 10px 26px rgba(25,24,59,0.12);
                    }

                    50% {
                        transform: scale(1.06);
                        box-shadow:
                            0 0 0 9px rgba(0,169,255,0.07),
                            0 16px 34px rgba(25,24,59,0.17);
                    }
                }

                @keyframes paywall-output {
                    0%, 64% {
                        opacity: 0;
                        transform: translateY(8px) scale(.95);
                    }

                    74%, 92% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }

                    100% {
                        opacity: 0;
                    }
                }

                @keyframes paywall-output-line {
                    0%, 68% {
                        width: 0%;
                        opacity: 0;
                    }

                    77% {
                        opacity: 1;
                    }

                    93% {
                        width: 100%;
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                    }
                }

                @keyframes paywall-orbit {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .paywall-motion {
                        animation: none !important;
                        transform: none !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>

            {/* Dot grid */}
            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(25,24,59,0.11) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                }}
            />

            {/* Ambient center glow */}
            <div
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[220px]
                    w-[220px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#00A9FF]/6
                    blur-3xl

                    lg:h-[300px]
                    lg:w-[300px]
                "
            />

            {/* Premium chip */}
            <div
                className="
                    absolute
                    left-4
                    top-4
                    z-20
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#00A9FF]/25
                    bg-white/90
                    px-3
                    py-1.5
                    shadow-sm
                "
            >
                <Sparkles
                    size={13}
                    className="text-[#00A9FF]"
                />

                <span
                    className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-[#19183B]
                    "
                >
                    Premium World
                </span>
            </div>

            {/* Track */}
            <div
                className="
                    absolute
                    left-[8%]
                    right-[8%]
                    top-[49%]
                    h-[2px]
                    rounded-full
                    bg-[#19183B]/10
                "
            />

            {/* Traveling packet */}
            <div
                className="
                    paywall-motion
                    absolute
                    top-[calc(49%-4px)]
                    z-10
                    h-2
                    w-2
                    rounded-full
                    bg-[#00A9FF]
                    shadow-[0_0_14px_rgba(0,169,255,0.9)]
                "
                style={{
                    animation:
                        "paywall-flow 5.4s ease-in-out infinite",
                }}
            />

            {/* Prompt */}
            <div
                className="
                    paywall-motion
                    absolute
                    left-[5%]
                    top-[36%]
                    flex
                    h-[62px]
                    w-[62px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[18px]
                    border
                    border-[#00A9FF]/25
                    bg-white
                    shadow-[0_8px_20px_rgba(25,24,59,0.08)]

                    sm:h-[70px]
                    sm:w-[70px]

                    lg:left-[7%]
                    lg:h-[78px]
                    lg:w-[78px]
                "
                style={{
                    animation:
                        "paywall-node 4.5s ease-in-out infinite",
                }}
            >
                <span className="text-[10px] font-black text-[#19183B] sm:text-[11px]">
                    Prompt
                </span>

                <span className="mt-1 text-[6px] font-semibold text-[#19183B]/40 sm:text-[7px]">
                    structure
                </span>
            </div>

            {/* RAG */}
            <div
                className="
                    paywall-motion
                    absolute
                    left-[29%]
                    top-[36%]
                    flex
                    h-[62px]
                    w-[62px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[18px]
                    border
                    border-[#00A9FF]/28
                    bg-white
                    shadow-[0_8px_20px_rgba(25,24,59,0.08)]

                    sm:h-[70px]
                    sm:w-[70px]

                    lg:left-[31%]
                    lg:h-[78px]
                    lg:w-[78px]
                "
                style={{
                    animation:
                        "paywall-node 4.5s .35s ease-in-out infinite",
                }}
            >
                <div className="mb-1 grid grid-cols-3 gap-[2px]">
                    {Array.from({
                        length: 9,
                    }).map((_, index) => (
                        <span
                            key={index}
                            className={[
                                "h-[4px] w-[4px] rounded-full",
                                index === 4
                                    ? "bg-[#00A9FF]"
                                    : "bg-[#19183B]/14",
                            ].join(" ")}
                        />
                    ))}
                </div>

                <span className="text-[9px] font-black text-[#19183B] sm:text-[10px]">
                    RAG
                </span>
            </div>

            {/* API */}
            <div
                className="
                    paywall-motion
                    absolute
                    left-[53%]
                    top-[36%]
                    flex
                    h-[62px]
                    w-[62px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[18px]
                    border
                    border-[#00A9FF]/28
                    bg-white
                    shadow-[0_8px_20px_rgba(25,24,59,0.08)]

                    sm:h-[70px]
                    sm:w-[70px]

                    lg:left-[55%]
                    lg:h-[78px]
                    lg:w-[78px]
                "
                style={{
                    animation:
                        "paywall-node 4.5s .7s ease-in-out infinite",
                }}
            >
                <span className="text-[9px] font-black text-[#19183B] sm:text-[10px]">
                    API
                </span>

                <span
                    className="
                        mt-1
                        rounded
                        bg-[#00A9FF]/10
                        px-1.5
                        py-0.5
                        font-mono
                        text-[5px]
                        font-bold
                        text-[#00A9FF]

                        sm:text-[6px]
                    "
                >
                    POST
                </span>
            </div>

            {/* Agent */}
            <div
                className="
                    paywall-motion
                    absolute
                    right-[4%]
                    top-[32%]
                    flex
                    h-[76px]
                    w-[76px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[24px]
                    border
                    border-[#00A9FF]/35
                    bg-[#19183B]
                    text-white

                    sm:h-[86px]
                    sm:w-[86px]

                    lg:right-[6%]
                    lg:h-[94px]
                    lg:w-[94px]
                "
                style={{
                    animation:
                        "paywall-agent 4.8s ease-in-out infinite",
                }}
            >
                <div
                    className="
                        paywall-motion
                        absolute
                        inset-[-7px]
                        rounded-[28px]
                        border
                        border-dashed
                        border-[#00A9FF]/25
                    "
                    style={{
                        animation:
                            "paywall-orbit 11s linear infinite",
                    }}
                />

                <Sparkles
                    size={18}
                    className="mb-1 text-[#00A9FF]"
                />

                <span className="text-[9px] font-black sm:text-[10px]">
                    Agent
                </span>

                <span className="mt-0.5 text-[6px] font-semibold text-white/40">
                    decide
                </span>
            </div>

            {/* Output */}
            <div
                className="
                    paywall-motion
                    absolute
                    bottom-5
                    left-1/2
                    w-[155px]
                    -translate-x-1/2
                    rounded-xl
                    border
                    border-[#00A9FF]/20
                    bg-white/92
                    px-3
                    py-2.5
                    shadow-[0_8px_18px_rgba(25,24,59,0.08)]

                    sm:w-[180px]

                    lg:bottom-8
                    lg:w-[210px]
                    lg:px-4
                    lg:py-3
                "
                style={{
                    animation:
                        "paywall-output 5.4s ease-in-out infinite",
                }}
            >
                <div className="mb-1.5 flex items-center justify-between">
                    <span
                        className="
                            text-[7px]
                            font-black
                            uppercase
                            tracking-wide
                            text-[#19183B]/55
                        "
                    >
                        Production output
                    </span>

                    <span className="h-2 w-2 rounded-full bg-[#00A9FF]" />
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#19183B]/8">
                    <div
                        className="
                            paywall-motion
                            h-full
                            rounded-full
                            bg-[#00A9FF]/70
                        "
                        style={{
                            animation:
                                "paywall-output-line 5.4s ease-in-out infinite",
                        }}
                    />
                </div>

                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#19183B]/6">
                    <div
                        className="
                            paywall-motion
                            h-full
                            max-w-[70%]
                            rounded-full
                            bg-[#19183B]/18
                        "
                        style={{
                            animation:
                                "paywall-output-line 5.4s .12s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>
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

                <section
                    className="
                        overflow-hidden
                        rounded-[32px]
                        border
                        border-[#E2B287]
                        bg-[#F2E0D0]

                        shadow-[0_20px_50px_rgba(25,24,59,0.12)]
                    "
                >
                    <div
                        className="
                            grid
                            grid-cols-1

                            lg:grid-cols-[0.95fr_1.05fr]
                        "
                    >
                        {/* =================================================
                            LEFT: CONTENT
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                justify-center

                                p-6

                                sm:p-8

                                lg:p-10

                                xl:p-12
                            "
                        >
                            <div
                                className="
                                    mb-5
                                    flex
                                    w-fit
                                    items-center
                                    gap-2

                                    rounded-full

                                    border
                                    border-[#19183B]/10

                                    bg-[#FFFDF9]/65

                                    px-3
                                    py-1.5
                                "
                            >
                                <Lock
                                    size={12}
                                    className="text-[#19183B]"
                                />

                                <span
                                    className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.17em]
                                        text-[#19183B]/65
                                    "
                                >
                                    Premium GenAI World
                                </span>
                            </div>

                            <p
                                className="
                                    mb-2
                                    text-[11px]
                                    font-black
                                    uppercase
                                    tracking-[0.22em]
                                    text-[#00A9FF]

                                    sm:text-[12px]
                                "
                            >
                                Go beyond the
                                foundations
                            </p>

                            <h1
                                className="
                                    max-w-[520px]
                                    text-[34px]
                                    font-black
                                    leading-[1.04]
                                    tracking-[-0.035em]
                                    text-[#19183B]

                                    sm:text-[42px]

                                    lg:text-[48px]
                                "
                            >
                                Unlock the full
                                <br />
                                GenAI Internship
                            </h1>

                            <p
                                className="
                                    mt-4
                                    max-w-[500px]

                                    text-[14px]
                                    font-medium
                                    leading-[1.65]
                                    text-[#19183B]/65

                                    sm:text-[15px]
                                "
                            >
                                Move from prompting
                                into production RAG,
                                APIs, structured
                                outputs and agentic
                                systems — inside one
                                guided learning world.
                            </p>

                            {/* Learning path */}
                            <div
                                className="
                                    mt-5
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >
                                {[
                                    "Prompting",
                                    "RAG",
                                    "APIs",
                                    "Agents",
                                ].map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                item
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >
                                            <span
                                                className="
                                                    rounded-full

                                                    border
                                                    border-[#19183B]/10

                                                    bg-[#FFFDF9]/65

                                                    px-3
                                                    py-1.5

                                                    text-xs
                                                    font-bold
                                                    text-[#19183B]
                                                "
                                            >
                                                {
                                                    item
                                                }
                                            </span>

                                            {index <
                                                3 && (
                                                    <span className="font-bold text-[#00A9FF]">
                                                        →
                                                    </span>
                                                )}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Benefits */}
                            <div className="mt-6 grid gap-3">
                                {[
                                    "Personalized GenAI learning path",
                                    "Production-focused engineering projects",
                                    "RAG, APIs, structured outputs and agents",
                                ].map(
                                    (
                                        benefit,
                                    ) => (
                                        <div
                                            key={
                                                benefit
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    h-6
                                                    w-6
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-[#00A9FF]
                                                    text-[#19183B]
                                                "
                                            >
                                                <Check
                                                    size={
                                                        14
                                                    }
                                                    strokeWidth={
                                                        3
                                                    }
                                                />
                                            </div>

                                            <span
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-[#19183B]/75
                                                "
                                            >
                                                {
                                                    benefit
                                                }
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* =============================================
                                PLAN SELECTION
                            ============================================= */}

                            <div
                                className="
                                    mt-7
                                    rounded-[24px]
                                    bg-[#FFFDF9]/45
                                    p-3

                                    sm:p-4
                                "
                            >
                                <PremiumPlanCard
                                    selectedPlan={
                                        selectedPlan
                                    }
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

                            {/* =============================================
                                PRIMARY ACTION
                            ============================================= */}

                            <button
                                type="button"
                                onClick={
                                    handlePremium
                                }
                                disabled={
                                    isPremiumLoading ||
                                    !user
                                }
                                className="
                                    mt-6

                                    flex
                                    min-h-[54px]
                                    w-full
                                    max-w-[390px]
                                    items-center
                                    justify-center
                                    gap-2.5

                                    rounded-[18px]

                                    bg-[#00A9FF]

                                    px-6

                                    text-[15px]
                                    font-black
                                    text-[#19183B]

                                    shadow-[0_5px_0_#0085C7]

                                    transition-[transform,box-shadow]
                                    duration-150
                                    ease-out

                                    hover:-translate-y-px

                                    active:translate-y-[2px]
                                    active:scale-[0.99]
                                    active:shadow-[0_1px_0_#0085C7]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-55
                                    disabled:shadow-none
                                "
                            >
                                {isPremiumLoading ? (
                                    <>
                                        <RotateCw
                                            size={
                                                18
                                            }
                                            className="animate-spin"
                                        />

                                        Preparing
                                        checkout…
                                    </>
                                ) : (
                                    <>
                                        Unlock
                                        Premium

                                        <ArrowRight
                                            size={
                                                18
                                            }
                                            strokeWidth={
                                                2.5
                                            }
                                        />
                                    </>
                                )}
                            </button>

                            {/* Secondary */}
                            <button
                                type="button"
                                disabled={
                                    isPremiumLoading
                                }
                                onClick={() =>
                                    router.push(
                                        "/home",
                                    )
                                }
                                className="
                                    mt-3
                                    flex
                                    w-fit
                                    items-center
                                    gap-2

                                    rounded-lg

                                    px-1
                                    py-1

                                    text-sm
                                    font-bold
                                    text-[#19183B]/55

                                    transition-colors

                                    hover:text-[#19183B]

                                    disabled:cursor-not-allowed disabled:opacity-60
                                "
                            >
                                <ArrowLeft
                                    size={15}
                                />

                                Maybe later
                            </button>

                            {/* Payment status */}
                            {(statusVariant !==
                                "idle" ||
                                statusMessage) && (
                                    <div
                                        className="
                                        mt-6
                                        max-w-[520px]

                                        rounded-2xl

                                        bg-[#FFFDF9]/65

                                        p-3
                                    "
                                    >
                                        <PaymentStatus
                                            variant={
                                                statusVariant
                                            }
                                            message={
                                                statusMessage
                                            }
                                        />
                                    </div>
                                )}
                        </div>

                        {/* =================================================
                            RIGHT: PREMIUM WORLD VISUAL
                        ================================================= */}

                        <div
                            className="
                                border-t
                                border-[#19183B]/8

                                bg-[#FFFDF9]/35

                                p-4

                                sm:p-6

                                lg:flex
                                lg:items-center
                                lg:border-l
                                lg:border-t-0
                                lg:p-8
                            "
                        >
                            <PremiumWorldVisual />
                        </div>
                    </div>
                </section>

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