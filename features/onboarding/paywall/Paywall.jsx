// features/onboarding/paywall/Paywall.jsx
//
// Controller for the V4 Paywall phase.
//
// Responsibilities:
//   • On mount: GET /api/v2/onboarding/paywall/status to reconcile trusted state.
//   • Route guard: redirect if the user is not at "paywall".
//   • Premium path: create subscription → load Razorpay → verify payment → navigate.
//   • Foundation path: skip → navigate.
//   • Checkout dismiss: neutral "closed" state, not an error.
//   • Error recovery: inline message, actions restored, retry allowed.
//
// Security:
//   • Never grants Premium from the client callback alone.
//   • Verification is server-side via POST /api/v2/payment/verify.
//   • UID is never sent from the client.
//   • Duplicate "Unlock Premium" clicks are blocked while loading.
//
// Phase 3 boundary:
//   • Navigates to /home/onboarding/role-selection after both paths.
//   • Does NOT assign a role, collect schedule, create roadmap, or complete onboarding.

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/context/AuthContext";
import PaywallSkeleton from "./components/PaywallSkeleton";

import { ONBOARDING_ROUTES } from "./constants/routes";
import { getPaywallStatus } from "./services/paywallStatus";
import { createSubscription } from "./services/createSubscription";
import { validateCoupon } from "./services/validateCoupon";
import { verifyPayment } from "./services/verifyPayment";
import { skipPremium } from "./services/skipPremium";
import { loadRazorpay, openRazorpayCheckout } from "./hooks/useRazorpayCheckout";

import PaywallHeader from "./components/PaywallHeader";
import PremiumPlanCard from "./components/PremiumPlanCard";
import PaywallActions from "./components/PaywallActions";
import PaymentStatus from "./components/PaymentStatus";
import PaymentExplainer from "./components/PaymentExplainer";
import OnboardingShell from "../components/OnboardingShell";
import {
  DEFAULT_SUBSCRIPTION_PLAN,
  getClientSubscriptionPlan,
} from "./constants/plans";

const PAYWALL_FORWARD_STEPS = new Set([
  "role_selection",
  "activation_pending",
  "completed",
]);

