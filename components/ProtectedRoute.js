// components/ProtectedRoute.js
"use client";

import { useEffect, useState } from "react";
import {
    usePathname,
    useRouter,
} from "next/navigation";

import { useAuth } from "@/features/context/AuthContext";
import {
    getOnboardingRoute,
    isOnboardingComplete,
} from "@/lib/onboarding/onboarding-route";
import Loader from "@/layout/Loader";

// Routes protected for users with completed onboarding.
const PROTECTED_PREFIXES = [
    "/home/profile",
    "/home/roadmaps",
    "/home/premium",
];

const PROTECTED_EXACT = ["/home"];

// Routes belonging to onboarding.
const ONBOARDING_PREFIX = "/home/onboarding";

function isProtectedRoute(pathname) {
    if (PROTECTED_EXACT.includes(pathname)) {
        return true;
    }

    return PROTECTED_PREFIXES.some(
        (prefix) =>
            pathname === prefix ||
            pathname.startsWith(`${prefix}/`),
    );
}

function isOnboardingRoute(pathname) {
    return (
        pathname === ONBOARDING_PREFIX ||
        pathname.startsWith(
            `${ONBOARDING_PREFIX}/`,
        )
    );
}

export default function ProtectedRoute({
    children,
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    /*
     * Stores the profile response together with the exact
     * authenticated user and pathname for which it was loaded.
     *
     * profile:
     * - object    = profile loaded
     * - "missing" = API returned 404
     * - null      = request failed or unresolved
     */
    const [profileResult, setProfileResult] =
        useState({
            key: null,
            profile: null,
            error: false,
        });

    const requestKey = user?.uid
        ? `${user.uid}:${pathname}`
        : null;

    // Step 1: redirect unauthenticated users.
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth/login");
        }
    }, [loading, user, router]);

    /*
     * Step 2: fetch the persisted profile.
     *
     * We do not synchronously reset React state here.
     * A changed requestKey automatically makes the existing
     * profile result stale, so rendering shows Loader until
     * the matching request completes.
     */
    useEffect(() => {
        if (loading || !user || !requestKey) {
            return;
        }

        const abortController =
            new AbortController();

        let active = true;

        const loadProfile = async () => {
            try {
                const idToken =
                    await user.getIdToken();

                if (!active) {
                    return;
                }

                const response = await fetch(
                    "/api/v2/user",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${idToken}`,
                        },
                        cache: "no-store",
                        signal:
                            abortController.signal,
                    },
                );

                if (!active) {
                    return;
                }

                if (response.status === 404) {
                    setProfileResult({
                        key: requestKey,
                        profile: "missing",
                        error: false,
                    });
                    return;
                }

                if (!response.ok) {
                    setProfileResult({
                        key: requestKey,
                        profile: null,
                        error: true,
                    });
                    return;
                }

                const data =
                    await response.json();

                if (!active) {
                    return;
                }

                setProfileResult({
                    key: requestKey,
                    profile:
                        data.user || "missing",
                    error: false,
                });
            } catch (error) {
                if (
                    !active ||
                    error?.name === "AbortError"
                ) {
                    return;
                }

                setProfileResult({
                    key: requestKey,
                    profile: null,
                    error: true,
                });
            }
        };

        loadProfile();

        return () => {
            active = false;
            abortController.abort();
        };
    }, [
        loading,
        user,
        requestKey,
    ]);

    const profileResolvedForCurrentRequest =
        Boolean(requestKey) &&
        profileResult.key === requestKey;

    const profileObj =
        profileResult.profile === "missing"
            ? null
            : profileResult.profile;

    /*
     * Step 3: enforce canonical routing only after the
     * profile response belongs to the current user/path.
     */
    useEffect(() => {
        if (
            loading ||
            !user ||
            !profileResolvedForCurrentRequest ||
            profileResult.error
        ) {
            return;
        }

        // Completed-onboarding route enforcement.
        if (isProtectedRoute(pathname)) {
            if (!profileObj) {
                router.replace(
                    "/home/onboarding",
                );
                return;
            }

            if (
                !isOnboardingComplete(
                    profileObj,
                )
            ) {
                router.replace(
                    getOnboardingRoute(
                        profileObj,
                    ),
                );
                return;
            }
        }

        // Canonical onboarding-step enforcement.
        if (isOnboardingRoute(pathname)) {
            if (!profileObj) {
                /*
                 * The onboarding entry and diagnostic pages
                 * are accessible without a profile to allow
                 * new users to start onboarding.
                 */
                const isAllowedWithoutProfile =
                    pathname === ONBOARDING_PREFIX ||
                    pathname === `${ONBOARDING_PREFIX}/diagnostic`;

                if (!isAllowedWithoutProfile) {
                    router.replace(
                        ONBOARDING_PREFIX,
                    );
                }

                return;
            }

            if (
                isOnboardingComplete(
                    profileObj,
                )
            ) {
                router.replace("/home");
                return;
            }

            const canonicalStep =
                getOnboardingRoute(
                    profileObj,
                );

            const isDiagnosticGateway =
                pathname === ONBOARDING_PREFIX &&
                canonicalStep === `${ONBOARDING_PREFIX}/diagnostic`;

            if (pathname !== canonicalStep && !isDiagnosticGateway) {
                router.replace(
                    canonicalStep,
                );
            }
        }
    }, [
        loading,
        user,
        pathname,
        router,
        profileObj,
        profileResult.error,
        profileResolvedForCurrentRequest,
    ]);

    // Firebase authentication is initializing.
    if (loading) {
        return <Loader />;
    }

    // The unauthenticated redirect is running.
    if (!user) {
        return null;
    }

    /*
     * Never render content using a profile response
     * belonging to another user or pathname.
     */
    if (
        !profileResolvedForCurrentRequest
    ) {
        return <Loader />;
    }

    // Current profile request failed.
    if (profileResult.error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-600">
                    Failed to load profile. Please
                    refresh.
                </p>
            </div>
        );
    }

    // Suppress protected content while redirecting.
    if (isProtectedRoute(pathname)) {
        if (
            !profileObj ||
            !isOnboardingComplete(profileObj)
        ) {
            return null;
        }
    }

    // Suppress incorrect onboarding content.
    if (isOnboardingRoute(pathname)) {
        if (
            profileObj &&
            isOnboardingComplete(profileObj)
        ) {
            return null;
        }

        if (!profileObj) {
            const isAllowedWithoutProfile =
                pathname === ONBOARDING_PREFIX ||
                pathname === `${ONBOARDING_PREFIX}/diagnostic`;

            if (!isAllowedWithoutProfile) {
                return null;
            }
        } else {
            const canonicalStep =
                getOnboardingRoute(
                    profileObj,
                );

            const isDiagnosticGateway =
                pathname === ONBOARDING_PREFIX &&
                canonicalStep === `${ONBOARDING_PREFIX}/diagnostic`;

            if (
                pathname !== canonicalStep &&
                !isDiagnosticGateway
            ) {
                return null;
            }
        }
    }

    return <>{children}</>;
}