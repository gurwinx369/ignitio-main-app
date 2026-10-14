"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    TriangleAlert,
} from "lucide-react";

import { useAuth } from "@/features/context/AuthContext";

import PremiumPlanCard from "@/features/onboarding/v4-genai/paywall/components/PremiumPlanCard";

import {
    DEFAULT_SUBSCRIPTION_PLAN,
    getClientSubscriptionPlan,
} from "@/features/onboarding/v4-genai/paywall/constants/plans";

import {
    loadRazorpay,
    openRazorpayCheckout,
} from "@/features/onboarding/v4-genai/paywall/hooks/useRazorpayCheckout";

import { createSubscription } from "@/features/onboarding/v4-genai/paywall/services/createSubscription";
import { verifyPayment } from "@/features/onboarding/v4-genai/paywall/services/verifyPayment";
import { getSubscriptionStatus } from "@/features/onboarding/v4-genai/paywall/services/subscriptionStatus";
import { cancelSubscription } from "@/features/onboarding/v4-genai/paywall/services/cancelSubscription";

function formatBillingDate(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getCurrentPlanDetails(planSlug) {
    const configuredPlan =
        getClientSubscriptionPlan(planSlug);

    if (configuredPlan) {
        return configuredPlan;
    }

    if (planSlug === "ignitio_premium") {
        return {
            name: "Legacy Premium",
            price: null,
            period: null,
        };
    }

    return {
        name: "Ignitio Premium",
        price: null,
        period: null,
    };
}

function CancelSubscriptionModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    currentPeriodEnd,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition-opacity"
            onClick={() => {
                if (!isLoading) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
        >
            <div
                className="relative w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-200 rounded-[2rem] border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-xl sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <TriangleAlert className="h-6 w-6" />
                </div>

                <h2 id="cancel-modal-title" className="mb-2 text-xl font-bold text-slate-900">
                    Cancel your subscription?
                </h2>

                <p className="mb-6 text-sm text-slate-600">
                    Your Premium access will remain active until <span className="font-bold text-slate-900">{currentPeriodEnd}</span>. You won&apos;t be charged again after that.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row-reverse">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:w-auto"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? "Cancelling..." : "Cancel subscription"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-[#f1e4d2] bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                    >
                        Keep Premium
                    </button>
                </div>
            </div>
        </div>
    );
}

function SubscriptionPageSkeleton() {
    return (
        <main className="min-h-screen bg-[#fffaf3] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 h-5 w-24 animate-pulse rounded-md bg-slate-200" />

                <section className="relative overflow-hidden rounded-[2rem] border border-[#f1e4d2] bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-3 h-6 w-32 animate-pulse rounded-full bg-slate-200" />
                    <div className="mb-3 h-10 w-3/4 max-w-md animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-6 w-2/3 max-w-lg animate-pulse rounded-md bg-slate-200" />
                </section>

                <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#f1e4d2] bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="mb-3 h-6 w-28 animate-pulse rounded-full bg-slate-200" />
                                <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                                <div className="h-8 w-32 animate-pulse rounded-md bg-slate-200" />
                            </div>
                            <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-200" />
                        </div>
                    </div>
                    <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                        <div className="h-28 animate-pulse rounded-2xl bg-[#fffaf3]/50 border border-[#f1e4d2]" />
                        <div className="h-28 animate-pulse rounded-2xl bg-[#fffaf3]/50 border border-[#f1e4d2]" />
                    </div>
                    <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
                        <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function SubscriptionPage() {
    const { user } = useAuth();

    const isMounted = useRef(true);

    const [
        subscription,
        setSubscription,
    ] = useState(null);

    const [
        selectedPlan,
        setSelectedPlan,
    ] = useState(
        DEFAULT_SUBSCRIPTION_PLAN,
    );

    const [
        pageLoading,
        setPageLoading,
    ] = useState(true);

    const [
        pageError,
        setPageError,
    ] = useState(null);

    const [
        purchaseLoading,
        setPurchaseLoading,
    ] = useState(false);

    const [
        cancelLoading,
        setCancelLoading,
    ] = useState(false);

    const [
        cancelModalOpen,
        setCancelModalOpen,
    ] = useState(false);

    const [
        actionMessage,
        setActionMessage,
    ] = useState(null);

    const [
        actionVariant,
        setActionVariant,
    ] = useState("idle");

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    const loadSubscription =
        useCallback(
            async ({
                showLoader = true,
            } = {}) => {
                if (!user) {
                    return false;
                }

                if (showLoader) {
                    setPageLoading(true);
                }

                setPageError(null);

                try {
                    const idToken =
                        await user.getIdToken();

                    const result =
                        await getSubscriptionStatus({
                            idToken,
                        });

                    if (!isMounted.current) {
                        return false;
                    }

                    if (!result.success) {
                        setPageError(
                            result.message ??
                            "Unable to load your subscription.",
                        );

                        return false;
                    }

                    setSubscription(result.data);

                    return true;
                } catch (error) {
                    console.error(
                        "[SubscriptionPage] Status error:",
                        error,
                    );

                    if (isMounted.current) {
                        setPageError(
                            "Unable to load your subscription.",
                        );
                    }

                    return false;
                } finally {
                    if (
                        showLoader &&
                        isMounted.current
                    ) {
                        setPageLoading(false);
                    }
                }
            },
            [user],
        );

    useEffect(() => {
        if (!user) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void loadSubscription();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [user, loadSubscription]);

    const handleSubscribe =
        async () => {
            if (
                !user ||
                purchaseLoading
            ) {
                return;
            }

            const selectedPlanConfig =
                getClientSubscriptionPlan(
                    selectedPlan,
                );

            if (!selectedPlanConfig) {
                setActionVariant("error");
                setActionMessage(
                    "Please select a valid subscription plan.",
                );
                return;
            }

            setPurchaseLoading(true);
            setActionVariant("idle");
            setActionMessage(null);

            try {
                const idToken =
                    await user.getIdToken();

                const createResult =
                    await createSubscription({
                        idToken,
                        plan: selectedPlan,
                    });

                if (
                    !createResult
                        ?.razorpaySubscriptionId
                ) {
                    if (
                        createResult?.existingStatus ===
                        "active" ||
                        createResult?.existingStatus ===
                        "payment_pending"
                    ) {
                        await loadSubscription({
                            showLoader: false,
                        });

                        if (!isMounted.current) {
                            return;
                        }

                        setActionVariant("info");

                        setActionMessage(
                            createResult.existingStatus ===
                                "active"
                                ? "An active subscription already exists on this account."
                                : "A subscription payment is already pending. Please complete the existing payment before starting another.",
                        );

                        setPurchaseLoading(false);
                        return;
                    }

                    setActionVariant("error");
                    setActionMessage(
                        createResult?.message ??
                        "Could not start checkout. Please try again.",
                    );
                    setPurchaseLoading(false);
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

                openRazorpayCheckout({
                    keyId,
                    subscriptionId:
                        razorpaySubscriptionId,
                    name: "Ignitio",
                    description:
                        selectedPlanConfig
                            .checkoutDescription,

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
                                setActionVariant("error");
                                setActionMessage(
                                    verificationResult.message ??
                                    "Payment verification failed. Please contact support if your account was charged.",
                                );
                                setPurchaseLoading(false);
                                return;
                            }

                            setActionVariant("success");
                            setActionMessage(
                                "Payment confirmed. Activating your Premium subscription…",
                            );

                            const refreshed =
                                await loadSubscription({
                                    showLoader: false,
                                });

                            if (!isMounted.current) {
                                return;
                            }

                            setPurchaseLoading(false);

                            if (refreshed) {
                                setActionVariant(
                                    "success",
                                );
                                setActionMessage(
                                    "Premium is active. Welcome aboard!",
                                );
                            } else {
                                /*
                                 * Payment is already verified.
                                 * Never tell the user to pay again
                                 * because status refresh failed.
                                 */
                                setActionVariant("info");
                                setActionMessage(
                                    "Your payment was confirmed. Refresh this page if your subscription details do not appear yet.",
                                );
                            }
                        } catch (error) {
                            console.error(
                                "[SubscriptionPage] Verification error:",
                                error,
                            );

                            if (!isMounted.current) {
                                return;
                            }

                            setActionVariant("error");
                            setActionMessage(
                                "Payment verification could not be completed. Please contact support if your account was charged.",
                            );
                            setPurchaseLoading(false);
                        }
                    },

                    onDismiss: () => {
                        if (!isMounted.current) {
                            return;
                        }

                        setPurchaseLoading(false);
                        setActionVariant("info");
                        setActionMessage(
                            "Checkout closed. No changes were made.",
                        );
                    },
                });
            } catch (error) {
                console.error(
                    "[SubscriptionPage] Checkout error:",
                    error,
                );

                if (!isMounted.current) {
                    return;
                }

                setPurchaseLoading(false);
                setActionVariant("error");

                setActionMessage(
                    "Something went wrong while starting checkout. Please try again.",
                );
            }
        };

    const handleCancel =
        async () => {
            if (
                !user ||
                cancelLoading ||
                !subscription
                    ?.currentPeriodEnd
            ) {
                return;
            }

            setCancelLoading(true);
            setActionVariant("idle");
            setActionMessage(null);

            try {
                const idToken =
                    await user.getIdToken();

                const result =
                    await cancelSubscription({
                        idToken,
                    });

                if (!isMounted.current) {
                    return;
                }

                if (!result.success) {
                    setActionVariant("error");
                    setActionMessage(
                        result.message ??
                        "Unable to cancel your subscription.",
                    );
                    setCancelLoading(false);
                    setCancelModalOpen(false);
                    return;
                }

                const refreshed =
                    await loadSubscription({
                        showLoader: false,
                    });

                if (!isMounted.current) {
                    return;
                }

                setCancelLoading(false);
                setCancelModalOpen(false);

                if (refreshed) {
                    setActionVariant("success");
                    setActionMessage(
                        `Cancellation scheduled. Premium remains active until ${formatBillingDate(
                            result.data
                                ?.currentPeriodEnd,
                        )}.`,
                    );
                } else {
                    setActionVariant("info");
                    setActionMessage(
                        "Cancellation was accepted. Refresh the page to see the updated billing state.",
                    );
                }
            } catch (error) {
                console.error(
                    "[SubscriptionPage] Cancellation error:",
                    error,
                );

                if (!isMounted.current) {
                    return;
                }

                setCancelLoading(false);
                setCancelModalOpen(false);
                setActionVariant("error");
                setActionMessage(
                    "Unable to cancel your subscription. Please try again.",
                );
            }
        };

    if (pageLoading) {
        return <SubscriptionPageSkeleton />;
    }

    if (pageError) {
        return (
            <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
                <div className="mx-auto max-w-lg">
                    <div className="rounded-3xl border border-red-100 bg-white p-7 text-center shadow-sm">
                        <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-red-500" />

                        <h1 className="text-xl font-bold text-slate-900">
                            Couldn&apos;t load subscription
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            {pageError}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                loadSubscription()
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const status =
        subscription?.status ?? null;

    const entitled =
        subscription?.entitled === true;

    const cancellationScheduled =
        subscription
            ?.cancelAtPeriodEnd === true;

    const paymentPending =
        status === "payment_pending";

    const activeSubscription =
        status === "active";

    const canPurchase =
        !entitled &&
        (
            status === null ||
            status === "created" ||
            status === "cancelled" ||
            status === "expired"
        );

    const plan =
        getCurrentPlanDetails(
            subscription?.plan,
        );

    const currentPeriodEnd =
        formatBillingDate(
            subscription?.currentPeriodEnd,
        );

    const nextBillingAt =
        formatBillingDate(
            subscription?.nextBillingAt ??
            subscription
                ?.currentPeriodEnd,
        );

    return (
        <main className="min-h-screen bg-[#fffaf3] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/home"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-cyan-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <section className="relative overflow-hidden rounded-[2rem] border border-[#f1e4d2] bg-white p-6 shadow-sm sm:p-8">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-100/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-50/40 blur-3xl" />

                    <div className="relative">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Ignitio Premium
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            Manage your subscription
                        </h1>

                        <p className="mt-3 max-w-2xl text-slate-600">
                            Your Premium access, billing cycle
                            and subscription controls in one
                            place.
                        </p>
                    </div>
                </section>

                {actionMessage && (
                    <div
                        className={`mt-5 rounded-2xl border px-5 py-4 text-sm font-semibold ${actionVariant === "error"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : actionVariant ===
                                "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-cyan-200 bg-cyan-50 text-cyan-800"
                            }`}
                    >
                        {actionMessage}
                    </div>
                )}

                {paymentPending && (
                    <section className="mt-6 rounded-[2rem] border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <CreditCard className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                    Payment pending
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                    Your checkout is already in progress
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    A subscription payment is
                                    already pending. We won&apos;t
                                    create another subscription
                                    while this one is unresolved.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {entitled && (
                    <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#f1e4d2] bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-6 sm:p-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Premium Active
                                        </span>

                                        {cancellationScheduled && (
                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                                Cancellation scheduled
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-extrabold text-slate-950">
                                        {plan.name}
                                    </h2>

                                    {plan.price && (
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-950">
                                                {plan.price}
                                            </span>

                                            <span className="text-sm font-medium text-slate-500">
                                                {plan.period}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl bg-cyan-50/50 p-4 text-cyan-700">
                                    <ShieldCheck className="h-8 w-8" />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                            <div className="rounded-2xl border border-[#f1e4d2] bg-[#fffaf3]/50 p-5">
                                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <CalendarDays className="h-4 w-4 text-cyan-600" />

                                    {cancellationScheduled
                                        ? "Premium available until"
                                        : "Next payment"}
                                </div>

                                <p className="text-lg font-extrabold text-slate-950">
                                    {cancellationScheduled
                                        ? currentPeriodEnd
                                        : nextBillingAt}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#f1e4d2] bg-[#fffaf3]/50 p-5">
                                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <RefreshCw className="h-4 w-4 text-cyan-600" />
                                    Renewal
                                </div>

                                <p className="text-lg font-extrabold text-slate-950">
                                    {cancellationScheduled
                                        ? "Will not renew"
                                        : activeSubscription
                                            ? "Renews automatically"
                                            : "Premium access enabled"}
                                </p>
                            </div>
                        </div>

                        {cancellationScheduled ? (
                            <div className="border-t border-amber-100 bg-amber-50/70 px-6 py-5 sm:px-8">
                                <p className="font-bold text-amber-800">
                                    Your subscription is ending.
                                </p>

                                <p className="mt-1 text-sm text-amber-700">
                                    Premium remains available until{" "}
                                    {currentPeriodEnd}. You will not
                                    be charged again.
                                </p>
                            </div>
                        ) : activeSubscription ? (
                            <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Subscription settings
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Cancelling stops future
                                            renewals. Your current paid
                                            access remains available
                                            until {currentPeriodEnd}.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setCancelModalOpen(true)}
                                        className="inline-flex shrink-0 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        Cancel subscription
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </section>
                )}

                {canPurchase && (
                    <section className="mt-6 rounded-[2rem] border border-[#f1e4d2] bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                                Choose your plan
                            </p>

                            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                                Unlock Ignitio Premium
                            </h2>

                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                                Every plan unlocks the same
                                Premium experience. Choose the
                                billing cycle that works best for
                                you.
                            </p>
                        </div>

                        <PremiumPlanCard
                            selectedPlan={selectedPlan}
                            onSelectPlan={setSelectedPlan}
                            disabled={purchaseLoading}
                            showOnboardingNote={false}
                        />

                        <button
                            type="button"
                            onClick={handleSubscribe}
                            disabled={purchaseLoading}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                        >
                            {purchaseLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Starting secure checkout…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Continue with{" "}
                                    {
                                        getClientSubscriptionPlan(
                                            selectedPlan,
                                        )?.name
                                    }
                                </>
                            )}
                        </button>

                        <p className="mt-3 text-center text-xs text-slate-500">
                            Secure recurring payment powered by
                            Razorpay. Cancel future renewals
                            anytime.
                        </p>
                    </section>
                )}
            </div>

            <CancelSubscriptionModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancel}
                isLoading={cancelLoading}
                currentPeriodEnd={currentPeriodEnd}
            />
        </main>
    );
}