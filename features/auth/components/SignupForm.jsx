"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Loader from "@/layout/Loader";
import { usePostHog } from 'posthog-js/react';
import { getOrCreateOnboardingSessionId, recordSignupTimestamp } from "@/lib/analytics/onboardingSession";
import { trackOnboardingFriction } from "@/lib/analytics/friction";
import { getOnboardingRoute } from '@/lib/onboarding/onboarding-route';
import { syncOnboardingFromLocalStorage } from '@/lib/onboarding/sync-localstorage';
import { deriveScheduleFromBrowser } from '@/lib/onboarding/schedule-periods';

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
          router.replace(getOnboardingRoute(profile));
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
        trackSignupConversion(result.user, "email");
        try {
          const profile = await ensureUserProfile(result.user, result.authMode === "new_signup");
          const idToken = await result.user.getIdToken();

          // Flush any pre-auth onboarding data from localStorage (goal, GenAI diagnostic)
          await syncOnboardingFromLocalStorage(idToken);

          if (result.authMode === "new_signup") {
            const isGenAiPreview =
              typeof window !== "undefined" &&
              new URLSearchParams(window.location.search).get("from") === "genai_preview";

            const hasPreview =
              typeof window !== "undefined" &&
              !!localStorage.getItem("ignitio:preview_payload");

            if (isGenAiPreview || hasPreview) {
              router.replace(
                isGenAiPreview
                  ? "/onboarding/role-selection?from=genai_preview"
                  : "/onboarding/role-selection?from=preview"
              );
              return;
            }

            try {
              const derived = deriveScheduleFromBrowser();

              const scheduleRes = await fetch("/api/v2/onboarding/role-schedule", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  role: "student",
                  schedule: {
                    timezone: derived.timezone,
                    windows: [{ period: derived.period, startTime: derived.startTime, endTime: derived.endTime }],
                  },
                }),
              });

              if (!scheduleRes.ok) throw new Error("schedule_failed");

              const activateRes = await fetch("/api/v2/onboarding/activate", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
              });

              if (!activateRes.ok) throw new Error('activate_failed');

              window.location.href =
                localStorage.getItem('ignitio:streak_phase') === 'anticipated'
                  ? '/onboarding/streak'
                  : '/home';
            } catch {
              setActivationError(true);

              setLoading(false);
            }
          } else {
            router.replace(getOnboardingRoute(profile));
          }
        } catch (err) {
          isHandlingAuthActionRef.current = false;
          setError(err.message || "Failed to provision user profile");
          setLoading(false);
        }
      } else {
        isHandlingAuthActionRef.current = false;
        setError(result.error || "Check your email or password.");
        setLoading(false);
      }
    } catch {
      isHandlingAuthActionRef.current = false;
      setError("Something went wrong. Please try again.");
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
        trackSignupConversion(result.user, "google");
        try {
          const profile = await ensureUserProfile(result.user, result.authMode === "new_signup");
          const idToken = await result.user.getIdToken();

          // Flush any pre-auth onboarding data from localStorage (goal, GenAI diagnostic)
          await syncOnboardingFromLocalStorage(idToken);

          if (result.authMode === "new_signup") {
            const isGenAiPreview =
              typeof window !== "undefined" &&
              new URLSearchParams(window.location.search).get("from") === "genai_preview";

            const hasPreview =
              typeof window !== "undefined" &&
              !!localStorage.getItem("ignitio:preview_payload");

            if (isGenAiPreview || hasPreview) {
              router.replace(
                isGenAiPreview
                  ? "/onboarding/role-selection?from=genai_preview"
                  : "/onboarding/role-selection?from=preview"
              );
              return;
            }

            try {
              const derived = deriveScheduleFromBrowser();

              const scheduleRes = await fetch("/api/v2/onboarding/role-schedule", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  role: "student",
                  schedule: {
                    timezone: derived.timezone,
                    windows: [{ period: derived.period, startTime: derived.startTime, endTime: derived.endTime }],
                  },
                }),
              });

              if (!scheduleRes.ok) throw new Error("schedule_failed");

              const activateRes = await fetch("/api/v2/onboarding/activate", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
              });

              if (!activateRes.ok) throw new Error('activate_failed');

              window.location.href =
                localStorage.getItem('ignitio:streak_phase') === 'anticipated'
                  ? '/onboarding/streak'
                  : '/home';
            } catch {
              setLoading(false);
            }
          } else {
            router.replace(getOnboardingRoute(profile));
          }
        } catch (err) {
          isHandlingAuthActionRef.current = false;
          setError(err.message || "Failed to provision user profile");
          setLoading(false);
        }
      } else if (result.error === null) {
        // Cancelled popup
        isHandlingAuthActionRef.current = false;
        setLoading(false);
        return;
      } else {
        isHandlingAuthActionRef.current = false;
        setError(result.error || "Failed to sign up with Google");
        setLoading(false);
      }
    } catch {
      isHandlingAuthActionRef.current = false;
      setError("Something went wrong. Please try again.");
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
           style={{ backgroundColor: "#F0CAA8" }}>
        <div className="w-full max-w-md text-center rounded-3xl p-8 shadow-lg"
             style={{ backgroundColor: "#FFF9EB" }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#1a1a2e" }}>
            Setup hit a snag
          </h2>
          <p className="text-base mb-8" style={{ color: "#6b7280" }}>
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
