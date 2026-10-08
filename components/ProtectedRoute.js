// components/ProtectedRoute.js
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/context/AuthContext";
import { getOnboardingRoute, isOnboardingComplete } from "@/lib/onboarding/onboarding-route";
import Loader from "@/layout/Loader";

// Routes protected for users with completed onboarding.
const PROTECTED_PREFIXES = ["/home/profile", "/home/roadmaps", "/home/premium"];
const PROTECTED_EXACT = ["/home"];

// Routes belonging to core onboarding (role selection).
const ONBOARDING_PREFIX = "/onboarding";

// GenAI activation routes — accessible to BOTH incomplete AND complete users.
const GENAI_ACTIVATION_PREFIXES = [
    "/onboarding/diagnostic",
    "/onboarding/results",
    "/onboarding/paywall",
    "/onboarding/activation",
];

function isProtectedRoute(pathname) {
    if (PROTECTED_EXACT.includes(pathname)) return true;
    return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isOnboardingRoute(pathname) {
    return pathname === ONBOARDING_PREFIX || pathname.startsWith(`${ONBOARDING_PREFIX}/`);
}

function isGenAiActivationRoute(pathname) {
    return GENAI_ACTIVATION_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function ProtectedRoute({ children }) {
    const { user, loading, userProfile, isProfileLoading, profileError } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Step 1: Redirect unauthenticated users
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth/login");
        }
    }, [loading, user, router]);

    const profileObj = userProfile === "missing" ? null : userProfile;

    // Step 2: Enforce routing rules based on cached profile
    useEffect(() => {
        if (loading || !user || isProfileLoading || profileError) return;

        // Completed-onboarding route enforcement
        if (isProtectedRoute(pathname)) {
            if (!profileObj) {
                router.replace("/onboarding");
                return;
            }
            if (!isOnboardingComplete(profileObj)) {
                router.replace(getOnboardingRoute(profileObj));
                return;
            }
        }

        // GenAI activation routes skip onboarding checks
        if (isGenAiActivationRoute(pathname)) return;

        // Canonical onboarding-step enforcement
        if (isOnboardingRoute(pathname)) {
            if (!profileObj) {
                const entryStep = "/onboarding/role-selection";
                if (pathname !== entryStep) {
                    router.replace(entryStep);
                }
                return;
            }
            if (isOnboardingComplete(profileObj)) {
                router.replace("/home");
                return;
            }
            const canonicalStep = getOnboardingRoute(profileObj);
            if (pathname !== canonicalStep) {
                router.replace(canonicalStep);
            }
        }
    }, [loading, user, pathname, router, profileObj, isProfileLoading, profileError]);

    if (loading || (!user && !isGenAiActivationRoute(pathname))) return <Loader />;
    if (user && isProfileLoading) return <Loader />;

    if (profileError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-600">Failed to load profile. Please refresh.</p>
            </div>
        );
    }

    if (isProtectedRoute(pathname)) {
        if (!profileObj || !isOnboardingComplete(profileObj)) return null;
    }

    if (isGenAiActivationRoute(pathname)) return <>{children}</>;

    if (isOnboardingRoute(pathname)) {
        if (profileObj && isOnboardingComplete(profileObj)) return null;
        if (!profileObj) {
            if (pathname !== "/onboarding/role-selection") return null;
        } else {
            const canonicalStep = getOnboardingRoute(profileObj);
            if (pathname !== canonicalStep) return null;
        }
    }

    return <>{children}</>;
}