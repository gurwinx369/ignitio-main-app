"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Loader from "@/layout/Loader";
import { usePostHog } from 'posthog-js/react';
import { getOrCreateOnboardingSessionId, recordSignupTimestamp } from "@/lib/analytics/onboardingSession";
import { trackOnboardingFriction } from "@/lib/analytics/friction";
import { getOnboardingRoute } from '@/lib/onboarding/onboarding-route';
import { syncOnboardingFromLocalStorage } from '@/lib/onboarding/sync-localstorage';
import { deriveScheduleFromBrowser } from '@/lib/onboarding/schedule-periods';
import KiboBody from "@/features/kyle/pet/KiboBody";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

async function ensureUserProfile(firebaseUser, initializeLegalConsent = false) {
  const idToken = await firebaseUser.getIdToken();

  const response = await fetch("/api/v2/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      email: firebaseUser.email,
      initializeLegalConsent,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Failed to provision user profile"
    );
  }

  return data.user;
}


const DARK_CSS = `
/* ── Background: deep indigo-black ───────────────────────────── */
.sf-scene {
  background: #0a0914;
}

/* ── Ambient blobs (fixed, pointer-events-none, zero scroll cost) */
.sf-blob-1 {
  position: fixed;
  width: 560px;
  height: 360px;
  top: -80px;
  right: -140px;
  background: radial-gradient(ellipse at center, rgba(56,189,248,0.11) 0%, transparent 68%);
  pointer-events: none;
  border-radius: 9999px;
  z-index: 0;
}
.sf-blob-2 {
  position: fixed;
  width: 480px;
  height: 420px;
  bottom: -100px;
  left: -120px;
  background: radial-gradient(ellipse at center, rgba(129,140,248,0.1) 0%, transparent 68%);
  pointer-events: none;
  border-radius: 9999px;
  z-index: 0;
}

/* ── Kibo: gentle float ───────────────────────────────────────── */
@keyframes sf-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
.sf-kibo-float { animation: sf-float 3.4s ease-in-out infinite; }

/* ── Bubble: pops in with spring overshoot ───────────────────── */
@keyframes sf-bubble {
  0%   { opacity: 0; transform: scale(0.85) translateX(8px); }
  65%  { opacity: 1; transform: scale(1.03) translateX(-2px); }
  100% { opacity: 1; transform: scale(1) translateX(0); }
}
.sf-bubble { animation: sf-bubble 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: 200ms; }
.sf-bubble-tail::before {
  content: '';
  position: absolute;
  left: -10px; top: 20px;
  border: 9px solid transparent;
  border-right-color: rgba(255,249,245,0.1);
  border-left: 0;
}

/* ── Form card fade-in ────────────────────────────────────────── */
@keyframes sf-card-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sf-card-in {
  animation: sf-card-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 380ms;
}

/* ── Input glow ring on focus ─────────────────────────────────── */
.sf-input {
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}
.sf-input:focus {
  box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
}

/* ── CTA press feedback ───────────────────────────────────────── */
.sf-cta {
  transition: transform 80ms ease-out, box-shadow 80ms ease-out, filter 180ms ease;
  will-change: transform;
}
.sf-cta:active:not(:disabled) {
  transform: translateY(3px) scale(0.985);
  box-shadow: 0 0 0 #005fa3, 0 4px 20px rgba(56,189,248,0.18) !important;
}
@media (hover: hover) {
  .sf-cta:hover:not(:disabled) { filter: brightness(1.09); }
}

/* ── Google btn hover ────────────────────────────────────────── */
.sf-google {
  transition: background 140ms ease, border-color 140ms ease, transform 80ms ease;
}
.sf-google:active:not(:disabled) {
  transform: scale(0.985);
}

/* ── Reduced-motion ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .sf-kibo-float { animation: none; }
  .sf-bubble { animation: none; opacity: 1; transform: none; }
  .sf-card-in { animation: none; opacity: 1; transform: none; }
  .sf-cta, .sf-google { transition: none; }
}
`;

