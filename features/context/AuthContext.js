// app/context/AuthContext.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    getAdditionalUserInfo,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase/firebase";
import posthog from "posthog-js";
import { scheduleIdleTask } from "@/lib/utils/idleTask";
import { getOrCreateOnboardingSessionId } from "@/lib/analytics/onboardingSession";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearTargetedStorage = () => {
        try {
            const prefixes = [
                "profession", "completedLevels", "completed_levels_", "progress_",
                "assignment_passed_", "quiz_gate_", 
                "video_timer_", "segment_watch_", "segment_intervals_", "ignitio:last_active_roadmap",
                "ignitio:certificates"
            ];

            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && prefixes.some(p => key.startsWith(p))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            const sessionKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith("quiz_gate_") && key.includes("_bypassed_")) {
                    sessionKeysToRemove.push(key);
                }
            }
            sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    };

    const migrateLegacyQuizKeys = () => {
        try {
            const keysToMigrate = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("quiz_gate_completed_")) {
                    keysToMigrate.push(key);
                }
            }
            keysToMigrate.forEach(oldKey => {
                const value = localStorage.getItem(oldKey);
                const suffix = oldKey.substring(20); // remove "quiz_gate_completed_"
                // Grant both 50% and 80% to legacy users so they aren't blocked on levels they already cleared
                localStorage.setItem(`quiz_gate_50_completed_${suffix}`, value);
                localStorage.setItem(`quiz_gate_80_completed_${suffix}`, value);
                localStorage.removeItem(oldKey);
            });
        } catch (e) {
            console.error("Migration error:", e);
        }
    };

    useEffect(() => {
        scheduleIdleTask(() => migrateLegacyQuizKeys(), { timeout: 2000 });

        // Set persistence to LOCAL
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                if (process.env.NODE_ENV === "development") {
                    console.log("Auth persistence set to LOCAL");
                }
            })
            .catch((error) => {
                console.error("Error setting persistence:", error);
            });

        const unsubscribe = onAuthStateChanged(auth, (user) => {

            if (user) {
                const storedUid = localStorage.getItem("ignitio:active_uid");
                if (storedUid && storedUid !== user.uid) {
                    scheduleIdleTask(() => clearTargetedStorage(), { timeout: 5000 });
                    localStorage.setItem("ignitio:active_uid", user.uid);
                } else if (!storedUid) {
                    localStorage.setItem("ignitio:active_uid", user.uid);
                }
                // Identify user in PostHog
                try {
                    const sessionId = getOrCreateOnboardingSessionId();
                    posthog.identify(user.uid, {
                        email: user.email,
                        name: user.displayName,
                        onboarding_session_id: sessionId,
                    });
                    if (sessionId) {
                        try {
                            posthog.people?.set?.({ onboarding_session_id: sessionId });
                        } catch {}
                    }
                } catch (e) {
                    console.error("Posthog identify error:", e);
                }

                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetcher = async (url) => {
        if (!user) return null;
        const token = await user.getIdToken();
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (res.status === 404) return "missing";
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();
        return data.user || "missing";
    };

    const { data: userProfile, error: profileError, mutate: mutateProfile, isValidating: isProfileValidating } = useSWR(
        user ? "/api/v2/user" : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    const isProfileLoading = user && !userProfile && !profileError;

    const normalizeTimingDelay = async (startTimeMs) => {
        const elapsed = Date.now() - startTimeMs;
        const target = 700 + Math.floor(Math.random() * 250); // 700ms - 950ms normalized timing window
        const remaining = target - elapsed;
        if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
        }
    };

    const signup = async (email, password) => {
        const startAttemptTime = Date.now();
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (process.env.NODE_ENV === "development") {
                console.log("Signup successful");
            }

            localStorage.setItem("ignitio:active_uid", result.user.uid);

            return { success: true, user: result.user, authMode: "new_signup" };
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                try {
                    if (process.env.NODE_ENV === "development") {
                        console.info("Signup: Email already in use, attempting fallback login...");
                    }
                    const loginResult = await signInWithEmailAndPassword(auth, email, password);
                    if (process.env.NODE_ENV === "development") {
                        console.log("Fallback login successful");
                    }

                    localStorage.setItem("ignitio:active_uid", loginResult.user.uid);

                    return { success: true, user: loginResult.user, authMode: "existing_login" };
                } catch (loginError) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Fallback login error:", loginError?.code, loginError?.message);
                    }
                    // Anti-enumeration defense: Delay response and return generic message
                    await normalizeTimingDelay(startAttemptTime);
                    return { success: false, error: "Check your email or password." };
                }
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Signup error:", error?.code, error?.message);
            }

            let errorMessage = "Check your email or password.";

            if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later";
            }

            await normalizeTimingDelay(startAttemptTime);
            return { success: false, error: errorMessage };
        }
    };

    const login = async (email, password) => {
        try {

            const result = await signInWithEmailAndPassword(auth, email, password);
            if (process.env.NODE_ENV === "development") {
                console.log("Login successful");
            }
            return { success: true, user: result.user };
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Login error:", error?.code, error?.message);
            }
            let errorMessage = "Check your email or password.";

            if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address";
            } else if (error.code === "auth/user-disabled") {
                errorMessage = "This account has been disabled";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later";
            }

            return { success: false, error: errorMessage };
        }
    };

    const loginWithGoogle = async () => {
        try {
            if (process.env.NODE_ENV === "development") {
                console.log("Attempting Google login");
            }

            // Configure Google provider with custom parameters
            googleProvider.setCustomParameters({
                prompt: "select_account",
            });

            // Use signInWithPopup with proper error handling
            const result = await signInWithPopup(auth, googleProvider);
            if (process.env.NODE_ENV === "development") {
                console.log("Google login successful");
            }

            const additionalUserInfo = getAdditionalUserInfo(result);
            const authMode = additionalUserInfo?.isNewUser ? "new_signup" : "existing_login";

            if (authMode === "new_signup") {
                localStorage.setItem("ignitio:active_uid", result.user.uid);
            }

            return { success: true, user: result.user, authMode };
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Google login error:", error?.code, error?.message);
            }
            let errorMessage = "Failed to sign in with Google";

            // Handle the case where popup was cancelled by another popup request
            if (error.code === "auth/cancelled-popup-request") {
                if (process.env.NODE_ENV === "development") {
                    console.log("Popup request was cancelled by a new request");
                }
                // Don't show error for cancelled requests, just return null
                return { success: false, error: null };
            } else if (error.code === "auth/popup-closed-by-user") {
                errorMessage = "Sign-in cancelled";
            } else if (error.code === "auth/popup-blocked") {
                errorMessage = "Popup blocked. Please allow popups for this site";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection";
            } else if (error.code === "auth/unauthorized-domain") {
                errorMessage = "This domain is not authorized for OAuth operations";
            } else if (error.code === "auth/internal-error") {
                errorMessage = "Authentication error. Please try again";
            }

            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            if (process.env.NODE_ENV === "development") {
                console.log("Attempting logout");
            }
            await signOut(auth);
            // Reset PostHog identity on explicit logout only — not on every anonymous page load
            try { posthog.reset(); } catch (_) { }
            if (process.env.NODE_ENV === "development") {
                console.log("Logout successful");
            }
            return { success: true };
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Logout error:", error?.message || "unknown error");
            }
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        userProfile,
        mutateProfile,
        isProfileLoading,
        profileError,
        signup,
        login,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
