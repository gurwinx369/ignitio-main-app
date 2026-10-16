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
import posthog from "posthog-js";
import { getOrCreateOnboardingSessionId } from "@/lib/analytics/onboardingSession";
import { trackOnboardingFriction } from "@/lib/analytics/friction";
import PaywallSkeleton from "./components/PaywallSkeleton";

import { ONBOARDING_ROUTES } from "./constants/routes";
import { getPaywallStatus } from "./services/paywallStatus";
import { createSubscription } from "./services/createSubscription";
import { validateCoupon } from "./services/validateCoupon";
import { verifyPayment } from "./services/verifyPayment";
import { skipPremium } from "./services/skipPremium";
import {
  loadRazorpay,
  openRazorpayCheckout,
} from "./hooks/useRazorpayCheckout";

import PaywallHeader from "./components/PaywallHeader";
import PremiumPlanCard from "./components/PremiumPlanCard";
import PaymentStatus from "./components/PaymentStatus";
import PaymentExplainer from "./components/PaymentExplainer";
import OnboardingShell from "@/features/onboarding/core/components/OnboardingShell";
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
  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_SUBSCRIPTION_PLAN);

  // ── PostHog Step 6 & 7 Tracking ───────────────────────────────────────────
  const paywallEnteredAtRef = useRef(Date.now());
  const paymentEnteredAtRef = useRef(null);
  const hasCompletedPaywallRef = useRef(false);
  const paymentAttemptCountRef = useRef(0);
  const initialPlanRef = useRef(selectedPlan);

  // Track Step 6 (paywall_viewed & onboarding_step_viewed)
  useEffect(() => {
    paywallEnteredAtRef.current = Date.now();
    const sessionId = getOrCreateOnboardingSessionId();

    try {
      posthog.capture("onboarding_step_viewed", {
        step_id: "paywall",
        step_index: 6,
        onboarding_session_id: sessionId,
      });

      posthog.capture("paywall_viewed", {
        onboarding_session_id: sessionId,
        default_tier: initialPlanRef.current,
      });
    } catch {}

    const handleLeave = () => {
      if (!hasCompletedPaywallRef.current) {
        try {
          posthog.capture("onboarding_step_abandoned", {
            step_id: "paywall",
            step_index: 6,
            onboarding_session_id: sessionId,
            time_on_step_ms: Date.now() - paywallEnteredAtRef.current,
          });
        } catch {}
      }
    };

    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
  }, []);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Guard against unmounted state updates
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
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
          setPageError(
            res.message ?? "Unable to load paywall. Please try again.",
          );
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

        setPageError(
          "Your onboarding state is being synchronized. Please refresh and try again.",
        );
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
    if (couponLoading || isPremiumLoading || isSkipping || !user) {
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
        trackOnboardingFriction("paywall", "form_error", {
          field_name: "coupon",
          error_type: result.message ?? "invalid_coupon",
        });
        setCouponError(result.message ?? "This coupon is not valid.");
        return;
      }

      setCouponCode(normalizedCode.toUpperCase());
      setAppliedCoupon(result.coupon);
    } catch (err) {
      console.error("[Paywall] Coupon validation error:", err);

      trackOnboardingFriction("paywall", "form_error", {
        field_name: "coupon",
        error_type: "validation_exception",
      });

      if (isMounted.current) {
        setCouponError("Could not validate the coupon. Please try again.");
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

    paymentAttemptCountRef.current += 1;
    paymentEnteredAtRef.current = Date.now();
    const sessionId = getOrCreateOnboardingSessionId();

    if (paymentAttemptCountRef.current > 1) {
      trackOnboardingFriction("payment", "payment_retry", {
        attempt_count: paymentAttemptCountRef.current,
      });
    }

    try {
      hasCompletedPaywallRef.current = true;
      posthog.capture("onboarding_step_completed", {
        step_id: "paywall",
        step_index: 6,
        onboarding_session_id: sessionId,
        time_on_step_ms: Date.now() - paywallEnteredAtRef.current,
      });

      posthog.capture("onboarding_step_viewed", {
        step_id: "payment",
        step_index: 7,
        onboarding_session_id: sessionId,
        tier: selectedPlan,
      });

      posthog.capture("payment_attempted", {
        onboarding_session_id: sessionId,
        tier: selectedPlan,
        attempt_count: paymentAttemptCountRef.current,
        has_coupon: !!appliedCoupon,
      });
    } catch {}

    try {
      // 1. Get a fresh token.
      const idToken = await user.getIdToken();

      // 2. Load the Razorpay script (singleton-safe, no duplicate tags).
      await loadRazorpay();

      // 3. Create the Razorpay subscription server-side.
      const createRes = await createSubscription({
        idToken,
        plan: selectedPlan,
        couponCode: appliedCoupon ? couponCode : undefined,
      });

      if (!createRes.razorpaySubscriptionId) {
        // 409 with existingStatus means an active/pending subscription already exists.
        // Reconcile via the status endpoint rather than showing a generic error.
        if (createRes.existingStatus === "active") {
          const statusRes = await getPaywallStatus(idToken);
          if (
            statusRes.success &&
            PAYWALL_FORWARD_STEPS.has(statusRes.nextStep)
          ) {
            const nextRoute = ONBOARDING_ROUTES[statusRes.nextStep];

            if (nextRoute) {
              router.replace(nextRoute);
              return;
            }
          }
        }

        if (!isMounted.current) return;
        setStatusVariant("error");
        setStatusMessage(
          createRes.message ?? "Could not start checkout. Please try again.",
        );
        setIsPremiumLoading(false);
        return;
      }

      const { razorpaySubscriptionId, keyId } = createRes;
      const selectedPlanConfig = getClientSubscriptionPlan(selectedPlan);

      // 4. Open Razorpay Checkout.
      // Premium is NOT granted here — only after server-side verification.
      openRazorpayCheckout({
        keyId,
        subscriptionId: razorpaySubscriptionId,
        name: "Ignitio",
        description:
          selectedPlanConfig?.checkoutDescription ?? "Ignitio Premium",
        onSuccess: async ({
          razorpayPaymentId,
          razorpaySubscriptionId: rzpSubId,
          razorpaySignature,
        }) => {
          // 5. Verify server-side — never trust client callback alone.
          try {
            const freshToken = await user.getIdToken();
            const verifyRes = await verifyPayment(
              {
                razorpayPaymentId,
                razorpaySubscriptionId: rzpSubId,
                razorpaySignature,
              },
              freshToken,
            );

            if (!isMounted.current) return;

            if (verifyRes.success) {
              try {
                posthog.capture("payment_succeeded", {
                  onboarding_session_id: sessionId,
                  tier: selectedPlan,
                  payment_id: razorpayPaymentId,
                  subscription_id: rzpSubId,
                });

                posthog.capture("onboarding_step_completed", {
                  step_id: "payment",
                  step_index: 7,
                  onboarding_session_id: sessionId,
                  time_on_step_ms: paymentEnteredAtRef.current
                    ? Date.now() - paymentEnteredAtRef.current
                    : 0,
                });

                posthog.people.set({ pricing_tier: selectedPlan });
              } catch {}

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
              const statusRes = await getPaywallStatus(freshToken);

              if (
                statusRes.success &&
                PAYWALL_FORWARD_STEPS.has(statusRes.nextStep)
              ) {
                const nextRoute = ONBOARDING_ROUTES[statusRes.nextStep];

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
              try {
                posthog.capture("payment_failed", {
                  onboarding_session_id: sessionId,
                  tier: selectedPlan,
                  failure_reason: "verification_failed",
                });
              } catch {}

              setStatusVariant("error");
              setStatusMessage(
                verifyRes.message ??
                  "Payment verification failed. Please contact support.",
              );
              setIsPremiumLoading(false);
            }
          } catch (err) {
            console.error("[Paywall] Verification error:", err);

            try {
              posthog.capture("payment_failed", {
                onboarding_session_id: sessionId,
                tier: selectedPlan,
                failure_reason: "network_error",
              });

              posthog.captureException(err, {
                step_id: "payment",
                onboarding_session_id: sessionId,
                api_endpoint: "/api/v2/payment/verify",
              });
            } catch {}

            if (isMounted.current) {
              setStatusVariant("error");
              setStatusMessage(
                "Verification failed. Please contact support if your payment was charged.",
              );
              setIsPremiumLoading(false);
            }
          }
        },

        onDismiss: () => {
          // User closed the modal intentionally — not a payment error.
          try {
            posthog.capture("checkout_abandoned", {
              onboarding_session_id: sessionId,
              tier: selectedPlan,
            });
          } catch {}

          if (!isMounted.current) return;
          setStatusVariant("dismissed");
          setStatusMessage(null);
          setIsPremiumLoading(false);
        },
      });
    } catch (err) {
      console.error("[Paywall] Premium checkout error:", err);

      try {
        posthog.capture("payment_failed", {
          onboarding_session_id: sessionId,
          tier: selectedPlan,
          failure_reason: "checkout_init_error",
        });
      } catch {}

      if (isMounted.current) {
        setStatusVariant("error");
        setStatusMessage(
          err.message?.includes("script")
            ? "Could not load the payment provider. Please check your connection and try again."
            : "Something went wrong. Please try again.",
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

    hasCompletedPaywallRef.current = true;
    try {
      // paywall_skipped is a distinct event from onboarding_step_completed so
      // PostHog funnels can separate paying users from users who chose free tier.
      posthog.capture("paywall_skipped", {
        onboarding_session_id: getOrCreateOnboardingSessionId(),
        time_on_paywall_ms: Date.now() - paywallEnteredAtRef.current,
      });
    } catch {}

    try {
      const idToken = await user.getIdToken();
      const res = await skipPremium(idToken);

      if (!isMounted.current) return;

      if (res.success) {
        const nextRoute = PAYWALL_FORWARD_STEPS.has(res.nextStep)
          ? ONBOARDING_ROUTES[res.nextStep]
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
        setStatusMessage(
          res.message ?? "Could not continue. Please try again.",
        );
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
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Could not load Paywall
          </h2>
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
                className="btn-push w-full bg-[#00A9FF] border-[#004B74] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:bg-[#0096e6]"
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
                className="btn-push-sm text-[#001D32] bg-white border-[#ddd8d0] hover:bg-[#ede8e1] w-10 h-10 flex items-center justify-center rounded-xl font-bold"
                aria-label="Back to explainer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>

            <PaywallHeader />

            <PremiumPlanCard
              selectedPlan={selectedPlan}
              onSelectPlan={(plan) => {
                setSelectedPlan(plan);
                setAppliedCoupon(null);
                setCouponError(null);
                try {
                  posthog.capture("pricing_tier_selected", {
                    onboarding_session_id: getOrCreateOnboardingSessionId(),
                    tier: plan,
                  });
                } catch {}
              }}
              onContinue={handlePremium}
              disabled={isPremiumLoading || isSkipping}
              couponCode={couponCode}
              onCouponChange={(val) => {
                setCouponCode(val);
                setAppliedCoupon(null);
                setCouponError(null);
              }}
              onApplyCoupon={handleApplyCoupon}
              couponLoading={couponLoading}
              appliedCoupon={appliedCoupon}
              couponError={couponError}
              secondaryAction={
                <button
                  id="paywall-skip-btn"
                  onClick={handleSkip}
                  disabled={isPremiumLoading || isSkipping}
                  className="text-[13px] text-slate-500 hover:text-[#001D32] underline underline-offset-4 decoration-slate-300 hover:decoration-[#001D32] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSkipping
                    ? "Continuing…"
                    : "Continue with Foundation (free, limited access)"}
                </button>
              }
            />

            <PaymentStatus variant={statusVariant} message={statusMessage} />
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