export default function SignupForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");
  const [activationError, setActivationError] = useState(false);
  const isHandlingAuthActionRef = useRef(false);
  const isResumingRef = useRef(false);
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams?.get("from") === "freepath";
  const kiboWrapperRef = useRef(null);
  const kiboEyesRef = useRef(null);
  useKiboEyeTracking({ eyesRef: kiboEyesRef, wrapperRef: kiboWrapperRef, active: isFromOnboarding, trackFullPage: true });

  // ── PostHog Step 8 Tracking ───────────────────────────────────────────────
  const signupEnteredAtRef = useRef(Date.now());
  const hasCompletedSignupRef = useRef(false);

  useEffect(() => {
    signupEnteredAtRef.current = Date.now();
    const sessionId = getOrCreateOnboardingSessionId();
    try {
      posthog?.capture("onboarding_step_viewed", {
        step_id: "signup",
        step_index: 8,
        onboarding_session_id: sessionId,
      });
    } catch {}

    const handleLeave = () => {
      if (!hasCompletedSignupRef.current) {
        try {
          posthog?.capture("onboarding_step_abandoned", {
            step_id: "signup",
            step_index: 8,
            onboarding_session_id: sessionId,
            time_on_step_ms: Date.now() - signupEnteredAtRef.current,
          });
        } catch {}
      }
    };

    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
  }, [posthog]);

  const trackSignupConversion = (firebaseUser, method) => {
    recordSignupTimestamp();
    const sessionId = getOrCreateOnboardingSessionId();
    const hasDiagnostic = typeof window !== "undefined" && (
      !!localStorage.getItem("ignitio:preview_payload") ||
      !!localStorage.getItem("genai_preview_assessment")
    );

    try {
      posthog?.identify(firebaseUser.uid, {
        email: firebaseUser.email,
        signup_method: method,
      });

      posthog?.people?.set({
        onboarding_session_id: sessionId,
        signup_method: method,
      });

      posthog?.capture("user_signed_up", {
        signup_method: method,
        onboarding_session_id: sessionId,
        diagnostic_completed: hasDiagnostic,
      });

      hasCompletedSignupRef.current = true;
      posthog?.capture("onboarding_step_completed", {
        step_id: "signup",
        step_index: 8,
        onboarding_session_id: sessionId,
        signup_method: method,
        time_on_step_ms: Date.now() - signupEnteredAtRef.current,
      });
    } catch (e) {
      console.warn("PostHog user_signed_up tracking error:", e);
    }
  };

  const { signup, loginWithGoogle, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isHandlingAuthActionRef.current && !isResumingRef.current) {
      isResumingRef.current = true;
      setLoading(true);
      ensureUserProfile(user)
        .then((profile) => {
          const searchRedirect =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("redirect")
              : null;

          if (searchRedirect && searchRedirect.startsWith("/")) {
            router.replace(searchRedirect);
          } else {
            router.replace(getOnboardingRoute(profile));
          }
        })
        .catch(() => {
          // Profile provision failed — show error, do not navigate
          isResumingRef.current = false;
          setLoading(false);
          setError("Could not load your profile. Please try again.");
        });
    }
  }, [user, router]);

  if (user && !isHandlingAuthActionRef.current && !isResumingRef.current) {
    return <Loader />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password.length < 6) {
      trackOnboardingFriction("signup", "form_error", {
        field_name: "password",
        error_type: "length_under_6",
      });
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      isHandlingAuthActionRef.current = true;
      const result = await signup(form.email, form.password);

      if (result.success) {
        await executeOnboardingBootstrap(result, "email");
      } else {
        isHandlingAuthActionRef.current = false;
        setError(result.error || "Check your email or password.");
        setLoading(false);
      }
    } catch {
      isHandlingAuthActionRef.current = false;
      setError("Check your email or password.");
      setLoading(false);
    }
  };

  const executeOnboardingBootstrap = async (result, method) => {
    trackSignupConversion(result.user, method);

    try {
      const idToken = await result.user.getIdToken();

      // Check for preview/diagnostic redirect
      const isGenAiPreview =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("from") === "genai_preview";

      const hasPreview =
        typeof window !== "undefined" &&
        !!localStorage.getItem("ignitio:preview_payload");

      // Also detect users who came from the genai diagnostic results screen:
      // handleContinue sends them to /auth/signup?redirect=/onboarding/results
      // and their assessment data lives in genai_preview_assessment, not ignitio:preview_payload.
      const hasGenAiAssessment =
        typeof window !== "undefined" &&
        !!localStorage.getItem("genai_preview_assessment");

      if (result.authMode === "new_signup" && (isGenAiPreview || hasPreview || hasGenAiAssessment)) {
        await syncOnboardingFromLocalStorage(idToken).catch(() => {});
        router.replace(
          isGenAiPreview
            ? "/onboarding/role-selection?from=genai_preview"
            : "/onboarding/paywall"
        );
        return;
      }

      // Read pre-auth onboarding data from localStorage
      const onboardingResult = typeof window !== "undefined"
        ? (() => {
            try { return JSON.parse(localStorage.getItem("ignitio:onboarding_result")); } catch { return null; }
          })()
        : null;

      const genaiEntry = typeof window !== "undefined"
        ? (() => {
            try { return JSON.parse(localStorage.getItem("ignitio:genai_entry")); } catch { return null; }
          })()
        : null;

      const rawGoal = onboardingResult?.goal ?? genaiEntry?.goal ?? null;
      const GOAL_MAP = {
        internship: "internship_1_3_months",
        job: "internship_1_3_months",
        project: "build_product",
        build: "build_product",
        dsa: "curiosity_general",
        gen_ai: "curiosity_general",
        learn: "curiosity_general",
        unsure: "curiosity_general",
      };
      const mappedGoal = rawGoal ? (GOAL_MAP[rawGoal] || "curiosity_general") : "curiosity_general";

      const derived = deriveScheduleFromBrowser();

      const isDsaGoal = rawGoal === "dsa" || onboardingResult?.goal === "dsa";

      const bootstrapPayload = {
        email: result.user.email,
        goal: mappedGoal,
        ...(isDsaGoal ? { activeRoadmapSlug: "dsa" } : {}),
        freePath: onboardingResult?.path
          ? {
              year: onboardingResult.year || "1st",
              pathTaken: onboardingResult.path,
              roadmap: isDsaGoal ? ["dsa"] : (onboardingResult.roadmap || []),
              diagnosticResults: onboardingResult.diagnosticResults || [],
              notificationAllowed: onboardingResult.notificationAllowed ?? false,
            }
          : null,
        schedule: {
          timezone: derived.timezone,
          windows: [{ period: derived.period, startTime: derived.startTime, endTime: derived.endTime }],
        },
        role: "student",
        initializeLegalConsent: true,
      };

      // Call single consolidated bootstrap endpoint
      const response = await fetch("/api/v2/onboarding/bootstrap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(bootstrapPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize account");
      }

      const data = await response.json();

      // Clean up localStorage onboarding keys
      try {
        localStorage.removeItem("ignitio:onboarding_result");
        localStorage.removeItem("ignitio:free_onboarding_v1");
        localStorage.removeItem("ignitio:genai_entry");
        localStorage.removeItem("genai_preview_assessment");
      } catch {}

      const searchRedirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;

      if (searchRedirect && searchRedirect.startsWith("/")) {
        window.location.href = searchRedirect;
        return;
      }

      if (data.existing && data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }

      window.location.href =
        localStorage.getItem("ignitio:streak_phase") === "anticipated"
          ? "/onboarding/streak"
          : (data.redirectTo || "/home");
    } catch {
      isHandlingAuthActionRef.current = false;
      setError("Check your email or password.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      isHandlingAuthActionRef.current = true;
      const result = await loginWithGoogle();

      if (result.success) {
        await executeOnboardingBootstrap(result, "google");
      } else if (result.error === null) {
        // Cancelled popup
        isHandlingAuthActionRef.current = false;
        setLoading(false);
        return;
      } else {
        isHandlingAuthActionRef.current = false;
        setError(result.error || "Check your email or password.");
        setLoading(false);
      }
    } catch {
      isHandlingAuthActionRef.current = false;
      setError("Check your email or password.");
      setLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && form.email && form.password) {
      handleSubmit(e);
    }
  };

  if (activationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{ backgroundColor: isFromOnboarding ? "#0a0914" : "#F0CAA8" }}>
        <div className="w-full max-w-md text-center rounded-3xl p-8 shadow-lg"
             style={{ backgroundColor: isFromOnboarding ? "rgba(255,255,255,0.06)" : "#FFF9EB", border: isFromOnboarding ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: isFromOnboarding ? "rgba(255,255,255,0.9)" : "#1a1a2e" }}>
            Setup hit a snag
          </h2>
          <p className="text-base mb-8" style={{ color: isFromOnboarding ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
            We couldn&apos;t finish setting up your account. Please try again.
          </p>
          <button
            onClick={() => {
              setActivationError(false);
              setLoading(false);
            }}
            className="w-full py-4 rounded-2xl text-white text-lg font-semibold uppercase tracking-wide"
            style={{ backgroundColor: "#00A9FF", boxShadow: "0 4px 0 #0088CC" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Dark onboarding variant (from=freepath) ─────────────────────────────────
  if (isFromOnboarding) {
    return (
      <>
        <style>{DARK_CSS}</style>

        {/* ── Page wrapper ───────────────────────────────────────────── */}
        <div
          className="sf-scene relative min-h-[100dvh] flex items-center justify-center p-5 overflow-hidden"
        >
          {/* Static ambient blobs — fixed, zero scroll cost */}
          <div className="sf-blob-1" aria-hidden="true" />
          <div className="sf-blob-2" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">

            {/* ── Kibo + Bubble row ─────────────────────────────────── */}
            <div className="flex items-start gap-4">
              <div
                ref={kiboWrapperRef}
                className="sf-kibo-float flex-shrink-0"
                style={{
                  width: 72,
                  height: 72,
                  filter: "drop-shadow(0 0 18px rgba(56,189,248,0.38))",
                }}
                aria-label="Kibo"
              >
                <KiboBody
                  visualState="idle"
                  petSize={72}
                  wrapperRef={kiboWrapperRef}
                  eyesRef={kiboEyesRef}
                />
              </div>

              {/* Speech bubble */}
              <div className="sf-bubble sf-bubble-tail relative flex-1 min-w-0 pt-1">
                <div
                  className="relative rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{
                    background: "rgba(255,249,245,0.07)",
                    border: "1px solid rgba(255,249,245,0.13)",
                    boxShadow: "inset 0 1px 0 rgba(255,249,245,0.08)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <p
                    className="text-[14px] font-semibold leading-snug"
                    style={{ color: "rgba(255,249,245,0.92)" }}
                  >
                    Your roadmap is ready — let&apos;s lock it in.
                  </p>
                  <p
                    className="text-[12px] mt-1 leading-relaxed"
                    style={{ color: "rgba(255,249,245,0.42)" }}
                  >
                    Create your free account to start learning.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Form card ────────────────────────────────────────── */}
            <div
              className="sf-card-in rounded-3xl p-6"
              style={{
                background: "rgba(255,249,245,0.06)",
                border: "1px solid rgba(255,249,245,0.12)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,249,245,0.09), 0 24px 48px -16px rgba(0,0,0,0.55)",
                backdropFilter: "blur(20px)",
              }}
            >
              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(239,68,68,0.14)",
                    border: "1px solid rgba(239,68,68,0.28)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-5">
                  <label
                    htmlFor="sf-email"
                    className="block mb-2 text-[13px] font-semibold tracking-wide"
                    style={{ color: "rgba(255,249,245,0.55)" }}
                  >
                    Email
                  </label>
                  <input
                    id="sf-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    onKeyDown={handleKeyPress}
                    placeholder="you@ignitio.cloud"
                    className="sf-input w-full px-4 py-3.5 rounded-2xl text-base outline-none"
                    style={{
                      background: focusedInput === "email"
                        ? "rgba(56,189,248,0.08)"
                        : "rgba(255,249,245,0.06)",
                      border: focusedInput === "email"
                        ? "2px solid #38bdf8"
                        : "2px solid rgba(255,249,245,0.1)",
                      color: "rgba(255,249,245,0.92)",
                    }}
                  />
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label
                    htmlFor="sf-password"
                    className="block mb-2 text-[13px] font-semibold tracking-wide"
                    style={{ color: "rgba(255,249,245,0.55)" }}
                  >
                    Password
                  </label>
                  <input
                    id="sf-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    onKeyDown={handleKeyPress}
                    placeholder="min. 6 characters"
                    className="sf-input w-full px-4 py-3.5 rounded-2xl text-base outline-none"
                    style={{
                      background: focusedInput === "password"
                        ? "rgba(56,189,248,0.08)"
                        : "rgba(255,249,245,0.06)",
                      border: focusedInput === "password"
                        ? "2px solid #38bdf8"
                        : "2px solid rgba(255,249,245,0.1)",
                      color: "rgba(255,249,245,0.92)",
                    }}
                  />
                </div>

                {/* CTA — Create Account */}
                <button
                  type="submit"
                  disabled={loading || !form.email || !form.password}
                  className="sf-cta w-full py-4 rounded-2xl text-white font-extrabold text-[15px] uppercase tracking-widest disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0914]"
                  style={{
                    background: loading || !form.email || !form.password
                      ? "linear-gradient(135deg, #1e7fa8, #155e7a)"
                      : "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 55%, #0284c7 100%)",
                    boxShadow: "0 4px 0 #075985, 0 8px 32px rgba(14,165,233,0.28)",
                  }}
                  onMouseDown={(e) => {
                    if (!loading && form.email && form.password) {
                      e.currentTarget.style.transform = "translateY(4px)";
                      e.currentTarget.style.boxShadow = "0 0px 0 #075985, 0 2px 12px rgba(14,165,233,0.18)";
                    }
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 4px 0 #075985, 0 8px 32px rgba(14,165,233,0.28)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 4px 0 #075985, 0 8px 32px rgba(14,165,233,0.28)";
                  }}
                >
                  {loading ? "Creating…" : "Create My Account"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-5">
                <div className="flex-1 h-px" style={{ background: "rgba(255,249,245,0.08)" }} />
                <span className="px-3 text-xs" style={{ color: "rgba(255,249,245,0.28)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,249,245,0.08)" }} />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="sf-google w-full py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-3 disabled:opacity-35"
                style={{
                  background: "rgba(255,249,245,0.05)",
                  border: "1px solid rgba(255,249,245,0.14)",
                  color: "rgba(255,249,245,0.78)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "rgba(255,249,245,0.09)";
                    e.currentTarget.style.borderColor = "rgba(255,249,245,0.22)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,249,245,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,249,245,0.14)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? "Signing up…" : "Continue with Google"}
              </button>


              {/* Legal */}
              <p
                className="mt-4 text-center text-[11px] leading-relaxed"
                style={{ color: "rgba(255,249,245,0.18)" }}
              >
                By continuing, you agree to Ignitio&apos;s{" "}
                <a
                  href="https://ignitio.cloud/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-sky-500/50 underline-offset-4 hover:opacity-80"
                >
                  Terms
                </a>
                {" "}and{" "}
                <a
                  href="https://ignitio.cloud/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-sky-500/50 underline-offset-4 hover:opacity-80"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Light / default variant ──────────────────────────────────────────────────
  return (
    <>

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#F0CAA8" }}
      >
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Left Section - Signup Form */}
            <div className="w-full max-w-md">
              {/* Logo */}
              <h1
                className="text-center mb-8 text-5xl font-bold tracking-tight"
                style={{
                  fontFamily: "var(--font-pixelify)",
                  color: "#1a1a2e",
                }}
              >
                Ignitio
              </h1>

              {/* Card */}
              <div
                className="rounded-3xl p-8 shadow-lg"
                style={{ backgroundColor: "#FFF9EB" }}
              >
                <h2
                  className="text-4xl font-bold mb-8"
                  style={{
                    fontFamily: "var(--font-inter)",
                    color: "#1a1a2e",
                  }}
                >
                  Create your account
                </h2>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="block mb-2 text-lg font-medium"
                      style={{
                        fontFamily: "var(--font-inter)",
                        color: "#1a1a2e",
                      }}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      onKeyDown={handleKeyPress}
                      placeholder="you@ignitio.cloud"
                      className="w-full px-4 py-4 rounded-2xl text-lg transition-all duration-200 outline-none"
                      style={{
                        fontFamily: "var(--font-inter)",
                        backgroundColor: "#E8E3F3",
                        border:
                          focusedInput === "email"
                            ? "2px solid #00A9FF"
                            : "2px solid transparent",
                        color: "#1a1a2e",
                      }}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-lg font-medium"
                      style={{
                        fontFamily: "var(--font-inter)",
                        color: "#1a1a2e",
                      }}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      onKeyDown={handleKeyPress}
                      placeholder="pass123"
                      className="w-full px-4 py-4 rounded-2xl text-lg transition-all duration-200 outline-none"
                      style={{
                        fontFamily: "var(--font-inter)",
                        backgroundColor: "#E8E3F3",
                        border:
                          focusedInput === "password"
                            ? "2px solid #00A9FF"
                            : "2px solid transparent",
                        color: "#1a1a2e",
                      }}
                    />
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={loading || !form.email || !form.password}
                    className="w-full py-4 rounded-2xl text-white text-lg font-semibold uppercase tracking-wide transition-all duration-100 hover:brightness-110 disabled:opacity-50 active:translate-y-1"
                    style={{
                      fontFamily: "var(--font-inter)",
                      backgroundColor: "#00A9FF",
                      boxShadow: "0 4px 0 #0088CC",
                      transform: "translateY(0)",
                    }}
                    onMouseDown={(e) => {
                      if (!loading && form.email && form.password) {
                        e.currentTarget.style.transform = "translateY(4px)";
                        e.currentTarget.style.boxShadow = "0 0px 0 #0088CC";
                      }
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 0 #0088CC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 0 #0088CC";
                    }}
                  >
                    {loading ? "Creating..." : "CREATE ACCOUNT"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span
                    className="px-4 text-gray-400 text-sm"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    or
                  </span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-lg font-medium transition-all duration-100 hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-3"
                  style={{
                    fontFamily: "var(--font-inter)",
                    backgroundColor: "#FCF5EE",
                    color: "#5f6368",
                    border: "2px solid #dadce0",
                    boxShadow: "0 3px 0 #dadce0",
                    transform: "translateY(0)",
                  }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(3px)";
                      e.currentTarget.style.boxShadow = "0 0px 0 #dadce0";
                    }
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 3px 0 #dadce0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 3px 0 #dadce0";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? "Signing up..." : "create account with google"}
                </button>

                {/* Already have an account - Login Link */}
                <div className="mt-6 text-center">
                  <p
                    className="text-base"
                    style={{
                      fontFamily: "var(--font-inter)",
                      color: "#6b7280",
                    }}
                  >
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      onClick={(e) => {
                        if (isNavigating) {
                          e.preventDefault();
                          return;
                        }
                        setIsNavigating(true);
                        posthog?.capture("auth_navigation_clicked", { target: "login" });
                      }}
                      className="font-semibold hover:underline transition-colors duration-200 inline-flex items-center gap-1"
                      style={{
                        fontFamily: "var(--font-inter)",
                        color: "#00A9FF",
                        opacity: isNavigating ? 0.6 : 1,
                        cursor: isNavigating ? "not-allowed" : "pointer"
                      }}
                    >
                      {isNavigating ? "Loading..." : "Login here"}
                    </Link>
                  </p>
                </div>

                {/* Legal Terms & Privacy Disclaimer */}
                <p
                  className="mt-6 text-center text-xs sm:text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-inter)",
                    color: "#6b7280",
                  }}
                >
                  By continuing, you agree to Ignitio&#39;s{" "}
                  <a
                    href="https://ignitio.cloud/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:opacity-80 transition-opacity underline decoration-[#00A9FF] underline-offset-4"
                  >
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://ignitio.cloud/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:opacity-80 transition-opacity underline decoration-[#00A9FF] underline-offset-4"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Right Section - CFO Testimonial */}
            <div className="w-full max-w-md flex items-center justify-center py-8 lg:py-0">
              <div className="text-center px-4">
                {/* Profile Image */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src="/images/pushkar-cfo.jpeg"
                      alt="Pushkar Chakrawarti - CFO"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, 128px"
                      priority
                    />
                  </div>
                </div>

                {/* Testimonial Quote */}
                <blockquote
                  className="text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed mb-6 mx-auto"
                  style={{
                    fontFamily: "var(--font-inter)",
                    color: "#1a1a2e",
                    lineHeight: "1.7",
                    maxWidth: "500px",
                  }}
                >
                  &quot;Revolutionizing tech education by gamifying complex
                  learning, making it effortless for students to master new
                  technologies.&quot;
                </blockquote>

                {/* CFO Info */}
                <div className="mt-6">
                  <p
                    className="text-base sm:text-lg font-semibold"
                    style={{
                      fontFamily: "var(--font-inter)",
                      color: "#1a1a2e",
                    }}
                  >
                    @pushkarchakrawarti
                  </p>
                  <p
                    className="text-sm sm:text-base mt-1"
                    style={{
                      fontFamily: "var(--font-inter)",
                      color: "#6b7280",
                    }}
                  >
                    Chief Financial Officer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