export default function Paywall() {
  const router = useRouter();
  const { user } = useAuth();

  // Page-level state
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // UI Flow state
  const [paywallStep, setPaywallStep] = useState("explainer"); // "explainer" | "plans"

  // Checkout state
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [statusVariant, setStatusVariant] = useState("idle"); // "idle"|"dismissed"|"error"|"success"
  const [statusMessage, setStatusMessage] = useState(null);
  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState(
    DEFAULT_SUBSCRIPTION_PLAN,
  );

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Guard against unmounted state updates
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── On mount: reconcile server state ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const reconcile = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await getPaywallStatus(idToken);

        if (!isMounted.current) return;

        if (!res.success) {
          setPageError(res.message ?? "Unable to load paywall. Please try again.");
          setPageLoading(false);
          return;
        }

        const nextStep = res.nextStep;

        if (nextStep === "paywall") {
          setPageLoading(false);
          return;
        }

        /*
         * Only redirect forward from Paywall.
         *
         * Earlier-state routing is owned by ProtectedRoute.
         * Redirecting Paywall back to Results here can race
         * with Results redirecting forward to Paywall.
         */
        if (PAYWALL_FORWARD_STEPS.has(nextStep)) {
          const route = ONBOARDING_ROUTES[nextStep];

          if (!route) {
            setPageError("Unsupported onboarding destination.");
            setPageLoading(false);
            return;
          }

          router.replace(route);
          return;
        }

        setPageError("Your onboarding state is being synchronized. Please refresh and try again.");
        setPageLoading(false);
      } catch (err) {
        console.error("[Paywall] Reconciliation error:", err);
        if (isMounted.current) {
          setPageError("Unable to load paywall. Please try again.");
          setPageLoading(false);
        }
      }
    };

    reconcile();
  }, [user, router]);


  // ── Coupon validation ────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (
      couponLoading ||
      isPremiumLoading ||
      isSkipping ||
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
    } catch (err) {
      console.error(
        "[Paywall] Coupon validation error:",
        err,
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

  // ── Premium checkout flow ────────────────────────────────────────────────────
  const handlePremium = async () => {
    if (isPremiumLoading || isSkipping || !user) return;

    setIsPremiumLoading(true);
    setStatusVariant("idle");
    setStatusMessage(null);

    try {
      // 1. Get a fresh token.
      const idToken = await user.getIdToken();

      // 2. Load the Razorpay script (singleton-safe, no duplicate tags).
      await loadRazorpay();

      // 3. Create the Razorpay subscription server-side.
      const createRes =
        await createSubscription({
          idToken,
          plan: selectedPlan,
          couponCode: appliedCoupon
            ? couponCode
            : undefined,
        });

      if (!createRes.razorpaySubscriptionId) {
        // 409 with existingStatus means an active/pending subscription already exists.
        // Reconcile via the status endpoint rather than showing a generic error.
        if (createRes.existingStatus === "active") {
          const statusRes = await getPaywallStatus(idToken);
          if (
            statusRes.success &&
            PAYWALL_FORWARD_STEPS.has(
              statusRes.nextStep,
            )
          ) {
            const nextRoute =
              ONBOARDING_ROUTES[
              statusRes.nextStep
              ];

            if (nextRoute) {
              router.replace(nextRoute);
              return;
            }
          }
        }

        if (!isMounted.current) return;
        setStatusVariant("error");
        setStatusMessage(createRes.message ?? "Could not start checkout. Please try again.");
        setIsPremiumLoading(false);
        return;
      }

      const { razorpaySubscriptionId, keyId } = createRes;
      const selectedPlanConfig =
        getClientSubscriptionPlan(
          selectedPlan,
        );

      // 4. Open Razorpay Checkout.
      // Premium is NOT granted here — only after server-side verification.
      openRazorpayCheckout({
        keyId,
        subscriptionId: razorpaySubscriptionId,
        name: "Ignitio",
        description:
          selectedPlanConfig?.checkoutDescription ??
          "Ignitio Premium",
        onSuccess: async ({ razorpayPaymentId, razorpaySubscriptionId: rzpSubId, razorpaySignature }) => {
          // 5. Verify server-side — never trust client callback alone.
          try {
            const freshToken = await user.getIdToken();
            const verifyRes = await verifyPayment(
              { razorpayPaymentId, razorpaySubscriptionId: rzpSubId, razorpaySignature },
              freshToken,
            );

            if (!isMounted.current) return;

            if (verifyRes.success) {
              setStatusVariant("success");
              setStatusMessage(
                "Payment confirmed. Preparing your Premium access…",
              );

              /*
               * Payment verification owns entitlement activation.
               * Onboarding routing is resolved separately from the
               * trusted paywall-status endpoint.
               *
               * /payment/verify intentionally does not own or expose
               * the frontend routing contract.
               */
              const statusRes =
                await getPaywallStatus(freshToken);

              if (
                statusRes.success &&
                PAYWALL_FORWARD_STEPS.has(
                  statusRes.nextStep,
                )
              ) {
                const nextRoute =
                  ONBOARDING_ROUTES[
                  statusRes.nextStep
                  ];

                if (nextRoute) {
                  router.replace(nextRoute);
                  return;
                }
              }

              /*
               * Payment has already been verified successfully.
               * Never ask the user to purchase again just because
               * routing reconciliation failed.
               */
              setStatusVariant("error");
              setStatusMessage(
                "Your payment was confirmed, but we could not continue to the next onboarding step. Please refresh the page.",
              );
              setIsPremiumLoading(false);
            } else {
              setStatusVariant("error");
              setStatusMessage(verifyRes.message ?? "Payment verification failed. Please contact support.");
              setIsPremiumLoading(false);
            }
          } catch (err) {
            console.error("[Paywall] Verification error:", err);
            if (isMounted.current) {
              setStatusVariant("error");
              setStatusMessage("Verification failed. Please contact support if your payment was charged.");
              setIsPremiumLoading(false);
            }
          }
        },

        onDismiss: () => {
          // User closed the modal without paying. Neutral — not an error.
          if (!isMounted.current) return;
          setStatusVariant("dismissed");
          setStatusMessage(null);
          setIsPremiumLoading(false);
        },
      });

    } catch (err) {
      console.error("[Paywall] Premium checkout error:", err);
      if (isMounted.current) {
        setStatusVariant("error");
        setStatusMessage(
          err.message?.includes("script")
            ? "Could not load the payment provider. Please check your connection and try again."
            : "Something went wrong. Please try again."
        );
        setIsPremiumLoading(false);
      }
    }
  };

  // ── Foundation skip flow ─────────────────────────────────────────────────────
  const handleSkip = async () => {
    if (isSkipping || isPremiumLoading || !user) return;

    setIsSkipping(true);
    setStatusVariant("idle");
    setStatusMessage(null);

    try {
      const idToken = await user.getIdToken();
      const res = await skipPremium(idToken);

      if (!isMounted.current) return;

      if (res.success) {
        const nextRoute =
          PAYWALL_FORWARD_STEPS.has(
            res.nextStep,
          )
            ? ONBOARDING_ROUTES[
            res.nextStep
            ]
            : null;

        if (!nextRoute) {
          setStatusVariant("error");
          setStatusMessage(
            "The next onboarding step could not be resolved. Please refresh and try again.",
          );
          setIsSkipping(false);
          return;
        }

        router.replace(nextRoute);
      } else {
        setStatusVariant("error");
        setStatusMessage(res.message ?? "Could not continue. Please try again.");
        setIsSkipping(false);
      }
    } catch (err) {
      console.error("[Paywall] Skip error:", err);
      if (isMounted.current) {
        setStatusVariant("error");
        setStatusMessage("Something went wrong. Please try again.");
        setIsSkipping(false);
      }
    }
  };

  // ── Render: page loading ─────────────────────────────────────────────────────
  if (pageLoading) {
    return <PaywallSkeleton />;
  }

  // ── Render: page error ───────────────────────────────────────────────────────
  if (pageError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffaf3] p-6">
        <div className="bg-white border border-slate-200 text-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-red-600">Could not load Paywall</h2>
          <p className="text-slate-600 mb-6">{pageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render: paywall ───────────────────────────────────────────────────────────
  return (
    <OnboardingShell step={3}>
      <div className="w-full">
        {paywallStep === "explainer" ? (
          <div className="w-full flex flex-col items-center">
            <PaymentExplainer />
            <div className="mt-8 w-full max-w-sm px-4">
              <button
                type="button"
                onClick={() => setPaywallStep("plans")}
                className="w-full bg-[#00A9FF] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:bg-[#0096e6] active:translate-y-1"
                style={{ boxShadow: "0 4px 0 #004B74" }}
              >
                CHOOSE MY PLAN
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="mb-6 px-4">
              <button
                onClick={() => setPaywallStep("explainer")}
                className="text-[#001D32] hover:bg-slate-200/50 w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors"
                aria-label="Back to explainer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            </div>

            <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10">
              <PaywallHeader />

              <PremiumPlanCard
                selectedPlan={selectedPlan}
                onSelectPlan={(plan) => {
                  setSelectedPlan(plan);
                  setAppliedCoupon(null);
                  setCouponError(null);
                }}
                disabled={isPremiumLoading || isSkipping}
              />

              <div className="mt-6 rounded-2xl border border-[#FFDCBC] bg-[#fffaf3] p-4">
                <div className="mb-3">
                  <p className="text-sm font-bold text-[#001D32]">
                    Have a coupon code?
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter a creator or promotional code before checkout.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value.toUpperCase());
                      setAppliedCoupon(null);
                      setCouponError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="e.g. HARRY20"
                    maxLength={50}
                    disabled={
                      couponLoading ||
                      isPremiumLoading ||
                      isSkipping
                    }
                    aria-label="Coupon code"
                    className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#001D32] outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#00A9FF] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                      couponLoading ||
                      isPremiumLoading ||
                      isSkipping ||
                      !couponCode.trim()
                    }
                    className="rounded-xl bg-[#001D32] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-[#00304d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponLoading ? "CHECKING..." : "APPLY"}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-bold text-green-700">
                      {appliedCoupon.code} applied
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      Your promotional offer will be applied at checkout.
                    </p>
                  </div>
                )}

                {couponError && (
                  <p
                    role="alert"
                    className="mt-3 text-xs font-semibold text-red-600"
                  >
                    {couponError}
                  </p>
                )}
              </div>

              <PaywallActions
                isPremiumLoading={isPremiumLoading}
                isSkipping={isSkipping}
                onPremium={handlePremium}
                onSkip={handleSkip}
              />

              <PaymentStatus
                variant={statusVariant}
                message={statusMessage}
              />
            </div>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
